import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/lecturer_navigation.dart';
import '../../models/user.dart';
import '../../services/lecturer_service.dart';
import '../../services/admin_service.dart';
import '../../services/auth_service.dart';
import 'lecturer_groups_widgets.dart';

const int kMinMembers = 4;
const int kMaxMembers = 6;

class LecturerGroupsScreen extends StatefulWidget {
  final String? courseId;

  const LecturerGroupsScreen({
    super.key,
    this.courseId,
  });

  @override
  State<LecturerGroupsScreen> createState() => _LecturerGroupsScreenState();
}
class _LecturerGroupsScreenState extends State<LecturerGroupsScreen> {
  // State mirroring JSX useState
  List<int> _selectedStudents = [];
  String _newGroupTopic = '';
  String _studentSearch = '';
  String _groupSearch = '';
  String _groupFilter = 'all';
  bool _showForceAddModal = false;
  int? _forceAddGroupId;
  List<int> _forceAddSelectedIds = [];
  String _forceAddSearch = '';
  int _autoGroupSize = 5;

  // Data placeholders
  Map<String, dynamic> _course = {'id': 1, 'code': '...', 'name': '...'};
  List<Map<String, dynamic>> _students = [];
  List<Map<String, dynamic>> _groups = [];

  final AuthService _authService = AuthService();
  final LecturerService _lecturerService = LecturerService();
  final AdminService _adminService = AdminService();
  User? _currentUser;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUser();
    _loadData();
  }

  Future<void> _loadUser() async {
    try {
      final user = await _authService.getCurrentUser();
      if (mounted) {
        setState(() {
          _currentUser = user;
        });
      }
    } catch (e) {
      if (mounted) print("Error loading user: $e");
    }
  }

  Future<void> _loadData() async {
    if (widget.courseId == null) {
      setState(() => _isLoading = false);
      return;
    }
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        _lecturerService.getCourseGroups(widget.courseId),
        _lecturerService.getCourseStudents(widget.courseId),
        _adminService.getCourses(),
      ]);

      final courseInfo = (results[2] as List).firstWhere(
        (c) => c['id'].toString() == widget.courseId.toString(),
        orElse: () => null,
      );

      if (mounted) {
        setState(() {
          _groups = List<Map<String, dynamic>>.from(results[0]);
          _students = List<Map<String, dynamic>>.from(results[1]);
          if (courseInfo != null) {
            _course = courseInfo;
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _snack('Lỗi khi tải dữ liệu lớp học');
      }
    }
  }

  Map<String, dynamic> _normalizeStudent(Map<String, dynamic> s) {
    return {
      'id': (s['id'] ?? s['Id'] ?? s['userId'] ?? 0) as int,
      'name': (s['name'] ?? s['fullName'] ?? s['FullName'] ?? 'N/A').toString(),
      'studentCode': (s['studentCode'] ?? s['studentId'] ?? s['StudentCode'] ?? '').toString(),
    };
  }

  Map<String, dynamic> _normalizeGroup(Map<String, dynamic> g) {
    final integration = g['integration'] ?? g['Integration'] ?? {};
    return {
      'id': (g['id'] ?? g['Id'] ?? 0) as int,
      'name': (g['name'] ?? g['groupName'] ?? g['GroupName'] ?? 'N/A').toString(),
      'description': (g['description'] ?? g['topic'] ?? g['projectName'] ?? g['ProjectName'] ?? '').toString(),
      'team': g['team'] ?? g['members'] ?? g['Members'] ?? g['students'] ?? g['Students'] ?? [],
      'integration': {
        'githubStatus': (integration['githubStatus'] ?? integration['github_status'] ?? g['githubStatus'] ?? 'NOT_CONNECTED').toString().toUpperCase(),
        'jiraStatus': (integration['jiraStatus'] ?? integration['jira_status'] ?? g['jiraStatus'] ?? 'NOT_CONNECTED').toString().toUpperCase(),
      },
    };
  }

  Map<String, dynamic> _normalizeCourse(Map<String, dynamic> c) {
    return {
      'id': (c['id'] ?? c['Id'] ?? 0).toString(),
      'name': (c['name'] ?? c['courseName'] ?? c['CourseName'] ?? c['ClassName'] ?? 'N/A').toString(),
      'code': (c['code'] ?? c['courseCode'] ?? c['CourseCode'] ?? 'N/A').toString(),
    };
  }

  // Computed: assignedStudentIds
  Set<int> get _assignedIds => _groups
      .map(_normalizeGroup)
      .expand((g) => (g['team'] as List).map((m) => (m['studentId'] ?? m['userId'] ?? 0) as int))
      .toSet();

  // Computed: availableStudents
  List<Map<String, dynamic>> get _available =>
      _students.map(_normalizeStudent).where((s) => !_assignedIds.contains(s['id'] as int)).toList();

  // Computed: filteredAvailableStudents
  List<Map<String, dynamic>> get _filteredAvailable {
    final kw = _studentSearch.trim().toLowerCase();
    if (kw.isEmpty) return _available;
    return _available.where((s) {
      final name = s['name'].toString().toLowerCase();
      final code = s['studentCode'].toString().toLowerCase();
      return name.contains(kw) || code.contains(kw);
    }).toList();
  }

  // Computed: filteredForceAddStudents
  List<Map<String, dynamic>> get _filteredForceAdd {
    final kw = _forceAddSearch.trim().toLowerCase();
    if (kw.isEmpty) return _available;
    return _available.where((s) {
      final name = s['name'].toString().toLowerCase();
      final code = s['studentCode'].toString().toLowerCase();
      return name.contains(kw) || code.contains(kw);
    }).toList();
  }

  // Computed: groupsWithMetrics (mirrors JSX useMemo)
  List<Map<String, dynamic>> get _groupsWithMetrics => _groups.asMap().entries.map((e) {
    final i = e.key; final g = _normalizeGroup(e.value);
    final integration = (g['integration'] as Map<String, dynamic>) ;
    final team = (g['team'] as List);
    final memberCount = team.length;
    final githubApproved = integration['githubStatus'] == 'APPROVED';
    final jiraApproved = integration['jiraStatus'] == 'APPROVED';
    final commitCount = memberCount * 6 + (i + 1) * 3;
    final issueCount = memberCount * 2 + i;
    final lastActivity = i == 0 ? '2 giờ trước' : i == 1 ? '1 ngày trước' : '3 ngày trước';
    var progress = 0;
    if (githubApproved) progress += 35;
    if (jiraApproved) progress += 25;
    progress += (memberCount * 8).clamp(0, 40);
    progress = progress.clamp(0, 100);
    var riskScore = 100 - progress;
    if (!githubApproved) riskScore += 15;
    if (!jiraApproved) riskScore += 10;
    riskScore = riskScore.clamp(0, 100);
    final leader = team.where((m) => m['role'] == 'LEADER').map((m) => (m['studentName'] ?? m['fullName'] ?? 'N/A').toString()).firstOrNull;
    String state = 'healthy';
    if (!githubApproved && !jiraApproved) state = 'critical';
    else if (riskScore >= 55) state = 'warning';
    else if (riskScore >= 30) state = 'watch';
    final missingTopic = (g['description'] as String).trim().isEmpty;
    return {...g, 'integration': integration, 'memberCount': memberCount, 'githubApproved': githubApproved,
      'jiraApproved': jiraApproved, 'commitCount': commitCount, 'issueCount': issueCount,
      'lastActivity': lastActivity, 'progress': progress, 'riskScore': riskScore,
      'state': state, 'leader': leader, 'missingTopic': missingTopic};
  }).toList();

  // Computed: visibleGroups
  List<Map<String, dynamic>> get _visibleGroups {
    final kw = _groupSearch.trim().toLowerCase();
    return _groupsWithMetrics.where((g) {
      final name = (g['name'] as String).toLowerCase();
      final desc = (g['description'] as String? ?? '').toLowerCase();
      final matchSearch = kw.isEmpty || name.contains(kw) || desc.contains(kw);
      final state = g['state'] as String;
      final matchFilter = _groupFilter == 'all' ||
        (_groupFilter == 'healthy' && state == 'healthy') ||
        (_groupFilter == 'watch' && state == 'watch') ||
        (_groupFilter == 'warning' && state == 'warning') ||
        (_groupFilter == 'critical' && state == 'critical') ||
        (_groupFilter == 'missing-github' && !(g['githubApproved'] as bool)) ||
        (_groupFilter == 'missing-jira' && !(g['jiraApproved'] as bool)) ||
        (_groupFilter == 'missing-topic' && (g['missingTopic'] as bool));
      return matchSearch && matchFilter;
    }).toList();
  }

  // Stats
  int get _healthyCount => _groupsWithMetrics.where((g) => g['state'] == 'healthy').length;
  int get _riskCount => _groupsWithMetrics.where((g) => g['state'] == 'warning' || g['state'] == 'critical').length;
  int get _missingGithubCount => _groupsWithMetrics.where((g) => !(g['githubApproved'] as bool)).length;
  int get _missingJiraCount => _groupsWithMetrics.where((g) => !(g['jiraApproved'] as bool)).length;
  int get _missingTopicCount => _groupsWithMetrics.where((g) => g['missingTopic'] as bool).length;
  int get _avgProgress => _groupsWithMetrics.isEmpty ? 0 :
    (_groupsWithMetrics.fold(0, (s, g) => s + (g['progress'] as int)) / _groupsWithMetrics.length).round();
  int get _estimatedGroupCount => _available.isEmpty ? 0 : (_available.length / _autoGroupSize).ceil();

  // Handlers
  void _handleCreateGroup() {
    if (_selectedStudents.isEmpty) { _snack('Vui lòng chọn ít nhất 1 sinh viên'); return; }
    if (_newGroupTopic.trim().isEmpty) { _snack('Vui lòng nhập đề tài cho nhóm'); return; }
    setState(() {
      final newId = (_groups.isEmpty ? 0 : _groups.map((g) => g['id'] as int).reduce((a, b) => a > b ? a : b)) + 1;
      final newTeam = _selectedStudents.asMap().entries.map((e) {
        final s = _students.firstWhere((st) => st['id'] == e.value);
        return {'studentId': e.value, 'studentName': s['name'], 'role': e.key == 0 ? 'LEADER' : 'MEMBER'};
      }).toList();
      _groups.add({'id': newId, 'name': 'Nhóm ${_groups.length + 1}', 'description': _newGroupTopic.trim(),
        'team': newTeam, 'integration': {'githubStatus': 'MISSING', 'jiraStatus': 'MISSING'}});
      _selectedStudents = []; _newGroupTopic = ''; _studentSearch = '';
    });
    _snack('Đã tạo nhóm thành công');
  }

  void _handleAutoCreateGroups() {
    if (_available.isEmpty) { _snack('Không còn sinh viên chưa phân nhóm'); return; }
    setState(() {
      final shuffled = [..._available]..shuffle();
      int base = _groups.length;
      for (int i = 0; i < shuffled.length; i += _autoGroupSize) {
        final chunk = shuffled.skip(i).take(_autoGroupSize).toList();
        final newId = (_groups.isEmpty ? 0 : _groups.map((g) => g['id'] as int).reduce((a, b) => a > b ? a : b)) + 1;
        _groups.add({'id': newId, 'name': 'Nhóm ${base + (i ~/ _autoGroupSize) + 1}',
          'description': 'Đề tài nhóm ${base + (i ~/ _autoGroupSize) + 1}',
          'team': chunk.asMap().entries.map((e) => {'studentId': e.value['id'], 'studentName': e.value['name'], 'role': e.key == 0 ? 'LEADER' : 'MEMBER'}).toList(),
          'integration': {'githubStatus': 'MISSING', 'jiraStatus': 'MISSING'}});
      }
    });
    _snack('Đã tự động chia nhóm');
  }

  void _handleDeleteGroup(int groupId) {
    setState(() => _groups.removeWhere((g) => g['id'] == groupId));
    _snack('Đã xóa nhóm');
  }

  void _handleUpdateTopic(int groupId, String newTopic) {
    setState(() {
      final idx = _groups.indexWhere((g) => g['id'] == groupId);
      if (idx >= 0) _groups[idx] = {..._groups[idx], 'description': newTopic.trim()};
    });
    _snack('Đã cập nhật đề tài');
  }

  void _handleRemoveMember(int groupId, int studentId) {
    setState(() {
      final idx = _groups.indexWhere((g) => g['id'] == groupId);
      if (idx >= 0) {
        final team = List<Map<String,dynamic>>.from(_groups[idx]['team'] as List)
          ..removeWhere((m) => m['studentId'] == studentId);
        _groups[idx] = {..._groups[idx], 'team': team};
      }
    });
    _snack('Đã xóa sinh viên khỏi nhóm');
  }

  void _handleForceAddSubmit() {
    if (_forceAddSelectedIds.isEmpty) { _snack('Vui lòng chọn ít nhất 1 sinh viên'); return; }
    setState(() {
      final idx = _groups.indexWhere((g) => g['id'] == _forceAddGroupId);
      if (idx >= 0) {
        final team = List<Map<String,dynamic>>.from(_groups[idx]['team'] as List);
        for (final sid in _forceAddSelectedIds) {
          final s = _students.firstWhere((st) => st['id'] == sid);
          team.add({'studentId': sid, 'studentName': s['name'], 'role': 'MEMBER'});
        }
        _groups[idx] = {..._groups[idx], 'team': team};
      }
      _showForceAddModal = false; _forceAddSelectedIds = []; _forceAddSearch = '';
    });
    _snack('Đã thêm sinh viên vào nhóm');
  }

  void _snack(String msg) => ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(msg), backgroundColor: kTeal, behavior: SnackBarBehavior.floating));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      drawer: const LecturerDrawer(),
      appBar: AppTopHeader(
        title: 'Nhóm & Dự án',
        user: AppUser(
          name: _currentUser?.fullName ?? 'Giảng viên',
          email: _currentUser?.email ?? '',
          role: 'LECTURER'
        )
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: kTeal))
        : Stack(children: [
        SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _buildHeader(context),
            const SizedBox(height: 16),
            _buildGovernanceOverview(),
            const SizedBox(height: 16),
            _buildCreateGroupPanel(),
            const SizedBox(height: 16),
            _buildAutoGroupPanel(),
            const SizedBox(height: 16),
            _buildGroupList(),
          ]),
        ),
        if (_showForceAddModal) _buildForceAddModal(),
      ]),
    );
  }

  // ── Header ───────────────────────────────────────────────
  Widget _buildHeader(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Breadcrumb
      Row(children: [
        GestureDetector(onTap: () => context.go('/lecturer'),
          child: const Text('Giảng viên', style: TextStyle(fontSize: 11, color: kTeal, fontWeight: FontWeight.w600))),
        const Icon(Icons.chevron_right_rounded, size: 14, color: kTextSecondary),
        const Text('Quản lý nhóm', style: TextStyle(fontSize: 11, color: kTextSecondary)),
        const Icon(Icons.chevron_right_rounded, size: 14, color: kTextSecondary),
        Text(_course['code'] as String, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: kTextPrimary)),
      ]),
      const SizedBox(height: 8),
      const Text('Nhóm & Dự án', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: kTextPrimary)),
      const SizedBox(height: 2),
      const Text('Điều hành nhóm đồ án, theo dõi tích hợp Jira/GitHub và kiểm soát rủi ro theo từng lớp học.',
        style: TextStyle(fontSize: 12, color: kTextSecondary)),
      const SizedBox(height: 10),
      Wrap(spacing: 6, runSpacing: 6, children: [
        HeaderInfoChip(icon: Icons.book_outlined, label: _course['code'] as String),
        HeaderInfoChip(icon: Icons.school_outlined, label: _course['name'] as String),
        HeaderInfoChip(icon: Icons.layers_outlined, label: '${_students.length} sinh viên'),
        HeaderInfoChip(icon: Icons.folder_outlined, label: '${_groups.length} nhóm'),
        HeaderInfoChip(icon: Icons.shield_outlined, label: '$_riskCount nhóm rủi ro'),
      ]),
      const SizedBox(height: 10),
      Row(children: [
        _buildOutlineBtn(Icons.arrow_back_rounded, 'Quay lại', () => context.go('/lecturer')),
        const SizedBox(width: 8),
        _buildOutlineBtn(Icons.analytics_outlined, 'Analytics', () => context.go('/lecturer/course/${widget.courseId}/analytics')),
        const SizedBox(width: 8),
        _buildOutlineBtn(Icons.download_rounded, 'Xuất CSV', () => _snack('Đã xuất danh sách nhóm')),
      ]),
    ]);
  }

  Widget _buildOutlineBtn(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(border: Border.all(color: kCardBorder), borderRadius: BorderRadius.circular(12)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 13, color: kTextSecondary), const SizedBox(width: 5),
          Text(label, style: const TextStyle(fontSize: 12, color: kTextSecondary)),
        ]),
      ),
    );
  }

  // ── Governance Overview ──────────────────────────────────
  Widget _buildGovernanceOverview() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: kCardBorder),
        borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        GridView.count(crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 2.8, children: [
          MiniStat(label: 'Tổng sinh viên', value: '${_students.length}', bgColor: const Color(0xFFEFF6FF), textColor: const Color(0xFF2563EB)),
          MiniStat(label: 'Chưa phân nhóm', value: '${_available.length}', bgColor: const Color(0xFFFFF7ED), textColor: const Color(0xFFEA580C)),
          MiniStat(label: 'Nhóm hiện có', value: '${_groups.length}', bgColor: const Color(0xFFF0FDFA), textColor: kTeal),
          MiniStat(label: 'Tiến độ TB', value: '$_avgProgress%', bgColor: const Color(0xFFEEF2FF), textColor: const Color(0xFF6366F1)),
          MiniStat(label: 'Nhóm ổn định', value: '$_healthyCount', bgColor: const Color(0xFFF0FDF4), textColor: const Color(0xFF16A34A)),
          MiniStat(label: 'Nhóm rủi ro', value: '$_riskCount', bgColor: const Color(0xFFFEF2F2), textColor: const Color(0xFFDC2626)),
          MiniStat(label: 'Thiếu GitHub', value: '$_missingGithubCount', bgColor: const Color(0xFFFFFBEB), textColor: const Color(0xFFD97706)),
          MiniStat(label: 'Thiếu Jira', value: '$_missingJiraCount', bgColor: const Color(0xFFFDF2F8), textColor: const Color(0xFFDB2777)),
        ]),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFFF0FDFA), Color(0xFFECFEFF)]),
            border: Border.all(color: const Color(0xFF99F6E4)),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: Colors.white.withOpacity(0.8), borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.auto_awesome_rounded, size: 14, color: kTeal)),
              const SizedBox(width: 8),
              const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Gợi ý quản trị lớp', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: kTextPrimary)),
                Text('Theo rule FPTU cho đồ án nhóm', style: TextStyle(fontSize: 10, color: kTextSecondary)),
              ]),
            ]),
            const SizedBox(height: 10),
            Column(children: [
              RuleLine(ok: _available.isEmpty, text: _available.isEmpty ? 'Tất cả sinh viên đã được phân nhóm.' : 'Còn ${_available.length} sinh viên chưa có nhóm.'),
              const SizedBox(height: 6),
              RuleLine(ok: _missingTopicCount == 0, text: _missingTopicCount == 0 ? 'Tất cả nhóm đã có đề tài.' : '$_missingTopicCount nhóm chưa có đề tài rõ ràng.'),
              const SizedBox(height: 6),
              RuleLine(ok: _missingGithubCount == 0, text: _missingGithubCount == 0 ? 'Tất cả nhóm đã có GitHub.' : '$_missingGithubCount nhóm chưa hoàn tất GitHub.'),
              const SizedBox(height: 6),
              RuleLine(ok: _missingJiraCount == 0, text: _missingJiraCount == 0 ? 'Tất cả nhóm đã có Jira.' : '$_missingJiraCount nhóm chưa hoàn tất Jira.'),
            ]),
          ]),
        ),
      ]),
    );
  }

  // ── Create Group Panel ───────────────────────────────────
  Widget _buildCreateGroupPanel() {
    return Container(
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: kCardBorder),
        borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
          child: Row(children: [
            Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: const Color(0xFFF0FDFA), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.person_add_alt_1_rounded, size: 15, color: kTeal)),
            const SizedBox(width: 8),
            const Text('Tạo Nhóm Mới', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: kTextPrimary)),
          ])),
        const Divider(height: 1, color: Color(0xFFF9FAFB)),
        Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('ĐỀ TÀI NHÓM', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: kTextSecondary, letterSpacing: 1)),
          const SizedBox(height: 6),
          TextField(
            onChanged: (v) => setState(() => _newGroupTopic = v),
            style: const TextStyle(fontSize: 13),
            decoration: InputDecoration(hintText: 'Nhập đề tài cho nhóm...', hintStyle: const TextStyle(color: kTextSecondary, fontSize: 13),
              filled: true, fillColor: kBg, contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kCardBorder)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kCardBorder)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kTeal, width: 1.5))),
          ),
          const SizedBox(height: 14),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Text('SINH VIÊN CHƯA PHÂN NHÓM', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: kTextSecondary, letterSpacing: 1)),
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: const Color(0xFFF3F4F6), borderRadius: BorderRadius.circular(20)),
              child: Text('${_available.length} có sẵn', style: const TextStyle(fontSize: 10, color: kTextSecondary))),
          ]),
          const SizedBox(height: 8),
          GroupsSearchBar(hint: 'Tìm sinh viên...', onChanged: (v) => setState(() => _studentSearch = v)),
          const SizedBox(height: 8),
          Container(
            constraints: const BoxConstraints(maxHeight: 200),
            decoration: BoxDecoration(border: Border.all(color: kCardBorder), borderRadius: BorderRadius.circular(12)),
            child: _filteredAvailable.isEmpty
                ? Padding(padding: const EdgeInsets.all(20),
                    child: Center(child: Text(_available.isEmpty ? 'Tất cả sinh viên đã được phân nhóm' : 'Không tìm thấy sinh viên phù hợp',
                        style: const TextStyle(fontSize: 11, color: kTextSecondary))))
                : ListView.separated(shrinkWrap: true,
                    itemCount: _filteredAvailable.length,
                    separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFF9FAFB)),
                    itemBuilder: (_, i) {
                      final s = _filteredAvailable[i];
                      final sid = s['id'] as int;
                      final selected = _selectedStudents.contains(sid);
                      return InkWell(onTap: () => setState(() => selected ? _selectedStudents.remove(sid) : _selectedStudents.add(sid)),
                        child: Padding(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          child: Row(children: [
                            SizedBox(width: 18, height: 18,
                              child: Checkbox(value: selected, onChanged: (_) => setState(() => selected ? _selectedStudents.remove(sid) : _selectedStudents.add(sid)),
                                activeColor: kTeal, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)))),
                            const SizedBox(width: 10),
                            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(s['name'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: kTextPrimary)),
                              Text(s['studentCode'] as String, style: const TextStyle(fontSize: 10, color: kTextSecondary)),
                            ]),
                          ])));
                    }),
          ),
          if (_selectedStudents.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text('Đã chọn ${_selectedStudents.length} sinh viên', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: kTeal)),
          ],
          const SizedBox(height: 14),
          SizedBox(width: double.infinity,
            child: ElevatedButton(
              onPressed: _selectedStudents.isEmpty || _newGroupTopic.trim().isEmpty ? null : _handleCreateGroup,
              style: ElevatedButton.styleFrom(backgroundColor: kTeal, foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), padding: const EdgeInsets.symmetric(vertical: 12),
                disabledBackgroundColor: kTeal.withOpacity(0.4)),
              child: const Text('+ Tạo nhóm', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)))),
        ])),
      ]),
    );
  }

  // ── Auto Group Panel ─────────────────────────────────────
  Widget _buildAutoGroupPanel() {
    return Container(
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: kCardBorder),
        borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
          child: Row(children: [
            Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: const Color(0xFFF5F3FF), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.auto_fix_high_rounded, size: 15, color: Color(0xFF7C3AED))),
            const SizedBox(width: 8),
            const Text('Tự Động Chia Nhóm', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: kTextPrimary)),
          ])),
        const Divider(height: 1, color: Color(0xFFF9FAFB)),
        Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFFF5F3FF), border: Border.all(color: const Color(0xFFDDD6FE)), borderRadius: BorderRadius.circular(14)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Hỗ trợ chia nhanh theo quy mô nhóm', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: kTextPrimary)),
              const SizedBox(height: 3),
              Text('Khuyến nghị nhóm từ $kMinMembers–$kMaxMembers sinh viên theo format đồ án FPTU.',
                style: const TextStyle(fontSize: 11, color: kTextSecondary)),
            ])),
          const SizedBox(height: 12),
          const Text('SỐ THÀNH VIÊN / NHÓM', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: kTextSecondary, letterSpacing: 1)),
          const SizedBox(height: 6),
          DropdownButtonFormField<int>(
            value: _autoGroupSize,
            onChanged: (v) => setState(() => _autoGroupSize = v!),
            decoration: InputDecoration(filled: true, fillColor: kBg, contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kCardBorder)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kCardBorder))),
            items: const [
              DropdownMenuItem(value: 4, child: Text('4 sinh viên', style: TextStyle(fontSize: 13))),
              DropdownMenuItem(value: 5, child: Text('5 sinh viên', style: TextStyle(fontSize: 13))),
              DropdownMenuItem(value: 6, child: Text('6 sinh viên', style: TextStyle(fontSize: 13))),
            ],
          ),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: SmartInfoCard(icon: Icons.people_outline, label: 'Chưa phân nhóm', value: '${_available.length}')),
            const SizedBox(width: 10),
            Expanded(child: SmartInfoCard(icon: Icons.folder_outlined, label: 'Ước tính nhóm mới', value: '$_estimatedGroupCount')),
          ]),
          const SizedBox(height: 12),
          SizedBox(width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _available.isEmpty ? null : _handleAutoCreateGroups,
              icon: const Icon(Icons.auto_fix_high_rounded, size: 14),
              label: const Text('Tự động chia nhóm', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF7C3AED), foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), padding: const EdgeInsets.symmetric(vertical: 12),
                disabledBackgroundColor: const Color(0xFF7C3AED).withOpacity(0.4)))),
        ])),
      ]),
    );
  }

  // ── Group List ───────────────────────────────────────────
  Widget _buildGroupList() {
    return Container(
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: kCardBorder),
        borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Row(children: [
              Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.groups_rounded, size: 15, color: Color(0xFF2563EB))),
              const SizedBox(width: 8),
              const Text('Danh sách Nhóm', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: kTextPrimary)),
            ]),
            Row(children: [
              if (_missingTopicCount > 0)
                Container(margin: const EdgeInsets.only(right: 6), padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(20)),
                  child: Text('$_missingTopicCount nhóm thiếu đề tài', style: const TextStyle(fontSize: 10, color: Color(0xFFD97706), fontWeight: FontWeight.w600))),
              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: kBg, borderRadius: BorderRadius.circular(20)),
                child: Text('${_visibleGroups.length}/${_groups.length} nhóm', style: const TextStyle(fontSize: 10, color: kTextSecondary, fontWeight: FontWeight.w600))),
            ]),
          ]),
          const SizedBox(height: 12),
          GroupsSearchBar(hint: 'Tìm nhóm hoặc đề tài...', onChanged: (v) => setState(() => _groupSearch = v)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: _groupFilter,
            onChanged: (v) => setState(() => _groupFilter = v!),
            decoration: InputDecoration(filled: true, fillColor: kBg, contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              prefixIcon: const Icon(Icons.filter_list_rounded, size: 15, color: kTextSecondary),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kCardBorder)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kCardBorder))),
            items: const [
              DropdownMenuItem(value: 'all', child: Text('Tất cả trạng thái', style: TextStyle(fontSize: 12))),
              DropdownMenuItem(value: 'healthy', child: Text('Ổn định', style: TextStyle(fontSize: 12))),
              DropdownMenuItem(value: 'watch', child: Text('Cần theo dõi', style: TextStyle(fontSize: 12))),
              DropdownMenuItem(value: 'warning', child: Text('Rủi ro', style: TextStyle(fontSize: 12))),
              DropdownMenuItem(value: 'critical', child: Text('Nguy cấp', style: TextStyle(fontSize: 12))),
              DropdownMenuItem(value: 'missing-github', child: Text('Thiếu GitHub', style: TextStyle(fontSize: 12))),
              DropdownMenuItem(value: 'missing-jira', child: Text('Thiếu Jira', style: TextStyle(fontSize: 12))),
              DropdownMenuItem(value: 'missing-topic', child: Text('Thiếu đề tài', style: TextStyle(fontSize: 12))),
            ],
          ),
        ])),
        const Divider(height: 1, color: Color(0xFFF9FAFB)),
        _visibleGroups.isEmpty ? _buildEmptyGroups() : Column(
          children: _visibleGroups.asMap().entries.map((e) =>
            _buildGroupCard(e.value, isLast: e.key == _visibleGroups.length - 1)).toList()),
      ]),
    );
  }

  Widget _buildEmptyGroups() {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 48),
      child: Center(child: Column(children: [
        Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: kBg, borderRadius: BorderRadius.circular(16)),
          child: const Icon(Icons.assignment_outlined, size: 24, color: kTextSecondary)),
        const SizedBox(height: 12),
        const Text('Chưa có nhóm phù hợp', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: kTextSecondary)),
        const SizedBox(height: 4),
        const Text('Bắt đầu bằng cách tạo nhóm thủ công\nhoặc dùng tính năng tự động chia nhóm.',
          textAlign: TextAlign.center, style: TextStyle(fontSize: 11, color: kTextSecondary)),
      ])));
  }

  Widget _buildGroupCard(Map<String, dynamic> g, {bool isLast = false}) {
    final team = (g['team'] as List).cast<Map<String, dynamic>>();
    final gid = g['id'] as int;
    final topicController = TextEditingController(text: g['description'] as String? ?? '');

    return Container(
      decoration: BoxDecoration(border: isLast ? null : const Border(bottom: BorderSide(color: Color(0xFFF9FAFB)))),
      child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Name row + badges + action buttons
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Wrap(spacing: 5, runSpacing: 4, children: [
              Text(g['name'] as String, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: kTextPrimary)),
              StatusBadge(status: (g['integration'] as Map)['githubStatus'] as String?, icon: Icons.code_rounded, label: 'GitHub'),
              StatusBadge(status: (g['integration'] as Map)['jiraStatus'] as String?, icon: Icons.book_online_outlined, label: 'Jira'),
              RiskBadge(state: g['state'] as String),
              if (g['missingTopic'] as bool)
                Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(6)),
                  child: const Text('Thiếu đề tài', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Color(0xFFD97706), letterSpacing: 0.5))),
            ]),
            const SizedBox(height: 6),
            Wrap(spacing: 5, runSpacing: 4, children: [
              MetricChip(icon: Icons.people_outline, label: '${g['memberCount']} thành viên'),
              MetricChip(icon: Icons.school_outlined, label: g['leader'] != null ? 'Leader: ${g['leader']}' : 'Chưa có leader'),
              MetricChip(icon: Icons.commit_rounded, label: '${g['commitCount']} commits'),
              MetricChip(icon: Icons.book_outlined, label: '${g['issueCount']} issues'),
              MetricChip(icon: Icons.access_time_rounded, label: g['lastActivity'] as String),
              MetricChip(icon: Icons.shield_outlined, label: 'Risk ${g['riskScore']}%'),
            ]),
          ])),
          const SizedBox(width: 8),
          Column(children: [
            _buildSmBtn(Icons.remove_red_eye_outlined, 'Chi tiết', const Color(0xFF0F766E), const Color(0xFFF0FDFA),
              () => context.go('/lecturer/group/$gid')),
            const SizedBox(height: 5),
            _buildSmBtn(Icons.delete_outline_rounded, 'Xóa', const Color(0xFFDC2626), const Color(0xFFFEF2F2),
              () => _handleDeleteGroup(gid)),
          ]),
        ]),
        const SizedBox(height: 10),
        // Topic input
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: const [Icon(Icons.edit_note_rounded, size: 11, color: kTextSecondary), SizedBox(width: 4),
            Text('Đề tài / Mô tả dự án', style: TextStyle(fontSize: 10, color: kTextSecondary))]),
          const SizedBox(height: 5),
          TextField(controller: topicController, onSubmitted: (v) => _handleUpdateTopic(gid, v),
            style: const TextStyle(fontSize: 12),
            decoration: InputDecoration(hintText: 'Chưa có đề tài...', hintStyle: const TextStyle(color: kTextSecondary, fontSize: 12),
              filled: true, fillColor: kBg, contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: kCardBorder)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: kCardBorder)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: kTeal, width: 1.5)))),
        ]),
        const SizedBox(height: 10),
        // Progress bar
        Column(children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Text('Tiến độ dự án', style: TextStyle(fontSize: 10, color: kTextSecondary)),
            Text('${g['progress']}%', style: const TextStyle(fontSize: 10, color: kTextSecondary)),
          ]),
          const SizedBox(height: 5),
          ClipRRect(borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(value: (g['progress'] as int) / 100, minHeight: 7, backgroundColor: const Color(0xFFF3F4F6),
              valueColor: AlwaysStoppedAnimation(_progressColor(g['progress'] as int)))),
        ]),
        const SizedBox(height: 10),
        // Members
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Thành viên (${team.length})', style: const TextStyle(fontSize: 11, color: kTextSecondary)),
          GestureDetector(onTap: () => setState(() { _forceAddGroupId = gid; _forceAddSelectedIds = []; _forceAddSearch = ''; _showForceAddModal = true; }),
            child: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: const Color(0xFFF0FDFA), border: Border.all(color: const Color(0xFF99F6E4)), borderRadius: BorderRadius.circular(8)),
              child: const Row(children: [Icon(Icons.person_add_alt_1_rounded, size: 10, color: kTeal), SizedBox(width: 4),
                Text('Thêm SV', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: kTeal))]))),
        ]),
        const SizedBox(height: 6),
        team.isEmpty
          ? const Text('Chưa có thành viên', style: TextStyle(fontSize: 11, color: kTextSecondary))
          : Wrap(spacing: 6, runSpacing: 6, children: team.map((m) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(color: Colors.white, border: Border.all(color: kCardBorder),
                  borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4)]),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Container(width: 16, height: 16, decoration: BoxDecoration(color: const Color(0xFFCCFBF1), borderRadius: BorderRadius.circular(20)),
                    child: Center(child: Text((m['studentName'] as String).characters.first,
                      style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: kTeal)))),
                  const SizedBox(width: 5),
                  Text(m['studentName'] as String, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: kTextPrimary)),
                  if (m['role'] == 'LEADER') ...[
                    const SizedBox(width: 4),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(color: const Color(0xFFFFFBEB), border: Border.all(color: const Color(0xFFFDE68A)), borderRadius: BorderRadius.circular(20)),
                      child: const Text('Leader', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Color(0xFFD97706)))),
                  ],
                  const SizedBox(width: 3),
                  GestureDetector(onTap: () => _handleRemoveMember(gid, m['studentId'] as int),
                    child: const Text('×', style: TextStyle(fontSize: 14, color: kTextSecondary, fontWeight: FontWeight.bold))),
                ]),
              );
            }).toList()),
        // Risk/topic alerts
        if (g['state'] == 'warning' || g['state'] == 'critical' || g['missingTopic'] == true) ...[
          const SizedBox(height: 10),
          if (g['state'] == 'warning' || g['state'] == 'critical')
            Container(margin: const EdgeInsets.only(bottom: 6), padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(color: const Color(0xFFFEF2F2), border: Border.all(color: const Color(0xFFFECACA)), borderRadius: BorderRadius.circular(12)),
              child: Row(children: [const Icon(Icons.warning_amber_rounded, size: 13, color: Color(0xFFDC2626)), const SizedBox(width: 6),
                Flexible(child: Text(g['state'] == 'critical' ? 'Nhóm đang thiếu tích hợp quan trọng và có rủi ro cao.' : 'Nhóm cần được theo dõi thêm về tiến độ hoặc mức độ hoạt động.',
                  style: const TextStyle(fontSize: 11, color: Color(0xFFDC2626))))])),
          if (g['missingTopic'] == true)
            Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(color: const Color(0xFFFFFBEB), border: Border.all(color: const Color(0xFFFDE68A)), borderRadius: BorderRadius.circular(12)),
              child: const Row(children: [Icon(Icons.error_outline_rounded, size: 13, color: Color(0xFFD97706)), SizedBox(width: 6),
                Flexible(child: Text('Nhóm chưa có đề tài cụ thể. Nên cập nhật để thuận tiện review.',
                  style: TextStyle(fontSize: 11, color: Color(0xFFD97706))))])),
        ],
      ])),
    );
  }

  Color _progressColor(int p) {
    if (p >= 80) return const Color(0xFF16A34A);
    if (p >= 50) return kTeal;
    if (p >= 30) return const Color(0xFFCA8A04);
    return const Color(0xFFDC2626);
  }

  Widget _buildSmBtn(IconData icon, String label, Color color, Color bg, VoidCallback onTap) {
    return GestureDetector(onTap: onTap,
      child: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
        decoration: BoxDecoration(color: bg, border: Border.all(color: color.withOpacity(0.2)), borderRadius: BorderRadius.circular(8)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 11, color: color), const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color)),
        ])));
  }

  // ── ForceAdd Modal ───────────────────────────────────────
  Widget _buildForceAddModal() {
    return GestureDetector(
      onTap: () => setState(() => _showForceAddModal = false),
      child: Container(color: Colors.black.withOpacity(0.3),
        child: Center(child: GestureDetector(onTap: () {},
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            constraints: const BoxConstraints(maxHeight: 520),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 20)]),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Padding(padding: const EdgeInsets.fromLTRB(20, 20, 20, 0), child: Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
                  Text('Thêm Thành Viên', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: kTextPrimary)),
                  Text('Thêm sinh viên vào nhóm này', style: TextStyle(fontSize: 11, color: kTextSecondary)),
                ])),
                GestureDetector(onTap: () => setState(() => _showForceAddModal = false),
                  child: Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: kBg, borderRadius: BorderRadius.circular(20)),
                    child: const Icon(Icons.close_rounded, size: 16, color: kTextSecondary))),
              ])),
              Padding(padding: const EdgeInsets.all(16),
                child: GroupsSearchBar(hint: 'Tìm sinh viên...', onChanged: (v) => setState(() => _forceAddSearch = v))),
              Flexible(child: Container(margin: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(border: Border.all(color: kCardBorder), borderRadius: BorderRadius.circular(12)),
                child: _filteredForceAdd.isEmpty
                  ? Padding(padding: const EdgeInsets.all(24),
                      child: Center(child: Text(_available.isEmpty ? 'Tất cả sinh viên trong lớp đã có nhóm.' : 'Không tìm thấy sinh viên phù hợp.',
                        style: const TextStyle(fontSize: 12, color: kTextSecondary))))
                  : ListView.separated(shrinkWrap: true, itemCount: _filteredForceAdd.length,
                      separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFF9FAFB)),
                      itemBuilder: (_, i) {
                        final s = _filteredForceAdd[i];
                        final sid = s['id'] as int;
                        final selected = _forceAddSelectedIds.contains(sid);
                        return InkWell(onTap: () => setState(() => selected ? _forceAddSelectedIds.remove(sid) : _forceAddSelectedIds.add(sid)),
                          child: Padding(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            child: Row(children: [
                              SizedBox(width: 18, height: 18,
                                child: Checkbox(value: selected, onChanged: (_) => setState(() => selected ? _forceAddSelectedIds.remove(sid) : _forceAddSelectedIds.add(sid)),
                                  activeColor: kTeal, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)))),
                              const SizedBox(width: 10),
                              Container(width: 30, height: 30, decoration: BoxDecoration(color: const Color(0xFFCCFBF1), borderRadius: BorderRadius.circular(20)),
                                child: Center(child: Text((s['name'] as String).characters.first,
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: kTeal)))),
                              const SizedBox(width: 10),
                              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text(s['name'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: kTextPrimary)),
                                Text(s['studentCode'] as String, style: const TextStyle(fontSize: 10, color: kTextSecondary)),
                              ])),
                            ])));
                      }))),
              Padding(padding: const EdgeInsets.all(16), child: Column(children: [
                const Divider(height: 1, color: Color(0xFFF9FAFB)),
                const SizedBox(height: 12),
                SizedBox(width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _forceAddSelectedIds.isEmpty ? null : _handleForceAddSubmit,
                    style: ElevatedButton.styleFrom(backgroundColor: kTeal, foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), padding: const EdgeInsets.symmetric(vertical: 12),
                      disabledBackgroundColor: kTeal.withOpacity(0.4)),
                    child: const Text('Xác nhận thêm', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)))),
              ])),
            ]),
          ))),
    ));
    
  }
}
