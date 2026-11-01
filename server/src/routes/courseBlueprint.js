const express = require("express");
const router = express.Router();
const { CourseBlueprintController } = require("../controllers");
const { authorization } = require("../middlewares");

router.get("/", authorization("courseBlueprint", "read"), CourseBlueprintController.getAll);
router.post("/", authorization("courseBlueprint", "create"), CourseBlueprintController.create);
router.get("/:id", authorization("courseBlueprint", "read"), CourseBlueprintController.getById);
router.put("/:id", authorization("courseBlueprint", "update"), CourseBlueprintController.update);
router.delete("/:id", authorization("courseBlueprint", "delete"), CourseBlueprintController.delete);
router.post("/:id/meetings", authorization("courseBlueprint", "update"), CourseBlueprintController.createMeeting);
router.put("/meetings/:meetingId", authorization("courseBlueprint", "update"), CourseBlueprintController.updateMeeting);
router.delete("/meetings/:meetingId", authorization("courseBlueprint", "update"), CourseBlueprintController.deleteMeeting);
router.post("/meetings/:meetingId/materials", authorization("courseBlueprint", "update"), CourseBlueprintController.createMaterial);
router.put("/materials/:materialId", authorization("courseBlueprint", "update"), CourseBlueprintController.updateMaterial);
router.delete("/materials/:materialId", authorization("courseBlueprint", "update"), CourseBlueprintController.deleteMaterial);
router.post("/meetings/:meetingId/tasks", authorization("courseBlueprint", "update"), CourseBlueprintController.createTask);
router.put("/tasks/:taskId", authorization("courseBlueprint", "update"), CourseBlueprintController.updateTask);
router.delete("/tasks/:taskId", authorization("courseBlueprint", "update"), CourseBlueprintController.deleteTask);

module.exports = router;
