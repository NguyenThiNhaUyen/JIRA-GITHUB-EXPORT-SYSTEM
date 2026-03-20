// App: Routing configuration với role-based access cho Project-Based Learning Management
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/main-layout.jsx";
import ProtectedRoute from "./components/protected-route.jsx";
import RoleGuard from "./components/role-guard.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
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
import LecturerAssignment from "./pages/admin/lecturer-assignment.jsx";
import UserManagement from "./pages/admin/users.jsx";
import UserDetail from "./pages/admin/user-detail.jsx";
import MyReports from "./pages/admin/my-reports.jsx";

// Lecturer pages
import LecturerLayout from "./layouts/LecturerLayout.jsx";
import LecturerDashboard from "./pages/lecturer/lecturer-dashboard.jsx";
import ManageGroups from "./pages/lecturer/manage-groups.jsx";
import GroupDetail from "./pages/lecturer/group-detail.jsx";
import MyCourses from "./pages/lecturer/my-courses.jsx";
import Contributions from "./pages/lecturer/contributions.jsx";
import Alerts from "./pages/lecturer/alerts.jsx";
import SrsReports from "./pages/lecturer/srs-reports.jsx";
import Reports from "./pages/lecturer/reports.jsx";

// Student pages
import StudentLayout from "./layouts/StudentLayout.jsx";
import StudentDashboard from "./pages/student/student-dashboard-new.jsx";
import StudentProject from "./pages/student/student-project.jsx";
import StudentCoursesPage, {
  StudentMyProjectPage,
  StudentContributionPage,
  StudentAlertsPage,
  StudentSrsPage,
} from "./pages/student/student-placeholders.jsx";



import { useAuth } from "./context/AuthContext.jsx";
import { useSignalR } from "./hooks/useSignalR.js";

export default function App() {
  const { isAuthenticated, userRole } = useAuth();
  
  // Real-time notification listener
  useSignalR();

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
      <Route path="/admin/lecturer-assignment" element={<ProtectedRoute><RoleGuard requiredRole="ADMIN"><AdminLayout><LecturerAssignment /></AdminLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><RoleGuard requiredRole="ADMIN"><AdminLayout><UserManagement /></AdminLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/admin/users/:userId" element={<ProtectedRoute><RoleGuard requiredRole="ADMIN"><AdminLayout><UserDetail /></AdminLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/admin/my-reports" element={<ProtectedRoute><RoleGuard requiredRole="ADMIN"><AdminLayout><MyReports /></AdminLayout></RoleGuard></ProtectedRoute>} />

      {/* ─── Lecturer routes ─── */}
      <Route path="/lecturer" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><LecturerDashboard /></LecturerLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/lecturer/my-courses" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><MyCourses /></LecturerLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/lecturer/groups" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><LecturerDashboard /></LecturerLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/lecturer/contributions" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><Contributions /></LecturerLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/lecturer/alerts" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><Alerts /></LecturerLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/lecturer/srs" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><SrsReports /></LecturerLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/lecturer/reports" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><Reports /></LecturerLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/lecturer/course/:courseId/manage-groups" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><ManageGroups /></LecturerLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/lecturer/group/:groupId" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><GroupDetail /></LecturerLayout></RoleGuard></ProtectedRoute>} />

      {/* ─── Student routes ─── */}
      <Route path="/student" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><StudentDashboard /></StudentLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/student/courses" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><StudentCoursesPage /></StudentLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/student/my-project" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><StudentMyProjectPage /></StudentLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/student/contribution" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><StudentContributionPage /></StudentLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/student/alerts" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><StudentAlertsPage /></StudentLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/student/srs" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><StudentSrsPage /></StudentLayout></RoleGuard></ProtectedRoute>} />
      <Route path="/student/project/:projectId" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><StudentProject /></StudentLayout></RoleGuard></ProtectedRoute>} />

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
