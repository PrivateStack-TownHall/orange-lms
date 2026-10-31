# Orange LMS Frontend

React 19 and Vite frontend for Orange LMS. It provides role-aware routes,
Redux-backed authentication state, Axios API services, Tailwind CSS v4 styling,
and reusable form/table components.

## Stack

- React 19, React Router 7, Redux Toolkit, Zustand
- Vite 7 and Tailwind CSS 4
- Axios, Framer Motion, Lucide React, and Recharts

## Setup

```bash
npm install
npm run dev
```

Vite reads `.env.development` for local development and `.env.production` for
production builds. Start with `.env.example` when creating a new environment.

Required settings include:

```env
VITE_API_URL=http://localhost:5000/api
VITE_MAX_FILE_SIZE=5242880
```

`VITE_PORT` is optional; Vite falls back to port `5173` when it is unset.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Build the production client into `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint checks. |

## Structure

| Path | Purpose |
| --- | --- |
| `src/app/` | Application root, router, Redux store, providers, and route guards. |
| `src/pages/` | Feature pages for dashboards, learning modules, operations, and profiles. |
| `src/services/` | Axios instance, API endpoint definitions, and service modules. |
| `src/components/` | Shared layout, form, table, popup, navigation, and display components. |
| `src/constants/`, `hooks/`, `helpers/`, `schemas/` | Shared application behavior. |
| `src/styles/`, `src/assets/`, `public/` | Styling and visual assets. |

## Current feature coverage

Core learning flows (classes, meetings, tasks, notes, materials, submissions)
and operational views (notifications, audit logs, user activity, reports) have
frontend modules. Some V3 assessment route modules remain placeholder screens;
the backend APIs and database support for them are already present.
