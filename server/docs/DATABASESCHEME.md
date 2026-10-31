# Database Schema

> V4 reference. The schema is cumulative; use migrations for every database
> change.

PostgreSQL is managed by Sequelize migrations. The canonical schema is the set
of files in `src/migrations/`; models in `src/models/` describe the runtime ORM
mapping.

| Table/model | Version | Relationships and responsibility |
| --- | --- | --- |
| Users, Profiles | V1 | A user has one profile; users carry role, avatar URL, and active status. |
| Classes, ClassUsers | V2 | Classes represent programs; `ClassUsers` records membership, role in class, progress, and status. |
| Meetings | V2 | A meeting belongs to a class and contains learning resources. |
| Tasks, Notes, Materials | V2 | Learning resources belong to a class and meeting; file URLs are stored as strings. |
| TaskSubmissions | V3 | A submission belongs to a task and a user. |
| Attendances | V3 | One attendance record connects a meeting and user. |
| TaskCriterias, AssessmentResults, SubmissionCriteriaScores | V3 | Rubric definition, final assessment, and per-criterion score. |
| HistoryClasses | V3 | Preserved participant/class history, final score, attendance percentage, and certificate URL. |
| Notifications, AuditLogs, UserActivities | V4 | Operational and user activity records. |

## URL-bearing fields

| Entity | URL field purpose |
| --- | --- |
| User | Avatar URL. |
| Class, Meeting | Cover image URL. |
| Task, Note, Material | Learning resource URL. |
| TaskSubmission | Submitted link and/or uploaded-file URL. |
| HistoryClass | Generated certificate URL. |

Use migrations for all schema changes. Do not use `sequelize.sync()` against
shared or production databases.
