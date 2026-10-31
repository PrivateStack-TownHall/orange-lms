import React from "react";

import RoleGuard from "../guards/RoleGuard";

import AdminsList from "@/pages/admins";
import AdminsCreate from "@/pages/admins/Create";
import AdminsEdit from "@/pages/admins/Edit";
import AdminsDetail from "@/pages/admins/Detail";

const adminRoutes = {
  path: "admins",

  children: [
    {
      index: true,
      element: (
        <RoleGuard roles={["Owner"]}>
          <AdminsList />
        </RoleGuard>
      ),
    },

    {
      path: "create",
      element: (
        <RoleGuard roles={["Owner"]}>
          <AdminsCreate />
        </RoleGuard>
      ),
    },

    {
      path: ":id",
      element: (
        <RoleGuard roles={["Owner"]}>
          <AdminsDetail />
        </RoleGuard>
      ),
    },

    {
      path: "edit/:id",
      element: (
        <RoleGuard roles={["Owner"]}>
          <AdminsEdit />
        </RoleGuard>
      ),
    },
  ],
};

export default adminRoutes;
