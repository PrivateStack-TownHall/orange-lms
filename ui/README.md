# Orange LMS UI

Orange LMS UI is a React 19 application built with Vite, Tailwind CSS, Redux
Toolkit, React Router, Axios, Framer Motion, and Lucide React.

## Local setup

```bash
npm install
npm run dev
```

The development UI runs on `http://localhost:5250` and connects to the API at
`http://localhost:5000/api`. Those values live in `.env.development`; use
`.env.example` as the clean starting point for a new environment.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Produce a production build in `dist/`. |
| `npm run preview` | Preview the production build. |
| `npm run lint` | Run ESLint. |

## Feature areas

| Area | Coverage |
| --- | --- |
| Core | Login, dashboard, users, profile, admins, mentors, and mentees. |
| Learning | Classes, meetings, tasks, submissions, notes, and materials. |
| Assessment | Attendance integration, task criteria, grading, results, and history routes. |
| Operations | Notifications, audit logs, user activity, reports, and settings. |

## Reusable components

The UI already has a shared component system and pages consistently consume it.

| Component group | Examples |
| --- | --- |
| Forms | `Form`, `FormField`, `TextInput`, `Select`, `FileInput`, and `DateInput`. |
| Data display | `Table`, `Pagination`, `TableControls`, `StatusBadge`, and `Avatar`. |
| Layout | `PageHeader`, `Breadcrumbs`, `Tabs`, `StatsGrid`, `Sidebar`, and `TopBar`. |
| Feedback | Loading components, popups, toasts, and empty states. |

Page-specific components should be introduced only when a shared component does
not fit the workflow; reusable improvements belong in `src/components/ui/`.

## Performance

- Vite separates React, UI, and chart dependencies into cacheable vendor chunks.
- Role dashboards, reports, and learning pages load only when their route is
  opened; the entry bundle is therefore kept focused on application chrome.
- The main layout memoizes stable children and callbacks to reduce avoidable
  navigation re-renders.
- Theme initialization applies the saved preference before the application
  renders, and dark utilities now use the `.dark` class consistently.
