import React from "react";

const assessmentRoutes = {
  path: "assessments",

  children: [
    {
      index: true,
      element: <div>Assessment List</div>,
    },

    {
      path: ":id",
      element: <div>Assessment Detail</div>,
    },
  ],
};

export default assessmentRoutes;
