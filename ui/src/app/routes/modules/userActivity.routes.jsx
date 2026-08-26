import React from "react";

import RoleGuard from "../guards/RoleGuard";

import UserActivityLog from "@/pages/user-activity";

const userActivityRoutes = {
  path: "user-activity",
  element: (
    <RoleGuard roles={["Owner", "Admin"]}>
      <UserActivityLog />
    </RoleGuard>
  ),
};

export default userActivityRoutes;
