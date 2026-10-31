import { lazyRoute } from "../lazyRoute";

const historyClassRoutes = {
  path: "history-classes",

  children: [
    {
      index: true,
      lazy: lazyRoute(() => import("@/pages/history-classes")),
    },

    {
      path: ":id",
      lazy: lazyRoute(() => import("@/pages/history-classes/Detail")),
    },
  ],
};

export default historyClassRoutes;
