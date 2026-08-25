const { HistoryClass, Class, User, ClassUser } = require("../models");

class HistoryClassService {
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

  static async archive(classId, currentUser) {
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

        return HistoryClass.create({
          ClassId: cls.id,

          UserId: participant.UserId,

          roleInClass:
            participant.roleInClass ||
            (participant.User?.role === "Mentor" ? "Mentor" : "Mentee"),

          status: "Completed",

          finalScore: 0,

          attendancePercentage: 0,

          completedAt: new Date(),

          remarks: `Archived from class ${cls.name}`,

          certificateUrl: null,
        });
      }),
    );

    await cls.update({
      status: "Archived",
    });

    return histories;
  }

  static async restore(id, currentUser) {
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

    await cls.update({
      status: "Active",
    });

    await history.destroy();

    return {
      message: "Class restored successfully",
    };
  }

  static async delete(id, currentUser) {
    if (!["Owner"].includes(currentUser.role)) {
      throw new Error("Only owner can delete history");
    }

    const history = await HistoryClass.findByPk(id);

    if (!history) {
      throw new Error("History class not found");
    }

    await history.destroy();

    return true;
  }
}

module.exports = HistoryClassService;
