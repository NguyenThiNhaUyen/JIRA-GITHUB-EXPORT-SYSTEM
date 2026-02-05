// Mobile App Routing - Optimized for mobile UX
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../packages/shared/src/context/AuthContext.jsx";

// Auth pages
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

// Student pages
import StudentDashboard from "./pages/student/Dashboard.jsx";
import StudentProject from "./pages/student/Project.jsx";

// Lecturer pages
import LecturerDashboard from "./pages/lecturer/Dashboard.jsx";
import LecturerGroups from "./pages/lecturer/Groups.jsx";
import LecturerGroupDetail from "./pages/lecturer/GroupDetail.jsx";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminCourses from "./pages/admin/Courses.jsx";
import AdminSemesters from "./pages/admin/Semesters.jsx";

// Shared components
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleGuard from "./components/RoleGuard.jsx";

export default function App() {
    const { isAuthenticated, userRole } = useAuth();

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Student routes */}
            <Route
                path="/student"
                element={
                    <ProtectedRoute>
                        <RoleGuard requiredRole="STUDENT">
                            <StudentDashboard />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student/project/:projectId"
                element={
                    <ProtectedRoute>
                        <RoleGuard requiredRole="STUDENT">
                            <StudentProject />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />

            {/* Lecturer routes */}
            <Route
                path="/lecturer"
                element={
                    <ProtectedRoute>
                        <RoleGuard requiredRole="LECTURER">
                            <LecturerDashboard />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/lecturer/course/:courseId/groups"
                element={
                    <ProtectedRoute>
                        <RoleGuard requiredRole="LECTURER">
                            <LecturerGroups />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/lecturer/group/:groupId"
                element={
                    <ProtectedRoute>
                        <RoleGuard requiredRole="LECTURER">
                            <LecturerGroupDetail />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />

            {/* Admin routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <RoleGuard requiredRole="ADMIN">
                            <AdminDashboard />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/courses"
                element={
                    <ProtectedRoute>
                        <RoleGuard requiredRole="ADMIN">
                            <AdminCourses />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/semesters"
                element={
                    <ProtectedRoute>
                        <RoleGuard requiredRole="ADMIN">
                            <AdminSemesters />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />

            {/* Default redirect */}
            <Route
                path="/"
                element={
                    isAuthenticated ? (
                        userRole === "ADMIN" ? <Navigate to="/admin" replace /> :
                            userRole === "LECTURER" ? <Navigate to="/lecturer" replace /> :
                                userRole === "STUDENT" ? <Navigate to="/student" replace /> :
                                    <Navigate to="/login" replace />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
        </Routes>
    );
}
