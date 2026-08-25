const { Meeting, Class, User, Task, Note, Material } = require("../models");

const ROLES = require("../constants/roles");

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
              through: { attributes: [] },
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

  static async create(currentUser, classId, data) {
    if (![ROLES.ADMIN, ROLES.OWNER, ROLES.MENTOR].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    return Meeting.create({
      ...data,
      ClassId: classId,
      createdBy: currentUser.id,
    });
  }

  static async update(id, data, currentUser) {
    if (![ROLES.ADMIN, ROLES.OWNER].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const meeting = await Meeting.findByPk(id);

    if (!meeting) {
      throw new Error("Meeting not found");
    }

    return meeting.update(data);
  }

  static async delete(id, currentUser) {
    if (![ROLES.ADMIN, ROLES.OWNER].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const meeting = await Meeting.findByPk(id);

    if (!meeting) {
      throw new Error("Meeting not found");
    }

    return meeting.destroy();
  }
}

module.exports = MeetingService;
