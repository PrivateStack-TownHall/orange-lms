const express = require("express");
const router = express.Router();

const { MenteeController, ProfileController } = require("../controllers");

const { authorization } = require("../middlewares");

router.get("/", authorization("mentee", "read"), MenteeController.getAll);

router.post("/", authorization("mentee", "create"), MenteeController.create);

router.get("/:id", authorization("mentee", "read"), MenteeController.getById);

router.put("/:id", authorization("mentee", "update"), MenteeController.update);

router.delete(
  "/:id",
  authorization("mentee", "delete"),
  MenteeController.delete,
);

router.get("/:id/profile", ProfileController.getByUser);

router.put("/:id/profile", ProfileController.update);

module.exports = router;
