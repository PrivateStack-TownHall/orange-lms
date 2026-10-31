import { lazyRoute } from "../lazyRoute";

const attendanceRoutes = {
  path: "attendance",

  children: [
    {
      index: true,
      lazy: lazyRoute(() => import("@/pages/Attendance")),
    },

    {
      path: ":id",
      lazy: lazyRoute(() => import("@/pages/AttendanceDetail")),
    },
  ],
};

export default attendanceRoutes;
