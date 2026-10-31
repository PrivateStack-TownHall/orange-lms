# Orange LMS V4 Schema Reference

This document is a quick reference for the Sequelize models and migrations in
`src/`. Existing schema changes must be created as migrations; model generator
commands are not used to modify the running database.

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
