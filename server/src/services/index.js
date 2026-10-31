const authService = require("./auth.service");

const userService = require("./user.service");
const profileService = require("./profile.service");

const mentorService = require("./mentor.service");
const menteeService = require("./mentee.service");

const classService = require("./class.service");
const classUserService = require("./classUser.service");

const meetingService = require("./meeting.service");

const taskService = require("./task.service");
const taskSubmissionService = require("./taskSubmission.service");

const noteService = require("./note.service");
const materialService = require("./material.service");

// V3
const attendanceService = require("./attendance.service");
const taskCriteriaService = require("./taskCriteria.service");
const submissionCriteriaScoreService = require("./submissionCriteriaScore.service");
const assessmentResultService = require("./assessmentResult.service");
const historyClassService = require("./historyClass.service");

// V4 - Notifications, Logs & Reports
const notificationService = require("./notification.service");
const auditLogService = require("./auditLog.service");
const userActivityService = require("./userActivity.service");
const reportsService = require("./reports.service");

module.exports = {
  authService,

  userService,
  profileService,

  mentorService,
  menteeService,

  classService,
  classUserService,

  meetingService,

  taskService,
  taskSubmissionService,

  noteService,
  materialService,

  attendanceService,
  taskCriteriaService,
  submissionCriteriaScoreService,
  assessmentResultService,
  historyClassService,

  notificationService,
  auditLogService,
  userActivityService,
  reportsService,
};
