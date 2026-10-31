# Orange LMS Server

Orange LMS Server is an Express API for role-based learning management. It uses
Sequelize with PostgreSQL, JWT authentication, permission-based authorization,
and Cloudinary-backed uploads.

## Product-version scope

| Version | Server delivery |
| --- | --- |
| V1 | Authentication, role-aware authorization, user/profile management, and application foundation. |
| V2 | Classes, class membership, meetings, tasks, notes, and materials. |
| V3 | Task submissions, attendance, rubrics, assessment results, criterion scores, and class history. |
| V4 | Cloudinary upload processing, certificate generation, calendar event aggregation, notifications, audit and activity records, reports, response-contract normalization, and Jest/Supertest coverage. |

Calendar is delivered through the `v4-calendar-*` branch line. Dashboard
Analytics begins the V5 roadmap.

## Architecture

```txt
Routes -> Controllers -> Services -> Models -> PostgreSQL
```

| Layer | Responsibility |
| --- | --- |
| `routes/` | API endpoints, authentication, and authorization middleware. |
| `controllers/` | HTTP request and response orchestration. |
| `services/` | Role-aware business rules and data operations. |
| `models/` and `migrations/` | Sequelize mappings and versioned PostgreSQL schema. |
| `middlewares/` | Request metadata, error handling, and Cloudinary upload processing. |

## Modules

| Area | Version | Modules |
| --- | --- | --- |
| Foundation | V1 | Auth, users, profiles, mentors, mentees, role permissions, and shared middleware. |
| Learning | V2 | Classes, class users, meetings, tasks, notes, and materials. |
| Assessment | V3 | Task submissions, attendance, criteria, assessment results, submission scores, and class history. |
| Delivery and operations | V4 | Cloudinary upload middleware, certificate generation, calendar event aggregation, notifications, audit logs, user activities, reports, and API tests. |

## Local setup

```bash
npm install
npm run db:setup
npm run dev
```

Create `.env` from `.env.example` and supply your local database, JWT, and
Cloudinary values. The local PostgreSQL host is `localhost:1000`; the API keeps
using `PORT=5000` and exposes endpoints below `/api`.

Production uses `DATABASE_URL` with PostgreSQL SSL, suitable for Supabase.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the API in development mode with Nodemon. |
| `npm start` | Run the production API. |
| `npm test` | Run API integration tests with Jest and Supertest. |
| `npm run db:create` | Create the active environment database. |
| `npm run db:migrate` | Apply pending migrations. |
| `npm run db:seed` | Load seed data. |
| `npm run db:seed:undo` | Undo the most recent seed. |
| `npm run db:setup` | Create, migrate, and seed the database. |
| `npm run db:migrate:prod` | Apply migrations with production configuration. |

## Uploads

Task, note, and material create/update endpoints accept either `fileUrl` or a
single `file` multipart field. Uploaded files go directly to Cloudinary; the
database stores only the resulting URL. The allowed extensions are JPG, JPEG,
PNG, PDF, DOC, DOCX, PPT, PPTX, and Markdown, with a 5 MB limit.

## Response contract

Every endpoint returns `{ success, message, data }`. Failed responses use
`success: false` and `data: null`; validation failures include `errors`.

## Testing

The test suite uses Jest and Supertest to verify the API response contract
without requiring a running PostgreSQL instance. It covers the health check,
unauthenticated protected routes, and unknown routes.

See the [server documentation index](docs/README.md) for the API contract,
RBAC matrix, business flow, and schema reference.
