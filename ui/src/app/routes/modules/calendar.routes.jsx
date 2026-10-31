import { lazyRoute } from "../lazyRoute";

export default {
  path: "calendar",
  children: [{ index: true, lazy: lazyRoute(() => import("@/pages/calendar")) }],
};
