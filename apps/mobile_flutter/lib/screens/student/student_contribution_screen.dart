import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/student_navigation.dart';
import '../../services/student_service.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';

class StudentContributionScreen extends StatefulWidget {
  const StudentContributionScreen({super.key});

  @override
  State<StudentContributionScreen> createState() => _StudentContributionScreenState();
}

class _StudentContributionScreenState extends State<StudentContributionScreen> {
  final StudentService _studentService = StudentService();
  final AuthService _authService = AuthService();
  
  bool _isLoading = true;
  User? _currentUser;
  Map<String, dynamic>? _stats;
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
      final results = await Future.wait([
        _studentService.getStats(),
        _studentService.getMyProjects(),
      ]);

      if (mounted) {
        setState(() {
          _currentUser = user;
          _stats = results[0] as Map<String, dynamic>?;
          _projects = (results[1] as List).map((p) => _normalizeProject(p)).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Map<String, dynamic> _normalizeProject(Map<String, dynamic> p) {
    final metrics = p['metrics'] ?? p['stats'] ?? {};
    final team = (p['team'] ?? p['members'] as List?) ?? [];
    
    // Find my contribution if nested
    final myMember = team.firstWhere(
      (m) => m['studentId'] == _currentUser?.studentCode, 
      orElse: () => {'commits': 0, 'prs': 0, 'issues': 0}
    );

    return {
      'id': (p['id'] ?? p['Id'] ?? '').toString(),
      'name': (p['name'] ?? p['topic'] ?? p['teamName'] ?? 'Dự án chưa tên').toString(),
      'courseName': (p['courseName'] ?? p['course']?['name'] ?? 'Software Architecture').toString(),
      'team': team,
      'myCommits': (myMember['commits'] ?? 0) as int,
      'totalCommits': (p['totalCommits'] ?? metrics['totalCommits'] ?? team.fold(0, (s, m) => s + (m['commits'] ?? 0))) as int,
      'totalIssues': (p['totalIssues'] ?? metrics['totalIssues'] ?? 0) as int,
      'totalPrs': (p['totalPrs'] ?? metrics['totalPrs'] ?? 0) as int,
      'githubCoverage': (metrics['githubCoverage'] ?? p['githubCoverage'] ?? 0).toDouble(),
      'jiraMapped': (metrics['jiraMapped'] ?? p['jiraMapped'] ?? 0).toInt(),
    };
  }

  @override
  Widget build(BuildContext context) {
    final scWidth = MediaQuery.of(context).size.width;
    final isMobile = scWidth < 900;
    
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      drawer: isMobile ? const StudentDrawer() : null,
      appBar: AppTopHeader(
        title: 'Deep Metrics',
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
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      _buildHeader(scWidth),
                      const SizedBox(height: 32),
                      _buildStatsGrid(scWidth),
                      const SizedBox(height: 32),
                      
                      // Activity Section
                      if (scWidth > 1200) 
                        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Expanded(flex: 2, child: _buildActivitySection(scWidth)),
                          const SizedBox(width: 24),
                          Expanded(child: _buildSidebarMetrics()),
                        ])
                      else ...[
                        _buildActivitySection(scWidth),
                        const SizedBox(height: 24),
                        _buildSidebarMetrics(),
                      ],

                      const SizedBox(height: 48),
                      const Text('PROJECT DEEP DIVE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 2)),
                      const SizedBox(height: 20),
                      if (_projects.isEmpty)
                        _buildEmptyState()
                      else
                        ..._projects.map((p) => _buildProjectContributionCard(p, scWidth)),
                      const SizedBox(height: 40),
                    ]),
                  ),
                ),
        ),
      ]),
    );
  }

  Widget _buildHeader(double width) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              const Text('Sinh viên', style: TextStyle(fontSize: 11, color: Color(0xFF0D9488), fontWeight: FontWeight.bold)),
              const SizedBox(width: 8),
              const Icon(Icons.chevron_right_rounded, size: 14, color: Color(0xFFCBD5E1)),
              const SizedBox(width: 8),
              const Text('Deep Metrics', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
            ]),
            const SizedBox(height: 12),
            Text('Phân tích Hiệu suất Code', style: TextStyle(fontSize: width < 400 ? 24 : 32, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A), letterSpacing: -1)),
            const SizedBox(height: 4),
            const Text('Hệ thống Antigravity AI phân tích dữ liệu chuyên sâu từ JIRA và GITHUB.', style: TextStyle(fontSize: 14, color: Color(0xFF64748B))),
          ]),
        ),
        if (width > 600)
          _headerActionBtn()
      ],
    );
  }

  Widget _headerActionBtn() {
    return ElevatedButton.icon(
      onPressed: _loadData,
      icon: const Icon(Icons.history_rounded, size: 16),
      label: const Text('REFRESH INSIGHT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0D9488),
        elevation: 0,
        side: const BorderSide(color: Color(0xFFCCFBF1)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      ),
    );
  }

  Widget _buildActivitySection(double width) {
    return Column(children: [
      _buildActivityChart(width),
      const SizedBox(height: 24),
      _buildHeatmapCard(width),
    ]);
  }

  Widget _buildSidebarMetrics() {
    return Column(children: [
      _buildRadarSimulation(),
      const SizedBox(height: 24),
      _buildAiInsights(),
    ]);
  }

  Widget _buildHeatmapCard(double width) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(40),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('CONTRIBUTION HEATMAP', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF64748B), letterSpacing: 1.5)),
        const SizedBox(height: 24),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: List.generate(12, (week) {
              return Column(
                children: List.generate(7, (day) {
                  final intensity = (week * day) % 4; // Mock
                  Color color = const Color(0xFFF1F5F9);
                  if (intensity == 1) color = const Color(0xFFCCFBF1);
                  if (intensity == 2) color = const Color(0xFF2DD4BF);
                  if (intensity == 3) color = const Color(0xFF0D9488);
                  return Container(
                    width: 14, height: 14,
                    margin: const EdgeInsets.all(2),
                    decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3)),
                  );
                }),
              );
            }),
          ),
        ),
        const SizedBox(height: 16),
        Row(children: [
          const Text('Less', style: TextStyle(fontSize: 9, color: Color(0xFF94A3B8))),
          const SizedBox(width: 4),
          ...[const Color(0xFFF1F5F9), const Color(0xFFCCFBF1), const Color(0xFF2DD4BF), const Color(0xFF0D9488)].map(
            (c) => Container(width: 10, height: 10, margin: const EdgeInsets.symmetric(horizontal: 1), decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(2)))
          ),
          const SizedBox(width: 4),
          const Text('More', style: TextStyle(fontSize: 9, color: Color(0xFF94A3B8))),
        ]),
      ]),
    );
  }

  Widget _buildRadarSimulation() {
    final skills = [
      {'lbl': 'Technical Skill', 'val': 0.85},
      {'lbl': 'Teamwork', 'val': 0.70},
      {'lbl': 'Consistency', 'val': 0.90},
      {'lbl': 'Reliability', 'val': 0.75},
    ];

    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(40),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('SKILL ANALYSIS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF64748B), letterSpacing: 1.5)),
        const SizedBox(height: 24),
        ...skills.map((s) => Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text(s['lbl'] as String, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
              Text('${((s['val'] as double) * 100).toInt()}%', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF0D9488))),
            ]),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: LinearProgressIndicator(value: s['val'] as double, minHeight: 6, backgroundColor: const Color(0xFFF1F5F9), valueColor: const AlwaysStoppedAnimation(Color(0xFF0D9488))),
            ),
          ]),
        )),
      ]),
    );
  }

  Widget _buildStatsGrid(double width) {
    final stats = [
      {'lbl': 'Tổng Commits', 'val': '${_stats?['totalCommits'] ?? 0}', 'icon': Icons.commit_rounded, 'color': const Color(0xFF6366F1)},
      {'lbl': 'Pull Requests', 'val': '${_stats?['totalPrsMerged'] ?? 0}', 'icon': Icons.merge_type_rounded, 'color': const Color(0xFFEC4899)},
      {'lbl': 'Issues Resolved', 'val': '${_stats?['totalIssuesDone'] ?? 0}', 'icon': Icons.task_alt_rounded, 'color': const Color(0xFF10B981)},
    ];

    return GridView.count(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: width < 600 ? 1 : (width < 1200 ? 3 : 3),
      crossAxisSpacing: 16, mainAxisSpacing: 16, childAspectRatio: width < 600 ? 3.5 : 2.5,
      children: stats.map((s) => _buildStatCard(s)).toList(),
    );
  }

  Widget _buildStatCard(Map<String, dynamic> s) {
    final color = s['color'] as Color;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(children: [
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14)),
          child: Icon(s['icon'] as IconData, color: color, size: 20),
        ),
        const SizedBox(width: 16),
        Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
          Text(s['lbl'] as String, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
          Text(s['val'] as String, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
        ]),
      ]),
    );
  }

  Widget _buildActivityChart(double width) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A), 
        borderRadius: BorderRadius.circular(40),
        boxShadow: [BoxShadow(color: const Color(0xFF0F172A).withValues(alpha: 0.2), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('COMMIT ACTIVITY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.blueAccent, letterSpacing: 1.5)),
          const Icon(Icons.show_chart_rounded, color: Colors.white24),
        ]),
        const SizedBox(height: 24),
        const Text('Code Velocity DNA', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
        const SizedBox(height: 32),
        SizedBox(
          height: 120,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(14, (i) {
              final h = 20 + (i % 5) * 15 + (i % 3) * 10.0; // Mock data
              return Container(
                width: width < 500 ? 12 : 18,
                height: h,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [const Color(0xFF6366F1), const Color(0xFFEC4899).withValues(alpha: 0.5)],
                    begin: Alignment.topCenter, end: Alignment.bottomCenter,
                  ),
                  borderRadius: BorderRadius.circular(6),
                ),
              );
            }),
          ),
        ),
        const SizedBox(height: 16),
        const Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Last 14 days', style: TextStyle(fontSize: 9, color: Colors.white38, fontWeight: FontWeight.bold)),
          Text('Peak: 12 commits/day', style: TextStyle(fontSize: 9, color: Colors.blueAccent, fontWeight: FontWeight.bold)),
        ]),
      ]),
    );
  }

  Widget _buildAiInsights() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(40),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('AI INSIGHTS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF0D9488), letterSpacing: 1.5)),
          Icon(Icons.auto_awesome, color: Color(0xFF0D9488), size: 18),
        ]),
        const SizedBox(height: 20),
        const Text('Hiệu suất xuất sắc', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
        const SizedBox(height: 12),
        const Text(
          'Dựa trên phân tích commit, bạn có xu hướng giải quyết các vấn đề phức tạp vào đầu tuần. Tần suất code của bạn cao hơn 35% so với trung bình nhóm.',
          style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.6),
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(color: const Color(0xFFF0FDFA), borderRadius: BorderRadius.circular(12)),
          child: const Text('Đề xuất: Tập trung vào Review PRs', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF0D9488))),
        ),
      ]),
    );
  }

  Widget _buildProjectContributionCard(Map<String, dynamic> p, double width) {
    final members = (p['team'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    if (members.isEmpty) return const SizedBox();

    final maxCommits = members.fold(1, (m, e) => (e['commits'] ?? 0) > m ? (e['commits'] as int) : m);

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(32),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(
          padding: const EdgeInsets.all(24),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(p['name'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
              Text(p['courseName'], style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
            ]),
            Text('${p['commits']} Commits', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0D9488))),
          ]),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Row(children: [
            _metricCapsule(Icons.code_rounded, 'Coverage', '${p['githubCoverage']}%', Colors.teal),
            const SizedBox(width: 12),
            _metricCapsule(Icons.task_alt_rounded, 'Jira Tasks', '${p['jiraMapped']}', Colors.blue),
          ]),
        ),
        const Divider(height: 1, color: Color(0xFFF1F5F9)),
        Padding(
          padding: const EdgeInsets.all(24),
          child: Column(children: members.map((m) {
            final isMe = m['studentId'] == _currentUser?.studentCode;
            final ratio = (m['commits'] ?? 0) / maxCommits;

            return Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: Row(children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: isMe ? const Color(0xFF0D9488) : const Color(0xFFF1F5F9),
                  child: Text((m['studentName'] ?? 'U')[0], style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isMe ? Colors.white : const Color(0xFF64748B))),
                ),
                const SizedBox(width: 16),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text(m['studentName'] ?? 'Unknown', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: isMe ? const Color(0xFF0D9488) : const Color(0xFF1E293B))),
                    Text('${m['commits'] ?? 0} commits', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF64748B))),
                  ]),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: ratio.toDouble(),
                      minHeight: 8,
                      backgroundColor: const Color(0xFFF1F5F9),
                      valueColor: AlwaysStoppedAnimation(isMe ? const Color(0xFF0D9488) : const Color(0xFFCBD5E1)),
                    ),
                  ),
                ])),
              ]),
            );
          }).toList()),
        ),
      ]),
    );
  }

  Widget _metricCapsule(IconData icon, String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(12), border: Border.all(color: color.withValues(alpha: 0.1))),
      child: Row(children: [
        Icon(icon, size: 12, color: color),
        const SizedBox(width: 6),
        Text('$label: ', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: color.withValues(alpha: 0.6))),
        Text(value, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: color)),
      ]),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(40),
        child: Column(children: [
          const Icon(Icons.bar_chart_rounded, size: 64, color: Color(0xFFCBD5E1)),
          const SizedBox(height: 16),
          const Text('CHƯA CÓ DỮ LIỆU ĐÓNG GÓP', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFFCBD5E1), letterSpacing: 2)),
        ]),
      ),
    );
  }
}
