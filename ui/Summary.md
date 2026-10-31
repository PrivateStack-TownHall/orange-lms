# Orange LMS UI V4 Summary

The frontend supports four roles: Owner, Admin, Mentor, and Mentee. It consumes
the REST API in `../server` and uses shared components, route guards, and API
services to keep modules consistent.

| Layer | Location | Purpose |
| --- | --- | --- |
| Application | `src/app/` | Router, guards, Redux store, and popup provider. |
| Features | `src/pages/` | Role-aware learning and operational pages. |
| API | `src/services/` | Axios instance, endpoints, and module services. |
| Shared UI | `src/components/` | Reusable forms, inputs, tables, feedback, navigation, and layout. |
| Shared behavior | `src/hooks/`, `src/helpers/`, `src/constants/`, `src/schemas/` | Reusable application logic. |

## Environment

| Mode | UI URL | API URL |
| --- | --- | --- |
| Development | `http://localhost:5250` | `http://localhost:5000/api` |
| Production | Configured by `VITE_FRONTEND_URL` | Configured by `VITE_API_URL` |

`DB_PORT=1000` is a backend PostgreSQL setting only. It does not change the
frontend API URL or Vite development port.

## Quality checks

```bash
npm run build
npm run lint
```

The current production build succeeds. Lint findings should be addressed
separately because they span existing page and component code.

## Performance

The initial bundle is split into cacheable React, UI, and chart vendor chunks.
Dashboards load by role, while reports plus classes, meetings, tasks, notes,
materials, profile, and settings load only when their route is opened. The
production entry bundle is now 403 kB before gzip. `useMemo` and `useCallback`
are used for stable derived layout values and callbacks, not as a blanket
optimization.
