// Contributions Screen — Theo dõi đóng góp
// Based on: contributions.jsx
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/lecturer_navigation.dart';
import '../../services/auth_service.dart';
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
    'T1',
    'T2',
    'T3',
    'T4',
    'T5',
    'T6',
    'T7',
    'T8',
    'T9',
    'T10',
    'T11',
    'T12'
  ];

  static const List<int> _wGh = [];
  static const List<int> _wJira = [];

  static const List<Map<String, dynamic>> _courses = [];

  static const List<Map<String, dynamic>> _allStudents = [];

  static const List<Map<String, dynamic>> _groupStats = [];

  // ── state ─────────────────────────────────────────
  String _course = 'c1';
  String _tab = 'overview'; // overview | groups | students
  String _search = '';
  String _statusFilter = 'all';
  Map<String, dynamic>? _actionStudent;
  String _actionType = 'warning';
  bool _showModal = false;
  final TextEditingController _modalMsg = TextEditingController();
  String? _banner;

  final AuthService _authService = AuthService();
  User? _currentUser;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    try {
      final user = await _authService.getCurrentUser();
      if (mounted) {
        setState(() {
          _currentUser = user;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _modalMsg.dispose();
    super.dispose();
  }

  // ── helpers ───────────────────────────────────────
  List<Map<String, dynamic>> get _sortedStudents {
    final list = List<Map<String, dynamic>>.from(_allStudents)
      ..sort((a, b) {
        final scoreCompare = (b['score'] as int).compareTo(a['score'] as int);
        if (scoreCompare != 0) return scoreCompare;
        return (b['commits'] as int).compareTo(a['commits'] as int);
      });
    return list;
  }

  List<Map<String, dynamic>> get _filtered {
    var list = List<Map<String, dynamic>>.from(_sortedStudents);

    if (_search.isNotEmpty) {
      final kw = _search.toLowerCase();
      list = list
          .where((s) =>
              s['name'].toString().toLowerCase().contains(kw) ||
              s['code'].toString().toLowerCase().contains(kw) ||
              s['group'].toString().toLowerCase().contains(kw))
          .toList();
    }

    if (_statusFilter != 'all') {
      list = list.where((s) => s['status'] == _statusFilter).toList();
    }

    return list;
  }

  List<Map<String, dynamic>> get _riskGroups =>
      _groupStats.where((g) => _riskLabel(g) != 'Ổn định').toList();

  List<Map<String, dynamic>> get _previewRiskGroups =>
      _riskGroups.take(3).toList();

  List<Map<String, dynamic>> get _highRiskStudents =>
      _sortedStudents.where((s) => _shouldWarn(s)).toList();

  Map<String, dynamic>? get _strongestGroup {
    if (_groupStats.isEmpty) return null;
    final list = List<Map<String, dynamic>>.from(_groupStats)
      ..sort((a, b) => (b['commits'] as int).compareTo(a['commits'] as int));
    return list.first;
  }

  Map<String, dynamic>? get _topStudent {
    if (_sortedStudents.isEmpty) return null;
    return _sortedStudents.first;
  }

  bool _shouldWarn(Map s) =>
      s['commits'] == 0 ||
      (s['score'] as int) < 40 ||
      (s['lastActive'] as int) > 7 ||
      (s['overdue'] as int) >= 2 ||
      s['status'] == 'Cần chú ý';

  Color _statusColor(String st) {
    switch (st) {
      case 'Rất tốt':
        return const Color(0xFF059669);
      case 'Tích cực':
        return const Color(0xFF16A34A);
      case 'Ổn định':
        return const Color(0xFF2563EB);
      case 'Cần chú ý':
        return const Color(0xFFD97706);
      default:
        return const Color(0xFFEF4444);
    }
  }

  Color _statusBg(String st) {
    switch (st) {
      case 'Rất tốt':
        return const Color(0xFFECFDF5);
      case 'Tích cực':
        return const Color(0xFFF0FDF4);
      case 'Ổn định':
        return const Color(0xFFEFF6FF);
      case 'Cần chú ý':
        return const Color(0xFFFFFBEB);
      default:
        return const Color(0xFFFFF1F2);
    }
  }

  Color _heatColor(int v) {
    if (v <= 0) return const Color(0xFFF1F5F9);
    if (v == 1) return const Color(0xFFD1FAE5);
    if (v == 2) return const Color(0xFFA7F3D0);
    if (v == 3) return const Color(0xFF6EE7B7);
    if (v == 4) return const Color(0xFF34D399);
    return const Color(0xFF059669);
  }

  String _riskLabel(Map g) {
    if ((g['zero'] as int) >= 2 ||
        (g['balance'] as int) < 35 ||
        (g['commits'] as int) < 8) {
      return 'Rủi ro cao';
    }
    if ((g['zero'] as int) >= 1 ||
        (g['balance'] as int) < 55 ||
        (g['commits'] as int) < 15) {
      return 'Cần theo dõi';
    }
    return 'Ổn định';
  }

  Color _riskColor(String risk) {
    switch (risk) {
      case 'Rủi ro cao':
        return const Color(0xFFEF4444);
      case 'Cần theo dõi':
        return const Color(0xFFD97706);
      default:
        return const Color(0xFF16A34A);
    }
  }

  Color _riskBg(String risk) {
    switch (risk) {
      case 'Rủi ro cao':
        return const Color(0xFFFFF1F2);
      case 'Cần theo dõi':
        return const Color(0xFFFFFBEB);
      default:
        return const Color(0xFFF0FDF4);
    }
  }

  List<int> _groupMemberCommits(String groupName) {
    return _allStudents
        .where((s) => s['group'] == groupName)
        .map((e) => e['commits'] as int)
        .toList();
  }

  List<Map<String, dynamic>> _groupMembers(String groupName) {
    final list = _allStudents.where((s) => s['group'] == groupName).toList()
      ..sort((a, b) => (b['score'] as int).compareTo(a['score'] as int));
    return list;
  }

  void _snack(String msg) {
    setState(() => _banner = msg);
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (mounted) setState(() => _banner = null);
    });
  }

  void _openModal(Map<String, dynamic> student, String type) {
    _actionStudent = student;
    _actionType = type;
    _modalMsg.text = type == 'email'
        ? 'Chào ${student['name']}, mức độ đóng góp hiện tại của bạn đang thấp hơn kỳ vọng của học phần. Vui lòng kiểm tra lại tiến độ, cập nhật công việc và chủ động phối hợp với nhóm để cải thiện.'
        : 'Bạn cần cải thiện mức độ đóng góp. Vui lòng cập nhật tiến độ sớm.';
    setState(() => _showModal = true);
  }

  void _bulkSend(String type) {
    final targets = _highRiskStudents.take(5).length;
    if (targets == 0) {
      _snack('Không có sinh viên nào cần nhắc trong bộ lọc hiện tại');
      return;
    }
    _snack(type == 'email'
        ? 'Đã gửi email hàng loạt cho $targets sinh viên'
        : 'Đã gửi cảnh báo hàng loạt cho $targets sinh viên');
  }

  // ── stats ─────────────────────────────────────────
  int get _totalCommits =>
      _allStudents.fold(0, (s, e) => s + (e['commits'] as int));
  int get _totalJira =>
      _allStudents.fold(0, (s, e) => s + (e['jira'] as int));
  int get _totalStudents => _allStudents.length;
  int get _totalPRs =>
      _allStudents.fold(0, (s, e) => s + (e['prs'] as int));
  int get _totalReviews =>
      _allStudents.fold(0, (s, e) => s + (e['reviews'] as int));
  int get _activeCount =>
      _allStudents.where((s) => (s['commits'] as int) > 0).length;
  int get _inactiveCount =>
      _allStudents.where((s) => s['commits'] == 0).length;
  int get _avgScore => _totalStudents == 0 ? 0 : (_allStudents.fold(
              0, (s, e) => s + (e['score'] as int)) /
          _totalStudents)
      .round();

  int get _maxWeekly {
    final all = [..._wGh, ..._wJira];
    return all.isEmpty ? 1 : all.reduce(math.max);
  }

  int get _maxGroupCommits {
    if (_groupStats.isEmpty) return 1;
    return _groupStats
        .map((g) => g['commits'] as int)
        .reduce(math.max);
  }

  // ── build ─────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bg,
      drawer: const LecturerDrawer(),
      appBar: AppTopHeader(
        title: 'Theo dõi đóng góp',
        user: AppUser(
          name: _currentUser?.fullName ?? 'Giảng viên',
          email: _currentUser?.email ?? '',
          role: 'LECTURER',
        ),
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
                _buildToolbarCard(),
                const SizedBox(height: 14),
                if (_tab == 'overview') ...[
                  _buildOverviewTab(),
                ] else if (_tab == 'groups') ...[
                  _buildGroupsTab(),
                ] else ...[
                  _buildStudentsTab(),
                ],
              ],
            ),
          ),
          if (_banner != null) _buildBanner(),
          if (_showModal) _buildActionModal(),
        ],
      ),
    );
  }

  // ── breadcrumb ───────────────────────────────────
  Widget _buildBreadcrumb() => Wrap(
        crossAxisAlignment: WrapCrossAlignment.center,
        spacing: 4,
        children: const [
          Text(
            'Giảng viên',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: teal,
            ),
          ),
          Icon(Icons.chevron_right, size: 14, color: Color(0xFF94A3B8)),
          Text(
            'Theo dõi đóng góp',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: tp,
            ),
          ),
        ],
      );

  // ── top heading ──────────────────────────────────
  Widget _buildTopHeading() => Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Theo dõi đóng góp',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: tp,
                    letterSpacing: -0.5,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Commit, hiệu suất nhóm và mức độ tham gia của từng sinh viên',
                  style: TextStyle(fontSize: 12, color: ts),
                ),
              ],
            ),
          ),
          Column(
            children: [
              _actionBtn(
                Icons.warning_amber_rounded,
                'Nhắc sinh viên yếu',
                const Color(0xFFFFF7ED),
                const Color(0xFFD97706),
                () => _bulkSend('warning'),
              ),
              const SizedBox(height: 6),
              _actionBtn(
                Icons.mail_outline,
                'Gửi mail hàng loạt',
                const Color(0xFFEFF6FF),
                const Color(0xFF2563EB),
                () => _bulkSend('email'),
              ),
            ],
          ),
        ],
      );

  Widget _actionBtn(
    IconData icon,
    String label,
    Color bgc,
    Color fg,
    VoidCallback onTap,
  ) =>
      GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
          decoration: BoxDecoration(
            color: bgc,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: fg.withOpacity(0.25)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 13, color: fg),
              const SizedBox(width: 5),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  color: fg,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      );

  // ── hero overview ─────────────────────────────────
  Widget _buildOverviewHero() => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFBCEDE3)),
          gradient: const LinearGradient(
            colors: [
              Color(0xFFECFDF5),
              Colors.white,
              Color(0xFFF0FDF4),
            ],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              runSpacing: 10,
              spacing: 10,
              alignment: WrapAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'TỔNG QUAN LỚP HỌC',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: teal,
                        letterSpacing: 1.2,
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'SWD392 - Software Architecture',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: tp,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      '3 nhóm • 12 sinh viên • theo dõi hiệu suất và mức độ tham gia',
                      style: TextStyle(fontSize: 12, color: ts),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Điểm đóng góp được ước tính từ commit, Jira hoàn thành, pull request, review, số ngày hoạt động và task quá hạn.',
                      style: TextStyle(fontSize: 11, color: ts),
                    ),
                  ],
                ),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _pill(
                      'Điểm TB: $_avgScore/100',
                      const Color(0xFFECFDF5),
                      const Color(0xFF059669),
                    ),
                    _pill(
                      'Jira hoàn thành: $_totalJira',
                      const Color(0xFFEFF6FF),
                      const Color(0xFF2563EB),
                    ),
                    _pill(
                      'Nhóm cần theo dõi: ${_riskGroups.length}',
                      const Color(0xFFFFFBEB),
                      const Color(0xFFD97706),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      );

  Widget _pill(String label, Color bgc, Color fg) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: fg.withOpacity(0.18)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: fg,
          ),
        ),
      );

  // ── stat cards ───────────────────────────────────
  Widget _buildStatCards() {
    final stats = [
      {
        'label': 'Tổng commits',
        'value': '$_totalCommits',
        'note': 'Toàn bộ sinh viên trong lớp',
        'icon': Icons.account_tree_outlined,
        'color': const Color(0xFF0F766E)
      },
      {
        'label': 'Sinh viên tích cực',
        'value': '$_activeCount',
        'note': 'Có ít nhất 1 commit',
        'icon': Icons.people_outline,
        'color': const Color(0xFF16A34A)
      },
      {
        'label': 'Điểm trung bình',
        'value': '$_avgScore',
        'note': 'Điểm đóng góp / 100',
        'icon': Icons.flag_outlined,
        'color': const Color(0xFF4F46E5)
      },
      {
        'label': 'Pull request',
        'value': '$_totalPRs',
        'note': 'Reviews: $_totalReviews',
        'icon': Icons.call_merge,
        'color': const Color(0xFF2563EB)
      },
      {
        'label': 'Nhóm rủi ro',
        'value': '${_riskGroups.length}',
        'note': 'Mất cân bằng hoặc ít hoạt động',
        'icon': Icons.shield_outlined,
        'color': const Color(0xFFD97706)
      },
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.65,
      ),
      itemCount: stats.length,
      itemBuilder: (_, i) {
        final s = stats[i];
        final c = s['color'] as Color;
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: card,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: bdr),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 8,
                offset: const Offset(0, 2),
              )
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      s['label'] as String,
                      style: const TextStyle(fontSize: 10, color: ts),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      s['value'] as String,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: tp,
                        height: 1,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      s['note'] as String,
                      style: const TextStyle(fontSize: 9, color: ts),
                    ),
                  ],
                ),
              ),
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: c,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  s['icon'] as IconData,
                  color: Colors.white,
                  size: 18,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ── toolbar card ─────────────────────────────────
  Widget _buildToolbarCard() => _cardWrap(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildTabs(),
            const SizedBox(height: 14),
            TextField(
              onChanged: (v) => setState(() => _search = v),
              style: const TextStyle(fontSize: 13, color: tp),
              decoration:
                  _inputDeco('Tìm theo tên, MSSV, nhóm...', prefix: Icons.search),
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              value: _statusFilter,
              items: const [
                DropdownMenuItem(
                  value: 'all',
                  child: Text('Tất cả trạng thái'),
                ),
                DropdownMenuItem(
                  value: 'Rất tốt',
                  child: Text('Rất tốt'),
                ),
                DropdownMenuItem(
                  value: 'Tích cực',
                  child: Text('Tích cực'),
                ),
                DropdownMenuItem(
                  value: 'Ổn định',
                  child: Text('Ổn định'),
                ),
                DropdownMenuItem(
                  value: 'Cần chú ý',
                  child: Text('Cần chú ý'),
                ),
                DropdownMenuItem(
                  value: 'Chưa commit',
                  child: Text('Chưa commit'),
                ),
              ],
              onChanged: (v) => setState(() => _statusFilter = v ?? 'all'),
              decoration: _inputDeco('', prefix: Icons.filter_list_rounded),
              style: const TextStyle(fontSize: 13, color: tp),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _bulkBtn(
                  Icons.warning_amber_rounded,
                  'Nhắc sinh viên yếu',
                  const Color(0xFFF59E0B),
                  () => _bulkSend('warning'),
                ),
                _bulkBtn(
                  Icons.mail_outline,
                  'Gửi mail hàng loạt',
                  const Color(0xFF2563EB),
                  () => _bulkSend('email'),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: const Text(
                    'Đã gửi: 0 lượt',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: ts,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      );

  Widget _bulkBtn(
    IconData icon,
    String label,
    Color color,
    VoidCallback onTap,
  ) =>
      GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 14, color: Colors.white),
              const SizedBox(width: 6),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      );

  // ── tabs ─────────────────────────────────────────
  Widget _buildTabs() {
    final tabs = [
      {
        'key': 'overview',
        'label': 'Tổng quan',
        'icon': Icons.grid_view_rounded
      },
      {'key': 'groups', 'label': 'Nhóm', 'icon': Icons.people_outline},
      {'key': 'students', 'label': 'Sinh viên', 'icon': Icons.person_outline},
    ];

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: tabs.map((t) {
        final active = _tab == t['key'];
        return GestureDetector(
          onTap: () => setState(() => _tab = t['key'] as String),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
            decoration: BoxDecoration(
              color: active ? teal : card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: active ? teal : const Color(0xFFE2E8F0),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  t['icon'] as IconData,
                  size: 15,
                  color: active ? Colors.white : ts,
                ),
                const SizedBox(width: 6),
                Text(
                  t['label'] as String,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: active ? Colors.white : ts,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  // ── overview ─────────────────────────────────────
  Widget _buildOverviewTab() => Column(
        children: [
          _buildWeeklyBarChart(),
          const SizedBox(height: 14),
          _buildLineChart(),
          const SizedBox(height: 14),
          _buildHeatmap(),
          const SizedBox(height: 14),
          _buildOverviewCompareAndInsights(),
          const SizedBox(height: 14),
          _buildOverviewRiskAndSummary(),
          const SizedBox(height: 14),
          _buildAlertPanel(),
        ],
      );

  // ── weekly commits bar chart ─────────────────────
  Widget _buildWeeklyBarChart() => _cardWrap(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.account_tree_outlined,
                    size: 16,
                    color: teal,
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  'Commits theo tuần',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: tp,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            SizedBox(
              height: 160,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: List.generate(_wGh.length, (i) {
                  final value = _wGh[i];
                  final h = (value / _maxWeekly) * 110;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Text(
                            '$value',
                            style: const TextStyle(fontSize: 9, color: ts),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            height: math.max(h, value > 0 ? 8 : 0),
                            decoration: BoxDecoration(
                              borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(6),
                              ),
                              gradient: const LinearGradient(
                                colors: [Color(0xFF14B8A6), Color(0xFF5EEAD4)],
                                begin: Alignment.bottomCenter,
                                end: Alignment.topCenter,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: _weeks
                  .map(
                    (w) => Expanded(
                      child: Text(
                        w,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 9, color: ts),
                      ),
                    ),
                  )
                  .toList(),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: _miniSummaryBox(
                    'Đỉnh hoạt động',
                    '${_wGh.reduce(math.max)} commits',
                    const Color(0xFFECFDF5),
                    const Color(0xFF059669),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _miniSummaryBox(
                    'Tổng 12 tuần',
                    '${_wGh.fold(0, (a, b) => a + b)}',
                    const Color(0xFFEFF6FF),
                    const Color(0xFF2563EB),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _miniSummaryBox(
                    'TB / tuần',
                    '${_wGh.isEmpty ? 0 : (_wGh.fold(0, (a, b) => a + b) / _wGh.length).round()}',
                    const Color(0xFFFFFBEB),
                    const Color(0xFFD97706),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              '* Dữ liệu đang dùng mock analytics ổn định theo course. Khi tích hợp backend/GitHub API có thể thay bằng dữ liệu thật mà không cần đổi UI.',
              style: TextStyle(fontSize: 10, color: ts),
            ),
          ],
        ),
      );

  Widget _miniSummaryBox(String label, String value, Color bgc, Color fg) =>
      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: bgc,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: fg.withOpacity(0.15)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                color: fg,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                color: fg,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      );

  // ── line chart ───────────────────────────────────
  Widget _buildLineChart() {
    final allVals = [..._wGh, ..._wJira];
    final maxVal = allVals.isEmpty ? 1 : allVals.reduce((a, b) => a > b ? a : b);

    return _cardWrap(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.trending_up_rounded,
                  size: 16,
                  color: Color(0xFF2563EB),
                ),
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'GitHub vs Jira theo tuần',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: tp,
                  ),
                ),
              ),
              _legendDot(tealL, 'GitHub'),
              const SizedBox(width: 10),
              _legendDot(const Color(0xFF3B82F6), 'Jira'),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'So sánh nhịp commit và task đã hoàn thành',
            style: TextStyle(fontSize: 11, color: ts),
          ),
          const SizedBox(height: 14),
          SizedBox(
            height: 120,
            child: CustomPaint(
              painter: _LineChartPainter(_wGh, _wJira, maxVal.toDouble()),
              child: const SizedBox.expand(),
            ),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: _weeks
                .map((w) => Text(
                      w,
                      style: const TextStyle(fontSize: 9, color: ts),
                    ))
                .toList(),
          ),
        ],
      ),
    );
  }

  Widget _legendDot(Color c, String label) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(color: c, shape: BoxShape.circle),
          ),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 10, color: ts)),
        ],
      );

  // ── heatmap ──────────────────────────────────────
  Widget _buildHeatmap() {
    final days = List.generate(84, (i) => [0, 1, 2, 3, 4, 5][i % 6]);
    final weeks = <List<int>>[];
    for (int i = 0; i < days.length; i += 7) {
      weeks.add(days.sublist(i, i + 7));
    }

    return _cardWrap(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.timeline_outlined,
                  size: 16,
                  color: Color(0xFF059669),
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'Heatmap hoạt động',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: tp,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const SizedBox(width: 26),
                    ...List.generate(
                      weeks.length,
                      (i) => SizedBox(
                        width: 42,
                        child: Text(
                          _weeks[i % _weeks.length],
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 9, color: ts),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Column(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: const [
                        SizedBox(height: 4),
                        Text('T2', style: TextStyle(fontSize: 8, color: ts)),
                        SizedBox(height: 6),
                        Text('T4', style: TextStyle(fontSize: 8, color: ts)),
                        SizedBox(height: 6),
                        Text('T6', style: TextStyle(fontSize: 8, color: ts)),
                        SizedBox(height: 4),
                      ],
                    ),
                    const SizedBox(width: 4),
                    Row(
                      children: weeks
                          .map(
                            (wk) => Padding(
                              padding: const EdgeInsets.only(right: 4),
                              child: Column(
                                children: wk
                                    .map(
                                      (v) => Padding(
                                        padding:
                                            const EdgeInsets.only(bottom: 4),
                                        child: Container(
                                          width: 14,
                                          height: 14,
                                          decoration: BoxDecoration(
                                            color: _heatColor(v),
                                            borderRadius:
                                                BorderRadius.circular(3),
                                          ),
                                        ),
                                      ),
                                    )
                                    .toList(),
                              ),
                            ),
                          )
                          .toList(),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Text('Ít', style: TextStyle(fontSize: 10, color: ts)),
              const SizedBox(width: 4),
              ...[0, 1, 2, 3, 4, 5].map(
                (v) => Padding(
                  padding: const EdgeInsets.only(right: 3),
                  child: Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      color: _heatColor(v),
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ),
              ),
              const Text('Nhiều', style: TextStyle(fontSize: 10, color: ts)),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Tổng hợp cường độ hoạt động của cả lớp trong 12 tuần gần nhất',
            style: TextStyle(fontSize: 10, color: ts),
          ),
        ],
      ),
    );
  }

  // ── overview compare + insight ───────────────────
  Widget _buildOverviewCompareAndInsights() => Column(
        children: [
          _buildGroupComparisonCard(),
          const SizedBox(height: 14),
          _buildQuickInsightCard(),
        ],
      );

  Widget _buildGroupComparisonCard() => _cardWrap(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.bar_chart_rounded,
                    size: 16,
                    color: Color(0xFF2563EB),
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  'So sánh đóng góp theo nhóm',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: tp,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            ..._groupStats.map((g) {
              final risk = _riskLabel(g);
              final widthPercent =
                  ((g['commits'] as int) / _maxGroupCommits).clamp(0.0, 1.0);
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFAFAFA),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFF1F5F9)),
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
                              Text(
                                g['name'] as String,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: tp,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                '${g['members']} thành viên • ${g['zero']} chưa commit',
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: ts,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 9, vertical: 4),
                          decoration: BoxDecoration(
                            color: _riskBg(risk),
                            borderRadius: BorderRadius.circular(999),
                            border:
                                Border.all(color: _riskColor(risk).withOpacity(.2)),
                          ),
                          child: Text(
                            risk,
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: _riskColor(risk),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(999),
                      child: LinearProgressIndicator(
                        value: widthPercent.toDouble(),
                        minHeight: 8,
                        backgroundColor: const Color(0xFFF1F5F9),
                        valueColor: const AlwaysStoppedAnimation<Color>(
                          Color(0xFF6366F1),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: _tinyMetric('Commits', '${g['commits']}'),
                        ),
                        Expanded(
                          child: _tinyMetric('Jira', '${g['jira']}'),
                        ),
                        Expanded(
                          child: _tinyMetric('Balance', '${g['balance']}%'),
                        ),
                        Expanded(
                          child: _tinyMetric(
                            'Score nhóm',
                            '${((g['commits'] as int) + (g['jira'] as int))}',
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              );
            }),
          ],
        ),
      );

  Widget _tinyMetric(String label, String value) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 9, color: ts)),
          const SizedBox(height: 2),
          Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: tp,
            ),
          ),
        ],
      );

  Widget _buildQuickInsightCard() => _cardWrap(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEEF2FF),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.access_time_rounded,
                    size: 16,
                    color: Color(0xFF4F46E5),
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  'Insight nhanh',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: tp,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            _insightTile(
              'Sinh viên nổi bật',
              _topStudent?['name'] ?? 'Chưa có dữ liệu',
              '${_topStudent?['commits'] ?? 0} commits • score ${_topStudent?['score'] ?? 0}',
            ),
            const SizedBox(height: 10),
            _insightTile(
              'Nhóm mạnh nhất',
              _strongestGroup?['name'] ?? 'Chưa có dữ liệu',
              '${_strongestGroup?['commits'] ?? 0} commits',
            ),
            const SizedBox(height: 10),
            _insightTile(
              'Tỷ lệ active',
              _totalStudents > 0
                  ? '${((_activeCount / _totalStudents) * 100).round()}%'
                  : '0%',
              '$_activeCount/$_totalStudents sinh viên có hoạt động',
            ),
            const SizedBox(height: 10),
            _insightTile(
              'Đã nhắc sinh viên',
              '0',
              'Gồm email và cảnh báo từ lecturer',
            ),
          ],
        ),
      );

  Widget _insightTile(String label, String title, String sub) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label.toUpperCase(),
              style: const TextStyle(
                fontSize: 9,
                color: ts,
                letterSpacing: .8,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: tp,
              ),
            ),
            const SizedBox(height: 3),
            Text(sub, style: const TextStyle(fontSize: 10, color: ts)),
          ],
        ),
      );

  // ── overview risk and summary ────────────────────
  Widget _buildOverviewRiskAndSummary() => Column(
        children: [
          _buildRiskGroupsCard(),
          const SizedBox(height: 14),
          _buildQuickSummaryCard(),
        ],
      );

  Widget _buildRiskGroupsCard() => _cardWrap(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF1F2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.warning_amber_rounded,
                    size: 16,
                    color: Color(0xFFEF4444),
                  ),
                ),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Nhóm cần chú ý',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: tp,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () => context.go('/lecturer/alerts'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border:
                          Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: const Text(
                      'Xem tất cả cảnh báo',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: tp,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            if (_previewRiskGroups.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 24,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFBBF7D0)),
                ),
                child: const Column(
                  children: [
                    Text(
                      'Không có nhóm rủi ro',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF16A34A),
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Dữ liệu hiện tại cho thấy các nhóm đang duy trì mức đóng góp khá ổn định.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 10, color: Color(0xFF16A34A)),
                    ),
                  ],
                ),
              )
            else
              ..._previewRiskGroups.map((g) {
                final risk = _riskLabel(g);
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFBFB),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFFFECACA)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              g['name'] as String,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: tp,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 9, vertical: 4),
                            decoration: BoxDecoration(
                              color: _riskBg(risk),
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(
                                color: _riskColor(risk).withOpacity(.2),
                              ),
                            ),
                            child: Text(
                              risk,
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                                color: _riskColor(risk),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${g['members']} thành viên • ${g['commits']} commits • balance ${g['balance']}%',
                        style: const TextStyle(fontSize: 10, color: ts),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          if ((g['zero'] as int) > 0)
                            _tag(
                              '${g['zero']} thành viên chưa commit',
                              const Color(0xFFFFF1F2),
                              const Color(0xFFEF4444),
                            ),
                          if ((g['balance'] as int) < 55)
                            _tag(
                              'Mất cân bằng đóng góp',
                              const Color(0xFFFFFBEB),
                              const Color(0xFFD97706),
                            ),
                          if ((g['commits'] as int) < 10)
                            _tag(
                              'Hoạt động tổng thấp',
                              const Color(0xFFF8FAFC),
                              ts,
                            ),
                        ],
                      ),
                    ],
                  ),
                );
              }),
          ],
        ),
      );

  Widget _tag(String label, Color bgc, Color fg) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
        decoration: BoxDecoration(
          color: bgc,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: fg.withOpacity(.18)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: fg,
            fontWeight: FontWeight.w600,
          ),
        ),
      );

  Widget _buildQuickSummaryCard() => _cardWrap(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0FDF4),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.check_circle_outline,
                    size: 16,
                    color: Color(0xFF16A34A),
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  'Tóm tắt nhanh',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: tp,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            _insightTile(
              'Sinh viên đứng đầu',
              _topStudent?['name'] ?? 'Chưa có dữ liệu',
              '',
            ),
            const SizedBox(height: 10),
            _insightTile(
              'Nhóm mạnh nhất',
              _strongestGroup?['name'] ?? 'Chưa có dữ liệu',
              '',
            ),
            const SizedBox(height: 10),
            _insightTile(
              'Chưa commit',
              '$_inactiveCount',
              '',
            ),
            const SizedBox(height: 10),
            _insightTile(
              'Tổng cảnh báo',
              '${_highRiskStudents.length + _riskGroups.length}',
              '',
            ),
          ],
        ),
      );

  // ── alert panel ──────────────────────────────────
  Widget _buildAlertPanel() {
    final noCommit = _allStudents.where((s) => s['commits'] == 0).toList();
    final lowScore = _allStudents
        .where((s) => (s['score'] as int) < 40 && s['commits'] != 0)
        .toList();
    final overdue = _allStudents
        .where((s) => (s['overdue'] as int) >= 2 && (s['score'] as int) >= 40)
        .toList();

    return _cardWrap(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF1F2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.shield_outlined,
                  size: 16,
                  color: Color(0xFFEF4444),
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'Cảnh báo rủi ro',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: tp,
                ),
              ),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF1F2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${noCommit.length + lowScore.length + overdue.length} cảnh báo',
                  style: const TextStyle(
                    fontSize: 10,
                    color: Color(0xFFEF4444),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...noCommit.map(
            (s) => _alertRow(
              'critical',
              '${s['name']} chưa có commit',
              '${s['group']} • ${s['code']} • không có hoạt động code',
            ),
          ),
          ...lowScore.map(
            (s) => _alertRow(
              'warning',
              '${s['name']} có mức đóng góp thấp',
              '${s['group']} • score ${s['score']}/100',
            ),
          ),
          ...overdue.map(
            (s) => _alertRow(
              'info',
              '${s['name']} có task quá hạn',
              '${s['overdue']} task overdue • ${s['group']}',
            ),
          ),
        ],
      ),
    );
  }

  Widget _alertRow(String sev, String title, String desc) {
    final clr = sev == 'critical'
        ? const Color(0xFFEF4444)
        : sev == 'warning'
            ? const Color(0xFFD97706)
            : const Color(0xFF3B82F6);

    final bgc = sev == 'critical'
        ? const Color(0xFFFFF1F2)
        : sev == 'warning'
            ? const Color(0xFFFFFBEB)
            : const Color(0xFFEFF6FF);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: bgc,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: clr.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(
            sev == 'critical'
                ? Icons.error_outline
                : sev == 'warning'
                    ? Icons.warning_amber_rounded
                    : Icons.info_outline,
            size: 14,
            color: clr,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: clr,
                  ),
                ),
                Text(desc, style: const TextStyle(fontSize: 10, color: ts)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── groups tab ───────────────────────────────────
  Widget _buildGroupsTab() => Column(
        children: _groupStats.map((g) {
          final risk = _riskLabel(g);
          final rClr = _riskColor(risk);
          final rBg = _riskBg(risk);
          final pct = g['commits'] > 0 ? (g['balance'] as int) / 100.0 : 0.0;
          final members = _groupMembers(g['name'] as String);
          final memberCommits = _groupMemberCommits(g['name'] as String);
          final topCommit = memberCommits.isEmpty ? 0 : memberCommits.reduce(math.max);

          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _cardWrap(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          g['name'] as String,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: tp,
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: () {},
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border:
                                Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.remove_red_eye_outlined,
                                size: 13,
                                color: ts,
                              ),
                              SizedBox(width: 5),
                              Text(
                                'Xem chi tiết',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: tp,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${g['members']} thành viên • ${g['commits']} commits • ${g['jira']} jira done',
                    style: const TextStyle(fontSize: 11, color: ts),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: rBg,
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: rClr.withOpacity(0.3)),
                        ),
                        child: Text(
                          risk,
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: rClr,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEEF2FF),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: const Color(0xFF6366F1).withOpacity(0.3),
                          ),
                        ),
                        child: Text(
                          'Balance ${g['balance']}%',
                          style: const TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF4F46E5),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: _groupMetricBox(
                          'Tổng score',
                          '${(g['commits'] as int) + (g['jira'] as int)}',
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _groupMetricBox(
                          'Thành viên nổi bật',
                          members.isNotEmpty ? members.first['name'] as String : 'N/A',
                          small: true,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _groupMetricBox(
                          'Chưa commit',
                          '${g['zero']}',
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _groupMetricBox(
                          'TB commit / thành viên',
                          '${(g['members'] as int) == 0 ? 0 : ((g['commits'] as int) / (g['members'] as int)).round()}',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Cân bằng đóng góp',
                    style: TextStyle(fontSize: 10, color: ts),
                  ),
                  const SizedBox(height: 4),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      value: pct,
                      minHeight: 7,
                      backgroundColor: const Color(0xFFF1F5F9),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        (g['balance'] as int) >= 65
                            ? const Color(0xFF16A34A)
                            : (g['balance'] as int) >= 40
                                ? tealL
                                : const Color(0xFFEF4444),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  ...members.map((m) {
                    final percent = topCommit == 0
                        ? 0.0
                        : math.max(0.06, (m['commits'] as int) / topCommit);
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      m['name'] as String,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: tp,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${m['code']} • score ${m['score']}',
                                      style: const TextStyle(
                                        fontSize: 10,
                                        color: ts,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: _statusBg(m['status'] as String),
                                  borderRadius: BorderRadius.circular(999),
                                  border: Border.all(
                                    color: _statusColor(m['status'] as String)
                                        .withOpacity(.2),
                                  ),
                                ),
                                child: Text(
                                  m['status'] as String,
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w700,
                                    color:
                                        _statusColor(m['status'] as String),
                                  ),
                                ),
                              )
                            ],
                          ),
                          const SizedBox(height: 6),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(999),
                            child: LinearProgressIndicator(
                              value: percent,
                              minHeight: 8,
                              backgroundColor: const Color(0xFFF1F5F9),
                              valueColor: const AlwaysStoppedAnimation<Color>(
                                Color(0xFF14B8A6),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          );
        }).toList(),
      );

  Widget _groupMetricBox(String label, String value, {bool small = false}) =>
      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 9, color: ts)),
            const SizedBox(height: 3),
            Text(
              value,
              maxLines: small ? 1 : 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: small ? 11 : 16,
                fontWeight: FontWeight.w800,
                color: tp,
              ),
            ),
          ],
        ),
      );

  // ── students tab ─────────────────────────────────
  Widget _buildStudentsTab() {
    final list = _filtered;

    if (list.isEmpty) {
      return _cardWrap(
        child: const Center(
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 30),
            child: Text(
              'Không có sinh viên phù hợp bộ lọc',
              style: TextStyle(fontSize: 12, color: ts),
            ),
          ),
        ),
      );
    }

    return Column(
      children: [
        ...list.asMap().entries.map((entry) {
          final index = entry.key;
          final s = entry.value;
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: _buildStudentCard(s, index + 1),
          );
        }),
      ],
    );
  }

  Widget _buildStudentCard(Map<String, dynamic> s, int rank) {
    final st = s['status'] as String;
    final warn = _shouldWarn(s);

    return _cardWrap(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [teal, tealL]),
                  borderRadius: BorderRadius.circular(13),
                ),
                child: Center(
                  child: Text(
                    (s['name'] as String).substring(0, 1),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            '#$rank • ${s['name']}',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: tp,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 7, vertical: 3),
                          decoration: BoxDecoration(
                            color: _statusBg(st),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: _statusColor(st).withOpacity(0.3),
                            ),
                          ),
                          child: Text(
                            st,
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: _statusColor(st),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${s['code']} · ${s['group']}',
                      style: const TextStyle(fontSize: 10, color: ts),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${s['activeDays']} ngày hoạt động • hoạt động gần nhất ${s['lastActive']} ngày trước',
                      style: const TextStyle(fontSize: 10, color: ts),
                    ),
                    if (warn) ...[
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFFBEB),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: const Color(0xFFFCD34D),
                          ),
                        ),
                        child: const Text(
                          'Cần theo dõi',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFFD97706),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Score', style: TextStyle(fontSize: 10, color: ts)),
              Text(
                '${s['score']}/100',
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: ts,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (s['score'] as int) / 100.0,
              minHeight: 6,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor: AlwaysStoppedAnimation<Color>(_statusColor(st)),
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 4,
            children: [
              _sChip(Icons.account_tree_outlined, '${s['commits']} commits'),
              _sChip(Icons.task_alt, '${s['jira']} jira'),
              _sChip(Icons.call_merge, '${s['prs']} PRs'),
              _sChip(Icons.rate_review_outlined, '${s['reviews']} reviews'),
              _sChip(Icons.access_time_outlined, '${s['lastActive']}d trước'),
              if ((s['overdue'] as int) > 0)
                _sChip(
                  Icons.warning_amber_rounded,
                  '${s['overdue']} overdue',
                  color: const Color(0xFFF97316),
                ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _miniBtn(
                Icons.remove_red_eye_outlined,
                'Xem',
                card,
                ts,
                () {},
              ),
              const SizedBox(width: 6),
              _miniBtn(
                Icons.warning_amber_rounded,
                'Cảnh báo',
                warn ? const Color(0xFFFFFBEB) : const Color(0xFFF1F5F9),
                warn ? const Color(0xFFD97706) : ts,
                warn ? () => _openModal(s, 'warning') : () {},
              ),
              const SizedBox(width: 6),
              _miniBtn(
                Icons.mail_outline,
                'Mail',
                const Color(0xFFEFF6FF),
                const Color(0xFF2563EB),
                () => _openModal(s, 'email'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _sChip(IconData icon, String label, {Color? color}) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 10, color: color ?? ts),
          const SizedBox(width: 3),
          Text(label, style: TextStyle(fontSize: 9, color: color ?? ts)),
        ],
      );

  Widget _miniBtn(
    IconData icon,
    String label,
    Color bgc,
    Color fg,
    VoidCallback onTap,
  ) =>
      GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: bgc,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: fg.withOpacity(0.2)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 11, color: fg),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  color: fg,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      );

  // ── action modal ─────────────────────────────────
  Widget _buildActionModal() {
    final s = _actionStudent!;
    final isEmail = _actionType == 'email';

    return Container(
      color: Colors.black54,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Container(
            decoration: BoxDecoration(
              color: card,
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 30,
                  offset: const Offset(0, 10),
                )
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.all(18),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isEmail
                                  ? 'Gửi email cảnh báo'
                                  : 'Gửi cảnh báo',
                              style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w700,
                                color: tp,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${s['name']} · ${s['code']} · ${s['group']}',
                              style: const TextStyle(fontSize: 11, color: ts),
                            ),
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () => setState(() => _showModal = false),
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: const BoxDecoration(
                            color: Color(0xFFF1F5F9),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.close_rounded,
                            size: 16,
                            color: ts,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 18),
                  child: Row(
                    children: [
                      _modalStat('Commit', '${s['commits']}'),
                      const SizedBox(width: 8),
                      _modalStat('Jira', '${s['jira']}'),
                      const SizedBox(width: 8),
                      _modalStat('Score', '${s['score']}'),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: bdr),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Email',
                                style: TextStyle(fontSize: 9, color: ts),
                              ),
                              Text(
                                s['email'] as String,
                                style: const TextStyle(fontSize: 9, color: tp),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 18),
                  child: TextField(
                    controller: _modalMsg,
                    minLines: 4,
                    maxLines: 6,
                    style: const TextStyle(fontSize: 12, color: tp),
                    decoration: _inputDeco('Nội dung cảnh báo...'),
                  ),
                ),
                const SizedBox(height: 14),
                Padding(
                  padding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _showModal = false),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 11),
                            decoration: BoxDecoration(
                              color: card,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: bdr),
                            ),
                            alignment: Alignment.center,
                            child: const Text(
                              'Hủy',
                              style: TextStyle(
                                fontSize: 13,
                                color: ts,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            setState(() => _showModal = false);
                            _snack(isEmail
                                ? 'Đã gửi email đến ${s['name']}'
                                : 'Đã gửi cảnh báo đến ${s['name']}');
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 11),
                            decoration: BoxDecoration(
                              color: teal,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            alignment: Alignment.center,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  isEmail
                                      ? Icons.mail_outline
                                      : Icons.send_outlined,
                                  size: 13,
                                  color: Colors.white,
                                ),
                                const SizedBox(width: 5),
                                Text(
                                  isEmail ? 'Gửi email' : 'Gửi cảnh báo',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _modalStat(String label, String val) => Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: bdr),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 9, color: ts)),
            Text(
              val,
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: tp,
              ),
            ),
          ],
        ),
      );

  // ── banner ───────────────────────────────────────
  Widget _buildBanner() => Positioned(
        top: 12,
        right: 16,
        left: 16,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFCCFBF1)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 16,
                offset: const Offset(0, 4),
              )
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDFA),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.check_circle_outline,
                  size: 16,
                  color: teal,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  _banner!,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: tp,
                  ),
                ),
              ),
            ],
          ),
        ),
      );

  // ── shared utils ─────────────────────────────────
  Widget _cardWrap({required Widget child}) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: card,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: bdr),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 3),
            )
          ],
        ),
        child: child,
      );

  InputDecoration _inputDeco(String hint, {IconData? prefix}) =>
      InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
        prefixIcon: prefix != null ? Icon(prefix, size: 16, color: ts) : null,
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: teal, width: 1.5),
        ),
      );
}

// ── Line Chart Painter ────────────────────────────
class _LineChartPainter extends CustomPainter {
  final List<int> gh, jira;
  final double maxVal;

  const _LineChartPainter(this.gh, this.jira, this.maxVal);

  @override
  void paint(Canvas canvas, Size size) {
    void drawLine(List<int> data, Color color) {
      final paint = Paint()
        ..color = color
        ..strokeWidth = 2.5
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;

      final dotPaint = Paint()
        ..color = color
        ..style = PaintingStyle.fill;

      final path = Path();

      for (int i = 0; i < data.length; i++) {
        final x = data.length <= 1 ? size.width / 2 : i / (data.length - 1) * size.width;
        final y = size.height - (data[i] / maxVal) * size.height;
        if (i == 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
        canvas.drawCircle(Offset(x, y), 3, dotPaint);
      }

      canvas.drawPath(path, paint);
    }

    final grid = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..strokeWidth = 0.7;

    for (int i = 1; i <= 4; i++) {
      final y = size.height * i / 5;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), grid);
    }

    drawLine(gh, const Color(0xFF14B8A6));
    drawLine(jira, const Color(0xFF3B82F6));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}