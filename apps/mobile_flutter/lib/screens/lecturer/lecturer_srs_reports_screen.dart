import 'package:flutter/material.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/lecturer_navigation.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';
const _kT = Color(0xFF0F766E);
const _kBg = Color(0xFFF9FAFB);
const _kBd = Color(0xFFE5E7EB);
const _kTxt = Color(0xFF111827);
const _kSub = Color(0xFF6B7280);

// ── Status meta ──────────────────────────────────────────────
Map<String, dynamic> _statusMeta(String s) {
  switch (s) {
    case 'NOT_SUBMITTED': return {'label': 'Chưa nộp', 'dot': const Color(0xFF9CA3AF), 'bg': _kBg, 'border': _kBd, 'color': _kSub};
    case 'DRAFT':         return {'label': 'Draft', 'dot': const Color(0xFF94A3B8), 'bg': const Color(0xFFF1F5F9), 'border': const Color(0xFFCBD5E1), 'color': const Color(0xFF475569)};
    case 'SUBMITTED':     return {'label': 'Đã nộp', 'dot': const Color(0xFF0EA5E9), 'bg': const Color(0xFFF0F9FF), 'border': const Color(0xFFBAE6FD), 'color': const Color(0xFF0369A1)};
    case 'REVIEW':        return {'label': 'Đang review', 'dot': const Color(0xFF3B82F6), 'bg': const Color(0xFFEFF6FF), 'border': const Color(0xFFBFDBFE), 'color': const Color(0xFF1D4ED8)};
    case 'NEED_REVISION': return {'label': 'Cần chỉnh sửa', 'dot': const Color(0xFFF59E0B), 'bg': const Color(0xFFFFFBEB), 'border': const Color(0xFFFDE68A), 'color': const Color(0xFFB45309)};
    case 'APPROVED':      return {'label': 'Approved', 'dot': const Color(0xFF10B981), 'bg': const Color(0xFFECFDF5), 'border': const Color(0xFFA7F3D0), 'color': const Color(0xFF065F46)};
    case 'FINAL':         return {'label': 'Final', 'dot': const Color(0xFF22C55E), 'bg': const Color(0xFFF0FDF4), 'border': const Color(0xFFBBF7D0), 'color': const Color(0xFF16A34A)};
    case 'OVERDUE':       return {'label': 'Quá hạn', 'dot': const Color(0xFFEF4444), 'bg': const Color(0xFFFEF2F2), 'border': const Color(0xFFFECACA), 'color': const Color(0xFFDC2626)};
    default:              return {'label': s, 'dot': _kSub, 'bg': _kBg, 'border': _kBd, 'color': _kSub};
  }
}

Map<String, String> _checklistMeta(String t) {
  if (t == 'pass') return {'label': 'Đạt', 'bg': '0xFFECFDF5', 'border': '0xFFA7F3D0', 'color': '0xFF065F46'};
  if (t == 'warning') return {'label': 'Lưu ý', 'bg': '0xFFFFFBEB', 'border': '0xFFFDE68A', 'color': '0xFFB45309'};
  return {'label': 'Thiếu', 'bg': '0xFFFEF2F2', 'border': '0xFFFECACA', 'color': '0xFFDC2626'};
}

Color _scoreColor(double s) {
  if (s >= 8.5) return const Color(0xFF16A34A);
  if (s >= 7)   return const Color(0xFF2563EB);
  if (s > 0)    return const Color(0xFFB45309);
  return _kSub;
}

// ── Mock data ────────────────────────────────────────────────
final _mockData = <Map<String, dynamic>>[];

// ── Screen ───────────────────────────────────────────────────
class LecturerSrsReportsScreen extends StatefulWidget {
  const LecturerSrsReportsScreen({super.key});
  @override
  State<LecturerSrsReportsScreen> createState() => _LecturerSrsReportsScreenState();
}

class _LecturerSrsReportsScreenState extends State<LecturerSrsReportsScreen> {
  late List<Map<String, dynamic>> _srsList;
  String? _selected;
  String _search = '';
  String _statusFilter = 'all';
  String _courseFilter = 'all';
  String _milestoneFilter = 'all';
  String _sortBy = 'latest';
  String _feedbackText = '';

  final AuthService _authService = AuthService();
  User? _currentUser;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _srsList = _mockData.map((e) => Map<String, dynamic>.from(e)).toList();
    if (_srsList.isNotEmpty) _selected = _srsList.first['id'] as String;
    _feedbackText = _srsList.isNotEmpty ? ((_srsList.first['feedback'] as String?) ?? '') : '';
    
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

  // Computed
  List<String> get _milestones => _srsList.map((x) => x['milestone'] as String).toSet().toList();

  Map<String, int> get _stats {
    final submitted = _srsList.where((x) => ['SUBMITTED','REVIEW','NEED_REVISION','APPROVED','FINAL','OVERDUE'].contains(x['status'])).length;
    return {
      'totalGroups': _srsList.length,
      'submitted': submitted,
      'review': _srsList.where((x) => x['status'] == 'REVIEW').length,
      'revision': _srsList.where((x) => x['status'] == 'NEED_REVISION').length,
      'final_': _srsList.where((x) => x['status'] == 'FINAL').length,
      'overdue': _srsList.where((x) => x['status'] == 'OVERDUE').length,
    };
  }

  List<Map<String, dynamic>> get _filtered {
    var data = List<Map<String, dynamic>>.from(_srsList);
    if (_statusFilter != 'all') data = data.where((x) => x['status'] == _statusFilter).toList();
    if (_courseFilter != 'all') data = data.where((x) => x['courseCode'] == _courseFilter).toList();
    if (_milestoneFilter != 'all') data = data.where((x) => x['milestone'] == _milestoneFilter).toList();
    if (_search.trim().isNotEmpty) {
      final q = _search.toLowerCase();
      data = data.where((x) =>
        (x['teamName'] as String).toLowerCase().contains(q) ||
        (x['projectName'] as String).toLowerCase().contains(q) ||
        (x['courseCode'] as String).toLowerCase().contains(q) ||
        (x['leader'] as String).toLowerCase().contains(q)).toList();
    }
    data.sort((a, b) {
      if (_sortBy == 'score') return ((b['score'] as double) - (a['score'] as double)).sign.toInt();
      if (_sortBy == 'coverage') return ((b['githubCoverage'] as int) - (a['githubCoverage'] as int));
      return (b['updatedAt'] as String).compareTo(a['updatedAt'] as String);
    });
    return data;
  }

  Map<String, dynamic>? get _selectedSrs =>
      _selected == null ? null : _srsList.cast<Map<String,dynamic>?>().firstWhere((x) => x!['id'] == _selected, orElse: () => null);

  void _handleStatusUpdate(String id, String newStatus) {
    setState(() {
      final i = _srsList.indexWhere((x) => x['id'] == id);
      if (i >= 0) {
        _srsList[i] = {..._srsList[i], 'status': newStatus, 'feedback': _feedbackText, 'updatedAt': DateTime.now().toString().substring(0, 16)};
      }
    });
    _snack('Đã cập nhật trạng thái sang "${_statusMeta(newStatus)['label']}"');
  }

  void _handleSaveFeedback() {
    if (_selected == null) return;
    setState(() {
      final i = _srsList.indexWhere((x) => x['id'] == _selected);
      if (i >= 0) {
        _srsList[i] = {..._srsList[i], 'feedback': _feedbackText, 'commentsCount': (_srsList[i]['commentsCount'] as int) + 1};
      }
    });
    _snack('Đã lưu nhận xét');
  }

  void _snack(String msg) => ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(msg), backgroundColor: _kT, behavior: SnackBarBehavior.floating));

  @override
  Widget build(BuildContext context) {
    final st = _stats;
    return Scaffold(
      backgroundColor: Colors.white,
      drawer: const LecturerDrawer(),
      appBar: AppTopHeader(
        title: 'SRS Reports',
        user: AppUser(
          name: _currentUser?.fullName ?? 'Giảng viên',
          email: _currentUser?.email ?? '',
          role: 'LECTURER'
        )
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: _kT))
        : SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Breadcrumb
          Row(children: const [
            Text('Giảng viên', style: TextStyle(fontSize: 11, color: _kT, fontWeight: FontWeight.w600)),
            Icon(Icons.chevron_right_rounded, size: 14, color: _kSub),
            Text('SRS Reports', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _kTxt)),
          ]),
          const SizedBox(height: 10),
          // Header
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('SRS Reports', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _kTxt)),
              SizedBox(height: 3),
              Text('Quản lý, review và theo dõi tiến độ tài liệu đặc tả yêu cầu phần mềm theo nhóm / project',
                style: TextStyle(fontSize: 12, color: _kSub)),
            ])),
            const SizedBox(width: 10),
            Column(children: [
              _outlineBtn(Icons.download_rounded, 'Export', () => _snack('Mock export báo cáo thành công')),
              const SizedBox(height: 6),
              _solidBtn(Icons.message_outlined, 'Nhắc nhóm trễ hạn', () => _snack('Đã gửi nhắc nhở cho các nhóm overdue')),
            ]),
          ]),
          const SizedBox(height: 14),
          // Stats grid
          GridView.builder(
            shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 2.3),
            itemCount: 6,
            itemBuilder: (_, i) {
              final items = [
                {'label':'Tổng nhóm', 'value':'${st['totalGroups']}', 'icon':Icons.people_outline, 'bg':Colors.white, 'border':_kBd, 'color':_kTxt},
                {'label':'Đã nộp', 'value':'${st['submitted']}', 'icon':Icons.upload_outlined, 'bg':const Color(0xFFF0F9FF), 'border':const Color(0xFFBAE6FD), 'color':const Color(0xFF0369A1)},
                {'label':'Đang review', 'value':'${st['review']}', 'icon':Icons.remove_red_eye_outlined, 'bg':const Color(0xFFEFF6FF), 'border':const Color(0xFFBFDBFE), 'color':const Color(0xFF1D4ED8)},
                {'label':'Cần chỉnh sửa', 'value':'${st['revision']}', 'icon':Icons.refresh_rounded, 'bg':const Color(0xFFFFFBEB), 'border':const Color(0xFFFDE68A), 'color':const Color(0xFFB45309)},
                {'label':'Final', 'value':'${st['final_']}', 'icon':Icons.check_circle_outline, 'bg':const Color(0xFFF0FDF4), 'border':const Color(0xFFBBF7D0), 'color':const Color(0xFF16A34A)},
                {'label':'Quá hạn', 'value':'${st['overdue']}', 'icon':Icons.warning_amber_rounded, 'bg':const Color(0xFFFEF2F2), 'border':const Color(0xFFFECACA), 'color':const Color(0xFFDC2626)},
              ];
              final s = items[i];
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(color: s['bg'] as Color, border: Border.all(color: s['border'] as Color), borderRadius: BorderRadius.circular(14),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 4)]),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text(s['label'] as String, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: s['color'] as Color)),
                    Icon(s['icon'] as IconData, size: 14, color: s['color'] as Color),
                  ]),
                  const SizedBox(height: 4),
                  Text(s['value'] as String, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: s['color'] as Color)),
                ]),
              );
            }),
      
          const SizedBox(height: 14),
          // Filter bar
          _buildFilterBar(),
          const SizedBox(height: 14),
          // SRS List
          _buildSrsList(),
          const SizedBox(height: 14),
          // Bottom insights
          _buildInsights(),
          const SizedBox(height: 14),
          // Detail panel
          if (_selectedSrs != null) _buildDetailPanel(_selectedSrs!),
        ]),
      ),
    );
  }

  Widget _buildFilterBar() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: _card(),
      child: Column(children: [
        TextField(
          onChanged: (v) => setState(() => _search = v),
          style: const TextStyle(fontSize: 13),
          decoration: InputDecoration(
            hintText: 'Tìm theo nhóm, project, leader, course...',
            hintStyle: const TextStyle(fontSize: 12, color: _kSub),
            prefixIcon: const Icon(Icons.search_rounded, size: 16, color: _kSub),
            filled: true, fillColor: _kBg,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kBd)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kBd)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kT, width: 1.5))),
        ),
        const SizedBox(height: 10),
        Row(children: [
          Expanded(child: _buildDropdown({'all':'Tất cả môn','SWD392':'SWD392','PRU211':'PRU211'}, _courseFilter, (v) => setState(() => _courseFilter = v!))),
          const SizedBox(width: 8),
          Expanded(child: _buildDropdown({for (var m in _milestones) m:m, 'all':'Tất cả milestone'}, _milestoneFilter, (v) => setState(() => _milestoneFilter = v!))),
        ]),
        const SizedBox(height: 8),
        Row(children: [
          Expanded(child: _buildDropdown({'latest':'Mới cập nhật','deadline':'Sắp đến hạn','score':'Điểm review','coverage':'GitHub coverage'}, _sortBy, (v) => setState(() => _sortBy = v!))),
          const SizedBox(width: 8),
          Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(color: const Color(0xFFF0FDFA), border: Border.all(color: const Color(0xFF99F6E4), style: BorderStyle.solid), borderRadius: BorderRadius.circular(10)),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.filter_list_rounded, size: 14, color: _kT),
              const SizedBox(width: 5),
              Text('${_filtered.length} bản ghi', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _kT)),
            ])),
        ]),
        const SizedBox(height: 10),
        SingleChildScrollView(scrollDirection: Axis.horizontal,
          child: Row(children: [
            for (final f in [{'key':'all','label':'Tất cả'},{'key':'FINAL','label':'Final'},{'key':'REVIEW','label':'Review'},{'key':'SUBMITTED','label':'Submitted'},{'key':'NEED_REVISION','label':'Need Revision'},{'key':'DRAFT','label':'Draft'},{'key':'OVERDUE','label':'Overdue'}])
              Padding(padding: const EdgeInsets.only(right: 6),
                child: GestureDetector(onTap: () => setState(() => _statusFilter = f['key']!),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: _statusFilter == f['key'] ? _kT : Colors.white,
                      border: Border.all(color: _statusFilter == f['key'] ? _kT : _kBd), borderRadius: BorderRadius.circular(20)),
                    child: Text(f['label']!, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _statusFilter == f['key'] ? Colors.white : _kSub))))),
          ])),
      ]),
    );
  }

  Widget _buildDropdown(Map<String, String> items, String value, ValueChanged<String?> onChanged) {
    return DropdownButtonFormField<String>(
      value: items.containsKey(value) ? value : items.keys.first,
      onChanged: onChanged, isExpanded: true,
      decoration: InputDecoration(filled: true, fillColor: _kBg, contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _kBd)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _kBd))),
      items: items.entries.map((e) => DropdownMenuItem(value: e.key, child: Text(e.value, style: const TextStyle(fontSize: 12)))).toList(),
    );
  }

  Widget _buildSrsList() {
    return Container(
      decoration: _card(),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: const BoxDecoration(color: Color(0xFFF9FAFB), borderRadius: BorderRadius.vertical(top: Radius.circular(18))),
          child: Row(children: const [
            Expanded(flex: 4, child: Text('Nhóm / Project', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: _kSub, letterSpacing: 0.8))),
            SizedBox(width: 8),
            Text('Ver', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: _kSub, letterSpacing: 0.8)),
            SizedBox(width: 8),
            Expanded(flex: 2, child: Text('Trạng thái', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: _kSub, letterSpacing: 0.8))),
          ])),
        _filtered.isEmpty
          ? const Padding(padding: EdgeInsets.symmetric(vertical: 40),
              child: Center(child: Column(children: [
                Icon(Icons.description_outlined, size: 30, color: Color(0xFFD1D5DB)),
                SizedBox(height: 10),
                Text('Không có SRS nào khớp bộ lọc hiện tại', style: TextStyle(fontSize: 12, color: _kSub)),
              ])))
          : Column(children: _filtered.asMap().entries.map((e) => _buildSrsRow(e.value, e.key == _filtered.length - 1)).toList()),
      ]),
    );
  }

  Widget _buildSrsRow(Map<String, dynamic> item, bool isLast) {
    final sm = _statusMeta(item['status'] as String);
    final isSelected = _selected == item['id'];
    final score = item['score'] as double;

    return GestureDetector(
      onTap: () => setState(() {
        _selected = item['id'] as String;
        _feedbackText = (item['feedback'] as String?) ?? '';
      }),
      child: Container(
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF0FDFA) : Colors.white,
          border: isLast ? null : const Border(bottom: BorderSide(color: Color(0xFFF3F4F6)))),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(width: 36, height: 36, decoration: BoxDecoration(color: const Color(0xFFF0FDFA), borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.description_outlined, size: 16, color: _kT)),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(item['teamName'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _kTxt), maxLines: 1, overflow: TextOverflow.ellipsis),
              Text(item['projectName'] as String, style: const TextStyle(fontSize: 10, color: _kSub), maxLines: 1, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 4),
              Row(children: [
                _pill(item['courseCode'] as String, _kBg, _kBd, _kSub),
                const SizedBox(width: 5),
                _pill(item['milestone'] as String, const Color(0xFFEEF2FF), const Color(0xFFC7D2FE), const Color(0xFF6366F1)),
              ]),
            ])),
            const SizedBox(width: 8),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text(item['version'] as String, style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: _kTxt)),
              const SizedBox(height: 5),
              _statusChip(item['status'] as String),
              const SizedBox(height: 5),
              Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(color: _scoreColor(score).withOpacity(0.1), border: Border.all(color: _scoreColor(score).withOpacity(0.3)), borderRadius: BorderRadius.circular(6)),
                child: Text(score > 0 ? score.toStringAsFixed(1) : '—', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: _scoreColor(score)))),
            ]),
          ]),
          const SizedBox(height: 8),
          Row(children: [
            _actionBtn(Icons.remove_red_eye_outlined, 'Xem', Colors.white, _kBd, _kSub, () => setState(() {
              _selected = item['id'] as String;
              _feedbackText = (item['feedback'] as String?) ?? '';
            })),
            if (['SUBMITTED','REVIEW'].contains(item['status'])) ...[
              const SizedBox(width: 6),
              _actionBtn(Icons.check_circle_outline, 'Final', const Color(0xFFF0FDF4), const Color(0xFFBBF7D0), const Color(0xFF16A34A),
                () => _handleStatusUpdate(item['id'] as String, 'FINAL')),
            ],
            if (['OVERDUE','NEED_REVISION'].contains(item['status'])) ...[
              const SizedBox(width: 6),
              _actionBtn(Icons.chat_bubble_outline, 'Nhắc', const Color(0xFFFFFBEB), const Color(0xFFFDE68A), const Color(0xFFB45309),
                () => _snack('Đã gửi nhắc nhở cho ${item['teamName']}')),
            ],
          ]),
        ]),
      ),
    );
  }

  Widget _buildInsights() {
    final overdue = _srsList.where((x) => ['OVERDUE','NEED_REVISION'].contains(x['status'])).take(3).toList();
    final lowJira = (List<Map<String,dynamic>>.from(_srsList)..sort((a,b) => (a['jiraMapped'] as int) - (b['jiraMapped'] as int))).take(3).toList();
    final topGithub = (List<Map<String,dynamic>>.from(_srsList)..sort((a,b) => (b['githubCoverage'] as int) - (a['githubCoverage'] as int))).take(3).toList();

    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Expanded(child: _insightCard('Cảnh báo', overdue, (x) => x['status'] == 'OVERDUE' ? 'Đã quá hạn nộp hoặc resubmit' : 'Cần chỉnh sửa và nộp lại', const Color(0xFFFEF2F2), const Color(0xFFFECACA), const Color(0xFFDC2626))),
      const SizedBox(width: 8),
      Expanded(child: _insightCard('Jira coverage thấp', lowJira, (x) => 'Mapped Jira: ${x['jiraMapped']} issues', const Color(0xFFFFFBEB), const Color(0xFFFDE68A), const Color(0xFFB45309))),
      const SizedBox(width: 8),
      Expanded(child: _insightCard('GitHub coverage tốt', topGithub, (x) => 'Coverage: ${x['githubCoverage']}%', const Color(0xFFF0FDF4), const Color(0xFFBBF7D0), const Color(0xFF16A34A))),
    ]);
  }

  Widget _insightCard(String title, List<Map<String,dynamic>> items, String Function(Map<String,dynamic>) sub, Color bg, Color border, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: _card(),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _kTxt)),
        const SizedBox(height: 10),
        ...items.map((x) => Padding(padding: const EdgeInsets.only(bottom: 6),
          child: Container(padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: bg, border: Border.all(color: border), borderRadius: BorderRadius.circular(10)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(x['teamName'] as String, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _kTxt)),
              const SizedBox(height: 2),
              Text(sub(x), style: TextStyle(fontSize: 10, color: color)),
            ])))),
      ]),
    );
  }

  Widget _buildDetailPanel(Map<String, dynamic> s) {
    final checklist = s['checklist'] as Map<String, dynamic>;
    final history = (s['history'] as List).cast<Map<String, dynamic>>();
    final notes = (s['notes'] as List).cast<String>();
    final sm = _statusMeta(s['status'] as String);

    return Container(
      decoration: _card(),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 12), child: Row(children: [
          Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.description_outlined, size: 18, color: Color(0xFF6366F1))),
          const SizedBox(width: 10),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
            Text('Chi tiết SRS', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: _kTxt)),
            Text('Xem, review và cập nhật trạng thái tài liệu', style: TextStyle(fontSize: 10, color: _kSub)),
          ]),
        ])),
        const Divider(height: 1, color: Color(0xFFF3F4F6)),
        Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Top info
          Container(padding: const EdgeInsets.all(14), decoration: BoxDecoration(color: _kBg, border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(14)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(s['teamName'] as String, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _kTxt)),
                const SizedBox(height: 3),
                Text(s['projectName'] as String, style: const TextStyle(fontSize: 12, color: _kSub)),
              ])),
              _statusChip(s['status'] as String),
            ]),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: _detailBox('Version', s['version'] as String)),
              const SizedBox(width: 8),
              Expanded(child: _detailBox('Điểm review', (s['score'] as double) > 0 ? (s['score'] as double).toStringAsFixed(1) : 'Chưa chấm')),
            ]),
          ])),
          const SizedBox(height: 12),
          // Meta
          Row(children: [
            Expanded(child: Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(12)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Row(children: [Icon(Icons.people_outline, size: 14, color: _kT), SizedBox(width: 5), Text('LEADER', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: _kSub, letterSpacing: 1))]),
              const SizedBox(height: 5),
              Text(s['leader'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _kTxt)),
              Text('${(s['members'] as List).length} thành viên', style: const TextStyle(fontSize: 10, color: _kSub)),
            ]))),
            const SizedBox(width: 8),
            Expanded(child: Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(12)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Row(children: [Icon(Icons.calendar_today_outlined, size: 14, color: Color(0xFF6366F1)), SizedBox(width: 5), Text('DEADLINE', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: _kSub, letterSpacing: 1))]),
              const SizedBox(height: 5),
              Text(s['deadline'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _kTxt)),
              Text('Cập nhật: ${s['updatedAt']}', style: const TextStyle(fontSize: 10, color: _kSub)),
            ]))),
          ]),
          const SizedBox(height: 12),
          // Links
          Row(children: [
            Expanded(child: _linkBox(Icons.folder_outlined, _kT, 'Jira Board', '${s['jiraMapped']} issues từ SRS', const Color(0xFFF0FDFA), const Color(0xFF99F6E4))),
            const SizedBox(width: 8),
            Expanded(child: _linkBox(Icons.code_rounded, const Color(0xFF6366F1), 'GitHub Repo', 'Coverage: ${s['githubCoverage']}%', const Color(0xFFEEF2FF), const Color(0xFFC7D2FE))),
          ]),
          const SizedBox(height: 12),
          // Summary
          Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(12)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('TÓM TẮT TÀI LIỆU', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: _kSub, letterSpacing: 1)),
            const SizedBox(height: 6),
            Text(s['summary'] as String, style: const TextStyle(fontSize: 12, color: _kTxt, height: 1.5)),
            if (notes.isNotEmpty) ...[
              const SizedBox(height: 8),
              ...notes.map((note) => Container(margin: const EdgeInsets.only(top: 5), padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(color: const Color(0xFFFFFBEB), border: Border.all(color: const Color(0xFFFDE68A)), borderRadius: BorderRadius.circular(8)),
                child: Text(note, style: const TextStyle(fontSize: 11, color: Color(0xFF92400E))))),
            ],
          ])),
          const SizedBox(height: 12),
          // Checklist
          Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(12)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Row(children: [Icon(Icons.shield_outlined, size: 14, color: Color(0xFFF59E0B)), SizedBox(width: 6), Text('Review checklist', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _kTxt))]),
            const SizedBox(height: 10),
            ...[['Giới thiệu & phạm vi','introduction'],['Stakeholders / actors','stakeholders'],['Functional requirements','functional'],['Non-functional requirements','nonFunctional'],['Use cases / flows','useCases'],['Consistency với Jira/GitHub','consistency']].map((item) {
              final cm = _checklistMeta(checklist[item[1]] as String? ?? 'fail');
              final bg = Color(int.parse(cm['bg']!));
              final border = Color(int.parse(cm['border']!));
              final color = Color(int.parse(cm['color']!));
              return Padding(padding: const EdgeInsets.only(bottom: 6),
                child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Expanded(child: Text(item[0], style: const TextStyle(fontSize: 12, color: _kTxt))),
                  Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: bg, border: Border.all(color: border), borderRadius: BorderRadius.circular(20)),
                    child: Text(cm['label']!, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: color))),
                ]));
            }),
          ])),
          const SizedBox(height: 12),
          // Version history
          Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(12)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Row(children: [Icon(Icons.access_time_rounded, size: 14, color: Color(0xFF0EA5E9)), SizedBox(width: 6), Text('Lịch sử version', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _kTxt))]),
            const SizedBox(height: 10),
            ...history.map((h) => Padding(padding: const EdgeInsets.only(bottom: 6),
              child: Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(color: _kBg, border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(10)),
                child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(h['version'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _kTxt)),
                    Text(h['author'] as String, style: const TextStyle(fontSize: 10, color: _kSub)),
                  ]),
                  Text(h['date'] as String, style: const TextStyle(fontSize: 10, color: _kSub)),
                ])))),
          ])),
          const SizedBox(height: 12),
          // Review form
          Container(padding: const EdgeInsets.all(14), decoration: BoxDecoration(color: const Color(0xFFF0FDFA), border: Border.all(color: const Color(0xFF99F6E4)), borderRadius: BorderRadius.circular(14)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Row(children: [Icon(Icons.message_outlined, size: 14, color: _kT), SizedBox(width: 6), Text('Chấm bài & nhận xét', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _kTxt))]),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: _detailBox('Reviewer', s['reviewer'] as String)),
              const SizedBox(width: 8),
              Expanded(child: _detailBox('Submitted', s['submittedAt'] as String)),
              const SizedBox(width: 8),
              Expanded(child: _detailBox('Feedbacks', '${s['commentsCount']}')),
            ]),
            const SizedBox(height: 10),
            TextField(
              controller: TextEditingController(text: _feedbackText),
              onChanged: (v) => _feedbackText = v,
              maxLines: 4, style: const TextStyle(fontSize: 12),
              decoration: InputDecoration(hintText: 'Nhập nội dung phản hồi cho nhóm...', hintStyle: const TextStyle(fontSize: 12, color: _kSub),
                filled: true, fillColor: Colors.white,
                contentPadding: const EdgeInsets.all(12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kBd)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kBd)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kT, width: 1.5))),
            ),
            const SizedBox(height: 10),
            GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 4,
              children: [
                _reviewBtn(Icons.check_circle_outline, 'Duyệt Final', const Color(0xFF16A34A), true, () => _handleStatusUpdate(s['id'] as String, 'FINAL')),
                _reviewBtn(Icons.refresh_rounded, 'Yêu cầu sửa', const Color(0xFFB45309), false, () => _handleStatusUpdate(s['id'] as String, 'NEED_REVISION')),
                _reviewBtn(Icons.remove_red_eye_outlined, 'Chuyển review', const Color(0xFF2563EB), false, () => _handleStatusUpdate(s['id'] as String, 'REVIEW')),
                _reviewBtn(Icons.message_outlined, 'Chỉ lưu nhận xét', _kSub, false, _handleSaveFeedback),
                _reviewBtn(Icons.warning_amber_rounded, 'Đánh dấu quá hạn', const Color(0xFFDC2626), false, () => _handleStatusUpdate(s['id'] as String, 'OVERDUE')),
                _reviewBtn(Icons.send_outlined, 'Gửi thông báo nhóm', _kT, false, () => _snack('Đã gửi thông báo cho ${s['teamName']}')),
              ]),
          ])),
          const SizedBox(height: 12),
          // File actions
          Row(children: [
            Expanded(child: _outlineBtn(Icons.open_in_new_rounded, 'Xem file SRS', () => _snack('Mở file SRS...'))),
            const SizedBox(width: 8),
            _outlineBtn(Icons.download_rounded, '', () => _snack('Tải xuống file của ${s['teamName']}')),
          ]),
        ])),
      ]),
    );
  }

  Widget _detailBox(String label, String value) => Container(
    padding: const EdgeInsets.all(10),
    decoration: BoxDecoration(color: Colors.white, border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(10)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label.toUpperCase(), style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: _kSub, letterSpacing: 0.8)),
      const SizedBox(height: 3),
      Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _kTxt)),
    ]));

  Widget _linkBox(IconData icon, Color iconColor, String title, String sub, Color bg, Color border) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(color: bg, border: Border.all(color: border), borderRadius: BorderRadius.circular(12)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [Icon(icon, size: 14, color: iconColor), const SizedBox(width: 6), Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _kTxt)), const Spacer(), const Icon(Icons.open_in_new_rounded, size: 12, color: _kSub)]),
      const SizedBox(height: 4),
      Text(sub, style: TextStyle(fontSize: 10, color: iconColor)),
    ]));

  Widget _reviewBtn(IconData icon, String label, Color color, bool solid, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(
      decoration: BoxDecoration(color: solid ? color : Colors.white, border: Border.all(color: color.withOpacity(0.3)), borderRadius: BorderRadius.circular(10)),
      child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(icon, size: 12, color: solid ? Colors.white : color), const SizedBox(width: 5),
        Flexible(child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: solid ? Colors.white : color), overflow: TextOverflow.ellipsis)),
      ])));

  Widget _statusChip(String status) {
    final sm = _statusMeta(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: sm['bg'] as Color, border: Border.all(color: sm['border'] as Color), borderRadius: BorderRadius.circular(20)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 6, height: 6, decoration: BoxDecoration(color: sm['dot'] as Color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text((sm['label'] as String).toUpperCase(), style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: sm['color'] as Color, letterSpacing: 0.5)),
      ]));
  }

  Widget _pill(String text, Color bg, Color border, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
    decoration: BoxDecoration(color: bg, border: Border.all(color: border), borderRadius: BorderRadius.circular(20)),
    child: Text(text, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: color)));

  Widget _actionBtn(IconData icon, String label, Color bg, Color border, Color color, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(color: bg, border: Border.all(color: border), borderRadius: BorderRadius.circular(8)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 11, color: color), const SizedBox(width: 4),
        Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color)),
      ])));

  Widget _outlineBtn(IconData icon, String label, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(10)),
      child: Row(mainAxisSize: MainAxisSize.min, mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(icon, size: 13, color: _kSub),
        if (label.isNotEmpty) ...[const SizedBox(width: 5), Text(label, style: const TextStyle(fontSize: 12, color: _kSub))],
      ])));

  Widget _solidBtn(IconData icon, String label, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(color: _kT, borderRadius: BorderRadius.circular(10)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 13, color: Colors.white), const SizedBox(width: 5),
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
      ])));

  BoxDecoration _card() => BoxDecoration(color: Colors.white, border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(18),
    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]);
}
