import React, { lazy, Suspense } from "react";

import RoleGuard from "../guards/RoleGuard";

import LoadingPage from "@/components/ui/loading/LoadingPage";

const Reports = lazy(() => import("@/pages/reports"));

// Reports is intentionally Owner-only — Admin does NOT get access,
// mirroring the backend permission.js `reports.read = [ROLES.OWNER]`.
const reportsRoutes = {
  path: "reports",
  element: (
    <RoleGuard roles={["Owner"]}>
      <Suspense fallback={<LoadingPage title="Loading reports..." />}>
        <Reports />
      </Suspense>
    </RoleGuard>
  ),
};

export default reportsRoutes;
