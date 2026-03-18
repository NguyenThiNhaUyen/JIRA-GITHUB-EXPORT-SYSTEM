import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/student_navigation.dart';
import '../../services/student_service.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';

class StudentMyProjectScreen extends StatefulWidget {
  const StudentMyProjectScreen({super.key});

  @override
  State<StudentMyProjectScreen> createState() => _StudentMyProjectScreenState();
}

class _StudentMyProjectScreenState extends State<StudentMyProjectScreen> {
  final StudentService _studentService = StudentService();
  final AuthService _authService = AuthService();
  
  bool _isLoading = true;
  User? _currentUser;
  List<Map<String, dynamic>> _projects = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final user = await _authService.getCurrentUser();
      final projects = await _studentService.getMyProjects();
      if (mounted) {
        setState(() {
          _currentUser = user;
          _projects = projects.map((p) => _normalizeProject(p)).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Map<String, dynamic> _normalizeProject(Map<String, dynamic> p) {
    // Handle integration data (GitHub/Jira)
    final integration = p['integration'] ?? {};
    final metrics = p['metrics'] ?? p['stats'] ?? {};

    return {
      'id': (p['id'] ?? p['Id'] ?? '').toString(),
      'name': (p['name'] ?? p['topic'] ?? p['teamName'] ?? 'Dự án chưa tên').toString(),
      'courseName': (p['courseName'] ?? p['course']?['name'] ?? 'Software Architecture').toString(),
      'courseId': (p['courseId'] ?? p['CourseId'] ?? '').toString(),
      'courseCode': (p['courseCode'] ?? p['course']?['subject']?['code'] ?? 'N/A').toString(),
      'progressPercent': (p['progressPercent'] ?? 0).toInt(),
      'team': p['team'] ?? p['members'] ?? [],
      'teamLeaderId': (p['teamLeaderId'] ?? p['leaderId'] ?? '').toString(),
      'status': (p['status'] ?? 'ACTIVE').toString(),
      'integration': {
        'githubUrl': integration['githubUrl'] ?? p['githubUrl'] ?? p['repositoryUrl'] ?? '',
        'repositoryName': integration['repositoryName'] ?? p['repositoryName'] ?? 'N/A',
        'jiraUrl': integration['jiraUrl'] ?? p['jiraUrl'] ?? '',
        'jiraProjectKey': integration['jiraProjectKey'] ?? p['jiraProjectKey'] ?? 'N/A',
      },
      'metrics': {
        'totalCommits': (metrics['totalCommits'] ?? p['totalCommits'] ?? 0) as int,
        'totalIssues': (metrics['totalIssues'] ?? p['totalIssues'] ?? 0) as int,
        'totalPrs': (metrics['totalPrs'] ?? p['totalPrs'] ?? 0) as int,
        'contributionScore': (metrics['contributionScore'] ?? p['contributionScore'] ?? 0).toDouble(),
      }
    };
  }

  @override
  Widget build(BuildContext context) {
    final scWidth = MediaQuery.of(context).size.width;
    final isMobile = scWidth < 900;
    final isSmall = scWidth < 450;
    
    final leaderCount = _projects.where((p) {
      final members = (p['team'] as List?) ?? [];
      return members.any((m) => m['studentId'] == _currentUser?.studentCode && m['role'] == 'LEADER');
    }).length;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: isMobile ? const StudentDrawer() : null,
      appBar: AppTopHeader(
        title: 'Dự án của tôi',
        user: AppUser(name: _currentUser?.fullName ?? 'Student', email: _currentUser?.email ?? '', role: 'STUDENT'),
      ),
      body: Row(children: [
        if (!isMobile) const StudentSidebar(),
        Expanded(
          child: _isLoading 
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)))
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: EdgeInsets.symmetric(horizontal: isSmall ? 16 : 24, vertical: 24),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      _buildHeader(scWidth),
                      const SizedBox(height: 32),
                      _buildStatsGrid(scWidth, leaderCount),
                      const SizedBox(height: 32),
                      if (_projects.isEmpty)
                        _buildEmptyState()
                      else
                        _buildProjectsList(isMobile, scWidth),
                      const SizedBox(height: 40),
                    ]),
                  ),
                ),
        ),
      ]),
    );
  }

  Widget _buildHeader(double width) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(children: [
          GestureDetector(
            onTap: () => context.go('/student'),
            child: const Text('Sinh viên', style: TextStyle(fontSize: 11, color: Color(0xFF0D9488), fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.chevron_right_rounded, size: 14, color: Color(0xFFCBD5E1)),
          const SizedBox(width: 8),
          const Text('Dự án', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
        ]),
      ),
      const SizedBox(height: 12),
      Text('Dự án của tôi', style: TextStyle(fontSize: width < 400 ? 24 : 32, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A), letterSpacing: -1)),
      const SizedBox(height: 4),
      const Text('Quản lý các nhóm và dự án bạn đang tham gia.', style: TextStyle(fontSize: 14, color: Color(0xFF64748B))),
    ]);
  }

  Widget _buildStatsGrid(double width, int leaderCount) {
    final stats = [
      {'lbl': 'Dự án tham gia', 'val': '${_projects.length}', 'icon': Icons.folder_copy_outlined, 'color': const Color(0xFF6366F1)},
      {'lbl': 'Vai trò Leader', 'val': '$leaderCount', 'icon': Icons.stars_rounded, 'color': const Color(0xFFF59E0B)},
      {'lbl': 'Tiến độ TB', 'val': '--', 'icon': Icons.auto_graph_rounded, 'color': const Color(0xFF10B981)},
    ];

    if (width < 600) {
      return Column(children: stats.map((s) => _buildStatCard(s, true)).toList());
    }

    return GridView.count(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: width < 1200 ? 2 : 3,
      crossAxisSpacing: 16, mainAxisSpacing: 16, childAspectRatio: 2.8,
      children: stats.map((s) => _buildStatCard(s, false)).toList(),
    );
  }

  Widget _buildStatCard(Map<String, dynamic> s, bool isFullWidth) {
    final color = s['color'] as Color;
    return Container(
      margin: isFullWidth ? const EdgeInsets.only(bottom: 12) : EdgeInsets.zero,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(children: [
        Container(
          width: 48, height: 48,
          decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16)),
          child: Icon(s['icon'] as IconData, color: color, size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
          Text(s['lbl'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
          const SizedBox(height: 2),
          Text(s['val'] as String, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
        ])),
      ]),
    );
  }

  Widget _buildProjectsList(bool isMobile, double width) {
    return Column(children: _projects.map((p) => _buildProjectCard(p, width)).toList());
  }

  Widget _buildProjectCard(Map<String, dynamic> p, double width) {
    final bool isLeader = (p['team'] as List?)?.any((m) => m['studentId'] == _currentUser?.studentCode && m['role'] == 'LEADER') == true;
    final bool isSmall = width < 500;

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(40),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      clipBehavior: Clip.antiAlias,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.go('/student/project/${p['id']}'),
          child: Padding(
            padding: EdgeInsets.all(isSmall ? 24 : 40),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Flexible(child: Text(p['name'], style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5, height: 1.1), maxLines: 1, overflow: TextOverflow.ellipsis)),
                      const SizedBox(width: 12),
                      _statusBadge(isLeader ? 'Leader' : 'Member', isLeader ? Colors.orange : const Color(0xFF0D9488)),
                    ]),
                    const SizedBox(height: 24),
                    Row(children: [
                      Expanded(child: _infoColumn('Lớp học', p['courseName'], const Color(0xFF64748B))),
                      const SizedBox(width: 40),
                      Expanded(child: _infoColumn('Tiến độ', '${p['progressPercent']}%', const Color(0xFF0D9488))),
                    ]),
                    const SizedBox(height: 24),
                    const Divider(height: 1, color: Color(0xFFF1F5F9)),
                    const SizedBox(height: 24),
                    Row(children: [
                      Expanded(child: _infoBoxSmall('GITHUB', p['integration']['repositoryName'] ?? 'N/A', Icons.code_rounded)),
                      const SizedBox(width: 16),
                      Expanded(child: _infoBoxSmall('JIRA', p['integration']['jiraProjectKey'] ?? 'N/A', Icons.task_alt_rounded)),
                    ]),
                  ]),
                ),
                if (!isSmall) ...[
                  const SizedBox(width: 40),
                  ElevatedButton(
                    onPressed: () => context.go('/student/project/${p['id']}'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F172A),
                      foregroundColor: Colors.white,
                      elevation: 8,
                      shadowColor: const Color(0xFF0F172A).withValues(alpha: 0.3),
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                    ),
                    child: const Text('BẢNG ĐIỀU KHIỂN', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _infoColumn(String label, String value, Color valColor) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFFCBD5E1), letterSpacing: 1)),
      const SizedBox(height: 6),
      Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: valColor, overflow: TextOverflow.ellipsis)),
    ]);
  }

  Widget _infoBoxSmall(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(16)),
      child: Row(children: [
        Icon(icon, size: 14, color: const Color(0xFF64748B)),
        const SizedBox(width: 8),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 0.5)),
          Text(value, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)), maxLines: 1, overflow: TextOverflow.ellipsis),
        ])),
      ]),
    );
  }

  Widget _statusBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
      child: Text(label, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: color)),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Container(
        margin: const EdgeInsets.only(top: 60),
        padding: const EdgeInsets.all(40),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(40), border: Border.all(color: const Color(0xFFF1F5F9), style: BorderStyle.none)),
        child: Column(children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(32)),
            child: const Icon(Icons.folder_off_outlined, size: 40, color: Color(0xFFCBD5E1)),
          ),
          const SizedBox(height: 24),
          const Text('BẠN CHƯA THAM GIA DỰ ÁN NÀO', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFFCBD5E1), letterSpacing: 2)),
        ]),
      ),
    );
  }
}
