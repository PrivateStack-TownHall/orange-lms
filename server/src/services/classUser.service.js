const { ClassUser, User, Class } = require("../models");
const { logAudit, logActivity, notifyUsers } = require("../helpers");

class ClassUserService {
  static async enrollMentee({ ClassId, UserId }, currentUser, meta = {}) {
    const enrollment = await ClassUser.create({
      ClassId,
      UserId,
      roleInClass: "Mentee",
      progressPercentage: 0,
      status: "Active",
      assignedBy: currentUser?.id,
      joinedAt: new Date(),
    });

    const cls = await Class.findByPk(ClassId);

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "ClassUser",
      resourceId: enrollment.id,
      resourceDetail: `Mentee joined ${cls?.name || "class"}`,
      meta,
    });

    await logActivity({
      user: { id: UserId },
      activity: "Joined Class",
      description: `Joined class "${cls?.name || ""}"`,
      ClassId,
      resourceType: "Class",
      resourceId: ClassId,
    });

    await notifyUsers({
      userIds: UserId,
      type: "System",
      title: "Welcome to a new class",
      message: `You have been enrolled in "${cls?.name || "a class"}".`,
      relatedType: "Class",
      relatedId: ClassId,
      ClassId,
    });

    return enrollment;
  }

  // Bulk Insert Mentees
  static async enrollMentees(ClassId, UserIds, currentUser, meta = {}) {
    const results = [];

    for (const UserId of UserIds) {
      const existing = await ClassUser.findOne({
        where: {
          ClassId,
          UserId,
        },
      });

      if (!existing) {
        const enrollment = await this.enrollMentee(
          { ClassId, UserId },
          currentUser,
          meta,
        );

        results.push(enrollment);
      }
    }

    return results;
  }

  static async removeMentee(ClassId, UserId, currentUser, meta = {}) {
    const removed = await ClassUser.destroy({
      where: {
        ClassId,
        UserId,
        roleInClass: "Mentee",
      },
    });

    await logAudit({
      user: currentUser,
      action: "DELETE",
      resource: "ClassUser",
      resourceId: UserId,
      resourceDetail: `Mentee removed from class #${ClassId}`,
      meta,
    });

    return removed;
  }

  static async assignMentor({ ClassId, UserId }, currentUser, meta = {}) {
    const assignment = await ClassUser.create({
      ClassId,
      UserId,
      roleInClass: "Mentor",
      progressPercentage: 0,
      status: "Active",
      assignedBy: currentUser?.id,
      joinedAt: new Date(),
    });

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "Class",
      resourceId: ClassId,
      resourceDetail: `Mentor assigned to class #${ClassId}`,
      meta,
    });

    return assignment;
  }

  static async getUsers(ClassId) {
    return ClassUser.findAll({
      where: { ClassId },
      include: User,
    });
  }

  static async getMentees(ClassId) {
    const { classService } = require("./index");

    const mentees = await ClassUser.findAll({
      where: {
        ClassId,
        roleInClass: "Mentee",
      },
      include: User,
    });

    const stats = await classService.computeMenteeStats(
      ClassId,
      mentees.map((m) => m.UserId),
    );

    return mentees.map((m) => ({
      ...m.toJSON(),
      stats: stats[m.UserId] || {
        attendance: 0,
        taskCompletion: 0,
        avgScore: 0,
        progress: Number(m.progressPercentage || 0),
      },
    }));
  }

  static async getMentor(ClassId) {
    return ClassUser.findOne({
      where: {
        ClassId,
        roleInClass: "Mentor",
      },
      include: User,
    });
  }
}

module.exports = ClassUserService;
