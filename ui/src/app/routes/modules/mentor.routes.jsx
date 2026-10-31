import React from "react";

import RoleGuard from "../guards/RoleGuard";

import MentorsList from "@/pages/mentors";
import MentorsCreate from "@/pages/mentors/Create";
import MentorsEdit from "@/pages/mentors/Edit";
import MentorsDetail from "@/pages/mentors/Detail";

const mentorRoutes = {
  path: "mentors",

  children: [
    {
      index: true,
      element: (
        <RoleGuard roles={["Owner", "Admin"]}>
          <MentorsList />
        </RoleGuard>
      ),
    },

    {
      path: "create",
      element: (
        <RoleGuard roles={["Owner", "Admin"]}>
          <MentorsCreate />
        </RoleGuard>
      ),
    },

    {
      path: ":id",
      element: (
        <RoleGuard roles={["Owner", "Admin"]}>
          <MentorsDetail />
        </RoleGuard>
      ),
    },

    {
      path: "edit/:id",
      element: (
        <RoleGuard roles={["Owner", "Admin"]}>
          <MentorsEdit />
        </RoleGuard>
      ),
    },
  ],
};

export default mentorRoutes;
