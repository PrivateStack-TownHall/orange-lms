import { useSelector } from "react-redux";

import Admin from "./Admin";
import Mentor from "./Mentor";
import Mentee from "./Mentee";

const DetailMeeting = () => {
  const { user } = useSelector((state) => state.auth);

  if (["Owner", "Admin"].includes(user?.role)) {
    return <Admin />;
  }

  if (user?.role === "Mentor") {
    return <Mentor />;
  }

  if (user?.role === "Mentee") {
    return <Mentee />;
  }

  return (
    <div className="rounded-sm border border-red-200 bg-red-50 p-4 text-red-600">
      Unauthorized Role
    </div>
  );
};

export default DetailMeeting;
