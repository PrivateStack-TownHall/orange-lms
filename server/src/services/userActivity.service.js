const { Op } = require("sequelize");
const { UserActivity, User, Class } = require("../models");

class UserActivityService {
  static async findAll(query = {}) {
    const {
      startDate,
      endDate,
      UserId,
      activity,
      ClassId,
      page = 1,
      limit = 10,
    } = query;

    const where = {};

    if (UserId) where.UserId = UserId;
    if (activity && activity !== "All") where.activity = activity;
    if (ClassId) where.ClassId = ClassId;

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await UserActivity.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ["id", "name", "email", "role", "avatarUrl"] },
        { model: Class, as: "class", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit: Number(limit),
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    };
  }

  static async findByResource(resourceType, resourceId) {
    return UserActivity.findAll({
      where: { resourceType, resourceId },
      include: [{ model: User, attributes: ["id", "name", "role"] }],
      order: [["createdAt", "ASC"]],
    });
  }

  static async getOverview(query = {}) {
    const { startDate, endDate } = query;

    const where = {};

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const activities = await UserActivity.findAll({
      where,
      include: [{ model: User, attributes: ["id", "name"] }],
    });

    const total = activities.length;

    const byActivity = activities.reduce((acc, a) => {
      acc[a.activity] = (acc[a.activity] || 0) + 1;
      return acc;
    }, {});

    const userCounts = activities.reduce((acc, a) => {
      const key = a.User?.name || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topUsers = Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return { total, byActivity, topUsers };
  }

  static async deleteOlderThan(days = 365) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);

    return UserActivity.destroy({
      where: { createdAt: { [Op.lt]: threshold } },
    });
  }
}

module.exports = UserActivityService;
