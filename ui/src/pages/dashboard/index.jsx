import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";

import LoadingPage from "@/components/ui/loading/LoadingPage";

const dashboards = {
  Owner: lazy(() => import("./Owner")),
  Admin: lazy(() => import("./Admin")),
  Mentor: lazy(() => import("./Mentor")),
  Mentee: lazy(() => import("./Mentee")),
};

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);

  const DashboardByRole = dashboards[user?.role];

  if (!DashboardByRole) {
    return <div className="p-6">Dashboard unavailable</div>;
  }

  return (
    <Suspense fallback={<LoadingPage />}>
      <DashboardByRole />
    </Suspense>
  );
};

export default Dashboard;
