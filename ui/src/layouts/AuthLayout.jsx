import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
