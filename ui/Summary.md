# Orange LMS Frontend Summary

Orange LMS is a React-based interface for four roles: Owner, Admin, Mentor, and
Mentee. It depends on the Express API in `../server` for all application data.

## Current modules

| Area | Coverage |
| --- | --- |
| Core | Login, role-aware dashboard, users, profiles, admins, mentors, and mentees. |
| Learning | Classes, meetings, tasks, submissions, notes, and materials. |
| Assessment | Task criteria, submission grading, attendance integration, and assessment route modules. |
| Operations | Notifications, audit logs, user activity, reports, and settings. |

## Run locally

```bash
npm install
npm run dev
```

Use `.env.development` for local values. The minimum frontend connection is:

```env
VITE_API_URL=http://localhost:5000/api
```

`VITE_PORT` is optional. If it is omitted, Vite serves the application on port
`5173`; otherwise it uses the configured value.

## Application structure

| Location | Responsibility |
| --- | --- |
| `src/app/routes/` | Modular routes plus public, protected, and role guards. |
| `src/app/store/` | Redux store and authentication state. |
| `src/pages/` | Page-level feature implementation. |
| `src/services/` | Axios client and API services per feature. |
| `src/components/` | Reusable layout, input, form, table, popup, and status components. |

## Validation commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Generate and verify the production bundle. |
| `npm run lint` | Run ESLint checks. |
| `npm run preview` | Serve the production bundle locally. |

See [README.md](README.md) for setup and environment details.
