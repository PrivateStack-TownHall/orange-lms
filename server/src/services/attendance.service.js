const { Attendance, User, Meeting, Class, ClassUser } = require("../models");
const ROLES = require("../constants/roles");
const { logAudit, logActivity, notifyUsers } = require("../helpers");
const mentorSubstitutionService = require("./mentorSubstitution.service");

class AttendanceService {
  static async markAttendance(currentUser, data, meta = {}) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const meeting = await Meeting.findByPk(data.MeetingId);

    if (!meeting) {
      throw new Error("Meeting not found");
    }

    await this.assertMentorClassAccess(meeting.ClassId, currentUser, meeting.id);

    const enrollment = await ClassUser.findOne({
      where: {
        ClassId: meeting.ClassId,
        UserId: data.UserId,
        roleInClass: "Mentee",
      },
    });

    if (!enrollment) {
      throw new Error("Mentee is not enrolled in this class");
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

  static getIncludes({ mentorScope } = {}) {
    const meetingInclude = {
      model: Meeting,
      attributes: ["id", "name", "meetingNumber", "meetingDate", "ClassId"],
      include: [
        {
          model: Class,
          as: "class",
          attributes: ["id", "name", "code", "MentorId"],
        },
      ],
      ...(mentorScope ? {
        where: mentorSubstitutionService.meetingScopeWhere(mentorScope),
        required: true,
      } : {}),
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
    let mentorScope;

    if (currentUser.role === ROLES.MENTEE) {
      where.UserId = currentUser.id;
    }

    if (currentUser.role === ROLES.MENTOR) {
      mentorScope = await mentorSubstitutionService.getScope(currentUser);
    }

    return Attendance.findAll({
      where,
      include: this.getIncludes({ mentorScope }),
      order: [["checkInAt", "DESC"]],
    });
  }

  static async findAllByMeeting(MeetingId, currentUser) {
    const where = { MeetingId };
    let mentorScope;

    if (currentUser.role === ROLES.MENTEE) {
      where.UserId = currentUser.id;
    }

    if (currentUser.role === ROLES.MENTOR) {
      const meeting = await Meeting.findByPk(MeetingId);
      if (!meeting) throw new Error("Meeting not found");
      await mentorSubstitutionService.assertCanAccess({
        ClassId: meeting.ClassId,
        MeetingId: meeting.id,
        currentUser,
      });
      mentorScope = await mentorSubstitutionService.getScope(currentUser);
    }

    return Attendance.findAll({
      where,
      include: this.getIncludes({ mentorScope }),
      order: [["id", "ASC"]],
    });
  }

  static async findByUser(UserId, currentUser) {
    if (currentUser.role === ROLES.MENTEE && Number(UserId) !== currentUser.id) {
      throw new Error("Forbidden");
    }

    const mentorScope = currentUser.role === ROLES.MENTOR
      ? await mentorSubstitutionService.getScope(currentUser)
      : undefined;

    return Attendance.findAll({
      where: {
        UserId,
      },

      include: this.getIncludes({ mentorScope }),

      order: [["id", "DESC"]],
    });
  }

  static async findById(id, currentUser) {
    const where = { id };
    const mentorScope = currentUser.role === ROLES.MENTOR
      ? await mentorSubstitutionService.getScope(currentUser)
      : undefined;

    if (currentUser.role === ROLES.MENTEE) {
      where.UserId = currentUser.id;
    }

    const attendance = await Attendance.findOne({
      where,
      include: this.getIncludes({ mentorScope }),
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

  static async assertMentorClassAccess(ClassId, currentUser, MeetingId) {
    await mentorSubstitutionService.assertCanAccess({
      ClassId,
      MeetingId,
      currentUser,
    });
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
