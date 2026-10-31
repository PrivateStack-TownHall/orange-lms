const express = require("express");

const router = express.Router();

const { NotificationController } = require("../controllers");

const { authorization } = require("../middlewares");

router.get(
  "/",
  authorization("notification", "read"),
  NotificationController.getAll,
);

router.get(
  "/summary",
  authorization("notification", "read"),
  NotificationController.getSummary,
);

router.put(
  "/mark-all-read",
  authorization("notification", "update"),
  NotificationController.markAllAsRead,
);

router.put(
  "/:id/read",
  authorization("notification", "update"),
  NotificationController.markAsRead,
);

router.delete(
  "/:id",
  authorization("notification", "delete"),
  NotificationController.delete,
);

module.exports = router;
