import { lazyRoute } from "../lazyRoute";

const classRoutes = {
  path: "classes",

  children: [
    {
      index: true,
      lazy: lazyRoute(() => import("@/pages/classes")),
    },
    {
      path: "create",
      lazy: lazyRoute(() => import("@/pages/classes/Create")),
    },
    {
      path: ":id",
      lazy: lazyRoute(() => import("@/pages/classes/Detail")),
    },
    {
      path: "edit/:id",
      lazy: lazyRoute(() => import("@/pages/classes/Edit")),
    },
  ],
};

export default classRoutes;
