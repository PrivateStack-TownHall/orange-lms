import React from "react";

const attendanceRoutes = {
  path: "attendance",

  children: [
    {
      index: true,
      element: <div>Attendance List</div>,
    },

    {
      path: ":id",
      element: <div>Attendance Detail</div>,
    },
  ],
};

export default attendanceRoutes;
