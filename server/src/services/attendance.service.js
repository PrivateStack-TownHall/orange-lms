const { Attendance, User, Meeting, Class } = require("../models");
const ROLES = require("../constants/roles");
const { logAudit, logActivity, notifyUsers } = require("../helpers");

class AttendanceService {
  static async markAttendance(currentUser, data, meta = {}) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const existing = await Attendance.findOne({
      where: {
        MeetingId: data.MeetingId,
        UserId: data.UserId,
      },
    });

    if (existing) {
      throw new Error("Attendance already exists for this user");
    }

    const attendance = await Attendance.create({
      ...data,
      checkedBy: currentUser.id,
      checkInAt: new Date(),
    });

    const meeting = await Meeting.findByPk(data.MeetingId);

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "Attendance",
      resourceId: attendance.id,
      resourceDetail: `Meeting #${meeting?.meetingNumber || data.MeetingId}`,
      meta,
    });

    await logActivity({
      user: { id: data.UserId },
      activity: "Attendance Recorded",
      description: `Your attendance for Meeting #${meeting?.meetingNumber || ""} has been recorded.`,
      ClassId: meeting?.ClassId,
      resourceType: "Attendance",
      resourceId: attendance.id,
    });

    await notifyUsers({
      userIds: data.UserId,
      type: "Attendance",
      title: "Attendance Recorded",
      message: `Your attendance for Meeting #${meeting?.meetingNumber || ""} has been recorded.`,
      relatedType: "Attendance",
      relatedId: attendance.id,
      ClassId: meeting?.ClassId,
    });

    return attendance;
  }

  static getIncludes({ restrictToMentorId } = {}) {
    const meetingInclude = {
      model: Meeting,
      attributes: ["id", "name", "meetingNumber", "meetingDate", "ClassId"],
      include: [
        {
          model: Class,
          as: "class",
          attributes: ["id", "name", "code", "MentorId"],
          ...(restrictToMentorId ? { where: { MentorId: restrictToMentorId } } : {}),
        },
      ],
      ...(restrictToMentorId ? { required: true } : {}),
    };

    return [
      {
        model: User,
        attributes: ["id", "name", "email"],
      },
      {
        model: User,
        as: "checker",
        attributes: ["id", "name"],
      },
      meetingInclude,
    ];
  }

  static async findAll(currentUser) {
    const where = {};
    let restrictToMentorId;

    if (currentUser.role === ROLES.MENTEE) {
      where.UserId = currentUser.id;
    }

    if (currentUser.role === ROLES.MENTOR) {
      restrictToMentorId = currentUser.id;
    }

    return Attendance.findAll({
      where,
      include: this.getIncludes({ restrictToMentorId }),
      order: [["checkInAt", "DESC"]],
    });
  }

  static async findAllByMeeting(MeetingId, currentUser) {
    const where = { MeetingId };
    let restrictToMentorId;

    if (currentUser.role === ROLES.MENTEE) {
      where.UserId = currentUser.id;
    }

    if (currentUser.role === ROLES.MENTOR) {
      restrictToMentorId = currentUser.id;
    }

    return Attendance.findAll({
      where,
      include: this.getIncludes({ restrictToMentorId }),
      order: [["id", "ASC"]],
    });
  }

  static async findByUser(UserId, currentUser) {
    if (currentUser.role === ROLES.MENTEE && Number(UserId) !== currentUser.id) {
      throw new Error("Forbidden");
    }

    const restrictToMentorId =
      currentUser.role === ROLES.MENTOR ? currentUser.id : undefined;

    return Attendance.findAll({
      where: {
        UserId,
      },

      include: this.getIncludes({ restrictToMentorId }),

      order: [["id", "DESC"]],
    });
  }

  static async findById(id, currentUser) {
    const where = { id };
    const restrictToMentorId =
      currentUser.role === ROLES.MENTOR ? currentUser.id : undefined;

    if (currentUser.role === ROLES.MENTEE) {
      where.UserId = currentUser.id;
    }

    const attendance = await Attendance.findOne({
      where,
      include: this.getIncludes({ restrictToMentorId }),
    });

    if (!attendance) {
      throw new Error("Attendance not found");
    }

    return attendance;
  }

  static async updateStatus(id, data, currentUser, meta = {}) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const attendance = await this.findById(id, currentUser);

    await attendance.update({
      ...data,
      checkedBy: currentUser.id,
    });

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "Attendance",
      resourceId: attendance.id,
      meta,
    });

    return this.findById(id, currentUser);
  }

  static async delete(id, currentUser, meta = {}) {
    if (!["Admin", "Owner"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const attendance = await Attendance.findByPk(id);

    if (!attendance) {
      throw new Error("Attendance not found");
    }

    await logAudit({
      user: currentUser,
      action: "DELETE",
      resource: "Attendance",
      resourceId: attendance.id,
      meta,
    });

    await attendance.destroy();

    return true;
  }

  // tambahan new feature
  static async getSummary(MeetingId, currentUser) {
    const attendances = await this.findAllByMeeting(MeetingId, currentUser);

    return {
      total: attendances.length,

      present: attendances.filter((x) => x.status === "Present").length,

      late: attendances.filter((x) => x.status === "Late").length,

      absent: attendances.filter((x) => x.status === "Absent").length,

      excused: attendances.filter((x) => x.status === "Excused").length,
    };
  }
}

module.exports = AttendanceService;
