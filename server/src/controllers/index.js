const AuthController = require("./AuthController");
const UserController = require("./UserController");
const ProfileController = require("./ProfileController");

const ClassController = require("./ClassController");
const MeetingController = require("./MeetingController");

const TaskController = require("./TaskController");
const TaskSubmissionController = require("./TaskSubmissionController");

const NoteController = require("./NoteController");
const MaterialController = require("./MaterialController");

const MentorController = require("./MentorController");
const MenteeController = require("./MenteeController");

// V3

const AttendanceController = require("./AttendanceController");
const TaskCriteriaController = require("./TaskCriteriaController");
const HistoryClassController = require("./HistoryClassController");
const AssessmentResultController = require("./AssessmentResultController");
const SubmissionCriteriaScoreController = require("./SubmissionCriteriaScoreController");

// V4
const NotificationController = require("./NotificationController");
const AuditLogController = require("./AuditLogController");
const UserActivityController = require("./UserActivityController");
const ReportsController = require("./ReportsController");

module.exports = {
  AuthController,
  UserController,
  ProfileController,

  MentorController,
  MenteeController,

  ClassController,
  MeetingController,

  TaskController,
  TaskSubmissionController,

  NoteController,
  MaterialController,

  AttendanceController,
  TaskCriteriaController,
  HistoryClassController,
  AssessmentResultController,
  SubmissionCriteriaScoreController,

  NotificationController,
  AuditLogController,
  UserActivityController,
  ReportsController,
};
