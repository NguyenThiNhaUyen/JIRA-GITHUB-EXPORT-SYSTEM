// Student Dashboard - based on student-dashboard.jsx
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../widgets/app_top_header.dart';
import '../../../widgets/student_navigation.dart';
import '../../../services/student_service.dart';
import '../../../services/auth_service.dart';
import '../../../models/user.dart';

class StudentDashboard extends StatefulWidget {
  const StudentDashboard({super.key});

  @override
  State<StudentDashboard> createState() => _StudentDashboardState();
}

class _StudentDashboardState extends State<StudentDashboard> {
  // ── Colors ─────────────────────────────────────────
  static const Color bgColor = Color(0xFFF8FAFC);
  static const Color emerald = Color(0xFF059669);
  static const Color emeraldLight = Color(0xFF10B981);
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color cardBorder = Color(0xFFE2E8F0);

  final StudentService _studentService = StudentService();
  final AuthService _authService = AuthService();

  bool _isLoading = true;
  User? _currentUser;
  List<Map<String, dynamic>> _courses = [];
  List<Map<String, dynamic>> _projects = [];
  List<Map<String, dynamic>> _invitations = [];
  Map<String, dynamic>? _stats;

  String _selectedCourseId = 'all';

  // Mock weekly activity (keep for now until backend provides)
  final List<Map<String, dynamic>> _weeklyActivity = [];

  // Mock heatmap (keep for now until backend provides)
  final List<int> _heatmapData = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final user = authProvider.user ?? await _authService.getCurrentUser();
      
      final results = await Future.wait([
        _studentService.getStats(),
        _studentService.getInvitations(),
        _studentService.getMyCourses(),
        _studentService.getMyProjects(),
      ]);

      if (mounted) {
        setState(() {
          _currentUser = user;
          _stats = results[0] as Map<String, dynamic>?;
          _invitations = (results[1] as List).cast<Map<String, dynamic>>();
          _courses = (results[2] as List).cast<Map<String, dynamic>>();
          _projects = (results[3] as List).cast<Map<String, dynamic>>();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  int get _totalCommits => _stats?['totalCommits'] ?? _projects.fold(0, (s, p) => s + ((p['commits'] ?? 0) as num).toInt());
  int get _totalIssues => _stats?['totalIssuesDone'] ?? _projects.fold(0, (s, p) => s + ((p['issuesDone'] ?? 0) as num).toInt());
  int get _totalPrs => _stats?['totalPrsMerged'] ?? _projects.fold(0, (s, p) => s + ((p['prsMerged'] ?? 0) as num).toInt());
  int get _avgContrib => _stats?['avgContribution'] ?? (_projects.isEmpty ? 0 : (_projects.fold(0, (s, p) => s + ((p['myContribution'] ?? 0) as num).toInt()) / _projects.length).round());

  List<Map<String, dynamic>> get _filteredProjects {
    if (_selectedCourseId == 'all') return _projects;
    return _projects.where((p) => p['courseId'].toString() == _selectedCourseId).toList();
  }

  Map<String, dynamic>? get _currentMainProject => _filteredProjects.isNotEmpty ? _filteredProjects[0] : (_projects.isNotEmpty ? _projects[0] : null);

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: emerald,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  // ── Status helpers ──────────────────────────────────
  Color _statusBgColor(String? status) {
    switch (status) {
      case 'ACTIVE': return const Color(0xFFECFDF5);
      case 'AT_RISK': return const Color(0xFFFFFBEB);
      case 'DONE': return const Color(0xFFEFF6FF);
      default: return const Color(0xFFF8FAFC);
    }
  }

  Color _statusTextColor(String? status) {
    switch (status) {
      case 'ACTIVE': return const Color(0xFF065F46);
      case 'AT_RISK': return const Color(0xFF92400E);
      case 'DONE': return const Color(0xFF1E40AF);
      default: return const Color(0xFF475569);
    }
  }

  Color _heatColor(int value) {
    if (value >= 4) return const Color(0xFF059669);
    if (value == 3) return const Color(0xFF10B981);
    if (value == 2) return const Color(0xFF34D399);
    if (value == 1) return const Color(0xFFA7F3D0);
    return const Color(0xFFF1F5F9);
  }

  // ── Helpers ─────────────────────────────────────────
  bool get _isMobile => MediaQuery.of(context).size.width < 900;

  // ── Build ───────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgColor,
      drawer: _isMobile ? const StudentDrawer() : null,
      body: SafeArea(
        child: Row(
          children: [
            if (!_isMobile) const StudentSidebar(),
            Expanded(
              child: Container(
                margin: EdgeInsets.all(_isMobile ? 0 : 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(_isMobile ? 0 : 36),
                ),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  children: [
                    AppTopHeader(
                      title: 'Dashboard',
                      primary: false,
                      user: AppUser(
                        name: _currentUser?.fullName ?? 'Student',
                        email: _currentUser?.email ?? '',
                        role: 'STUDENT',
                      ),
                    ),
                    Expanded(
                      child: _isLoading
                          ? Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const CircularProgressIndicator(color: emerald),
                                  const SizedBox(height: 16),
                                  Text('Đang tải dữ liệu dashboard...',
                                      style: TextStyle(color: textSecondary, fontWeight: FontWeight.w500)),
                                ],
                              ),
                            )
                          : RefreshIndicator(
                              color: emerald,
                              onRefresh: _loadData,
                              child: SingleChildScrollView(
                                physics: const AlwaysScrollableScrollPhysics(),
                                padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildHeader(),
                                    if (_invitations.isNotEmpty) ...[
                                      const SizedBox(height: 20),
                                      _buildInvitationsSection(),
                                    ],
                                    const SizedBox(height: 20),
                                    _buildKpiCards(),
                                    const SizedBox(height: 20),
                                    _buildQuickNav(),
                                    const SizedBox(height: 20),
                                    _buildCoursesSection(),
                                    const SizedBox(height: 20),
                                    _buildProjectsSection(),
                                    const SizedBox(height: 20),
                                    _buildActivitySection(),
                                    const SizedBox(height: 20),
                                    _buildTaskSection(),
                                    const SizedBox(height: 20),
                                    _buildDeadlinesSection(),
                                    const SizedBox(height: 20),
                                    _buildAlertsSection(),
                                    const SizedBox(height: 20),
                                    _buildTeamProgressSection(),
                                    const SizedBox(height: 20),
                                    _buildLeaderboardSection(),
                                    const SizedBox(height: 20),
                                    _buildPermissionsSection(),
                                    const SizedBox(height: 20),
                                    _buildBottomCta(),
                                  ],
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

  // ── 1. Header ──────────────────────────────────────
  Widget _buildHeader() {
    final user = _currentUser;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFECFDF5), Color(0xFFFFFFFF), Color(0xFFF0FDFA)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFD1FAE5)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 12, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFA7F3D0)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.menu_book_rounded, size: 14, color: emerald),
                SizedBox(width: 6),
                Text('Student Dashboard', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: emerald)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Chào mừng, ${user?.fullName ?? 'Student'}!',
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: textPrimary),
          ),
          const SizedBox(height: 6),
          const Text(
            'Theo dõi contribution GitHub, task Jira, deadline quan trọng,\ncảnh báo từ lecturer và tiến độ nhóm của bạn tại một nơi.',
            style: TextStyle(fontSize: 13, color: textSecondary, height: 1.5),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _infoPill('Vai trò: ${user?.roles.firstOrNull ?? 'STUDENT'}'),
              _infoPill('Email: ${user?.email ?? 'student@fpt.edu.vn'}'),
              if (user?.studentCode != null) _infoPill('ID: ${user!.studentCode!}'),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _outlineButton(Icons.download_outlined, 'Export báo cáo', () => _showSnack('Đã export báo cáo cá nhân')),
              const SizedBox(width: 10),
              _outlineButton(Icons.logout_rounded, 'Đăng xuất', () {
                Provider.of<AuthProvider>(context, listen: false).logout();
                context.go('/login');
              }),
            ],
          ),
        ],
      ),
    );
  }

  Widget _infoPill(String text) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: cardBorder),
        ),
        child: Text(text, style: const TextStyle(fontSize: 12, color: textSecondary)),
      );

  Widget _outlineButton(IconData icon, String label, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: cardBorder),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 15, color: textSecondary),
              const SizedBox(width: 6),
              Text(label, style: const TextStyle(fontSize: 13, color: textPrimary, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      );

  // ── Invitations ────────────────────────────────────
  Widget _buildInvitationsSection() {
    return _sectionCard(
      title: 'Lời mời vào nhóm',
      subtitle: 'Bạn có lờ mời gia nhập các nhóm dự án bên dưới',
      child: Column(
        children: _invitations.map((inv) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFF0FDFA),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFCCFBF1)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.group_add_rounded, color: emerald),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(inv['groupName'] ?? 'Nhóm mới', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: textPrimary)),
                        Text('Từ: ${inv['inviterName'] ?? 'Bạn bè'}', style: const TextStyle(fontSize: 12, color: textSecondary)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                   Expanded(child: _primaryButton('Chấp nhận', Icons.check_circle_outline, () => _handleAcceptInvitation(inv['id']))),
                   const SizedBox(width: 8),
                   Expanded(child: _actionButton('Từ chối', Icons.cancel_outlined, () => _handleRejectInvitation(inv['id']))),
                ],
              ),
            ],
          ),
        )).toList(),
      ),
    );
  }

  Future<void> _handleAcceptInvitation(dynamic id) async {
    final ok = await _studentService.acceptInvitation(id);
    if (ok) {
      _showSnack('Đã gia nhập nhóm thành công!');
      _loadData();
    } else {
      _showSnack('Có lỗi xảy ra, vui lòng thử lại.');
    }
  }

  Future<void> _handleRejectInvitation(dynamic id) async {
    final ok = await _studentService.rejectInvitation(id);
    if (ok) {
      _showSnack('Đã từ chối lời mời.');
      _loadData();
    } else {
      _showSnack('Có lỗi xảy ra.');
    }
  }

  // ── 2. KPI Cards ───────────────────────────────────
  Widget _buildKpiCards() {
    final cards = [
      {'title': 'Tổng Commits', 'value': '$_totalCommits', 'hint': 'Xem trang contribution', 'icon': Icons.commit, 'tone': 'green', 'path': '/student/contribution'},
      {'title': 'Issues hoàn thành', 'value': '$_totalIssues', 'hint': 'Xem project của tôi', 'icon': Icons.check_box_outlined, 'tone': 'blue', 'path': '/student/my-project'},
      {'title': 'PRs Merged', 'value': '$_totalPrs', 'hint': 'Xem chi tiết project', 'icon': Icons.merge, 'tone': 'violet', 'path': '/student/project'},
      {'title': 'Contribution Score', 'value': '$_avgContrib%', 'hint': 'Phân tích đóng góp cá nhân', 'icon': Icons.track_changes, 'tone': 'amber', 'path': '/student/contribution'},
    ];

    final toneColors = {
      'green': [const Color(0xFFECFDF5), const Color(0xFF065F46), const Color(0xFFD1FAE5)],
      'blue': [const Color(0xFFEFF6FF), const Color(0xFF1E40AF), const Color(0xFFBFDBFE)],
      'violet': [const Color(0xFFF5F3FF), const Color(0xFF4C1D95), const Color(0xFFDDD6FE)],
      'amber': [const Color(0xFFFFFBEB), const Color(0xFF78350F), const Color(0xFFFDE68A)],
    };

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.55,
      ),
      itemCount: cards.length,
      itemBuilder: (_, i) {
        final c = cards[i];
        final tone = toneColors[c['tone']]!;
        return GestureDetector(
          onTap: () => context.go(c['path'] as String),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [tone[0], Colors.white], begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: tone[2]),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(c['title'] as String, style: TextStyle(fontSize: 11, color: tone[1], fontWeight: FontWeight.w500)),
                    Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: cardBorder),
                      ),
                      child: Icon(c['icon'] as IconData, size: 14, color: textPrimary),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(c['value'] as String, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: textPrimary)),
                    Text(c['hint'] as String, style: TextStyle(fontSize: 10, color: textSecondary)),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ── 3. Quick Nav ───────────────────────────────────
  Widget _buildQuickNav() {
    final items = [
      {'label': 'Lớp của tôi', 'icon': Icons.menu_book_rounded, 'desc': 'Danh sách lớp học', 'path': '/student/courses'},
      {'label': 'Nhóm của tôi', 'icon': Icons.folder_special_rounded, 'desc': 'Project đang tham gia', 'path': '/student/my-project'},
      {'label': 'Contribution', 'icon': Icons.bar_chart_rounded, 'desc': 'Đóng góp cá nhân', 'path': '/student/contribution'},
      {'label': 'Cảnh báo', 'icon': Icons.notifications_outlined, 'desc': 'Nhắc nhở từ hệ thống', 'path': '/student/alerts'},
      {'label': 'SRS Reports', 'icon': Icons.description_outlined, 'desc': 'Tài liệu và nhận xét', 'path': '/student/srs'},
    ];
    return _sectionCard(
      title: 'Truy cập nhanh',
      subtitle: 'Đi đến các trang student đã hoàn thiện',
      child: Column(
        children: [
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.1,
            ),
            itemCount: items.length,
            itemBuilder: (_, i) {
              final item = items[i];
              return GestureDetector(
                onTap: () => context.go(item['path'] as String),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: cardBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(10)),
                            child: Icon(item['icon'] as IconData, size: 16, color: textPrimary),
                          ),
                          const Icon(Icons.open_in_new_rounded, size: 12, color: Color(0xFFCBD5E1)),
                        ],
                      ),
                      const Spacer(),
                      Text(item['label'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: textPrimary)),
                      Text(item['desc'] as String, style: const TextStyle(fontSize: 10, color: textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // ── 4. Courses Section ─────────────────────────────
  Widget _buildCoursesSection() {
    return _sectionCard(
      title: 'Khóa học của tôi',
      subtitle: 'Chọn khóa học để lọc project và dữ liệu phía dưới',
      action: _actionButton('Xem tất cả lớp', Icons.menu_book_rounded, () => context.go('/student/courses')),
      child: Column(
        children: [
          if (_courses.isEmpty)
            _emptyState('Bạn chưa tham gia lớp học nào')
          else
            ..._courses.map((course) {
              final active = _selectedCourseId == course['id'].toString();
              final currentStudents = (course['currentStudents'] ?? 0) as num;
              final maxStudents = (course['maxStudents'] ?? 1) as num;
              final progress = maxStudents > 0 ? (currentStudents / maxStudents).clamp(0.0, 1.0) : 0.0;
              return GestureDetector(
                onTap: () => setState(() => _selectedCourseId = course['id'].toString()),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: active ? const Color(0xFFECFDF5) : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: active ? const Color(0xFF6EE7B7) : cardBorder),
                    boxShadow: active ? [BoxShadow(color: emerald.withValues(alpha: 0.08), blurRadius: 8)] : [],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(course['code']?.toString() ?? '', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: textPrimary)),
                                const SizedBox(height: 2),
                                Text(course['name']?.toString() ?? '', style: const TextStyle(fontSize: 12, color: textSecondary)),
                              ],
                            ),
                          ),
                          _statusBadge(course['status']?.toString()),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text('Giảng viên: ${course['lecturerName'] ?? course['lecturer']?['name'] ?? 'N/A'}',
                          style: const TextStyle(fontSize: 12, color: textSecondary)),
                      const SizedBox(height: 2),
                      Text('Số sinh viên: ${course['currentStudents'] ?? 0}',
                          style: const TextStyle(fontSize: 12, color: textSecondary)),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Dung lượng lớp', style: TextStyle(fontSize: 11, color: textSecondary)),
                          Text('$currentStudents/$maxStudents', style: const TextStyle(fontSize: 11, color: textSecondary)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: progress.toDouble(),
                          minHeight: 6,
                          backgroundColor: const Color(0xFFF1F5F9),
                          valueColor: const AlwaysStoppedAnimation<Color>(emerald),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: () => setState(() => _selectedCourseId = 'all'),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: cardBorder),
              ),
              child: const Text('Xem tất cả khóa học', style: TextStyle(fontSize: 13, color: textPrimary)),
            ),
          ),
        ],
      ),
    );
  }

  // ── 5. Projects Section ────────────────────────────
  Widget _buildProjectsSection() {
    final projects = _filteredProjects;
    return _sectionCard(
      title: 'Project của tôi',
      subtitle: 'Tổng hợp project theo course đã chọn',
      action: _actionButton('Xem tất cả', Icons.visibility_outlined, () => context.go('/student/my-project')),
      child: projects.isEmpty
          ? _emptyState('Chưa có project nào cho lớp này.')
          : Column(
              children: projects.map((project) {
                final sprintCompletion = (project['sprintCompletion'] ?? 0) as num;
                return Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: cardBorder),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(project['title']?.toString() ?? '', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: textPrimary)),
                                const SizedBox(height: 2),
                                Text(project['description']?.toString() ?? '', style: const TextStyle(fontSize: 12, color: textSecondary), maxLines: 2, overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          _statusBadge(project['status']?.toString()),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 6,
                        children: [
                          _chip(project['role']?.toString() ?? '', const Color(0xFFEFF6FF), const Color(0xFF1E40AF), const Color(0xFFBFDBFE)),
                          _chip(project['courseCode']?.toString() ?? '', bgColor, textSecondary, cardBorder),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(child: _projectMeta('Repository', project['repository']?.toString() ?? '—', const Color(0xFF2563EB))),
                          Expanded(child: _projectMeta('Jira Key', project['jiraKey']?.toString() ?? '—', textPrimary)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Expanded(child: _projectMeta('Team Size', '${project['teamSize'] ?? 0} thành viên', textPrimary)),
                          Expanded(child: _projectMeta('Commit cuối', project['lastCommit']?.toString() ?? '—', textPrimary)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      GridView.count(
                        crossAxisCount: 4,
                        shrinkWrap: true,
                        crossAxisSpacing: 8,
                        mainAxisSpacing: 8,
                        childAspectRatio: 1.5,
                        physics: const NeverScrollableScrollPhysics(),
                        children: [
                          _miniStat('Commits', '${project['commits'] ?? 0}'),
                          _miniStat('Done Issues', '${project['issuesDone'] ?? 0}'),
                          _miniStat('PR Merged', '${project['prsMerged'] ?? 0}'),
                          _miniStat('Contrib.', '${project['myContribution'] ?? 0}%'),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Sprint completion', style: TextStyle(fontSize: 11, color: textSecondary)),
                          Text('${sprintCompletion.toInt()}%', style: const TextStyle(fontSize: 11, color: textSecondary)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: (sprintCompletion / 100).clamp(0.0, 1.0).toDouble(),
                          minHeight: 6,
                          backgroundColor: const Color(0xFFF1F5F9),
                          valueColor: const AlwaysStoppedAnimation<Color>(emerald),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          _actionButton('Xem chi tiết', Icons.visibility_outlined, () => context.go('/student/project/${project['id']}')),
                          const SizedBox(width: 8),
                          _primaryButton('Sync commits', Icons.sync_rounded, () => _showSnack('Đã đồng bộ commits cho ${project['title']}')),
                          const SizedBox(width: 8),
                          _actionButton('Upload SRS', Icons.upload_outlined, () => _showSnack('Mở upload SRS cho ${project['title']}')),
                        ],
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
    );
  }

  Widget _projectMeta(String label, String value, Color valueColor) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: textSecondary)),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: valueColor), maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      );

  Widget _miniStat(String label, String value) => Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(10)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(label, style: const TextStyle(fontSize: 9, color: textSecondary)),
            Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: textPrimary)),
          ],
        ),
      );

  // ── 6. Activity Section ────────────────────────────
  Widget _buildActivitySection() {
    final maxCommits = _weeklyActivity.isEmpty ? 1.0 : _weeklyActivity.map((d) => d['commits'] as int).reduce((a, b) => a > b ? a : b).toDouble();
    return _sectionCard(
      title: 'Phân tích hoạt động tuần này',
      subtitle: 'Tổng hợp commit và Jira issues trong 7 ngày gần nhất',
      action: _actionButton('Xem contribution', Icons.bar_chart_rounded, () => context.go('/student/contribution')),
      child: Column(
        children: [
          // Weekly bar chart
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.local_fire_department_rounded, size: 16, color: Color(0xFFF97316)),
                    SizedBox(width: 6),
                    Text('Weekly Commits', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: textPrimary)),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 120,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: _weeklyActivity.map((item) {
                      final count = item['commits'] as int;
                      final barHeight = maxCommits > 0 ? (count / maxCommits) * 90 + 10 : 10.0;
                      return Expanded(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Text('$count', style: const TextStyle(fontSize: 10, color: textSecondary, fontWeight: FontWeight.w500)),
                            const SizedBox(height: 4),
                            Container(
                              height: barHeight,
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              decoration: BoxDecoration(
                                color: emeraldLight,
                                borderRadius: const BorderRadius.only(topLeft: Radius.circular(6), topRight: Radius.circular(6)),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(item['day'] as String, style: const TextStyle(fontSize: 10, color: textSecondary)),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Heatmap
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.commit, size: 16, color: textPrimary),
                    SizedBox(width: 6),
                    Text('Contribution Heatmap', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: textPrimary)),
                  ],
                ),
                const SizedBox(height: 12),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 7,
                    crossAxisSpacing: 4,
                    mainAxisSpacing: 4,
                    childAspectRatio: 1,
                  ),
                  itemCount: _heatmapData.length,
                  itemBuilder: (_, i) => Container(
                    decoration: BoxDecoration(
                      color: _heatColor(_heatmapData[i]),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Ít hoạt động', style: TextStyle(fontSize: 10, color: textSecondary)),
                    Row(
                      children: [0, 1, 2, 3, 4].map((v) => Container(
                        width: 12, height: 12,
                        margin: const EdgeInsets.only(left: 3),
                        decoration: BoxDecoration(color: _heatColor(v), borderRadius: BorderRadius.circular(2)),
                      )).toList(),
                    ),
                    const Text('Nhiều hoạt động', style: TextStyle(fontSize: 10, color: textSecondary)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── 7. Task Section ────────────────────────────────
  Widget _buildTaskSection() {
    final projects = _filteredProjects;
    return _sectionCard(
      title: 'Task cá nhân',
      subtitle: 'Task Jira được giao trực tiếp cho bạn',
      action: _actionButton('Mở trang project', Icons.folder_special_rounded, () => context.go('/student/my-project')),
      child: projects.isEmpty
          ? _emptyState('Chưa có task nào được giao — Hãy kiểm tra Jira.')
          : Column(
              children: projects.take(5).map((project) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: cardBorder),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Wrap(
                            spacing: 6,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(6)),
                                child: Text(project['courseCode']?.toString() ?? 'Task', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: textPrimary)),
                              ),
                              _statusBadge(project['status']?.toString()),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(project['title']?.toString() ?? '', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: textPrimary)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Row(
                      children: [
                        const Icon(Icons.access_time_rounded, size: 13, color: textSecondary),
                        const SizedBox(width: 4),
                        Text(project['lastCommit']?.toString() ?? '—', style: const TextStyle(fontSize: 11, color: textSecondary)),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () => context.go('/student/my-project'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: cardBorder),
                            ),
                            child: const Row(
                              children: [
                                Text('Xem', style: TextStyle(fontSize: 11, color: textPrimary)),
                                Icon(Icons.chevron_right_rounded, size: 14, color: textSecondary),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              )).toList(),
            ),
    );
  }

  // ── 8. Deadlines Section ───────────────────────────
  Widget _buildDeadlinesSection() {
    return _sectionCard(
      title: 'Upcoming Deadlines',
      subtitle: 'Việc cần ưu tiên ngay',
      action: _actionButton('Xem SRS', Icons.calendar_today_outlined, () => context.go('/student/srs')),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cardBorder, style: BorderStyle.solid),
          color: const Color(0xFFFAFAFA),
        ),
        child: const Column(
          children: [
            Icon(Icons.check_circle_outline_rounded, size: 32, color: Color(0xFF4ADE80)),
            SizedBox(height: 8),
            Text('Không có deadline sắp tới ✔️', style: TextStyle(fontSize: 13, color: textSecondary)),
          ],
        ),
      ),
    );
  }

  // ── 9. Alerts Section ──────────────────────────────
  Widget _buildAlertsSection() {
    return _sectionCard(
      title: 'Alerts & Cảnh báo',
      subtitle: 'Thông báo từ hệ thống và lecturer',
      action: _actionButton('Xem tất cả', Icons.notifications_outlined, () => context.go('/student/alerts')),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cardBorder),
        ),
        child: const Column(
          children: [
            Icon(Icons.notifications_none_rounded, size: 32, color: Color(0xFFCBD5E1)),
            SizedBox(height: 8),
            Text('Các cảnh báo sẽ hiển thị ở đây khi giảng viên gửi thông báo.', style: TextStyle(fontSize: 12, color: textSecondary), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }

  // ── 10. Team Progress ──────────────────────────────
  Widget _buildTeamProgressSection() {
    final project = _currentMainProject;
    final sprintCompletion = (project?['sprintCompletion'] ?? 0) as num;
    return _sectionCard(
      title: 'Team Progress',
      subtitle: 'Tiến độ nhóm - ${project?['title'] ?? 'Project'}',
      action: _actionButton('Mở project', Icons.visibility_outlined, () => context.go('/student/project/${project?['id'] ?? ''}')),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(16)),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Sprint completion', style: TextStyle(fontSize: 12, color: textSecondary)),
                    Text('${sprintCompletion.toInt()}%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: textPrimary)),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: (sprintCompletion / 100).clamp(0.0, 1.0).toDouble(),
                    minHeight: 8,
                    backgroundColor: const Color(0xFFE2E8F0),
                    valueColor: const AlwaysStoppedAnimation<Color>(emerald),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _teamStatCard('Open Issues', '${project?['openIssues'] ?? 0}')),
              const SizedBox(width: 10),
              Expanded(child: _teamStatCard('Team Size', '${project?['teamSize'] ?? 0}')),
            ],
          ),
        ],
      ),
    );
  }

  Widget _teamStatCard(String label, String value) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 11, color: textSecondary)),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: textPrimary)),
          ],
        ),
      );

  // ── 11. Leaderboard ────────────────────────────────
  Widget _buildLeaderboardSection() {
    final project = _currentMainProject;
    final team = (project?['team'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    return _sectionCard(
      title: 'Leaderboard nhóm',
      subtitle: 'So sánh đóng góp trong team hiện tại',
      action: _actionButton('Xem team', Icons.people_outline, () => context.go('/student/project/${project?['id'] ?? ''}')),
      child: team.isEmpty
          ? _emptyState('Chưa có dữ liệu thành viên nhóm.')
          : Column(
              children: team.asMap().entries.map((entry) {
                final idx = entry.key;
                final member = entry.value;
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: cardBorder),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 28, height: 28,
                            decoration: BoxDecoration(color: const Color(0xFFD1FAE5), borderRadius: BorderRadius.circular(14)),
                            child: Center(child: Text('#${idx + 1}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: emerald))),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(member['studentName']?.toString() ?? member['name']?.toString() ?? '', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: textPrimary)),
                                Text(member['role']?.toString() ?? '', style: const TextStyle(fontSize: 11, color: textSecondary)),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(12), border: Border.all(color: cardBorder)),
                            child: Text('${member['contributionScore'] ?? '--'}%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: textPrimary)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(child: _miniStat('Commits', '${member['commits'] ?? '--'}')),
                          const SizedBox(width: 8),
                          Expanded(child: _miniStat('Done Issues', '${member['issuesDone'] ?? '--'}')),
                        ],
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
    );
  }

  // ── 12. Permissions Section ────────────────────────
  Widget _buildPermissionsSection() {
    final items = [
      {'icon': Icons.check_box_outlined, 'text': 'Xem task cá nhân và tình trạng xử lý trên Jira', 'path': '/student/my-project'},
      {'icon': Icons.commit, 'text': 'Theo dõi contribution GitHub và commit activity', 'path': '/student/contribution'},
      {'icon': Icons.description_outlined, 'text': 'Upload / theo dõi phiên bản SRS của project', 'path': '/student/srs'},
      {'icon': Icons.download_outlined, 'text': 'Export báo cáo cá nhân phục vụ review và demo', 'path': null},
      {'icon': Icons.shield_outlined, 'text': 'Nhận cảnh báo từ lecturer khi tiến độ hoặc contribution thấp', 'path': '/student/alerts'},
      {'icon': Icons.people_outline, 'text': 'Theo dõi tiến độ chung của team và sprint completion', 'path': '/student/my-project'},
    ];
    return _sectionCard(
      title: 'Quyền hạn Student',
      subtitle: 'Những thao tác bạn có thể thực hiện trong hệ thống',
      child: Column(
        children: items.map((item) => GestureDetector(
          onTap: () {
            if (item['path'] != null) context.go(item['path'] as String);
            else _showSnack('Đã export báo cáo cá nhân thành công');
          },
          child: Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(10)),
                  child: Icon(item['icon'] as IconData, size: 16, color: emerald),
                ),
                const SizedBox(width: 10),
                Expanded(child: Text(item['text'] as String, style: const TextStyle(fontSize: 12, color: textPrimary))),
              ],
            ),
          ),
        )).toList(),
      ),
    );
  }

  // ── 13. Bottom CTA ─────────────────────────────────
  Widget _buildBottomCta() {
    final project = _currentMainProject;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: cardBorder),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 12)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Gợi ý ưu tiên hôm nay', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: textPrimary)),
          const SizedBox(height: 6),
          const Text('Hoàn thiện task dashboard Student, xử lý các open issues blocker và cập nhật SRS trước deadline gần nhất.',
              style: TextStyle(fontSize: 13, color: textSecondary, height: 1.5)),
          const SizedBox(height: 16),
          Row(
            children: [
              _primaryButton('Mở project chính', Icons.north_east_rounded, () => context.go('/student/project/${project?['id'] ?? ''}')),
              const SizedBox(width: 10),
              _actionButton('Xem deadlines / SRS', Icons.access_time_rounded, () => context.go('/student/srs')),
            ],
          ),
        ],
      ),
    );
  }

  // ── Reusable widgets ───────────────────────────────
  Widget _sectionCard({required String title, String? subtitle, Widget? action, required Widget child}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: cardBorder),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: textPrimary)),
                      if (subtitle != null) ...[
                        const SizedBox(height: 2),
                        Text(subtitle, style: const TextStyle(fontSize: 11, color: textSecondary)),
                      ],
                    ],
                  ),
                ),
                if (action != null) action,
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          Padding(padding: const EdgeInsets.all(16), child: child),
        ],
      ),
    );
  }

  Widget _statusBadge(String? status) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: _statusBgColor(status),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: _statusBgColor(status)),
        ),
        child: Text(status ?? '—', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: _statusTextColor(status))),
      );

  Widget _chip(String label, Color bg, Color text, Color border) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20), border: Border.all(color: border)),
        child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: text)),
      );

  Widget _actionButton(String label, IconData icon, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: cardBorder),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 13, color: textSecondary),
              const SizedBox(width: 5),
              Text(label, style: const TextStyle(fontSize: 12, color: textPrimary, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      );

  Widget _primaryButton(String label, IconData icon, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(color: emerald, borderRadius: BorderRadius.circular(12)),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 14, color: Colors.white),
              const SizedBox(width: 6),
              Text(label, style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      );

  Widget _emptyState(String msg) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cardBorder, style: BorderStyle.solid),
        ),
        child: Center(child: Text(msg, style: const TextStyle(fontSize: 13, color: textSecondary), textAlign: TextAlign.center)),
      );
}
