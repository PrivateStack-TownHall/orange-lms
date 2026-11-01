import React, { lazy, Suspense } from "react";

import RoleGuard from "../guards/RoleGuard";

import LoadingPage from "@/components/ui/loading/LoadingPage";

const Reports = lazy(() => import("@/pages/reports"));

const reportsRoutes = {
  path: "reports",
  element: (
    <RoleGuard roles={["Owner", "Admin", "Mentor"]}>
      <Suspense fallback={<LoadingPage title="Loading reports..." />}>
        <Reports />
      </Suspense>
    </RoleGuard>
  ),
};

export default reportsRoutes;
