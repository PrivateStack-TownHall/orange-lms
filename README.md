# Orange LMS

Orange LMS is a role-based learning management system for Owners, Admins,
Mentors, and Mentees. The repository contains a React frontend and an Express
API backed by PostgreSQL through Sequelize.

## Repository layout

| Path | Purpose |
| --- | --- |
| `server/` | REST API, authorization, business logic, migrations, seeders, and Cloudinary upload integration. |
| `ui/` | React/Vite application, route guards, Redux state, API services, and reusable UI components. |
| `docs/` | Product and design-system documentation. |
| `documentations/` | Project imagery and visual assets. |

## Modules

| Area | Features |
| --- | --- |
| Core | Authentication, users, profiles, mentors, mentees, classes, meetings, and enrollment. |
| Learning | Tasks, task submissions, notes, materials, and Cloudinary-backed file uploads. |
| Assessment | Attendance, task criteria, assessment results, submission criteria scores, and class history. |
| Operations | Notifications, audit logs, user activities, and reports. |

## Roles

| Role | Primary responsibility |
| --- | --- |
| Owner | Full administration, including sensitive operational data. |
| Admin | User and learning-program administration. |
| Mentor | Delivery of learning content, attendance, and assessment. |
| Mentee | Participation, resource access, task submission, and grade access. |

## Local development

1. Configure and start the API from `server/`; see [server/README.md](server/README.md).
2. Start the client from `ui/`; see [ui/README.md](ui/README.md).
3. The frontend API URL must point to the backend `/api` base URL.

## Documentation

- [Backend guide](server/README.md)
- [Frontend guide](ui/README.md)
- [Core system](server/docs/CORESYSTEM.md)
- [Business flow](server/docs/BUSINESSFLOW.md)
- [RBAC](server/docs/RBAC.md)
- [API contract](server/docs/APICONTRACT.md)
- [Database schema](server/docs/DATABASESCHEME.md)
