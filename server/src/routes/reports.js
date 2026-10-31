const express = require("express");

const router = express.Router();

const { ReportsController } = require("../controllers");

const { authorization } = require("../middlewares");

router.get(
  "/dashboard",
  authorization("reports", "read"),
  ReportsController.getDashboard,
);

module.exports = router;
