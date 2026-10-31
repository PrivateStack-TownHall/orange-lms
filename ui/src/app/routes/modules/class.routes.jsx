import React from "react";

import ClassesList from "@/pages/classes";
import ClassesCreate from "@/pages/classes/Create";
import ClassesEdit from "@/pages/classes/Edit";
import ClassesDetail from "@/pages/classes/Detail";

const classRoutes = {
  path: "classes",

  children: [
    {
      index: true,
      element: <ClassesList />,
    },
    {
      path: "create",
      element: <ClassesCreate />,
    },
    {
      path: ":id",
      element: <ClassesDetail />,
    },
    {
      path: "edit/:id",
      element: <ClassesEdit />,
    },
  ],
};

export default classRoutes;
