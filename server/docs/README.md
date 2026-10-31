# Orange LMS Server Documentation

This directory contains the technical reference for the cumulative V4 server
release. V4 includes the stable V1 core system, V2 learning management, and V3
assessment engine, then adds delivery and operational capabilities.

| Document | Purpose |
| --- | --- |
| [Core system](CORESYSTEM.md) | Application layers, domains, and version ownership. |
| [Business flow](BUSINESSFLOW.md) | Learning, operational, and file-upload lifecycles. |
| [RBAC](RBAC.md) | Role access model and authorization sequence. |
| [API contract](APICONTRACT.md) | HTTP response contract and route inventory. |
| [Database schema](DATABASESCHEME.md) | Sequelize model ownership and URL-bearing fields. |

## Version map

| Version | Server focus |
| --- | --- |
| V1 | Authentication, authorization, accounts, profiles, and roles. |
| V2 | Classes, membership, meetings, tasks, notes, and materials. |
| V3 | Submissions, rubrics, assessment, attendance, and class history. |
| V4 | Cloudinary uploads, certificates, notifications, operational records, reports, API response consistency, and tests. |

Calendar event aggregation is developed in the `v4-calendar-*` branch line.
Dashboard Analytics belongs to the V5 roadmap.
