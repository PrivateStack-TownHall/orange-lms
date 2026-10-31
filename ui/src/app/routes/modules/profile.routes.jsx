import React from "react";

import Profile from "@/pages/profile";
import ProfileEdit from "@/pages/profile/Edit";

const profileRoutes = {
  path: "profile",

  children: [
    {
      index: true,
      element: <Profile />,
    },

    {
      path: "edit",
      element: <ProfileEdit />,
    },
  ],
};

export default profileRoutes;
