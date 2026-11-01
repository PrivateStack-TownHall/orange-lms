const { Material, Meeting, Class, User } = require("../models");
const ROLES = require("../constants/roles");
const { logAudit, notifyUsers } = require("../helpers");
const mentorSubstitutionService = require("./mentorSubstitution.service");

class MaterialService {
  static async findAllByMeeting(MeetingId, currentUser) {
    const meeting = await Meeting.findByPk(MeetingId);
    if (!meeting) throw new Error("Meeting not found");

    await mentorSubstitutionService.assertCanAccess({
      ClassId: meeting.ClassId,
      MeetingId: meeting.id,
      currentUser,
    });

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
      const scope = await mentorSubstitutionService.getScope(currentUser);

      return Material.findAll({
        where: mentorSubstitutionService.resourceScopeWhere(scope),
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

  static async findById(id, currentUser) {
    const material = await Material.findByPk(id, {
      include: [
        Meeting,
        Class,
        {
          model: User,
          as: "uploader",
        },
      ],
    });

    if (!material) return null;

    await mentorSubstitutionService.assertCanAccess({
      ClassId: material.ClassId,
      MeetingId: material.MeetingId,
      currentUser,
      cls: material.Class,
    });

    return material;
  }

  static async create(currentUser, meetingId, data, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER, ROLES.MENTOR].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const meeting = await Meeting.findByPk(meetingId);

    if (!meeting) {
      throw new Error("Meeting not found");
    }

    await this.assertMentorClassAccess(meeting.ClassId, currentUser, undefined, meeting.id);

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

    const material = await Material.findByPk(id, { include: [Class] });

    if (!material) {
      throw new Error("Material not found");
    }

    await this.assertMentorClassAccess(
      material.ClassId,
      currentUser,
      material.Class,
      material.MeetingId,
    );

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

    const material = await Material.findByPk(id, { include: [Class] });

    if (!material) {
      throw new Error("Material not found");
    }

    await this.assertMentorClassAccess(
      material.ClassId,
      currentUser,
      material.Class,
      material.MeetingId,
    );

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

  static async assertMentorClassAccess(ClassId, currentUser, cls, MeetingId) {
    await mentorSubstitutionService.assertCanAccess({
      ClassId,
      MeetingId,
      currentUser,
      cls,
    });
  }
}

module.exports = MaterialService;
