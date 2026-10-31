import { lazyRoute } from "../lazyRoute";

const assessmentRoutes = {
  path: "assessments",

  lazy: lazyRoute(() => import("@/pages/Assessment")),
};

export default assessmentRoutes;
