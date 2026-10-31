import { lazyRoute } from "../lazyRoute";

const historyClassRoutes = {
  path: "history-classes",

  children: [
    {
      index: true,
      lazy: lazyRoute(() => import("@/pages/history-classes")),
    },
  ],
};

export default historyClassRoutes;
