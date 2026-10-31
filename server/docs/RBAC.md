# Role-Based Access Control

> V4 reference. The permission model is shared by all V1–V4 server modules.

Authorization is evaluated per resource and action after JWT authentication.

The RBAC foundation was introduced in V1 and remains the enforcement layer for
the V2 learning, V3 assessment, and V4 operational modules.

| Role | Main access |
| --- | --- |
| Owner | Full system administration, sensitive deletion, operational data, and reports. |
| Admin | User and class administration, meetings, monitoring, and assessment administration. |
| Mentor | Assigned learning delivery: meetings, tasks, notes, materials, attendance, criteria, and grading. |
| Mentee | Read access to enrolled learning resources, task submission, and personal learning outcomes. |

## Guard sequence

```txt
Authorization header -> authentication -> req.user -> authorization(resource, action) -> controller
```

The canonical permission matrix is `src/config/permission.js`. Route-level
permissions should be changed there and not duplicated in frontend code.
