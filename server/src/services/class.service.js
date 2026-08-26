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
} = require("../models");

const ROLES = require("../constants/roles");
const { logAudit } = require("../helpers");

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
      return Class.findAll({
        order: [["id", "ASC"]],
        where: {
          MentorId: currentUser.id,
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

    throw new Error("Unauthorized");
  }

  static async findById(id) {
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
