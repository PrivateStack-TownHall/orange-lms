const { Op } = require("sequelize");
const { Notification, Class } = require("../models");

class NotificationService {
  static async findAllByUser(currentUser, query = {}) {
    const { status, type, ClassId, page = 1, limit = 10 } = query;

    const where = { UserId: currentUser.id };

    if (status === "unread") where.isRead = false;
    if (status === "read") where.isRead = true;

    if (type && type !== "All") where.type = type;
    if (ClassId) where.ClassId = ClassId;

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await Notification.findAndCountAll({
      where,
      include: [{ model: Class, as: "class", attributes: ["id", "name"] }],
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

  static async getSummary(currentUser) {
    const notifications = await Notification.findAll({
      where: { UserId: currentUser.id },
      attributes: ["type", "isRead"],
    });

    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const read = total - unread;

    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});

    return { total, unread, read, byType };
  }

  static async markAsRead(id, currentUser) {
    const notification = await Notification.findByPk(id);

    if (!notification) throw new Error("Notification not found");

    if (notification.UserId !== currentUser.id) {
      throw new Error("Permission denied");
    }

    await notification.update({ isRead: true });

    return notification;
  }

  static async markAllAsRead(currentUser) {
    await Notification.update(
      { isRead: true },
      { where: { UserId: currentUser.id, isRead: false } },
    );

    return true;
  }

  static async delete(id, currentUser) {
    const notification = await Notification.findByPk(id);

    if (!notification) throw new Error("Notification not found");

    if (notification.UserId !== currentUser.id) {
      throw new Error("Permission denied");
    }

    await notification.destroy();

    return true;
  }

  static async deleteOldRead(days = 90) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);

    return Notification.destroy({
      where: { isRead: true, createdAt: { [Op.lt]: threshold } },
    });
  }
}

module.exports = NotificationService;
