import React from "react";

import TasksList from "@/pages/tasks";
import TasksCreate from "@/pages/tasks/Create";
import TasksEdit from "@/pages/tasks/Edit";
import TasksDetail from "@/pages/tasks/Detail";

const taskRoutes = {
  path: "tasks",

  children: [
    {
      index: true,
      element: <TasksList />,
    },
    {
      path: "create",
      element: <TasksCreate />,
    },
    {
      path: ":id",
      element: <TasksDetail />,
    },
    {
      path: "edit/:id",
      element: <TasksEdit />,
    },
  ],
};

export default taskRoutes;
