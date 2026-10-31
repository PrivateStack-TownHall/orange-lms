# Orange LMS Backend

Express 5 API for Orange LMS. The backend uses PostgreSQL with Sequelize,
JWT-based authentication, resource/action RBAC, and Cloudinary for persistent
file uploads.

## Architecture

```txt
Routes -> Controllers -> Services -> Sequelize Models -> PostgreSQL
```

Cross-cutting concerns live in `middlewares/` (authentication, authorization,
request metadata, upload, and error handling) and `helpers/`.

## Functional modules

| Group | Modules |
| --- | --- |
| Core | Auth, users, profiles, mentors, mentees, classes, class users, meetings. |
| Learning | Tasks, task submissions, notes, materials, and uploads. |
| Assessment | Attendance, task criteria, assessment results, submission criteria scores, history classes. |
| Operations | Notifications, audit logs, user activities, and reports. |

## Requirements

- Node.js 20+.
- PostgreSQL for development and test.
- A Cloudinary account for file uploads.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env`, then supply local PostgreSQL values, JWT values,
and Cloudinary credentials. Never commit `.env` or real credentials.

For production, set `NODE_ENV=production`, `DATABASE_URL`, and `DB_SSL=true`.
The production Sequelize configuration expects a PostgreSQL connection string,
which is suitable for Supabase.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API in development mode with Nodemon. |
| `npm start` | Start the API in production mode. |
| `npm run db:migrate:dev` | Run migrations against the development database. |
| `npm run db:seed:dev` | Seed the development database. |
| `npm run db:migrate:test` | Run migrations against the test database. |
| `npm run db:migrate:prod` | Run migrations against the production database. |
| `npm run db:setup` | Create, migrate, and seed the active database environment. |

## Uploads

Multer streams a single `file` field through Cloudinary. Task, note, and
material create/update routes also accept a direct URL through `fileUrl`.
Cloudinary URLs, rather than local files, are stored in PostgreSQL.

Allowed upload extensions are JPG, JPEG, PNG, PDF, DOC, DOCX, PPT, PPTX, and
Markdown. The maximum file size is 5 MB.

## API base URL

All routes are mounted under `/api`. `/api/auth` is public; all other route
groups require a valid JWT. See [docs/APICONTRACT.md](docs/APICONTRACT.md) for
the route groups and [docs/RBAC.md](docs/RBAC.md) for access rules.
