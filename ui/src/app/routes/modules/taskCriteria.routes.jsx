import { lazyRoute } from "../lazyRoute";

const taskCriteriaRoutes = {
  path: "task-criteria",

  lazy: lazyRoute(() => import("@/pages/TaskCriteria")),
};

export default taskCriteriaRoutes;
