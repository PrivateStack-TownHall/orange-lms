const { Meeting, Class, User, Task, Note, Material } = require("../models");

const ROLES = require("../constants/roles");
const { logAudit, notifyUsers } = require("../helpers");

class MeetingService {
  static async findAllByClass(ClassId) {
    return Meeting.findAll({
      where: { ClassId },
      include: [
        {
          model: Class,
          as: "class",
          attributes: ["id", "name", "code", "description"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: Task,
          as: "tasks",
          attributes: ["id", "name"],
        },
        {
          model: Note,
          as: "notes",
          attributes: ["id", "name"],
        },
        {
          model: Material,
          as: "materials",
          attributes: ["id", "name"],
        },
      ],
    });
  }

  static async getAll(currentUser) {
    /**
     * Owner & Admin
     */
    if ([ROLES.OWNER, ROLES.ADMIN].includes(currentUser.role)) {
      return Meeting.findAll({
        include: [
          {
            model: Class,
            as: "class",
            attributes: ["id", "name", "code", "description"],
          },
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "email"],
          },
          {
            model: Task,
            as: "tasks",
            attributes: ["id", "name"],
          },
          {
            model: Note,
            as: "notes",
            attributes: ["id", "name"],
          },
          {
            model: Material,
            as: "materials",
            attributes: ["id", "name"],
          },
        ],
      });
    }

    /**
     * Mentor
     */
    if (currentUser.role === ROLES.MENTOR) {
      return Meeting.findAll({
        include: [
          {
            model: Class,
            as: "class",
            where: {
              MentorId: currentUser.id,
            },
            attributes: ["id", "name", "code", "description"],
          },
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "email"],
          },
          {
            model: Task,
            as: "tasks",
            attributes: ["id", "name"],
          },
          {
            model: Note,
            as: "notes",
            attributes: ["id", "name"],
          },
          {
            model: Material,
            as: "materials",
            attributes: ["id", "name"],
          },
        ],
      });
    }

    /**
     * Mentee
     */
    if (currentUser.role === ROLES.MENTEE) {
      return Meeting.findAll({
        include: [
          {
            model: Class,
            as: "class",
            required: true,
            attributes: ["id", "name", "code", "description"],
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
            attributes: ["id", "name", "email"],
          },
          {
            model: Task,
            as: "tasks",
            attributes: ["id", "name"],
          },
          {
            model: Note,
            as: "notes",
            attributes: ["id", "name"],
          },
          {
            model: Material,
            as: "materials",
            attributes: ["id", "name"],
          },
        ],
      });
    }

    throw new Error("Unauthorized");
  }

  static async findById(id) {
    return Meeting.findByPk(id, {
      include: [
        {
          model: Class,
          as: "class",
          attributes: ["id", "name", "code"],
          include: [
            {
              model: User,
              as: "mentor",
              attributes: ["id", "name"],
            },
            {
              model: User,
              as: "mentees",
              attributes: ["id", "name", "email"],
              through: { attributes: [], where: { roleInClass: "Mentee" } },
            },
          ],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: Task,
          as: "tasks",
          attributes: [
            "id",
            "name",
            "description",
            "maxScore",
            "dueDate",
            "status",
            "fileUrl",
          ],
        },
        {
          model: Note,
          as: "notes",
          attributes: ["id", "name", "description", "fileUrl", "createdAt"],
        },
        {
          model: Material,
          as: "materials",
          attributes: ["id", "name", "description", "type", "fileUrl", "createdAt"],
        },
      ],
    });
  }

  static async create(currentUser, classId, data, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER, ROLES.MENTOR].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const meeting = await Meeting.create({
      ...data,
      ClassId: classId,
      createdBy: currentUser.id,
    });

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "Meeting",
      resourceId: meeting.id,
      resourceDetail: meeting.name,
      meta,
    });

    const cls = await Class.findByPk(classId, {
      include: [{ model: User, as: "mentees", attributes: ["id"], through: { attributes: [], where: { roleInClass: "Mentee" } } }],
    });

    await notifyUsers({
      userIds: (cls?.mentees || []).map((m) => m.id),
      type: "Meeting",
      title: "Upcoming Meeting",
      message: `Meeting "${meeting.name}" has been scheduled.`,
      relatedType: "Meeting",
      relatedId: meeting.id,
      ClassId: classId,
    });

    return meeting;
  }

  static async update(id, data, currentUser, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const meeting = await Meeting.findByPk(id);

    if (!meeting) {
      throw new Error("Meeting not found");
    }

    await meeting.update(data);

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "Meeting",
      resourceId: meeting.id,
      resourceDetail: meeting.name,
      meta,
    });

    return meeting;
  }

  static async delete(id, currentUser, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const meeting = await Meeting.findByPk(id);

    if (!meeting) {
      throw new Error("Meeting not found");
    }

    await logAudit({
      user: currentUser,
      action: "DELETE",
      resource: "Meeting",
      resourceId: meeting.id,
      resourceDetail: meeting.name,
      meta,
    });

    return meeting.destroy();
  }
}

module.exports = MeetingService;
