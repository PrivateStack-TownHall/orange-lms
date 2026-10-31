const express = require("express");
const router = express.Router({ mergeParams: true });

const { MeetingController } = require("../controllers");
const { authorization } = require("../middlewares");

router.get("/", authorization("meeting", "read"), MeetingController.getByClass);

router.post("/", authorization("meeting", "create"), MeetingController.create);

router.get("/all", authorization("meeting", "read"), MeetingController.getAll);

router.get("/:id", authorization("meeting", "read"), MeetingController.getById);

router.put(
  "/:id",
  authorization("meeting", "update"),
  MeetingController.update,
);

router.delete(
  "/:id",
  authorization("meeting", "delete"),
  MeetingController.delete,
);

module.exports = router;
