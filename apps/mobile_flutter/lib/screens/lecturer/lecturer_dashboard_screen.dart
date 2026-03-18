// Lecturer Dashboard Screen - Refactored to match LecturerDashboard.jsx
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
  State<LecturerDashboardScreen> createState() => _LecturerDashboardScreenState();
}

class _LecturerDashboardScreenState extends State<LecturerDashboardScreen> {
  // ─── Design Tokens ──────────────────────────────────
  static const Color kBg      = Color(0xFFF9FAFB);
  static const Color kTeal    = Color(0xFF0F766E);
  static const Color kTealL   = Color(0xFF14B8A6);
  static const Color kTxtPx   = Color(0xFF111827);
  static const Color kTxtSx   = Color(0xFF6B7280);
  static const Color kBdr     = Color(0xFFE5E7EB);
  static const Color kCard    = Colors.white;
  static const Color kEmerald = Color(0xFF10B981);

  final LecturerService _lecturerService = LecturerService();
  final AdminService    _adminService    = AdminService();
  final AuthService     _authService     = AuthService();

  // ─── State ───────────────────────────────────────────
  bool _isLoading = true;
  bool _loadingLogs = false;
  User? _currentUser;
  
  List<Map<String, dynamic>> _subjects = [];
  List<Map<String, dynamic>> _courses  = [];
  List<Map<String, dynamic>> _groups   = [];
  List<Map<String, dynamic>> _alerts   = [];
  List<Map<String, dynamic>> _activities = [];
  
  String _selectedSubject = '';
  String _selectedCourse  = '';
  String _filter          = 'all';
  
  Map<String, dynamic> _stats = {
    'courses': 0,
    'students': 0,
    'github': 0,
    'alerts': 0,
  };

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    setState(() => _isLoading = true);
    try {
      final user = await _authService.getCurrentUser();
      final results = await Future.wait([
        _lecturerService.getWorkload(),
        _adminService.getSubjects(),
        _lecturerService.getMyCourses(),
        _lecturerService.getAlerts(),
        _lecturerService.getActivityLogs(limit: 10),
      ]);

      if (mounted) {
        setState(() {
          _currentUser = user;
          final wk = results[0] as Map<String, dynamic>? ?? {};
          _subjects = (results[1] as List).map((e) => _normalizeSubject(e as Map<String, dynamic>)).toList();
          _courses  = (results[2] as List).map((e) => _normalizeCourse(e as Map<String, dynamic>)).toList();
          _alerts   = (results[3] as List).where((a) => (a['status'] ?? a['Status'] ?? 'OPEN') == 'OPEN').map((e) => _normalizeAlert(e as Map<String, dynamic>)).toList();
          _activities = (results[4] as List).map((e) => _normalizeActivity(e as Map<String, dynamic>)).toList();
          
          _stats = {
            'courses': wk['coursesCount'] ?? wk['courseCount'] ?? 0,
            'students': wk['studentsCount'] ?? wk['studentCount'] ?? 0,
            'github': 0, 
            'alerts': _alerts.length,
          };

          if (_subjects.isNotEmpty && _selectedSubject.isEmpty) {
            _selectedSubject = _subjects[0]['id'];
            _onSubjectChanged(_selectedSubject);
          } else if (_selectedCourse.isNotEmpty) {
             _onCourseChanged(_selectedCourse);
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _snack("Lỗi tải dữ liệu", err: true);
      }
    }
  }

  void _onSubjectChanged(String sid) {
    setState(() {
      _selectedSubject = sid;
      final relevant = _courses.where((c) => c['subjectId'] == sid).toList();
      if (relevant.isNotEmpty) {
        _onCourseChanged(relevant[0]['id']);
      } else {
        _selectedCourse = '';
        _groups = [];
      }
    });
  }

  Future<void> _onCourseChanged(String cid) async {
    setState(() {
      _selectedCourse = cid;
      _loadingLogs = true;
    });
    try {
      final gps = await _lecturerService.getCourseGroups(cid);
      if (mounted) {
        setState(() {
          _groups = gps.map((e) => _normalizeGroup(e)).toList();
          _stats['github'] = _groups.where((g) => g['githubOk']).length;
          _loadingLogs = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loadingLogs = false);
    }
  }

  // ─── Normalizers ─────────────────────────────────────
  Map<String, dynamic> _normalizeSubject(Map<String, dynamic> s) => {
    'id': (s['id'] ?? s['Id'] ?? 0).toString(),
    'name': (s['name'] ?? s['subjectName'] ?? 'N/A').toString(),
    'code': (s['code'] ?? s['subjectCode'] ?? 'N/A').toString(),
  };

  Map<String, dynamic> _normalizeCourse(Map<String, dynamic> c) => {
    'id': (c['id'] ?? c['Id'] ?? 0).toString(),
    'code': (c['code'] ?? c['courseCode'] ?? c['className'] ?? 'N/A').toString(),
    'name': (c['name'] ?? c['courseName'] ?? 'N/A').toString(),
    'subjectId': (c['subjectId'] ?? c['subject_id'] ?? 0).toString(),
  };

  Map<String, dynamic> _normalizeGroup(Map<String, dynamic> g) {
    final integration = g['integration'] ?? g['Integration'] ?? {};
    final stats = g['stats'] ?? g['Stats'] ?? {};
    return {
      'id': (g['id'] ?? g['Id'] ?? 0).toString(),
      'name': (g['name'] ?? g['groupName'] ?? g['GroupName'] ?? 'N/A').toString(),
      'topic': (g['topic'] ?? g['projectName'] ?? g['ProjectName'] ?? g['description'] ?? g['Description'] ?? '').toString(),
      'githubStatus': (g['githubStatus'] ?? integration['github_status'] ?? integration['githubStatus'] ?? 'NONE').toString().toUpperCase(),
      'jiraStatus': (g['jiraStatus'] ?? integration['jira_status'] ?? integration['jiraStatus'] ?? 'NONE').toString().toUpperCase(),
      'githubOk': (g['githubStatus'] ?? integration['github_status'] ?? integration['githubStatus'] ?? g['github_status']) == 'APPROVED',
      'jiraOk': (g['jiraStatus'] ?? integration['jira_status'] ?? integration['jiraStatus'] ?? g['jira_status']) == 'APPROVED',
      'team': g['students'] ?? g['members'] ?? g['team'] ?? g['Students'] ?? g['Members'] ?? [],
      'integration': integration,
      'stats': {
        'commits': stats['commitsCount'] ?? stats['commits'] ?? stats['CommitsCount'] ?? 0,
        'srsDone': stats['srsCompletionPercent'] ?? stats['SrsCompletionPercent'] ?? 0,
      }
    };
  }

  Map<String, dynamic> _normalizeAlert(Map<String, dynamic> a) => {
    'id': (a['id'] ?? a['Id'] ?? 0).toString(),
    'name': (a['groupName'] ?? a['projectName'] ?? a['ProjectName'] ?? a['group_name'] ?? 'Thông báo').toString(),
    'msg': (a['message'] ?? a['msg'] ?? a['Message'] ?? '').toString(),
    'severity': (a['severity'] ?? a['Severity'] ?? 'MEDIUM').toString().toUpperCase(),
  };

  Map<String, dynamic> _normalizeActivity(Map<String, dynamic> a) {
    final type = (a['type'] ?? a['Type'] ?? 'INFO').toString().toUpperCase();
    IconData icon = Icons.info_outline;
    Color color = Colors.blue;
    
    if (type.contains('GITHUB') || type.contains('COMMIT')) { icon = Icons.account_tree_outlined; color = kTeal; }
    else if (type.contains('JIRA') || type.contains('ISSUE')) { icon = Icons.book_outlined; color = Colors.blue; }
    else if (type.contains('SRS') || type.contains('REPORT'))   { icon = Icons.file_present_outlined; color = Colors.indigo; }
    else if (type.contains('APPROVE') || type.contains('OK'))   { icon = Icons.check_circle_outline; color = kEmerald; }
    else if (type.contains('USER') || type.contains('MEMBER'))  { icon = Icons.people_outline; color = Colors.cyan; }
    else if (type.contains('ALERT') || type.contains('WARN'))   { icon = Icons.warning_amber_rounded; color = Colors.orange; }

    return {
      'id': (a['id'] ?? a['Id'] ?? 0).toString(),
      'msg': (a['message'] ?? a['msg'] ?? a['Message'] ?? a['description'] ?? a['Description'] ?? '').toString(),
      'time': (a['createdAt'] ?? a['time'] ?? a['Timestamp'] ?? 'Vừa xong').toString(),
      'icon': icon,
      'color': color,
    };
  }

  // ─── Handlers ────────────────────────────────────────
  void _snack(String m, {bool err = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(m), backgroundColor: err ? Colors.red : kTeal,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  Future<void> _handleResolve(String id) async {
    final ok = await _lecturerService.resolveAlert(id);
    if (ok) {
      _snack("Đã xử lý cảnh báo");
      _loadInitialData();
    }
  }

  Future<void> _handleApprove(String gid) async {
    final ok = await _lecturerService.approveIntegration(gid);
    if (ok) {
      _snack("Đã duyệt tích hợp");
      _onCourseChanged(_selectedCourse);
    }
  }

  void _showSendAlert() {
    if (_groups.isEmpty) { _snack("Vui lòng chọn lớp có nhóm hoạt động", err: true); return; }
    
    String msg = "";
    String severity = "MEDIUM";
    String? selectedGid = _groups[0]['id'];

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDsState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Text('Phát cảnh báo', style: TextStyle(fontWeight: FontWeight.w900, color: kTxtPx)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _selectField('Chọn nhóm', selectedGid!, _groups, (v) => setDsState(() => selectedGid = v)),
                const SizedBox(height: 16),
                TextField(
                  onChanged: (v) => msg = v,
                  maxLines: 4,
                  decoration: InputDecoration(
                    hintText: 'Nhập nội dung cảnh báo...',
                    fillColor: kBg, filled: true,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 16),
                _selectField('Mức độ', severity, [{'id':'LOW','code':'Thấp'},{'id':'MEDIUM','code':'Trung bình'},{'id':'HIGH','code':'Cao'}], (v) => setDsState(() => severity = v!)),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy', style: TextStyle(color: kTxtSx))),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: kTeal, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              onPressed: () async {
                if (msg.isEmpty) return;
                final ok = await _lecturerService.sendAlert(selectedGid, msg, severity: severity);
                if (ok) {
                  Navigator.pop(ctx);
                  _snack("Đã gửi cảnh báo thành công");
                }
              },
              child: const Text('Gửi cảnh báo'),
            ),
          ],
        ),
      )
    );
  }

  // ─── Build ──────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      drawer: const LecturerDrawer(),
      appBar: AppTopHeader(
        title: 'Dashboard Giảng viên',
        user: AppUser(
          name: _currentUser?.fullName ?? 'Giảng viên',
          email: _currentUser?.email ?? '',
          role: 'LECTURER'
        ),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: kTeal))
        : RefreshIndicator(
            onRefresh: _loadInitialData,
            color: kTeal,
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildPageHeader(),
                  const SizedBox(height: 24),
                  _buildStatsGrid(),
                  const SizedBox(height: 24),
                  // Filters
                  _buildFilters(),
                  const SizedBox(height: 24),

                  // Always visible sections
                  _buildActivityAndAlerts(),
                  const SizedBox(height: 24),

                  // Course-specific sections
                  if (_selectedCourse.isEmpty) _buildEmptyWorkspace() 
                  else ...[
                    _buildGroupTracking(),
                    const SizedBox(height: 24),
                    _buildPerformanceMap(),
                  ],
                ],
              ),
            ),
          ),
    );
  }

  Widget _buildPageHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 4, crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            const Text('Giảng viên', style: TextStyle(fontSize: 11, color: kTeal, fontWeight: FontWeight.bold)),
            const Icon(Icons.chevron_right, size: 14, color: kTxtSx),
            const Text('Hệ thống', style: TextStyle(fontSize: 11, color: kTxtSx)),
            const Icon(Icons.chevron_right, size: 14, color: kTxtSx),
            const Text('Tổng quan', style: TextStyle(fontSize: 11, color: kTxtPx, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Dashboard Giảng viên', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: kTxtPx)),
                  Text('Chào mừng trở lại, ${_currentUser?.fullName ?? "Giảng viên"}!', style: const TextStyle(fontSize: 13, color: kTxtSx)),
                ],
              ),
            ),
            _circleAction(Icons.notifications_none_rounded, () => context.go('/lecturer/alerts'), badge: _alerts.isNotEmpty),
            const SizedBox(width: 12),
            _actionBtn(Icons.shield_outlined, 'Phát cảnh báo', _showSendAlert, color: Colors.redAccent),
          ],
        )
      ],
    );
  }

  Widget _buildStatsGrid() {
    return LayoutBuilder(builder: (context, constraints) {
      final w = (constraints.maxWidth - 12) / 2;
      return Wrap(
        spacing: 12, runSpacing: 12,
        children: [
          _statCard('Lớp học', '${_stats['courses']}', Icons.book_outlined, Colors.indigo, w),
          _statCard('Sinh viên', '${_stats['students']}', Icons.people_outline, Colors.blue, w),
          _statCard('GitHub Approved', '${_stats['github']}', Icons.account_tree_outlined, kEmerald, w),
          _statCard('Cần chú ý', '${_stats['alerts']}', Icons.warning_amber_rounded, Colors.orange, w),
        ],
      );
    });
  }

  Widget _buildFilters() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.circular(24), border: Border.all(color: kBdr)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            const Icon(Icons.filter_list_rounded, size: 18, color: kTeal),
            const SizedBox(width: 8),
            const Expanded(child: Text('Bộ lọc lớp học', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: kTxtPx), overflow: TextOverflow.ellipsis)),
            const SizedBox(width: 8),
            if (_selectedCourse.isNotEmpty)
              _actionBtn(Icons.settings_outlined, 'Quản lý', () => context.push('/lecturer/course/$_selectedCourse/manage-groups')),
          ]),
          const SizedBox(height: 20),
          _selectField('Môn học', _selectedSubject, _subjects, (v) => _onSubjectChanged(v!)),
          const SizedBox(height: 16),
          _selectField('Lớp học', _selectedCourse, _courses.where((c) => c['subjectId'] == _selectedSubject).toList(), (v) => _onCourseChanged(v!)),
          const SizedBox(height: 16),
          _selectField('Bộ lọc nhanh', _filter, [{'id':'all','code':'Tất cả nhóm'},{'id':'risk','code':'Ít activity'}], (v) => setState(() => _filter = v!)),
        ],
      ),
    );
  }

  Widget _buildActivityAndAlerts() {
    return Column(
      children: [
        _activityFeed(),
        const SizedBox(height: 20),
        _systemAlerts(),
        const SizedBox(height: 20),
        _integrationApproval(),
      ],
    );
  }

  Widget _activityFeed() {
    return Container(
      decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.circular(32), border: Border.all(color: kBdr)),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Row(
              children: [
                Container(width: 40, height: 40, decoration: BoxDecoration(color: kTeal, borderRadius: BorderRadius.circular(14)), child: const Icon(Icons.bolt, color: Colors.white, size: 20)),
                const SizedBox(width: 12),
                const Expanded(child: Text('Dòng hoạt động thời gian thực', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: kTxtPx), overflow: TextOverflow.ellipsis)),
                const SizedBox(width: 8),
                Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFD1FAE5))), 
                  child: const Row(children: [Icon(Icons.flash_on, size: 10, color: kEmerald), SizedBox(width: 4), Text('LIVE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: kEmerald))])),
              ],
            ),
          ),
          if (_loadingLogs) const Padding(padding: EdgeInsets.symmetric(vertical: 40), child: CircularProgressIndicator(color: kTeal))
          else if (_activities.isEmpty) Padding(padding: const EdgeInsets.symmetric(vertical: 40), child: Column(children: [
             Icon(Icons.history, size: 40, color: Colors.grey[300]),
             const SizedBox(height: 12),
             const Text('Chưa có hoạt động ghi nhận', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: kTxtSx, letterSpacing: 1.2)),
          ]))
          else ..._activities.map((a) => _activityItem(a)),
        ],
      ),
    );
  }

  Widget _systemAlerts() {
    return Container(
      decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.circular(32), border: Border.all(color: kBdr)),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Row(children: [
               Container(width: 40, height: 40, decoration: BoxDecoration(color: Colors.amber[50], borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.warning_amber_rounded, color: Colors.amber, size: 18)),
               const SizedBox(width: 12),
               const Text('Cảnh báo hệ thống', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: kTxtPx)),
            ]),
          ),
          if (_alerts.isEmpty) Padding(padding: const EdgeInsets.symmetric(vertical: 20), child: Column(children: [
             const Icon(Icons.check_circle, size: 32, color: kEmerald),
             const SizedBox(height: 8),
             const Text('Mọi thứ đều ổn định', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: kTxtSx)),
          ]))
          else ..._alerts.take(3).map((a) => _alertItem(a)),
          Padding(
            padding: const EdgeInsets.all(24),
            child: InkWell(
              onTap: () => context.go('/lecturer/alerts'),
              child: Container(
                width: double.infinity, height: 48, alignment: Alignment.center,
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), border: Border.all(color: kBdr, style: BorderStyle.solid)),
                child: const Text('Trung tâm cảnh báo →', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: kTxtSx)),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _integrationApproval() {
    final pending = _groups.where((g) => !g['githubOk'] || !g['jiraOk']).toList();
    if (pending.isEmpty) return const SizedBox.shrink();

    return Container(
      decoration: BoxDecoration(color: const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(32), border: Border.all(color: const Color(0xFFE0E7FF))),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Row(children: [
               Container(width: 40, height: 40, decoration: BoxDecoration(color: Colors.indigo, borderRadius: BorderRadius.circular(14)), child: const Icon(Icons.trending_up, color: Colors.white, size: 20)),
               const SizedBox(width: 12),
               const Text('Phê duyệt Link', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: kTxtPx)),
            ]),
            const SizedBox(height: 16),
            ...pending.map((g) => _pendingItem(g)),
          ],
        ),
      ),
    );
  }

  Widget _buildGroupTracking() {
    return Container(
      decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.circular(32), border: Border.all(color: kBdr)),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Row(children: [
               Container(width: 40, height: 40, decoration: BoxDecoration(color: kTeal, borderRadius: BorderRadius.circular(14)), child: const Icon(Icons.list_alt_rounded, color: Colors.white, size: 20)),
               const SizedBox(width: 12),
               const Expanded(child: Text('Bảng theo dõi nhóm', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: kTxtPx), overflow: TextOverflow.ellipsis)),
               const SizedBox(width: 8),
               _badge('${_groups.length} NHÓM', kTeal),
            ]),
          ),
          if (_groups.isEmpty) const Padding(padding: EdgeInsets.symmetric(vertical: 40), child: Text('Không có dữ liệu nhóm', style: TextStyle(color: kTxtSx)))
          else SingleChildScrollView(scrollDirection: Axis.horizontal, child: DataTable(
            horizontalMargin: 24, headingRowHeight: 48, dataRowHeight: 70,
            columns: const [
              DataColumn(label: Text('Nhóm & Đề tài', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: kTxtSx))),
              DataColumn(label: Text('Cấu hình Link', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: kTxtSx))),
              DataColumn(label: Text('Thành viên', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: kTxtSx))),
              DataColumn(label: Text('Thao tác', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: kTxtSx))),
            ],
            rows: _groups.map((g) => DataRow(cells: [
              DataCell(Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
                Text(g['name'], style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: kTxtPx)),
                SizedBox(width: 150, child: Text(g['topic'].isNotEmpty ? g['topic'] : 'Chưa đăng ký đề tài', style: const TextStyle(fontSize: 10, color: kTxtSx, fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis)),
              ])),
              DataCell(Row(children: [
                _statusBadge('Git', g['githubOk']),
                const SizedBox(width: 4),
                _statusBadge('Jira', g['jiraOk']),
              ])),
              DataCell(_avatarStack(g['team'])),
              DataCell(Row(children: [
                _iconAction(Icons.visibility_outlined, () => context.push('/lecturer/group/${g['id']}')),
                const SizedBox(width: 4),
                _iconAction(Icons.notifications_none_rounded, () => _snack('Đã nhắc nhở nhóm ${g['name']}'), color: Colors.amber),
              ])),
            ])).toList(),
          ))
        ],
      ),
    );
  }

  Widget _buildPerformanceMap() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.circular(32), border: Border.all(color: kBdr)),
      child: Column(
        children: [
           Row(children: [
              const Icon(Icons.trending_up_rounded, color: kTeal, size: 18),
              const SizedBox(width: 8),
              const Text('Bản đồ Hiệu suất', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: kTxtPx)),
           ]),
           const SizedBox(height: 32),
           const AspectRatio(aspectRatio: 1, child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
             Icon(Icons.radar_rounded, size: 80, color: Color(0xFFF1F5F9)),
             SizedBox(height: 16),
             Text('Radar Chart visualization', style: TextStyle(color: kTxtSx, fontSize: 12, fontWeight: FontWeight.bold)),
           ])),
           const SizedBox(height: 16),
           const Divider(height: 32, color: kBdr),
           Row(children: [
             Expanded(child: _perfStat('Git Approved', '${_stats['github']}', kTeal)),
             const SizedBox(width: 16),
             Expanded(child: _perfStat('Active Alerts', '${_stats['alerts']}', Colors.indigo)),
           ])
        ],
      ),
    );
  }

  // ─── Shared UI Components ──────────────────────────
  Widget _circleAction(IconData icon, VoidCallback onTap, {bool badge = false}) {
    return Stack(children: [
      InkWell(onTap: onTap, borderRadius: BorderRadius.circular(20), 
        child: Container(width: 40, height: 40, decoration: BoxDecoration(border: Border.all(color: Colors.grey[100]!), shape: BoxShape.circle), child: Icon(icon, size: 18, color: kTxtPx))),
      if (badge) Positioned(top: 0, right: 0, child: Container(width: 10, height: 10, decoration: BoxDecoration(color: Colors.red, border: Border.all(color: Colors.white, width: 2), shape: BoxShape.circle))),
    ]);
  }

  Widget _actionBtn(IconData icon, String label, VoidCallback onTap, {Color color = kTeal, Color textColor = Colors.white}) {
    return ElevatedButton.icon(onPressed: onTap, icon: Icon(icon, size: 14), label: Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
      style: ElevatedButton.styleFrom(backgroundColor: color, foregroundColor: textColor, elevation: 6, shadowColor: color.withOpacity(0.3), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0), 
      minimumSize: const Size(0, 42), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))));
  }

  Widget _iconAction(IconData icon, VoidCallback onTap, {Color color = kTeal}) {
    return InkWell(onTap: onTap, child: Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.white, border: Border.all(color: kBdr), borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4)]), 
      child: Icon(icon, size: 16, color: color)));
  }

  Widget _statCard(String lbl, String val, IconData icon, Color color, double w) {
    return Container(width: w, padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: kCard, borderRadius: BorderRadius.circular(22), border: Border.all(color: kBdr), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10)]),
      child: Row(children: [
        Container(width: 44, height: 44, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(14)), child: Icon(icon, color: Colors.white, size: 20)),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(val, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: kTxtPx, height: 1.1)),
          Text(lbl, style: const TextStyle(fontSize: 10, color: kTxtSx, fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis),
        ]))
      ]));
  }

  Widget _selectField(String lbl, String val, List<dynamic> items, ValueChanged<String?> onChg) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(lbl.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: kTxtSx, letterSpacing: 1.2)),
      const SizedBox(height: 8),
      DropdownButtonFormField<String>(
        value: val.isEmpty ? null : val, items: items.map((i) => DropdownMenuItem(value: i['id'].toString(), child: Text(i['code'] ?? i['name']))).toList(),
        onChanged: onChg, decoration: InputDecoration(contentPadding: const EdgeInsets.symmetric(horizontal: 16), fillColor: kBg, filled: true, 
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none)),
        style: const TextStyle(fontSize: 13, color: kTxtPx, fontWeight: FontWeight.bold), icon: const Icon(Icons.expand_more_rounded, size: 20, color: kTxtSx),
      )
    ]);
  }

  Widget _activityItem(Map<String, dynamic> a) {
    return Container(padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20), decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: kBg))),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(width: 48, height: 48, decoration: BoxDecoration(color: a['color'].withOpacity(0.08), borderRadius: BorderRadius.circular(20)), child: Icon(a['icon'], color: a['color'], size: 20)),
        const SizedBox(width: 16),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(a['msg'], style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: kTxtPx)),
          const SizedBox(height: 6),
          Row(children: [
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: kBg, borderRadius: BorderRadius.circular(8), border: Border.all(color: kBdr)), 
              child: Row(children: [const Icon(Icons.access_time, size: 10, color: Color(0xFFCBD5E1)), const SizedBox(width: 4), Text(a['time'], style: const TextStyle(fontSize: 10, color: kTxtSx, fontWeight: FontWeight.bold))])),
            const SizedBox(width: 8),
            const Text('VERIFIED EVENT', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Color(0xFFE2E8F0), letterSpacing: 1.2)),
          ])
        ])),
        const SizedBox(width: 8),
        TextButton(onPressed: () => _snack('Chi tiết'), child: const Text('Chi tiết', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: kTeal))),
      ]));
  }

  Widget _alertItem(Map<String, dynamic> a) {
    final isHigh = a['severity'] == 'HIGH';
    return Container(margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 6), padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFFEF3C7))),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(a['name'].toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFFB45309))),
          const SizedBox(height: 2),
          Text(a['msg'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF78350F))),
        ])),
        IconButton(icon: const Icon(Icons.check_circle, color: Color(0xFFD97706), size: 24), onPressed: () => _handleResolve(a['id'])),
      ]));
  }

  Widget _pendingItem(Map<String, dynamic> g) {
    return Container(margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFE0E7FF)), boxShadow: [BoxShadow(color: Colors.indigo.withOpacity(0.05), blurRadius: 10)]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(g['name'], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: kTxtPx)),
        const SizedBox(height: 12),
        if (!g['githubOk']) _linkApprovalRow(Icons.account_tree_outlined, g['integration']['github_url'] ?? g['integration']['githubUrl'] ?? 'Link GitHub', () => _handleApprove(g['id'])),
        if (!g['jiraOk']) _linkApprovalRow(Icons.book_outlined, g['integration']['jira_url'] ?? g['integration']['jiraUrl'] ?? 'Link Jira', () => _handleApprove(g['id'])),
      ]));
  }

  Widget _linkApprovalRow(IconData icon, String url, VoidCallback onOk) {
    return Container(margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: kBg, borderRadius: BorderRadius.circular(14)),
      child: Row(children: [
        Icon(icon, size: 14, color: kTxtSx),
        const SizedBox(width: 8),
        Expanded(child: Text(url, style: const TextStyle(fontSize: 10, color: Colors.blueAccent, fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis)),
        const SizedBox(width: 8),
        InkWell(onTap: onOk, child: const Text('Duyệt', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: kTeal))),
      ]));
  }

  Widget _statusBadge(String lbl, bool ok) {
    final c = ok ? kEmerald : kTxtSx;
    return Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: ok ? const Color(0xFFECFDF5) : kBg, border: Border.all(color: ok ? const Color(0xFFD1FAE5) : kBdr), borderRadius: BorderRadius.circular(8)),
      child: Text('$lbl ${ok?"✓":"✗"}', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: c)));
  }

  Widget _badge(String lbl, Color c) {
    return Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: c.withOpacity(0.05), border: Border.all(color: c.withOpacity(0.2)), borderRadius: BorderRadius.circular(20)),
      child: Text(lbl, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: c)));
  }

  Widget _avatarStack(List<dynamic> team) {
    return Container(width: 100, height: 32, alignment: Alignment.center,
      child: Stack(children: [
        ...team.take(3).toList().asMap().entries.map((e) => Positioned(left: e.key * 18.0, 
          child: Container(width: 32, height: 32, decoration: BoxDecoration(gradient: const LinearGradient(colors: [kTeal, Colors.indigo]), shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)]), 
          child: Center(child: Text((e.value['fullName'] ?? e.value['name'] ?? 'S').substring(0, 1), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white)))))),
        if (team.length > 3) Positioned(left: 3 * 18.0, child: Container(width: 32, height: 32, decoration: BoxDecoration(color: kBg, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2)), 
          child: Center(child: Text('+${team.length - 3}', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: kTxtSx))))),
      ]),
    );
  }

  Widget _perfStat(String lbl, String val, Color c) {
    return Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: c.withOpacity(0.05), borderRadius: BorderRadius.circular(20)),
      child: Column(children: [
        Text(lbl, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: c)),
        const SizedBox(height: 4),
        Text(val, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: kTxtPx)),
      ]));
  }

  Widget _buildEmptyWorkspace() {
    return Center(child: Padding(padding: const EdgeInsets.symmetric(vertical: 80), child: Column(children: [
       Container(width: 96, height: 96, decoration: BoxDecoration(color: kBg, borderRadius: BorderRadius.circular(32), border: Border.all(color: kBdr), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 20)]), child: const Icon(Icons.dashboard_outlined, size: 48, color: Color(0xFFE2E8F0))),
       const SizedBox(height: 24),
       const Text('KHỞI TẠO KHÔNG GIAN LÀM VIỆC', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: kTxtSx, letterSpacing: 2.0)),
       const SizedBox(height: 8),
       const Text('Vui lòng chọn Lớp học để xem báo cáo chi tiết', style: TextStyle(fontSize: 13, color: kTxtSx, fontWeight: FontWeight.w500)),
    ])));
  }
}

