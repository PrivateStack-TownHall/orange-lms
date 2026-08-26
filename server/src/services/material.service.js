const { Material, Meeting, Class, User } = require("../models");
const ROLES = require("../constants/roles");
const { logAudit, notifyUsers } = require("../helpers");

class MaterialService {
  static async findAllByMeeting(MeetingId) {
    return Material.findAll({
      where: { MeetingId },
      include: [
        Meeting,
        Class,
        {
          model: User,
          as: "uploader",
        },
      ],
    });
  }

  static async getAll(currentUser) {
    /**
     * Owner & Admin
     */
    if ([ROLES.OWNER, ROLES.ADMIN].includes(currentUser.role)) {
      return Material.findAll({
        include: [
          Meeting,
          Class,
          {
            model: User,
            as: "uploader",
          },
        ],
      });
    }

    /**
     * Mentor
     */
    if (currentUser.role === ROLES.MENTOR) {
      return Material.findAll({
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
            as: "uploader",
          },
        ],
      });
    }

    /**
     * Mentee
     */
    if (currentUser.role === ROLES.MENTEE) {
      return Material.findAll({
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
            as: "uploader",
          },
        ],
      });
    }

    throw new Error("Unauthorized");
  }

  static async findById(id) {
    return Material.findByPk(id, {
      include: [
        Meeting,
        Class,
        {
          model: User,
          as: "uploader",
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

    const material = await Material.create({
      ...data,
      MeetingId: Number(meetingId),
      ClassId: meeting.ClassId,
      uploadedBy: currentUser.id,
    });

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "Material",
      resourceId: material.id,
      resourceDetail: material.name,
      meta,
    });

    const cls = await Class.findByPk(meeting.ClassId, {
      include: [{ model: User, as: "mentees", attributes: ["id"], through: { attributes: [], where: { roleInClass: "Mentee" } } }],
    });

    await notifyUsers({
      userIds: (cls?.mentees || []).map((m) => m.id),
      type: "Material",
      title: "New Material Added",
      message: `${currentUser.name || "Mentor"} added new material "${material.name}".`,
      relatedType: "Material",
      relatedId: material.id,
      ClassId: meeting.ClassId,
    });

    return material;
  }

  static async update(id, data, currentUser, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER, ROLES.MENTOR].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const material = await Material.findByPk(id);

    if (!material) {
      throw new Error("Material not found");
    }

    await material.update(data);

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "Material",
      resourceId: material.id,
      resourceDetail: material.name,
      meta,
    });

    return material;
  }

  static async delete(id, currentUser, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER, ROLES.MENTOR].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const material = await Material.findByPk(id);

    if (!material) {
      throw new Error("Material not found");
    }

    await logAudit({
      user: currentUser,
      action: "DELETE",
      resource: "Material",
      resourceId: material.id,
      resourceDetail: material.name,
      meta,
    });

    return material.destroy();
  }
}

module.exports = MaterialService;
