import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// ─── Lecturer Sidebar (for wide screens) ────────────────────────────────────
class LecturerSidebar extends StatelessWidget {
  const LecturerSidebar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 260,
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
            // Logo
            Container(
              height: 72,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
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
            // Nav items
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                children: const [
                  _SidebarSectionTitle('TỔNG QUAN'),
                  SizedBox(height: 6),
                  _SidebarItem(
                    icon: Icons.grid_view_rounded,
                    label: 'Dashboard',
                    route: '/lecturer',
                    exactMatch: true,
                  ),
                  SizedBox(height: 16),
                  _SidebarSectionTitle('QUẢN LÝ'),
                  SizedBox(height: 6),
                  _SidebarItem(
                    icon: Icons.school_outlined,
                    label: 'Lớp của tôi',
                    route: '/lecturer/courses',
                  ),
                  _SidebarItem(
                    icon: Icons.people_outline_rounded,
                    label: 'Nhóm & Dự án',
                    route: '/lecturer/groups',
                  ),
                  SizedBox(height: 16),
                  _SidebarSectionTitle('THEO DÕI'),
                  SizedBox(height: 6),
                  _SidebarItem(
                    icon: Icons.bar_chart_rounded,
                    label: 'Đóng góp',
                    route: '/lecturer/contributions',
                  ),
                  _SidebarItem(
                    icon: Icons.warning_amber_rounded,
                    label: 'Cảnh báo',
                    route: '/lecturer/alerts',
                  ),
                  SizedBox(height: 16),
                  _SidebarSectionTitle('TÀI LIỆU'),
                  SizedBox(height: 6),
                  _SidebarItem(
                    icon: Icons.description_outlined,
                    label: 'SRS Reports',
                    route: '/lecturer/srs-reports',
                  ),
                  _SidebarItem(
                    icon: Icons.download_outlined,
                    label: 'Báo cáo & Export',
                    route: '/lecturer/reports',
                  ),
                  const SizedBox(height: 16),
                  const _SidebarSectionTitle('HÀNH ĐỘNG'),
                  const SizedBox(height: 6),
                  const _SidebarItem(
                    icon: Icons.logout_rounded,
                    label: 'Đăng xuất',
                    route: '/logout',
                    color: Colors.redAccent,
                  ),
                ],
              ),
            ),
            // Collapse footer
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                decoration: BoxDecoration(
                  border: Border(
                    top: BorderSide(color: Colors.white.withOpacity(0.10)),
                  ),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.menu_open_rounded, size: 20, color: Color(0xFFD7FFFB)),
                    SizedBox(width: 12),
                    Text(
                      'Thu gọn menu',
                      style: TextStyle(
                        color: Color(0xFFD7FFFB),
                        fontSize: 14,
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

// ─── Lecturer Drawer (for mobile screens) ───────────────────────────────────
class LecturerDrawer extends StatelessWidget {
  const LecturerDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: const Color(0xFF0B5D5B),
      child: SafeArea(
        child: Column(
          children: [
            // Logo
            Container(
              height: 72,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
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
            // Nav items
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                children: const [
                  _SidebarSectionTitle('TỔNG QUAN'),
                  SizedBox(height: 6),
                  _SidebarItem(
                    icon: Icons.grid_view_rounded,
                    label: 'Dashboard',
                    route: '/lecturer',
                    exactMatch: true,
                  ),
                  SizedBox(height: 16),
                  _SidebarSectionTitle('QUẢN LÝ'),
                  SizedBox(height: 6),
                  _SidebarItem(
                    icon: Icons.school_outlined,
                    label: 'Lớp của tôi',
                    route: '/lecturer/my-courses',
                  ),
                  _SidebarItem(
                    icon: Icons.people_outline_rounded,
                    label: 'Nhóm & Dự án',
                    route: '/lecturer/groups',
                  ),
                  SizedBox(height: 16),
                  _SidebarSectionTitle('THEO DÕI'),
                  SizedBox(height: 6),
                  _SidebarItem(
                    icon: Icons.bar_chart_rounded,
                    label: 'Đóng góp',
                    route: '/lecturer/contributions',
                  ),
                  _SidebarItem(
                    icon: Icons.warning_amber_rounded,
                    label: 'Cảnh báo',
                    route: '/lecturer/alerts',
                  ),
                  SizedBox(height: 16),
                  _SidebarSectionTitle('TÀI LIỆU'),
                  SizedBox(height: 6),
                  _SidebarItem(
                    icon: Icons.description_outlined,
                    label: 'SRS Reports',
                    route: '/lecturer/srs',
                  ),
                  _SidebarItem(
                    icon: Icons.download_outlined,
                    label: 'Báo cáo & Export',
                    route: '/lecturer/reports',
                  ),
                  const SizedBox(height: 16),
                  const _SidebarSectionTitle('HÀNH ĐỘNG'),
                  const SizedBox(height: 6),
                  const _SidebarItem(
                    icon: Icons.logout_rounded,
                    label: 'Đăng xuất',
                    route: '/logout',
                    color: Colors.redAccent,
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

// ─── Section Title ───────────────────────────────────────────────────────────
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
          fontSize: 11,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}

// ─── Sidebar Item ─────────────────────────────────────────────────────────────
class _SidebarItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String route;
  final bool exactMatch;
  final Color? color;

  const _SidebarItem({
    required this.icon,
    required this.label,
    required this.route,
    this.exactMatch = false,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final String location = GoRouterState.of(context).uri.toString();

    final bool active = exactMatch
        ? location == route
        : (location == route || location.startsWith(route));

    const Color activeBg = Color(0xFF0E746E);
    const Color activeText = Colors.white;
    const Color inactiveText = Color(0xFFD7FFFB);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () {
            Navigator.of(context).maybePop(); // close drawer if open
            context.go(route);
          },
          child: Ink(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
            decoration: BoxDecoration(
              color: active ? activeBg : Colors.transparent,
              borderRadius: BorderRadius.circular(14),
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
                Icon(icon, size: 20, color: color ?? (active ? activeText : inactiveText)),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      color: color ?? (active ? activeText : inactiveText),
                      fontSize: 14,
                      fontWeight: active ? FontWeight.w700 : FontWeight.w500,
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
