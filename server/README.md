# Orange LMS Server

Orange LMS Server is an Express API for role-based learning management. It uses
Sequelize with PostgreSQL, JWT authentication, permission-based authorization,
and Cloudinary-backed uploads.

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

| Area | Modules |
| --- | --- |
| Core | Auth, users, profiles, mentors, mentees, classes, class users, and meetings. |
| Learning | Tasks, submissions, notes, materials, and file uploads. |
| Assessment | Attendance, criteria, assessment results, submission scores, and class history. |
| Operations | Notifications, audit logs, user activities, and reports. |

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

See `docs/` for the API contract, RBAC matrix, business flow, and schema
reference.
