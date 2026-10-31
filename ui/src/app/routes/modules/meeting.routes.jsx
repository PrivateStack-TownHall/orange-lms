import React from "react";

import MeetingsList from "@/pages/meetings";
import MeetingsCreate from "@/pages/meetings/Create";
import MeetingsEdit from "@/pages/meetings/Edit";
import MeetingsDetail from "@/pages/meetings/Detail";

const meetingRoutes = {
  path: "meetings",

  children: [
    {
      index: true,
      element: <MeetingsList />,
    },
    {
      path: "create",
      element: <MeetingsCreate />,
    },
    {
      path: ":id",
      element: <MeetingsDetail />,
    },
    {
      path: "edit/:id",
      element: <MeetingsEdit />,
    },
  ],
};

export default meetingRoutes;
