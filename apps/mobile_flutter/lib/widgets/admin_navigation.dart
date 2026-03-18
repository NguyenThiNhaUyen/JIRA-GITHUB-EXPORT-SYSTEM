import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AdminSidebar extends StatelessWidget {
  const AdminSidebar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 290,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF0B5D5B), Color(0xFF0A6A6A)],
        ),
        border: Border(right: BorderSide(color: Color(0x14000000))),
      ),
      child: SafeArea(
        child: Column(
          children: [
            Container(
              height: 76,
              padding: const EdgeInsets.symmetric(horizontal: 22),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.menu_book_rounded,
                      color: Color(0xFF0F766E),
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Devora',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.2,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(18, 10, 18, 18),
                children: const [
                  _SidebarSectionTitle('TỔNG QUAN'),
                  SizedBox(height: 8),
                  _SidebarItem(
                    icon: Icons.grid_view_rounded,
                    label: 'Dashboard',
                    route: '/admin/dashboard',
                  ),
                  _SidebarItem(
                    icon: Icons.bar_chart_rounded,
                    label: 'Phân tích hệ thống',
                    route: '/admin/reports',
                  ),
                  SizedBox(height: 18),
                  _SidebarSectionTitle('HỌC VỤ'),
                  SizedBox(height: 8),
                  _SidebarItem(
                    icon: Icons.calendar_month_outlined,
                    label: 'Học kỳ',
                    route: '/admin/semesters',
                  ),
                  _SidebarItem(
                    icon: Icons.library_books_outlined,
                    label: 'Môn học',
                    route: '/admin/subjects',
                  ),
                  _SidebarItem(
                    icon: Icons.menu_book_outlined,
                    label: 'Lớp học phần',
                    route: '/admin/courses',
                  ),
                  _SidebarItem(
                    icon: Icons.account_tree_outlined,
                    label: 'Phân công giảng viên',
                    route: '/admin/lecturer-assignment',
                  ),
                  _SidebarItem(
                    icon: Icons.trending_up,
                    label: 'Khối lượng giảng dạy',
                    route: '/admin/workload',
                  ),
                  SizedBox(height: 18),
                  _SidebarSectionTitle('NGƯỜI DÙNG'),
                  SizedBox(height: 8),
                  _SidebarItem(
                    icon: Icons.people_outline_rounded,
                    label: 'Tài khoản',
                    route: '/admin/users',
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 8, 18, 18),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 14,
                ),
                decoration: BoxDecoration(
                  border: Border(
                    top: BorderSide(color: Colors.white.withOpacity(0.10)),
                  ),
                ),
                child: const Row(
                  children: [
                    Icon(
                      Icons.menu_open_rounded,
                      size: 20,
                      color: Color(0xFFD7FFFB),
                    ),
                    SizedBox(width: 12),
                    Text(
                      'Thu gọn menu',
                      style: TextStyle(
                        color: Color(0xFFD7FFFB),
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AdminDrawer extends StatelessWidget {
  const AdminDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: const Color(0xFF0B5D5B),
      child: SafeArea(
        child: Column(
          children: [
            Container(
              height: 76,
              padding: const EdgeInsets.symmetric(horizontal: 22),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.menu_book_rounded,
                      color: Color(0xFF0F766E),
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Devora',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(18, 10, 18, 18),
                children: const [
                  _SidebarSectionTitle('TỔNG QUAN'),
                  SizedBox(height: 8),
                  _SidebarItem(
                    icon: Icons.grid_view_rounded,
                    label: 'Dashboard',
                    route: '/admin/dashboard',
                  ),
                  _SidebarItem(
                    icon: Icons.bar_chart_rounded,
                    label: 'Phân tích hệ thống',
                    route: '/admin/reports',
                  ),
                  SizedBox(height: 18),
                  _SidebarSectionTitle('HỌC VỤ'),
                  SizedBox(height: 8),
                  _SidebarItem(
                    icon: Icons.calendar_month_outlined,
                    label: 'Học kỳ',
                    route: '/admin/semesters',
                  ),
                  _SidebarItem(
                    icon: Icons.library_books_outlined,
                    label: 'Môn học',
                    route: '/admin/subjects',
                  ),
                  _SidebarItem(
                    icon: Icons.menu_book_outlined,
                    label: 'Lớp học phần',
                    route: '/admin/courses',
                  ),
                  _SidebarItem(
                    icon: Icons.account_tree_outlined,
                    label: 'Phân công giảng viên',
                    route: '/admin/lecturer-assignment',
                  ),
                  _SidebarItem(
                    icon: Icons.trending_up,
                    label: 'Khối lượng giảng dạy',
                    route: '/admin/workload',
                  ),
                  SizedBox(height: 18),
                  _SidebarSectionTitle('NGƯỜI DÙNG'),
                  SizedBox(height: 8),
                  _SidebarItem(
                    icon: Icons.people_outline_rounded,
                    label: 'Tài khoản',
                    route: '/admin/users',
                  ),

                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SidebarSectionTitle extends StatelessWidget {
  final String title;

  const _SidebarSectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF33D1C6),
          fontSize: 12,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.6,
        ),
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String route;

  const _SidebarItem({
    required this.icon,
    required this.label,
    required this.route,
  });

  @override
  Widget build(BuildContext context) {
    final String location = GoRouterState.of(context).uri.toString();

    final bool active =
        location == route || (route != '/admin/dashboard' && location.startsWith(route));

    const Color activeBg = Color(0xFF0E746E);
    const Color activeText = Colors.white;
    const Color inactiveText = Color(0xFFD7FFFB);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            Navigator.of(context).maybePop();
            context.go(route);
          },
          child: Ink(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            decoration: BoxDecoration(
              color: active ? activeBg : Colors.transparent,
              borderRadius: BorderRadius.circular(16),
              boxShadow: active
                  ? [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.10),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ]
                  : null,
            ),
            child: Row(
              children: [
                Icon(icon, size: 22, color: active ? activeText : inactiveText),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      color: active ? activeText : inactiveText,
                      fontSize: 15,
                      fontWeight: active ? FontWeight.w700 : FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
