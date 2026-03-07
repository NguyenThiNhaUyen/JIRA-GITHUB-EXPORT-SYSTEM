// Custom Bottom Navigation Bar
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class CustomBottomNavBar extends StatelessWidget {
  final int currentIndex;

  const CustomBottomNavBar({
    super.key,
    required this.currentIndex,
  });

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user!;

    List<BottomNavigationBarItem> items = [];
    
    if (user.isStudent) {
      items = const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Trang chủ',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.assignment),
          label: 'Dự án',
        ),
      ];
    } else if (user.isLecturer) {
      items = const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Trang chủ',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.groups),
          label: 'Nhóm',
        ),
      ];
    } else if (user.isAdmin) {
      items = const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Trang chủ',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.school),
          label: 'Lớp học',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.calendar_today),
          label: 'Kỳ học',
        ),
      ];
    }

    return BottomNavigationBar(
      currentIndex: currentIndex,
      items: items,
      onTap: (index) {
        if (user.isStudent) {
          if (index == 0) context.go('/student');
          if (index == 1) context.go('/student/project');
        } else if (user.isLecturer) {
          if (index == 0) context.go('/lecturer');
          if (index == 1) context.go('/lecturer/groups');
        } else if (user.isAdmin) {
          if (index == 0) context.go('/admin');
          if (index == 1) context.go('/admin/courses');
          if (index == 2) context.go('/admin/semesters');
        }
      },
    );
  }
}
