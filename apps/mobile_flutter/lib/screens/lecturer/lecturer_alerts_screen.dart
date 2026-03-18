import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/lecturer_navigation.dart';
import '../../services/auth_service.dart';
import '../../services/lecturer_service.dart';
import '../../models/user.dart';

// ── Design Tokens ──────────────────────────────────────────
const _kTeal = Color(0xFF0F766E);
const _kEmerald = Color(0xFF10B981);
const _kBg = Color(0xFFF9FAFB);
const _kBorder = Color(0xFFE5E7EB);
const _kText = Color(0xFF111827);
const _kSub = Color(0xFF6B7281);

// ── Screen ───────────────────────────────────────────────────
class LecturerAlertsScreen extends StatefulWidget {
  const LecturerAlertsScreen({super.key});
  @override
  State<LecturerAlertsScreen> createState() => _LecturerAlertsScreenState();
}

class _LecturerAlertsScreenState extends State<LecturerAlertsScreen> {
  final LecturerService _lecturerService = LecturerService();
  final AuthService _authService = AuthService();
  
  User? _currentUser;
  bool _isLoading = true;
  bool _isResolving = false;
  
  String _filter = 'all';
  String _search = '';
  final Set<String> _remindedIds = {};
  List<Map<String, dynamic>> _alerts = [];
  List<Map<String, dynamic>> _allGroups = [];
  String? _selectedId;

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
        _lecturerService.getAlerts(),
        _lecturerService.getMyCourses(),
      ]);
      
      final alertsData = (results[0] as List).map((e) => _normalizeAlert(e as Map<String, dynamic>)).toList();
      
      // Fetch groups for all courses (for SendAlertModal)
      List<Map<String, dynamic>> groups = [];
      final courses = results[1] as List;
      for (var c in courses) {
        final gs = await _lecturerService.getCourseGroups(c['id']);
        groups.addAll(gs.cast<Map<String, dynamic>>());
      }

      if (mounted) {
        setState(() {
          _currentUser = user;
          _alerts = alertsData;
          _allGroups = groups;
          if (_alerts.isNotEmpty && _selectedId == null) {
            _selectedId = _alerts.first['id'] as String;
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _snack("Lỗi khi tải dữ liệu", isError: true);
      }
    }
  }

  Map<String, dynamic> _normalizeAlert(Map<String, dynamic> a) {
    final integration = a['integration'] ?? a['Integration'] ?? a['metrics'] ?? {};
    return {
      'id': (a['id'] ?? a['Id'] ?? 0).toString(),
      'groupName': (a['groupName'] ?? a['teamName'] ?? a['GroupName'] ?? 'N/A').toString(),
      'courseCode': (a['courseCode'] ?? a['CourseCode'] ?? 'N/A').toString(),
      'targetName': (a['targetName'] ?? a['fullName'] ?? a['groupName'] ?? 'N/A').toString(),
      'message': (a['message'] ?? a['content'] ?? a['msg'] ?? 'Không có nội dung').toString(),
      'type': (a['type'] ?? a['alertType'] ?? 'LOW_ACTIVITY').toString().toUpperCase(),
      'status': (a['status'] ?? a['Status'] ?? 'OPEN').toString().toUpperCase(),
      'severity': (a['severity'] ?? a['Severity'] ?? 'MEDIUM').toString().toUpperCase(),
      'createdAt': (a['createdAt'] ?? a['created_at'] ?? '2025-03-15').toString(),
      'groupId': (a['groupId'] ?? a['GroupId'] ?? a['id']).toString(),
      'suggestion': (a['suggestion'] ?? a['suggested_action'] ?? 'Nên liên hệ trực tiếp để xác minh lý do tham gia kém và cập nhật lại phân chia công việc.').toString(),
      'metrics': {
        'score': (a['contributionScore'] ?? integration['score'] ?? integration['contributionScore'] ?? 0) as int,
        'commits': (a['commitsCount'] ?? integration['commits'] ?? integration['commitsCount'] ?? 0) as int,
        'jiraDone': (a['jiraTasksDone'] ?? integration['jiraDone'] ?? integration['jiraTasksDone'] ?? 0) as int,
      },
    };
  }

  List<Map<String, dynamic>> get _filtered {
    final kw = _search.trim().toLowerCase();
    return _alerts.where((a) {
      final matchKw = kw.isEmpty ||
          (a['groupName'] as String).toLowerCase().contains(kw) ||
          (a['targetName'] as String).toLowerCase().contains(kw) ||
          (a['message'] as String).toLowerCase().contains(kw);
      if (!matchKw) return false;
      if (_filter == 'resolved') return a['status'] == 'RESOLVED';
      if (_filter == 'all') return a['status'] == 'OPEN';
      return a['status'] == 'OPEN' && (a['severity'] as String).toLowerCase() == _filter;
    }).toList();
  }

  // Stats
  int get _unresolvedCount => _alerts.where((a) => a['status'] == 'OPEN').length;
  int get _highSeverityCount => _alerts.where((a) => a['status'] == 'OPEN' && a['severity'] == 'HIGH').length;
  int get _resolvedCount => _alerts.where((a) => a['status'] == 'RESOLVED').length;
  int get _newLast24hCount {
    final now = DateTime.now();
    return _alerts.where((a) {
      try {
        final dt = DateTime.parse(a['createdAt']);
        return now.difference(dt).inHours < 24;
      } catch (_) { return false; }
    }).length;
  }
  int get _groupCount => _alerts.map((a) => a['groupName']).toSet().length;

  Map<String, dynamic>? get _selectedAlert =>
      _selectedId == null ? null : _alerts.cast<Map<String,dynamic>?>().firstWhere((a) => a!['id'] == _selectedId, orElse: () => null);

  // Stats counters for filters
  int _countFor(String f) {
    if (f == 'all') return _alerts.where((a) => a['status'] == 'OPEN').length;
    if (f == 'resolved') return _alerts.where((a) => a['status'] == 'RESOLVED').length;
    return _alerts.where((a) => a['status'] == 'OPEN' && a['severity'].toString().toLowerCase() == f).length;
  }
  Future<void> _handleResolve(String id) async {
    setState(() => _isResolving = true);
    final ok = await _lecturerService.resolveAlert(id);
    if (mounted) {
      setState(() => _isResolving = false);
      if (ok) {
        final i = _alerts.indexWhere((a) => a['id'] == id);
        if (i >= 0) _alerts[i] = {..._alerts[i], 'status': 'RESOLVED'};
        _snack("Đã giải quyết cảnh báo");
      }
    }
  }

  Future<void> _handleRemind(Map<String, dynamic> a) async {
    final ok = await _lecturerService.sendAlert(a['groupId'], "Nhắc nhở: ${a['message']}");
    if (mounted && ok) {
      setState(() => _remindedIds.add(a['id']));
      _snack("Đã gửi nhắc nhở cho ${a['targetName']}");
    }
  }

  void _showSendAlertModal() {
    String msg = "";
    String severity = "MEDIUM";
    String? gid = _allGroups.isNotEmpty ? _allGroups[0]['id'].toString() : null;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setSt) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
          title: const Text('Phát cảnh báo mới', style: TextStyle(fontWeight: FontWeight.w900)),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              _buildSelect('Chọn nhóm', gid, _allGroups.map((g) => {'id': g['id'].toString(), 'name': g['name'].toString()}).toList().cast<Map<String, String>>(), (v) => setSt(() => gid = v)),
              const SizedBox(height: 16),
              TextField(
                onChanged: (v) => msg = v,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Nội dung cảnh báo...',
                  filled: true, fillColor: _kBg,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),
              _buildSelect('Mức độ', severity, [{'id':'LOW','name':'Thấp'},{'id':'MEDIUM','name':'Trung bình'},{'id':'HIGH','name':'Cao'}], (v) => setSt(() => severity = v!)),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy', style: TextStyle(color: _kSub))),
            ElevatedButton(
              onPressed: () async {
                if (msg.isNotEmpty && gid != null) {
                  final ok = await _lecturerService.sendAlert(gid!, msg, severity: severity);
                  if (ok) { Navigator.pop(ctx); _snack("Đã phát cảnh báo mới"); _loadInitialData(); }
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('Gửi cảnh báo'),
            )
          ],
        )
      )
    );
  }

  void _snack(String m, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(m), backgroundColor: isError ? Colors.red : _kTeal,
      behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))));
  }

  // ── Build ──────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      drawer: const LecturerDrawer(),
      appBar: AppTopHeader(
        title: 'Trung tâm Cảnh báo',
        user: AppUser(name: _currentUser?.fullName ?? 'Giảng viên', email: _currentUser?.email ?? '', role: 'LECTURER'),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: _kTeal))
        : RefreshIndicator(
            onRefresh: _loadInitialData,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                _buildBreadcrumb(),
                const SizedBox(height: 12),
                _buildHeader(),
                const SizedBox(height: 24),
                _buildStatsGrid(),
                const SizedBox(height: 24),
                _buildFilters(),
                const SizedBox(height: 24),
                _buildContentGrid(),
              ]),
            ),
          ),
    );
  }

  Widget _buildBreadcrumb() {
    return Row(children: [
      const Text('Giảng viên', style: TextStyle(fontSize: 11, color: _kTeal, fontWeight: FontWeight.bold)),
      const Icon(Icons.chevron_right, size: 14, color: _kSub),
      const Text('Cảnh báo', style: TextStyle(fontSize: 11, color: _kText, fontWeight: FontWeight.bold)),
    ]);
  }

  Widget _buildHeader() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('Trung tâm Cảnh báo', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: _kText)),
      const SizedBox(height: 4),
      const Text('Phát hiện và xử lý sớm các rủi ro về tiến độ và đóng góp.', style: TextStyle(fontSize: 13, color: _kSub)),
      const SizedBox(height: 16),
      Row(children: [
        Expanded(child: _headerBtn(Icons.refresh, 'Làm mới', _loadInitialData, isOutline: true)),
        const SizedBox(width: 12),
        Expanded(child: _headerBtn(Icons.add, 'Phát cảnh báo mới', _showSendAlertModal, isRed: true)),
      ]),
    ]);
  }

  Widget _headerBtn(IconData icon, String label, VoidCallback onTap, {bool isOutline = false, bool isRed = false}) {
    return ElevatedButton.icon(
      onPressed: onTap, icon: Icon(icon, size: 16), label: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
      style: ElevatedButton.styleFrom(
        elevation: 0,
        backgroundColor: isOutline ? Colors.white : (isRed ? Colors.redAccent : _kTeal),
        foregroundColor: isOutline ? _kText : Colors.white,
        side: isOutline ? const BorderSide(color: _kBorder) : null,
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }

  Widget _buildStatsGrid() {
    return LayoutBuilder(builder: (context, c) {
      final w = (c.maxWidth - 24) / 2;
      return Wrap(spacing: 12, runSpacing: 12, children: [
        _statCard('Chưa xử lý', _unresolvedCount, Icons.warning_amber_rounded, Colors.redAccent, w),
        _statCard('Nghiêm trọng', _highSeverityCount, Icons.shield_outlined, Colors.orange, w),
        _statCard('Đã xử lý', _resolvedCount, Icons.check_circle_outline, _kEmerald, w),
        _statCard('Mới (24h)', _newLast24hCount, Icons.access_time, Colors.blue, w),
        _statCard('Theo nhóm', _groupCount, Icons.people_outline, Colors.indigo, w),
        _statCard('Đã nhắc', _remindedIds.length, Icons.notifications_none, Colors.purple, w),
      ]);
    });
  }

  Widget _statCard(String lbl, dynamic val, IconData icon, Color color, double w) {
    return Container(
      width: w, padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)],
        border: Border.all(color: color.withOpacity(0.1)),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, size: 20, color: color),
        const SizedBox(height: 12),
        Text(val.toString(), style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: color)),
        Text(lbl, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color.withOpacity(0.8))),
      ]),
    );
  }

  Widget _buildFilters() {
    final filters = [
      {'id': 'all', 'label': 'Tất cả', 'color': _kTeal, 'icon': Icons.all_inbox_rounded},
      {'id': 'high', 'label': 'Nghiêm trọng', 'color': Colors.redAccent, 'icon': Icons.local_fire_department_rounded},
      {'id': 'medium', 'label': 'Trung bình', 'color': Colors.orange, 'icon': Icons.warning_amber_rounded},
      {'id': 'low', 'label': 'Nhẹ', 'color': Colors.blue, 'icon': Icons.info_outline_rounded},
      {'id': 'resolved', 'label': 'Đã xử lý', 'color': const Color(0xFF10B981), 'icon': Icons.check_circle_outline_rounded},
    ];

    return Column(
      children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Row(
            children: filters.map((f) {
              final id = f['id'] as String;
              final active = _filter == id;
              final color = f['color'] as Color;
              final count = _countFor(id);
              
              return GestureDetector(
                onTap: () => setState(() => _filter = id),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.only(right: 10),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: active ? color : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: active ? color : _kBorder, width: 1.2),
                    boxShadow: active ? [
                      BoxShadow(color: color.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))
                    ] : null,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(f['icon'] as IconData, size: 14, color: active ? Colors.white : color),
                      const SizedBox(width: 8),
                      Text(
                        f['label'] as String,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          color: active ? Colors.white : _kText,
                        ),
                      ),
                      if (count > 0) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: active ? Colors.white.withOpacity(0.2) : color.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            count.toString(),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: active ? Colors.white : color,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: _kBorder),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10)],
          ),
          child: TextField(
            onChanged: (v) => setState(() => _search = v),
            decoration: InputDecoration(
              hintText: 'Tìm kiếm theo tên nhóm hoặc nội dung...',
              hintStyle: const TextStyle(fontSize: 13, color: _kSub),
              prefixIcon: const Icon(Icons.search, size: 18, color: _kSub),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildContentGrid() {
    return Column(children: [
      _buildAlertList(),
      const SizedBox(height: 24),
      if (_selectedAlert != null) _buildRiskAnalysis(_selectedAlert!)
      else _buildEmptyAnalysis(),
    ]);
  }

  Widget _buildAlertList() {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(32), border: Border.all(color: _kBorder)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Padding(padding: EdgeInsets.all(24), child: Text('Danh sách cảnh báo', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900))),
        if (_filtered.isEmpty) 
          const Padding(padding: EdgeInsets.all(40), child: Center(child: Text('Không có cảnh báo nào', style: TextStyle(color: _kSub))))
        else ..._filtered.asMap().entries.map((e) => _alertItem(e.value, e.key == _filtered.length - 1)),
      ]),
    );
  }

  Widget _alertItem(Map<String, dynamic> a, bool isLast) {
    final selected = _selectedId == a['id'];
    final color = a['severity'] == 'HIGH' ? Colors.redAccent : (a['severity'] == 'MEDIUM' ? Colors.orange : Colors.blue);
    return InkWell(
      onTap: () => setState(() => _selectedId = a['id']),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: selected ? _kTeal.withOpacity(0.05) : Colors.transparent,
          border: isLast ? null : const Border(bottom: BorderSide(color: _kBg)),
        ),
        child: Row(children: [
          Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 16),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(a['targetName'], style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
            Text(a['message'], style: const TextStyle(color: _kSub, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
          ])),
          const Icon(Icons.chevron_right, size: 16, color: _kSub),
        ]),
      ),
    );
  }

  Widget _buildRiskAnalysis(Map<String, dynamic> a) {
    final reminded = _remindedIds.contains(a['id']);
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(32), border: Border.all(color: _kBorder)),
      child: Column(children: [
        Container(width: 80, height: 80, decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(28), border: Border.all(color: Colors.red[100]!)),
          child: const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 32)),
        const SizedBox(height: 16),
        Text(a['targetName'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
        Text(a['groupName'], style: const TextStyle(fontSize: 13, color: _kSub, fontWeight: FontWeight.bold)),
        const SizedBox(height: 24),
        Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: _kBg, borderRadius: BorderRadius.circular(24), border: Border.all(color: _kBorder)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('ĐỀ XUẤT XỬ LÝ', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: _kSub, letterSpacing: 1.2)),
            const SizedBox(height: 8),
            Text(a['suggestion'], style: const TextStyle(fontSize: 13, height: 1.5, color: _kText)),
          ])),
        const SizedBox(height: 16),
        Row(children: [
           Expanded(child: _miniMetric('Score', a['metrics']['score'].toString())),
           const SizedBox(width: 12),
           Expanded(child: _miniMetric('Thời điểm', a['createdAt'].toString().split(' ')[0])),
        ]),
        const SizedBox(height: 24),
        if (a['status'] == 'OPEN') ...[
          _actionBtn(reminded ? 'Đã nhắc qua mail' : 'Gửi mail thông báo', () => _handleRemind(a), isOutline: reminded),
          const SizedBox(height: 12),
          _actionBtn('Đã giải quyết rủi ro này', () => _handleResolve(a['id']), isTeal: true),
        ] else const Text('ĐÃ GIẢI QUYẾT', style: TextStyle(color: _kEmerald, fontWeight: FontWeight.w900, letterSpacing: 1.2)),
      ]),
    );
  }

  Widget _buildEmptyAnalysis() {
    return Container(
      width: double.infinity, padding: const EdgeInsets.all(60),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(32), border: Border.all(color: _kBorder)),
      child: const Center(child: Text('Vui lòng chọn cảnh báo để xem phân tích', style: TextStyle(color: _kSub, fontWeight: FontWeight.bold))),
    );
  }

  Widget _miniMetric(String lbl, String val) {
    return Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), border: Border.all(color: _kBorder)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(lbl, style: const TextStyle(fontSize: 9, color: _kSub, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(val, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
      ]));
  }

  Widget _actionBtn(String label, VoidCallback onTap, {bool isOutline = false, bool isTeal = false}) {
    return SizedBox(width: double.infinity, height: 54, 
      child: ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: isOutline ? Colors.white : (isTeal ? _kTeal : Colors.indigo),
          foregroundColor: isOutline ? _kSub : Colors.white,
          side: isOutline ? const BorderSide(color: _kBorder) : null,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        child: Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
      ));
  }

  Widget _buildSelect(String lbl, String? val, List<Map<String, String>> items, ValueChanged<String?> onChanged) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
       Text(lbl, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: _kSub)),
       const SizedBox(height: 8),
       DropdownButtonFormField<String>(
         value: val,
         items: items.map((i) => DropdownMenuItem(value: i['id'], child: Text(i['name']!))).toList(),
         onChanged: onChanged,
         decoration: InputDecoration(filled: true, fillColor: _kBg, border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none)),
       )
    ]);
  }
}
