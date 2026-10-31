import { lazyRoute } from "../lazyRoute";

const settingRoutes = {
  path: "settings",
  lazy: lazyRoute(() => import("@/pages/settings")),
};

export default settingRoutes;
