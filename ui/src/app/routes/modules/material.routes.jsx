import React from "react";

import MaterialsList from "@/pages/materials";
import MaterialsCreate from "@/pages/materials/Create";
import MaterialsEdit from "@/pages/materials/Edit";
import MaterialsDetail from "@/pages/materials/Detail";

const materialRoutes = {
  path: "materials",

  children: [
    {
      index: true,
      element: <MaterialsList />,
    },
    {
      path: "create",
      element: <MaterialsCreate />,
    },
    {
      path: ":id",
      element: <MaterialsDetail />,
    },
    {
      path: "edit/:id",
      element: <MaterialsEdit />,
    },
  ],
};

export default materialRoutes;
