import { lazyRoute } from "../lazyRoute";

const noteRoutes = {
  path: "notes",

  children: [
    {
      index: true,
      lazy: lazyRoute(() => import("@/pages/notes")),
    },
    {
      path: "create",
      lazy: lazyRoute(() => import("@/pages/notes/Create")),
    },
    {
      path: ":id",
      lazy: lazyRoute(() => import("@/pages/notes/Detail")),
    },
    {
      path: "edit/:id",
      lazy: lazyRoute(() => import("@/pages/notes/Edit")),
    },
  ],
};

export default noteRoutes;
