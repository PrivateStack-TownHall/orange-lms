const express = require("express");
const router = express.Router();

const { UserController, ProfileController } = require("../controllers");

/**
 * Users
 */
router.get("/", UserController.getAll);
router.post("/", UserController.create);
router.get("/:id", UserController.getById);
router.put("/:id", UserController.update);
router.delete("/:id", UserController.delete);

/**
 * User Profile
 */
router.get("/:id/profile", ProfileController.getByUser);
router.put("/:id/profile", ProfileController.update);

module.exports = router;
