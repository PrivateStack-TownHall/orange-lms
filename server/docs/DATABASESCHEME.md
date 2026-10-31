# Database Schema

PostgreSQL is managed by Sequelize migrations. The canonical schema is the set
of files in `src/migrations/`; models in `src/models/` describe the runtime ORM
mapping.

| Table/model | Relationships and responsibility |
| --- | --- |
| Users, Profiles | A user has one profile; users carry role, avatar URL, and active status. |
| Classes, ClassUsers | Classes represent programs; `ClassUsers` records membership, role in class, progress, and status. |
| Meetings | A meeting belongs to a class and contains learning resources. |
| Tasks, TaskSubmissions | A task belongs to a meeting; submissions belong to a task and a user. |
| Notes, Materials | Resources belong to a class and meeting; file URLs are stored as strings. |
| Attendances | One attendance record connects a meeting and user. |
| TaskCriterias, AssessmentResults, SubmissionCriteriaScores | Rubric definition, final assessment, and per-criterion score. |
| HistoryClasses | Preserved participant/class history, final score, attendance percentage, and certificate URL. |
| Notifications, AuditLogs, UserActivities | Operational and user activity records. |

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
