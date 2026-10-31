const express = require("express");
const router = express.Router();

const { ClassController } = require("../controllers");
const { authorization } = require("../middlewares");

router.get("/", authorization("class", "read"), ClassController.getAll);

router.post("/", authorization("class", "create"), ClassController.create);

router.get("/:id", authorization("class", "read"), ClassController.getById);

router.put("/:id", authorization("class", "update"), ClassController.update);

router.delete("/:id", authorization("class", "delete"), ClassController.delete);

router.post(
  "/:id/enrollMentee",
  authorization("class", "update"),
  ClassController.enrollMentee,
);
// Bulk Insert Mentees
router.post(
  "/:id/enrollMentees",
  authorization("class", "update"),
  ClassController.enrollMentees,
);

router.delete(
  "/:classId/mentees/:userId",
  authorization("class", "update"),
  ClassController.removeMentee,
);
router.post(
  "/:id/assign-mentor",
  authorization("class", "update"),
  ClassController.assignMentor,
);

router.get(
  "/:id/users",
  authorization("class", "read"),
  ClassController.getUsers,
);

router.get(
  "/:id/mentees",
  authorization("class", "read"),
  ClassController.getMentees,
);

router.get(
  "/:id/mentor",
  authorization("class", "read"),
  ClassController.getMentor,
);

module.exports = router;
