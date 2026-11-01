# API Contract

> V4 reference. The response contract applies to every V1–V4 API route.

Base URL: `/api`

`/api/auth` is public. All other route groups require a bearer token.

## Response contract

Every endpoint returns the same top-level structure.

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

Failed requests return `success: false` and `data: null`. Validation failures
also include an `errors` array. The frontend Axios client unwraps successful
`data` automatically, preserving the existing service and page APIs. This
contract was standardized in V4 and applies to V1–V4 routes.

## Interactive reference

Swagger UI is served at `/api/docs`; the raw OpenAPI 3.0 document is available
at `/api/openapi.json`. Authenticate protected operations with the JWT returned
by `/api/auth/login`, using the `Authorization: Bearer <access_token>` header.
The Swagger request schemas show both JSON URL fields and multipart upload
fields where the endpoint accepts a Cloudinary-backed file.

| Route group | Version | Primary purpose |
| --- | --- | --- |
| `/auth` | V1 | Registration, login, and current user. |
| `/users`, `/mentors`, `/mentees` | V1 | User and role-specific management. |
| `/classes` | V2 | Class CRUD, mentor assignment, enrollment, and class users. |
| `/classes/:classId/meetings`, `/meetings` | V2 | Nested and flat meeting access. |
| `/meetings/:meetingId/tasks`, `/tasks` | V2 | Task CRUD, submission, review, and submission details. |
| `/meetings/:meetingId/notes`, `/notes` | V2 | Notes CRUD. |
| `/meetings/:meetingId/materials`, `/materials` | V2 | Materials CRUD. |
| `/attendances` | V3 | Attendance records and meeting summaries. |
| `/task-criteria`, `/assessment-results`, `/submission-scores` | V3 | Assessment and rubric workflow. |
| `/history-classes` | V3 | Archiving and restoring completed classes. |
| `/history-classes/:id/certificate` | V4 | Generate and store a completion certificate. |
| `/notifications`, `/audit-logs`, `/user-activities`, `/reports` | V4 | Operational monitoring and communication. |

## Upload requests

Task, note, and material create/update endpoints accept either JSON with a
`fileUrl` or `multipart/form-data` with a single `file` field. The latter is
uploaded to Cloudinary. File uploads are limited to 5 MB.
