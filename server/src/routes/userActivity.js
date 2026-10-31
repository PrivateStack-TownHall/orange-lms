const express = require("express");

const router = express.Router();

const { UserActivityController } = require("../controllers");

const { authorization } = require("../middlewares");

router.get(
  "/",
  authorization("userActivity", "read"),
  UserActivityController.getAll,
);

router.get(
  "/overview",
  authorization("userActivity", "read"),
  UserActivityController.getOverview,
);

module.exports = router;
