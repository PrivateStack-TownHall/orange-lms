# Business Flow

## Learning lifecycle

1. An Owner or Admin creates users and classes.
2. An Owner or Admin assigns a Mentor and enrolls Mentees through `ClassUser`.
3. A Mentor creates meetings, then provides notes, materials, and tasks.
4. A Mentee accesses class resources and submits a task as a link or uploaded file.
5. A Mentor reviews submissions, records feedback and score, and can add rubric scores.
6. Attendance is recorded per meeting.
7. Completed classes can be archived to `HistoryClass`; a certificate URL can be stored there.

## Operational lifecycle

| Event | Supporting module |
| --- | --- |
| Learning or administrative action | Audit log and user activity tracking. |
| User-facing alert | Notification module. |
| Owner-level oversight | Reports module. |

## File workflow

The client can send a direct URL or `multipart/form-data` with one `file` field.
For file uploads, Multer passes the file to Cloudinary and the returned URL is
stored as `fileUrl` or a submission URL. The server never relies on Render's
ephemeral filesystem.
