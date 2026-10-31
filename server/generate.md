# Orange LMS V4 Schema Reference

This document is a quick reference for the Sequelize models and migrations in
`src/`. Existing schema changes must be created as migrations; model generator
commands are not used to modify the running database.

## Version ownership

The V4 schema is cumulative: it contains the tables introduced across the
product's earlier stages and the operational tables completed in V4.

| Version | Schema scope |
| --- | --- |
| V1 | `User`, `Profile`, role and account data. |
| V2 | `Class`, `ClassUser`, `Meeting`, `Task`, `Note`, and `Material`. |
| V3 | `TaskSubmission`, `Attendance`, `TaskCriteria`, `AssessmentResult`, `SubmissionCriteriaScore`, and `HistoryClass`. |
| V4 | `Notification`, `AuditLog`, `UserActivity`, and URL fields used by Cloudinary uploads and generated certificates. |

| Group | Models |
| --- | --- |
| Identity | User, Profile |
| Learning structure | Class, ClassUser, Meeting |
| Learning content | Task, TaskSubmission, Note, Material |
| Assessment | Attendance, TaskCriteria, AssessmentResult, SubmissionCriteriaScore, HistoryClass |
| Operations | Notification, AuditLog, UserActivity |

## Relationship map

| Source | Relationship | Target |
| --- | --- | --- |
| User | has one | Profile |
| Class | has many | Meeting, Task, Note, Material, ClassUser |
| User and Class | many-to-many through | ClassUser |
| Meeting | has many | Task, Note, Material |
| Task | has many | TaskSubmission and TaskCriteria |
| TaskSubmission | has one | AssessmentResult |
| AssessmentResult | has many | SubmissionCriteriaScore |

## URL fields

| Model | Field |
| --- | --- |
| User | `avatarUrl` |
| Class, Meeting | `imageUrl` |
| Task, Note, Material | `fileUrl` |
| TaskSubmission | `submissionUrl`, `submissionFileUrl` |
| HistoryClass | `certificateUrl` |

## Database commands

```bash
npm run db:migrate
npm run db:seed
npm run db:migrate:prod
```
