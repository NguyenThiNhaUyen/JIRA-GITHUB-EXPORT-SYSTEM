// Manage Groups Screen — based on manage-groups.jsx
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../services/lecturer_service.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';

class ManageGroupsScreen extends StatefulWidget {
  final String courseId;
  const ManageGroupsScreen({super.key, required this.courseId});

  @override
  State<ManageGroupsScreen> createState() => _ManageGroupsScreenState();
}

class _ManageGroupsScreenState extends State<ManageGroupsScreen> {
  // ── colours ──────────────────────────────────────
  static const Color bg        = Color(0xFFF8FAFB);
  static const Color card      = Colors.white;
  static const Color border    = Color(0xFFF0F0F0);
  static const Color tp        = Color(0xFF1A202C);
  static const Color ts        = Color(0xFF64748B);
  static const Color teal      = Color(0xFF0F766E);
  static const Color tealL     = Color(0xFF14B8A6);
  static const int minM        = 4;
  static const int maxM        = 6;

  final LecturerService _lecturerService = LecturerService();
  final AuthService _authService = AuthService();
  bool _isLoading = true;
  User? _currentUser;
  List<Map<String, dynamic>> _groups = [];
  List<Map<String, dynamic>> _allStudents = [];
  Map<String, dynamic>? _courseInfo;
  List<Map<String, dynamic>> _pendingIntegrations = [];

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
        _lecturerService.getMyCourses(),
        _lecturerService.getCourseGroups(widget.courseId),
        _lecturerService.getCourseStudents(widget.courseId),
        _lecturerService.getPendingIntegrations(widget.courseId),
      ]);

      final allCourses = results[0] as List<Map<String, dynamic>>;
      final course = allCourses.firstWhere(
        (c) => (c['id'] ?? c['Id'] ?? '').toString() == widget.courseId,
        orElse: () => {},
      );

      if (mounted) {
        setState(() {
          _currentUser = user;
          _courseInfo = course.isNotEmpty ? _normalizeCourse(course) : null;
          _groups = (results[1] as List).map((e) => _normalizeGroup(e as Map<String, dynamic>)).toList();
          _allStudents = (results[2] as List).map((e) => _normalizeStudent(e as Map<String, dynamic>)).toList();
          _pendingIntegrations = (results[3] as List).map((e) => _normalizeGroup(e as Map<String, dynamic>)).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _snack('Lỗi khi tải dữ liệu nhóm', err: true);
      }
    }
  }

  Map<String, dynamic> _normalizeCourse(Map<String, dynamic> c) {
    return {
      'id': (c['id'] ?? c['Id'] ?? 0).toString(),
      'name': (c['name'] ?? c['courseName'] ?? c['className'] ?? 'N/A').toString(),
      'code': (c['code'] ?? c['courseCode'] ?? 'N/A').toString(),
    };
  }

  Map<String, dynamic> _normalizeGroup(Map<String, dynamic> g) {
    final integration = g['integration'] ?? {};
    final students = (g['students'] ?? g['members'] ?? []) as List;
    return {
      'id': (g['id'] ?? g['Id'] ?? 0).toString(),
      'name': (g['name'] ?? g['groupName'] ?? 'N/A').toString(),
      'description': (g['topic'] ?? g['projectName'] ?? g['description'] ?? '').toString(),
      'githubStatus': (g['githubStatus'] ?? integration['github_status'] ?? 'NONE').toString().toUpperCase(),
      'jiraStatus': (g['jiraStatus'] ?? integration['jira_status'] ?? 'NONE').toString().toUpperCase(),
      'riskScore': (g['riskScore'] ?? 0) as int,
      'progressPercent': (g['progressPercent'] ?? 0) as int,
      'students': students.map((e) => _normalizeMember(e as Map<String, dynamic>)).toList(),
      'commitCount': (g['commitCount'] ?? g['commitsCount'] ?? 0) as int,
      'issueCount': (g['issueCount'] ?? g['issuesCount'] ?? 0) as int,
      'lastActivity': (g['lastActivity'] ?? g['last_activity'] ?? 'N/A').toString(),
    };
  }

  Map<String, dynamic> _normalizeStudent(Map<String, dynamic> s) {
    return {
      'id': (s['id'] ?? s['Id'] ?? 0).toString(),
      'name': (s['name'] ?? s['fullName'] ?? 'N/A').toString(),
      'code': (s['code'] ?? s['studentCode'] ?? '').toString(),
    };
  }

  Map<String, dynamic> _normalizeMember(Map<String, dynamic> m) {
    return {
      'id': (m['id'] ?? m['Id'] ?? 0).toString(),
      'fullName': (m['fullName'] ?? m['name'] ?? 'N/A').toString(),
      'role': (m['role'] ?? 'MEMBER').toString().toUpperCase(),
    };
  }

  // ── state ─────────────────────────────────────────
  String _groupSearch   = '';
  String _groupFilter   = 'all';
  String _newTopic      = '';
  String _studentSearch = '';
  int    _autoSize      = 5;
  final List<String> _selected = [];

  // ── computed ──────────────────────────────────────
  Set<String> get _assignedIds => _groups
      .expand((g) => (g['students'] as List? ?? []).map((m) => m['id'].toString()))
      .toSet();

  List<Map<String, dynamic>> get _available => _allStudents
      .where((s) => !_assignedIds.contains(s['id']))
      .toList();

  List<Map<String, dynamic>> get _filteredAvailable {
    final kw = _studentSearch.toLowerCase();
    if (kw.isEmpty) return _available;
    return _available.where((s) =>
        s['name'].toString().toLowerCase().contains(kw) ||
        s['code'].toString().toLowerCase().contains(kw)).toList();
  }

  String _state(Map g) {
    final gh = g['githubStatus'] == 'APPROVED';
    final jr = g['jiraStatus']   == 'APPROVED';
    final risk = (g['riskScore'] ?? 0) as int;
    if (!gh && !jr) return 'critical';
    if (risk >= 55) return 'warning';
    if (risk >= 30) return 'watch';
    return 'healthy';
  }

  List<Map<String, dynamic>> get _visibleGroups {
    final kw = _groupSearch.toLowerCase();
    return _groups.where((g) {
      final matchSearch = kw.isEmpty ||
          g['name'].toString().toLowerCase().contains(kw) ||
          g['description'].toString().toLowerCase().contains(kw);
      if (!matchSearch) return false;
      final state = _state(g);
      final ghOk  = g['githubStatus'] == 'APPROVED';
      final jrOk  = g['jiraStatus']   == 'APPROVED';
      final noTopic = (g['description'] as String? ?? '').trim().isEmpty;
      switch (_groupFilter) {
        case 'healthy':       return state == 'healthy';
        case 'watch':         return state == 'watch';
        case 'warning':       return state == 'warning';
        case 'critical':      return state == 'critical';
        case 'missing-github':return !ghOk;
        case 'missing-jira':  return !jrOk;
        case 'missing-topic': return noTopic;
        default:              return true;
      }
    }).toList();
  }

  // ── helpers ───────────────────────────────────────
  void _snack(String msg, {bool err = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: err ? const Color(0xFFEF4444) : teal,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  Color _progressColor(int p) {
    if (p >= 80) return const Color(0xFF22C55E);
    if (p >= 50) return tealL;
    if (p >= 30) return const Color(0xFFF59E0B);
    return const Color(0xFFEF4444);
  }

  // ── build ─────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final available  = _available;
    final allGroups  = _groups;
    final healthy    = allGroups.where((g) => _state(g) == 'healthy').length;
    final risk       = allGroups.where((g) => _state(g) == 'warning' || _state(g) == 'critical').length;
    final noGh       = allGroups.where((g) => g['githubStatus'] != 'APPROVED').length;
    final noJr       = allGroups.where((g) => g['jiraStatus']   != 'APPROVED').length;
    final noTopic    = allGroups.where((g) => (g['description'] as String? ?? "").trim().isEmpty).length;
    final avgP       = allGroups.isEmpty ? 0 :
        (allGroups.fold<int>(0, (s, g) => s + ((g['progressPercent'] ?? 0) as int)) / allGroups.length).round();
    final estGroups  = available.isEmpty ? 0 : (available.length / _autoSize).ceil();

    return Scaffold(
      backgroundColor: bg,
      appBar: AppTopHeader(
        title: 'Quản lý nhóm',
        user: AppUser(
          name: _currentUser?.fullName ?? 'Giảng viên',
          email: _currentUser?.email ?? '',
          role: 'LECTURER',
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: teal))
          : SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildBreadcrumb(),
            const SizedBox(height: 10),
            _buildPageHeader(risk),
            const SizedBox(height: 14),
            _buildGovernanceCard(available.length, allGroups.length, avgP, healthy, risk, noGh, noJr, noTopic),
            const SizedBox(height: 14),
            _buildPendingIntegrationsCard(),
            const SizedBox(height: 14),
            _buildCreateGroupCard(available),
            const SizedBox(height: 14),
            _buildAutoGroupCard(available.length, estGroups),
            const SizedBox(height: 14),
            _buildGroupListCard(noTopic),
          ],
        ),
      ),
    );
  }

  Widget _buildPendingIntegrationsCard() {
    if (_pendingIntegrations.isEmpty) return const SizedBox.shrink();

    return _cardWrap(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(color: const Color(0xFFFFF7ED), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.sync_problem_rounded, size: 16, color: Color(0xFFF97316)),
            ),
            const SizedBox(width: 8),
            const Text('Yêu cầu Tích hợp chờ duyệt', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: tp)),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(color: const Color(0xFFF97316), borderRadius: BorderRadius.circular(20)),
              child: Text('${_pendingIntegrations.length}', style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.w700)),
            ),
          ]),
          const SizedBox(height: 14),
          ..._pendingIntegrations.map((g) => _buildPendingItem(g)),
        ],
      ),
    );
  }

  Widget _buildPendingItem(Map<String, dynamic> g) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFAFAFA),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(child: Text(g['name'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: tp))),
          const Text('Vừa gửi yêu cầu', style: TextStyle(fontSize: 10, color: ts)),
        ]),
        const SizedBox(height: 8),
        _integrationLink(Icons.account_tree_outlined, 'GitHub', g['integration']['github_url'] ?? 'Link GitHub'),
        const SizedBox(height: 4),
        _integrationLink(Icons.book_outlined, 'Jira', g['integration']['jira_url'] ?? 'Link Jira'),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: _actionBtnMini('Từ chối', const Color(0xFFEF4444), () => _showRejectDialog(g))),
          const SizedBox(width: 8),
          Expanded(child: _actionBtnMini('Duyệt ngay', teal, () => _handleApproveIntegration(g))),
        ]),
      ]),
    );
  }

  Widget _integrationLink(IconData icon, String label, String url) => Row(children: [
    Icon(icon, size: 12, color: ts),
    const SizedBox(width: 6),
    Text('$label: ', style: const TextStyle(fontSize: 11, color: ts)),
    Expanded(child: Text(url, style: const TextStyle(fontSize: 11, color: teal, decoration: TextDecoration.underline), overflow: TextOverflow.ellipsis)),
  ]);

  Widget _actionBtnMini(String label, Color color, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      alignment: Alignment.center,
      child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color)),
    ),
  );

  Future<void> _handleApproveIntegration(Map g) async {
    setState(() => _isLoading = true);
    final ok = await _lecturerService.approveIntegration(g['id']);
    if (ok) {
      _snack('Đã duyệt tích hợp cho nhóm ${g['name']}');
      _loadData();
    } else {
      setState(() => _isLoading = false);
      _snack('Lỗi khi duyệt tích hợp', err: true);
    }
  }

  void _showRejectDialog(Map g) {
    String reason = "";
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Từ chối tích hợp', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text('Lý do cung cấp cho nhóm sinh viên:', style: TextStyle(fontSize: 12)),
          const SizedBox(height: 10),
          TextField(
            onChanged: (v) => reason = v,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Link không đúng, repository private...',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy', style: TextStyle(color: ts))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444), foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() => _isLoading = true);
              final ok = await _lecturerService.rejectIntegration(g['id'], reason);
              if (ok) {
                _snack('Đã từ chối tích hợp nhóm ${g['name']}');
                _loadData();
              } else {
                setState(() => _isLoading = false);
                _snack('Lỗi khi từ chối tích hợp', err: true);
              }
            },
            child: const Text('Từ chối'),
          ),
        ],
      ),
    );
  }

  // ── breadcrumb ────────────────────────────────────
  Widget _buildBreadcrumb() => Wrap(
    crossAxisAlignment: WrapCrossAlignment.center,
    spacing: 4,
    children: [
      GestureDetector(
        onTap: () => context.go('/lecturer'),
        child: const Text('Giảng viên',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: teal)),
      ),
      const Icon(Icons.chevron_right, size: 14, color: Color(0xFF94A3B8)),
      const Text('Quản lý nhóm',
          style: TextStyle(fontSize: 12, color: Color(0xFF475569))),
      const Icon(Icons.chevron_right, size: 14, color: Color(0xFF94A3B8)),
      Text(_courseInfo?['code']?.toString() ?? widget.courseId,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: tp)),
    ],
  );

  // ── page header ───────────────────────────────────
  Widget _buildPageHeader(int riskCount) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Nhóm & Dự án',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: tp, letterSpacing: -0.5)),
        const SizedBox(height: 4),
        const Text('Điều hành nhóm đồ án, theo dõi tích hợp Jira/GitHub và kiểm soát rủi ro.',
            style: TextStyle(fontSize: 12, color: ts)),
        const SizedBox(height: 10),
        Wrap(
          spacing: 6, runSpacing: 6,
          children: [
            _chip(Icons.book_outlined,          _courseInfo?['code']?.toString() ?? ''),
            _chip(Icons.school_outlined,        _courseInfo?['name']?.toString() ?? ''),
            _chip(Icons.people_outline,         '${_allStudents.length} sinh viên'),
            _chip(Icons.folder_outlined,        '${_groups.length} nhóm'),
            _chip(Icons.shield_outlined,        '$riskCount nhóm rủi ro'),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            _outBtn(Icons.arrow_back_rounded, 'Quay lại',  () => context.go('/lecturer')),
            const SizedBox(width: 8),
            _outBtn(Icons.bar_chart_rounded,  'Analytics', () => _snack('Analytics')),
            const SizedBox(width: 8),
            _outBtn(Icons.download_rounded,   'Xuất CSV',  () => _snack('Đã xuất CSV')),
          ],
        ),
      ],
    );
  }

  Widget _chip(IconData icon, String label) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: const Color(0xFFE2E8F0)),
      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 4, offset: const Offset(0, 1))],
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 12, color: ts),
        const SizedBox(width: 5),
        Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: ts)),
      ],
    ),
  );

  Widget _outBtn(IconData icon, String label, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: ts),
          const SizedBox(width: 5),
          Text(label, style: const TextStyle(fontSize: 12, color: ts, fontWeight: FontWeight.w500)),
        ],
      ),
    ),
  );

  // ── governance overview ───────────────────────────
  Widget _buildGovernanceCard(int avail, int groupCount, int avgP,
      int healthy, int risk, int noGh, int noJr, int noTopic) {
    final stats = [
      {'label': 'Tổng SV',       'value': '${_allStudents.length}', 'color': const Color(0xFF2563EB), 'bg': const Color(0xFFEFF6FF)},
      {'label': 'Chưa phân',     'value': '$avail',                 'color': const Color(0xFFF97316), 'bg': const Color(0xFFFFF7ED)},
      {'label': 'Nhóm hiện có',  'value': '$groupCount',            'color': teal,                    'bg': const Color(0xFFF0FDFA)},
      {'label': 'Tiến độ TB',    'value': '$avgP%',                 'color': const Color(0xFF4F46E5), 'bg': const Color(0xFFEEF2FF)},
      {'label': 'Nhóm ổn định',  'value': '$healthy',               'color': const Color(0xFF16A34A), 'bg': const Color(0xFFF0FDF4)},
      {'label': 'Nhóm rủi ro',   'value': '$risk',                  'color': const Color(0xFFEF4444), 'bg': const Color(0xFFFFF1F2)},
      {'label': 'Thiếu GitHub',   'value': '$noGh',                  'color': const Color(0xFFD97706), 'bg': const Color(0xFFFFFBEB)},
      {'label': 'Thiếu Jira',    'value': '$noJr',                  'color': const Color(0xFFDB2777), 'bg': const Color(0xFFFDF2F8)},
    ];
    return _cardWrap(child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 4, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 2.2),
          itemCount: stats.length,
          itemBuilder: (_, i) {
            final s = stats[i];
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                  color: s['bg'] as Color,
                  borderRadius: BorderRadius.circular(12)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(s['value'] as String,
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: s['color'] as Color)),
                  Text(s['label'] as String,
                      style: const TextStyle(fontSize: 9, color: ts), overflow: TextOverflow.ellipsis),
                ],
              ),
            );
          },
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFF0FDFA), Color(0xFFECFEFF)],
              begin: Alignment.topLeft, end: Alignment.bottomRight),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFCCFBF1)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Container(
                  width: 28, height: 28,
                  decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.8), borderRadius: BorderRadius.circular(8)),
                  child: const Icon(Icons.auto_awesome, size: 14, color: teal),
                ),
                const SizedBox(width: 8),
                const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Gợi ý quản trị lớp', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: tp)),
                  Text('Theo rule FPTU cho đồ án nhóm', style: TextStyle(fontSize: 10, color: ts)),
                ]),
              ]),
              const SizedBox(height: 10),
              _ruleLine(avail == 0,       avail == 0 ? 'Tất cả sinh viên đã được phân nhóm.' : 'Còn $avail sinh viên chưa có nhóm.'),
              const SizedBox(height: 6),
              _ruleLine(noTopic == 0,    noTopic == 0 ? 'Tất cả nhóm đã có đề tài.' : '$noTopic nhóm chưa có đề tài rõ ràng.'),
              const SizedBox(height: 6),
              _ruleLine(noGh == 0,       noGh == 0 ? 'Tất cả nhóm đã có GitHub.' : '$noGh nhóm chưa hoàn tất GitHub.'),
              const SizedBox(height: 6),
              _ruleLine(noJr == 0,       noJr == 0 ? 'Tất cả nhóm đã có Jira.' : '$noJr nhóm chưa hoàn tất Jira.'),
            ],
          ),
        ),
      ],
    ));
  }

  Widget _ruleLine(bool ok, String text) => Row(
    children: [
      Icon(ok ? Icons.check_circle_outline : Icons.error_outline,
          size: 14, color: ok ? const Color(0xFF16A34A) : const Color(0xFFD97706)),
      const SizedBox(width: 6),
      Expanded(child: Text(text, style: const TextStyle(fontSize: 11, color: tp))),
    ],
  );

  // ── create group card ─────────────────────────────
  Widget _buildCreateGroupCard(List<Map<String, dynamic>> available) {
    final filtered = _filteredAvailable;
    return _cardWrap(child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(color: const Color(0xFFF0FDFA), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.person_add_outlined, size: 16, color: teal),
          ),
          const SizedBox(width: 8),
          const Text('Tạo Nhóm Mới', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: tp)),
        ]),
        const SizedBox(height: 14),
        const Text('ĐỀ TÀI NHÓM', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: ts, letterSpacing: 0.8)),
        const SizedBox(height: 6),
        TextField(
          onChanged: (v) => setState(() => _newTopic = v),
          style: const TextStyle(fontSize: 13, color: tp),
          decoration: _inputDeco('Nhập đề tài cho nhóm...'),
        ),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('SINH VIÊN CHƯA PHÂN NHÓM',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: ts, letterSpacing: 0.8)),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(20)),
              child: Text('${available.length} có sẵn', style: const TextStyle(fontSize: 10, color: ts)),
            ),
          ],
        ),
        const SizedBox(height: 8),
        TextField(
          onChanged: (v) => setState(() => _studentSearch = v),
          style: const TextStyle(fontSize: 13, color: tp),
          decoration: _inputDeco('Tìm sinh viên...', prefix: Icons.search_rounded),
        ),
        const SizedBox(height: 8),
        Container(
          height: 180,
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFFE2E8F0)),
            borderRadius: BorderRadius.circular(12),
          ),
          child: filtered.isEmpty
              ? Center(child: Text(
                  available.isEmpty ? 'Tất cả sinh viên đã được phân nhóm' : 'Không tìm thấy sinh viên phù hợp',
                  style: const TextStyle(fontSize: 12, color: ts), textAlign: TextAlign.center))
              : ListView.separated(
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFF0F0F0)),
                  itemBuilder: (_, i) {
                    final s  = filtered[i];
                    final id = s['id'] as String;
                    final sel = _selected.contains(id);
                    return InkWell(
                      onTap: () => setState(() => sel ? _selected.remove(id) : _selected.add(id)),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        child: Row(
                          children: [
                            Container(
                              width: 18, height: 18,
                              decoration: BoxDecoration(
                                color: sel ? teal : Colors.white,
                                border: Border.all(color: sel ? teal : const Color(0xFFD1D5DB)),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: sel ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text(s['name'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: tp)),
                                Text(s['code'] as String, style: const TextStyle(fontSize: 10, color: ts)),
                              ]),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
        if (_selected.isNotEmpty) ...[
          const SizedBox(height: 6),
          Text('Đã chọn ${_selected.length} sinh viên',
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: teal)),
        ],
        const SizedBox(height: 12),
        GestureDetector(
          onTap: () {
            if (_selected.isEmpty) { _snack('Vui lòng chọn ít nhất 1 sinh viên', err: true); return; }
            if (_newTopic.trim().isEmpty) { _snack('Vui lòng nhập đề tài cho nhóm', err: true); return; }
            _snack('Đã tạo nhóm "${_newTopic.trim()}" thành công');
            setState(() { _selected.clear(); _newTopic = ''; });
          },
          child: Container(
            width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 11),
            decoration: BoxDecoration(color: teal, borderRadius: BorderRadius.circular(12)),
            alignment: Alignment.center,
            child: const Text('+ Tạo nhóm', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white)),
          ),
        ),
      ],
    ));
  }

  // ── auto group card ───────────────────────────────
  Widget _buildAutoGroupCard(int avail, int estGroups) {
    return _cardWrap(child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(color: const Color(0xFFF5F3FF), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.auto_fix_high_outlined, size: 16, color: Color(0xFF7C3AED)),
          ),
          const SizedBox(width: 8),
          const Text('Tự Động Chia Nhóm', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: tp)),
        ]),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFF5F3FF),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFDDD6FE)),
          ),
          child: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Hỗ trợ chia nhanh theo quy mô nhóm', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: tp)),
            SizedBox(height: 4),
            Text('Khuyến nghị nhóm từ $minM–$maxM sinh viên theo format đồ án FPTU.',
                style: TextStyle(fontSize: 11, color: ts)),
          ]),
        ),
        const SizedBox(height: 12),
        const Text('SỐ THÀNH VIÊN / NHÓM',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: ts, letterSpacing: 0.8)),
        const SizedBox(height: 6),
        DropdownButtonFormField<int>(
          value: _autoSize,
          items: [4, 5, 6].map((v) => DropdownMenuItem(value: v, child: Text('$v sinh viên'))).toList(),
          onChanged: (v) => setState(() => _autoSize = v ?? 5),
          decoration: _inputDeco(''),
          style: const TextStyle(fontSize: 13, color: tp),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _infoCard(Icons.people_outline, 'Chưa phân nhóm', '$avail')),
            const SizedBox(width: 10),
            Expanded(child: _infoCard(Icons.folder_open_outlined, 'Ước tính nhóm mới', '$estGroups')),
          ],
        ),
        const SizedBox(height: 12),
        GestureDetector(
          onTap: () {
            if (avail == 0) { _snack('Không còn sinh viên chưa phân nhóm', err: true); return; }
            _snack('Đã tự động tạo $estGroups nhóm mới');
          },
          child: Container(
            width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 11),
            decoration: BoxDecoration(color: const Color(0xFF7C3AED), borderRadius: BorderRadius.circular(12)),
            alignment: Alignment.center,
            child: const Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.auto_fix_high_outlined, size: 15, color: Colors.white),
              SizedBox(width: 6),
              Text('Tự động chia nhóm', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white)),
            ]),
          ),
        ),
      ],
    ));
  }

  Widget _infoCard(IconData icon, String label, String value) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: border)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [Icon(icon, size: 13, color: ts), const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 10, color: ts))]),
      const SizedBox(height: 4),
      Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: tp)),
    ]),
  );

  // ── groups list card ──────────────────────────────
  Widget _buildGroupListCard(int noTopic) {
    final visible = _visibleGroups;
    return _cardWrap(child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.people_outline_rounded, size: 16, color: Color(0xFF2563EB)),
            ),
            const SizedBox(width: 8),
            const Text('Danh sách Nhóm', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: tp)),
            const Spacer(),
            if (noTopic > 0)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(20)),
                child: Text('$noTopic nhóm thiếu đề tài',
                    style: const TextStyle(fontSize: 10, color: Color(0xFFD97706), fontWeight: FontWeight.w600)),
              ),
            const SizedBox(width: 6),
            Text('${visible.length}/${_groups.length} nhóm',
                style: const TextStyle(fontSize: 10, color: ts)),
          ],
        ),
        const SizedBox(height: 12),
        TextField(
          onChanged: (v) => setState(() => _groupSearch = v),
          style: const TextStyle(fontSize: 13, color: tp),
          decoration: _inputDeco('Tìm nhóm hoặc đề tài...', prefix: Icons.search_rounded),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _groupFilter,
          items: const [
            DropdownMenuItem(value: 'all',           child: Text('Tất cả trạng thái')),
            DropdownMenuItem(value: 'healthy',       child: Text('Ổn định')),
            DropdownMenuItem(value: 'watch',         child: Text('Cần theo dõi')),
            DropdownMenuItem(value: 'warning',       child: Text('Rủi ro')),
            DropdownMenuItem(value: 'critical',      child: Text('Nguy cấp')),
            DropdownMenuItem(value: 'missing-github',child: Text('Thiếu GitHub')),
            DropdownMenuItem(value: 'missing-jira',  child: Text('Thiếu Jira')),
            DropdownMenuItem(value: 'missing-topic', child: Text('Thiếu đề tài')),
          ],
          onChanged: (v) => setState(() => _groupFilter = v ?? 'all'),
          decoration: _inputDeco('', prefix: Icons.filter_list_rounded),
          style: const TextStyle(fontSize: 13, color: tp),
        ),
        const SizedBox(height: 4),
        if (visible.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 32),
            child: Center(child: Column(children: [
              Container(
                width: 52, height: 52,
                decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(16)),
                child: const Icon(Icons.assignment_outlined, size: 24, color: ts),
              ),
              const SizedBox(height: 10),
              const Text('Chưa có nhóm phù hợp', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: tp)),
              const SizedBox(height: 4),
              const Text('Bắt đầu bằng cách tạo nhóm thủ công hoặc dùng tính năng tự động chia nhóm.',
                  style: TextStyle(fontSize: 11, color: ts), textAlign: TextAlign.center),
            ])),
          )
        else
          ...visible.map((g) => _buildGroupItem(g)),
      ],
    ));
  }

  Widget _buildGroupItem(Map<String, dynamic> g) {
    final ghOk     = g['githubStatus'] == 'APPROVED';
    final jrOk     = g['jiraStatus']   == 'APPROVED';
    final progress = (g['progressPercent'] ?? 0) as int;
    final state    = _state(g);
    final team     = g['students'] as List? ?? [];
    final noTopic  = (g['description'] as String? ?? '').trim().isEmpty;
    final leader   = (team.firstWhere((m) => m['role'] == 'LEADER', orElse: () => {}))['fullName'] ?? 'Chưa có';

    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFAFAFA),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // name + badges + actions
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(g['name'] as String,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: tp)),
                  const SizedBox(height: 4),
                  Wrap(spacing: 4, runSpacing: 4, children: [
                    _statusBadge('GitHub', ghOk),
                    _statusBadge('Jira',   jrOk),
                    _riskBadge(state),
                    if (noTopic)
                      _tag('Thiếu đề tài', const Color(0xFFFFFBEB), const Color(0xFFD97706)),
                  ]),
                ]),
              ),
              Row(children: [
                _miniBtn(Icons.remove_red_eye_outlined, 'Chi tiết',
                    const Color(0xFFF0FDFA), teal,
                    () => context.go('/lecturer/group/${g['id']}')),
                const SizedBox(width: 6),
                _miniBtn(Icons.delete_outline_rounded, 'Xóa',
                    const Color(0xFFFFF1F2), const Color(0xFFEF4444),
                    () => _snack('Đã xóa nhóm "${g['name']}"', err: true)),
              ]),
            ],
          ),
          const SizedBox(height: 10),
          // metrics chips
          Wrap(spacing: 6, runSpacing: 4, children: [
            _metricChip(Icons.people_outline_rounded,  '${team.length} thành viên'),
            _metricChip(Icons.school_outlined,          'Leader: $leader'),
            _metricChip(Icons.commit,                   '${g['commitCount']} commits'),
            _metricChip(Icons.book_outlined,            '${g['issueCount']} issues'),
            _metricChip(Icons.access_time_outlined,     g['lastActivity']?.toString() ?? 'N/A'),
            _metricChip(Icons.shield_outlined,          'Risk ${g['riskScore'] ?? 0}%'),
          ]),
          const SizedBox(height: 10),
          // topic field
          Row(children: [
            const Icon(Icons.edit_outlined, size: 11, color: ts),
            const SizedBox(width: 4),
            const Text('Đề tài / Mô tả dự án', style: TextStyle(fontSize: 10, color: ts)),
          ]),
          const SizedBox(height: 5),
          TextField(
            controller: TextEditingController(text: g['description'] as String? ?? ''),
            style: const TextStyle(fontSize: 12, color: tp),
            onSubmitted: (v) => _snack('Đã cập nhật đề tài'),
            decoration: _inputDeco('Chưa có đề tài...'),
          ),
          const SizedBox(height: 10),
          // progress
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Text('Tiến độ dự án', style: TextStyle(fontSize: 10, color: ts)),
            Text('$progress%', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: ts)),
          ]),
          const SizedBox(height: 5),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress / 100, minHeight: 7,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor: AlwaysStoppedAnimation<Color>(_progressColor(progress)),
            ),
          ),
          const SizedBox(height: 10),
          // members
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('Thành viên (${team.length})',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: ts)),
            GestureDetector(
              onTap: () => _showForceAddSheet(g['id'] as String, g['name'] as String),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDFA),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFCCFBF1)),
                ),
                child: const Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.person_add_outlined, size: 11, color: teal),
                  SizedBox(width: 4),
                  Text('Thêm SV', style: TextStyle(fontSize: 10, color: teal, fontWeight: FontWeight.w600)),
                ]),
              ),
            ),
          ]),
          const SizedBox(height: 8),
          team.isEmpty
              ? const Text('Chưa có thành viên', style: TextStyle(fontSize: 11, color: ts))
              : Wrap(
                  spacing: 6, runSpacing: 6,
                  children: (team as List<Map<String, dynamic>>).map((m) =>
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.white, borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 4, offset: const Offset(0,1))],
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Container(
                          width: 16, height: 16,
                          decoration: BoxDecoration(color: const Color(0xFFCCFBF1), shape: BoxShape.circle),
                          child: Center(child: Text(
                            (m['fullName'] as String? ?? '?').substring(0, 1),
                            style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w700, color: teal))),
                        ),
                        const SizedBox(width: 5),
                        Text(m['fullName'] as String? ?? 'Chưa có tên', style: const TextStyle(fontSize: 11, color: tp, fontWeight: FontWeight.w500)),
                        if (m['role'] == 'LEADER') ...[
                          const SizedBox(width: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFFBEB),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: const Color(0xFFFDE68A)),
                            ),
                            child: const Text('Leader', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w700, color: Color(0xFFD97706))),
                          ),
                        ],
                        const SizedBox(width: 4),
                        GestureDetector(
                          onTap: () => _snack('Đã xóa ${m['fullName']} khỏi nhóm'),
                          child: const Text('×', style: TextStyle(fontSize: 14, color: Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
                        ),
                      ]),
                    ),
                  ).toList(),
                ),
          // warning boxes
          if (state == 'warning' || state == 'critical') ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFFECACA)),
              ),
              child: Row(children: [
                const Icon(Icons.warning_amber_rounded, size: 13, color: Color(0xFFEF4444)),
                const SizedBox(width: 6),
                Expanded(child: Text(
                  state == 'critical'
                      ? 'Nhóm đang thiếu tích hợp quan trọng và có rủi ro cao.'
                      : 'Nhóm cần được theo dõi thêm về tiến độ hoặc mức độ hoạt động.',
                  style: const TextStyle(fontSize: 11, color: Color(0xFFEF4444)))),
              ]),
            ),
          ],
          if (noTopic) ...[
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFFFFBEB),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFFDE68A)),
              ),
              child: const Row(children: [
                Icon(Icons.error_outline, size: 13, color: Color(0xFFD97706)),
                SizedBox(width: 6),
                Expanded(child: Text('Nhóm chưa có đề tài cụ thể. Nên cập nhật để thuận tiện review.',
                    style: TextStyle(fontSize: 11, color: Color(0xFFD97706)))),
              ]),
            ),
          ],
        ],
      ),
    );
  }

  // ── force add bottom sheet ────────────────────────
  void _showForceAddSheet(String groupId, String groupName) {
    final selected = <String>[];
    String search  = '';
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(builder: (ctx, setS) {
        final kw = search.toLowerCase();
        final list = _available.where((s) =>
            kw.isEmpty ||
            s['name'].toString().toLowerCase().contains(kw) ||
            s['code'].toString().toLowerCase().contains(kw)).toList();
        return Container(
          height: MediaQuery.of(ctx).size.height * 0.75,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Thêm Thành Viên',
                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: tp)),
                  Text('Thêm sinh viên vào $groupName',
                      style: const TextStyle(fontSize: 11, color: ts)),
                ]),
                GestureDetector(
                  onTap: () => Navigator.pop(ctx),
                  child: Container(
                    width: 32, height: 32,
                    decoration: BoxDecoration(color: const Color(0xFFF1F5F9), shape: BoxShape.circle),
                    child: const Icon(Icons.close_rounded, size: 18, color: ts),
                  ),
                ),
              ]),
              const SizedBox(height: 14),
              TextField(
                onChanged: (v) => setS(() => search = v),
                style: const TextStyle(fontSize: 13, color: tp),
                decoration: _inputDeco('Tìm sinh viên...', prefix: Icons.search_rounded),
              ),
              const SizedBox(height: 10),
              Expanded(
                child: list.isEmpty
                    ? Center(child: Text(
                        _available.isEmpty ? 'Tất cả sinh viên đã có nhóm.' : 'Không tìm thấy sinh viên phù hợp.',
                        style: const TextStyle(fontSize: 12, color: ts), textAlign: TextAlign.center))
                    : ListView.separated(
                        itemCount: list.length,
                        separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFF0F0F0)),
                        itemBuilder: (_, i) {
                          final s  = list[i];
                          final id = s['id'] as String;
                          final sel = selected.contains(id);
                          return InkWell(
                            onTap: () => setS(() => sel ? selected.remove(id) : selected.add(id)),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 10),
                              child: Row(children: [
                                Container(
                                  width: 18, height: 18,
                                  decoration: BoxDecoration(
                                    color: sel ? teal : Colors.white,
                                    border: Border.all(color: sel ? teal : const Color(0xFFD1D5DB)),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: sel ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
                                ),
                                const SizedBox(width: 10),
                                Container(
                                  width: 32, height: 32,
                                  decoration: BoxDecoration(color: const Color(0xFFCCFBF1), shape: BoxShape.circle),
                                  child: Center(child: Text(
                                    (s['name'] as String).substring(0, 1),
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: teal))),
                                ),
                                const SizedBox(width: 10),
                                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Text(s['name'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: tp)),
                                  Text(s['code'] as String, style: const TextStyle(fontSize: 10, color: ts)),
                                ])),
                              ]),
                            ),
                          );
                        },
                      ),
              ),
              const SizedBox(height: 10),
              GestureDetector(
                onTap: () {
                  if (selected.isEmpty) { _snack('Vui lòng chọn ít nhất 1 sinh viên', err: true); return; }
                  Navigator.pop(ctx);
                  _snack('Đã thêm ${selected.length} sinh viên vào $groupName');
                },
                child: Container(
                  width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(color: teal, borderRadius: BorderRadius.circular(12)),
                  alignment: Alignment.center,
                  child: Text(
                    selected.isEmpty ? 'Xác nhận thêm' : 'Xác nhận thêm (${selected.length})',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white)),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }

  // ── small widgets ─────────────────────────────────
  Widget _statusBadge(String label, bool ok) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
    decoration: BoxDecoration(
      color: ok ? const Color(0xFFF0FDF4) : const Color(0xFFF1F5F9),
      borderRadius: BorderRadius.circular(6),
    ),
    child: Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(ok ? Icons.check_circle_outline : Icons.account_tree_outlined,
          size: 9, color: ok ? const Color(0xFF16A34A) : ts),
      const SizedBox(width: 3),
      Text(label + (ok ? ' ✓' : ''),
          style: TextStyle(
              fontSize: 9, fontWeight: FontWeight.w700,
              color: ok ? const Color(0xFF16A34A) : ts, letterSpacing: 0.4)),
    ]),
  );

  Widget _riskBadge(String state) {
    final map = {
      'healthy':  [const Color(0xFFF0FDF4), const Color(0xFF16A34A), 'Ổn định'],
      'watch':    [const Color(0xFFFEFCE8), const Color(0xFFCA8A04), 'Theo dõi'],
      'warning':  [const Color(0xFFFFF7ED), const Color(0xFFF97316), 'Rủi ro'],
      'critical': [const Color(0xFFFFF1F2), const Color(0xFFEF4444), 'Nguy cấp'],
    };
    final v = map[state] ?? [const Color(0xFFF1F5F9), ts, 'Không xác định'];
    return _tag(v[2] as String, v[0] as Color, v[1] as Color);
  }

  Widget _tag(String label, Color bg, Color fg) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
    decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
    child: Text(label,
        style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: fg, letterSpacing: 0.4)),
  );

  Widget _metricChip(IconData icon, String label) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
    decoration: BoxDecoration(
      color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(20),
      border: Border.all(color: border),
    ),
    child: Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(icon, size: 10, color: ts),
      const SizedBox(width: 4),
      Text(label, style: const TextStyle(fontSize: 10, color: ts)),
    ]),
  );

  Widget _miniBtn(IconData icon, String label, Color bg, Color fg, VoidCallback onTap) =>
      GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
          decoration: BoxDecoration(
            color: bg, borderRadius: BorderRadius.circular(8),
            border: Border.all(color: fg.withOpacity(0.2)),
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(icon, size: 11, color: fg),
            const SizedBox(width: 3),
            Text(label, style: TextStyle(fontSize: 10, color: fg, fontWeight: FontWeight.w600)),
          ]),
        ),
      );

  Widget _cardWrap({required Widget child}) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: card,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: border),
      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 3))],
    ),
    child: child,
  );

  InputDecoration _inputDeco(String hint, {IconData? prefix}) => InputDecoration(
    hintText: hint,
    hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
    prefixIcon: prefix != null ? Icon(prefix, size: 16, color: ts) : null,
    filled: true, fillColor: const Color(0xFFF8FAFC),
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: teal, width: 1.5)),
  );
}
