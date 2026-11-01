const request = require("supertest");
const app = require("../src/app");

const protectedOperations = [
  ["get", "/api/auth/me"], ["post", "/api/auth/logout"],
  ["get", "/api/users"], ["post", "/api/users"], ["get", "/api/users/1"], ["put", "/api/users/1"], ["delete", "/api/users/1"], ["get", "/api/users/1/profile"], ["put", "/api/users/1/profile"],
  ["get", "/api/mentors"], ["post", "/api/mentors"], ["get", "/api/mentors/1"], ["put", "/api/mentors/1"], ["delete", "/api/mentors/1"], ["get", "/api/mentors/1/profile"], ["put", "/api/mentors/1/profile"],
  ["get", "/api/mentees"], ["post", "/api/mentees"], ["get", "/api/mentees/1"], ["put", "/api/mentees/1"], ["delete", "/api/mentees/1"], ["get", "/api/mentees/1/profile"], ["put", "/api/mentees/1/profile"],
  ["get", "/api/classes"], ["post", "/api/classes"], ["get", "/api/classes/1"], ["put", "/api/classes/1"], ["delete", "/api/classes/1"], ["post", "/api/classes/1/enrollMentee"], ["post", "/api/classes/1/enrollMentees"], ["delete", "/api/classes/1/mentees/7"], ["post", "/api/classes/1/assign-mentor"], ["post", "/api/classes/1/assign-reviewer"], ["delete", "/api/classes/1/reviewers/7"], ["get", "/api/classes/1/users"], ["get", "/api/classes/1/mentees"], ["get", "/api/classes/1/mentor"], ["get", "/api/classes/1/reviewers"],
  ["post", "/api/classes/from-blueprint"],
  ["get", "/api/course-blueprints"], ["post", "/api/course-blueprints"], ["get", "/api/course-blueprints/1"], ["put", "/api/course-blueprints/1"], ["delete", "/api/course-blueprints/1"], ["post", "/api/course-blueprints/1/meetings"], ["put", "/api/course-blueprints/meetings/1"], ["delete", "/api/course-blueprints/meetings/1"], ["post", "/api/course-blueprints/meetings/1/materials"], ["put", "/api/course-blueprints/materials/1"], ["delete", "/api/course-blueprints/materials/1"], ["post", "/api/course-blueprints/meetings/1/tasks"], ["put", "/api/course-blueprints/tasks/1"], ["delete", "/api/course-blueprints/tasks/1"],
  ["get", "/api/classes/1/meetings"], ["post", "/api/classes/1/meetings"], ["get", "/api/meetings"], ["post", "/api/meetings"], ["get", "/api/meetings/all"], ["get", "/api/meetings/1"], ["put", "/api/meetings/1"], ["delete", "/api/meetings/1"],
  ["get", "/api/meetings/1/tasks"], ["post", "/api/meetings/1/tasks"], ["get", "/api/tasks"], ["post", "/api/tasks"], ["get", "/api/tasks/all"], ["get", "/api/tasks/1"], ["put", "/api/tasks/1"], ["delete", "/api/tasks/1"], ["post", "/api/tasks/1/submit"], ["get", "/api/tasks/1/submissions"], ["get", "/api/tasks/submissions/1"], ["put", "/api/tasks/submissions/1"], ["put", "/api/tasks/submissions/1/review"],
  ["get", "/api/meetings/1/notes"], ["post", "/api/meetings/1/notes"], ["get", "/api/notes"], ["post", "/api/notes"], ["get", "/api/notes/all"], ["get", "/api/notes/1"], ["put", "/api/notes/1"], ["delete", "/api/notes/1"],
  ["get", "/api/meetings/1/materials"], ["post", "/api/meetings/1/materials"], ["get", "/api/materials"], ["post", "/api/materials"], ["get", "/api/materials/all"], ["get", "/api/materials/1"], ["put", "/api/materials/1"], ["delete", "/api/materials/1"],
  ["get", "/api/attendances"], ["post", "/api/attendances"], ["get", "/api/attendances/meeting/1"], ["get", "/api/attendances/meeting/1/summary"], ["get", "/api/attendances/user/7"], ["get", "/api/attendances/1"], ["put", "/api/attendances/1"], ["delete", "/api/attendances/1"],
  ["get", "/api/task-criteria"], ["post", "/api/task-criteria"], ["get", "/api/task-criteria/tasks/1"], ["get", "/api/task-criteria/tasks/1/summary"], ["get", "/api/task-criteria/1"], ["put", "/api/task-criteria/1"], ["delete", "/api/task-criteria/1"],
  ["get", "/api/assessment-results"], ["post", "/api/assessment-results"], ["get", "/api/assessment-results/1"], ["put", "/api/assessment-results/1"], ["delete", "/api/assessment-results/1"], ["get", "/api/assessment-results/submission/1"],
  ["post", "/api/submission-scores"], ["get", "/api/submission-scores/assessment/1"], ["get", "/api/submission-scores/1"], ["put", "/api/submission-scores/1"], ["delete", "/api/submission-scores/1"],
  ["get", "/api/history-classes"], ["get", "/api/history-classes/summary"], ["get", "/api/history-classes/1"], ["post", "/api/history-classes/archive/1"], ["put", "/api/history-classes/restore/1"], ["post", "/api/history-classes/1/certificate"], ["delete", "/api/history-classes/1"],
  ["get", "/api/notifications"], ["get", "/api/notifications/summary"], ["put", "/api/notifications/mark-all-read"], ["put", "/api/notifications/1/read"], ["delete", "/api/notifications/read"], ["delete", "/api/notifications/bulk"], ["delete", "/api/notifications/1"],
  ["get", "/api/audit-logs"], ["get", "/api/audit-logs/overview"], ["get", "/api/user-activities"], ["get", "/api/user-activities/overview"], ["get", "/api/reports/dashboard"], ["get", "/api/calendar/events"],
];

describe("protected endpoint matrix", () => {
  it.each(protectedOperations)("%s %s rejects unauthenticated access", async (method, path) => {
    const response = await request(app)[method](path);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Unauthorized",
      data: null,
    });
  });
});
