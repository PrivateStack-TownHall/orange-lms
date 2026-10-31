import { lazyRoute } from "../lazyRoute";

const taskRoutes = {
  path: "tasks",

  children: [
    {
      index: true,
      lazy: lazyRoute(() => import("@/pages/tasks")),
    },
    {
      path: "create",
      lazy: lazyRoute(() => import("@/pages/tasks/Create")),
    },
    {
      path: ":id",
      lazy: lazyRoute(() => import("@/pages/tasks/Detail")),
    },
    {
      path: "edit/:id",
      lazy: lazyRoute(() => import("@/pages/tasks/Edit")),
    },
  ],
};

export default taskRoutes;
