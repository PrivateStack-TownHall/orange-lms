const { notificationService } = require("../services");

class NotificationController {
  static async getAll(req, res, next) {
    try {
      const result = await notificationService.findAllByUser(req.user, req.query);

      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getSummary(req, res, next) {
    try {
      const summary = await notificationService.getSummary(req.user);

      res.json(summary);
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(
        req.params.id,
        req.user,
      );

      res.json(notification);
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user);

      res.json({ message: "All notifications marked as read" });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await notificationService.delete(req.params.id, req.user);

      res.json({ message: "Notification deleted" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NotificationController;
