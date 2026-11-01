const { Op } = require("sequelize");
const { Class, Meeting, MentorSubstitution, User } = require("../models");
const ROLES = require("../constants/roles");
const { logAudit, notifyUsers } = require("../helpers");

class MentorSubstitutionService {
  static activeWhere(MentorId, now = new Date()) {
    return {
      MentorId,
      status: "Active",
      [Op.and]: [
        { [Op.or]: [{ startAt: null }, { startAt: { [Op.lte]: now } }] },
        { [Op.or]: [{ endAt: null }, { endAt: { [Op.gte]: now } }] },
      ],
    };
  }

  static async getScope(currentUser, now = new Date()) {
    if (currentUser?.role !== ROLES.MENTOR) {
      return { classIds: null, meetingIds: null };
    }

    const [primaryClasses, substitutions] = await Promise.all([
      Class.findAll({
        where: { MentorId: currentUser.id },
        attributes: ["id"],
      }),
      MentorSubstitution.findAll({
        where: this.activeWhere(currentUser.id, now),
        attributes: ["ClassId", "MeetingId"],
      }),
    ]);

    const classIds = new Set(primaryClasses.map((cls) => Number(cls.id)));
    const meetingIds = new Set();

    substitutions.forEach((assignment) => {
      if (assignment.MeetingId) {
        meetingIds.add(Number(assignment.MeetingId));
      } else {
        classIds.add(Number(assignment.ClassId));
      }
    });

    return {
      classIds: [...classIds],
      meetingIds: [...meetingIds],
    };
  }

  static meetingScopeWhere(scope) {
    if (!scope?.classIds && !scope?.meetingIds) return undefined;

    const clauses = [];
    if (scope.classIds?.length) clauses.push({ ClassId: { [Op.in]: scope.classIds } });
    if (scope.meetingIds?.length) clauses.push({ id: { [Op.in]: scope.meetingIds } });

    return clauses.length ? { [Op.or]: clauses } : { id: { [Op.in]: [] } };
  }

  static resourceScopeWhere(scope) {
    if (!scope?.classIds && !scope?.meetingIds) return undefined;

    const clauses = [];
    if (scope.classIds?.length) clauses.push({ ClassId: { [Op.in]: scope.classIds } });
    if (scope.meetingIds?.length) clauses.push({ MeetingId: { [Op.in]: scope.meetingIds } });

    return clauses.length ? { [Op.or]: clauses } : { id: { [Op.in]: [] } };
  }

  static async canAccess({ ClassId, MeetingId, currentUser, cls }) {
    if (currentUser?.role !== ROLES.MENTOR) return true;

    const targetClass = cls || await Class.findByPk(ClassId);
    if (!targetClass) return false;
    if (Number(targetClass.MentorId) === Number(currentUser.id)) return true;

    const assignments = await MentorSubstitution.findAll({
      where: {
        ClassId,
        ...this.activeWhere(currentUser.id),
      },
      attributes: ["MeetingId"],
    });

    return assignments.some((assignment) =>
      !assignment.MeetingId || (MeetingId && Number(assignment.MeetingId) === Number(MeetingId)),
    );
  }

  static async assertCanAccess(options) {
    if (!(await this.canAccess(options))) {
      throw new Error("Permission denied");
    }
  }

  static async findAll(ClassId, currentUser) {
    await this.assertCanReadAssignments(ClassId, currentUser);

    return MentorSubstitution.findAll({
      where: { ClassId },
      include: [
        { model: Meeting, as: "meeting", attributes: ["id", "meetingNumber", "name", "meetingDate"] },
        { model: User, as: "mentor", attributes: ["id", "name", "email"] },
        { model: User, as: "assigner", attributes: ["id", "name", "email"] },
      ],
      order: [["startAt", "DESC"], ["id", "DESC"]],
    });
  }

  static async create(ClassId, data, currentUser, meta = {}) {
    this.assertCanManage(currentUser);

    const cls = await Class.findByPk(ClassId);
    if (!cls) throw new Error("Class not found");

    const mentor = await User.findByPk(data.MentorId);
    if (!mentor || mentor.role !== ROLES.MENTOR || mentor.isActive === false) {
      throw new Error("Mentor not found");
    }

    if (Number(mentor.id) === Number(cls.MentorId)) {
      throw new Error("Primary mentor cannot be assigned as a substitute");
    }

    if (data.MeetingId) {
      const meeting = await Meeting.findByPk(data.MeetingId);
      if (!meeting || Number(meeting.ClassId) !== Number(ClassId)) {
        throw new Error("Meeting does not belong to this class");
      }
    }

    const startAt = data.startAt ? new Date(data.startAt) : new Date();
    const endAt = data.endAt ? new Date(data.endAt) : null;
    if (Number.isNaN(startAt.getTime()) || (endAt && Number.isNaN(endAt.getTime()))) {
      throw new Error("Invalid substitute assignment period");
    }
    if (endAt && endAt < startAt) {
      throw new Error("endAt must be after startAt");
    }

    const existing = await MentorSubstitution.findOne({
      where: {
        ClassId,
        MentorId: mentor.id,
        MeetingId: data.MeetingId || null,
        status: "Active",
      },
    });
    if (existing) throw new Error("Mentor substitute is already assigned to this scope");

    const substitution = await MentorSubstitution.create({
      ClassId,
      MeetingId: data.MeetingId || null,
      MentorId: mentor.id,
      assignedBy: currentUser.id,
      reason: data.reason || null,
      startAt,
      endAt,
      status: "Active",
    });

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "MentorSubstitution",
      resourceId: substitution.id,
      resourceDetail: `${mentor.name} assigned as substitute for ${cls.name}`,
      meta,
    });

    await notifyUsers({
      userIds: mentor.id,
      type: "System",
      title: "Substitute mentor assignment",
      message: `You are assigned as a substitute mentor for "${cls.name}".`,
      relatedType: "Class",
      relatedId: ClassId,
      ClassId,
    });

    return substitution;
  }

  static async update(ClassId, id, data, currentUser, meta = {}) {
    this.assertCanManage(currentUser);

    const substitution = await this.findAssignment(ClassId, id);
    const updates = {};

    if (Object.prototype.hasOwnProperty.call(data, "reason")) updates.reason = data.reason || null;
    if (Object.prototype.hasOwnProperty.call(data, "startAt")) updates.startAt = new Date(data.startAt);
    if (Object.prototype.hasOwnProperty.call(data, "endAt")) {
      updates.endAt = data.endAt ? new Date(data.endAt) : null;
    }
    if (Object.prototype.hasOwnProperty.call(data, "status")) {
      if (!['Active', 'Ended', 'Cancelled'].includes(data.status)) {
        throw new Error("Invalid mentor substitute status");
      }
      updates.status = data.status;
    }

    const effectiveStartAt = updates.startAt || substitution.startAt;
    const effectiveEndAt = Object.prototype.hasOwnProperty.call(updates, "endAt")
      ? updates.endAt
      : substitution.endAt;
    if (Number.isNaN(new Date(effectiveStartAt).getTime()) ||
      (effectiveEndAt && Number.isNaN(new Date(effectiveEndAt).getTime())) ||
      (effectiveEndAt && new Date(effectiveEndAt) < new Date(effectiveStartAt))) {
      throw new Error("Invalid substitute assignment period");
    }

    await substitution.update(updates);

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "MentorSubstitution",
      resourceId: substitution.id,
      resourceDetail: `Substitute mentor assignment for class #${ClassId} updated`,
      meta,
    });

    return substitution;
  }

  static async cancel(ClassId, id, currentUser, meta = {}) {
    this.assertCanManage(currentUser);

    const substitution = await this.findAssignment(ClassId, id);
    if (substitution.status !== "Active") {
      throw new Error("Mentor substitute assignment is not active");
    }

    await substitution.update({ status: "Cancelled", endAt: new Date() });

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "MentorSubstitution",
      resourceId: substitution.id,
      resourceDetail: `Substitute mentor assignment for class #${ClassId} cancelled`,
      meta,
    });

    return substitution;
  }

  static assertCanManage(currentUser) {
    if (![ROLES.OWNER, ROLES.ADMIN].includes(currentUser?.role)) {
      throw new Error("Permission denied");
    }
  }

  static async assertCanReadAssignments(ClassId, currentUser) {
    if ([ROLES.OWNER, ROLES.ADMIN].includes(currentUser?.role)) return;
    await this.assertCanAccess({ ClassId, currentUser });
  }

  static async findAssignment(ClassId, id) {
    const substitution = await MentorSubstitution.findOne({ where: { id, ClassId } });
    if (!substitution) throw new Error("Mentor substitute assignment not found");
    return substitution;
  }
}

module.exports = MentorSubstitutionService;
