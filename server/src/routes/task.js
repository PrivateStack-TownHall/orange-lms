const express = require("express");
const router = express.Router({ mergeParams: true });

const { TaskController } = require("../controllers");
const { authorization, upload } = require("../middlewares");

router.get("/", authorization("task", "read"), TaskController.getByMeeting);

router.post(
  "/",
  authorization("task", "create"),
  upload.single("file"),
  TaskController.create,
);

router.get("/all", authorization("task", "read"), TaskController.getAll);

router.get("/:id", authorization("task", "read"), TaskController.getById);

router.put(
  "/:id",
  authorization("task", "update"),
  upload.single("file"),
  TaskController.update,
);

router.delete("/:id", authorization("task", "delete"), TaskController.delete);

router.post(
  "/:id/submit",
  authorization("task", "submit"),
  TaskController.submitTask,
);

router.get(
  "/:id/submissions",
  authorization("task", "read"),
  TaskController.getSubmissions,
);

// tambahan untuk new features tasksubmission
router.get(
  "/submissions/:submissionId",
  authorization("task", "read"),
  TaskController.getSubmissionDetail,
);

router.put(
  "/submissions/:submissionId",
  authorization("task", "submit"),
  TaskController.updateSubmission,
);

router.put(
  "/submissions/:submissionId/review",
  authorization("task", "update"),
  TaskController.reviewSubmission,
);
module.exports = router;
