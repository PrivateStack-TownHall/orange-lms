import React from "react";

const historyClassRoutes = {
  path: "history-classes",

  children: [
    {
      index: true,
      element: <div>History Classes List</div>,
    },

    {
      path: ":id",
      element: <div>History Classes Detail</div>,
    },
  ],
};

export default historyClassRoutes;
