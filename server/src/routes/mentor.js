const express = require("express");
const router = express.Router();

const { MentorController, ProfileController } = require("../controllers");

const { authorization } = require("../middlewares");

router.get("/", authorization("mentor", "read"), MentorController.getAll);

router.post("/", authorization("mentor", "create"), MentorController.create);

router.get("/:id", authorization("mentor", "read"), MentorController.getById);

router.put("/:id", authorization("mentor", "update"), MentorController.update);

router.delete(
  "/:id",
  authorization("mentor", "delete"),
  MentorController.delete,
);

router.get("/:id/profile", ProfileController.getByUser);

router.put("/:id/profile", ProfileController.update);

module.exports = router;
