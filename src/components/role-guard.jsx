// RoleGuard: Component bảo vệ routes cần specific role
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RoleGuard({ children, requiredRole }) {
  const { user, userRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== requiredRole) {
    // Redirect to unauthorized page or to user's dashboard
    const userDashboard = `/${userRole.toLowerCase()}`;
    return <Navigate to="/unauthorized" state={{ from: window.location.pathname, redirectTo: userDashboard }} replace />;
  }

  return children;
}
