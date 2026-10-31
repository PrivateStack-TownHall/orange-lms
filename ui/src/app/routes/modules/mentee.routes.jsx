import React from "react";

import RoleGuard from "../guards/RoleGuard";

import MenteesList from "@/pages/mentees";
import MenteesCreate from "@/pages/mentees/Create";
import MenteesEdit from "@/pages/mentees/Edit";
import MenteesDetail from "@/pages/mentees/Detail";

const menteeRoutes = {
  path: "mentees",

  children: [
    {
      index: true,
      element: (
        <RoleGuard roles={["Owner", "Admin", "Mentor"]}>
          <MenteesList />
        </RoleGuard>
      ),
    },

    {
      path: "create",
      element: (
        <RoleGuard roles={["Owner", "Admin"]}>
          <MenteesCreate />
        </RoleGuard>
      ),
    },

    {
      path: ":id",
      element: (
        <RoleGuard roles={["Owner", "Admin", "Mentor"]}>
          <MenteesDetail />
        </RoleGuard>
      ),
    },

    {
      path: "edit/:id",
      element: (
        <RoleGuard roles={["Owner", "Admin"]}>
          <MenteesEdit />
        </RoleGuard>
      ),
    },
  ],
};

export default menteeRoutes;
