import React from "react";

import RoleGuard from "../guards/RoleGuard";

import AuditLog from "@/pages/audit-log";

const auditLogRoutes = {
  path: "audit-log",
  element: (
    <RoleGuard roles={["Owner", "Admin"]}>
      <AuditLog />
    </RoleGuard>
  ),
};

export default auditLogRoutes;
