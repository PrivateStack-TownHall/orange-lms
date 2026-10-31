# Changelog

All notable server-side changes are documented here by product version.

## V4 - Delivery and Operations

- Added Cloudinary-backed uploads for task, note, and material files.
- Added certificate generation and Cloudinary storage for completed classes.
- Completed server support for attendance evidence, task criteria, assessment
  results, submission criteria scores, and history-class workflows.
- Added notifications, audit logs, user activity records, and reports.
- Standardized API responses as `{ success, message, data }`.
- Added Jest and Supertest coverage for API response contracts.
- Added calendar event aggregation through the `v4-calendar-*` branch line.

## V3 - Assessment Engine

- Added task submissions and review workflows.
- Added task criteria and per-criterion submission scores.
- Added assessment results, attendance records, and class history.

## V2 - Learning Management

- Added classes, class membership, and meetings.
- Added tasks, notes, and materials with nested and flat API routes.

## V1 - Core System

- Added JWT authentication and permission-based authorization.
- Added users, profiles, mentors, and mentees.
- Established the Express, Sequelize, and PostgreSQL application foundation.
