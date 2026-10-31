const ENDPOINTS = {
  /**
   * Auth
   */
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
  },

  /**
   * User Management
   */
  USERS: "/users",
  MENTORS: "/mentors",
  MENTEES: "/mentees",

  /**
   * Classes
   */
  CLASSES: "/classes",

  /**
   * Nested Meetings
   */
  CLASS_MEETINGS: (classId) => `/classes/${classId}/meetings`,

  /**
   * Flat Meetings
   */
  MEETINGS: "/meetings",

  /**
   * Nested Learning Resources
   */
  MEETING_TASKS: (meetingId) => `/meetings/${meetingId}/tasks`,
  MEETING_NOTES: (meetingId) => `/meetings/${meetingId}/notes`,
  MEETING_MATERIALS: (meetingId) => `/meetings/${meetingId}/materials`,

  /**
   * Flat Learning Resources
   */
  TASKS: "/tasks",
  NOTES: "/notes",
  MATERIALS: "/materials",

  /**
   * V3 Assessment Engine
   */
  ATTENDANCES: "/attendances",
  TASK_CRITERIA: "/task-criteria",
  ASSESSMENT_RESULTS: "/assessment-results",
  SUBMISSION_SCORES: "/submission-scores",
  HISTORY_CLASSES: "/history-classes",

  /**
   * Task Submissions (nested under /tasks)
   */
  TASK_SUBMIT: (taskId) => `/tasks/${taskId}/submit`,
  TASK_SUBMISSIONS: (taskId) => `/tasks/${taskId}/submissions`,
  SUBMISSION_DETAIL: (submissionId) => `/tasks/submissions/${submissionId}`,
  SUBMISSION_REVIEW: (submissionId) =>
    `/tasks/submissions/${submissionId}/review`,

  /**
   * V4 Notifications, Logs & Reports
   */
  NOTIFICATIONS: "/notifications",
  AUDIT_LOGS: "/audit-logs",
  USER_ACTIVITIES: "/user-activities",
  REPORTS: "/reports",

  /**
   * Auth extras
   */
  AUTH_LOGOUT: "/auth/logout",
};

export default ENDPOINTS;
