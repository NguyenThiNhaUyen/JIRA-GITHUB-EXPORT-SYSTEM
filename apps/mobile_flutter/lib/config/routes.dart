
// App Routes Configuration
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';

// AUTH
import '../screens/auth/login_screen.dart';
import '../screens/auth/forgot_password_screen.dart';

// STUDENT
import '../screens/student/student_dashboard.dart';
import '../screens/student/student_project_screen.dart';

// ADMIN
import '../screens/admin/admin_dashboard_screen.dart';
import '../screens/admin/admin_reports_screen.dart';
import '../screens/admin/admin_semesters_screen.dart';
import '../screens/admin/admin_subjects_screen.dart';
import '../screens/admin/lecturer_assignment_screen.dart';
import '../screens/admin/course_management_screen.dart';
import '../screens/admin/admin_groups_screen.dart';
import '../screens/admin/admin_users_screen.dart';

// LECTURER
import '../screens/lecturer/lecturer_dashboard_screen.dart';
import '../screens/lecturer/lecturer_groups_screen.dart';
import '../screens/lecturer/my_courses_screen.dart';
import '../screens/lecturer/manage_groups_screen.dart';
import '../screens/lecturer/contributions_screen.dart';

final GoRouter router = GoRouter(
  initialLocation: '/login',

  redirect: (context, state) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isAuthenticated = authProvider.isAuthenticated;

    final currentPath = state.matchedLocation;

    final isAuthRoute =
        currentPath == '/login' || currentPath == '/forgot-password';

    // Nếu chưa login → redirect login
    if (!isAuthenticated && !isAuthRoute) {
      return '/login';
    }

    // Nếu đã login mà vào login page
    if (isAuthenticated && isAuthRoute) {
      final user = authProvider.user;

      if (user == null) return '/login';

      if (user.isStudent) return '/student';
      if (user.isLecturer) return '/lecturer';
      if (user.isAdmin) return '/admin';
    }

    return null;
  },

  routes: [

    // ───────────────── AUTH ─────────────────
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),

    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),

    // ───────────────── STUDENT ─────────────────
    GoRoute(
      path: '/student',
      builder: (context, state) => const StudentDashboard(),
    ),

    GoRoute(
      path: '/student/project',
      builder: (context, state) => const StudentProjectScreen(),
    ),

    // ───────────────── LECTURER ─────────────────
    GoRoute(
      path: '/lecturer',
      builder: (context, state) => const LecturerDashboardScreen(),
    ),

    // My Courses
    GoRoute(
      path: '/lecturer/my-courses',
      builder: (context, state) => const MyCoursesScreen(),
    ),

    // Groups Overview (tất cả nhóm)
    GoRoute(
      path: '/lecturer/groups',
      builder: (context, state) => const LecturerGroupsScreen(),
    ),

    // Groups theo course
    GoRoute(
      path: '/lecturer/course/:courseId/groups',
      builder: (context, state) => LecturerGroupsScreen(
        courseId: state.pathParameters['courseId']!,
      ),
    ),

    // Manage groups
    GoRoute(
      path: '/lecturer/course/:courseId/manage-groups',
      builder: (context, state) => ManageGroupsScreen(
        courseId: state.pathParameters['courseId'] ?? '',
      ),
    ),

    // Contributions
    GoRoute(
      path: '/lecturer/contributions',
      builder: (context, state) => const ContributionsScreen(),
    ),

    // ───────────────── ADMIN ─────────────────
    GoRoute(
      path: '/admin',
      builder: (context, state) => const AdminDashboardScreen(),
    ),

    GoRoute(
      path: '/admin/semesters',
      builder: (context, state) => const AdminCoursesScreen(),
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
      path: '/admin/groups',
      builder: (context, state) => const AdminGroupsScreen(),
    ),

    GoRoute(
      path: '/admin/users',
      builder: (context, state) => const AdminUsersScreen(),
    ),
  ],
);
