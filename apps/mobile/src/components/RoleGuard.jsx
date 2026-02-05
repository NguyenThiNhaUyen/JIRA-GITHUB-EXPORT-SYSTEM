// RoleGuard - Check if user has required role
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../packages/shared/src/context/AuthContext.jsx";

export default function RoleGuard({ children, requiredRole }) {
    const { userRole } = useAuth();

    if (userRole !== requiredRole) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
