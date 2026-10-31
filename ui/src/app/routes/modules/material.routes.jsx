import { lazyRoute } from "../lazyRoute";

const materialRoutes = {
  path: "materials",

  children: [
    {
      index: true,
      lazy: lazyRoute(() => import("@/pages/materials")),
    },
    {
      path: "create",
      lazy: lazyRoute(() => import("@/pages/materials/Create")),
    },
    {
      path: ":id",
      lazy: lazyRoute(() => import("@/pages/materials/Detail")),
    },
    {
      path: "edit/:id",
      lazy: lazyRoute(() => import("@/pages/materials/Edit")),
    },
  ],
};

export default materialRoutes;
