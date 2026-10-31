const { HistoryClass, Class, User, ClassUser } = require("../models");
const { logAudit, notifyUsers } = require("../helpers");
const {
  HistoryClass,
  Class,
  User,
  ClassUser,
  Meeting,
  Attendance,
  AssessmentResult,
  TaskSubmission,
  Task,
} = require("../models");
const { logAudit } = require("../helpers");
const cloudinary = require("../config/cloudinary");
const { createCertificateBuffer, makeCertificateId } = require("./certificate.service");

class HistoryClassService {
  static async getParticipantProgress(ClassId, UserId) {
    const [results, attendances, meetingCount] = await Promise.all([
      AssessmentResult.findAll({
        include: [
          {
            model: TaskSubmission,
            required: true,
            where: { UserId },
            include: [{ model: Task, required: true, where: { ClassId } }],
          },
        ],
      }),
      Attendance.findAll({
        where: { UserId },
        include: [{ model: Meeting, required: true, where: { ClassId } }],
      }),
      Meeting.count({ where: { ClassId } }),
    ]);

    const finalScore = results.length
      ? Math.round((results.reduce((total, result) => total + Number(result.finalScore || 0), 0) / results.length) * 100) / 100
      : 0;
    const attended = attendances.filter((attendance) =>
      ["Present", "Late"].includes(attendance.status),
    ).length;
    const attendancePercentage = meetingCount
      ? Math.round((attended / meetingCount) * 10000) / 100
      : 0;

    return { finalScore, attendancePercentage };
  }

  static async findAll() {
    return HistoryClass.findAll({
      order: [["createdAt", "DESC"]],

      include: [
        {
          model: Class,
          attributes: ["id", "code", "name", "category", "level"],
        },

        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });
  }

  static async findById(id) {
    const history = await HistoryClass.findByPk(id, {
      include: [
        {
          model: Class,
          attributes: ["id", "code", "name"],
        },

        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!history) {
      throw new Error("History class not found");
    }

    return history;
  }

  static async getSummary() {
    const histories = await HistoryClass.findAll();

    return {
      total: histories.length,

      completed: histories.filter((x) => x.status === "Completed").length,

      failed: histories.filter((x) => x.status === "Failed").length,

      dropped: histories.filter((x) => x.status === "Dropped").length,

      archived: histories.filter((x) => x.status === "Archived").length,
    };
  }

  static async archive(classId, currentUser, meta = {}) {
    if (!["Owner", "Admin"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const cls = await Class.findByPk(classId);

    if (!cls) {
      throw new Error("Class not found");
    }

    const classUsers = await ClassUser.findAll({
      where: {
        ClassId: classId,
      },

      include: [
        {
          model: User,
          attributes: ["id", "role"],
        },
      ],
    });

    if (!classUsers.length) {
      throw new Error("No participants found");
    }

    const histories = await Promise.all(
      classUsers.map(async (participant) => {
        const existing = await HistoryClass.findOne({
          where: {
            ClassId: cls.id,
            UserId: participant.UserId,
          },
        });

        if (existing) {
          return existing;
        }

        const progress = await this.getParticipantProgress(cls.id, participant.UserId);

        return HistoryClass.create({
          ClassId: cls.id,

          UserId: participant.UserId,

          roleInClass:
            participant.roleInClass ||
            (participant.User?.role === "Mentor" ? "Mentor" : "Mentee"),

          status: "Completed",

          ...progress,

          completedAt: new Date(),

          remarks: `Archived from class ${cls.name}`,

          certificateUrl: null,
        });
      }),
    );

    await cls.update({
      status: "Archived",
    });

    await notifyUsers({
      userIds: classUsers.map((participant) => participant.UserId),
      type: "Class",
      title: "Class Archived",
      message: `Class "${cls.name}" has been archived. Your learning history is available.`,
      relatedType: "Class",
      relatedId: cls.id,
      ClassId: cls.id,
    });

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "HistoryClass",
      resourceId: cls.id,
      resourceDetail: `Archived class "${cls.name}"`,
      meta,
    });

    return histories;
  }

  static async restore(id, currentUser, meta = {}) {
    if (!["Owner", "Admin"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const history = await HistoryClass.findByPk(id);

    if (!history) {
      throw new Error("History class not found");
    }

    const cls = await Class.findByPk(history.ClassId);

    if (!cls) {
      throw new Error("Original class not found");
    }

    const participantIds = (await HistoryClass.findAll({
      where: { ClassId: history.ClassId },
      attributes: ["UserId"],
    })).map((record) => record.UserId);

    await cls.update({
      status: "Active",
    });

    const deletedCount = await HistoryClass.destroy({
      where: {
        ClassId: history.ClassId,
      },
    });

    await notifyUsers({
      userIds: participantIds,
      type: "Class",
      title: "Class Restored",
      message: `Class "${cls.name}" is active again.`,
      relatedType: "Class",
      relatedId: cls.id,
      ClassId: cls.id,
    });

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "HistoryClass",
      resourceId: cls.id,
      resourceDetail: `Restored class "${cls.name}"`,
      meta,
    });

    return {
      message: "Class restored successfully",
      restoredHistoryCount: deletedCount,
    };
  }

  static async delete(id, currentUser, meta = {}) {
    if (!["Owner"].includes(currentUser.role)) {
      throw new Error("Only owner can delete history");
    }

    const history = await HistoryClass.findByPk(id);

    if (!history) {
      throw new Error("History class not found");
    }

    await logAudit({
      user: currentUser,
      action: "DELETE",
      resource: "HistoryClass",
      resourceId: history.id,
      meta,
    });

    await history.destroy();

    return true;
  }

  static async generateCertificate(id, currentUser, meta = {}) {
    if (!["Owner", "Admin"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const history = await HistoryClass.findByPk(id, {
      include: [
        {
          model: Class,
          attributes: ["id", "code", "name", "category", "level"],
        },
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!history) {
      throw new Error("History class not found");
    }

    if (history.status !== "Completed") {
      throw new Error("Certificate is only available for completed records");
    }

    const certificateId = makeCertificateId(history);

    if (history.certificateUrl) {
      return {
        certificateId,
        certificateUrl: history.certificateUrl,
        generated: false,
      };
    }

    cloudinary.assertConfigured();

    const { buffer } = await createCertificateBuffer(history);
    const upload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "orange-lms/certificates",
          public_id: certificateId,
          format: "pdf",
          overwrite: true,
        },
        (error, result) => (error ? reject(error) : resolve(result)),
      );

      stream.end(buffer);
    });

    await history.update({
      certificateUrl: upload.secure_url,
    });

    await notifyUsers({
      userIds: history.UserId,
      type: "Certificate",
      title: "Certificate Available",
      message: `Your certificate for "${history.Class.name}" is ready to download.`,
      relatedType: "HistoryClass",
      relatedId: history.id,
      ClassId: history.ClassId,
    });

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "Certificate",
      resourceId: history.id,
      resourceDetail: `Generated certificate ${certificateId}`,
      meta,
    });

    return {
      certificateId,
      certificateUrl: history.certificateUrl,
      generated: true,
    };
  }
}

module.exports = HistoryClassService;
