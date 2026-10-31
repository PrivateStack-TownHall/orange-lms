import React from "react";

const taskCriteriaRoutes = {
  path: "task-criteria",

  children: [
    {
      index: true,
      element: <div>Task Criteria List</div>,
    },

    {
      path: "create",
      element: <div>Create Task Criteria</div>,
    },

    {
      path: ":id",
      element: <div>Task Criteria Detail</div>,
    },

    {
      path: "edit/:id",
      element: <div>Edit Task Criteria</div>,
    },
  ],
};

export default taskCriteriaRoutes;
