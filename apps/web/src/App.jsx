import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute.jsx";
import RoleGuard from "@/components/RoleGuard.jsx";
import { useAuth } from "@/context/AuthContext.jsx";

// Public pages (Keep sync for initial load)
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import NotFound from "./pages/NotFound.jsx";

// Layouts
import AdminLayout from "./layouts/AdminLayout.jsx";
import LecturerLayout from "./layouts/LecturerLayout.jsx";
import StudentLayout from "./layouts/StudentLayout.jsx";

// Loading component
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50/30">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Đang tải tài nguyên...</p>
    </div>
  </div>
);

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports.jsx"));
const CourseManagement = lazy(() => import("./pages/admin/CourseManagement.jsx"));
const SemesterManagement = lazy(() => import("./pages/admin/SemesterManagement.jsx"));
const SubjectManagement = lazy(() => import("./pages/admin/SubjectManagement.jsx"));
const LecturerAssignment = lazy(() => import("./pages/admin/LecturerAssignment.jsx"));
const UserManagement = lazy(() => import("./pages/admin/Users.jsx"));
const MyReports = lazy(() => import("./pages/admin/MyReports.jsx"));
const LecturerWorkload = lazy(() => import("./pages/admin/LecturerWorkload.jsx"));

// Lecturer pages
const LecturerDashboard = lazy(() => import("./pages/lecturer/LecturerDashboard.jsx"));
const ManageGroups = lazy(() => import("./pages/lecturer/ManageGroups.jsx"));
const GroupDetail = lazy(() => import("./pages/lecturer/GroupDetail.jsx"));
const MyCourses = lazy(() => import("./pages/lecturer/MyCourses.jsx"));
const Contributions = lazy(() => import("./pages/lecturer/Contributions.jsx"));
const Alerts = lazy(() => import("./pages/lecturer/Alerts.jsx"));
const SrsReports = lazy(() => import("./pages/lecturer/SrsReports.jsx"));
const Reports = lazy(() => import("./pages/lecturer/Reports.jsx"));
const CourseAnalytics = lazy(() => import("./pages/lecturer/CourseAnalytics.jsx"));
const ProjectsOverview = lazy(() => import("./pages/lecturer/ProjectsOverview.jsx"));

// Student pages
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard.jsx"));
const StudentProject = lazy(() => import("./pages/student/StudentProject.jsx"));
const StudentCoursesPage = lazy(() => import("./pages/student/StudentCourses.jsx"));
const StudentMyProjectPage = lazy(() => import("./pages/student/StudentMyProject.jsx"));
const StudentAlertsPage = lazy(() => import("./pages/student/StudentAlerts.jsx"));
const StudentSrsPage = lazy(() => import("./pages/student/StudentSrs.jsx"));
const StudentContributionPage = lazy(() => import("./pages/student/StudentContribution.jsx"));
const CourseWorkspace = lazy(() => import("./pages/student/CourseWorkspace.jsx"));

export default function App() {
  const { userRole } = useAuth();

  const getDefaultRedirect = () => {
    if (!userRole) return "/login";

    const role = String(userRole).toUpperCase();

    if (role === "ADMIN") return "/admin";
    if (role === "LECTURER") return "/lecturer";
    if (role === "STUDENT") return "/student";

    return "/login";
  };

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={userRole ? <Navigate to={getDefaultRedirect()} replace /> : <Login />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/not-found" element={<NotFound />} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute><RoleGuard requiredRole="ADMIN"><AdminLayout><AdminDashboard /></AdminLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute><RoleGuard requiredRole="ADMIN"><AdminLayout><AdminReports /></AdminLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute><RoleGuard requiredRole="ADMIN"><AdminLayout><CourseManagement /></AdminLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/admin/semesters" element={<ProtectedRoute><RoleGuard requiredRole="ADMIN"><AdminLayout><SemesterManagement /></AdminLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/admin/subjects" element={<ProtectedRoute><RoleGuard requiredRole="ADMIN"><AdminLayout><SubjectManagement /></AdminLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/admin/lecturer-assignment" element={<ProtectedRoute><RoleGuard requiredRole="ADMIN"><AdminLayout><LecturerAssignment /></AdminLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><RoleGuard requiredRole="ADMIN"><AdminLayout><UserManagement /></AdminLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/admin/my-reports" element={<ProtectedRoute><RoleGuard requiredRole="ADMIN"><AdminLayout><MyReports /></AdminLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/admin/workload" element={<ProtectedRoute><RoleGuard requiredRole="ADMIN"><AdminLayout><LecturerWorkload /></AdminLayout></RoleGuard></ProtectedRoute>} />

        {/* Lecturer routes */}
        <Route path="/lecturer" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><LecturerDashboard /></LecturerLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/lecturer/my-courses" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><MyCourses /></LecturerLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/lecturer/course/:courseId/manage-groups" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><ManageGroups /></LecturerLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/lecturer/group/:groupId" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><GroupDetail /></LecturerLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/lecturer/contributions" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><Contributions /></LecturerLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/lecturer/alerts" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><Alerts /></LecturerLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/lecturer/srs" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><SrsReports /></LecturerLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/lecturer/reports" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><Reports /></LecturerLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/lecturer/groups" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><LecturerDashboard /></LecturerLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/lecturer/course/:courseId/analytics" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><CourseAnalytics /></LecturerLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/lecturer/projects" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout><ProjectsOverview /></LecturerLayout></RoleGuard></ProtectedRoute>} />

        {/* Student routes */}
        <Route path="/student" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><StudentDashboard /></StudentLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/student/courses" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><StudentCoursesPage /></StudentLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/student/my-project" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><StudentMyProjectPage /></StudentLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/student/contribution" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><StudentContributionPage /></StudentLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/student/alerts" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><StudentAlertsPage /></StudentLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/student/srs" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><StudentSrsPage /></StudentLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/student/project/:projectId" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><StudentProject /></StudentLayout></RoleGuard></ProtectedRoute>} />
        <Route path="/student/workspace/:courseId" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout><CourseWorkspace /></StudentLayout></RoleGuard></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={getDefaultRedirect()} replace />} />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}






