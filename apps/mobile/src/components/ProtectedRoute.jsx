// ProtectedRoute - Redirect to login if not authenticated
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../packages/shared/src/context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
