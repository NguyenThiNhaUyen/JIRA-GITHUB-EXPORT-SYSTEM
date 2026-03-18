import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute.jsx";
import RoleGuard from "@/components/RoleGuard.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { setNavigate } from "@/utils/navigation.js";
import { useEffect } from "react";

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
      <p className="text-[10px] font-black text-gray-400 animate-pulse">Äang táº£i tĂ i nguyĂªn...</p>
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
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

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
        <Route path="/admin" element={<ProtectedRoute><RoleGuard requiredRole="ADMIN"><AdminLayout /></RoleGuard></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="semesters" element={<SemesterManagement />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="lecturer-assignment" element={<LecturerAssignment />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="my-reports" element={<MyReports />} />
          <Route path="workload" element={<LecturerWorkload />} />
        </Route>

        {/* Lecturer routes */}
        <Route path="/lecturer" element={<ProtectedRoute><RoleGuard requiredRole="LECTURER"><LecturerLayout /></RoleGuard></ProtectedRoute>}>
          <Route index element={<LecturerDashboard />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="course/:courseId/manage-groups" element={<ManageGroups />} />
          <Route path="group/:groupId" element={<GroupDetail />} />
          <Route path="contributions" element={<Contributions />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="srs" element={<SrsReports />} />
          <Route path="reports" element={<Reports />} />
          <Route path="groups" element={<LecturerDashboard />} />
          <Route path="course/:courseId/analytics" element={<CourseAnalytics />} />
          <Route path="projects" element={<ProjectsOverview />} />
        </Route>

        {/* Student routes */}
        <Route path="/student" element={<ProtectedRoute><RoleGuard requiredRole="STUDENT"><StudentLayout /></RoleGuard></ProtectedRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCoursesPage />} />
          <Route path="my-project" element={<StudentMyProjectPage />} />
          <Route path="contribution" element={<StudentContributionPage />} />
          <Route path="alerts" element={<StudentAlertsPage />} />
          <Route path="srs" element={<StudentSrsPage />} />
          <Route path="project/:projectId" element={<StudentProject />} />
          <Route path="workspace/:courseId" element={<CourseWorkspace />} />
        </Route>

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
