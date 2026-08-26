const { Op } = require("sequelize");
const {
  User,
  Class,
  Meeting,
  Task,
  TaskSubmission,
  AssessmentResult,
  Attendance,
  ClassUser,
} = require("../models");

const ROLES = require("../constants/roles");

const pct = (part, total) => (total > 0 ? Number(((part / total) * 100).toFixed(1)) : 0);

const round1 = (n) => Number((n || 0).toFixed(1));

class ReportsService {
  /**
   * Single aggregated payload powering the Reports dashboard.
   * Only Owner/Admin should be allowed to call this (enforced at route level).
   */
  static async getDashboard(filters = {}) {
    const { startDate, endDate, ClassId, MentorId, status } = filters;

    const dateWhere =
      startDate && endDate
        ? { [Op.between]: [new Date(startDate), new Date(endDate)] }
        : undefined;

    const classWhere = {};
    if (ClassId) classWhere.id = ClassId;
    if (MentorId) classWhere.MentorId = MentorId;
    if (status && status !== "All") classWhere.status = status;

    const classes = await Class.findAll({
      where: classWhere,
      include: [
        { model: User, as: "mentor", attributes: ["id", "name"] },
        {
          model: User,
          as: "mentees",
          attributes: ["id", "name", "email"],
          through: {
            attributes: ["progressPercentage", "status"],
            where: { roleInClass: "Mentee" },
          },
        },
        { model: Meeting, as: "meetings" },
        { model: Task, as: "tasks" },
      ],
    });

    const classIds = classes.map((c) => c.id);

    const [users, submissions, attendances] = await Promise.all([
      User.findAll({ attributes: ["id", "name", "role", "createdAt"] }),
      TaskSubmission.findAll({
        include: [
          { model: Task, where: classIds.length ? { ClassId: classIds } : undefined },
          { model: User, attributes: ["id", "name"] },
          { model: AssessmentResult },
        ],
      }),
      Attendance.findAll({
        include: [
          {
            model: Meeting,
            where: classIds.length ? { ClassId: classIds } : undefined,
          },
          { model: User, attributes: ["id", "name"] },
        ],
        where: dateWhere ? { createdAt: dateWhere } : undefined,
      }),
    ]);

    /* ---------------- Top Stat Cards ---------------- */

    const totalUsers = users.length;
    const activeClasses = classes.filter((c) => c.status === "Active").length;
    const totalMeetings = classes.reduce((sum, c) => sum + (c.meetings?.length || 0), 0);

    const submittedCount = submissions.length;
    const totalTaskSlots = classes.reduce(
      (sum, c) => sum + (c.tasks?.length || 0) * (c.mentees?.length || 0),
      0,
    );
    const taskCompletionRate = pct(submittedCount, totalTaskSlots);

    const presentLike = attendances.filter((a) =>
      ["Present", "Late"].includes(a.status),
    ).length;
    const avgAttendance = pct(presentLike, attendances.length);

    const scoredResults = submissions
      .map((s) => s.AssessmentResult?.finalScore)
      .filter((s) => s !== undefined && s !== null)
      .map(Number);

    const avgAssessmentScore = round1(
      scoredResults.reduce((a, b) => a + b, 0) / (scoredResults.length || 1),
    );

    const activeMentors = new Set(classes.map((c) => c.MentorId)).size;

    const stats = {
      totalUsers,
      activeClasses,
      totalMeetings,
      taskCompletionRate,
      avgAttendance,
      avgAssessmentScore,
      activeMentors,
    };

    /* ---------------- Class Performance ---------------- */

    const classPerformance = classes.map((c) => {
      const classAttendances = attendances.filter(
        (a) => a.Meeting?.ClassId === c.id,
      );
      const classAttendanceRate = pct(
        classAttendances.filter((a) => ["Present", "Late"].includes(a.status)).length,
        classAttendances.length,
      );

      const classTasks = c.tasks || [];
      const classSubmissions = submissions.filter((s) =>
        classTasks.some((t) => t.id === s.TaskId),
      );
      const classTaskSlots = classTasks.length * (c.mentees?.length || 0);
      const classTaskRate = pct(classSubmissions.length, classTaskSlots);

      const classScores = classSubmissions
        .map((s) => s.AssessmentResult?.finalScore)
        .filter((s) => s !== undefined && s !== null)
        .map(Number);
      const classAvgScore = round1(
        classScores.reduce((a, b) => a + b, 0) / (classScores.length || 1),
      );

      const progress =
        (c.mentees || []).reduce(
          (sum, m) => sum + Number(m.ClassUser?.progressPercentage || 0),
          0,
        ) / ((c.mentees || []).length || 1);

      return {
        id: c.id,
        name: c.name,
        mentees: c.mentees?.length || 0,
        attendance: classAttendanceRate,
        tasks: classTaskRate,
        avgScore: classAvgScore,
        progress: round1(progress),
      };
    });

    /* ---------------- Attendance Overview ---------------- */

    const attendanceOverview = {
      present: attendances.filter((a) => a.status === "Present").length,
      late: attendances.filter((a) => a.status === "Late").length,
      absent: attendances.filter((a) => a.status === "Absent").length,
      excused: attendances.filter((a) => a.status === "Excused").length,
      total: attendances.length,
      avgAttendance,
    };

    const classesWithLowestAttendance = [...classPerformance]
      .sort((a, b) => a.attendance - b.attendance)
      .slice(0, 5)
      .map((c) => ({ id: c.id, name: c.name, attendance: c.attendance }));

    /* ---------------- Task & Assessment Summary ---------------- */

    const taskStatistics = {
      total: totalTaskSlots,
      submitted: submissions.length,
      pending: submissions.filter((s) => s.status === "Submitted").length,
      reviewed: submissions.filter((s) => s.status === "Reviewed").length,
      overdue: submissions.filter(
        (s) => s.Task?.dueDate && new Date(s.submittedAt) > new Date(s.Task.dueDate),
      ).length,
    };

    const assessmentOverview = {
      averageScore: avgAssessmentScore,
      highestScore: scoredResults.length ? Math.max(...scoredResults) : 0,
      lowestScore: scoredResults.length ? Math.min(...scoredResults) : 0,
      passRate: pct(scoredResults.filter((s) => s >= 70).length, scoredResults.length),
    };

    /* ---------------- Score Distribution ---------------- */

    const bands = [
      { label: "90 - 100", min: 90, max: 100 },
      { label: "80 - 89", min: 80, max: 89 },
      { label: "70 - 79", min: 70, max: 79 },
      { label: "60 - 69", min: 60, max: 69 },
      { label: "< 60", min: 0, max: 59 },
    ];

    const scoreDistribution = bands.map((b) => {
      const count = scoredResults.filter((s) => s >= b.min && s <= b.max).length;
      return {
        range: b.label,
        count,
        percentage: pct(count, scoredResults.length),
      };
    });

    /* ---------------- Mentor Performance ---------------- */

    const mentorMap = new Map();

    classes.forEach((c) => {
      if (!c.MentorId) return;

      if (!mentorMap.has(c.MentorId)) {
        mentorMap.set(c.MentorId, {
          id: c.MentorId,
          name: c.mentor?.name || "Unknown",
          classes: 0,
          meetings: 0,
          tasks: 0,
          attendanceSum: 0,
          attendanceCount: 0,
        });
      }

      const entry = mentorMap.get(c.MentorId);
      entry.classes += 1;
      entry.meetings += c.meetings?.length || 0;
      entry.tasks += c.tasks?.length || 0;

      const classAttendances = attendances.filter((a) => a.Meeting?.ClassId === c.id);
      entry.attendanceSum += classAttendances.filter((a) =>
        ["Present", "Late"].includes(a.status),
      ).length;
      entry.attendanceCount += classAttendances.length;
    });

    const mentorPerformance = [...mentorMap.values()].map((m) => {
      const attendanceRate = pct(m.attendanceSum, m.attendanceCount);
      const activityLevel =
        attendanceRate >= 85 ? "High" : attendanceRate >= 70 ? "Medium" : "Low";

      return {
        id: m.id,
        name: m.name,
        classes: m.classes,
        meetings: m.meetings,
        tasks: m.tasks,
        attendance: attendanceRate,
        activityLevel,
      };
    });

    /* ---------------- Mentee Progress Overview ---------------- */

    const menteeScores = new Map();

    classes.forEach((c) => {
      (c.mentees || []).forEach((m) => {
        const classAttendances = attendances.filter(
          (a) => a.Meeting?.ClassId === c.id && a.UserId === m.id,
        );
        const attendanceRate = pct(
          classAttendances.filter((a) => ["Present", "Late"].includes(a.status)).length,
          classAttendances.length,
        );

        const menteeSubmissions = submissions.filter(
          (s) => s.UserId === m.id && (c.tasks || []).some((t) => t.id === s.TaskId),
        );
        const taskRate = pct(menteeSubmissions.length, c.tasks?.length || 0);

        const menteeScoreValues = menteeSubmissions
          .map((s) => s.AssessmentResult?.finalScore)
          .filter((s) => s !== undefined && s !== null)
          .map(Number);
        const avgScore = round1(
          menteeScoreValues.reduce((a, b) => a + b, 0) / (menteeScoreValues.length || 1),
        );

        menteeScores.set(m.id, {
          id: m.id,
          name: m.name,
          class: c.name,
          attendance: attendanceRate,
          tasks: taskRate,
          score: avgScore,
        });
      });
    });

    const menteeList = [...menteeScores.values()].map((m) => {
      let statusLabel = "On Track";
      if (m.score >= 85) statusLabel = "Excellent";
      else if (m.score < 50) statusLabel = "At Risk";
      else if (m.score < 70) statusLabel = "Needs Help";

      return { ...m, status: statusLabel };
    });

    const menteeProgressOverview = {
      total: menteeList.length,
      excellent: menteeList.filter((m) => m.status === "Excellent").length,
      onTrack: menteeList.filter((m) => m.status === "On Track").length,
      needsHelp: menteeList.filter((m) => m.status === "Needs Help").length,
      atRisk: menteeList.filter((m) => m.status === "At Risk").length,
    };

    const menteesNeedingAttention = menteeList
      .filter((m) => ["At Risk", "Needs Help"].includes(m.status))
      .sort((a, b) => a.score - b.score)
      .slice(0, 10);

    /* ---------------- User Growth (last 6 months) ---------------- */

    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleString("en-US", { month: "short" }), year: d.getFullYear(), month: d.getMonth() });
    }

    const userGrowth = months.map(({ label, year, month }) => {
      const cutoff = new Date(year, month + 1, 1);

      const usersSoFar = users.filter((u) => new Date(u.createdAt) < cutoff);

      return {
        month: label,
        mentees: usersSoFar.filter((u) => u.role === ROLES.MENTEE).length,
        mentors: usersSoFar.filter((u) => u.role === ROLES.MENTOR).length,
        activeUsers: usersSoFar.length,
      };
    });

    /* ---------------- Needs Attention Alerts ---------------- */

    const needsAttentionAlerts = [];

    const lowAttendanceClasses = classPerformance.filter((c) => c.attendance < 70);
    if (lowAttendanceClasses.length > 0) {
      needsAttentionAlerts.push({
        type: "warning",
        message: `${lowAttendanceClasses.length} classes have attendance below 70%`,
        detail: "Please review and take action.",
      });
    }

    const pendingOverThreshold = submissions.filter((s) => s.status === "Submitted");
    if (pendingOverThreshold.length > 0) {
      needsAttentionAlerts.push({
        type: "warning",
        message: `${pendingOverThreshold.length} mentees have pending tasks`,
        detail: "Follow up with mentees.",
      });
    }

    return {
      stats,
      classPerformance,
      attendanceOverview,
      classesWithLowestAttendance,
      taskStatistics,
      assessmentOverview,
      scoreDistribution,
      mentorPerformance,
      menteeProgressOverview,
      menteesNeedingAttention,
      userGrowth,
      needsAttentionAlerts,
    };
  }
}

module.exports = ReportsService;
