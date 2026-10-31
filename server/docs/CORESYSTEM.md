# Core System

Orange LMS is organized as a layered Express application:

```txt
Routes -> Controllers -> Services -> Models -> PostgreSQL
```

| Domain | Main entities | Purpose |
| --- | --- | --- |
| Identity | User, Profile | Authentication, accounts, roles, and profile data. |
| Learning structure | Class, ClassUser, Meeting | Classes, enrollment/assignment, and scheduled sessions. |
| Learning content | Task, Note, Material | Assignments and resources attached to meetings. |
| Assessment | TaskSubmission, TaskCriteria, AssessmentResult, SubmissionCriteriaScore, Attendance, HistoryClass | Submission, rubric scoring, attendance, completion, and history. |
| Operations | Notification, AuditLog, UserActivity | User communication, system auditability, and activity tracking. |

## Shared rules

- Authentication uses JWT and attaches the decoded user to `req.user`.
- Authorization checks a resource/action permission matrix.
- Services enforce role-aware business rules before database changes.
- Files are uploaded to Cloudinary; PostgreSQL stores the returned URL only.
- Class membership and progress are represented by `ClassUser`.
