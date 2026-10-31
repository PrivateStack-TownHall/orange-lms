const json = (schema) => ({
  content: { "application/json": { schema } },
});

const success = (description = "Request successful") => ({
  description,
  ...json({ $ref: "#/components/schemas/SuccessResponse" }),
});

const created = (description = "Resource created") => ({
  description,
  ...json({ $ref: "#/components/schemas/SuccessResponse" }),
});

const errors = {
  401: { description: "Missing, malformed, or invalid bearer token", ...json({ $ref: "#/components/schemas/ErrorResponse" }) },
  403: { description: "Authenticated user does not have permission", ...json({ $ref: "#/components/schemas/ErrorResponse" }) },
  404: { description: "Resource not found", ...json({ $ref: "#/components/schemas/ErrorResponse" }) },
  422: { description: "Validation failed", ...json({ $ref: "#/components/schemas/ErrorResponse" }) },
  500: { description: "Unexpected server error", ...json({ $ref: "#/components/schemas/ErrorResponse" }) },
};

const body = (schema, contentType = "application/json") => ({
  required: true,
  content: { [contentType]: { schema: { $ref: `#/components/schemas/${schema}` } } },
});

const uploadBody = (schema) => ({
  required: true,
  content: {
    "application/json": { schema: { $ref: `#/components/schemas/${schema}` } },
    "multipart/form-data": { schema: { $ref: `#/components/schemas/${schema}` } },
  },
});

const id = (name = "id", description = "Resource identifier") => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "integer", minimum: 1 },
});

const protectedOperation = ({ summary, description, requestBody, parameters = [], status = 200 }) => ({
  summary,
  description,
  security: [{ bearerAuth: [] }],
  parameters,
  ...(requestBody ? { requestBody } : {}),
  responses: { [status]: status === 201 ? created() : success(), ...errors },
});

const publicOperation = ({ summary, description, requestBody, status = 200 }) => ({
  summary,
  description,
  ...(requestBody ? { requestBody } : {}),
  responses: { [status]: status === 201 ? created() : success(), 422: errors[422] },
});

const crud = (tag, schema, label) => ({
  get: protectedOperation({ summary: `List ${label}`, description: `Returns ${label} available to the authenticated user.` }),
  post: protectedOperation({ summary: `Create ${label === "task criteria" ? "task criterion" : label.slice(0, -1)}`, description: `Creates a ${label === "task criteria" ? "task criterion" : label.slice(0, -1)}.`, requestBody: body(schema), status: 201 }),
});

const crudById = (schema, label, updateRequestBody = body(schema)) => ({
  get: protectedOperation({ summary: `Get ${label}`, description: `Returns one ${label} by identifier.`, parameters: [id()] }),
  put: protectedOperation({ summary: `Update ${label}`, description: `Updates one ${label} by identifier.`, parameters: [id()], requestBody: updateRequestBody }),
  delete: protectedOperation({ summary: `Delete ${label}`, description: `Deletes one ${label} by identifier.`, parameters: [id()] }),
});

const paths = {
  "/": {
    get: publicOperation({ summary: "Health check", description: "Confirms that the Orange LMS API is running." }),
  },
  "/auth": {
    get: publicOperation({ summary: "Auth API check", description: "Confirms that the authentication route group is available." }),
  },
  "/auth/register": {
    post: publicOperation({ summary: "Register user", description: "Creates a user account and profile.", requestBody: body("RegisterRequest"), status: 201 }),
  },
  "/auth/login": {
    post: publicOperation({ summary: "Login", description: "Validates credentials and returns an access token.", requestBody: body("LoginRequest") }),
  },
  "/auth/me": {
    get: protectedOperation({ summary: "Get current user", description: "Returns the authenticated user and profile." }),
  },
  "/auth/logout": {
    post: protectedOperation({ summary: "Logout", description: "Records a logout audit and activity event." }),
  },
  "/users": crud("Users", "UserRequest", "users"),
  "/users/{id}": crudById("UserRequest", "user"),
  "/users/{id}/profile": {
    get: protectedOperation({ summary: "Get user profile", description: "Returns the profile associated with a user.", parameters: [id()] }),
    put: protectedOperation({ summary: "Update user profile", description: "Updates profile fields for a user.", parameters: [id()], requestBody: body("ProfileRequest") }),
  },
  "/mentors": crud("Mentors", "UserRequest", "mentors"),
  "/mentors/{id}": crudById("UserRequest", "mentor"),
  "/mentors/{id}/profile": {
    get: protectedOperation({ summary: "Get mentor profile", description: "Returns a mentor profile.", parameters: [id()] }),
    put: protectedOperation({ summary: "Update mentor profile", description: "Updates a mentor profile.", parameters: [id()], requestBody: body("ProfileRequest") }),
  },
  "/mentees": crud("Mentees", "UserRequest", "mentees"),
  "/mentees/{id}": crudById("UserRequest", "mentee"),
  "/mentees/{id}/profile": {
    get: protectedOperation({ summary: "Get mentee profile", description: "Returns a mentee profile.", parameters: [id()] }),
    put: protectedOperation({ summary: "Update mentee profile", description: "Updates a mentee profile.", parameters: [id()], requestBody: body("ProfileRequest") }),
  },
  "/classes": crud("Classes", "ClassRequest", "classes"),
  "/classes/{id}": crudById("ClassRequest", "class"),
  "/classes/{id}/enrollMentee": {
    post: protectedOperation({ summary: "Enroll one mentee", description: "Enrolls one mentee in a class.", parameters: [id()], requestBody: body("EnrollmentRequest") }),
  },
  "/classes/{id}/enrollMentees": {
    post: protectedOperation({ summary: "Enroll mentees in bulk", description: "Enrolls multiple mentees in a class.", parameters: [id()], requestBody: body("BulkEnrollmentRequest") }),
  },
  "/classes/{classId}/mentees/{userId}": {
    delete: protectedOperation({ summary: "Remove mentee", description: "Removes an enrolled mentee from a class.", parameters: [id("classId", "Class identifier"), id("userId", "Mentee user identifier")] }),
  },
  "/classes/{id}/assign-mentor": {
    post: protectedOperation({ summary: "Assign mentor", description: "Assigns the class mentor.", parameters: [id()], requestBody: body("MentorAssignmentRequest") }),
  },
  "/classes/{id}/users": {
    get: protectedOperation({ summary: "List class users", description: "Returns users enrolled or assigned to a class.", parameters: [id()] }),
  },
  "/classes/{id}/mentees": {
    get: protectedOperation({ summary: "List class mentees", description: "Returns mentees enrolled in a class.", parameters: [id()] }),
  },
  "/classes/{id}/mentor": {
    get: protectedOperation({ summary: "Get class mentor", description: "Returns the mentor assigned to a class.", parameters: [id()] }),
  },
  "/classes/{classId}/meetings": {
    get: protectedOperation({ summary: "List class meetings", description: "Returns meetings for one class.", parameters: [id("classId", "Class identifier")] }),
    post: protectedOperation({ summary: "Create class meeting", description: "Creates a meeting inside a class.", parameters: [id("classId", "Class identifier")], requestBody: body("MeetingRequest"), status: 201 }),
  },
  "/meetings": {
    get: protectedOperation({ summary: "List meetings", description: "Returns meetings using the flat meeting route." }),
    post: protectedOperation({ summary: "Create meeting", description: "Creates a meeting through the flat route.", requestBody: body("MeetingRequest"), status: 201 }),
  },
  "/meetings/all": {
    get: protectedOperation({ summary: "List all meetings", description: "Returns all meetings visible to the authenticated user." }),
  },
  "/meetings/{id}": crudById("MeetingRequest", "meeting"),
  "/meetings/{meetingId}/tasks": {
    get: protectedOperation({ summary: "List meeting tasks", description: "Returns tasks for one meeting.", parameters: [id("meetingId", "Meeting identifier")] }),
    post: protectedOperation({ summary: "Create task", description: "Creates a task; use JSON for a URL or multipart form data with optional `file`.", parameters: [id("meetingId", "Meeting identifier")], requestBody: uploadBody("TaskRequest") , status: 201 }),
  },
  "/tasks": {
    get: protectedOperation({ summary: "List tasks", description: "Returns tasks through the flat route." }),
    post: protectedOperation({ summary: "Create task", description: "Creates a task through the flat route.", requestBody: uploadBody("TaskRequest"), status: 201 }),
  },
  "/tasks/all": {
    get: protectedOperation({ summary: "List all tasks", description: "Returns all tasks visible to the authenticated user." }),
  },
  "/tasks/{id}": crudById("TaskRequest", "task", uploadBody("TaskRequest")),
  "/tasks/{id}/submit": {
    post: protectedOperation({ summary: "Submit task", description: "Creates a mentee submission for a task.", parameters: [id()], requestBody: body("TaskSubmissionRequest"), status: 201 }),
  },
  "/tasks/{id}/submissions": {
    get: protectedOperation({ summary: "List task submissions", description: "Returns submissions for one task.", parameters: [id()] }),
  },
  "/tasks/submissions/{submissionId}": {
    get: protectedOperation({ summary: "Get submission", description: "Returns one task submission.", parameters: [id("submissionId", "Submission identifier")] }),
    put: protectedOperation({ summary: "Update submission", description: "Updates the authenticated mentee's submission.", parameters: [id("submissionId", "Submission identifier")], requestBody: body("TaskSubmissionRequest") }),
  },
  "/tasks/submissions/{submissionId}/review": {
    put: protectedOperation({ summary: "Review submission", description: "Adds mentor review data to a task submission.", parameters: [id("submissionId", "Submission identifier")], requestBody: body("SubmissionReviewRequest") }),
  },
};

const addResourceRoutes = (resource, schema, label) => {
  paths[`/meetings/{meetingId}/${resource}`] = {
    get: protectedOperation({ summary: `List meeting ${label}`, description: `Returns ${label} for one meeting.`, parameters: [id("meetingId", "Meeting identifier")] }),
    post: protectedOperation({ summary: `Create ${label.slice(0, -1)}`, description: `Creates ${label.slice(0, -1)} with a URL or multipart file.`, parameters: [id("meetingId", "Meeting identifier")], requestBody: uploadBody(schema), status: 201 }),
  };
  paths[`/${resource}`] = {
    get: protectedOperation({ summary: `List ${label}`, description: `Returns ${label} through the flat route.` }),
    post: protectedOperation({ summary: `Create ${label.slice(0, -1)}`, description: `Creates ${label.slice(0, -1)} through the flat route.`, requestBody: uploadBody(schema), status: 201 }),
  };
  paths[`/${resource}/all`] = {
    get: protectedOperation({ summary: `List all ${label}`, description: `Returns all ${label} visible to the authenticated user.` }),
  };
  paths[`/${resource}/{id}`] = crudById(schema, label.slice(0, -1), uploadBody(schema));
};

addResourceRoutes("notes", "ResourceRequest", "notes");
addResourceRoutes("materials", "ResourceRequest", "materials");

Object.assign(paths, {
  "/attendances": {
    get: protectedOperation({ summary: "List attendance", description: "Returns attendance records visible to the authenticated user." }),
    post: protectedOperation({ summary: "Mark attendance", description: "Creates or records attendance; optional evidence is uploaded as multipart `evidence`.", requestBody: uploadBody("AttendanceRequest"), status: 201 }),
  },
  "/attendances/meeting/{meetingId}": {
    get: protectedOperation({ summary: "Get meeting attendance", description: "Returns attendance records for one meeting.", parameters: [id("meetingId", "Meeting identifier")] }),
  },
  "/attendances/meeting/{meetingId}/summary": {
    get: protectedOperation({ summary: "Get attendance summary", description: "Returns attendance totals for one meeting.", parameters: [id("meetingId", "Meeting identifier")] }),
  },
  "/attendances/user/{userId}": {
    get: protectedOperation({ summary: "Get user attendance", description: "Returns attendance records for one user.", parameters: [id("userId", "User identifier")] }),
  },
  "/attendances/{id}": crudById("AttendanceRequest", "attendance", uploadBody("AttendanceRequest")),
  "/task-criteria": crud("Task criteria", "TaskCriteriaRequest", "task criteria"),
  "/task-criteria/{id}": crudById("TaskCriteriaRequest", "task criterion"),
  "/task-criteria/tasks/{taskId}": {
    get: protectedOperation({ summary: "List task criteria", description: "Returns criteria for one task.", parameters: [id("taskId", "Task identifier")] }),
  },
  "/task-criteria/tasks/{taskId}/summary": {
    get: protectedOperation({ summary: "Get task-criteria summary", description: "Returns criterion totals for one task.", parameters: [id("taskId", "Task identifier")] }),
  },
  "/assessment-results": crud("Assessment results", "AssessmentResultRequest", "assessment results"),
  "/assessment-results/{id}": crudById("AssessmentResultRequest", "assessment result"),
  "/assessment-results/submission/{submissionId}": {
    get: protectedOperation({ summary: "Get assessment by submission", description: "Returns the assessment result for one submission.", parameters: [id("submissionId", "Submission identifier")] }),
  },
  "/submission-scores": {
    post: protectedOperation({ summary: "Create submission score", description: "Creates a score for one assessment criterion.", requestBody: body("SubmissionScoreRequest"), status: 201 }),
  },
  "/submission-scores/{id}": crudById("SubmissionScoreRequest", "submission score"),
  "/submission-scores/assessment/{assessmentResultId}": {
    get: protectedOperation({ summary: "List assessment scores", description: "Returns criterion scores for one assessment result.", parameters: [id("assessmentResultId", "Assessment result identifier")] }),
  },
  "/history-classes": {
    get: protectedOperation({ summary: "List class history", description: "Returns archived participant history records." }),
  },
  "/history-classes/summary": {
    get: protectedOperation({ summary: "Get class-history summary", description: "Returns counts by class-history status." }),
  },
  "/history-classes/{id}": {
    get: protectedOperation({ summary: "Get history record", description: "Returns one class-history record.", parameters: [id()] }),
    delete: protectedOperation({ summary: "Delete history record", description: "Deletes one class-history record; Owner only.", parameters: [id()] }),
  },
  "/history-classes/archive/{classId}": {
    post: protectedOperation({ summary: "Archive class", description: "Creates history records for class participants and archives the class.", parameters: [id("classId", "Class identifier")] }),
  },
  "/history-classes/restore/{id}": {
    put: protectedOperation({ summary: "Restore class", description: "Restores the source class and removes its history records.", parameters: [id()] }),
  },
  "/history-classes/{id}/certificate": {
    post: protectedOperation({ summary: "Generate certificate", description: "Generates and stores a PDF certificate for a completed history record.", parameters: [id()] }),
  },
  "/notifications": {
    get: protectedOperation({ summary: "List notifications", description: "Returns notifications for the authenticated user." }),
  },
  "/notifications/summary": {
    get: protectedOperation({ summary: "Get notification summary", description: "Returns unread and total notification counts." }),
  },
  "/notifications/mark-all-read": {
    put: protectedOperation({ summary: "Mark all notifications as read", description: "Marks every notification for the current user as read." }),
  },
  "/notifications/{id}/read": {
    put: protectedOperation({ summary: "Mark notification as read", description: "Marks one notification as read.", parameters: [id()] }),
  },
  "/notifications/read": {
    delete: protectedOperation({ summary: "Delete read notifications", description: "Deletes all read notifications for the current user." }),
  },
  "/notifications/bulk": {
    delete: protectedOperation({ summary: "Delete notifications in bulk", description: "Deletes selected notifications for the current user.", requestBody: body("NotificationBulkDeleteRequest") }),
  },
  "/notifications/{id}": {
    delete: protectedOperation({ summary: "Delete notification", description: "Deletes one notification for the current user.", parameters: [id()] }),
  },
  "/audit-logs": {
    get: protectedOperation({ summary: "List audit logs", description: "Returns audit logs for Owner and Admin users." }),
  },
  "/audit-logs/overview": {
    get: protectedOperation({ summary: "Get audit overview", description: "Returns audit-log summary data." }),
  },
  "/user-activities": {
    get: protectedOperation({ summary: "List user activities", description: "Returns user activity records for Owner and Admin users." }),
  },
  "/user-activities/overview": {
    get: protectedOperation({ summary: "Get user-activity overview", description: "Returns user-activity summary data." }),
  },
  "/reports/dashboard": {
    get: protectedOperation({ summary: "Get reports dashboard", description: "Returns Owner-level reporting metrics." }),
  },
  "/calendar/events": {
    get: protectedOperation({
      summary: "List calendar events",
      description: "Aggregates visible meetings and task deadlines. Query parameters narrow the date range or class.",
      parameters: [
        { name: "start", in: "query", schema: { type: "string", format: "date-time" }, description: "Inclusive start date." },
        { name: "end", in: "query", schema: { type: "string", format: "date-time" }, description: "Inclusive end date." },
        { name: "classId", in: "query", schema: { type: "integer" }, description: "Optional class identifier." },
      ],
    }),
  },
});

const tagForPath = (path) => {
  if (path === "/" || path.startsWith("/auth")) return "Authentication";
  if (path.startsWith("/users") || path.startsWith("/mentors") || path.startsWith("/mentees")) return "Users";
  if (path.startsWith("/classes")) return "Classes";
  if (path.startsWith("/meetings") || path.startsWith("/tasks") || path.startsWith("/notes") || path.startsWith("/materials") || path.startsWith("/calendar")) return "Learning";
  if (path.startsWith("/attendances") || path.startsWith("/task-criteria") || path.startsWith("/assessment-results") || path.startsWith("/submission-scores") || path.startsWith("/history-classes")) return "Assessment";
  return "Operations";
};

Object.entries(paths).forEach(([path, pathItem]) => {
  Object.values(pathItem).forEach((operation) => {
    operation.tags = [tagForPath(path)];
  });
});

module.exports = {
  openapi: "3.0.3",
  info: {
    title: "Orange LMS API",
    version: "4.0.0",
    description: "Orange LMS V4 API. Successful responses use `{ success, message, data }`; errors use `{ success: false, message, data: null }`.",
  },
  servers: [{ url: "/api", description: "Current API server" }],
  tags: [
    { name: "Authentication" }, { name: "Users" }, { name: "Classes" },
    { name: "Learning" }, { name: "Assessment" }, { name: "Operations" },
  ],
  paths,
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Send `Authorization: Bearer <access_token>` after login." },
    },
    schemas: {
      SuccessResponse: { type: "object", required: ["success", "message", "data"], properties: { success: { type: "boolean", example: true }, message: { type: "string", example: "Request successful" }, data: { nullable: true, description: "Endpoint payload." } } },
      ErrorResponse: { type: "object", required: ["success", "message", "data"], properties: { success: { type: "boolean", example: false }, message: { type: "string", example: "Unauthorized" }, data: { nullable: true, example: null }, errors: { type: "array", items: { type: "string" } } } },
      LoginRequest: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email", example: "mentor@example.com" }, password: { type: "string", format: "password", example: "SecurePass123" } } },
      RegisterRequest: { type: "object", required: ["name", "email", "password"], properties: { name: { type: "string", example: "Jane Doe" }, email: { type: "string", format: "email" }, password: { type: "string", format: "password" }, role: { type: "string", enum: ["Owner", "Admin", "Mentor", "Mentee"], default: "Mentee" } } },
      UserRequest: { type: "object", properties: { name: { type: "string" }, email: { type: "string", format: "email" }, password: { type: "string", format: "password" }, role: { type: "string", enum: ["Owner", "Admin", "Mentor", "Mentee"] }, avatarUrl: { type: "string", format: "uri" }, status: { type: "string" } } },
      ProfileRequest: { type: "object", properties: { phone: { type: "string" }, address: { type: "string" }, city: { type: "string" }, country: { type: "string" }, background: { type: "string" } } },
      ClassRequest: { type: "object", required: ["code", "name"], properties: { code: { type: "string", example: "FS-2026-01" }, name: { type: "string" }, description: { type: "string" }, category: { type: "string" }, level: { type: "string" }, MentorId: { type: "integer" }, startDate: { type: "string", format: "date-time" }, endDate: { type: "string", format: "date-time" }, status: { type: "string" }, imageUrl: { type: "string", format: "uri" } } },
      MeetingRequest: { type: "object", required: ["ClassId", "name", "meetingDate"], properties: { ClassId: { type: "integer" }, meetingNumber: { type: "integer" }, name: { type: "string" }, description: { type: "string" }, meetingDate: { type: "string", format: "date-time" }, startHour: { type: "string", example: "19:00" }, finishHour: { type: "string", example: "21:00" }, imageUrl: { type: "string", format: "uri" } } },
      TaskRequest: { type: "object", properties: { ClassId: { type: "integer" }, MeetingId: { type: "integer" }, name: { type: "string" }, description: { type: "string" }, dueDate: { type: "string", format: "date-time" }, maxScore: { type: "number" }, status: { type: "string" }, fileUrl: { type: "string", format: "uri" }, file: { type: "string", format: "binary", description: "Use multipart/form-data when uploading a file." } } },
      ResourceRequest: { type: "object", properties: { ClassId: { type: "integer" }, MeetingId: { type: "integer" }, name: { type: "string" }, description: { type: "string" }, fileUrl: { type: "string", format: "uri" }, file: { type: "string", format: "binary" } } },
      TaskSubmissionRequest: { type: "object", properties: { submissionUrl: { type: "string", format: "uri" }, submittedNote: { type: "string" }, submissionFileUrl: { type: "string", format: "uri" } } },
      SubmissionReviewRequest: { type: "object", properties: { score: { type: "number" }, feedback: { type: "string" }, status: { type: "string" } } },
      AttendanceRequest: { type: "object", required: ["MeetingId", "UserId", "status"], properties: { MeetingId: { type: "integer" }, UserId: { type: "integer" }, status: { type: "string", enum: ["Present", "Late", "Absent", "Excused", "Sick"] }, notes: { type: "string" }, evidence: { type: "string", format: "binary" } } },
      TaskCriteriaRequest: { type: "object", required: ["TaskId", "name", "maxScore"], properties: { TaskId: { type: "integer" }, name: { type: "string" }, description: { type: "string" }, maxScore: { type: "number" } } },
      AssessmentResultRequest: { type: "object", properties: { TaskSubmissionId: { type: "integer" }, finalScore: { type: "number" }, feedback: { type: "string" }, status: { type: "string" } } },
      SubmissionScoreRequest: { type: "object", properties: { AssessmentResultId: { type: "integer" }, TaskCriteriaId: { type: "integer" }, score: { type: "number" }, feedback: { type: "string" } } },
      EnrollmentRequest: { type: "object", required: ["UserId"], properties: { UserId: { type: "integer" } } },
      BulkEnrollmentRequest: { type: "object", required: ["UserIds"], properties: { UserIds: { type: "array", items: { type: "integer" } } } },
      MentorAssignmentRequest: { type: "object", required: ["MentorId"], properties: { MentorId: { type: "integer" } } },
      NotificationBulkDeleteRequest: { type: "object", required: ["ids"], properties: { ids: { type: "array", minItems: 1, items: { type: "integer" } } } },
    },
  },
};
