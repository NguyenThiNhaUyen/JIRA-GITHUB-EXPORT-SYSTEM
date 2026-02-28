// App: Routing configuration với role-based access cho Project-Based Learning Management
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/main-layout.jsx";
import ProtectedRoute from "./components/protected-route.jsx";
import RoleGuard from "./components/role-guard.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Unauthorized from "./pages/unauthorized.jsx";
import NotFound from "./pages/NotFound.jsx";
import TestUI from "./pages/test-ui.jsx";

// Admin Layout
import AdminLayout from "./layouts/AdminLayout.jsx";

// Admin pages
import AdminDashboard from "./pages/admin/admin-dashboard.jsx";
import AdminReports from "./pages/admin/admin-reports.jsx";
import CourseManagement from "./pages/admin/course-management.jsx";
import SemesterManagement from "./pages/admin/semester-management.jsx";
import SubjectManagement from "./pages/admin/subject-management.jsx";

// Lecturer pages
import LecturerDashboard from "./pages/lecturer/lecturer-dashboard.jsx";
import ManageGroups from "./pages/lecturer/manage-groups.jsx";
import GroupDetail from "./pages/lecturer/group-detail.jsx";

// Student pages
import StudentDashboard from "./pages/student/student-dashboard-new.jsx";
import StudentProject from "./pages/student/student-project.jsx";



import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { isAuthenticated, userRole } = useAuth();

  // Helper function to get redirect path based on role
  const getDefaultRedirect = () => {
    if (!userRole) return "/login";
    switch (userRole) {
      case "ADMIN": return "/admin";
      case "LECTURER": return "/lecturer";
      case "STUDENT": return "/student";
      default: return "/login";
    }
  };

  // Always redirect to login first, let user choose role
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/test-ui" element={<TestUI />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/not-found" element={<NotFound />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleGuard requiredRole="ADMIN">
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <RoleGuard requiredRole="ADMIN">
              <AdminLayout>
                <AdminReports />
              </AdminLayout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute>
            <RoleGuard requiredRole="ADMIN">
              <AdminLayout>
                <CourseManagement />
              </AdminLayout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:courseId"
        element={
          <ProtectedRoute>
            <RoleGuard requiredRole="ADMIN">
              <AdminLayout>
                <CourseManagement />
              </AdminLayout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/semesters"
        element={
          <ProtectedRoute>
            <RoleGuard requiredRole="ADMIN">
              <AdminLayout>
                <SemesterManagement />
              </AdminLayout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subjects"
        element={
          <ProtectedRoute>
            <RoleGuard requiredRole="ADMIN">
              <AdminLayout>
                <SubjectManagement />
              </AdminLayout>
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
        path="/lecturer/course/:courseId/manage-groups"
        element={
          <ProtectedRoute>
            <RoleGuard requiredRole="LECTURER">
              <ManageGroups />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lecturer/group/:groupId"
        element={
          <ProtectedRoute>
            <RoleGuard requiredRole="LECTURER">
              <GroupDetail />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

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

      {/* Legacy protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
