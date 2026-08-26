const { Op } = require("sequelize");
const { AuditLog, User } = require("../models");

class AuditLogService {
  static async findAll(query = {}) {
    const {
      startDate,
      endDate,
      UserId,
      action,
      resource,
      page = 1,
      limit = 10,
    } = query;

    const where = {};

    if (UserId) where.UserId = UserId;
    if (action && action !== "All") where.action = action;
    if (resource && resource !== "All") where.resource = resource;

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ["id", "name", "email", "avatarUrl"] },
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

  static async getOverview(query = {}) {
    const { startDate, endDate } = query;

    const where = {};

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const logs = await AuditLog.findAll({
      where,
      include: [{ model: User, attributes: ["id", "name"] }],
    });

    const total = logs.length;

    const byAction = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});

    const userCounts = logs.reduce((acc, log) => {
      const key = log.User?.name || "System";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topUsers = Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return { total, byAction, topUsers };
  }

  static async deleteOlderThan(days = 365) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);

    return AuditLog.destroy({
      where: { createdAt: { [Op.lt]: threshold } },
    });
  }
}

module.exports = AuditLogService;
