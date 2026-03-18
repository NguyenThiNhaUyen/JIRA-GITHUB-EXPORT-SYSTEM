import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// ─── Student Sidebar (for wide/tablet screens) ───────────────────────────────
class StudentSidebar extends StatelessWidget {
  const StudentSidebar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 260,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF134e4a), Color(0xFF0f5864)],
        ),
        border: Border(right: BorderSide(color: Color(0x226f9aa3))),
        boxShadow: [
          BoxShadow(
            color: Color(0x33000000),
            blurRadius: 24,
            offset: Offset(4, 0),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          children: [
            // ── Logo ──
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
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.menu_book_rounded,
                      color: Color(0xFF134e4a),
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

            // ── Nav items ──
            const Expanded(
              child: _StudentNavList(),
            ),

            // ── Collapse footer ──
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                decoration: BoxDecoration(
                  border: Border(
                    top: BorderSide(color: Colors.white.withOpacity(0.10)),
                  ),
                ),
                child: const Row(
                  children: [
                    Icon(
                      Icons.menu_rounded,
                      size: 20,
                      color: Color(0xFFB2F5EA),
                    ),
                    SizedBox(width: 12),
                    Text(
                      'Thu gọn menu',
                      style: TextStyle(
                        color: Color(0xFFB2F5EA),
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

// ─── Student Drawer (for mobile screens) ────────────────────────────────────
class StudentDrawer extends StatelessWidget {
  const StudentDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: const Color(0xFF134e4a),
      child: SafeArea(
        child: Column(
          children: [
            // ── Logo ──
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
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.menu_book_rounded,
                      color: Color(0xFF134e4a),
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

            // ── Nav items ──
            const Expanded(
              child: _StudentNavList(),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Shared nav list (reused by both Sidebar & Drawer) ───────────────────────
class _StudentNavList extends StatelessWidget {
  const _StudentNavList();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      children: const [
        // ── TỔNG QUAN ──
        _SidebarSectionTitle('TỔNG QUAN'),
        SizedBox(height: 6),
        _SidebarItem(
          icon: Icons.grid_view_rounded,
          label: 'Dashboard',
          route: '/student',
          exactMatch: true,
        ),
        SizedBox(height: 16),

        // ── HỌC TẬP ──
        _SidebarSectionTitle('HỌC TẬP'),
        SizedBox(height: 6),
        _SidebarItem(
          icon: Icons.library_books_outlined,
          label: 'Lớp của tôi',
          route: '/student/courses',
        ),
        _SidebarItem(
          icon: Icons.account_tree_outlined,
          label: 'Nhóm của tôi',
          route: '/student/my-project',
        ),
        SizedBox(height: 16),

        // ── THEO DÕI ──
        _SidebarSectionTitle('THEO DÕI'),
        SizedBox(height: 6),
        _SidebarItem(
          icon: Icons.people_outline_rounded,
          label: 'Đóng góp',
          route: '/student/contribution',
        ),
        _SidebarItem(
          icon: Icons.notifications_outlined,
          label: 'Thông báo / Cảnh báo',
          route: '/student/alerts',
        ),
        SizedBox(height: 16),

        // ── TÀI LIỆU ──
        _SidebarSectionTitle('TÀI LIỆU'),
        SizedBox(height: 6),
        _SidebarItem(
          icon: Icons.description_outlined,
          label: 'SRS',
          route: '/student/srs',
        ),
      ],
    );
  }
}

// ─── Section Title ────────────────────────────────────────────────────────────
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
          color: Color(0xFF2DD4BF), // teal-400 equivalent
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

  const _SidebarItem({
    required this.icon,
    required this.label,
    required this.route,
    this.exactMatch = false,
  });

  @override
  Widget build(BuildContext context) {
    final String location = GoRouterState.of(context).uri.toString();

    final bool active = exactMatch
        ? location == route
        : (location == route || location.startsWith('$route/'));

    const Color activeBg = Color(0xFF0F766E); // teal-800 equivalent
    const Color activeText = Colors.white;
    const Color inactiveText = Color(0xFFCCFBF1); // teal-100 equivalent

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () {
            Navigator.of(context).maybePop(); // Close drawer if open
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
                        color: Colors.black.withOpacity(0.12),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ]
                  : null,
            ),
            child: Row(
              children: [
                Icon(icon, size: 20, color: active ? activeText : inactiveText),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      color: active ? activeText : inactiveText,
                      fontSize: 14,
                      fontWeight:
                          active ? FontWeight.w700 : FontWeight.w500,
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
