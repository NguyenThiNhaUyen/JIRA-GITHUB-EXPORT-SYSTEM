import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/student_navigation.dart';
import '../../services/student_service.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';

// ── Design Tokens ──────────────────────────────────────────
const _kTeal = Color(0xFF0D9488);
const _kBg = Color(0xFFF8FAFC);
const _kBorder = Color(0xFFF1F5F9);
const _kText = Color(0xFF0F172A);
const _kSub = Color(0xFF64748B);

class StudentDashboard extends StatefulWidget {
  const StudentDashboard({super.key});
  @override
  State<StudentDashboard> createState() => _StudentDashboardState();
}

class _StudentDashboardState extends State<StudentDashboard> {
  final StudentService _studentService = StudentService();
  final AuthService _authService = AuthService();
  
  User? _currentUser;
  bool _isLoading = true;

  Map<String, dynamic>? _stats;
  List<Map<String, dynamic>> _courses = [];
  List<Map<String, dynamic>> _upcomingDeadlines = [];
  List<Map<String, dynamic>> _recentCommits = [];
  List<Map<String, dynamic>> _grades = [];
  List<Map<String, dynamic>> _warnings = [];

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
        _studentService.getMyCourses(),
        _studentService.getMyProjects(),
      ]);

      if (mounted) {
        setState(() {
          _currentUser = user;
          _stats = _normalizeStats(results[0] as Map<String, dynamic>?);
          _courses = (results[1] as List).cast<Map<String, dynamic>>();
          
          // Re-adding mocks for missing backend parts to prevent empty UI
          _warnings = [
            {'title': 'Thiếu Commit 3 ngày', 'msg': 'Nhóm 4 - Dự án Antigravity chưa có commit mới từ bạn.', 'type': 'severity-high'},
          ];
          _upcomingDeadlines = [
            {'title': 'SRS Version 2.0', 'course': 'PRN231', 'date': '2025-03-25'},
            {'title': 'Final Prototype Demo', 'course': 'SEP490', 'date': '2025-04-10'},
          ];
          _recentCommits = [
            {'msg': 'fix: auth logic issues', 'repo': 'mobile-flutter', 'date': '2h ago'},
            {'msg': 'feat: add kpi charts', 'repo': 'dashboard-ui', 'date': '5h ago'},
          ];
          _grades = [
            {'subject': 'Software Architecture', 'score': '9.0', 'status': 'PASS'},
            {'subject': 'Mobile Development', 'score': '8.5', 'status': 'PASS'},
          ];

          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Map<String, dynamic> _normalizeStats(Map<String, dynamic>? s) {
    if (s == null) return {};
    final integration = s['integration'] ?? s['Integration'] ?? {};
    final github = integration['github'] ?? integration['GitHub'] ?? {};
    final jira = integration['jira'] ?? integration['Jira'] ?? {};
    
    return {
      ...s,
      'totalCommits': s['totalCommits'] ?? github['commits'] ?? 0,
      'totalIssuesDone': s['totalIssuesDone'] ?? jira['issuesDone'] ?? 0,
      'totalPrsMerged': s['totalPrsMerged'] ?? github['prsMerged'] ?? 0,
      'avgContribution': s['avgContribution'] ?? s['contributionScore'] ?? 0,
      'approvedSrs': s['approvedSrs'] ?? 0,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kBg,
      drawer: const StudentDrawer(),
      appBar: AppTopHeader(
        title: 'Student Dashboard',
        user: AppUser(name: _currentUser?.fullName ?? 'Student', email: _currentUser?.email ?? '', role: 'STUDENT'),
      ),
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator(color: _kTeal))
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  _buildHeader(),
                  const SizedBox(height: 32),
                  _buildKpiGrid(),
                  const SizedBox(height: 32),
                  if (_warnings.isNotEmpty) ...[
                    _buildWarnings(),
                    const SizedBox(height: 32),
                  ],
                  _buildCoursesGrid(),
                  const SizedBox(height: 32),
                  _buildSrsOverview(), // New section based on StudentSrs.jsx
                  const SizedBox(height: 32),
                  _buildAiRecommendation(),
                  const SizedBox(height: 32),
                  _buildRecentActivity(),
                  const SizedBox(height: 32),
                  _buildAcademicGrades(),
                  const SizedBox(height: 32),
                  _buildUpcomingDeadlines(),
                  const SizedBox(height: 40),
                ]),
              ),
            ),
    );
  }

  Widget _buildSrsOverview() {
    int total = _courses.length;
    int approved = _stats?['approvedSrs'] ?? 0;
    double progress = total > 0 ? approved / total : 0;

    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(40),
        border: Border.all(color: _kBorder),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10)],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('QUẢN LÝ TÀI LIỆU SRS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: _kSub, letterSpacing: 1.2)),
            SizedBox(height: 4),
            Text('SRS Reports Center', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: _kText)),
          ]),
          IconButton(
            onPressed: () => context.go('/student/srs'),
            icon: const Icon(Icons.arrow_forward_rounded, color: _kTeal),
            style: IconButton.styleFrom(backgroundColor: _kTeal.withValues(alpha: 0.1), padding: const EdgeInsets.all(12)),
          ),
        ]),
        const SizedBox(height: 24),
        Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Tiến độ phê duyệt', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _kSub)),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: LinearProgressIndicator(value: progress, minHeight: 8, backgroundColor: _kBorder, valueColor: const AlwaysStoppedAnimation(_kTeal)),
            ),
          ])),
          const SizedBox(width: 24),
          Text('${(progress * 100).toInt()}%', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: _kTeal)),
        ]),
        const SizedBox(height: 24),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          _srsMiniStat('Đã nộp', '$approved/$total group', Icons.check_circle_rounded, _kTeal),
          _srsMiniStat('Sắp hạn', '3 ngày', Icons.timer_rounded, Colors.orange),
        ]),
      ]),
    );
  }

  Widget _srsMiniStat(String lbl, String val, IconData icon, Color color) {
    return Row(children: [
      Icon(icon, size: 14, color: color),
      const SizedBox(width: 8),
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(lbl, style: TextStyle(fontSize: 10, color: _kSub, fontWeight: FontWeight.bold)),
        Text(val, style: TextStyle(fontSize: 12, color: _kText, fontWeight: FontWeight.w900)),
      ]),
    ]);
  }

  Widget _buildHeader() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        const Text('Student', style: TextStyle(fontSize: 11, color: _kTeal, fontWeight: FontWeight.bold)),
        const SizedBox(width: 8),
        Container(width: 4, height: 4, decoration: const BoxDecoration(color: _kSub, shape: BoxShape.circle)),
        const SizedBox(width: 8),
        const Text('Premium Workspace', style: TextStyle(fontSize: 11, color: _kSub, fontWeight: FontWeight.bold)),
      ]),
      const SizedBox(height: 12),
      Text('Chào mừng, ${_currentUser?.fullName ?? "Student"}!', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: _kText)),
      const SizedBox(height: 4),
      const Text('Hệ thống Antigravity đang theo dõi tiến độ GitHub, Jira và các deadline của bạn.', style: TextStyle(fontSize: 13, color: _kSub)),
      const SizedBox(height: 20),
      Row(children: [
        _headerBtn(Icons.download_outlined, 'Export Insight', () {}),
        const SizedBox(width: 12),
        _headerBtn(Icons.logout_rounded, 'Sign Out', () {
          Provider.of<AuthProvider>(context, listen: false).logout();
          context.go('/login');
        }, isBlack: true),
      ]),
    ]);
  }

  Widget _headerBtn(IconData icon, String label, VoidCallback onTap, {bool isBlack = false}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: isBlack ? const Color(0xFF0F172A) : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: isBlack ? null : Border.all(color: _kTeal.withValues(alpha: 0.1)),
          boxShadow: [BoxShadow(color: (isBlack ? _kText : _kTeal).withValues(alpha: 0.1), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Row(children: [
          Icon(icon, size: 16, color: isBlack ? Colors.white : _kTeal),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: isBlack ? Colors.white : _kTeal)),
        ]),
      ),
    );
  }

  Widget _buildKpiGrid() {
    final kpis = [
      {'lbl': 'Commit Tuần', 'val': '${_stats?['totalCommits'] ?? 0}', 'icon': Icons.commit, 'color': Colors.indigo},
      {'lbl': 'Issues Done', 'val': '${_stats?['totalIssuesDone'] ?? 0}', 'icon': Icons.check_circle_outline, 'color': Colors.blue},
      {'lbl': 'PRs Merged', 'val': '${_stats?['totalPrsMerged'] ?? 0}', 'icon': Icons.merge_type, 'color': Colors.purple},
      {'lbl': 'Contrib Score', 'val': '${_stats?['avgContribution'] ?? 0}%', 'icon': Icons.track_changes, 'color': Colors.orange},
    ];
    return GridView.builder(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 1.5),
      itemCount: 4,
      itemBuilder: (_, i) {
        final k = kpis[i];
        final color = k['color'] as Color;
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: _kBorder),
            boxShadow: [BoxShadow(color: color.withValues(alpha: 0.05), blurRadius: 10)]),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text(k['lbl'] as String, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _kSub)),
              Icon(k['icon'] as IconData, size: 16, color: color),
            ]),
            Text(k['val'] as String, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: color)),
          ]),
        );
      },
    );
  }

  Widget _buildWarnings() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('CẢNH BÁO QUAN TRỌNG', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.redAccent, letterSpacing: 1.2)),
      const SizedBox(height: 12),
      ..._warnings.map((w) => Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFFECACA))),
        child: Row(children: [
          const Icon(Icons.warning_amber_rounded, color: Colors.redAccent),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(w['title']!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF991B1B))),
            Text(w['msg']!, style: const TextStyle(fontSize: 11, color: Color(0xFFB91C1C))),
          ])),
        ]),
      )),
    ]);
  }

  Widget _buildCoursesGrid() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        const Text('KHÓA HỌC CỦA TÔI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: _kSub, letterSpacing: 1.2)),
        TextButton(onPressed: () => context.go('/student/courses'), child: const Text('Xem tất cả', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: _kTeal))),
      ]),
      const SizedBox(height: 12),
      GridView.builder(
        shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 1, mainAxisExtent: 100, mainAxisSpacing: 12),
        itemCount: _courses.take(3).length,
        itemBuilder: (_, i) {
          final c = _courses[i];
          return GestureDetector(
            onTap: () => context.go('/student/workspace/${c['id']}'),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: _kBorder),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10)]),
              child: Row(children: [
                Container(width: 44, height: 44, decoration: BoxDecoration(color: _kTeal.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                  child: const Icon(Icons.class_outlined, color: _kTeal, size: 20)),
                const SizedBox(width: 16),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
                  Text(c['code'] ?? 'N/A', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: _kText)),
                  Text(c['name'] ?? 'N/A', style: const TextStyle(fontSize: 11, color: _kSub), maxLines: 1, overflow: TextOverflow.ellipsis),
                ])),
                const Icon(Icons.chevron_right_rounded, color: _kSub),
              ]),
            ),
          );
        },
      ),
    ]);
  }

  Widget _buildAiRecommendation() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [_kTeal, Color(0xFF4F46E5)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(44),
        boxShadow: [BoxShadow(color: _kTeal.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('AI RECOMMENDATION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white70, letterSpacing: 1.2)),
          Icon(Icons.auto_awesome, color: Colors.white.withValues(alpha: 0.5), size: 24),
        ]),
        const SizedBox(height: 24),
        const Text('Optimization Plan Available', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
        const SizedBox(height: 12),
        const Text('Dựa trên GitHub, tần suất code của bạn cao hơn 40% so với tuần trước. Duy trì phong độ này để đạt điểm A+ dự án.',
          style: TextStyle(fontSize: 12, color: Colors.white70, height: 1.6, fontWeight: FontWeight.w500)),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: () {},
          style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: _kTeal, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            elevation: 0, padding: const EdgeInsets.symmetric(vertical: 16)),
          child: const Center(child: Text('View Detailed Stats', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900))),
        ),
      ]),
    );
  }

  Widget _buildRecentActivity() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('HOẠT ĐỘNG GẦN ĐÂY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: _kSub, letterSpacing: 1.2)),
      const SizedBox(height: 16),
      ..._recentCommits.map((c) => Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: _kBorder)),
        child: Row(children: [
          const Icon(Icons.commit, size: 16, color: Colors.indigo),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(c['msg']!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _kText)),
            Text(c['repo']!, style: const TextStyle(fontSize: 10, color: _kSub)),
          ])),
          Text(c['date']!, style: const TextStyle(fontSize: 10, color: _kSub, fontWeight: FontWeight.bold)),
        ]),
      )),
    ]);
  }

  Widget _buildAcademicGrades() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('KẾT QUẢ HỌC TẬP', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: _kSub, letterSpacing: 1.2)),
      const SizedBox(height: 16),
      Container(
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(32), border: Border.all(color: _kBorder)),
        child: Column(children: _grades.map((g) => Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(border: g == _grades.last ? null : const Border(bottom: BorderSide(color: _kBorder))),
          child: Row(children: [
            Text(g['subject']!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: _kText)),
            const Spacer(),
            Text(g['score']!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: _kTeal)),
          ]),
        )).toList()),
      ),
    ]);
  }

  Widget _buildUpcomingDeadlines() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('DEADLINE SẮP TỚI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: _kSub, letterSpacing: 1.2)),
      const SizedBox(height: 16),
      ..._upcomingDeadlines.map((d) => Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: _kBorder)),
        child: Row(children: [
          Container(width: 40, height: 40, decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.calendar_today_outlined, color: Colors.orange, size: 18)),
          const SizedBox(width: 16),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(d['title']!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: _kText)),
            Text(d['course']!, style: const TextStyle(fontSize: 11, color: _kSub, fontWeight: FontWeight.bold)),
          ])),
          Text(d['date']!, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.orangeAccent)),
        ]),
      )),
    ]);
  }
}
