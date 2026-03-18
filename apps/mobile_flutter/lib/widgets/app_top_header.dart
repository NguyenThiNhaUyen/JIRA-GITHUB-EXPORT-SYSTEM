// Shared AppTopHeader Widget — matches web TopHeader.jsx design
// Uses PopupMenuButton to avoid AppBar clipping on the dropdown
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// ── Models ─────────────────────────────────────────────────
class GroupInvitation {
  final String id;
  final String projectName;
  final String invitedByName;
  final DateTime createdAt;
  const GroupInvitation({
    required this.id,
    required this.projectName,
    required this.invitedByName,
    required this.createdAt,
  });
}

class AppUser {
  final String name;
  final String email;
  final String role; // ADMIN | LECTURER | STUDENT
  const AppUser({required this.name, required this.email, required this.role});
}

// ─── Menu action enum ───────────────────────────────────────
enum _UserMenuAction { settings, logout }

// ──────────────────────────────────────────────────────────────
// AppTopHeader
// ──────────────────────────────────────────────────────────────
class AppTopHeader extends StatefulWidget implements PreferredSizeWidget {
  const AppTopHeader({
    super.key,
    required this.title,
    this.showBack = false,
    this.backPath,
    this.primary = true,
    this.user = const AppUser(
        name: 'Super Admin', email: 'admin@fe.edu.vn', role: 'ADMIN'),
    this.invitations = const [],
    this.actions,
    this.showSearch = true,
    this.showTitle = false,
    this.menuIcon,
  });

  final String title;
  final bool showBack;
  final String? backPath;
  final bool primary;
  final AppUser user;
  final List<GroupInvitation> invitations;

  /// Extra widgets placed before the bell (e.g. FAB-style add button)
  final List<Widget>? actions;

  /// Show search bar in the center (default: true)
  final bool showSearch;

  /// Show title text (default: false — title replaced by search bar)
  final bool showTitle;

  /// Optional leading widget override (e.g. hamburger icon)
  final Widget? menuIcon;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  State<AppTopHeader> createState() => _AppTopHeaderState();
}

class _AppTopHeaderState extends State<AppTopHeader> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
  // ── Design tokens (gray palette matching web) ────────────
  static const _bg = Colors.white;
  static const _txtPrimary = Color(0xFF111827);
  static const _txtSec = Color(0xFF6B7280);
  static const _teal = Color(0xFF0F766E);
  static const _tealLight = Color(0xFFCCFBF1);
  static const _borderColor = Color(0xFFE5E7EB);
  static const _divider = Color(0xFFF3F4F6);

  // ── Computed ─────────────────────────────────────────────
  String get _initials =>
      widget.user.name.isNotEmpty ? widget.user.name[0].toUpperCase() : 'U';

  int get _pendingCount =>
      widget.user.role == 'STUDENT' ? widget.invitations.length : 0;

  // ── Helpers ──────────────────────────────────────────────
  String _roleLabel(String role) {
    switch (role) {
      case 'ADMIN':
        return 'ADMIN';
      case 'LECTURER':
        return 'GIẢNG VIÊN';
      default:
        return 'SINH VIÊN';
    }
  }

  // ── Logout confirm dialog ─────────────────────────────────
  void _confirmLogout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Đăng xuất',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        content: const Text(
            'Bạn có chắc muốn đăng xuất khỏi hệ thống?',
            style: TextStyle(fontSize: 13, color: _txtSec)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy', style: TextStyle(color: _txtSec)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFDC2626),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              context.go('/logout');
            },
            child: const Text('Đăng xuất'),
          ),
        ],
      ),
    );
  }

  // ── BUILD ─────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    // Determine leading widget
    Widget? leadingWidget;
    if (widget.showBack) {
      leadingWidget = IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded,
            color: _txtPrimary, size: 18),
        onPressed: () {
          if (widget.backPath != null) {
            context.go(widget.backPath!);
          } else if (context.canPop()) {
            context.pop();
          }
        },
      );
    } else if (widget.menuIcon != null) {
      leadingWidget = widget.menuIcon;
    } else {
      // Default hamburger menu for sidebar screens
      leadingWidget = Builder(
        builder: (ctx) => IconButton(
          icon: const Icon(Icons.menu_rounded, color: _txtPrimary, size: 22),
          onPressed: () {
            try {
              Scaffold.of(ctx).openDrawer();
            } catch (_) {}
          },
        ),
      );
    }

    // Center content: search bar or title text
    // If showBack is true → always show title (back/detail screens)
    // If showSearch explicitly false → show title
    // Otherwise (sidebar screens) → show search bar
    final bool useSearch = widget.showSearch && !widget.showBack;
    final double scWidth = MediaQuery.of(context).size.width;
    final bool isSmall = scWidth < 600;

    Widget centerWidget;
    if (useSearch) {
      if (isSmall && (widget.actions?.isNotEmpty ?? false)) {
        // On small screen with many actions, just show a search icon button to save space
        centerWidget = Align(
          alignment: Alignment.centerLeft,
          child: IconButton(
            icon: const Icon(Icons.search_rounded, color: _txtSec, size: 22),
            onPressed: _showSearchSheet,
          ),
        );
      } else {
        centerWidget = Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Container(
              height: 44,
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(30),
                border: Border.all(color: const Color(0xFFE5E7EB), width: 1.2),
              ),
              child: TextField(
                controller: _searchController,
                textAlignVertical: TextAlignVertical.center,
                style: const TextStyle(fontSize: 14, color: _txtPrimary, fontWeight: FontWeight.w500),
                decoration: const InputDecoration(
                  hintText: 'Tìm kiếm...',
                  hintStyle: TextStyle(fontSize: 14, color: Color(0xFF94A3B8), fontWeight: FontWeight.normal),
                  prefixIcon: Padding(
                    padding: EdgeInsets.only(left: 8),
                    child: Icon(Icons.search_rounded, size: 20, color: Color(0xFF94A3B8)),
                  ),
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ),
          ),
        );
      }
    } else {
      centerWidget = Text(
        widget.title,
        style: const TextStyle(
          color: _txtPrimary,
          fontWeight: FontWeight.w700,
          fontSize: 16,
        ),
      );
    }

    return AppBar(
      primary: widget.primary,
      backgroundColor: _bg,
      elevation: 0,
      surfaceTintColor: _bg,
      shape: const Border(bottom: BorderSide(color: _borderColor, width: 1)),
      leading: leadingWidget,
      title: centerWidget,
      titleSpacing: (isSmall && useSearch) ? 0 : 8,
      actions: [
        // Extra custom actions
        if (widget.actions != null)
          ...widget.actions!.map((a) => Padding(
                padding: const EdgeInsets.only(right: 6),
                child: a,
              )),

        // Bell
        _buildBell(),
        const SizedBox(width: 4),

        // ── Avatar + PopupMenu ─────────────────────────────
        _buildUserMenu(),
        const SizedBox(width: 12),
      ],
    );
  }

  // ── Bell (notifications) ──────────────────────────────────
  Widget _buildBell() {
    return Stack(
      alignment: Alignment.center,
      clipBehavior: Clip.none,
      children: [
        IconButton(
          icon: const Icon(Icons.notifications_none_rounded,
              size: 22, color: _txtSec),
          onPressed: () => _showNotifSheet(),
          splashRadius: 20,
        ),
        if (_pendingCount > 0)
          Positioned(
            top: 6,
            right: 6,
            child: Container(
              width: 16,
              height: 16,
              decoration: const BoxDecoration(
                  color: Color(0xFFEF4444), shape: BoxShape.circle),
              child: Center(
                child: Text('$_pendingCount',
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w800)),
              ),
            ),
          ),
      ],
    );
  }

  // ── User avatar button + PopupMenuButton ──────────────────
  // Using PopupMenuButton so the menu renders in an Overlay
  // (not clipped by the AppBar).
  Widget _buildUserMenu() {
    return PopupMenuButton<_UserMenuAction>(
      offset: const Offset(0, 48),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: _borderColor),
      ),
      elevation: 8,
      color: Colors.white,
      onSelected: (action) {
        if (action == _UserMenuAction.logout) {
          _confirmLogout();
        }
        // settings: no-op for now
      },
      // ── Custom trigger button ─────────────────────────────
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 10),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: _borderColor),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          // Circle with initial
          Container(
            width: 26,
            height: 26,
            decoration: BoxDecoration(
              color: _tealLight,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Center(
              child: Text(_initials,
                  style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 13,
                      color: _teal)),
            ),
          ),
          const SizedBox(width: 5),
          const Icon(Icons.keyboard_arrow_down_rounded,
              size: 16, color: _txtSec),
        ]),
      ),
      // ── Popup items ───────────────────────────────────────
      itemBuilder: (ctx) => [
        // Header: name + email (not selectable)
        PopupMenuItem<_UserMenuAction>(
          enabled: false,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.user.name,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: _txtPrimary)),
                const SizedBox(height: 2),
                Text(widget.user.email,
                    style: const TextStyle(
                        fontSize: 11, color: _txtSec)),
                const SizedBox(height: 8),
                const Divider(height: 1, color: _divider),
              ],
            ),
          ),

        // Divider
        const PopupMenuDivider(height: 1),

        // Đăng xuất
        PopupMenuItem<_UserMenuAction>(
          value: _UserMenuAction.logout,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: const Row(children: [
            Icon(Icons.logout_rounded, size: 16, color: Color(0xFFDC2626)),
            SizedBox(width: 10),
            Text('Đăng xuất',
                style: TextStyle(
                    fontSize: 13,
                    color: Color(0xFFDC2626),
                    fontWeight: FontWeight.w600)),
          ]),
        ),
      ],
    );
  }

  // ── Search bottom sheet ───────────────────────────────────
  void _showSearchSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        padding: EdgeInsets.only(
            bottom: (MediaQuery.of(context).viewInsets.bottom).clamp(0.0, double.infinity)+ 20,
            top: 16,
            left: 16,
            right: 16),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 16),
          TextField(
            autofocus: true,
            decoration: InputDecoration(
              hintText: 'Tìm kiếm...',
              hintStyle:
                  const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14),
              prefixIcon:
                  const Icon(Icons.search_rounded, color: Color(0xFF9CA3AF)),
              filled: true,
              fillColor: const Color(0xFFF9FAFB),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
              enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide:
                      const BorderSide(color: _teal, width: 1.5)),
            ),
          ),
          const SizedBox(height: 8),
        ]),
      ),
    );
  }

  // ── Notification bottom sheet ─────────────────────────────
  void _showNotifSheet() {
    final invitations = widget.invitations;
    final isStudent = widget.user.role == 'STUDENT';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.45,
        minChildSize: 0.3,
        maxChildSize: 0.8,
        expand: false,
        builder: (ctx, scroll) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(children: [
            const SizedBox(height: 8),
            Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 4),
            // Header
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(children: [
                const Icon(Icons.notifications_none_rounded,
                    size: 18, color: _teal),
                const SizedBox(width: 8),
                Text(isStudent ? 'Lời mời nhóm' : 'Thông báo',
                    style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: _txtPrimary)),
                const Spacer(),
                if (invitations.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                        color: const Color(0xFFEF4444),
                        borderRadius: BorderRadius.circular(20)),
                    child: Text('${invitations.length}',
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700)),
                  ),
              ]),
            ),
            const Divider(height: 1, color: _divider),
            // Content
            Expanded(
              child: invitations.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.notifications_off_outlined,
                              size: 40, color: Color(0xFFD1D5DB)),
                          SizedBox(height: 12),
                          Text('Không có thông báo mới',
                              style: TextStyle(
                                  fontSize: 14, color: Color(0xFF9CA3AF))),
                        ],
                      ),
                    )
                  : ListView.separated(
                      controller: scroll,
                      itemCount: invitations.length,
                      separatorBuilder: (_, __) =>
                          const Divider(height: 1, color: _divider),
                      itemBuilder: (_, i) =>
                          _InvitationTile(inv: invitations[i]),
                    ),
            ),
          ]),
        ),
      ),
    );
  }
}

// ──────────────────────────────────────────────────────────────
// Search pill button
// ──────────────────────────────────────────────────────────────
class _SearchPill extends StatelessWidget {
  final VoidCallback onTap;
  const _SearchPill({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 34,
        width: 140,
        decoration: BoxDecoration(
          color: const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Row(children: [
          SizedBox(width: 10),
          Icon(Icons.search_rounded, size: 15, color: Color(0xFF9CA3AF)),
          SizedBox(width: 5),
          Text('Tìm kiếm...',
              style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
        ]),
      ),
    );
  }
}

// ──────────────────────────────────────────────────────────────
// Invitation tile inside notification sheet
// ──────────────────────────────────────────────────────────────
class _InvitationTile extends StatelessWidget {
  final GroupInvitation inv;
  const _InvitationTile({required this.inv});

  String _fmt() {
    final diff = DateTime.now().difference(inv.createdAt);
    if (diff.inMinutes < 60) return 'Vừa xong';
    if (diff.inHours < 24) return '${diff.inHours} giờ trước';
    return '${diff.inDays} ngày trước';
  }

  void _snack(BuildContext ctx, String msg, Color color) {
    Navigator.pop(ctx); // close sheet
    ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: color,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(inv.projectName,
            style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: Color(0xFF111827))),
        const SizedBox(height: 3),
        Text('${inv.invitedByName} mời bạn tham gia',
            style:
                const TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
        const SizedBox(height: 2),
        Text(_fmt(),
            style:
                const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
        const SizedBox(height: 10),
        Row(children: [
          _Pill('Đồng ý', Icons.check_rounded, const Color(0xFF0F766E),
              const Color(0xFFCCFBF1),
              () => _snack(context, 'Đã chấp nhận lời mời nhóm',
                  const Color(0xFF16A34A))),
          const SizedBox(width: 8),
          _Pill('Từ chối', Icons.close_rounded, const Color(0xFF6B7280),
              const Color(0xFFF3F4F6),
              () => _snack(context, 'Đã từ chối lời mời',
                  const Color(0xFF6B7280))),
        ]),
      ]),
    );
  }
}

class _Pill extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final Color bg;
  final VoidCallback onTap;
  const _Pill(this.label, this.icon, this.color, this.bg, this.onTap);

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
              color: bg, borderRadius: BorderRadius.circular(8)),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(icon, size: 12, color: color),
            const SizedBox(width: 4),
            Text(label,
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: color)),
          ]),
        ),
      );
}
