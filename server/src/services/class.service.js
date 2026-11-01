const {
  User,
  Class,
  Meeting,
  Task,
  Note,
  Material,
  Attendance,
  TaskSubmission,
  AssessmentResult,
  ClassUser,
  CourseBlueprint,
  BlueprintMeeting,
  BlueprintMaterial,
  BlueprintTask,
  sequelize,
} = require("../models");

const ROLES = require("../constants/roles");
const { logAudit } = require("../helpers");
const mentorSubstitutionService = require("./mentorSubstitution.service");

class ClassService {
  static async getAll(currentUser) {
    /**
     * Owner & Admin
     */
    if ([ROLES.OWNER, ROLES.ADMIN].includes(currentUser.role)) {
      return Class.findAll({
        order: [["id", "ASC"]],
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "email"],
          },
          {
            model: User,
            as: "mentor",
            attributes: ["id", "name", "email"],
          },
          {
            model: User,
            as: "mentees",
            attributes: ["id", "name", "email"],
            through: { attributes: [], where: { roleInClass: "Mentee" } },
          },
          {
            model: Meeting,
            as: "meetings",
          },
          {
            model: Note,
            as: "notes",
          },
          {
            model: Task,
            as: "tasks",
          },
          {
            model: Material,
            as: "materials",
          },
        ],
      });
    }

    /**
     * Mentor
     */
    if (currentUser.role === ROLES.MENTOR) {
      const scope = await mentorSubstitutionService.getScope(currentUser);

      return Class.findAll({
        order: [["id", "ASC"]],
        where: {
          id: scope.classIds,
        },
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "email"],
          },
          {
            model: User,
            as: "mentor",
            attributes: ["id", "name", "email"],
          },
          {
            model: User,
            as: "mentees",
            attributes: ["id", "name", "email"],
            through: { attributes: [], where: { roleInClass: "Mentee" } },
          },
          {
            model: Meeting,
            as: "meetings",
          },
          {
            model: Note,
            as: "notes",
          },
          {
            model: Task,
            as: "tasks",
          },
          {
            model: Material,
            as: "materials",
          },
        ],
      });
    }

    /**
     * Mentee
     */
    if (currentUser.role === ROLES.MENTEE) {
      return Class.findAll({
        order: [["id", "ASC"]],
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "email"],
          },
          {
            model: User,
            as: "mentor",
            attributes: ["id", "name", "email"],
          },
          {
            model: User,
            as: "mentees",
            attributes: [],
            through: { attributes: [], where: { roleInClass: "Mentee" } },
            where: {
              id: currentUser.id,
            },
          },
          {
            model: Meeting,
            as: "meetings",
          },
          {
            model: Note,
            as: "notes",
          },
          {
            model: Task,
            as: "tasks",
          },
          {
            model: Material,
            as: "materials",
          },
        ],
      });
    }

    if (currentUser.role === ROLES.REVIEWER) {
      return Class.findAll({
        order: [["id", "ASC"]],
        include: [
          {
            model: User,
            as: "reviewers",
            attributes: [],
            through: { attributes: [], where: { roleInClass: "Reviewer" } },
            where: { id: currentUser.id },
          },
          { model: User, as: "creator", attributes: ["id", "name", "email"] },
          { model: User, as: "mentor", attributes: ["id", "name", "email"] },
          { model: Meeting, as: "meetings" },
          { model: Task, as: "tasks" },
        ],
      });
    }

    throw new Error("Unauthorized");
  }

  static async findById(id, currentUser) {
    const cls = await Class.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "mentor",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "mentees",
          attributes: ["id", "name", "email", "avatarUrl"],
          through: {
            attributes: ["progressPercentage", "status", "joinedAt"],
            where: { roleInClass: "Mentee" },
          },
        },
        {
          model: Meeting,
          as: "meetings",
        },
        {
          model: Note,
          as: "notes",
        },
        {
          model: Task,
          as: "tasks",
        },
        {
          model: Material,
          as: "materials",
        },
      ],
    });

    if (!cls) return null;

    await this.assertCanAccess(id, currentUser);

    const menteeStats = await ClassService.computeMenteeStats(
      id,
      (cls.mentees || []).map((m) => m.id),
    );

    const menteesWithStats = (cls.mentees || []).map((mentee) => ({
      ...mentee.toJSON(),
      stats: menteeStats[mentee.id] || {
        attendance: 0,
        taskCompletion: 0,
        avgScore: 0,
        progress: Number(mentee.ClassUser?.progressPercentage || 0),
      },
    }));

    const plain = cls.toJSON();
    plain.mentees = menteesWithStats;

    return plain;
  }

  static async assertCanAccess(ClassId, currentUser) {
    if (currentUser?.role === ROLES.MENTOR) {
      await mentorSubstitutionService.assertCanAccess({ ClassId, currentUser });
      return;
    }

    if (currentUser?.role !== ROLES.REVIEWER) return;

    const assignment = await ClassUser.findOne({
      where: { ClassId, UserId: currentUser.id, roleInClass: "Reviewer" },
    });

    if (!assignment) {
      throw new Error("Permission denied");
    }
  }

  /**
   * Computes per-mentee Attendance %, Task Completion %, Avg Score, and
   * Progress % for a given class. Powers the Class Members table and the
   * Mentee Dashboard's per-class breakdown.
   */
  static async computeMenteeStats(ClassId, menteeIds = []) {
    if (menteeIds.length === 0) return {};

    const [meetings, tasks, attendances, submissions] = await Promise.all([
      Meeting.findAll({ where: { ClassId }, attributes: ["id"] }),
      Task.findAll({ where: { ClassId }, attributes: ["id"] }),
      Attendance.findAll({
        include: [{ model: Meeting, attributes: [], where: { ClassId } }],
        where: { UserId: menteeIds },
      }),
      TaskSubmission.findAll({
        include: [
          { model: Task, attributes: [], where: { ClassId } },
          { model: AssessmentResult },
        ],
        where: { UserId: menteeIds },
      }),
    ]);

    const totalMeetings = meetings.length;
    const totalTasks = tasks.length;

    const stats = {};

    menteeIds.forEach((menteeId) => {
      const menteeAttendances = attendances.filter((a) => a.UserId === menteeId);
      const presentLike = menteeAttendances.filter((a) =>
        ["Present", "Late"].includes(a.status),
      ).length;
      const attendance =
        totalMeetings > 0 ? Number(((presentLike / totalMeetings) * 100).toFixed(1)) : 0;

      const menteeSubmissions = submissions.filter((s) => s.UserId === menteeId);
      const taskCompletion =
        totalTasks > 0
          ? Number(((menteeSubmissions.length / totalTasks) * 100).toFixed(1))
          : 0;

      const scores = menteeSubmissions
        .map((s) => s.AssessmentResult?.finalScore)
        .filter((s) => s !== undefined && s !== null)
        .map(Number);
      const avgScore = scores.length
        ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
        : 0;

      // Overall progress blends attendance + task completion evenly.
      const progress = Number(((attendance + taskCompletion) / 2).toFixed(1));

      stats[menteeId] = { attendance, taskCompletion, avgScore, progress };
    });

    return stats;
  }

  static async create(data, currentUser, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const cls = await Class.create({
      ...data,
      createdBy: currentUser.id,
    });

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "Class",
      resourceId: cls.id,
      resourceDetail: cls.name,
      meta,
    });

    return cls;
  }

  static generateMeetingDates(startDate, count, meetingDays) {
    const days = [...new Set(meetingDays.map(Number))].sort((a, b) => a - b);

    if (!days.length || days.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) {
      throw new Error("meetingDays must contain weekdays from 0 to 6");
    }

    const cursor = new Date(`${startDate}T00:00:00.000Z`);
    if (Number.isNaN(cursor.getTime())) throw new Error("Invalid startDate");

    const dates = [];
    while (dates.length < count) {
      if (days.includes(cursor.getUTCDay())) dates.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return dates;
  }

  static finishHour(startHour, durationMinutes) {
    const [hours, minutes] = String(startHour || "00:00").split(":").map(Number);
    const total = ((hours * 60) + minutes + Number(durationMinutes || 0)) % (24 * 60);
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}:00`;
  }

  static async createFromBlueprint(data, currentUser, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const {
      CourseBlueprintId,
      meetingDays,
      startHour,
      finishHour,
      ...classData
    } = data;

    const blueprint = await CourseBlueprint.findByPk(CourseBlueprintId, {
      include: [{
        model: BlueprintMeeting,
        as: "meetings",
        include: [
          { model: BlueprintMaterial, as: "materials" },
          { model: BlueprintTask, as: "tasks" },
        ],
      }],
      order: [[{ model: BlueprintMeeting, as: "meetings" }, "sequence", "ASC"]],
    });

    if (!blueprint) throw new Error("Course blueprint not found");
    if (blueprint.status !== "Published") throw new Error("Course blueprint must be published");
    if (!Array.isArray(meetingDays)) throw new Error("meetingDays is required");

    const blueprintMeetings = blueprint.meetings || [];
    const meetingDates = this.generateMeetingDates(classData.startDate, blueprintMeetings.length, meetingDays);

    const result = await sequelize.transaction(async (transaction) => {
      const batch = await Class.create({
        ...classData,
        CourseBlueprintId,
        scheduleDays: meetingDays,
        startHour,
        finishHour,
        createdBy: currentUser.id,
      }, { transaction });

      for (const [index, blueprintMeeting] of blueprintMeetings.entries()) {
        const meetingDate = meetingDates[index];
        const generatedMeeting = await Meeting.create({
          ClassId: batch.id,
          BlueprintMeetingId: blueprintMeeting.id,
          meetingNumber: blueprintMeeting.sequence,
          name: blueprintMeeting.title,
          description: blueprintMeeting.description,
          meetingDate,
          startHour,
          finishHour: finishHour || this.finishHour(startHour, blueprintMeeting.durationMinutes),
          mode: classData.deliveryMode,
          location: classData.location,
          meetingUrl: classData.meetingUrl,
          createdBy: currentUser.id,
        }, { transaction });

        for (const material of blueprintMeeting.materials || []) {
          await Material.create({
            ClassId: batch.id,
            MeetingId: generatedMeeting.id,
            BlueprintMaterialId: material.id,
            name: material.name,
            description: material.description,
            type: material.type,
            fileUrl: material.fileUrl,
            uploadedBy: currentUser.id,
          }, { transaction });
        }

        for (const task of blueprintMeeting.tasks || []) {
          const dueDate = new Date(meetingDate);
          dueDate.setDate(dueDate.getDate() + Number(task.dueOffsetDays || 0));
          await Task.create({
            ClassId: batch.id,
            MeetingId: generatedMeeting.id,
            BlueprintTaskId: task.id,
            name: task.name,
            description: task.description,
            dueDate,
            maxScore: task.maxScore,
            status: task.status,
            fileUrl: task.fileUrl,
            createdBy: currentUser.id,
          }, { transaction });
        }
      }

      return batch;
    });

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "Class",
      resourceId: result.id,
      resourceDetail: `${result.name} from blueprint ${blueprint.code}`,
      meta,
    });

    return result;
  }

  static async update(id, data, currentUser, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const cls = await Class.findByPk(id);

    if (!cls) {
      throw new Error("Class not found");
    }

    await cls.update(data);

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "Class",
      resourceId: cls.id,
      resourceDetail: cls.name,
      meta,
    });

    return cls;
  }

  static async delete(id, currentUser, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const cls = await Class.findByPk(id);

    if (!cls) {
      throw new Error("Class not found");
    }

    await Meeting.destroy({
      where: { ClassId: id },
    });

    await Task.destroy({
      where: { ClassId: id },
    });

    await Note.destroy({
      where: { ClassId: id },
    });

    await Material.destroy({
      where: { ClassId: id },
    });

    await logAudit({
      user: currentUser,
      action: "DELETE",
      resource: "Class",
      resourceId: cls.id,
      resourceDetail: cls.name,
      meta,
    });

    return cls.destroy();
  }
}

module.exports = ClassService;
