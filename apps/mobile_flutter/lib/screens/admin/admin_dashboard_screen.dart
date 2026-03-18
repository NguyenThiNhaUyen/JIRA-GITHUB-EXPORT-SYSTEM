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
  final AdminService _adminService = AdminService();
  final AuthService _authService = AuthService();
  bool _isLoading = true;
  String _error = '';
  AppUser? _currentUser;

  String semester = '';
  String major = '';
  String subject = '';
  String classId = '';

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

  List<Map<String, dynamic>> commitData = [];
  List<Map<String, dynamic>> heatmapData = [];
  List<Map<String, dynamic>> teamRanking = [];
  List<Map<String, dynamic>> inactiveTeams = [];
  List<Map<String, dynamic>> teamActivity = [];
  List<Map<String, dynamic>> systemActivity = [];
  List<Map<String, dynamic>> recentCourses = [];
  List<Map<String, dynamic>> recentGroups = [];

  List<Map<String, dynamic>> _semestersData = [];
  List<Map<String, dynamic>> _subjectsData = [];
  List<Map<String, dynamic>> _coursesData = [];
  List<String> _majorsData = ['Software Engineering', 'Artificial Intelligence', 'Information Systems', 'Graphic Design'];

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
        commitData = List<Map<String, dynamic>>.from(data['commitData'] ?? []);
        heatmapData = List<Map<String, dynamic>>.from(data['heatmapData'] ?? []);
        teamRanking = List<Map<String, dynamic>>.from(data['teamRanking'] ?? []);
        inactiveTeams = List<Map<String, dynamic>>.from(data['inactiveTeams'] ?? []);
        teamActivity = List<Map<String, dynamic>>.from(data['teamActivity'] ?? []);
        systemActivity = List<Map<String, dynamic>>.from(data['systemActivity'] ?? []);
        recentCourses = List<Map<String, dynamic>>.from(data['recentCourses'] ?? []);
        recentGroups = List<Map<String, dynamic>>.from(data['recentGroups'] ?? []);

        _semestersData = List<Map<String, dynamic>>.from(data['semestersData'] ?? []);
        _subjectsData = List<Map<String, dynamic>>.from(data['subjectsData'] ?? []);
        _coursesData = List<Map<String, dynamic>>.from(data['coursesData'] ?? []);

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
                                _buildFilters(),
                                const SizedBox(height: 18),
                                _buildSystemOverview(stats),
                                const SizedBox(height: 18),
                                _buildIntegrationOverview(),
                                const SizedBox(height: 18),
                                isMobile
                                    ? Column(
                                        children: [
                                          _buildCommitChart(),
                                          const SizedBox(height: 18),
                                          _buildHeatmap(),
                                        ],
                                      )
                                    : Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Expanded(child: _buildCommitChart()),
                                          const SizedBox(width: 18),
                                          Expanded(child: _buildHeatmap()),
                                        ],
                                      ),
                                const SizedBox(height: 18),
                                isMobile
                                    ? Column(
                                        children: [
                                          _buildInactiveTeams(),
                                          const SizedBox(height: 18),
                                          _buildTopTeams(),
                                        ],
                                      )
                                    : Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Expanded(
                                            child: _buildInactiveTeams(),
                                          ),
                                          const SizedBox(width: 18),
                                          Expanded(child: _buildTopTeams()),
                                        ],
                                      ),
                                const SizedBox(height: 18),
                                _buildTeamActivityTable(),
                                const SizedBox(height: 18),
                                isMobile
                                    ? Column(
                                        children: [
                                          _buildQuickActions(),
                                          const SizedBox(height: 18),
                                          _buildActivityLog(),
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
                                const SizedBox(height: 18),
                                _buildRecentGroups(),
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

  Widget _buildFilters() {
    return _SectionCard(
      title: 'Bộ lọc',
      child: isMobile
          ? Column(
              children: [
                _buildDropdown(
                  value: semester,
                  hint: 'Semester',
                  items: _semestersData.map((e) => e['name']?.toString() ?? '').toList(),
                  onChanged: (value) => setState(() => semester = value ?? ''),
                ),
                const SizedBox(height: 12),
                _buildDropdown(
                  value: major,
                  hint: 'Major',
                  items: _majorsData,
                  onChanged: (value) => setState(() => major = value ?? ''),
                ),
                const SizedBox(height: 12),
                _buildDropdown(
                  value: subject,
                  hint: 'Subject',
                  items: _subjectsData.map((e) => e['code']?.toString() ?? '').toList(),
                  onChanged: (value) => setState(() => subject = value ?? ''),
                ),
                const SizedBox(height: 12),
                _buildDropdown(
                  value: classId,
                  hint: 'Class',
                  items: _coursesData.map((e) => e['code']?.toString() ?? '').toList(),
                  onChanged: (value) => setState(() => classId = value ?? ''),
                ),
              ],
            )
          : Row(
              children: [
                Expanded(
                  child: _buildDropdown(
                    value: semester,
                    hint: 'Semester',
                    items: _semestersData.map((e) => e['name']?.toString() ?? '').toList(),
                    onChanged: (value) =>
                        setState(() => semester = value ?? ''),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildDropdown(
                    value: major,
                    hint: 'Major',
                    items: _majorsData,
                    onChanged: (value) => setState(() => major = value ?? ''),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildDropdown(
                    value: subject,
                    hint: 'Subject',
                    items: _subjectsData.map((e) => e['code']?.toString() ?? '').toList(),
                    onChanged: (value) => setState(() => subject = value ?? ''),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildDropdown(
                    value: classId,
                    hint: 'Class',
                    items: _coursesData.map((e) => e['code']?.toString() ?? '').toList(),
                    onChanged: (value) => setState(() => classId = value ?? ''),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildDropdown({
    required String value,
    required String hint,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return DropdownButtonFormField<String>(
      value: value.isEmpty ? null : value,
      onChanged: onChanged,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: textSecondary),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: cardBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: cardBorder),
        ),
      ),
      items: items
          .map((e) => DropdownMenuItem<String>(value: e, child: Text(e)))
          .toList(),
    );
  }

  Widget _buildSystemOverview(Map<String, dynamic> stats) {
    final items = [
      {
        'label': 'Học kỳ',
        'value': '${stats['semesters'] ?? stats['Semesters'] ?? 0}',
        'icon': Icons.calendar_month_outlined,
        'color': const Color(0xFF3B82F6),
      },
      {
        'label': 'Môn học',
        'value': '${stats['subjects'] ?? stats['Subjects'] ?? 0}',
        'icon': Icons.library_books_outlined,
        'color': const Color(0xFF6366F1),
      },
      {
        'label': 'Lớp học phần',
        'value': '${stats['courses'] ?? stats['Courses'] ?? 0}',
        'icon': Icons.menu_book_outlined,
        'color': const Color(0xFF2563EB),
      },
      {
        'label': 'Giảng viên',
        'value': '${stats['lecturers'] ?? stats['Lecturers'] ?? 0}',
        'icon': Icons.manage_accounts_outlined,
        'color': const Color(0xFF8B5CF6),
      },
      {
        'label': 'Sinh viên',
        'value': '${stats['students'] ?? stats['Students'] ?? 0}',
        'icon': Icons.school_outlined,
        'color': const Color(0xFF14B8A6),
      },
      {
        'label': 'Nhóm dự án',
        'value': '${stats['projects'] ?? stats['Projects'] ?? 0}',
        'icon': Icons.folder_open_outlined,
        'color': const Color(0xFFF59E0B),
      },
    ];

    final crossAxisCount = isMobile ? 2 : 3;
    final ratio = isMobile ? 1.25 : 2.2;

    return _SectionCard(
      title: 'System Overview',
      subtitle: '${stats['activeSemesters'] ?? stats['ActiveSemesters'] ?? 0} học kỳ đang mở',
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
        'value': '${integrationStats['repoConnected'] ?? integrationStats['RepoConnected'] ?? 0}',
        'icon': Icons.folder_open_outlined,
        'color': const Color(0xFF10B981),
      },
      {
        'label': 'Missing Repo',
        'value': '${integrationStats['repoMissing'] ?? integrationStats['RepoMissing'] ?? 0}',
        'icon': Icons.error_outline,
        'color': const Color(0xFFEF4444),
      },
      {
        'label': 'Jira Project',
        'value': '${integrationStats['jiraConnected'] ?? integrationStats['JiraConnected'] ?? 0}',
        'icon': Icons.check_circle_outline,
        'color': const Color(0xFF3B82F6),
      },
      {
        'label': 'Sync Errors',
        'value': '${integrationStats['syncErrors'] ?? integrationStats['SyncErrors'] ?? 0}',
        'icon': Icons.warning_amber_rounded,
        'color': const Color(0xFFF59E0B),
      },
      {
        'label': 'Reports Exported',
        'value': '${integrationStats['reportsExported'] ?? integrationStats['ReportsExported'] ?? 0}',
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

  Widget _buildCommitChart() {
    final maxCommit = commitData
        .map((e) => e['commits'] as int)
        .fold<int>(0, (a, b) => a > b ? a : b);

    return _SectionCard(
      title: 'GitHub Commit Activity',
      subtitle: 'Biểu đồ commit theo ngày trong tuần.',
      child: SizedBox(
        height: 260,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: commitData.map((item) {
            final commits = item['commits'] as int;
            final ratio = maxCommit > 0 ? commits / maxCommit : 0.0;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      '$commits',
                      style: const TextStyle(
                        fontSize: 11,
                        color: textSecondary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 160 * ratio + 8,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [cyan, blue],
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      '${item['day']}',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildHeatmap() {
    return _SectionCard(
      title: 'Contribution Heatmap',
      subtitle: 'Mức độ hoạt động đóng góp của toàn hệ thống.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: heatmapData.map((item) {
              final count = item['count'] as int;
              return Container(
                width: 18,
                height: 18,
                decoration: BoxDecoration(
                  color: _heatmapColor(count),
                  borderRadius: BorderRadius.circular(4),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          Row(
            children: const [
              Text(
                'Less',
                style: TextStyle(fontSize: 12, color: textSecondary),
              ),
              SizedBox(width: 8),
              _LegendDot(color: Color(0xFFF3F4F6)),
              SizedBox(width: 4),
              _LegendDot(color: Color(0xFF99F6E4)),
              SizedBox(width: 4),
              _LegendDot(color: Color(0xFF5EEAD4)),
              SizedBox(width: 4),
              _LegendDot(color: Color(0xFF14B8A6)),
              SizedBox(width: 4),
              _LegendDot(color: Color(0xFF0F766E)),
              SizedBox(width: 8),
              Text(
                'More',
                style: TextStyle(fontSize: 12, color: textSecondary),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _heatmapColor(int count) {
    if (count >= 9) return const Color(0xFF0F766E);
    if (count >= 7) return const Color(0xFF14B8A6);
    if (count >= 4) return const Color(0xFF5EEAD4);
    if (count >= 1) return const Color(0xFF99F6E4);
    return const Color(0xFFF3F4F6);
  }

  Widget _buildTopTeams() {
    return _SectionCard(
      title: 'Top Team Contributions',
      child: Column(
        children: teamRanking.asMap().entries.map((entry) {
          final index = entry.key;
          final team = entry.value;
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              border: Border.all(color: cardBorder),
              borderRadius: BorderRadius.circular(16),
              color: const Color(0xFFFCFDFE),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 17,
                  backgroundColor: const Color(0xFFCCFBF1),
                  child: Text(
                    '${index + 1}',
                    style: const TextStyle(
                      color: teal,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    '${team['team']}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      color: textPrimary,
                    ),
                  ),
                ),
                Text(
                  '${team['commits']} commits',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: textPrimary,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildInactiveTeams() {
    return _SectionCard(
      title: 'Inactive Teams (AI)',
      child: Column(
        children: inactiveTeams.map((team) {
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              border: Border.all(color: const Color(0xFFFECACA)),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    '${team['team']}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      color: textPrimary,
                    ),
                  ),
                ),
                Flexible(
                  child: Text(
                    '${team['reason']}',
                    textAlign: TextAlign.right,
                    style: const TextStyle(
                      color: Color(0xFFDC2626),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
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

  Widget _buildTeamActivityTable() {
    return _SectionCard(
      title: 'Team Activity Overview',
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          headingTextStyle: const TextStyle(
            fontWeight: FontWeight.w700,
            color: textSecondary,
            fontSize: 12,
          ),
          dataTextStyle: const TextStyle(color: textPrimary, fontSize: 13),
          columnSpacing: 28,
          columns: const [
            DataColumn(label: Text('Team')),
            DataColumn(label: Text('Repo')),
            DataColumn(label: Text('Commits')),
            DataColumn(label: Text('Last Commit')),
            DataColumn(label: Text('Status')),
          ],
          rows: teamActivity.map((item) {
            return DataRow(
              cells: [
                DataCell(Text('${item['team']}')),
                DataCell(
                  Text((item['repo'] == true) ? 'Connected' : 'Missing'),
                ),
                DataCell(Text('${item['commits']}')),
                DataCell(Text('${item['lastCommit']}')),
                DataCell(_statusChip('${item['status']}')),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildActivityLog() {
    return _SectionCard(
      title: 'Hoạt động hệ thống',
      child: Column(
        children: systemActivity.map((item) {
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
                    color: item['bg'] is Color ? item['bg'] : const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    item['icon'] is IconData ? item['icon'] : Icons.local_activity_outlined,
                    size: 18,
                    color: item['fg'] is Color ? item['fg'] : const Color(0xFF2563EB),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${item['msg']}',
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
                            '${item['time']}',
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
        'label': 'Tạo học kỳ',
        'route': '/admin/semesters',
      },
      {
        'icon': Icons.library_books_outlined,
        'label': 'Tạo môn học',
        'route': '/admin/subjects',
      },
      {
        'icon': Icons.menu_book_outlined,
        'label': 'Tạo lớp học phần',
        'route': '/admin/courses',
      },
      {
        'icon': Icons.group_work_outlined,
        'label': 'Create Groups',
        'route': '/admin/groups',
      },
    ];

    return _SectionCard(
      title: 'Thao tác nhanh',
      child: GridView.builder(
        itemCount: actions.length,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: isTablet ? 3 : 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.9,
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
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(item['icon'] as IconData, color: textPrimary),
                    ),
                    const Spacer(),
                    Text(
                      item['label'] as String,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        color: textPrimary,
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
                            Text('${course['subjectCode']}'),
                            Text('${course['semesterName']}'),
                            const SizedBox(height: 8),
                            Text(
                              '${course['currentStudents']}/${course['maxStudents']}',
                            ),
                            const SizedBox(height: 8),
                            _courseStatusBadge('${course['status']}'),
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
                              child: Text(
                                '${course['subjectCode']}\n${course['semesterName']}',
                                textAlign: TextAlign.center,
                              ),
                            ),
                            Expanded(
                              child: Text(
                                '${course['currentStudents']}/${course['maxStudents']}',
                                textAlign: TextAlign.center,
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

  Widget _buildRecentGroups() {
    return _SectionCard(
      title: 'Recent Project Groups',
      child: Column(
        children: recentGroups.map((g) {
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
                        '${g['id']}',
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: teal,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text('Class: ${g['course']}'),
                      const SizedBox(height: 6),
                      Text('GitHub: ${(g['github'] == true) ? "✓" : "✗"}'),
                      const SizedBox(height: 6),
                      Text('Jira: ${(g['jira'] == true) ? "✓" : "✗"}'),
                      const SizedBox(height: 8),
                      _statusChip('${g['status']}'),
                    ],
                  )
                : Row(
                    children: [
                      Expanded(
                        child: Text(
                          '${g['id']}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: teal,
                          ),
                        ),
                      ),
                      Expanded(child: Text('${g['course']}')),
                      Expanded(
                        child: Text(
                          (g['github'] == true) ? '✓' : '✗',
                          textAlign: TextAlign.center,
                        ),
                      ),
                      Expanded(
                        child: Text(
                          (g['jira'] == true) ? '✓' : '✗',
                          textAlign: TextAlign.center,
                        ),
                      ),
                      Expanded(
                        child: Center(child: _statusChip('${g['status']}')),
                      ),
                    ],
                  ),
          );
        }).toList(),
      ),
    );
  }

  Widget _statusChip(String status) {
    Color bg;
    Color fg;

    switch (status) {
      case 'ACTIVE':
        bg = const Color(0xFFECFDF5);
        fg = const Color(0xFF15803D);
        break;
      case 'LOW':
        bg = const Color(0xFFFEFCE8);
        fg = const Color(0xFFA16207);
        break;
      case 'MISSING_REPO':
        bg = const Color(0xFFFEF2F2);
        fg = const Color(0xFFDC2626);
        break;
      case 'MISSING_JIRA':
        bg = const Color(0xFFFFF7ED);
        fg = const Color(0xFFEA580C);
        break;
      default:
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
        status,
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: fg),
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

class _LegendDot extends StatelessWidget {
  final Color color;

  const _LegendDot({required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 13,
      height: 13,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}
