import { lazyRoute } from "../lazyRoute";

const certificateRoutes = {
  path: "certificates",
  children: [
    {
      index: true,
      lazy: lazyRoute(() => import("@/pages/certificates")),
    },
  ],
};

export default certificateRoutes;
