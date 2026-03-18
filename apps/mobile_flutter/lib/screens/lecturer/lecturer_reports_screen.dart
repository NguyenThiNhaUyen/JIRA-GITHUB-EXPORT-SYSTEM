import 'package:flutter/material.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/lecturer_navigation.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';
// ── Palette ───────────────────────────────────────────────────
const _kT = Color(0xFF0F766E);
const _kBg = Color(0xFFF9FAFB);
const _kBd = Color(0xFFE5E7EB);
const _kTxt = Color(0xFF111827);
const _kSub = Color(0xFF6B7280);

// ── Mock Data ────────────────────────────────────────────────
List<Map<String, dynamic>> _courses = [];
List<Map<String, dynamic>> _teams = [];
List<Map<String, dynamic>> _students = [];
List<Map<String, dynamic>> _exports = [];

// Export type configs
final _exportTypes = [
  {'id':'by-course','color':const Color(0xFF14B8A6),'icon':Icons.table_chart_outlined,'title':'Báo cáo theo Lớp','desc':'Tổng hợp toàn bộ tiến độ nhóm trong lớp: số nhóm, commit, issue, PR, sprint completion, cảnh báo.','formats':['PDF','Excel'],'fields':['Course / Class','Total teams','Total commits','Issue completion','Warnings','Risk overview'],'useCases':['Tổng hợp tiến độ cả lớp','Báo cáo giữa kỳ / cuối kỳ','So sánh các nhóm trong một lớp']},
  {'id':'by-group','color':const Color(0xFF3B82F6),'icon':Icons.description_outlined,'title':'Báo cáo theo Nhóm','desc':'Chi tiết từng nhóm dự án: backlog Jira, tiến độ sprint, commit history, GitHub coverage, contribution balance.','formats':['PDF','Excel'],'fields':['Team & project','Commits','Issues done/total','PR merged','Overdue tasks','Contribution balance'],'useCases':['Review nhóm cụ thể','Kiểm tra mất cân bằng task','Theo dõi health của project']},
  {'id':'by-student','color':const Color(0xFF6366F1),'icon':Icons.check_box_outlined,'title':'Báo cáo theo Sinh viên','desc':'Đóng góp cá nhân để hỗ trợ đánh giá quá trình: commits, issues, PR merged, sprint coverage, contribution score.','formats':['PDF','CSV'],'fields':['Student name','Team','Commits','Issues done','Sprint coverage','Contribution score'],'useCases':['Hỗ trợ chấm điểm cá nhân','Xác định sinh viên ít đóng góp','Đối chiếu minh chứng hoạt động']},
  {'id':'by-warning','color':const Color(0xFFF59E0B),'icon':Icons.warning_amber_rounded,'title':'Báo cáo Cảnh báo','desc':'Tập trung vào các nhóm hoặc sinh viên có dấu hiệu chậm tiến độ, ít đóng góp, overdue sprint.','formats':['PDF','Excel'],'fields':['Risk level','Warning type','Overdue tasks','Inactive members','Low contribution','Jira/GitHub mismatch'],'useCases':['Gửi cảnh báo sớm','Theo dõi nhóm có nguy cơ fail','Review lớp có nhiều vấn đề']},
  {'id':'by-sync','color':const Color(0xFF8B5CF6),'icon':Icons.account_tree_outlined,'title':'Đối chiếu Jira ↔ GitHub','desc':'Báo cáo đối chiếu task management và coding activity giữa Jira và GitHub cho từng nhóm.','formats':['PDF','Excel'],'fields':['Jira coverage','GitHub coverage','Issue-code mismatch','Execution ratio','Task mapping quality','Sync score'],'useCases':['Phát hiện lệch Jira / GitHub','Kiểm tra minh bạch quy trình','Highlight nhóm quản lý task chưa tốt']},
];

// ── Helpers ───────────────────────────────────────────────────
Map<String,dynamic> _formatBadge(String f) {
  if (f == 'PDF') return {'bg':const Color(0xFFFEF2F2),'bd':const Color(0xFFFECACA),'color':const Color(0xFFDC2626)};
  if (f == 'Excel') return {'bg':const Color(0xFFECFDF5),'bd':const Color(0xFFA7F3D0),'color':const Color(0xFF065F46)};
  return {'bg':const Color(0xFFEEF2FF),'bd':const Color(0xFFC7D2FE),'color':const Color(0xFF4338CA)};
}

Map<String,dynamic> _riskBadge(String r) {
  if (r == 'High') return {'bg':const Color(0xFFFEF2F2),'bd':const Color(0xFFFECACA),'color':const Color(0xFFDC2626)};
  if (r == 'Medium') return {'bg':const Color(0xFFFFFBEB),'bd':const Color(0xFFFDE68A),'color':const Color(0xFFB45309)};
  return {'bg':const Color(0xFFECFDF5),'bd':const Color(0xFFA7F3D0),'color':const Color(0xFF065F46)};
}

Map<String,dynamic> _studentBadge(String s) {
  if (s == 'Excellent') return {'bg':const Color(0xFFECFDF5),'bd':const Color(0xFFA7F3D0),'color':const Color(0xFF065F46)};
  if (s == 'Good') return {'bg':const Color(0xFFEFF6FF),'bd':const Color(0xFFBFDBFE),'color':const Color(0xFF1D4ED8)};
  if (s == 'Warning') return {'bg':const Color(0xFFFFFBEB),'bd':const Color(0xFFFDE68A),'color':const Color(0xFFB45309)};
  return {'bg':const Color(0xFFFEF2F2),'bd':const Color(0xFFFECACA),'color':const Color(0xFFDC2626)};
}

// ── Screen ───────────────────────────────────────────────────
class LecturerReportsScreen extends StatefulWidget {
  const LecturerReportsScreen({super.key});
  @override
  State<LecturerReportsScreen> createState() => _LecturerReportsScreenState();
}

class _LecturerReportsScreenState extends State<LecturerReportsScreen> {
  String _selectedType = 'by-course';
  String _search = '';
  String _courseFilter = 'all';
  String _teamFilter = 'all';
  String _semesterFilter = 'all';
  String _riskFilter = 'all';

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
  Map<String,dynamic> get _selectedConfig => _exportTypes.firstWhere((e) => e['id'] == _selectedType);

  List<Map<String,dynamic>> get _teamOptions {
    if (_courseFilter == 'all') return List<Map<String,dynamic>>.from(_teams);
    return _teams.where((t) => t['courseId'] == _courseFilter).toList().cast<Map<String,dynamic>>();
  }

  // Computed preview data
  Map<String,dynamic> get _preview {
    var teams = _teams.toList().cast<Map<String,dynamic>>();
    var students = _students.toList().cast<Map<String,dynamic>>();
    if (_courseFilter != 'all') {
      teams = teams.where((t) => t['courseId'] == _courseFilter).toList();
      final ids = teams.map((t) => t['id']).toSet();
      students = students.where((s) => ids.contains(s['teamId'])).toList();
    }
    if (_teamFilter != 'all') {
      teams = teams.where((t) => t['id'] == _teamFilter).toList();
      students = students.where((s) => s['teamId'] == _teamFilter).toList();
    }
    if (_riskFilter != 'all') {
      teams = teams.where((t) => t['riskLevel'] == _riskFilter).toList();
      final ids = teams.map((t) => t['id']).toSet();
      students = students.where((s) => ids.contains(s['teamId'])).toList();
    }
    if (_search.trim().isNotEmpty) {
      final q = _search.toLowerCase();
      teams = teams.where((t) => (t['name'] as String).toLowerCase().contains(q) || (t['project'] as String).toLowerCase().contains(q)).toList();
      students = students.where((s) => (s['name'] as String).toLowerCase().contains(q)).toList();
    }
    final totalCommits = teams.fold<int>(0, (s, t) => s + (t['commits'] as int));
    final totalIssuesDone = teams.fold<int>(0, (s, t) => s + (t['issuesDone'] as int));
    final totalIssues = teams.fold<int>(0, (s, t) => s + (t['issuesTotal'] as int));
    final totalWarnings = teams.fold<int>(0, (s, t) => s + (t['warningCount'] as int));
    final avgSprint = teams.isEmpty ? 0 : (teams.fold<int>(0, (s, t) => s + (t['sprintCompletion'] as int)) / teams.length).round();
    final avgSync = teams.isEmpty ? 0 : (teams.fold<int>(0, (s, t) => s + ((t['jiraCoverage'] as int) + (t['githubCoverage'] as int))) / (teams.length * 2)).round();
    final topRisk = (List<Map<String,dynamic>>.from(teams)..sort((a,b) => (b['warningCount'] as int) - (a['warningCount'] as int))).take(3).toList();
    final weakest = (List<Map<String,dynamic>>.from(students)..sort((a,b) => (a['contributionScore'] as int) - (b['contributionScore'] as int))).take(3).toList();
    return {'teams':teams,'students':students,'totalCommits':totalCommits,'totalIssuesDone':totalIssuesDone,'totalIssues':totalIssues,'totalWarnings':totalWarnings,'avgSprint':avgSprint,'avgSync':avgSync,'topRiskTeams':topRisk,'weakestStudents':weakest};
  }

  // Dashboard stats
  int get _riskyTeams => _teams.where((t) => t['riskLevel'] == 'High').length;
  int get _warnStudents => _students.where((s) => s['status'] == 'Warning' || s['status'] == 'At Risk').length;
  int get _overdueTasks => _teams.fold<int>(0, (s, t) => s + (t['overdueTasks'] as int));
  int get _avgCompletion => _teams.isEmpty ? 0 : (_teams.fold<int>(0, (s, t) => s + (t['sprintCompletion'] as int)) / _teams.length).round();

  String get _scopeLabel {
    if (_teamFilter != 'all') return _teams.firstWhere((t) => t['id'] == _teamFilter)['name'] as String;
    if (_courseFilter != 'all') {
      final c = _courses.firstWhere((c) => c['id'] == _courseFilter);
      return '${c['code']} - ${c['className']}';
    }
    return 'Toàn bộ dữ liệu phù hợp';
  }

  void _handleExport(String fmt) {
    _snack('Đang tạo file $fmt cho "${_selectedConfig['title']}" • $_scopeLabel (demo)');
  }

  void _snack(String msg) => ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(msg), backgroundColor: _kT, behavior: SnackBarBehavior.floating));

  @override
  Widget build(BuildContext context) {
    final p = _preview;
    return Scaffold(
      backgroundColor: Colors.white,
      drawer: const LecturerDrawer(),
      appBar: AppTopHeader(
        title: 'Báo cáo & Export',
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
          const Row(children: [
            Text('Giảng viên', style: TextStyle(fontSize: 11, color: _kT, fontWeight: FontWeight.w600)),
            Icon(Icons.chevron_right_rounded, size: 14, color: _kSub),
            Text('Báo cáo & Export', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _kTxt)),
          ]),
          const SizedBox(height: 12),
          // Header
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Báo cáo & Xuất dữ liệu', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _kTxt)),
              SizedBox(height: 3),
              Text('Trung tâm tạo báo cáo học thuật cho lớp, nhóm, sinh viên và đối chiếu Jira ↔ GitHub', style: TextStyle(fontSize: 12, color: _kSub)),
            ])),
            Column(children: [
              _outlineBtn(Icons.filter_list_rounded, 'Báo cáo tùy chỉnh', () => _snack('Đang tạo báo cáo tùy chỉnh... (demo)')),
              const SizedBox(height: 6),
              _solidBtn(Icons.download_rounded, 'Export nhanh', () => _snack('Đang export nhanh báo cáo tổng quan... (demo)')),
            ]),
          ]),
          const SizedBox(height: 14),
          // Stats
          _buildStats(),
          const SizedBox(height: 14),
          // Filters
          _buildFilters(p),
          const SizedBox(height: 14),
          // Export type cards
          _buildExportTypeCards(),
          const SizedBox(height: 14),
          // Preview panel
          _buildPreviewPanel(p),
          const SizedBox(height: 14),
          // Selected report detail
          _buildReportDetailCard(),
          const SizedBox(height: 14),
          // Quick export suggestions
          _buildQuickSuggestions(),
          const SizedBox(height: 14),
          // Export history
          _buildExportHistory(),
          // Footer note
          const SizedBox(height: 10),
          const Center(child: Text('* Đây là bản mock UI hoàn chỉnh. Các nút export hiện hiển thị toast demo thay vì tải file thực.', style: TextStyle(fontSize: 10, color: _kSub), textAlign: TextAlign.center)),
        ]),
      ),
    );
  }

  Widget _buildStats() {
    final items = [
      {'label':'Tổng báo cáo','value':'${_exports.length}','icon':Icons.bar_chart_rounded,'bg':Colors.white,'bd':_kBd,'color':_kTxt},
      {'label':'Xuất tuần này','value':'3','icon':Icons.download_rounded,'bg':const Color(0xFFF0FDFA),'bd':const Color(0xFF99F6E4),'color':_kT},
      {'label':'Nhóm rủi ro cao','value':'$_riskyTeams','icon':Icons.warning_amber_rounded,'bg':const Color(0xFFFEF2F2),'bd':const Color(0xFFFECACA),'color':const Color(0xFFDC2626)},
      {'label':'SV cần chú ý','value':'$_warnStudents','icon':Icons.shield_outlined,'bg':const Color(0xFFFFFBEB),'bd':const Color(0xFFFDE68A),'color':const Color(0xFFB45309)},
      {'label':'Overdue tasks','value':'$_overdueTasks','icon':Icons.access_time_rounded,'bg':const Color(0xFFEFF6FF),'bd':const Color(0xFFBFDBFE),'color':const Color(0xFF2563EB)},
      {'label':'TB sprint done','value':'$_avgCompletion%','icon':Icons.check_circle_outline,'bg':const Color(0xFFECFDF5),'bd':const Color(0xFFA7F3D0),'color':const Color(0xFF065F46)},
    ];
    return GridView.builder(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 2.4),
      itemCount: items.length,
      itemBuilder: (_, i) {
        final s = items[i];
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(color: s['bg'] as Color, border: Border.all(color: s['bd'] as Color), borderRadius: BorderRadius.circular(14),
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
      });
  }

  Widget _buildFilters(Map<String,dynamic> p) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: _cardDeco(),
      child: Column(children: [
        TextField(onChanged: (v) => setState(() => _search = v),
          style: const TextStyle(fontSize: 13),
          decoration: InputDecoration(hintText: 'Tìm lớp, nhóm, project, sinh viên...', hintStyle: const TextStyle(fontSize: 12, color: _kSub),
            prefixIcon: const Icon(Icons.search_rounded, size: 16, color: _kSub),
            filled: true, fillColor: _kBg, contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kBd)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kBd)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kT, width: 1.5)))),
        const SizedBox(height: 10),
        Row(children: [
          Expanded(child: _dropdown({'all':'Tất cả học kỳ','Spring 2026':'Spring 2026'}, _semesterFilter, (v) => setState(() => _semesterFilter = v!))),
          const SizedBox(width: 8),
          Expanded(child: _dropdown({'all':'Tất cả lớp', ..._courses.asMap().map((_, c) => MapEntry(c['id'] as String, '${c['code']} - ${c['className']}'))}, _courseFilter, (v) => setState(() { _courseFilter = v!; _teamFilter = 'all'; }))),
        ]),
        const SizedBox(height: 8),
        Row(children: [
          Expanded(child: _dropdown({'all':'Tất cả nhóm', ..._teamOptions.asMap().map((_, t) => MapEntry(t['id'] as String, t['name'] as String))}, _teamFilter, (v) => setState(() => _teamFilter = v!))),
          const SizedBox(width: 8),
          Expanded(child: _dropdown({'all':'Mọi mức rủi ro','High':'High risk','Medium':'Medium risk','Low':'Low risk'}, _riskFilter, (v) => setState(() => _riskFilter = v!))),
          const SizedBox(width: 8),
          Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(color: const Color(0xFFF0FDFA), border: Border.all(color: const Color(0xFF99F6E4)), borderRadius: BorderRadius.circular(10)),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.filter_list_rounded, size: 13, color: _kT), const SizedBox(width: 4),
              Text('${(p['teams'] as List).length}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _kT)),
            ])),
        ]),
      ]),
    );
  }

  Widget _buildExportTypeCards() {
    return Column(children: _exportTypes.map((et) {
      final active = _selectedType == et['id'];
      return GestureDetector(
        onTap: () => setState(() => _selectedType = et['id'] as String),
        child: Container(
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(color: Colors.white, border: Border.all(color: active ? _kT : _kBd, width: active ? 2 : 1), borderRadius: BorderRadius.circular(18),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 6)]),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(height: 3, decoration: BoxDecoration(color: _kT, borderRadius: const BorderRadius.vertical(top: Radius.circular(17)))),
            Padding(padding: const EdgeInsets.all(14), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(width: 44, height: 44, decoration: BoxDecoration(color: et['color'] as Color, borderRadius: BorderRadius.circular(14)),
                child: Icon(et['icon'] as IconData, color: Colors.white, size: 22)),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(et['title'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: _kTxt)),
                const SizedBox(height: 3),
                Text(et['desc'] as String, style: const TextStyle(fontSize: 11, color: _kSub, height: 1.4), maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 8),
                Wrap(spacing: 5, runSpacing: 4, children: (et['fields'] as List<String>).take(3).map((f) =>
                  Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(color: _kBg, borderRadius: BorderRadius.circular(20)),
                    child: Text(f, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: _kSub)))).toList()),
                const SizedBox(height: 8),
                Wrap(spacing: 6, children: (et['formats'] as List<String>).map((f) =>
                  GestureDetector(onTap: () { setState(() => _selectedType = et['id'] as String); _handleExport(f); },
                    child: Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(color: const Color(0xFFF0FDFA), border: Border.all(color: const Color(0xFF99F6E4)), borderRadius: BorderRadius.circular(10)),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        const Icon(Icons.download_rounded, size: 11, color: _kT), const SizedBox(width: 4),
                        Text(f, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: _kT)),
                      ])))).toList()),
              ])),
            ])),
          ]),
        ));
    }).toList());
  }

  Widget _buildPreviewPanel(Map<String,dynamic> p) {
    final sc = _selectedConfig;
    final teams = p['teams'] as List;
    final topRisk = p['topRiskTeams'] as List;
    final weakest = p['weakestStudents'] as List;

    return Container(
      decoration: _cardDeco(),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.fromLTRB(14, 14, 14, 10), child: Row(children: [
          Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: const Color(0xFFF0FDFA), borderRadius: BorderRadius.circular(8)),
            child: const Icon(Icons.remove_red_eye_outlined, size: 15, color: _kT)),
          const SizedBox(width: 8),
          const Text('Preview báo cáo', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: _kTxt)),
          const Spacer(),
          ...((sc['formats'] as List<String>).map((f) => Padding(
            padding: const EdgeInsets.only(left: 6),
            child: _outlineBtn(Icons.download_rounded, f, () => _handleExport(f))))),
        ])),
        const Divider(height: 1, color: Color(0xFFF3F4F6)),
        Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(sc['title'] as String, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: _kTxt)),
              const SizedBox(height: 3),
              Text(sc['desc'] as String, style: const TextStyle(fontSize: 11, color: _kSub, height: 1.4)),
            ])),
            const SizedBox(width: 10),
            Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: _kBg, border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(12)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('PHẠM VI DỮ LIỆU', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: _kSub, letterSpacing: 0.8)),
              const SizedBox(height: 4),
              Text(_scopeLabel, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _kTxt)),
              Text(_semesterFilter == 'all' ? 'All semester' : _semesterFilter, style: const TextStyle(fontSize: 10, color: _kSub)),
            ])),
          ]),
          const SizedBox(height: 12),
          // 4 mini stats
          GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 2.1,
            children: [
              _miniStat('Nhóm', '${teams.length}', Icons.people_outline, const Color(0xFFF0FDFA), const Color(0xFF99F6E4), _kT),
              _miniStat('Commits', '${p['totalCommits']}', Icons.code_rounded, const Color(0xFFEFF6FF), const Color(0xFFBFDBFE), const Color(0xFF2563EB)),
              _miniStat('Issues done', '${p['totalIssuesDone']}/${p['totalIssues']}', Icons.folder_outlined, const Color(0xFFEEF2FF), const Color(0xFFC7D2FE), const Color(0xFF6366F1)),
              _miniStat('Cảnh báo', '${p['totalWarnings']}', Icons.warning_amber_rounded, const Color(0xFFFEF2F2), const Color(0xFFFECACA), const Color(0xFFDC2626)),
            ]),
          const SizedBox(height: 12),
          // Fields + Metrics
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(child: Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(12)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Trường dữ liệu chính', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: _kTxt)),
              const SizedBox(height: 8),
              Wrap(spacing: 5, runSpacing: 5, children: (sc['fields'] as List<String>).map((f) =>
                Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: _kBg, borderRadius: BorderRadius.circular(20)),
                  child: Text(f, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: _kSub)))).toList()),
            ]))),
            const SizedBox(width: 8),
            Expanded(child: Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(12)), child: Column(children: [
              _metricRow('Avg sprint completion', '${p['avgSprint']}%'),
              _metricRow('Avg Jira ↔ GitHub sync', '${p['avgSync']}%'),
              _metricRow('Students included', '${(p['students'] as List).length}'),
              _metricRow('Time generated', 'Real-time mock'),
            ]))),
          ]),
          const SizedBox(height: 12),
          // Top risk + Weakest students
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(child: Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: const Color(0xFFFEF2F2), border: Border.all(color: const Color(0xFFFECACA)), borderRadius: BorderRadius.circular(12)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Row(children: [Icon(Icons.warning_amber_rounded, size: 13, color: Color(0xFFDC2626)), SizedBox(width: 5), Text('Nhóm rủi ro nổi bật', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: _kTxt))]),
              const SizedBox(height: 8),
              if (topRisk.isEmpty) const Text('Không có dữ liệu', style: TextStyle(fontSize: 11, color: _kSub))
              else ...topRisk.map((t) => _riskTeamCard(t)),
            ]))),
            const SizedBox(width: 8),
            Expanded(child: Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: const Color(0xFFFFFBEB), border: Border.all(color: const Color(0xFFFDE68A)), borderRadius: BorderRadius.circular(12)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Row(children: [Icon(Icons.shield_outlined, size: 13, color: Color(0xFFB45309)), SizedBox(width: 5), Text('Sinh viên cần chú ý', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: _kTxt))]),
              const SizedBox(height: 8),
              if (weakest.isEmpty) const Text('Không có dữ liệu', style: TextStyle(fontSize: 11, color: _kSub))
              else ...weakest.map((s) => _weakStudentCard(s)),
            ]))),
          ]),
        ])),
      ]),
    );
  }

  Widget _miniStat(String label, String value, IconData icon, Color bg, Color bd, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
    decoration: BoxDecoration(color: bg, border: Border.all(color: bd), borderRadius: BorderRadius.circular(12)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color)), const Spacer(), Icon(icon, size: 12, color: color)]),
      const SizedBox(height: 3),
      Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
    ]));

  Widget _metricRow(String label, String value) => Padding(padding: const EdgeInsets.only(bottom: 6),
    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Expanded(child: Text(label, style: const TextStyle(fontSize: 11, color: _kSub))),
      Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _kTxt)),
    ]));

  Widget _riskTeamCard(Map<String,dynamic> t) {
    final rb = _riskBadge(t['riskLevel'] as String);
    return Container(margin: const EdgeInsets.only(bottom: 6), padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFFECACA)), borderRadius: BorderRadius.circular(10)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(t['name'] as String, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _kTxt)),
          Text(t['project'] as String, style: const TextStyle(fontSize: 9, color: _kSub)),
        ])),
        Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: rb['bg'] as Color, border: Border.all(color: rb['bd'] as Color), borderRadius: BorderRadius.circular(10)),
          child: Text(t['riskLevel'] as String, style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: rb['color'] as Color))),
      ]),
      const SizedBox(height: 6),
      Row(children: [
        Expanded(child: _microStat('Warnings', '${t['warningCount']}')),
        const SizedBox(width: 4),
        Expanded(child: _microStat('Overdue', '${t['overdueTasks']}')),
        const SizedBox(width: 4),
        Expanded(child: _microStat('Sprint', '${t['sprintCompletion']}%')),
      ]),
    ]));
  }

  Widget _weakStudentCard(Map<String,dynamic> s) {
    final sb = _studentBadge(s['status'] as String);
    final team = _teams.cast<Map<String,dynamic>?>().firstWhere((t) => t!['id'] == s['teamId'], orElse: () => null);
    return Container(margin: const EdgeInsets.only(bottom: 6), padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFFDE68A)), borderRadius: BorderRadius.circular(10)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(s['name'] as String, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _kTxt)),
          if (team != null) Text(team['name'] as String, style: const TextStyle(fontSize: 9, color: _kSub)),
        ])),
        Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: sb['bg'] as Color, border: Border.all(color: sb['bd'] as Color), borderRadius: BorderRadius.circular(10)),
          child: Text(s['status'] as String, style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: sb['color'] as Color))),
      ]),
      const SizedBox(height: 6),
      Row(children: [
        Expanded(child: _microStat('Commits', '${s['commits']}')),
        const SizedBox(width: 4),
        Expanded(child: _microStat('Coverage', '${s['sprintCoverage']}%')),
        const SizedBox(width: 4),
        Expanded(child: _microStat('Score', '${s['contributionScore']}')),
      ]),
    ]));
  }

  Widget _microStat(String label, String val) => Container(padding: const EdgeInsets.symmetric(vertical: 4), decoration: BoxDecoration(color: _kBg, borderRadius: BorderRadius.circular(6)), child: Column(children: [
    Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w700, color: _kSub)),
    Text(val, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: _kTxt)),
  ]));

  Widget _buildReportDetailCard() {
    final sc = _selectedConfig;
    final p = _preview;
    return Container(
      decoration: _cardDeco(),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.fromLTRB(14, 14, 14, 10), child: Row(children: [
          Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: _kBg, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.calendar_today_outlined, size: 15, color: Color(0xFF6366F1))),
          const SizedBox(width: 8),
          const Text('Mô tả báo cáo đang chọn', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: _kTxt)),
        ])),
        const Divider(height: 1, color: Color(0xFFF3F4F6)),
        Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(width: 44, height: 44, decoration: BoxDecoration(color: sc['color'] as Color, borderRadius: BorderRadius.circular(12)),
              child: Icon(sc['icon'] as IconData, color: Colors.white, size: 22)),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(sc['title'] as String, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: _kTxt)),
              const SizedBox(height: 3),
              Text(sc['desc'] as String, style: const TextStyle(fontSize: 11, color: _kSub, height: 1.4)),
            ])),
          ]),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(10)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('OUTPUT', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: _kSub, letterSpacing: 0.8)),
              const SizedBox(height: 6),
              Wrap(spacing: 6, children: (sc['formats'] as List<String>).map((f) {
                final fb = _formatBadge(f);
                return Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3), decoration: BoxDecoration(color: fb['bg'] as Color, border: Border.all(color: fb['bd'] as Color), borderRadius: BorderRadius.circular(10)),
                  child: Text(f, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: fb['color'] as Color)));
              }).toList()),
            ]))),
            const SizedBox(width: 8),
            Expanded(child: Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(10)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('FILTER HIỆN TẠI', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: _kSub, letterSpacing: 0.8)),
              const SizedBox(height: 6),
              Text('${(p['teams'] as List).length} nhóm / ${(p['students'] as List).length} SV', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _kTxt)),
            ]))),
          ]),
          const SizedBox(height: 12),
          Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(10)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('USE CASES PHÙ HỢP', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: _kSub, letterSpacing: 0.8)),
            const SizedBox(height: 6),
            ...(sc['useCases'] as List<String>).map((u) => Padding(padding: const EdgeInsets.only(bottom: 4), child: Text('• $u', style: const TextStyle(fontSize: 12, color: _kTxt)))),
          ])),
          const SizedBox(height: 12),
          GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 4.5,
            children: (sc['formats'] as List<String>).map((f) => GestureDetector(onTap: () => _handleExport(f),
              child: Container(decoration: BoxDecoration(color: _kT, borderRadius: BorderRadius.circular(10)),
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const Icon(Icons.download_rounded, size: 13, color: Colors.white), const SizedBox(width: 5),
                  Text('Xuất $f', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
                ])))).toList()),
        ])),
      ]),
    );
  }

  Widget _buildQuickSuggestions() {
    final items = [
      {'title':'Báo cáo cuối kỳ theo lớp','sub':'Dùng cho tổng hợp đánh giá toàn lớp','hover':const Color(0xFFF0FDFA),'bd':const Color(0xFF99F6E4),'msg':'Đang tạo báo cáo cuối kỳ cho lớp... (demo)'},
      {'title':'Báo cáo nhóm rủi ro cao','sub':'Nhóm overdue, ít commit, sync thấp','hover':const Color(0xFFFFFBEB),'bd':const Color(0xFFFDE68A),'msg':'Đang tạo báo cáo warning teams... (demo)'},
      {'title':'Báo cáo SV đóng góp thấp','sub':'Phù hợp cho review cá nhân','hover':const Color(0xFFFEF2F2),'bd':const Color(0xFFFECACA),'msg':'Đang tạo báo cáo contribution thấp... (demo)'},
    ];
    return Container(
      decoration: _cardDeco(),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.fromLTRB(14, 14, 14, 10), child: Row(children: [
          Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: _kBg, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.open_in_new_rounded, size: 15, color: _kSub)),
          const SizedBox(width: 8),
          const Text('Gợi ý xuất nhanh', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: _kTxt)),
        ])),
        const Divider(height: 1, color: Color(0xFFF3F4F6)),
        Padding(padding: const EdgeInsets.all(14), child: Column(children: items.map((item) =>
          GestureDetector(onTap: () => _snack(item['msg'] as String),
            child: Container(margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(12)),
              child: Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(item['title'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _kTxt)),
                  const SizedBox(height: 2),
                  Text(item['sub'] as String, style: const TextStyle(fontSize: 10, color: _kSub)),
                ])),
                const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: _kSub),
              ])))).toList())),
      ]),
    );
  }

  Widget _buildExportHistory() {
    return Container(
      decoration: _cardDeco(),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.fromLTRB(14, 14, 14, 10), child: Row(children: [
          Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: _kBg, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.download_outlined, size: 15, color: _kSub)),
          const SizedBox(width: 8),
          const Text('Lịch sử xuất file', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: _kTxt)),
        ])),
        const Divider(height: 1, color: Color(0xFFF3F4F6)),
        Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8), color: const Color(0xFFF9FAFB), child: const Row(children: [
          Expanded(flex: 4, child: Text('Loại báo cáo', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: _kSub, letterSpacing: 0.7))),
          Expanded(flex: 3, child: Text('Đối tượng', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: _kSub, letterSpacing: 0.7))),
          SizedBox(width: 40, child: Center(child: Text('Fmt', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: _kSub)))),
        ])),
        Column(children: _exports.asMap().entries.map((e) {
          final ex = e.value;
          final fb = _formatBadge(ex['format'] as String);
          final isLast = e.key == _exports.length - 1;
          return Container(
            decoration: BoxDecoration(border: isLast ? null : const Border(bottom: BorderSide(color: Color(0xFFF3F4F6)))),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(ex['type'] as String, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _kTxt)),
                  Text('By ${ex['createdBy']}', style: const TextStyle(fontSize: 9, color: _kSub)),
                ])),
                Expanded(child: Text(ex['target'] as String, style: const TextStyle(fontSize: 11, color: _kSub))),
                Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: fb['bg'] as Color, border: Border.all(color: fb['bd'] as Color), borderRadius: BorderRadius.circular(5)),
                  child: Text(ex['format'] as String, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: fb['color'] as Color))),
              ]),
              const SizedBox(height: 5),
              Text(ex['filterSummary'] as String, style: const TextStyle(fontSize: 10, color: _kSub)),
              Text('${ex['date']} • ${ex['size']}', style: const TextStyle(fontSize: 9, color: _kSub)),
              const SizedBox(height: 8),
              Row(children: [
                _actionBtn(Icons.download_rounded, 'Tải lại', const Color(0xFFF0FDFA), const Color(0xFF99F6E4), _kT, () => _snack('Đang tải lại ${ex['type']}... (demo)')),
                const SizedBox(width: 8),
                _actionBtn(Icons.refresh_rounded, 'Lặp lại', Colors.white, _kBd, _kSub, () => _snack('Đang export lại cùng cấu hình "${ex['type']}"... (demo)')),
              ]),
            ]),
          );
        }).toList()),
      ]),
    );
  }

  Widget _actionBtn(IconData icon, String label, Color bg, Color bd, Color color, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(color: bg, border: Border.all(color: bd), borderRadius: BorderRadius.circular(8)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 11, color: color), const SizedBox(width: 4),
        Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color)),
      ])));

  Widget _outlineBtn(IconData icon, String label, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(10)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 13, color: _kSub),
        if (label.isNotEmpty) ...[const SizedBox(width: 5), Text(label, style: const TextStyle(fontSize: 11, color: _kSub, fontWeight: FontWeight.w600))],
      ])));

  Widget _solidBtn(IconData icon, String label, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(color: _kT, borderRadius: BorderRadius.circular(10)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 13, color: Colors.white), const SizedBox(width: 5),
        Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
      ])));

  Widget _dropdown(Map<String,String> items, String value, ValueChanged<String?> onChanged) {
    final safeValue = items.containsKey(value) ? value : items.keys.first;
    return DropdownButtonFormField<String>(
      value: safeValue, onChanged: onChanged, isExpanded: true,
      decoration: InputDecoration(filled: true, fillColor: Colors.white, contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _kBd)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _kBd))),
      items: items.entries.map((e) => DropdownMenuItem(value: e.key, child: Text(e.value, style: const TextStyle(fontSize: 12), overflow: TextOverflow.ellipsis))).toList(),
    );
  }

  BoxDecoration _cardDeco() => BoxDecoration(color: Colors.white, border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(18),
    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)]);
}
