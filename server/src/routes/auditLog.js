const express = require("express");

const router = express.Router();

const { AuditLogController } = require("../controllers");

const { authorization } = require("../middlewares");

router.get("/", authorization("auditLog", "read"), AuditLogController.getAll);

router.get(
  "/overview",
  authorization("auditLog", "read"),
  AuditLogController.getOverview,
);

module.exports = router;
