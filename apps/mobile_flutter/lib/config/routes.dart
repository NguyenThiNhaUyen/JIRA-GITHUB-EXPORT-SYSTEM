// App Routes Configuration
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/student/student_dashboard.dart';

final GoRouter router = GoRouter(
  initialLocation: '/login',
  redirect: (context, state) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isAuthenticated = authProvider.isAuthenticated;
    final isLoggingIn = state.matchedLocation == '/login' || 
                         state.matchedLocation == '/forgot-password';

    if (!isAuthenticated && !isLoggingIn) {
      return '/login';
    }

    if (isAuthenticated && isLoggingIn) {
      // Redirect to role-specific dashboard
      final user = authProvider.user!;
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
    GoRoute(
      path: '/student',
      builder: (context, state) => const StudentDashboard(),
    ),
    GoRoute(
      path: '/student/project',
      builder: (context, state) => const Scaffold(
        body: Center(child: Text('Student Project (Coming soon)')),
      ),
    ),
    GoRoute(
      path: '/lecturer',
      builder: (context, state) => const Scaffold(
        appBar: AppBar(title: Text('Lecturer Dashboard')),
        body: Center(child: Text('Lecturer Dashboard (Coming soon)')),
      ),
    ),
    GoRoute(
      path: '/lecturer/groups',
      builder: (context, state) => const Scaffold(
        appBar: AppBar(title: Text('Groups')),
        body: Center(child: Text('Groups (Coming soon)')),
      ),
    ),
    GoRoute(
      path: '/admin',
      builder: (context, state) => const Scaffold(
        appBar: AppBar(title: Text('Admin Dashboard')),
        body: Center(child: Text('Admin Dashboard (Coming soon)')),
      ),
    ),
    GoRoute(
      path: '/admin/courses',
      builder: (context, state) => const Scaffold(
        appBar: AppBar(title: Text('Courses')),
        body: Center(child: Text('Courses (Coming soon)')),
      ),
    ),
    GoRoute(
      path: '/admin/semesters',
      builder: (context, state) => const Scaffold(
        appBar: AppBar(title: Text('Semesters')),
        body: Center(child: Text('Semesters (Coming soon)')),
      ),
    ),
  ],
);
