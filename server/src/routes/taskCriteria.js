const express = require("express");

const router = express.Router({ mergeParams: true });

const { TaskCriteriaController } = require("../controllers");

const { authorization } = require("../middlewares");

router.get(
  "/tasks/:taskId",
  authorization("taskCriteria", "read"),
  TaskCriteriaController.getByTask,
);

router.get(
  "/tasks/:taskId/summary",
  authorization("taskCriteria", "read"),
  TaskCriteriaController.getSummary,
);

router.post(
  "/",
  authorization("taskCriteria", "create"),
  TaskCriteriaController.create,
);

router.get(
  "/:id",
  authorization("taskCriteria", "read"),
  TaskCriteriaController.getById,
);

router.put(
  "/:id",
  authorization("taskCriteria", "update"),
  TaskCriteriaController.update,
);

router.delete(
  "/:id",
  authorization("taskCriteria", "delete"),
  TaskCriteriaController.delete,
);

module.exports = router;
