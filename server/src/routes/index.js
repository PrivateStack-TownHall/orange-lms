const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const userRoutes = require("./user");

const mentorRoutes = require("./mentor");
const menteeRoutes = require("./mentee");

const classRoutes = require("./class");
const meetingRoutes = require("./meeting");

const taskRoutes = require("./task");
const noteRoutes = require("./note");
const materialRoutes = require("./material");

/**
 * V3 Assessment Routes
 */
const attendanceRoutes = require("./attendance");
const taskCriteriaRoutes = require("./taskCriteria");
const assessmentResultRoutes = require("./assessmentResult");
const submissionCriteriaScoreRoutes = require("./submissionCriteriaScore");
const historyClassRoutes = require("./historyClass");

/**
 * V4 Notifications, Logs & Reports Routes
 */
const notificationRoutes = require("./notification");
const auditLogRoutes = require("./auditLog");
const userActivityRoutes = require("./userActivity");
const reportsRoutes = require("./reports");

const { authentication } = require("../middlewares");

/**
 * Health Check
 */
router.get("/", (req, res) => {
  res.json({
    message: "Orange LMS Server is running 🚀",
  });
});

/**
 * Public Routes
 */
router.use("/auth", authRoutes);

/**
 * Protected Routes
 */
router.use(authentication);

/**
 * Core User Management
 */
router.use("/users", userRoutes);
router.use("/mentors", mentorRoutes);
router.use("/mentees", menteeRoutes);

/**
 * Learning Management
 */
router.use("/classes", classRoutes);

/**
 * Nested Meeting Routes
 */
router.use("/classes/:classId/meetings", meetingRoutes);

/**
 * Nested Learning Resources
 */
router.use("/meetings/:meetingId/tasks", taskRoutes);
router.use("/meetings/:meetingId/notes", noteRoutes);
router.use("/meetings/:meetingId/materials", materialRoutes);

/**
 * Flat Access
 */
router.use("/meetings", meetingRoutes);
router.use("/tasks", taskRoutes);
router.use("/notes", noteRoutes);
router.use("/materials", materialRoutes);

/**
 * V3 Assessment Engine
 */
router.use("/attendances", attendanceRoutes);
router.use("/task-criteria", taskCriteriaRoutes);
router.use("/assessment-results", assessmentResultRoutes);
router.use("/submission-scores", submissionCriteriaScoreRoutes);
router.use("/history-classes", historyClassRoutes);

/**
 * V4 Notifications, Logs & Reports
 */
router.use("/notifications", notificationRoutes);
router.use("/audit-logs", auditLogRoutes);
router.use("/user-activities", userActivityRoutes);
router.use("/reports", reportsRoutes);

module.exports = router;
