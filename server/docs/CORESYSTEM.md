# Core System

> V4 reference. This document is cumulative and includes the stable V1–V3
> capabilities that V4 builds upon.

Orange LMS is organized as a layered Express application:

```txt
Routes -> Controllers -> Services -> Models -> PostgreSQL
```

## Version context

| Version | System responsibility |
| --- | --- |
| V1 | Authentication, authorization, users, profiles, and role-aware access. |
| V2 | Classes, membership, meetings, and learning resources. |
| V3 | Submissions, assessment, attendance, and class-history records. |
| V4 | Cloudinary delivery, certificates, notifications, operational records, reports, and API quality controls. |

V4 is cumulative: its system includes the stable capabilities delivered in
V1–V3.

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
