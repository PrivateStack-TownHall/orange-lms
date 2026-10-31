import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleGuard = ({ children, roles = [], redirectTo = "/dashboard" }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user?.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleGuard;
