# Orange LMS

Orange LMS is a role-based learning management system for Owners, Admins,
Mentors, and Mentees. The repository contains a React frontend and an Express
API backed by PostgreSQL through Sequelize.

## Product versions

The version number describes a completed product stage. It is not tied to an
individual repository folder or package version.

| Version | Status | Delivered scope |
| --- | --- | --- |
| V1 | Stable | Authentication, authorization, users, profiles, role-based dashboard shell, settings, and Not Found handling. |
| V2 | Stable | Learning management: classes, enrollment, meetings, tasks, notes, and materials. |
| V3 | Stable | Assessment engine: submissions, criteria, criterion scores, assessment results, attendance, and class history. |
| V4 | Current | Cloudinary uploads, certificate generation, completed assessment screens, calendar scheduling, notifications, audit logs, user activity, reports, consistent API responses, and automated API contract tests. |

Calendar is delivered through the `v4-calendar-*` branch line. Dashboard
Analytics starts the V5 roadmap.

## Repository layout

| Path | Purpose |
| --- | --- |
| `README.md` | Repository overview, product-version map, and documentation index. |
| `server/` | REST API, authorization, business logic, migrations, seeders, and Cloudinary upload integration. |
| `ui/` | React/Vite application, route guards, Redux state, API services, and reusable UI components. |
| `server/docs/` | Backend [documentation index](server/docs/README.md), architecture, business-flow, RBAC, API-contract, and database-schema references. |

## Modules

| Area | Version | Features |
| --- | --- | --- |
| Foundation | V1 | Authentication, authorization, users, profiles, role-aware navigation, settings, and dashboard layout. |
| Learning | V2 | Classes, enrollment, meetings, tasks, notes, and materials. |
| Assessment | V3 | Task submissions, attendance, task criteria, assessment results, submission criteria scores, and class history. |
| Delivery and operations | V4 | Cloudinary uploads, certificates, calendar scheduling, notifications, audit logs, user activities, reports, response contract, and API tests. |

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

| Area | Documents |
| --- | --- |
| Server | [Guide](server/README.md), [changelog](server/CHANGELOG.md), [documentation index](server/docs/README.md), [core system](server/docs/CORESYSTEM.md), [business flow](server/docs/BUSINESSFLOW.md), [RBAC](server/docs/RBAC.md), [API contract](server/docs/APICONTRACT.md), and [database schema](server/docs/DATABASESCHEME.md). |
| UI | [Guide](ui/README.md), [summary](ui/Summary.md), and [changelog](ui/CHANGELOG.md). |
