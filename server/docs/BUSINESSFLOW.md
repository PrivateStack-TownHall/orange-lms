# Business Flow

> V4 reference. This document describes the end-to-end lifecycle across the
> V1 core, V2 learning, V3 assessment, and V4 delivery/operations stages.

## Learning lifecycle

1. An Owner or Admin creates users and classes.
2. An Owner or Admin assigns a Mentor and enrolls Mentees through `ClassUser`.
3. A Mentor creates meetings, then provides notes, materials, and tasks.
4. A Mentee accesses class resources and submits a task as a link or uploaded file.
5. A Mentor reviews submissions, records feedback and score, and can add rubric scores.
6. Attendance is recorded per meeting.
7. Completed classes can be archived to `HistoryClass`.
8. An authorized user can generate a certificate; its Cloudinary URL is stored
   on the corresponding history record.

## Operational lifecycle

| Event | Supporting module |
| --- | --- |
| Learning or administrative action | Audit log and user activity tracking. |
| User-facing alert | Notification module. |
| Owner-level oversight | Reports module. |

## Version context

The learning lifecycle was delivered in V1–V3. V4 completes its delivery
workflow with Cloudinary uploads, generated certificates, notifications, audit
records, activity tracking, and reports.

## File workflow

The client can send a direct URL or `multipart/form-data` with one `file` field.
For file uploads, Multer passes the file to Cloudinary and the returned URL is
stored as `fileUrl` or a submission URL. The server never relies on Render's
ephemeral filesystem.
