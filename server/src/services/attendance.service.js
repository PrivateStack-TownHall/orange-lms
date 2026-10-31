const { Attendance, User, Meeting } = require("../models");
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

  static async findAllByMeeting(MeetingId) {
    return Attendance.findAll({
      where: {
        MeetingId,
      },

      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "checker",
          attributes: ["id", "name"],
        },
      ],

      order: [["id", "ASC"]],
    });
  }

  static async findByUser(UserId) {
    return Attendance.findAll({
      where: {
        UserId,
      },

      include: [
        {
          model: Meeting,
        },
      ],

      order: [["id", "DESC"]],
    });
  }

  static async findById(id) {
    return Attendance.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "checker",
          attributes: ["id", "name"],
        },
        {
          model: Meeting,
        },
      ],
    });
  }

  static async updateStatus(id, data, currentUser, meta = {}) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const attendance = await Attendance.findByPk(id);

    if (!attendance) {
      throw new Error("Attendance not found");
    }

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

    return this.findById(id);
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
  static async getSummary(MeetingId) {
    const attendances = await Attendance.findAll({
      where: {
        MeetingId,
      },
    });

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
