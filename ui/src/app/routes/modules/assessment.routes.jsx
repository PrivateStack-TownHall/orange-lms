import { lazyRoute } from "../lazyRoute";

const assessmentRoutes = {
  path: "assessments",
  children: [
    {
      index: true,
      lazy: lazyRoute(() => import("@/pages/Assessment")),
    },
    {
      path: ":id",
      lazy: lazyRoute(() => import("@/pages/AssessmentDetail")),
    },
  ],
};

export default assessmentRoutes;
