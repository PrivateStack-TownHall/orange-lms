# Orange LMS UI

Orange LMS UI is a React 19 application built with Vite, Tailwind CSS, Redux
Toolkit, React Router, Axios, Framer Motion, and Lucide React.

## Product-version scope

| Version | UI delivery |
| --- | --- |
| V1 | Authentication screens, role-aware dashboard layout, people management, profile, settings, and Not Found pages. |
| V2 | Class, meeting, task, note, and material experiences. |
| V3 | Submission, attendance, task-criteria, assessment-result, scoring, and class-history experiences. |
| V4 | Upload and certificate flows, completed assessment pages, calendar, notification center, audit/activity pages, reports, response-contract alignment, and performance improvements. |

Calendar is delivered through the `v4-calendar-*` branch line. Dashboard
Analytics begins the V5 roadmap.

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

| Area | Version | Coverage |
| --- | --- | --- |
| Foundation | V1 | Login, dashboard shell, users, profile, admins, mentors, mentees, settings, and access handling. |
| Learning | V2 | Classes, meetings, tasks, notes, and materials. |
| Assessment | V3 | Submissions, attendance, task criteria, grading, results, scores, and history routes. |
| Delivery and operations | V4 | File uploads, certificates, calendar, notifications, audit logs, user activity, reports, consistent API data handling, and performance work. |

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
