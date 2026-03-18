import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/admin_navigation.dart';
import '../../services/admin_dashboard_service.dart';
import '../../services/admin_service.dart';
import '../../services/auth_service.dart';
class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final AdminDashboardService _dashboardService = AdminDashboardService();
  final AuthService _authService = AuthService();
  bool _isLoading = true;
  String _error = '';
  AppUser? _currentUser;

  static const Color bgColor = Color(0xFFEFF7F5);
  static const Color contentBg = Color(0xFFF8FAFC);
  static const Color cardBorder = Color(0xFFE7ECF3);
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color teal = Color(0xFF0F766E);
  static const Color cyan = Color(0xFF0891B2);
  static const Color blue = Color(0xFF2563EB);

  Map<String, dynamic> stats = {
    'semesters': 0,
    'subjects': 0,
    'courses': 0,
    'lecturers': 0,
    'students': 0,
    'projects': 0,
    'activeSemesters': 0,
  };

  Map<String, dynamic> integrationStats = {
    'repoConnected': 0,
    'repoMissing': 0,
    'jiraConnected': 0,
    'syncErrors': 0,
    'reportsExported': 0,
  };

  List<Map<String, dynamic>> systemActivity = [];
  List<Map<String, dynamic>> recentCourses = [];

  @override
  void initState() {
    super.initState();
    _loadUser();
    _loadDashboardData();
  }

  Future<void> _loadUser() async {
    final user = await _authService.getCurrentUser();
    if (user != null && mounted) {
      setState(() {
        _currentUser = AppUser(
          name: user.fullName.isNotEmpty ? user.fullName : 'Admin',
          email: user.email,
          role: user.roles.isNotEmpty ? user.roles.first : 'ADMIN',
        );
      });
    }
  }

  Future<void> _loadDashboardData() async {
    try {
      final data = await _dashboardService.getDashboardData();
      
      setState(() {
        stats = Map<String, dynamic>.from(data['stats'] ?? {});
        integrationStats = Map<String, dynamic>.from(data['integrationStats'] ?? {});
        systemActivity = List<Map<String, dynamic>>.from(data['systemActivity'] ?? []);
        recentCourses = List<Map<String, dynamic>>.from(data['recentCourses'] ?? []);

        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  bool get isMobile => MediaQuery.of(context).size.width < 900;
  bool get isTablet =>
      MediaQuery.of(context).size.width >= 900 &&
      MediaQuery.of(context).size.width < 1200;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgColor,
      drawer: isMobile ? const AdminDrawer() : null,
      body: SafeArea(
        child: Row(
          children: [
            if (!isMobile) const AdminSidebar(),
            Expanded(
              child: Container(
                margin: EdgeInsets.all(isMobile ? 0 : 14),
                decoration: BoxDecoration(
                  color: contentBg,
                  borderRadius: BorderRadius.circular(isMobile ? 0 : 36),
                ),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  children: [
                    _buildTopBar(),
                    Expanded(
                      child: _isLoading
                          ? const Center(
                              child: CircularProgressIndicator(color: blue))
                          : _error.isNotEmpty
                              ? Center(
                                  child: Text('Error: $_error',
                                      style: const TextStyle(color: Colors.red)))
                              : SingleChildScrollView(
                                  padding: EdgeInsets.all(isMobile ? 16 : 24),
                        child: Center(
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(maxWidth: 1400),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildBreadcrumb(),
                                const SizedBox(height: 18),
                                _buildSystemOverview(stats),
                                const SizedBox(height: 18),
                                _buildIntegrationOverview(),
                                const SizedBox(height: 18),
                                isMobile
                                    ? Column(
                                        children: [
                                          _buildActivityLog(),
                                          const SizedBox(height: 18),
                                          _buildQuickActions(),
                                        ],
                                      )
                                    : Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Expanded(
                                            flex: 3,
                                            child: _buildActivityLog(),
                                          ),
                                          const SizedBox(width: 18),
                                          Expanded(
                                            flex: 2,
                                            child: _buildQuickActions(),
                                          ),
                                        ],
                                      ),
                                const SizedBox(height: 18),
                                _buildRecentCourses(),
                              ],
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

  Widget _buildTopBar() {
    return AppTopHeader(
      title: 'Tổng quan',
      primary: false,
      user: _currentUser ?? const AppUser(
        name: 'Super Admin',
        email: 'admin@fe.edu.vn',
        role: 'ADMIN',
      ),
    );
  }

  Widget _buildBreadcrumb() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: const [
          Text(
            'Admin',
            style: TextStyle(
              color: teal,
              fontWeight: FontWeight.w700,
              fontSize: 12,
            ),
          ),
          SizedBox(width: 4),
          Icon(Icons.chevron_right, size: 14, color: textSecondary),
          SizedBox(width: 4),
          Text(
            'Tổng quan hệ thống',
            style: TextStyle(
              color: textPrimary,
              fontWeight: FontWeight.w700,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSystemOverview(Map<String, dynamic> stats) {
    final items = [
      {
        'label': 'Học kỳ',
        'value': '${stats['semesters'] ?? 0}',
        'icon': Icons.calendar_month_outlined,
        'color': const Color(0xFF3B82F6),
      },
      {
        'label': 'Môn học',
        'value': '${stats['subjects'] ?? 0}',
        'icon': Icons.library_books_outlined,
        'color': const Color(0xFF6366F1),
      },
      {
        'label': 'Lớp học phần',
        'value': '${stats['courses'] ?? 0}',
        'icon': Icons.menu_book_outlined,
        'color': const Color(0xFF2563EB),
      },
      {
        'label': 'Giảng viên',
        'value': '${stats['lecturers'] ?? 0}',
        'icon': Icons.manage_accounts_outlined,
        'color': const Color(0xFF8B5CF6),
      },
      {
        'label': 'Sinh viên',
        'value': '${stats['students'] ?? 0}',
        'icon': Icons.school_outlined,
        'color': const Color(0xFF14B8A6),
      },
      {
        'label': 'Nhóm dự án',
        'value': '${stats['projects'] ?? 0}',
        'icon': Icons.folder_open_outlined,
        'color': const Color(0xFFF59E0B),
      },
    ];

    final crossAxisCount = isMobile ? 2 : 3;
    final ratio = isMobile ? 1.25 : 2.2;

    return _SectionCard(
      title: 'System Overview',
      subtitle: '${stats['activeSemesters'] ?? 0} học kỳ đang mở',
      child: GridView.builder(
        itemCount: items.length,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: ratio,
        ),
        itemBuilder: (context, index) {
          final item = items[index];

          return Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: const Color(0xFFFCFDFE),
              border: Border.all(color: cardBorder),
            ),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: (item['color'] as Color).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    item['icon'] as IconData,
                    color: item['color'] as Color,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      FittedBox(
                        fit: BoxFit.scaleDown,
                        alignment: Alignment.centerLeft,
                        child: Text(
                          item['value'] as String,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: textPrimary,
                          ),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item['label'] as String,
                        style: const TextStyle(
                          fontSize: 12,
                          color: textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildIntegrationOverview() {
    final items = [
      {
        'label': 'Repo Connected',
        'value': '${integrationStats['repoConnected'] ?? 0}',
        'icon': Icons.folder_open_outlined,
        'color': const Color(0xFF10B981),
      },
      {
        'label': 'Missing Repo',
        'value': '${integrationStats['repoMissing'] ?? 0}',
        'icon': Icons.error_outline,
        'color': const Color(0xFFEF4444),
      },
      {
        'label': 'Jira Project',
        'value': '${integrationStats['jiraConnected'] ?? 0}',
        'icon': Icons.check_circle_outline,
        'color': const Color(0xFF3B82F6),
      },
      {
        'label': 'Sync Errors',
        'value': '${integrationStats['syncErrors'] ?? 0}',
        'icon': Icons.warning_amber_rounded,
        'color': const Color(0xFFF59E0B),
      },
      {
        'label': 'Reports Exported',
        'value': '${integrationStats['reportsExported'] ?? 0}',
        'icon': Icons.trending_up,
        'color': const Color(0xFF6366F1),
      },
    ];

    final crossAxisCount = isMobile ? 2 : 3;
    final ratio = isMobile ? 1.25 : 2.2;

    return _SectionCard(
      title: 'Integration Overview',
      subtitle: 'Tình trạng kết nối GitHub, Jira và báo cáo hệ thống',
      child: GridView.builder(
        itemCount: items.length,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: ratio,
        ),
        itemBuilder: (context, index) {
          final item = items[index];

          return Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: const Color(0xFFFCFDFE),
              border: Border.all(color: cardBorder),
            ),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: (item['color'] as Color).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    item['icon'] as IconData,
                    color: item['color'] as Color,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      FittedBox(
                        fit: BoxFit.scaleDown,
                        alignment: Alignment.centerLeft,
                        child: Text(
                          item['value'] as String,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: textPrimary,
                          ),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item['label'] as String,
                        style: const TextStyle(
                          fontSize: 12,
                          color: textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }


  Widget _buildActivityLog() {
    return _SectionCard(
      title: 'Hoạt động hệ thống',
      child: Column(
        children: systemActivity.map((item) {
          final type = (item['type'] ?? item['Type'] ?? '').toString().toLowerCase();
          
          IconData icon;
          Color color;
          Color bg;

          switch (type) {
            case 'github':
              icon = Icons.code_rounded;
              color = const Color(0xFF0D9488);
              bg = const Color(0xFFF0FDFA);
              break;
            case 'jira':
              icon = Icons.assignment_rounded;
              color = const Color(0xFF2563EB);
              bg = const Color(0xFFEFF6FF);
              break;
            case 'success':
              icon = Icons.check_circle_rounded;
              color = const Color(0xFF16A34A);
              bg = const Color(0xFFF0FDF4);
              break;
            case 'warning':
              icon = Icons.warning_amber_rounded;
              color = const Color(0xFFD97706);
              bg = const Color(0xFFFFFBEB);
              break;
            case 'error':
              icon = Icons.error_outline_rounded;
              color = const Color(0xFFDC2626);
              bg = const Color(0xFFFEF2F2);
              break;
            default:
              icon = Icons.info_outline_rounded;
              color = const Color(0xFF64748B);
              bg = const Color(0xFFF8FAFC);
          }

          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              border: Border.all(color: cardBorder),
              borderRadius: BorderRadius.circular(16),
              color: const Color(0xFFFCFDFE),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: bg,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(icon, size: 18, color: color),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${item['message'] ?? item['Message'] ?? item['msg'] ?? ""}',
                        style: const TextStyle(
                          color: textPrimary,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Row(
                        children: [
                          const Icon(
                            Icons.access_time,
                            size: 12,
                            color: textSecondary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${item['time'] ?? item['Time'] ?? "Vừa xong"}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      {
        'icon': Icons.calendar_month_outlined,
        'label': 'Học kỳ',
        'route': '/admin/semesters',
      },
      {
        'icon': Icons.library_books_outlined,
        'label': 'Môn học',
        'route': '/admin/subjects',
      },
      {
        'icon': Icons.menu_book_outlined,
        'label': 'Lớp HP',
        'route': '/admin/courses',
      },
      {
        'icon': Icons.assignment_ind_outlined,
        'label': 'Phân giảng',
        'route': '/admin/lecturer-assignment',
      },
      {
        'icon': Icons.people_outline_rounded,
        'label': 'Người dùng',
        'route': '/admin/users',
      },
      {
        'icon': Icons.trending_up,
        'label': 'Báo cáo',
        'route': '/admin/reports',
      },
    ];

    return _SectionCard(
      title: 'Thao tác nhanh',
      child: GridView.builder(
        itemCount: actions.length,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: isMobile ? 3 : (isTablet ? 3 : 2),
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: isMobile ? 0.95 : 1.1,
        ),
        itemBuilder: (context, index) {
          final item = actions[index];
          return InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () => context.go(item['route'] as String),
            child: Ink(
              decoration: BoxDecoration(
                border: Border.all(color: cardBorder),
                borderRadius: BorderRadius.circular(16),
                color: const Color(0xFFFCFDFE),
              ),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(item['icon'] as IconData, size: 20, color: textPrimary),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      item['label'] as String,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 10,
                        color: textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildRecentCourses() {
    return _SectionCard(
      title: 'Lớp học phần gần đây',
      trailing: TextButton(
        onPressed: () => context.go('/admin/courses'),
        child: const Text('Xem tất cả'),
      ),
      child: recentCourses.isEmpty
          ? const Padding(
              padding: EdgeInsets.symmetric(vertical: 20),
              child: Center(
                child: Text(
                  'No data yet — Create your first course',
                  style: TextStyle(color: textSecondary),
                ),
              ),
            )
          : Column(
              children: recentCourses.map((course) {
                final subjectCode = course['subject']?['code'] ?? course['subjectCode'] ?? 'N/A';
                final semesterName = course['semester']?['name'] ?? course['semesterName'] ?? 'N/A';
                final current = course['currentStudents'] ?? 0;
                final max = course['maxStudents'] ?? 40;

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    border: Border.all(color: cardBorder),
                    borderRadius: BorderRadius.circular(16),
                    color: const Color(0xFFFCFDFE),
                  ),
                  child: isMobile
                      ? Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${course['code']}',
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${course['name']}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: textSecondary,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Row(
                               children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.blue.shade50,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      '$subjectCode',
                                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blue.shade700),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text('$semesterName', style: const TextStyle(fontSize: 12, color: textSecondary)),
                               ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                               children: [
                                  Text('$current', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                  Text('/$max', style: const TextStyle(fontSize: 13, color: Colors.grey)),
                                  const Spacer(),
                                  _courseStatusBadge('${course['status']}'),
                               ],
                            ),
                          ],
                        )
                      : Row(
                          children: [
                            Expanded(
                              flex: 3,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${course['code']}',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      color: textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${course['name']}',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Expanded(
                              flex: 2,
                              child: Column(
                                 children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.blue.shade50,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        '$subjectCode',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blue.shade700),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text('$semesterName', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                                 ],
                              ),
                            ),
                            Expanded(
                              child: Center(
                                child: RichText(
                                   text: TextSpan(
                                      children: [
                                         TextSpan(text: '$current', style: const TextStyle(color: textPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
                                         TextSpan(text: '/$max', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                      ],
                                   ),
                                ),
                              ),
                            ),
                            Expanded(
                              child: Center(
                                child: _courseStatusBadge(
                                  '${course['status']}',
                                ),
                              ),
                            ),
                          ],
                        ),
                );
              }).toList(),
            ),
    );
  }

  Widget _courseStatusBadge(String status) {
    String label;
    Color bg;
    Color fg;

    switch (status) {
      case 'ACTIVE':
        label = 'Đang mở';
        bg = const Color(0xFFECFDF5);
        fg = const Color(0xFF15803D);
        break;
      case 'UPCOMING':
        label = 'Sắp mở';
        bg = const Color(0xFFEFF6FF);
        fg = const Color(0xFF2563EB);
        break;
      case 'COMPLETED':
        label = 'Đã kết thúc';
        bg = const Color(0xFFF3F4F6);
        fg = const Color(0xFF6B7280);
        break;
      case 'CLOSED':
        label = 'Đã đóng';
        bg = const Color(0xFFF3F4F6);
        fg = const Color(0xFF6B7280);
        break;
      default:
        label = status;
        bg = const Color(0xFFF3F4F6);
        fg = const Color(0xFF6B7280);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: fg),
      ),
    );
  }
}


class _SectionCard extends StatelessWidget {
  final String? title;
  final String? subtitle;
  final Widget child;
  final Widget? trailing;

  const _SectionCard({
    this.title,
    this.subtitle,
    required this.child,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: _AdminDashboardScreenState.cardBorder),
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 14,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null) ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title!,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: _AdminDashboardScreenState.textPrimary,
                        ),
                      ),
                      if (subtitle != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          subtitle!,
                          style: const TextStyle(
                            fontSize: 12,
                            color: _AdminDashboardScreenState.textSecondary,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                if (trailing != null) trailing!,
              ],
            ),
            const SizedBox(height: 14),
          ],
          child,
        ],
      ),
    );
  }
}


