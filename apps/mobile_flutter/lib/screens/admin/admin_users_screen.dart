// Admin User Management Screen (Flutter Mobile)
// Converted from users.jsx
import 'package:flutter/material.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/admin_navigation.dart';
import '../../services/admin_service.dart';

class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});
  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  // ── Colors ──────────────────────────────────────────────
  static const Color bg = Color(0xFFF8FAFC);
  static const Color cardBorder = Color(0xFFE2E8F0);
  static const Color txtPrimary = Color(0xFF0F172A);
  static const Color txtSec = Color(0xFF64748B);
  static const Color teal = Color(0xFF0F766E);

  final AdminService _adminService = AdminService();
  bool _isLoading = false;

  // ── Role config ─────────────────────────────────────────
  static const Map<String, Map<String, dynamic>> _roleCfg = {
    'ADMIN': {
      'label': 'Admin',
      'color': Color(0xFF7C3AED),
      'bg': Color(0xFFF5F3FF),
    },
    'LECTURER': {
      'label': 'Giảng viên',
      'color': Color(0xFF0F766E),
      'bg': Color(0xFFF0FDFA),
    },
    'STUDENT': {
      'label': 'Sinh viên',
      'color': Color(0xFF2563EB),
      'bg': Color(0xFFEFF6FF),
    },
  };

  // ── State ────────────────────────────────────────────────
  late List<Map<String, dynamic>> _users;

  @override
  void initState() {
    super.initState();
    _users = [];
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() => _isLoading = true);
    try {
      final users = await _adminService.getUsers();
      setState(() {
        _users = users;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      _snack('Lỗi tải danh sách người dùng', ok: false);
    }
  }

  // ── State ────────────────────────────────────────────────
  String _search = '';
  String _filterRole = 'all';
  String? _openMenuId;

  List<Map<String, dynamic>> get _filtered => _users.where((u) {
    final matchSearch =
        _search.isEmpty ||
        (u['name'] as String).toLowerCase().contains(_search.toLowerCase()) ||
        (u['email'] as String).toLowerCase().contains(_search.toLowerCase());
    final matchRole = _filterRole == 'all' || u['role'] == _filterRole;
    return matchSearch && matchRole;
  }).toList();

  int _countByRole(String role) =>
      _users.where((u) => u['role'] == role).length;

  // ── Actions ──────────────────────────────────────────────
  void _snack(String msg, {bool ok = true}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: ok ? const Color(0xFF16A34A) : Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _changeRole(String userId, String newRole) {
    setState(() {
      final idx = _users.indexWhere((u) => u['id'] == userId);
      if (idx != -1) _users[idx]['role'] = newRole;
      _openMenuId = null;
    });
    _snack('Đã cập nhật quyền thành ${_roleCfg[newRole]!['label']}');
  }

  void _toggleStatus(String userId, String currentStatus) {
    setState(() {
      final idx = _users.indexWhere((u) => u['id'] == userId);
      if (idx != -1) {
        _users[idx]['status'] = currentStatus == 'DISABLED'
            ? 'ACTIVE'
            : 'DISABLED';
      }
      _openMenuId = null;
    });
    _snack('Đã cập nhật trạng thái tài khoản');
  }

  void _resetPassword(String userId, String name) {
    setState(() => _openMenuId = null);
    _snack('Đã gửi email đặt lại mật khẩu đến $name');
  }

  // ── BUILD ────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isMobile = width < 900;
    final horizontalPadding = isMobile ? 16.0 : 24.0;

    return Scaffold(
      backgroundColor: const Color(0xFFEFF7F5),
      drawer: isMobile ? const AdminDrawer() : null,
      body: SafeArea(
        child: Row(
          children: [
            if (!isMobile) const AdminSidebar(),
            Expanded(
              child: Container(
                margin: EdgeInsets.all(isMobile ? 0 : 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(isMobile ? 0 : 36),
                ),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  children: [
                    _buildTopHeader(isMobile),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _openMenuId = null),
                        child: SingleChildScrollView(
                          padding: EdgeInsets.all(horizontalPadding),
                          child: Center(
                            child: ConstrainedBox(
                              constraints: const BoxConstraints(maxWidth: 1400),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildStats(),
                                  const SizedBox(height: 12),
                                  _buildSearchFilter(),
                                  const SizedBox(height: 12),
                                  if (_isLoading)
                                    const Center(
                                      child: Padding(
                                        padding: EdgeInsets.all(40),
                                        child: CircularProgressIndicator(color: teal),
                                      ),
                                    )
                                  else if (_filtered.isEmpty)
                                    _buildEmpty()
                                  else
                                    ListView.builder(
                                      shrinkWrap: true,
                                      physics: const NeverScrollableScrollPhysics(),
                                      itemCount: _filtered.length,
                                      itemBuilder: (_, i) => _buildUserCard(_filtered[i]),
                                    ),
                                  const SizedBox(height: 24),
                                ],
                              ),
                            ),
                          ),
                        ),
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

  Widget _buildTopHeader(bool isMobile) {
    return const AppTopHeader(
      title: 'Quản lý Tài khoản',
      primary: false,
      user: AppUser(
        name: 'Super Admin',
        email: 'admin@fe.edu.vn',
        role: 'ADMIN',
      ),
    );
  }

  // ── Stats row ────────────────────────────────────────────
  Widget _buildStats() {
    final stats = [
      {
        'label': 'Tổng',
        'value': _users.length,
        'color': txtSec,
        'bg': const Color(0xFFF1F5F9),
      },
      {
        'label': 'Admin',
        'value': _countByRole('ADMIN'),
        'color': const Color(0xFF7C3AED),
        'bg': const Color(0xFFF5F3FF),
      },
      {
        'label': 'Giảng viên',
        'value': _countByRole('LECTURER'),
        'color': teal,
        'bg': const Color(0xFFF0FDFA),
      },
      {
        'label': 'Sinh viên',
        'value': _countByRole('STUDENT'),
        'color': const Color(0xFF2563EB),
        'bg': const Color(0xFFEFF6FF),
      },
    ];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Row(
        children: stats.map((s) {
          final color = s['color'] as Color;
          return Expanded(
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              decoration: BoxDecoration(
                color: s['bg'] as Color,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: color.withOpacity(0.2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    s['label'] as String,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: color,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${s['value']}',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: color,
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ── Search + Filter ──────────────────────────────────────
  Widget _buildSearchFilter() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Column(
        children: [
          TextField(
            onChanged: (v) => setState(() => _search = v),
            decoration: InputDecoration(
              hintText: 'Tìm theo tên hoặc email...',
              hintStyle: const TextStyle(color: txtSec, fontSize: 13),
              prefixIcon: const Icon(Icons.search_rounded, color: txtSec),
              filled: true,
              fillColor: bg,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 0,
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: cardBorder),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: cardBorder),
              ),
            ),
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ['all', 'ADMIN', 'LECTURER', 'STUDENT'].map((r) {
                final selected = _filterRole == r;
                final label = r == 'all'
                    ? 'Tất cả'
                    : (_roleCfg[r]!['label'] as String);
                return GestureDetector(
                  onTap: () => setState(() => _filterRole = r),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 7,
                    ),
                    decoration: BoxDecoration(
                      color: selected ? teal : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: selected ? teal : cardBorder),
                    ),
                    child: Text(
                      label,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: selected ? Colors.white : txtSec,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  // ── User Card ────────────────────────────────────────────
  Widget _buildUserCard(Map<String, dynamic> u) {
    final role = u['role'] as String;
    final isActive = u['status'] != 'DISABLED';
    final cfg = _roleCfg[role] ?? _roleCfg['STUDENT']!;
    final roleColor = cfg['color'] as Color;
    final roleBg = cfg['bg'] as Color;
    final initials = (u['name'] as String).isNotEmpty
        ? (u['name'] as String)[0]
        : '?';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(color: roleBg, shape: BoxShape.circle),
              child: Center(
                child: Text(
                  initials,
                  style: TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                    color: roleColor,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Name + email + studentId
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    u['name'] as String,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                      color: txtPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    u['email'] as String,
                    style: const TextStyle(fontSize: 11, color: txtSec),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (u['studentId'] != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      u['studentId'] as String,
                      style: const TextStyle(
                        fontSize: 10,
                        color: txtSec,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      // Role badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: roleBg,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: roleColor.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          cfg['label'] as String,
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            color: roleColor,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      // Status badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: isActive
                              ? const Color(0xFFF0FDF4)
                              : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isActive
                                  ? Icons.check_circle_rounded
                                  : Icons.cancel_rounded,
                              size: 9,
                              color: isActive
                                  ? const Color(0xFF16A34A)
                                  : txtSec,
                            ),
                            const SizedBox(width: 3),
                            Text(
                              isActive ? 'Hoạt động' : 'Vô hiệu hóa',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                                color: isActive
                                    ? const Color(0xFF16A34A)
                                    : txtSec,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Action menu button
            _buildActionMenu(u, isActive, roleColor),
          ],
        ),
      ),
    );
  }

  // ── Action Menu (popup) ───────────────────────────────────
  Widget _buildActionMenu(
    Map<String, dynamic> u,
    bool isActive,
    Color roleColor,
  ) {
    final isOpen = _openMenuId == u['id'];

    return Stack(
      clipBehavior: Clip.none,
      children: [
        GestureDetector(
          onTap: () {
            setState(() => _openMenuId = isOpen ? null : u['id'] as String);
          },
          child: Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: isOpen ? const Color(0xFFF1F5F9) : Colors.transparent,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.more_horiz_rounded,
              size: 18,
              color: txtSec,
            ),
          ),
        ),
        if (isOpen)
          Positioned(
            right: 0,
            top: 34,
            child: Material(
              elevation: 8,
              borderRadius: BorderRadius.circular(16),
              shadowColor: Colors.black.withValues(alpha: 0.12),
              child: GestureDetector(
                onTap: () {}, // prevent closing
                child: Container(
                  width: 200,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: cardBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Change role section
                      const Padding(
                        padding: EdgeInsets.fromLTRB(14, 10, 14, 4),
                        child: Text(
                          'ĐỔI QUYỀN',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            color: txtSec,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                      ...[
                        'ADMIN',
                        'LECTURER',
                        'STUDENT',
                      ].where((r) => r != u['role']).map((r) {
                        final cfg = _roleCfg[r]!;
                        return InkWell(
                          onTap: () => _changeRole(u['id'] as String, r),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 10,
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.shield_outlined,
                                  size: 14,
                                  color: cfg['color'] as Color,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Đổi thành ${cfg['label']}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: txtPrimary,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                      const Divider(height: 1, color: cardBorder),
                      // Toggle status
                      InkWell(
                        onTap: () => _showConfirmDialog(
                          title: isActive
                              ? 'Vô hiệu hóa tài khoản'
                              : 'Kích hoạt tài khoản',
                          content: isActive
                              ? 'Tài khoản ${u['name']} sẽ bị vô hiệu hóa và không thể đăng nhập?'
                              : 'Kích hoạt lại tài khoản ${u['name']}?',
                          confirmLabel: isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
                          confirmColor: isActive
                              ? Colors.red
                              : const Color(0xFF16A34A),
                          onConfirm: () => _toggleStatus(
                            u['id'] as String,
                            u['status'] as String,
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 10,
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isActive
                                    ? Icons.person_off_outlined
                                    : Icons.person_outlined,
                                size: 14,
                                color: isActive
                                    ? Colors.red
                                    : const Color(0xFF16A34A),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                isActive ? 'Vô hiệu hóa TK' : 'Kích hoạt TK',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: isActive
                                      ? Colors.red
                                      : const Color(0xFF16A34A),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      // Reset password
                      InkWell(
                        onTap: () => _showConfirmDialog(
                          title: 'Đặt lại mật khẩu',
                          content:
                              'Gửi email đặt lại mật khẩu đến ${u['name']}?',
                          confirmLabel: 'Gửi email',
                          confirmColor: const Color(0xFF2563EB),
                          onConfirm: () => _resetPassword(
                            u['id'] as String,
                            u['name'] as String,
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(14, 10, 14, 12),
                          child: Row(
                            children: const [
                              Icon(
                                Icons.key_outlined,
                                size: 14,
                                color: Color(0xFF2563EB),
                              ),
                              SizedBox(width: 8),
                              Text(
                                'Đặt lại mật khẩu',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF2563EB),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  // ── Confirm Dialog ────────────────────────────────────────
  void _showConfirmDialog({
    required String title,
    required String content,
    required String confirmLabel,
    required Color confirmColor,
    required VoidCallback onConfirm,
  }) {
    setState(() => _openMenuId = null);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          title,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
        content: Text(
          content,
          style: const TextStyle(fontSize: 13, color: txtSec),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy', style: TextStyle(color: txtSec)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: confirmColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              onConfirm();
            },
            child: Text(confirmLabel),
          ),
        ],
      ),
    );
  }

  // ── Empty state ───────────────────────────────────────────
  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDFA),
              borderRadius: BorderRadius.circular(24),
            ),
            child: const Icon(
              Icons.people_outline_rounded,
              size: 36,
              color: teal,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Không tìm thấy người dùng',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: txtPrimary,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm',
            style: TextStyle(fontSize: 13, color: txtSec),
          ),
        ],
      ),
    );
  }
}
