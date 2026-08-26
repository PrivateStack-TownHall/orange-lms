import React from "react";

import RoleGuard from "../guards/RoleGuard";

import Reports from "@/pages/reports";

// Reports is intentionally Owner-only — Admin does NOT get access,
// mirroring the backend permission.js `reports.read = [ROLES.OWNER]`.
const reportsRoutes = {
  path: "reports",
  element: (
    <RoleGuard roles={["Owner"]}>
      <Reports />
    </RoleGuard>
  ),
};

export default reportsRoutes;
