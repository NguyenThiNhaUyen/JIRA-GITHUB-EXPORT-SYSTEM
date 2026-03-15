import 'package:flutter/material.dart';
import '../../widgets/app_top_header.dart';

// ── Constants ────────────────────────────────────────────────
const _kTeal = Color(0xFF0F766E);
const _kBg = Color(0xFFF9FAFB);
const _kBorder = Color(0xFFE5E7EB);
const _kText = Color(0xFF111827);
const _kSub = Color(0xFF6B7280);

// ── Mock Data ────────────────────────────────────────────────
const _typeLabel = {
  'NO_COMMIT': 'Chưa commit',
  'LOW_BALANCE': 'Mất cân bằng đóng góp',
  'OVERDUE_TASKS': 'Task quá hạn',
  'LOW_ACTIVITY': 'Ít hoạt động',
  'INACTIVE_MEMBER': 'Thành viên ít hoạt động',
  'JIRA_GITHUB_MISMATCH': 'Lệch Jira/GitHub',
};

const _mockAlerts = [
  {
    'id': 'mock-1', 'groupName': 'Team Alpha', 'courseCode': 'SWD392-SE1801',
    'severity': 'HIGH', 'status': 'OPEN', 'type': 'NO_COMMIT',
    'targetType': 'student', 'targetName': 'Nguyễn Minh Anh',
    'message': 'Sinh viên chưa có commit trong 10 ngày gần đây. Hệ thống ghi nhận mức tham gia rất thấp so với tiến độ chung của nhóm.',
    'createdAt': '2026-03-11T08:10:00',
    'lastActivityAt': '2026-03-01T19:20:00',
    'metrics': {'commits': 0, 'jiraDone': 1, 'overdueTasks': 3, 'score': 18, 'balance': 41},
    'suggestion': 'Ưu tiên liên hệ trực tiếp sinh viên để xác minh tình trạng tham gia và phân chia lại công việc nếu cần.',
  },
  {
    'id': 'mock-2', 'groupName': 'Team Alpha', 'courseCode': 'SWD392-SE1801',
    'severity': 'MEDIUM', 'status': 'OPEN', 'type': 'LOW_BALANCE',
    'targetType': 'group', 'targetName': 'Team Alpha',
    'message': 'Nhóm có dấu hiệu mất cân bằng đóng góp. Một thành viên đang gánh phần lớn commit và task hoàn thành.',
    'createdAt': '2026-03-10T21:30:00',
    'lastActivityAt': '2026-03-10T20:40:00',
    'metrics': {'commits': 18, 'jiraDone': 13, 'overdueTasks': 1, 'score': 76, 'balance': 41},
    'suggestion': 'Kiểm tra lại cách phân chia task của nhóm và yêu cầu các thành viên còn lại cập nhật đóng góp cụ thể.',
  },
  {
    'id': 'mock-3', 'groupName': 'Team Gamma', 'courseCode': 'SWD392-SE1801',
    'severity': 'HIGH', 'status': 'OPEN', 'type': 'OVERDUE_TASKS',
    'targetType': 'student', 'targetName': 'Mai Ngọc Hân',
    'message': 'Sinh viên đang có nhiều task Jira quá hạn và chưa phản hồi cập nhật tiến độ trong giai đoạn gần đây.',
    'createdAt': '2026-03-10T18:00:00',
    'lastActivityAt': '2026-03-04T14:00:00',
    'metrics': {'commits': 2, 'jiraDone': 2, 'overdueTasks': 4, 'score': 26, 'balance': 50},
    'suggestion': 'Nên nhắc nhở ngay và yêu cầu cập nhật trạng thái task Jira trước buổi review tiếp theo.',
  },
  {
    'id': 'mock-4', 'groupName': 'Team Beta', 'courseCode': 'SWD392-SE1801',
    'severity': 'LOW', 'status': 'OPEN', 'type': 'LOW_ACTIVITY',
    'targetType': 'group', 'targetName': 'Team Beta',
    'message': 'Tổng hoạt động GitHub của nhóm giảm rõ rệt trong tuần này so với nhịp bình thường.',
    'createdAt': '2026-03-09T16:15:00',
    'lastActivityAt': '2026-03-09T13:00:00',
    'metrics': {'commits': 8, 'jiraDone': 6, 'overdueTasks': 0, 'score': 63, 'balance': 68},
    'suggestion': 'Theo dõi thêm trong 2-3 ngày tới trước khi escalates thành cảnh báo nghiêm trọng hơn.',
  },
  {
    'id': 'mock-5', 'groupName': 'Vision Crew', 'courseCode': 'EXE101-SE1802',
    'severity': 'MEDIUM', 'status': 'RESOLVED', 'type': 'INACTIVE_MEMBER',
    'targetType': 'student', 'targetName': 'Lê Anh Tú',
    'message': 'Sinh viên từng ít hoạt động trong 7 ngày, đã được giảng viên nhắc nhở và nhóm xác nhận đã quay lại tiến độ.',
    'createdAt': '2026-03-08T10:00:00',
    'lastActivityAt': '2026-03-10T09:30:00',
    'metrics': {'commits': 5, 'jiraDone': 4, 'overdueTasks': 0, 'score': 52, 'balance': 59},
    'suggestion': 'Tiếp tục quan sát trong sprint hiện tại để đảm bảo mức tham gia đã ổn định.',
  },
  {
    'id': 'mock-6', 'groupName': 'Startup Sparks', 'courseCode': 'EXE101-SE1802',
    'severity': 'MEDIUM', 'status': 'OPEN', 'type': 'JIRA_GITHUB_MISMATCH',
    'targetType': 'group', 'targetName': 'Startup Sparks',
    'message': 'Số task Jira hoàn thành cao nhưng output GitHub thấp hơn đáng kể. Cần kiểm tra chất lượng cập nhật task.',
    'createdAt': '2026-03-11T07:45:00',
    'lastActivityAt': '2026-03-11T07:20:00',
    'metrics': {'commits': 4, 'jiraDone': 12, 'overdueTasks': 1, 'score': 47, 'balance': 55},
    'suggestion': 'Đối chiếu issue Jira với commit hoặc pull request tương ứng để xác nhận tiến độ thật.',
  },
];

// ── Severity helpers ─────────────────────────────────────────
Map<String, dynamic> _sevMeta(String sev) {
  switch (sev) {
    case 'HIGH': return {'label': 'Nghiêm trọng', 'dot': const Color(0xFFEF4444), 'badge': [const Color(0xFFFEF2F2), const Color(0xFFB91C1C), const Color(0xFFFECACA)], 'card': [const Color(0xFFFEF2F2), const Color(0xFFFECACA)]};
    case 'LOW':  return {'label': 'Nhẹ', 'dot': const Color(0xFF3B82F6), 'badge': [const Color(0xFFEFF6FF), const Color(0xFF1D4ED8), const Color(0xFFBFDBFE)], 'card': [const Color(0xFFEFF6FF), const Color(0xFFBFDBFE)]};
    default:     return {'label': 'Trung bình', 'dot': const Color(0xFFF59E0B), 'badge': [const Color(0xFFFFFBEB), const Color(0xFFB45309), const Color(0xFFFDE68A)], 'card': [const Color(0xFFFFFBEB), const Color(0xFFFDE68A)]};
  }
}

bool _within24h(String? dt) {
  if (dt == null) return false;
  try {
    final d = DateTime.parse(dt);
    return DateTime.now().difference(d).inHours <= 24;
  } catch (_) { return false; }
}

// ── Screen ───────────────────────────────────────────────────
class LecturerAlertsScreen extends StatefulWidget {
  const LecturerAlertsScreen({super.key});
  @override
  State<LecturerAlertsScreen> createState() => _LecturerAlertsScreenState();
}

class _LecturerAlertsScreenState extends State<LecturerAlertsScreen> {
  String _filter = 'all';
  String _search = '';
  final Set<String> _remindedIds = {};
  List<Map<String, dynamic>> _alerts = List<Map<String, dynamic>>.from(_mockAlerts);
  String? _selectedId;

  @override
  void initState() {
    super.initState();
    if (_alerts.isNotEmpty) _selectedId = _alerts.first['id'] as String;
  }

  List<Map<String, dynamic>> get _filtered {
    final kw = _search.trim().toLowerCase();
    return _alerts.where((a) {
      final matchKw = kw.isEmpty ||
          (a['groupName'] as String).toLowerCase().contains(kw) ||
          (a['courseCode'] as String).toLowerCase().contains(kw) ||
          (a['targetName'] as String).toLowerCase().contains(kw) ||
          (a['message'] as String).toLowerCase().contains(kw) ||
          (_typeLabel[a['type']] ?? '').toLowerCase().contains(kw);
      if (!matchKw) return false;
      if (_filter == 'resolved') return a['status'] == 'RESOLVED';
      if (_filter == 'all') return a['status'] == 'OPEN';
      return a['status'] == 'OPEN' && (a['severity'] as String).toLowerCase() == _filter;
    }).toList();
  }

  int get _openCount => _alerts.where((a) => a['status'] == 'OPEN').length;
  int get _highCount => _alerts.where((a) => a['status'] == 'OPEN' && a['severity'] == 'HIGH').length;
  int get _resolvedCount => _alerts.where((a) => a['status'] == 'RESOLVED').length;
  int get _recentCount => _alerts.where((a) => a['status'] == 'OPEN' && _within24h(a['createdAt'] as String?)).length;
  int get _groupCount => _alerts.where((a) => a['status'] == 'OPEN' && a['targetType'] == 'group').length;
  int get _studentCount => _alerts.where((a) => a['status'] == 'OPEN' && a['targetType'] == 'student').length;

  Map<String, dynamic>? get _selectedAlert =>
      _selectedId == null ? null : _alerts.cast<Map<String,dynamic>?>().firstWhere((a) => a!['id'] == _selectedId, orElse: () => null);

  void _resolve(String id) => setState(() {
    final i = _alerts.indexWhere((a) => a['id'] == id);
    if (i >= 0) _alerts[i] = {..._alerts[i], 'status': 'RESOLVED'};
    _snack('Đã đánh dấu là đã giải quyết');
  });

  void _remind(Map<String, dynamic> a) => setState(() {
    _remindedIds.add(a['id'] as String);
    _snack('Đã gửi nhắc nhở đến ${a['targetName'] ?? a['groupName']}');
  });

  void _refresh() => setState(() {
    _alerts = List<Map<String, dynamic>>.from(_mockAlerts);
    _snack('Đã làm mới dữ liệu mô phỏng');
  });

  void _snack(String msg) => ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(msg), backgroundColor: _kTeal, behavior: SnackBarBehavior.floating));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: const AppTopHeader(title: 'Cảnh báo', showBack: true, backPath: '/lecturer',
        user: AppUser(name: 'Giảng viên', email: 'gv@fe.edu.vn', role: 'LECTURER')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Breadcrumb
          Row(children: [
            const Text('Giảng viên', style: TextStyle(fontSize: 11, color: _kTeal, fontWeight: FontWeight.w600)),
            const Icon(Icons.chevron_right_rounded, size: 14, color: _kSub),
            const Text('Cảnh báo', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _kText)),
          ]),
          const SizedBox(height: 10),
          // Header
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Cảnh báo Nhóm', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _kText)),
              const SizedBox(height: 2),
              const Text('Phát hiện sớm nhóm / sinh viên không hoạt động theo quy tắc hệ thống',
                style: TextStyle(fontSize: 12, color: _kSub)),
              const SizedBox(height: 4),
              const Text('Đang hiển thị dữ liệu mô phỏng để preview giao diện và luồng xử lý.',
                style: TextStyle(fontSize: 10, color: _kSub)),
            ])),
            GestureDetector(
              onTap: _refresh,
              child: Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                decoration: BoxDecoration(border: Border.all(color: _kBorder), borderRadius: BorderRadius.circular(12)),
                child: const Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.refresh_rounded, size: 14, color: _kSub), SizedBox(width: 5),
                  Text('Làm mới', style: TextStyle(fontSize: 12, color: _kSub)),
                ])),
            ),
          ]),
          const SizedBox(height: 14),
          // Top meta card
          _buildMetaCard(),
          const SizedBox(height: 14),
          // Stats grid
          _buildStatsGrid(),
          const SizedBox(height: 14),
          // Filter + Search
          _buildFilterBar(),
          const SizedBox(height: 14),
          // Alert list
          _buildAlertList(),
          const SizedBox(height: 14),
          // Detail panel
          if (_selectedAlert != null) _buildDetailPanel(_selectedAlert!),
          const SizedBox(height: 14),
          // Rule system
          _buildRulesCard(),
          const SizedBox(height: 14),
          // Priority suggestions
          _buildPriorityCard(),
        ]),
      ),
    );
  }

  Widget _buildMetaCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFFF0FDFA), Colors.white, Color(0xFFF0FDF4)]),
        border: Border.all(color: const Color(0xFF99F6E4)),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('TRUNG TÂM XỬ LÝ CẢNH BÁO', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: _kTeal, letterSpacing: 1.5)),
        const SizedBox(height: 4),
        const Text('Lecturer Alert Operations', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _kText)),
        const SizedBox(height: 2),
        const Text('Theo dõi trạng thái bất thường, ưu tiên case quan trọng và xử lý nhanh',
          style: TextStyle(fontSize: 11, color: _kSub)),
        const SizedBox(height: 10),
        Wrap(spacing: 6, runSpacing: 6, children: [
          _metaChip('Dữ liệu mô phỏng', const Color(0xFFFFFBEB), const Color(0xFFFDE68A), const Color(0xFFB45309)),
          _metaChip('Rule hoạt động: 6', const Color(0xFFF0FDFA), const Color(0xFF99F6E4), _kTeal),
          _metaChip('Mới trong 24h: $_recentCount', const Color(0xFFEFF6FF), const Color(0xFFBFDBFE), const Color(0xFF1D4ED8)),
          _metaChip('Đã nhắc: ${_remindedIds.length}', const Color(0xFFFAF5FF), const Color(0xFFE9D5FF), const Color(0xFF7C3AED)),
        ]),
      ]),
    );
  }

  Widget _metaChip(String text, Color bg, Color border, Color textColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(color: bg, border: Border.all(color: border), borderRadius: BorderRadius.circular(20)),
      child: Text(text, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: textColor)),
    );
  }

  Widget _buildStatsGrid() {
    final stats = [
      {'label': 'Chưa giải quyết', 'value': '$_openCount', 'sub': 'Case đang cần lecturer xử lý', 'icon': Icons.warning_amber_rounded, 'bg': const Color(0xFFFEF2F2), 'border': const Color(0xFFFECACA), 'color': const Color(0xFFDC2626)},
      {'label': 'Nghiêm trọng', 'value': '$_highCount', 'sub': 'Ưu tiên kiểm tra trước', 'icon': Icons.shield_outlined, 'bg': const Color(0xFFFFF7ED), 'border': const Color(0xFFFED7AA), 'color': const Color(0xFFEA580C)},
      {'label': 'Đã giải quyết', 'value': '$_resolvedCount', 'sub': 'Đã được follow up', 'icon': Icons.check_circle_outline, 'bg': const Color(0xFFF0FDF4), 'border': const Color(0xFFBBF7D0), 'color': const Color(0xFF16A34A)},
      {'label': 'Theo nhóm', 'value': '$_groupCount', 'sub': 'Mất cân bằng / tiến độ thấp', 'icon': Icons.people_outline, 'bg': const Color(0xFFEFF6FF), 'border': const Color(0xFFBFDBFE), 'color': const Color(0xFF2563EB)},
      {'label': 'Theo cá nhân', 'value': '$_studentCount', 'sub': 'Không commit / overdue', 'icon': Icons.notifications_outlined, 'bg': const Color(0xFFEEF2FF), 'border': const Color(0xFFC7D2FE), 'color': const Color(0xFF6366F1)},
      {'label': 'Mới 24h', 'value': '$_recentCount', 'sub': 'Cảnh báo vừa phát sinh', 'icon': Icons.access_time_rounded, 'bg': _kBg, 'border': _kBorder, 'color': _kText},
    ];
    return GridView.builder(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 10, mainAxisSpacing: 10, childAspectRatio: 2.2),
      itemCount: stats.length,
      itemBuilder: (_, i) {
        final s = stats[i];
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(color: s['bg'] as Color, border: Border.all(color: s['border'] as Color), borderRadius: BorderRadius.circular(16)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Flexible(child: Text(s['label'] as String, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: s['color'] as Color))),
              Icon(s['icon'] as IconData, size: 15, color: s['color'] as Color),
            ]),
            const SizedBox(height: 3),
            Text(s['value'] as String, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: s['color'] as Color)),
            Text(s['sub'] as String, style: TextStyle(fontSize: 9, color: s['color'] as Color), maxLines: 1, overflow: TextOverflow.ellipsis),
          ]),
        );
      },
    );
  }

  Widget _buildFilterBar() {
    final filters = {'all': 'Tất cả mở', 'high': 'Nghiêm trọng', 'medium': 'Trung bình', 'low': 'Nhẹ', 'resolved': 'Đã xử lý'};
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: _kBorder), borderRadius: BorderRadius.circular(18),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 6)]),
      child: Column(children: [
        SingleChildScrollView(scrollDirection: Axis.horizontal,
          child: Row(children: [
            const Icon(Icons.filter_list_rounded, size: 14, color: _kSub),
            const SizedBox(width: 6),
            ...filters.entries.map((e) {
              final active = _filter == e.key;
              return Padding(padding: const EdgeInsets.only(right: 6),
                child: GestureDetector(onTap: () => setState(() => _filter = e.key),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: active ? _kTeal : Colors.white,
                      border: Border.all(color: active ? _kTeal : _kBorder),
                      borderRadius: BorderRadius.circular(20)),
                    child: Text(e.value, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: active ? Colors.white : _kSub)),
                  )));
            }),
          ]),
        ),
        const SizedBox(height: 10),
        TextField(
          onChanged: (v) => setState(() => _search = v),
          style: const TextStyle(fontSize: 13),
          decoration: InputDecoration(
            hintText: 'Tìm theo nhóm, môn, sinh viên, loại cảnh báo...',
            hintStyle: const TextStyle(fontSize: 12, color: _kSub),
            prefixIcon: const Icon(Icons.search_rounded, size: 16, color: _kSub),
            filled: true, fillColor: _kBg,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kBorder)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kTeal, width: 1.5))),
        ),
      ]),
    );
  }

  Widget _buildAlertList() {
    return Container(
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: _kBorder), borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 12), child: Row(children: [
          Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.notifications_rounded, size: 15, color: Color(0xFFDC2626))),
          const SizedBox(width: 8),
          const Text('Danh sách cảnh báo', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: _kText)),
        ])),
        const Divider(height: 1, color: Color(0xFFF9FAFB)),
        _filtered.isEmpty
          ? Padding(padding: const EdgeInsets.symmetric(vertical: 40),
              child: Center(child: Column(children: [
                Container(padding: const EdgeInsets.all(14), decoration: BoxDecoration(color: const Color(0xFFF0FDF4), borderRadius: BorderRadius.circular(20)),
                  child: const Icon(Icons.check_circle_outline, size: 28, color: Color(0xFF86EFAC))),
                const SizedBox(height: 12),
                const Text('Không có cảnh báo nào', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: _kSub)),
                const SizedBox(height: 4),
                Text(_filter == 'resolved' ? 'Chưa có cảnh báo nào được giải quyết' : 'Tất cả nhóm đang hoạt động tốt 🎉',
                  style: const TextStyle(fontSize: 11, color: _kSub)),
              ])))
          : Column(children: _filtered.asMap().entries.map((e) => _buildAlertRow(e.value, isLast: e.key == _filtered.length - 1)).toList()),
      ]),
    );
  }

  Widget _buildAlertRow(Map<String, dynamic> a, {bool isLast = false}) {
    final sev = _sevMeta(a['severity'] as String);
    final reminded = _remindedIds.contains(a['id'] as String);
    final selected = _selectedId == a['id'];
    final resolved = a['status'] == 'RESOLVED';
    final metrics = a['metrics'] as Map<String, dynamic>;
    final badge = sev['badge'] as List;

    return GestureDetector(
      onTap: () => setState(() => _selectedId = a['id'] as String),
      child: Opacity(opacity: resolved ? 0.6 : 1,
        child: Container(
          decoration: BoxDecoration(
            color: selected ? const Color(0xFFF0FDFA) : Colors.white,
            border: isLast ? null : const Border(bottom: BorderSide(color: Color(0xFFF9FAFB)))),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Padding(padding: const EdgeInsets.only(top: 6),
              child: Container(width: 8, height: 8, decoration: BoxDecoration(color: sev['dot'] as Color, shape: BoxShape.circle))),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Wrap(spacing: 5, runSpacing: 4, children: [
                Text('${a['targetName']} · ${a['courseCode']}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _kText)),
                Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: badge[0] as Color, border: Border.all(color: badge[2] as Color), borderRadius: BorderRadius.circular(20)),
                  child: Text((sev['label'] as String).toUpperCase(), style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: badge[1] as Color, letterSpacing: 0.5))),
                Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: _kBg, border: Border.all(color: _kBorder), borderRadius: BorderRadius.circular(20)),
                  child: Text((_typeLabel[a['type']] ?? a['type'] as String).toUpperCase(), style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w700, color: _kSub, letterSpacing: 0.5))),
                if (resolved) Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: const Color(0xFFF0FDF4), border: Border.all(color: const Color(0xFFBBF7D0)), borderRadius: BorderRadius.circular(20)),
                  child: const Text('ĐÃ XỬ LÝ', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: Color(0xFF16A34A), letterSpacing: 0.5))),
                if (reminded && !resolved) Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: const Color(0xFFEFF6FF), border: Border.all(color: const Color(0xFFBFDBFE)), borderRadius: BorderRadius.circular(20)),
                  child: const Text('ĐÃ NHẮC', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: Color(0xFF2563EB), letterSpacing: 0.5))),
              ]),
              const SizedBox(height: 5),
              Text(a['message'] as String, style: const TextStyle(fontSize: 11, color: _kSub), maxLines: 2, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 6),
              Wrap(spacing: 5, runSpacing: 4, children: [
                _metricPill('Commits: ${metrics['commits']}'),
                _metricPill('Jira: ${metrics['jiraDone']}'),
                _metricPill('Overdue: ${metrics['overdueTasks']}'),
                _metricPill('Balance: ${metrics['balance']}%'),
              ]),
              const SizedBox(height: 5),
              Row(children: [
                const Icon(Icons.access_time_rounded, size: 9, color: _kSub),
                const SizedBox(width: 3),
                Text(a['createdAt'] as String, style: const TextStyle(fontSize: 9, color: _kSub)),
              ]),
              if (!resolved) ...[
                const SizedBox(height: 8),
                Row(children: [
                  _actionBtn(Icons.remove_red_eye_outlined, 'Xem', Colors.white, _kBorder, _kSub, () => setState(() => _selectedId = a['id'] as String)),
                  const SizedBox(width: 6),
                  _actionBtn(reminded ? Icons.notifications_off_outlined : Icons.notifications_outlined, reminded ? 'Đã nhắc' : 'Nhắc nhở',
                    reminded ? _kBg : const Color(0xFFFFF7ED), reminded ? _kBorder : const Color(0xFFFED7AA),
                    reminded ? _kSub : const Color(0xFFEA580C), reminded ? null : () => _remind(a)),
                  const SizedBox(width: 6),
                  _actionBtn(Icons.check_circle_outline, 'Đã xử lý', const Color(0xFFF0FDF4), const Color(0xFFBBF7D0), const Color(0xFF16A34A), () => _resolve(a['id'] as String)),
                ]),
              ],
            ])),
          ]),
        )),
    );
  }

  Widget _metricPill(String text) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(color: _kBg, border: Border.all(color: _kBorder), borderRadius: BorderRadius.circular(20)),
    child: Text(text, style: const TextStyle(fontSize: 10, color: _kSub)));

  Widget _actionBtn(IconData icon, String label, Color bg, Color border, Color color, VoidCallback? onTap) {
    return GestureDetector(onTap: onTap,
      child: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
        decoration: BoxDecoration(color: bg, border: Border.all(color: border), borderRadius: BorderRadius.circular(8)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 11, color: color), const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color)),
        ])));
  }

  Widget _buildDetailPanel(Map<String, dynamic> a) {
    final sev = _sevMeta(a['severity'] as String);
    final badge = sev['badge'] as List;
    final card = sev['card'] as List;
    final metrics = a['metrics'] as Map<String, dynamic>;
    return Container(
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: _kBorder), borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 12), child: Row(children: [
          Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: const Color(0xFFF5F3FF), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.remove_red_eye_outlined, size: 15, color: Color(0xFF7C3AED))),
          const SizedBox(width: 8),
          const Text('Chi tiết cảnh báo', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: _kText)),
        ])),
        const Divider(height: 1, color: Color(0xFFF9FAFB)),
        Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Severity card
          Container(padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: card[0] as Color, border: Border.all(color: card[1] as Color), borderRadius: BorderRadius.circular(14)),
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(a['targetName'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: _kText)),
                const SizedBox(height: 2),
                Text('${a['groupName']} • ${a['courseCode']}', style: const TextStyle(fontSize: 11, color: _kSub)),
              ]),
              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: badge[0] as Color, border: Border.all(color: badge[2] as Color), borderRadius: BorderRadius.circular(20)),
                child: Text((sev['label'] as String).toUpperCase(), style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: badge[1] as Color, letterSpacing: 0.5))),
            ])),
          const SizedBox(height: 10),
          _detailBlock('LOẠI CẢNH BÁO', _typeLabel[a['type']] ?? a['type'] as String),
          const SizedBox(height: 10),
          _detailBlock('MÔ TẢ', a['message'] as String),
          const SizedBox(height: 10),
          GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 2.2,
            children: [
              _metricBox('Commits', '${metrics['commits']}'),
              _metricBox('Jira done', '${metrics['jiraDone']}'),
              _metricBox('Overdue', '${metrics['overdueTasks']}'),
              _metricBox('Score', '${metrics['score']}'),
            ]),
          const SizedBox(height: 10),
          _detailBlock('HOẠT ĐỘNG GẦN NHẤT', a['lastActivityAt'] as String),
          const SizedBox(height: 10),
          _detailBlock('GỢI Ý XỬ LÝ', (a['suggestion'] as String?) ?? 'Giảng viên nên kiểm tra thêm chi tiết tiến độ và đóng góp.'),
          if (a['status'] == 'OPEN') ...[
            const SizedBox(height: 14),
            Row(children: [
              Expanded(child: GestureDetector(onTap: () => _remind(a),
                child: Container(padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(border: Border.all(color: const Color(0xFFFED7AA)), borderRadius: BorderRadius.circular(12)),
                  child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.notifications_outlined, size: 14, color: Color(0xFFEA580C)), SizedBox(width: 5),
                    Text('Nhắc nhở', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFFEA580C))),
                  ])))),
              const SizedBox(width: 10),
              Expanded(child: GestureDetector(onTap: () => _resolve(a['id'] as String),
                child: Container(padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(color: _kTeal, borderRadius: BorderRadius.circular(12)),
                  child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.check_circle_outline, size: 14, color: Colors.white), SizedBox(width: 5),
                    Text('Đánh dấu đã xử lý', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                  ])))),
            ]),
          ],
        ])),
      ]),
    );
  }

  Widget _detailBlock(String label, String value) {
    return Container(padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: _kBg, border: Border.all(color: _kBorder), borderRadius: BorderRadius.circular(12)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: _kSub, letterSpacing: 1)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontSize: 12, color: _kText)),
      ]));
  }

  Widget _metricBox(String label, String value) {
    return Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(color: _kBg, border: Border.all(color: _kBorder), borderRadius: BorderRadius.circular(12)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: const TextStyle(fontSize: 10, color: _kSub)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _kText)),
      ]));
  }

  Widget _buildRulesCard() {
    final rules = [
      ['Không commit trong 7 ngày', 'Flag sinh viên không có hoạt động code trong giai đoạn theo dõi'],
      ['Từ 2 task Jira quá hạn', 'Ưu tiên các case overdue kéo dài hoặc không cập nhật'],
      ['Balance đóng góp dưới 55%', 'Phát hiện nhóm có đóng góp lệch, một người làm quá nhiều'],
      ['Jira / GitHub lệch bất thường', 'Task cập nhật nhiều nhưng output code không tương xứng'],
    ];
    return _sideCard(Icons.info_outline_rounded, const Color(0xFFFFFBEB), const Color(0xFFD97706), 'Rule hệ thống',
      Column(children: rules.map((r) => Padding(padding: const EdgeInsets.only(bottom: 8),
        child: Container(padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: _kBg, border: Border.all(color: _kBorder), borderRadius: BorderRadius.circular(12)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(r[0], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _kText)),
            const SizedBox(height: 3),
            Text(r[1], style: const TextStyle(fontSize: 11, color: _kSub)),
          ])))).toList()));
  }

  Widget _buildPriorityCard() {
    return _sideCard(Icons.mail_outline_rounded, const Color(0xFFFAF5FF), const Color(0xFF7C3AED), 'Gợi ý ưu tiên',
      Column(children: [
        _priorityItem('Ưu tiên xử lý cảnh báo nghiêm trọng trước', const Color(0xFFFEF2F2), const Color(0xFFFECACA)),
        const SizedBox(height: 8),
        _priorityItem('Kiểm tra các nhóm có balance thấp hoặc thành viên chưa commit', const Color(0xFFFFFBEB), const Color(0xFFFDE68A)),
        const SizedBox(height: 8),
        _priorityItem('Đối chiếu Jira overdue với GitHub thấp để phát hiện case cập nhật ảo', const Color(0xFFEFF6FF), const Color(0xFFBFDBFE)),
      ]));
  }

  Widget _priorityItem(String text, Color bg, Color border) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(color: bg, border: Border.all(color: border), borderRadius: BorderRadius.circular(12)),
    child: Text(text, style: const TextStyle(fontSize: 12, color: _kText)));

  Widget _sideCard(IconData icon, Color iconBg, Color iconColor, String title, Widget child) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: _kBorder), borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 12), child: Row(children: [
          Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, size: 15, color: iconColor)),
          const SizedBox(width: 8),
          Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: _kText)),
        ])),
        const Divider(height: 1, color: Color(0xFFF9FAFB)),
        Padding(padding: const EdgeInsets.all(16), child: child),
      ]),
    );
  }
}
