const { Task, Meeting, Class, User } = require("../models");
const ROLES = require("../constants/roles");
const { logAudit, notifyUsers } = require("../helpers");

class TaskService {
  static async findAllByMeeting(MeetingId) {
    return Task.findAll({
      where: { MeetingId },
      include: [
        Meeting,
        Class,
        {
          model: User,
          as: "creator",
        },
      ],
    });
  }

  static async getAll(currentUser) {
    /**
     * Owner & Admin
     */
    if ([ROLES.OWNER, ROLES.ADMIN].includes(currentUser.role)) {
      return Task.findAll({
        include: [
          Meeting,
          Class,
          {
            model: User,
            as: "creator",
          },
        ],
      });
    }

    /**
     * Mentor
     */
    if (currentUser.role === ROLES.MENTOR) {
      return Task.findAll({
        include: [
          Meeting,
          {
            model: Class,
            where: {
              MentorId: currentUser.id,
            },
          },
          {
            model: User,
            as: "creator",
          },
        ],
      });
    }

    /**
     * Mentee
     */
    if (currentUser.role === ROLES.MENTEE) {
      return Task.findAll({
        include: [
          Meeting,
          {
            model: Class,
            required: true,
            include: [
              {
                model: User,
                as: "mentees",
                attributes: [],
                through: {
                  attributes: [],
                  where: { roleInClass: "Mentee" },
                },
                where: {
                  id: currentUser.id,
                },
              },
            ],
          },
          {
            model: User,
            as: "creator",
          },
        ],
      });
    }

    throw new Error("Unauthorized");
  }

  static async findById(id) {
    return Task.findByPk(id, {
      include: [
        Meeting,
        Class,
        {
          model: User,
          as: "creator",
        },
      ],
    });
  }

  static async create(currentUser, meetingId, data, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER, ROLES.MENTOR].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const meeting = await Meeting.findByPk(meetingId);

    if (!meeting) {
      throw new Error("Meeting not found");
    }

    const task = await Task.create({
      ...data,
      MeetingId: Number(meetingId),
      ClassId: meeting.ClassId,
      createdBy: currentUser.id,
    });

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "Task",
      resourceId: task.id,
      resourceDetail: task.name,
      meta,
    });

    const cls = await Class.findByPk(meeting.ClassId, {
      include: [{ model: User, as: "mentees", attributes: ["id"], through: { attributes: [], where: { roleInClass: "Mentee" } } }],
    });

    await notifyUsers({
      userIds: (cls?.mentees || []).map((m) => m.id),
      type: "Task",
      title: "New Task Assigned",
      message: `${currentUser.name || "Mentor"} assigned a new task "${task.name}".`,
      relatedType: "Task",
      relatedId: task.id,
      ClassId: meeting.ClassId,
    });

    return task;
  }

  static async update(id, data, currentUser, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER, ROLES.MENTOR].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const task = await Task.findByPk(id);

    if (!task) {
      throw new Error("Task not found");
    }

    await task.update(data);

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "Task",
      resourceId: task.id,
      resourceDetail: task.name,
      meta,
    });

    return task;
  }

  static async delete(id, currentUser, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER, ROLES.MENTOR].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const task = await Task.findByPk(id);

    if (!task) {
      throw new Error("Task not found");
    }

    await logAudit({
      user: currentUser,
      action: "DELETE",
      resource: "Task",
      resourceId: task.id,
      resourceDetail: task.name,
      meta,
    });

    return task.destroy();
  }
}

module.exports = TaskService;
