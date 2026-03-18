// Lecturer Dashboard Screen - based on lecturer-dashboard.jsx
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/lecturer_navigation.dart';
import '../../services/lecturer_service.dart';
import '../../services/admin_service.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';

class LecturerDashboardScreen extends StatefulWidget {
  const LecturerDashboardScreen({super.key});

  @override
  State<LecturerDashboardScreen> createState() =>
      _LecturerDashboardScreenState();
}

class _LecturerDashboardScreenState extends State<LecturerDashboardScreen> {
  // ─── Colors ───────────────────────────────────────
  static const Color bgColor = Color(0xFFF8FAFB);
  static const Color cardBorder = Color(0xFFF0F0F0);
  static const Color textPrimary = Color(0xFF1A202C);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color teal = Color(0xFF0F766E);
  static const Color tealLight = Color(0xFF14B8A6);

  final LecturerService _lecturerService = LecturerService();
  final AdminService _adminService = AdminService();
  final AuthService _authService = AuthService();

  bool _isLoading = true;
  User? _currentUser;
  Map<String, dynamic> _workload = {};
  List<Map<String, dynamic>> _activities = [];
  List<Map<String, dynamic>> _subjects = [];
  List<Map<String, dynamic>> _courses = [];
  List<Map<String, dynamic>> _groups = [];

  static const List<Map<String, dynamic>> _commits = [];

  String _selectedSubject = '';
  String _selectedCourse = '';
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    setState(() => _isLoading = true);
    try {
      final user = await _authService.getCurrentUser();
      if (user != null) {
        final results = await Future.wait([
          _lecturerService.getWorkload(user.id),
          _adminService.getSubjects(),
          _adminService.getCourses(),
          _lecturerService.getActivityLogs(),
        ]);

        setState(() {
          _currentUser = user;
          _workload = results[0] as Map<String, dynamic>;
          _subjects = List<Map<String, dynamic>>.from(results[1] as List);
          _courses = List<Map<String, dynamic>>.from(results[2] as List);
          _activities = List<Map<String, dynamic>>.from(results[3] as List);

          if (_subjects.isNotEmpty) {
            _selectedSubject = _subjects[0]['id'].toString();
            _onSubjectChanged(_selectedSubject);
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
      _showSnack("Lỗi tải dữ liệu", isError: true);
    }
  }

  void _onSubjectChanged(String? subId) {
    setState(() {
      _selectedSubject = subId ?? '';
      final courses = _courses.where((c) => c['subjectId'].toString() == _selectedSubject).toList();
      if (courses.isNotEmpty) {
        _selectedCourse = courses[0]['id'].toString();
        _loadCourseDetail(_selectedCourse);
      } else {
        _selectedCourse = '';
        _groups = [];
      }
    });
  }

  Future<void> _loadCourseDetail(String courseId) async {
    // In a real app, we might call getCourseById
    // For now we can find in _allCourses or call a detail API
    try {
      // Find course in _courses to get groups
      final course = _courses.firstWhere((c) => c['id'].toString() == courseId, orElse: () => {});
      setState(() {
        _groups = List<Map<String, dynamic>>.from(course['groups'] ?? []);
      });
    } catch (e) {
      print("Error loading course detail: $e");
    }
  }

  List<Map<String, dynamic>> get _filteredGroups {
    return _groups.where((g) {
      if (_filter == 'inactive-students') {
        // Mock logic for less commit
        return true; 
      }
      if (_filter == 'inactive-groups') {
        final githubOk = g['githubStatus'] == 'APPROVED' || (g['integration']?['githubStatus'] == 'APPROVED');
        final jiraOk = g['jiraStatus'] == 'APPROVED' || (g['integration']?['jiraStatus'] == 'APPROVED');
        return !githubOk || !jiraOk;
      }
      return true;
    }).toList();
  }

  Map<String, dynamic>? get _currentSubject => _subjects.firstWhere(
        (s) => s['id'].toString() == _selectedSubject,
        orElse: () => {},
      );

  Map<String, dynamic>? get _currentCourse => _courses.firstWhere(
        (c) => c['id'].toString() == _selectedCourse,
        orElse: () => {},
      );

  // ─── Stats ────────────────────────────────────────
  int get _totalGroups => _groups.length;
  int get _githubApproved => _groups.where((g) {
    final status = g['githubStatus'] ?? g['integration']?['githubStatus'];
    return status == 'APPROVED';
  }).length;
  int get _jiraApproved => _groups.where((g) {
    final status = g['jiraStatus'] ?? g['integration']?['jiraStatus'];
    return status == 'APPROVED';
  }).length;
  int get _needAlert => _totalGroups - _githubApproved; // Simplification
  List<Map<String, dynamic>> get _pendingIntegrations => _groups.where((g) {
    final gStatus = g['githubStatus'] ?? g['integration']?['githubStatus'];
    final jStatus = g['jiraStatus'] ?? g['integration']?['jiraStatus'];
    return gStatus == 'PENDING' || jStatus == 'PENDING';
  }).toList();

  // ─── Handlers ─────────────────────────────────────
  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? const Color(0xFFEF4444) : teal,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  void _handleApprove(String groupName) {
    _showSnack('Đã duyệt tích hợp cho nhóm "$groupName"');
  }

  void _handleReject(String groupName) async {
    final ctrl = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Nhập lý do từ chối'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(
            hintText: 'Lý do từ chối...',
            border: OutlineInputBorder(),
          ),
          minLines: 2,
          maxLines: 4,
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Hủy')),
          ElevatedButton(
            style:
                ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
            onPressed: () => Navigator.pop(ctx, true),
            child:
                const Text('Từ chối', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      _showSnack('Đã từ chối tích hợp cho nhóm "$groupName"', isError: true);
    }
  }

  // ─── Build ────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgColor,
      drawer: const LecturerDrawer(),
      appBar: AppTopHeader(
        title: 'Tổng quan Giảng viên',
        user: AppUser(
            name: _currentUser?.fullName ?? 'Giảng viên',
            email: _currentUser?.email ?? '',
            role: 'LECTURER'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: teal))
          : SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Breadcrumb
            _buildBreadcrumb(),
            const SizedBox(height: 16),

            // 2. Filter Card
            _buildFilterCard(),
            const SizedBox(height: 16),

            // 3. Stat Cards
            _buildStatCards(),
            const SizedBox(height: 16),

            // 4. Alerts + Recent Activity
            _buildAlertsAndActivity(),
            const SizedBox(height: 16),

            // 5. Groups list (only when course selected)
            if (_selectedCourse.isNotEmpty) ...[
              _buildGroupsCard(),
              const SizedBox(height: 16),
            ],

            // 6. Pending Integrations
            if (_selectedCourse.isNotEmpty && _pendingIntegrations.isNotEmpty)
              ...[
              _buildPendingIntegrationsCard(),
              const SizedBox(height: 16),
            ],

            // 7. Contribution Activity Heatmap
            if (_selectedCourse.isNotEmpty) ...[
              _buildHeatmapCard(),
              const SizedBox(height: 16),
            ],

            // 8. Commit Trend
            if (_selectedCourse.isNotEmpty) ...[
              _buildCommitTrendCard(),
              const SizedBox(height: 16),
            ],

            // 9. Top Teams + Risk Teams
            if (_selectedCourse.isNotEmpty) ...[
              _buildTopAndRiskTeams(),
              const SizedBox(height: 16),
            ],

            // 10. Empty state
            if (_selectedCourse.isEmpty) _buildEmptyState(),
          ],
        ),
      ),
    );
  }

  // ─── 1. Breadcrumb ─────────────────────────────────
  Widget _buildBreadcrumb() {
    final subject = _currentSubject;
    final course = _currentCourse;
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 4,
      children: [
        Text('Giảng viên',
            style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: teal)),
        const Icon(Icons.chevron_right, size: 14, color: Color(0xFF94A3B8)),
        const Text('Tổng quan',
            style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: textPrimary)),
        if (subject != null && ('${subject['code'] ?? subject['subjectCode'] ?? ''}').isNotEmpty) ...[
          const Icon(Icons.chevron_right, size: 14, color: Color(0xFF94A3B8)),
          Text('${subject['code'] ?? subject['subjectCode'] ?? ''}',
              style: const TextStyle(fontSize: 12, color: textSecondary)),
        ],
        if (course != null && ('${course['code'] ?? course['className'] ?? ''}').isNotEmpty) ...[
          const Icon(Icons.chevron_right, size: 14, color: Color(0xFF94A3B8)),
          Text('${course['code'] ?? course['className'] ?? ''}',
              style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: textPrimary)),
        ],
      ],
    );
  }

  // ─── 2. Filter Card ────────────────────────────────
  Widget _buildFilterCard() {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              const Icon(Icons.filter_alt_outlined, size: 16, color: teal),
              const SizedBox(width: 6),
              const Text('Bộ lọc lớp học',
                  style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: textPrimary)),
              const Spacer(),
              if (_selectedCourse.isNotEmpty)
                GestureDetector(
                  onTap: () => context.go('/lecturer/groups'),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: teal,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.settings_outlined,
                            size: 13, color: Colors.white),
                        SizedBox(width: 5),
                        Text('Quản lý nhóm',
                            style:
                                TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 14),
          // 3 dropdowns
          _buildSelectField(
            label: 'Môn học',
            value: _selectedSubject,
            items: [
              const DropdownMenuItem(value: '', child: Text('— Chọn môn học —')),
              ..._subjects.map((s) => DropdownMenuItem(
                    value: s['id'].toString(),
                    child: Text('${s['code'] ?? s['subjectCode']} – ${s['name'] ?? s['subjectName']}'),
                  )),
            ],
            onChanged: (v) => _onSubjectChanged(v),
          ),
          const SizedBox(height: 12),
          _buildSelectField(
            label: 'Lớp học',
            value: _courses.any((c) => c['id'].toString() == _selectedCourse)
                ? _selectedCourse
                : '',
            enabled: _selectedSubject.isNotEmpty && _courses.where((c) => c['subjectId'].toString() == _selectedSubject).isNotEmpty,
            items: [
              const DropdownMenuItem(value: '', child: Text('— Chọn lớp học —')),
              ..._courses.where((c) => c['subjectId'].toString() == _selectedSubject).map((c) => DropdownMenuItem(
                    value: c['id'].toString(),
                    child: Text('${c['code'] ?? c['className']}'),
                  )),
            ],
            onChanged: (v) => setState(() {
              _selectedCourse = v ?? '';
              if (_selectedCourse.isNotEmpty) _loadCourseDetail(_selectedCourse);
            }),
          ),
          const SizedBox(height: 12),
          _buildSelectField(
            label: 'Bộ lọc',
            value: _filter,
            enabled: _selectedCourse.isNotEmpty,
            items: const [
              DropdownMenuItem(value: 'all', child: Text('Tất cả nhóm')),
              DropdownMenuItem(
                  value: 'inactive-students', child: Text('Ít commit')),
              DropdownMenuItem(
                  value: 'inactive-groups', child: Text('Chưa hoàn thành')),
            ],
            onChanged: (v) => setState(() => _filter = v ?? 'all'),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectField({
    required String label,
    required String value,
    required List<DropdownMenuItem<String>> items,
    required ValueChanged<String?> onChanged,
    bool enabled = true,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(),
            style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: textSecondary,
                letterSpacing: 0.8)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: value.isEmpty ? null : value,
          items: items,
          isExpanded: true,
          onChanged: enabled ? onChanged : null,
          decoration: InputDecoration(
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            filled: true,
            fillColor: enabled ? const Color(0xFFF8FAFC) : const Color(0xFFF1F5F9),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
          ),
          style: const TextStyle(fontSize: 13, color: textPrimary),
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: textSecondary),
        ),
      ],
    );
  }

  // ─── 3. Stat Cards ─────────────────────────────────
  Widget _buildStatCards() {
    final hasData = _selectedCourse.isNotEmpty;
    final stats = [
      {
        'label': 'Lớp đang dạy',
        'value': hasData ? '${_workload['coursesCount'] ?? 0}' : '—',
        'icon': Icons.book_outlined,
        'color': const Color(0xFF3B82F6),
      },
      {
        'label': 'Tổng sinh viên',
        'value': hasData ? '${_workload['studentsCount'] ?? 0}' : '—',
        'icon': Icons.people_outline,
        'color': const Color(0xFF6366F1),
      },
      {
        'label': 'GitHub đã duyệt',
        'value': hasData ? '$_githubApproved' : '—',
        'icon': Icons.account_tree_outlined,
        'color': const Color(0xFF0F766E),
      },
      {
        'label': 'Jira đã duyệt',
        'value': hasData ? '$_jiraApproved' : '—',
        'icon': Icons.book_outlined,
        'color': const Color(0xFF6366F1),
      },
      {
        'label': 'Cần cảnh báo',
        'value': hasData ? '$_needAlert' : '—',
        'icon': Icons.warning_amber_rounded,
        'color': const Color(0xFFF97316),
      },
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 2.0,
      ),
      itemCount: stats.length,
      itemBuilder: (_, i) {
        final s = stats[i];
        final color = s['color'] as Color;
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: cardBorder),
            boxShadow: [
              BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2))
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(s['icon'] as IconData,
                    color: Colors.white, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(s['value'] as String,
                        style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: textPrimary,
                            height: 1)),
                    const SizedBox(height: 2),
                    Text(s['label'] as String,
                        style: const TextStyle(
                            fontSize: 10, color: textSecondary),
                        overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ─── 4. Alerts + Recent Activity ──────────────────
  Widget _buildAlertsAndActivity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildAlertsCard(),
        const SizedBox(height: 16),
        _buildActivityCard(),
      ],
    );
  }

  Widget _buildAlertsCard() {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                    color: const Color(0xFFFFF7ED),
                    borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.warning_amber_rounded,
                    size: 16, color: Color(0xFFF97316)),
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: Text('Cảnh báo',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: textPrimary)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Empty state
          Column(
            children: [
              const Icon(Icons.check_circle_outline_rounded,
                  size: 28, color: Color(0xFF4ADE80)),
              const SizedBox(height: 6),
              const Text('Không có cảnh báo nào',
                  style: TextStyle(fontSize: 12, color: textSecondary)),
            ],
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () => _showSnack('Xem tất cả cảnh báo'),
            child: const Text('Xem tất cả cảnh báo →',
                style: TextStyle(
                    fontSize: 11,
                    color: teal,
                    fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityCard() {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                    color: const Color(0xFFF0FDFA),
                    borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.timeline_outlined,
                    size: 16, color: teal),
              ),
              const SizedBox(width: 8),
              const Text('Hoạt động gần đây',
                  style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: textPrimary)),
            ],
          ),
          const SizedBox(height: 12),
          if (_activities.isEmpty)
            const Center(child: Text('Không có hoạt động', style: TextStyle(fontSize: 11, color: textSecondary)))
          else
            ..._activities.map((a) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: teal.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.history,
                          size: 15, color: teal),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(a['message'] ?? a['msg'] ?? '',
                              style: const TextStyle(
                                  fontSize: 11, color: textPrimary),
                              maxLines: 2),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              const Icon(Icons.access_time_outlined,
                                  size: 9, color: textSecondary),
                              const SizedBox(width: 2),
                              Text(a['createdAt'] ?? a['time'] ?? 'Vừa xong',
                                  style: const TextStyle(
                                      fontSize: 9, color: textSecondary)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  // ─── 5. Groups Card ────────────────────────────────
  Widget _buildGroupsCard() {
    final groups = _filteredGroups;
    final course = _currentCourse;
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Text(
                'Nhóm${course != null && (course['code'] ?? '').isNotEmpty ? ' — ${course['code']}' : ''}',
                style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: textPrimary),
              ),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: cardBorder),
                ),
                child: Text('${groups.length} nhóm',
                    style: const TextStyle(
                        fontSize: 10, color: textSecondary)),
              ),
            ],
          ),
          const SizedBox(height: 4),
          // Column header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(8)),
            child: const Row(
              children: [
                Expanded(
                    flex: 4,
                    child: Text('NHÓM / ĐỀ TÀI',
                        style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: textSecondary,
                            letterSpacing: 0.6))),
                Expanded(
                    flex: 3,
                    child: Text('THÀNH VIÊN',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: textSecondary,
                            letterSpacing: 0.6))),
                Expanded(
                    flex: 3,
                    child: Text('TRẠNG THÁI',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: textSecondary,
                            letterSpacing: 0.6))),
                SizedBox(width: 70),
              ],
            ),
          ),
          const SizedBox(height: 4),
          if (groups.isEmpty)
            _buildEmptyGroups()
          else
            ...groups.map((g) => _buildGroupRow(g)),
        ],
      ),
    );
  }

  Widget _buildGroupRow(Map<String, dynamic> group) {
    final githubOk = group['githubStatus'] == 'APPROVED';
    final jiraOk = group['jiraStatus'] == 'APPROVED';
    final hasAlert = !githubOk || !jiraOk;
    final team = group['team'] as List? ?? [];

    return Container(
      decoration: BoxDecoration(
        border: Border(
          left: BorderSide(
            color: hasAlert ? const Color(0xFFFB923C) : Colors.transparent,
            width: 3,
          ),
          bottom: const BorderSide(color: Color(0xFFF0F0F0)),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
        child: Row(
          children: [
            // Group name + topic
            Expanded(
              flex: 4,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(group['name'] as String,
                      style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: textPrimary)),
                  const SizedBox(height: 2),
                  Text(group['topic'] as String? ?? 'Chưa có đề tài',
                      style: const TextStyle(
                          fontSize: 10, color: textSecondary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            // Members
            Expanded(
              flex: 3,
              child: Center(
                child: Column(
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        ...team.take(3).map((s) => Container(
                              width: 22,
                              height: 22,
                              margin: EdgeInsets.zero,
                              decoration: BoxDecoration(
                                color: const Color(0xFFCCFBF1),
                                shape: BoxShape.circle,
                                border:
                                    Border.all(color: Colors.white, width: 1.5),
                              ),
                              child: Center(
                                child: Text(
                                  ((s as Map)['name'] as String)
                                      .substring(0, 1),
                                  style: const TextStyle(
                                      fontSize: 8,
                                      fontWeight: FontWeight.w700,
                                      color: teal),
                                ),
                              ),
                            )),
                        if (team.length > 3)
                          Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              shape: BoxShape.circle,
                              border:
                                  Border.all(color: Colors.white, width: 1.5),
                            ),
                            child: Center(
                              child: Text('+${team.length - 3}',
                                  style: const TextStyle(
                                      fontSize: 7, color: textSecondary)),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text('${team.length} SV',
                        style: const TextStyle(
                            fontSize: 9, color: textSecondary)),
                  ],
                ),
              ),
            ),
            // Status pills
            Expanded(
              flex: 3,
              child: Center(
                child: Column(
                  children: [
                    _buildStatusPill(
                        'GitHub', githubOk, Icons.account_tree_outlined),
                    const SizedBox(height: 4),
                    _buildStatusPill('Jira', jiraOk, Icons.book_outlined),
                  ],
                ),
              ),
            ),
            // Actions
            SizedBox(
              width: 70,
              child: Column(
                children: [
                  GestureDetector(
                    onTap: () =>
                        context.go('/lecturer/group/${group['id']}'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDFA),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFCCFBF1)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.remove_red_eye_outlined,
                              size: 11, color: teal),
                          SizedBox(width: 3),
                          Text('Chi tiết',
                              style:
                                  TextStyle(fontSize: 9, color: teal, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  GestureDetector(
                    onTap: () =>
                        _showSnack('Đã gửi cảnh báo đến nhóm "${group['name']}"'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF7ED),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFFED7AA)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.notifications_outlined,
                              size: 11, color: Color(0xFFF97316)),
                          SizedBox(width: 2),
                          Text('Nhắc',
                              style: TextStyle(
                                  fontSize: 9,
                                  color: Color(0xFFF97316),
                                  fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusPill(String label, bool ok, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: ok ? const Color(0xFFF0FDF4) : const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon,
              size: 9,
              color: ok ? const Color(0xFF16A34A) : textSecondary),
          const SizedBox(width: 2),
          Text(label,
              style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  color: ok ? const Color(0xFF16A34A) : textSecondary,
                  letterSpacing: 0.3)),
          if (ok) ...[
            const SizedBox(width: 2),
            const Text('✓',
                style: TextStyle(
                    fontSize: 8, color: Color(0xFF16A34A))),
          ],
        ],
      ),
    );
  }

  Widget _buildEmptyGroups() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.groups_outlined,
                size: 24, color: textSecondary),
          ),
          const SizedBox(height: 10),
          const Text('Chưa có nhóm nào trong lớp học này.',
              style: TextStyle(fontSize: 12, color: textSecondary),
              textAlign: TextAlign.center),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () => context.go('/lecturer/groups'),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: teal,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text('+ Tạo nhóm đầu tiên',
                  style: TextStyle(
                      fontSize: 12,
                      color: Colors.white,
                      fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }

  // ─── 6. Pending Integrations ───────────────────────
  Widget _buildPendingIntegrationsCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFFDE68A)),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 3))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFFFFFBEB),
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              border:
                  Border(bottom: BorderSide(color: Color(0xFFFEF3C7))),
            ),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.warning_amber_rounded,
                      size: 16, color: Color(0xFFD97706)),
                ),
                const SizedBox(width: 8),
                const Text('Duyệt Link Tích Hợp',
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF78350F))),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFFDE68A)),
                  ),
                  child: Text('${_pendingIntegrations.length} yêu cầu',
                      style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFB45309))),
                ),
              ],
            ),
          ),
          // Items
          ..._pendingIntegrations.map((group) => _buildPendingItem(group)),
        ],
      ),
    );
  }

  Widget _buildPendingItem(Map<String, dynamic> group) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(group['name'] as String,
                  style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: textPrimary)),
              const Spacer(),
              GestureDetector(
                onTap: () =>
                    context.go('/lecturer/group/${group['id']}'),
                child: const Text('Xem chi tiết nhóm →',
                    style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: teal)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (group['githubStatus'] == 'PENDING')
            _buildIntegrationApproveRow(
              icon: Icons.account_tree_outlined,
              url: group['githubUrl'] as String? ?? 'Chưa có link GitHub',
              onApprove: () => _handleApprove(group['name'] as String),
              onReject: () => _handleReject(group['name'] as String),
            ),
          if (group['githubStatus'] == 'PENDING' &&
              group['jiraStatus'] == 'PENDING')
            const SizedBox(height: 8),
          if (group['jiraStatus'] == 'PENDING')
            _buildIntegrationApproveRow(
              icon: Icons.book_outlined,
              url: group['jiraUrl'] as String? ?? 'Chưa có link Jira',
              onApprove: () => _handleApprove(group['name'] as String),
              onReject: () => _handleReject(group['name'] as String),
            ),
        ],
      ),
    );
  }

  Widget _buildIntegrationApproveRow({
    required IconData icon,
    required String url,
    required VoidCallback onApprove,
    required VoidCallback onReject,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cardBorder),
      ),
      child: Row(
        children: [
          Icon(icon, size: 14, color: textSecondary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(url,
                style: const TextStyle(
                    fontSize: 11, color: Color(0xFF2563EB)),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: onApprove,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: const Color(0xFF16A34A),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text('Duyệt',
                  style: TextStyle(
                      fontSize: 11,
                      color: Colors.white,
                      fontWeight: FontWeight.w700)),
            ),
          ),
          const SizedBox(width: 6),
          GestureDetector(
            onTap: onReject,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFFCA5A5)),
              ),
              child: const Text('Từ chối',
                  style: TextStyle(
                      fontSize: 11,
                      color: Color(0xFFEF4444),
                      fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }

  // ─── 7. Heatmap Card ───────────────────────────────
  Widget _buildHeatmapCard() {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Contribution Activity',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: textPrimary)),
          const SizedBox(height: 14),
          // Filters
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildSmallDropdown('Semester', ['Semester', 'Spring 2026']),
              _buildSmallDropdown('Course',
                  ['Course', ..._courses.map((c) => c['code'] as String)]),
              _buildSmallDropdown('Group',
                  ['Group', ..._filteredGroups.map((g) => g['name'] as String)]),
            ],
          ),
          const SizedBox(height: 14),
          // Heatmap grid
          _buildHeatmapGrid(),
          const SizedBox(height: 10),
          // Legend
          Row(
            children: [
              const Text('Less',
                  style: TextStyle(fontSize: 10, color: textSecondary)),
              const SizedBox(width: 4),
              ...[ const Color(0xFFE2E8F0), const Color(0xFFBBF7D0),
                   const Color(0xFF4ADE80), const Color(0xFF16A34A)]
                  .map((c) => Container(
                        width: 12,
                        height: 12,
                        margin: const EdgeInsets.only(right: 3),
                        decoration: BoxDecoration(
                            color: c,
                            borderRadius: BorderRadius.circular(3)),
                      )),
              const Text('More',
                  style: TextStyle(fontSize: 10, color: textSecondary)),
            ],
          ),
          const SizedBox(height: 8),
          Text('Hiển thị ${_filteredGroups.length} nhóm theo bộ lọc hiện tại.',
              style: const TextStyle(fontSize: 10, color: textSecondary)),
        ],
      ),
    );
  }

  Widget _buildSmallDropdown(String hint, List<String> options) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(options.first,
          style: const TextStyle(fontSize: 12, color: textSecondary)),
    );
  }

  Widget _buildHeatmapGrid() {
    final mockData = <int>[];

    if (mockData.isEmpty) {
      return const SizedBox(
        height: 80, 
        child: Center(
          child: Text('Chưa có dữ liệu heatmap', style: TextStyle(fontSize: 11, color: textSecondary))
        )
      );
    }

    return SizedBox(
      height: 80,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(mockData.length, (i) {
          final v = mockData[i];
          Color c;
          if (v == 0) c = const Color(0xFFE2E8F0);
          else if (v <= 3) c = const Color(0xFFBBF7D0);
          else if (v <= 6) c = const Color(0xFF4ADE80);
          else c = const Color(0xFF16A34A);
          return Expanded(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 1),
              height: ((v / 9) * 70 + 8).clamp(8, 80),
              decoration: BoxDecoration(
                  color: c, borderRadius: BorderRadius.circular(3)),
            ),
          );
        }),
      ),
    );
  }

  // ─── 8. Commit Trend ───────────────────────────────
  Widget _buildCommitTrendCard() {
    if (_commits.isEmpty) return const SizedBox.shrink();
    
    final maxCommit =
        _commits.map((c) => c['commits'] as int).reduce((a, b) => a > b ? a : b);
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Commit Trend',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: textPrimary)),
          const SizedBox(height: 16),
          SizedBox(
            height: 120,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: _commits.map((c) {
                final val = c['commits'] as int;
                final pct = val / maxCommit;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text('$val',
                            style: const TextStyle(
                                fontSize: 9, color: textSecondary)),
                        const SizedBox(height: 2),
                        Container(
                          height: 80 * pct,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Color(0xFF14B8A6), Color(0xFF0F766E)],
                            ),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(c['day'] as String,
                            style: const TextStyle(
                                fontSize: 10, color: textSecondary)),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                  width: 12, height: 3,
                  decoration: BoxDecoration(
                      color: tealLight,
                      borderRadius: BorderRadius.circular(2))),
              const SizedBox(width: 6),
              const Text('Commits per day',
                  style: TextStyle(fontSize: 10, color: textSecondary)),
            ],
          ),
        ],
      ),
    );
  }

  // ─── 9. Top + Risk Teams ────────────────────────────
  Widget _buildTopAndRiskTeams() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(child: _buildTopTeams()),
        const SizedBox(width: 12),
        Expanded(child: _buildRiskTeams()),
      ],
    );
  }

  Widget _buildTopTeams() {
    final ranked = List<Map<String, dynamic>>.from(_filteredGroups)
        .asMap()
        .entries
        .map((e) => {
              'name': e.value['name'],
              'commits': 0,
            })
        .toList()
      ..sort((a, b) => (b['commits'] as int).compareTo(a['commits'] as int));
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Top Active Teams',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: textPrimary)),
          const SizedBox(height: 12),
          if (ranked.isEmpty)
            const Text('No teams available',
                style: TextStyle(fontSize: 12, color: textSecondary))
          else
            ...ranked.take(5).toList().asMap().entries.map((e) {
              final t = e.value;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  children: [
                    Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: e.key == 0
                            ? const Color(0xFFEF4444)
                            : e.key == 1
                                ? const Color(0xFFF59E0B)
                                : const Color(0xFF6366F1),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text('${e.key + 1}',
                            style: const TextStyle(
                                fontSize: 9,
                                color: Colors.white,
                                fontWeight: FontWeight.w700)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text('${t['name']}',
                          style: const TextStyle(
                              fontSize: 12, color: textPrimary),
                          overflow: TextOverflow.ellipsis),
                    ),
                    Text('${t['commits']} commits',
                        style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: teal)),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildRiskTeams() {
    final risky = _filteredGroups
        .where((g) => g['githubStatus'] != 'APPROVED')
        .toList();
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Teams At Risk',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: textPrimary)),
          const SizedBox(height: 12),
          if (risky.isEmpty)
            const Row(
              children: [
                Icon(Icons.check_circle_outline,
                    size: 16, color: Color(0xFF4ADE80)),
                SizedBox(width: 6),
                Text('No risk teams',
                    style:
                        TextStyle(fontSize: 12, color: textSecondary)),
              ],
            )
          else
            ...risky.map((g) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline,
                          size: 14, color: Color(0xFFEF4444)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text('${g['name']}',
                            style: const TextStyle(
                                fontSize: 12, color: textPrimary),
                            overflow: TextOverflow.ellipsis),
                      ),
                      const Text('Repo missing',
                          style: TextStyle(
                              fontSize: 10,
                              color: Color(0xFFEF4444))),
                    ],
                  ),
                )),
        ],
      ),
    );
  }

  // ─── 10. Empty state ───────────────────────────────
  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48),
      child: Center(
        child: Column(
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDFA),
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Icon(Icons.trending_up_rounded,
                  size: 36, color: Color(0xFF5EEAD4)),
            ),
            const SizedBox(height: 16),
            const Text('Chọn lớp học để xem dashboard',
                style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: textPrimary)),
            const SizedBox(height: 6),
            const Text(
              'Sử dụng bộ lọc phía trên để chọn\nmôn học và lớp học',
              style: TextStyle(fontSize: 13, color: textSecondary),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  // ─── Shared card wrapper ──────────────────────────
  Widget _card({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: cardBorder),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 3))
        ],
      ),
      child: child,
    );
  }
}
