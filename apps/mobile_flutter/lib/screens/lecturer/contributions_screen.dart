// Contributions Screen — Theo dõi đóng góp
// Based on: contributions.jsx
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/lecturer_navigation.dart';
import '../../services/auth_service.dart';
import '../../services/lecturer_service.dart';
import '../../models/user.dart';

class ContributionsScreen extends StatefulWidget {
  const ContributionsScreen({super.key});

  @override
  State<ContributionsScreen> createState() => _ContributionsScreenState();
}

class _ContributionsScreenState extends State<ContributionsScreen> {
  // ── colours ───────────────────────────────────────
  static const Color bg = Color(0xFFF8FAFB);
  static const Color card = Colors.white;
  static const Color bdr = Color(0xFFF0F0F0);
  static const Color tp = Color(0xFF1A202C);
  static const Color ts = Color(0xFF64748B);
  static const Color teal = Color(0xFF0F766E);
  static const Color tealL = Color(0xFF14B8A6);

  // ── mock data ─────────────────────────────────────
  static const List<String> _weeks = [
    'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
  ];

  final AuthService _authService = AuthService();
  final LecturerService _lecturerService = LecturerService();
  User? _currentUser;
  bool _isLoading = true;

  // ── state ─────────────────────────────────────────
  String _course = '';
  String _search = '';
  String _statusFilter = 'all';
  Map<String, dynamic>? _actionStudent;
  String _actionType = 'warning';
  bool _showModal = false;
  final TextEditingController _modalMsg = TextEditingController();
  String? _banner;

  // ── dynamic data ──────────────────────────────────
  List<int> _wGh = List.filled(12, 0);
  List<Map<String, dynamic>> _courseList = [];
  List<Map<String, dynamic>> _allStudents = [];
  List<Map<String, dynamic>> _groupStats = [];

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    setState(() => _isLoading = true);
    try {
      final user = await _authService.getCurrentUser();
      final coursesData = await _lecturerService.getMyCourses();
      
      if (mounted) {
        setState(() {
          _currentUser = user;
          _courseList = coursesData.map((c) => Map<String, dynamic>.from(c)).toList();
          if (_courseList.isNotEmpty) {
            _course = _courseList.first['id'].toString();
          }
        });
        
        if (_course.isNotEmpty) {
          await _loadCourseData(_course);
        } else {
          setState(() => _isLoading = false);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        print("Error loading initial data: $e");
      }
    }
  }

  Future<void> _loadCourseData(String courseId) async {
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        _lecturerService.getCourseContributions(courseId),
        _lecturerService.getCourseGroups(courseId),
      ]);
      
      final response = results[0] as Map<String, dynamic>;
      final groupsRaw = results[1] as List<Map<String, dynamic>>;
      
      // Map group name to integration status
      final Map<String, Map<String, String>> groupIntegrations = {};
      for (var g in groupsRaw) {
        final gName = (g['name'] ?? 'N/A').toString();
        final integration = g['integration'] ?? {};
        groupIntegrations[gName] = {
          'github': (g['githubStatus'] ?? integration['approvalStatus'] ?? 'NOT_CONNECTED').toString().toUpperCase(),
          'jira': (g['jiraStatus'] ?? integration['approvalStatus'] ?? 'NOT_CONNECTED').toString().toUpperCase(),
        };
      }

      final List<dynamic> studentsRaw = response['students'] ?? [];
      final List<dynamic> weeklyRaw = response['weeklyCommits'] ?? [];

      final List<Map<String, dynamic>> students = studentsRaw.map((s) {
        final map = Map<String, dynamic>.from(s);
        final gn = map['groupName'] ?? 'N/A';
        final integ = groupIntegrations[gn] ?? {'github': 'NONE', 'jira': 'NONE'};
        
        return {
          'id': map['studentId'],
          'name': map['name'],
          'code': map['studentCode'],
          'group': gn,
          'githubStatus': integ['github'],
          'jiraStatus': integ['jira'],
          'commits': map['commits'] ?? 0,
          'prs': map['prs'] ?? 0,
          'reviews': map['reviews'] ?? 0,
          'jira': map['jiraDone'] ?? 0,
          'activeDays': map['activeDays'] ?? 0,
          'score': map['score'] ?? 0,
          'status': map['status'] ?? 'Ổn định',
          'lastActive': map['activeDays'] ?? 0, // Using activeDays as a proxy for activity
          'overdue': 0, 
        };
      }).toList();

      final List<int> weekly = List<int>.from(weeklyRaw.isNotEmpty ? weeklyRaw : List.filled(12, 0));

      if (mounted) {
        setState(() {
          _allStudents = students;
          _wGh = weekly;
          _groupStats = _calculateGroupStats(students);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        print("Error loading course data: $e");
      }
    }
  }

  List<Map<String, dynamic>> _calculateGroupStats(List<Map<String, dynamic>> students) {
    final groups = <String, Map<String, dynamic>>{};
    for (var s in students) {
      final gName = s['group'] ?? 'No Group';
      if (!groups.containsKey(gName)) {
        groups[gName] = {
          'name': gName,
          'commits': 0,
          'jira': 0,
          'members': 0,
          'githubStatus': s['githubStatus'],
          'jiraStatus': s['jiraStatus'],
        };
      }
      groups[gName]!['members']++;
      groups[gName]!['commits'] += (s['commits'] as int);
      groups[gName]!['jira'] += (s['jira'] as int);
    }
    return groups.values.toList();
  }

  void _bulkSend(String type) {
    setState(() {
      _banner = type == 'email' ? 'Đã gửi email hàng loạt cho lớp' : 'Đã gửi nhắc nhở cho các sinh viên yếu';
    });
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) setState(() => _banner = null);
    });
  }

  void _openModal(Map<String, dynamic> student, String type) {
    setState(() {
      _actionStudent = student;
      _actionType = type;
      _showModal = true;
      _modalMsg.text = type == 'email'
          ? "Chào ${student['name']}, giảng viên muốn nhắc nhở bạn về tiến độ dự án..."
          : "Cảnh báo: Bạn cần cải thiện mức độ đóng góp commit cho nhóm ${student['group']}.";
    });
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: teal, behavior: SnackBarBehavior.floating),
    );
  }

  // ── filtering ────────────────────────────────────
  List<Map<String, dynamic>> get _filtered {
    var list = _allStudents;
    if (_search.isNotEmpty) {
      final kw = _search.toLowerCase();
      list = list.where((s) =>
        s['name'].toString().toLowerCase().contains(kw) ||
        s['code'].toString().toLowerCase().contains(kw) ||
        s['group'].toString().toLowerCase().contains(kw)
      ).toList();
    }
    if (_statusFilter != 'all') {
      list = list.where((s) => s['status'] == _statusFilter).toList();
    }
    return list;
  }

  bool _shouldWarn(Map s) => s['status'] == 'Cần chú ý' || s['status'] == 'Chưa commit';

  Color _statusColor(String st) {
    switch (st) {
      case 'Rất tốt': return const Color(0xFF059669);
      case 'Tích cực': return const Color(0xFF16A34A);
      case 'Ổn định': return const Color(0xFF2563EB);
      case 'Cần chú ý': return const Color(0xFFD97706);
      default: return const Color(0xFFEF4444);
    }
  }

  Color _statusBg(String st) {
    switch (st) {
      case 'Rất tốt': return const Color(0xFFECFDF5);
      case 'Tích cực': return const Color(0xFFF0FDF4);
      case 'Ổn định': return const Color(0xFFEFF6FF);
      case 'Cần chú ý': return const Color(0xFFFFFBEB);
      default: return const Color(0xFFFFF1F2);
    }
  }

  int get _totalStudents => _allStudents.length;
  int get _totalCommits => _allStudents.fold(0, (s, e) => s + (e['commits'] as int));
  int get _activeCount => _allStudents.where((s) => (s['commits'] as int) > 0).length;
  int get _avgScore => _allStudents.isEmpty ? 0 : (_allStudents.fold(0, (s, e) => s + (e['score'] as int)) / _allStudents.length).round();
  int get _totalPRs => _allStudents.fold(0, (s, e) => s + (e['prs'] as int));
  int get _totalReviews => _allStudents.fold(0, (s, e) => s + (e['reviews'] as int));
  int get _riskCount => _allStudents.where((s) => _shouldWarn(s)).length;

  int get _maxWeekly => _wGh.isEmpty ? 1 : _wGh.reduce(math.max);

  // ── build ─────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bg,
      drawer: const LecturerDrawer(),
      appBar: AppTopHeader(
        title: 'Theo dõi đóng góp',
        user: AppUser(name: _currentUser?.fullName ?? 'Giảng viên', email: _currentUser?.email ?? '', role: 'LECTURER'),
      ),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator(color: teal))
        : Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildBreadcrumb(),
                const SizedBox(height: 12),
                _buildTopHeading(),
                const SizedBox(height: 14),
                _buildOverviewHero(),
                const SizedBox(height: 14),
                _buildStatCards(),
                const SizedBox(height: 14),
                _buildSearchAndFilter(),
                const SizedBox(height: 14),
                _buildWeeklyBarChart(),
                const SizedBox(height: 14),
                _buildTopContributors(),
                const SizedBox(height: 14),
                const Text('CHI TIẾT SINH VIÊN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: ts, letterSpacing: 1.2)),
                const SizedBox(height: 14),
                _buildStudentsTab(),
              ],
            ),
          ),
          if (_banner != null) _buildBanner(),
          if (_showModal) _buildActionModal(),
        ],
      ),
    );
  }

  Widget _buildBreadcrumb() => Wrap(
        crossAxisAlignment: WrapCrossAlignment.center, spacing: 4,
        children: const [
          Text('Giảng viên', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: teal)),
          Icon(Icons.chevron_right, size: 14, color: Color(0xFF94A3B8)),
          Text('Thống kê đóng góp', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: tp)),
        ],
      );

  Widget _buildTopHeading() => Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Thống kê đóng góp', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: tp, letterSpacing: -0.5)),
                SizedBox(height: 2),
                Text('Theo dõi nỗ lực cá nhân qua Commits, PRs và Reviews.', style: TextStyle(fontSize: 12, color: ts)),
              ],
            ),
          ),
          Column(
            children: [
              _actionBtn(Icons.warning_amber_rounded, 'Nhắc sinh viên yếu', const Color(0xFFFFF7ED), const Color(0xFFD97706), () => _bulkSend('warning')),
              const SizedBox(height: 6),
              _actionBtn(Icons.mail_outline, 'Gửi mail hàng loạt', const Color(0xFFEFF6FF), const Color(0xFF2563EB), () => _bulkSend('email')),
            ],
          ),
        ],
      );

  Widget _actionBtn(IconData icon, String label, Color bgc, Color fg, VoidCallback onTap) =>
      GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
          decoration: BoxDecoration(color: bgc, borderRadius: BorderRadius.circular(10), border: Border.all(color: fg.withOpacity(0.25))),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [Icon(icon, size: 13, color: fg), const SizedBox(width: 5), Text(label, style: TextStyle(fontSize: 11, color: fg, fontWeight: FontWeight.w600))],
          ),
        ),
      );

  Widget _buildOverviewHero() => Container(
        width: double.infinity, padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFBCEDE3)),
          gradient: const LinearGradient(colors: [Color(0xFFECFDF5), Colors.white], begin: Alignment.centerLeft, end: Alignment.centerRight),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('TỔNG QUAN LỚP HỌC', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: teal, letterSpacing: 1.2)),
            const SizedBox(height: 6),
            Text(
              _courseList.firstWhere((c) => c['id'].toString() == _course, orElse: () => {'name': 'Chọn lớp học'})['name'],
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: tp),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8, runSpacing: 8,
              children: [
                _pill('Score TB: $_avgScore', const Color(0xFFECFDF5), const Color(0xFF059669)),
                _pill('Kém: $_riskCount', const Color(0xFFFFFBEB), const Color(0xFFD97706)),
                _pill('Active: $_activeCount/$_totalStudents', const Color(0xFFEFF6FF), const Color(0xFF2563EB)),
              ],
            ),
          ],
        ),
      );

  Widget _pill(String label, Color bgc, Color fg) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(999), border: Border.all(color: fg.withOpacity(0.18))),
        child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: fg)),
      );

  Widget _buildStatCards() {
    final stats = [
      {'label': 'Tổng commits', 'value': '$_totalCommits', 'note': 'Toàn bộ lớp', 'icon': Icons.account_tree_outlined, 'color': const Color(0xFF0F766E)},
      {'label': 'Avg Score', 'value': '$_avgScore', 'note': 'Điểm trung bình', 'icon': Icons.flag_outlined, 'color': const Color(0xFF4F46E5)},
      {'label': 'Total PRs', 'value': '$_totalPRs', 'note': 'Pull Requests', 'icon': Icons.call_merge, 'color': const Color(0xFF16A34A)},
      {'label': 'Total Reviews', 'value': '$_totalReviews', 'note': 'Code Reviews', 'icon': Icons.rate_review_outlined, 'color': const Color(0xFFD97706)},
    ];

    return GridView.builder(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 10, mainAxisSpacing: 10, childAspectRatio: 1.8),
      itemCount: stats.length,
      itemBuilder: (_, i) {
        final s = stats[i];
        final c = s['color'] as Color;
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: card, borderRadius: BorderRadius.circular(18), border: Border.all(color: bdr)),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(s['label'] as String, style: const TextStyle(fontSize: 10, color: ts)),
                    const SizedBox(height: 4),
                    Text(s['value'] as String, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: tp)),
                    Text(s['note'] as String, style: const TextStyle(fontSize: 9, color: ts)),
                  ],
                ),
              ),
              Container(width: 32, height: 32, decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(10)), child: Icon(s['icon'] as IconData, color: Colors.white, size: 16)),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSearchAndFilter() => _cardWrap(
        child: Column(
          children: [
            DropdownButtonFormField<String>(
              value: _course.isEmpty ? null : _course,
              items: _courseList.map<DropdownMenuItem<String>>((c) => DropdownMenuItem<String>(value: c['id'].toString(), child: Text(c['name'], overflow: TextOverflow.ellipsis))).toList(),
              onChanged: (v) { if (v != null) { setState(() { _course = v; _isLoading = true; }); _loadCourseData(v); } },
              decoration: _inputDeco('Chọn lớp học', prefix: Icons.school_outlined),
              style: const TextStyle(fontSize: 13, color: tp),
            ),
            const SizedBox(height: 10),
            TextField(
              onChanged: (v) => setState(() => _search = v),
              style: const TextStyle(fontSize: 13, color: tp),
              decoration: _inputDeco('Tìm sinh viên, nhóm...', prefix: Icons.search),
            ),
          ],
        ),
      );

  Widget _buildWeeklyBarChart() => _cardWrap(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Hoạt động trong tuần', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: tp)),
            const SizedBox(height: 14),
            SizedBox(
              height: 160,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: List.generate(_wGh.length, (i) {
                  final v = _wGh[i];
                  final h = (v / (_maxWeekly == 0 ? 1 : _maxWeekly)) * 110;
                  return Flexible(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: Container(
                        height: math.max(h.toDouble(), v > 0 ? 6.0 : 2.0),
                        decoration: BoxDecoration(color: teal.withOpacity(0.8), borderRadius: BorderRadius.circular(4)),
                      ),
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(height: 8),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: _weeks.map((w) => Expanded(child: Text(w, textAlign: TextAlign.center, style: const TextStyle(fontSize: 9, color: ts)))).toList()),
          ],
        ),
      );

  Widget _buildTopContributors() {
    if (_allStudents.isEmpty) return const SizedBox();
    final topS = _allStudents.reduce((a, b) => (a['score'] as int) > (b['score'] as int) ? a : b);
    Map<String, dynamic>? topG;
    if (_groupStats.isNotEmpty) {
      topG = _groupStats.reduce((a, b) => ((a['commits'] as int) + (a['jira'] as int)) > ((b['commits'] as int) + (b['jira'] as int)) ? a : b);
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('ĐÓNG GÓP NỔI BẬT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: ts, letterSpacing: 1.2)),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _insightCard('Sinh viên xuất sắc', topS['name'], 'Score: ${topS['score']}', Icons.emoji_events_outlined, const Color(0xFFFDE68A), const Color(0xFF92400E))),
            const SizedBox(width: 10),
            if (topG != null) Expanded(child: _insightCard('Nhóm dẫn đầu', topG['name'], '${topG['commits']} commits', Icons.groups_outlined, const Color(0xFFBFDBFE), const Color(0xFF1E40AF))),
          ],
        ),
      ],
    );
  }

  Widget _insightCard(String label, String val, String note, IconData icon, Color bgc, Color fg) => Container(
        padding: const EdgeInsets.all(15), decoration: BoxDecoration(color: card, borderRadius: BorderRadius.circular(18), border: Border.all(color: bdr)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [Container(padding: const EdgeInsets.all(5), decoration: BoxDecoration(color: bgc, shape: BoxShape.circle), child: Icon(icon, size: 12, color: fg)), const SizedBox(width: 6), Text(label, style: const TextStyle(fontSize: 10, color: ts))]),
            const SizedBox(height: 8),
            Text(val, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: tp)),
            Text(note, style: const TextStyle(fontSize: 10, color: ts)),
          ],
        ),
      );

  Widget _buildStudentsTab() {
    final list = _filtered;
    return Column(children: list.asMap().entries.map((e) => Padding(padding: const EdgeInsets.only(bottom: 10), child: _buildStudentCard(e.value, e.key + 1))).toList());
  }

  Widget _buildStudentCard(Map<String, dynamic> s, int rank) {
    final st = s['status'].toString();
    final warn = _shouldWarn(s);
    final ghOk = s['githubStatus'] == 'APPROVED';
    final jrOk = s['jiraStatus'] == 'APPROVED';

    return _cardWrap(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(width: 40, height: 40, decoration: BoxDecoration(color: teal.withOpacity(0.1), shape: BoxShape.circle), child: Center(child: Text(s['name'].toString().substring(0, 1), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: teal)))),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('#$rank • ${s['name']}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: tp)),
                    Row(
                      children: [
                        Text('${s['code']} • ${s['group']}', style: const TextStyle(fontSize: 10, color: ts)),
                        const SizedBox(width: 6),
                        _integBadge(ghOk, 'GH'),
                        const SizedBox(width: 4),
                        _integBadge(jrOk, 'JR'),
                      ],
                    ),
                  ],
                ),
              ),
              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: _statusBg(st), borderRadius: BorderRadius.circular(6)), child: Text(st, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: _statusColor(st)))),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Điểm đóng góp: ${s['score']}/100', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: tp)),
              Text('Hoạt động: ${s['activeDays']} ngày', style: const TextStyle(fontSize: 10, color: ts)),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(value: (s['score'] as int) / 100.0, minHeight: 6, backgroundColor: const Color(0xFFF1F5F9), valueColor: AlwaysStoppedAnimation<Color>(_statusColor(st)))),
          const SizedBox(height: 12),
          Row(
            children: [
              _sChip(Icons.account_tree_outlined, '${s['commits']} commits'),
              const SizedBox(width: 12),
              _sChip(Icons.task_alt, '${s['jira']} jira'),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _sChip(Icons.call_merge, '${s['prs']} PRs'),
              const SizedBox(width: 12),
              _sChip(Icons.rate_review_outlined, '${s['reviews']} reviews'),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _miniBtn(Icons.warning_amber_rounded, 'Cảnh báo', warn ? const Color(0xFFFFFBEB) : const Color(0xFFF1F5F9), warn ? const Color(0xFFD97706) : ts, () => _openModal(s, 'warning')),
              const SizedBox(width: 8),
              _miniBtn(Icons.mail_outline, 'Mail', const Color(0xFFEFF6FF), const Color(0xFF2563EB), () => _openModal(s, 'email')),
            ],
          ),
        ],
      ),
    );
  }

  Widget _integBadge(bool ok, String label) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
    decoration: BoxDecoration(
      color: ok ? const Color(0xFFECFDF5) : const Color(0xFFF1F5F9),
      borderRadius: BorderRadius.circular(4),
      border: Border.all(color: ok ? const Color(0xFF10B981).withValues(alpha: 0.2) : const Color(0xFFD1D5DB)),
    ),
    child: Text(label, style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: ok ? const Color(0xFF059669) : ts)),
  );

  Widget _miniBtn(IconData icon, String label, Color bg, Color fg, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
      child: Row(children: [Icon(icon, size: 12, color: fg), const SizedBox(width: 4), Text(label, style: TextStyle(fontSize: 10, color: fg, fontWeight: FontWeight.bold))]),
    ),
  );

  Widget _sChip(IconData icon, String label) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [Icon(icon, size: 10, color: ts), const SizedBox(width: 3), Text(label, style: const TextStyle(fontSize: 9, color: ts))],
      );

  Widget _buildActionModal() {
    final s = _actionStudent!;
    final isEmail = _actionType == 'email';
    return Container(
      color: Colors.black54,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Container(
            padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: card, borderRadius: BorderRadius.circular(20)),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(isEmail ? 'Gửi Email' : 'Gửi Cảnh báo', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: tp)),
                const SizedBox(height: 10),
                Text('Đến sinh viên ${s['name']}', style: const TextStyle(fontSize: 12, color: ts)),
                const SizedBox(height: 20),
                TextField(controller: _modalMsg, maxLines: 4, decoration: _inputDeco('Nhập nội dung...')),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(onPressed: () => setState(() => _showModal = false), child: const Text('Hủy')),
                    const SizedBox(width: 10),
                    ElevatedButton(onPressed: () { setState(() => _showModal = false); _snack('Đã gửi thành công'); }, style: ElevatedButton.styleFrom(backgroundColor: teal), child: Text(isEmail ? 'Gửi Mail' : 'Xác nhận')),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBanner() => Positioned(
    top: 20, left: 16, right: 16,
    child: Container(
      padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: teal, borderRadius: BorderRadius.circular(10)),
      child: Text(_banner!, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
    ),
  );

  Widget _cardWrap({required Widget child}) => Container(
    width: double.infinity, padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: card, borderRadius: BorderRadius.circular(20), border: Border.all(color: bdr)),
    child: child,
  );

  InputDecoration _inputDeco(String hint, {IconData? prefix}) => InputDecoration(
    hintText: hint, hintStyle: const TextStyle(fontSize: 13, color: ts),
    prefixIcon: prefix != null ? Icon(prefix, size: 16, color: ts) : null,
    filled: true, fillColor: const Color(0xFFF8FAFC),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
  );
}
