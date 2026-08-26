const express = require("express");

const router = express.Router({ mergeParams: true });

const { AttendanceController } = require("../controllers");

const { authorization } = require("../middlewares");

router.get(
  "/meeting/:meetingId",
  authorization("attendance", "read"),
  AttendanceController.getByMeeting,
);
router.get(
  "/meeting/:meetingId/summary",
  authorization("attendance", "read"),
  AttendanceController.getSummary,
);
router.get(
  "/user/:userId",
  authorization("attendance", "read"),
  AttendanceController.getByUser,
);

router.get(
  "/:id",
  authorization("attendance", "read"),
  AttendanceController.getById,
);

router.post(
  "/",
  authorization("attendance", "create"),
  AttendanceController.mark,
);

router.put(
  "/:id",
  authorization("attendance", "update"),
  AttendanceController.update,
);

router.delete(
  "/:id",
  authorization("attendance", "delete"),
  AttendanceController.delete,
);

module.exports = router;
