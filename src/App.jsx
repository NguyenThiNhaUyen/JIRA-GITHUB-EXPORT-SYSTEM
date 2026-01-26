// App: Routing configuration
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/main-layout.jsx";
import ProtectedRoute from "./components/protected-route.jsx";
import Login from "./pages/login.jsx";
import Home from "./pages/home.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Tasks from "./pages/tasks.jsx";
import Commits from "./pages/commits.jsx";
import Deadlines from "./pages/deadlines.jsx";
import Performance from "./pages/performance.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public route: Login */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />}
      />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/home" element={<Home />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/commits" element={<Commits />} />
                <Route path="/deadlines" element={<Deadlines />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
