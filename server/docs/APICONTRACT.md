# API Contract

Base URL: `/api`

`/api/auth` is public. All other route groups require a bearer token.

| Route group | Primary purpose |
| --- | --- |
| `/auth` | Registration, login, and current user. |
| `/users`, `/mentors`, `/mentees` | User and role-specific management. |
| `/classes` | Class CRUD, mentor assignment, enrollment, and class users. |
| `/classes/:classId/meetings`, `/meetings` | Nested and flat meeting access. |
| `/meetings/:meetingId/tasks`, `/tasks` | Task CRUD, submission, review, and submission details. |
| `/meetings/:meetingId/notes`, `/notes` | Notes CRUD. |
| `/meetings/:meetingId/materials`, `/materials` | Materials CRUD. |
| `/attendances` | Attendance records and meeting summaries. |
| `/task-criteria`, `/assessment-results`, `/submission-scores` | Assessment and rubric workflow. |
| `/history-classes` | Archiving and restoring completed classes. |
| `/notifications`, `/audit-logs`, `/user-activities`, `/reports` | Operational monitoring and communication. |

## Upload requests

Task, note, and material create/update endpoints accept either JSON with a
`fileUrl` or `multipart/form-data` with a single `file` field. The latter is
uploaded to Cloudinary. File uploads are limited to 5 MB.
