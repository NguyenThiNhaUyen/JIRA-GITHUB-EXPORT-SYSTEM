// App Routes Configuration
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';


import '../providers/auth_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/student/student_dashboard.dart';
import '../screens/admin/admin_dashboard_screen.dart';
import '../screens/admin/admin_reports_screen.dart';


final GoRouter router = GoRouter(
  initialLocation: '/login',
  redirect: (context, state) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
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
      if (user.isAdmin) return '/admin';
    }

    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),

    // ---------------- STUDENT ----------------
    GoRoute(
      path: '/student',
      builder: (context, state) => const StudentDashboard(),
    ),
    GoRoute(
      path: '/student/project',
      builder: (context, state) => Scaffold(
        appBar: AppBar(
          title: const Text('Student Project'),
        ),
        body: const Center(
          child: Text('Student Project (Coming soon)'),
        ),
      ),
    ),

    // ---------------- LECTURER ----------------
    GoRoute(
      path: '/lecturer',
      builder: (context, state) => Scaffold(
        appBar: AppBar(
          title: const Text('Lecturer Dashboard'),
        ),
        body: const Center(
          child: Text('Lecturer Dashboard (Coming soon)'),
        ),
      ),
    ),
    GoRoute(
      path: '/lecturer/groups',
      builder: (context, state) => Scaffold(
        appBar: AppBar(
          title: const Text('Groups'),
        ),
        body: const Center(
          child: Text('Groups (Coming soon)'),
        ),
      ),
    ),

    // ---------------- ADMIN ----------------
    GoRoute(
      path: '/admin',
      builder: (context, state) => const AdminDashboardScreen(),
    ),
    GoRoute(
      path: '/admin/courses',
      builder: (context, state) => Scaffold(
        appBar: AppBar(
          title: const Text('Courses'),
        ),
        body: const Center(
          child: Text('Courses (Coming soon)'),
        ),
      ),
    ),
    GoRoute(
      path: '/admin/semesters',
      builder: (context, state) => Scaffold(
        appBar: AppBar(
          title: const Text('Semesters'),
        ),
        body: const Center(
          child: Text('Semesters (Coming soon)'),
        ),
      ),
    ),
    GoRoute(
  path: '/admin/reports',
  builder: (context, state) => const AdminReportsScreen(),
),
    GoRoute(
      path: '/admin/subjects',
      builder: (context, state) => Scaffold(
        appBar: AppBar(
          title: const Text('Subjects'),
        ),
        body: const Center(
          child: Text('Subjects (Coming soon)'),
        ),
      ),
    ),
    GoRoute(
      path: '/admin/import',
      builder: (context, state) => Scaffold(
        appBar: AppBar(
          title: const Text('Import Students'),
        ),
        body: const Center(
          child: Text('Import Students (Coming soon)'),
        ),
      ),
    ),
    GoRoute(
      path: '/admin/groups',
      builder: (context, state) => Scaffold(
        appBar: AppBar(
          title: const Text('Groups'),
        ),
        body: const Center(
          child: Text('Groups (Coming soon)'),
        ),
      ),
    ),
    GoRoute(
      path: '/admin/export',
      builder: (context, state) => Scaffold(
        appBar: AppBar(
          title: const Text('Export Report'),
        ),
        body: const Center(
          child: Text('Export Report (Coming soon)'),
        ),
      ),
    ),
  ],
);