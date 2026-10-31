import { useSelector } from "react-redux";

import OwnerDashboard from "./Owner";
import AdminDashboard from "./Admin";
import MentorDashboard from "./Mentor";
import MenteeDashboard from "./Mentee";

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);

  switch (user?.role) {
    case "Owner":
      return <OwnerDashboard />;

    case "Admin":
      return <AdminDashboard />;

    case "Mentor":
      return <MentorDashboard />;

    case "Mentee":
      return <MenteeDashboard />;

    default:
      return <div className="p-6">Dashboard unavailable</div>;
  }
};

export default Dashboard;
