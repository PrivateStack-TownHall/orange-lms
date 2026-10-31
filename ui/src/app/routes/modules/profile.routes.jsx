import { lazyRoute } from "../lazyRoute";

const profileRoutes = {
  path: "profile",

  children: [
    {
      index: true,
      lazy: lazyRoute(() => import("@/pages/profile")),
    },

    {
      path: "edit",
      lazy: lazyRoute(() => import("@/pages/profile/Edit")),
    },
  ],
};

export default profileRoutes;
