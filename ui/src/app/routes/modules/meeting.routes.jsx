import { lazyRoute } from "../lazyRoute";

const meetingRoutes = {
  path: "meetings",

  children: [
    {
      index: true,
      lazy: lazyRoute(() => import("@/pages/meetings")),
    },
    {
      path: "create",
      lazy: lazyRoute(() => import("@/pages/meetings/Create")),
    },
    {
      path: ":id",
      lazy: lazyRoute(() => import("@/pages/meetings/Detail")),
    },
    {
      path: "edit/:id",
      lazy: lazyRoute(() => import("@/pages/meetings/Edit")),
    },
  ],
};

export default meetingRoutes;
