import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';

// AUTH
import '../screens/auth/login_screen.dart';
import '../screens/auth/forgot_password_screen.dart';

// STUDENT
import '../screens/student/student_dashboard.dart';
import '../screens/student/student_project_screen.dart';
import '../screens/student/student_courses_screen.dart';
import '../screens/student/student_my_project_screen.dart';
import '../screens/student/student_contribution_screen.dart';
import '../screens/student/student_alerts_screen.dart';
import '../screens/student/student_srs_screen.dart';
import '../screens/student/student_placeholders.dart';
import '../screens/student/student_settings_screen.dart';

// ADMIN
import '../screens/admin/admin_dashboard_screen.dart';
import '../screens/admin/admin_reports_screen.dart';
import '../screens/admin/admin_semesters_screen.dart';
import '../screens/admin/admin_subjects_screen.dart';
import '../screens/admin/lecturer_assignment_screen.dart';
import '../screens/admin/course_management_screen.dart';
import '../screens/admin/admin_users_screen.dart';
import '../screens/admin/lecturer_workload_screen.dart';

// LECTURER
import '../screens/lecturer/lecturer_dashboard_screen.dart';
import '../screens/lecturer/lecturer_groups_screen.dart';
import '../screens/lecturer/my_courses_screen.dart';
import '../screens/lecturer/manage_groups_screen.dart';
import '../screens/lecturer/contributions_screen.dart';
import '../screens/lecturer/lecturer_alerts_screen.dart';
import '../screens/lecturer/lecturer_srs_reports_screen.dart';
import '../screens/lecturer/lecturer_reports_screen.dart';

GoRouter createRouter(AuthProvider authProvider) {
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: authProvider,
    redirect: (context, state) {
      final isAuthenticated = authProvider.isAuthenticated;
      final currentPath = state.matchedLocation;

      final isAuthRoute =
          currentPath == '/login' || currentPath == '/forgot-password';

      if (!isAuthenticated && !isAuthRoute) {
        return '/login';
      }

      if (isAuthenticated && isAuthRoute) {
        final user = authProvider.user;

        if (user == null) return '/login';
        if (user.isStudent) return '/student';
        if (user.isLecturer) return '/lecturer';
        if (user.isAdmin) return '/admin/dashboard';
      }

      return null;
    },
    routes: [
      // AUTH
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),

      // STUDENT
      GoRoute(
        path: '/student',
        builder: (context, state) => const StudentDashboard(),
      ),
      GoRoute(
        path: '/student/project/:projectId',
        builder: (context, state) => StudentProjectScreen(
          projectId: state.pathParameters['projectId'],
        ),
      ),
      GoRoute(
        path: '/student/courses',
        builder: (context, state) => const StudentCoursesScreen(),
      ),
      GoRoute(
        path: '/student/my-project',
        builder: (context, state) => const StudentMyProjectScreen(),
      ),
      GoRoute(
        path: '/student/contribution',
        builder: (context, state) => const StudentContributionScreen(),
      ),
      GoRoute(
        path: '/student/alerts',
        builder: (context, state) => const StudentAlertsScreen(),
      ),
      GoRoute(
        path: '/student/srs',
        builder: (context, state) => const StudentSrsScreen(),
      ),
      GoRoute(
        path: '/student/settings',
        builder: (context, state) => const StudentSettingsScreen(),
      ),

      // LECTURER
      GoRoute(
        path: '/lecturer',
        builder: (context, state) => const LecturerDashboardScreen(),
      ),
      GoRoute(
        path: '/lecturer/my-courses',
        builder: (context, state) => const MyCoursesScreen(),
      ),
      GoRoute(
        path: '/lecturer/groups',
        builder: (context, state) => const LecturerGroupsScreen(),
      ),
      GoRoute(
        path: '/lecturer/course/:courseId/groups',
        builder: (context, state) => LecturerGroupsScreen(
          courseId: state.pathParameters['courseId']!,
        ),
      ),
      GoRoute(
        path: '/lecturer/course/:courseId/manage-groups',
        builder: (context, state) => ManageGroupsScreen(
          courseId: state.pathParameters['courseId'] ?? '',
        ),
      ),
      GoRoute(
        path: '/lecturer/contributions',
        builder: (context, state) => const ContributionsScreen(),
      ),
      GoRoute(
        path: '/lecturer/reports',
        builder: (context, state) => const LecturerReportsScreen(),
      ),
      GoRoute(
        path: '/lecturer/alerts',
        builder: (context, state) => const LecturerAlertsScreen(),
      ),
      GoRoute(
        path: '/lecturer/srs',
        builder: (context, state) => const LecturerSrsReportsScreen(),
      ),

      // ADMIN
      GoRoute(
        path: '/admin/dashboard',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: '/admin/semesters',
        builder: (context, state) => const AdminSemestersScreen(),
      ),
      GoRoute(
        path: '/admin/subjects',
        builder: (context, state) => const AdminSubjectsScreen(),
      ),
      GoRoute(
        path: '/admin/courses',
        builder: (context, state) => const CourseManagementScreen(),
      ),
      GoRoute(
        path: '/admin/lecturer-assignment',
        builder: (context, state) => const LecturerAssignmentScreen(),
      ),
      GoRoute(
        path: '/admin/reports',
        builder: (context, state) => const AdminReportsScreen(),
      ),
      GoRoute(
        path: '/admin/users',
        builder: (context, state) => const AdminUsersScreen(),
      ),
      GoRoute(
        path: '/admin/workload',
        builder: (context, state) => const LecturerWorkloadScreen(),
      ),
      GoRoute(
        path: '/logout',
        builder: (context, state) {
          Future.microtask(() => authProvider.logout());
          return const LoginScreen();
        },
      ),
    ],
  );
}
