const express = require("express");

const router = express.Router();

const { HistoryClassController } = require("../controllers");

const { authorization } = require("../middlewares");

router.get(
  "/",
  authorization("historyClass", "read"),
  HistoryClassController.getAll,
);

router.get(
  "/summary",
  authorization("historyClass", "read"),
  HistoryClassController.getSummary,
);

router.get(
  "/:id",
  authorization("historyClass", "read"),
  HistoryClassController.getById,
);

router.post(
  "/archive/:classId",
  authorization("historyClass", "create"),
  HistoryClassController.archive,
);

router.put(
  "/restore/:id",
  authorization("historyClass", "update"),
  HistoryClassController.restore,
);

router.delete(
  "/:id",
  authorization("historyClass", "delete"),
  HistoryClassController.delete,
);

module.exports = router;
