const express = require("express");

const router = express.Router();

const { AssessmentResultController } = require("../controllers");

const { authorization } = require("../middlewares");

router.get(
  "/",
  authorization("assessmentResult", "read"),
  AssessmentResultController.getAll,
);

router.get(
  "/:id",
  authorization("assessmentResult", "read"),
  AssessmentResultController.getById,
);

router.get(
  "/submission/:submissionId",
  authorization("assessmentResult", "read"),
  AssessmentResultController.getBySubmission,
);

router.post(
  "/",
  authorization("assessmentResult", "create"),
  AssessmentResultController.create,
);

router.put(
  "/:id",
  authorization("assessmentResult", "update"),
  AssessmentResultController.update,
);

router.delete(
  "/:id",
  authorization("assessmentResult", "delete"),
  AssessmentResultController.delete,
);

module.exports = router;
