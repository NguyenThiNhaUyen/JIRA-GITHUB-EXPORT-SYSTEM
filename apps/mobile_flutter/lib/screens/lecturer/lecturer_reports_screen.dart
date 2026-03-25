import 'package:flutter/material.dart';
import 'package:open_file/open_file.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/lecturer_navigation.dart';
import '../../services/auth_service.dart';
import '../../services/lecturer_service.dart';
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
  {'id':'by-course','color':const Color(0xFF14B8A6),'icon':Icons.table_chart_outlined,'title':'Báo cáo theo Lớp','desc':'Tổng hợp tiến độ tất cả nhóm trong một lớp học. Bao gồm: số nhóm, trạng thái GitHub/Jira, cảnh báo.','formats':['PDF','Excel'],'fields':['Lớp học','Tổng số nhóm','Tổng Commits','Tiến độ Jira','Cảnh báo','Tổng hợp rủi ro'],'useCases':['Tổng hợp tiến độ cả lớp','Báo cáo giữa kỳ / cuối kỳ']},
  {'id':'by-group','color':const Color(0xFF3B82F6),'icon':Icons.description_outlined,'title':'Báo cáo theo Nhóm','desc':'Chi tiết hoạt động từng nhóm: commit, issue, member, deadline.','formats':['PDF','Excel'],'fields':['Nhóm & Dự án','Số Commits','Issues hoàn thành','PR merged','Overdue tasks','Contribution balance'],'useCases':['Review nhóm cụ thể','Kiểm tra mất cân bằng task']},
  {'id':'by-student','color':const Color(0xFF6366F1),'icon':Icons.check_box_outlined,'title':'Báo cáo theo Sinh viên','desc':'Đóng góp cá nhân: commits, issues, sprint coverage. Phù hợp dùng cho bảng điểm quá trình.','formats':['PDF','CSV'],'fields':['Tên sinh viên','Nhóm','Commits','Issues hoàn thành','Sprint coverage','Contribution score'],'useCases':['Hỗ trợ chấm điểm cá nhân','Xác định SV đóng góp ít']},
  {'id':'by-warning','color':const Color(0xFFF59E0B),'icon':Icons.warning_amber_rounded,'title':'Báo cáo Cảnh báo','desc':'Nhóm/SV có rủi ro cao dựa trên phân tích AI/Hệ thống.','formats':['PDF','Excel'],'fields':['Mức độ rủi ro','Loại cảnh báo','Task quá hạn','Thành viên không hoạt động','Cố gắng đóng góp thấp'],'useCases':['Gửi cảnh báo sớm','Theo dõi nhóm nguy cơ']},
  {'id':'by-sync','color':const Color(0xFF8B5CF6),'icon':Icons.account_tree_outlined,'title':'Đối chiếu Jira/GH','desc':'Phân tích khớp dữ liệu giữa Task Jira và Code Commits.','formats':['PDF','Excel'],'fields':['Độ phủ Jira','Độ phủ GitHub','Issue-code mismatch','Execution ratio','Sync score'],'useCases':['Phát hiện lệch Jira/GitHub','Kiểm tra minh bạch quy trình']},
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
  final LecturerService _lecturerService = LecturerService();
  final AuthService _authService = AuthService();
  User? _currentUser;
  bool _isLoading = true;

  String _selectedType = 'by-course';
  String _search = '';
  String _courseFilter = 'all';
  String _teamFilter = 'all';
  String _semesterFilter = 'all';
  String _riskFilter = 'all';

  List<Map<String, dynamic>> _courseList = [];
  List<Map<String, dynamic>> _teamList = [];
  List<Map<String, dynamic>> _studentList = [];
  List<Map<String, dynamic>> _exportHistory = [];

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    setState(() => _isLoading = true);
    try {
      final user = await _authService.getCurrentUser();
      if (user != null) {
        final courses = await _lecturerService.getMyCourses();
        
        // Fetch teams and students for all courses to provide a complete overview
        final allTeams = <Map<String, dynamic>>[];
        final allStudents = <Map<String, dynamic>>[];
        
        for (final course in courses) {
          final courseId = course['id'];
          if (courseId != null) {
            final results = await Future.wait([
              _lecturerService.getCourseGroups(courseId),
              _lecturerService.getCourseStudents(courseId),
            ]);
            
            final normalizedGroups = (results[0] as List).map((g) {
              final norm = _normalizeGroup(g as Map<String, dynamic>);
              return {...norm, 'courseId': courseId.toString()};
            }).toList();
            
            final normalizedStudents = (results[1] as List).map((s) {
              final norm = _normalizeStudent(s as Map<String, dynamic>);
              return {...norm, 'courseId': courseId.toString()};
            }).toList();

            allTeams.addAll(normalizedGroups);
            allStudents.addAll(normalizedStudents);
          }
        }

        final myReports = await _lecturerService.getMyReports();

        if (mounted) {
          setState(() {
            _currentUser = user;
            _courseList = courses.map(_normalizeCourse).toList();
            _teamList = allTeams;
            _studentList = allStudents;
            _exportHistory = myReports;
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        print("Error loading initial data: $e");
      }
    }
  }

  Map<String, dynamic> _normalizeCourse(Map<String, dynamic> c) {
    return {
      'id': (c['id'] ?? 0).toString(),
      'name': (c['courseName'] ?? c['name'] ?? 'N/A').toString(),
      'code': (c['courseCode'] ?? c['code'] ?? 'N/A').toString(),
      'className': (c['courseName'] ?? c['name'] ?? 'N/A').toString(),
    };
  }

  Map<String, dynamic> _normalizeGroup(Map<String, dynamic> g) {
    final integration = g['integration'] ?? {};
    return {
      'id': (g['id'] ?? 0).toString(),
      'name': (g['name'] ?? 'N/A').toString(),
      'project': (g['description'] ?? g['topic'] ?? 'No project').toString(),
      'commits': (g['commitsCount'] ?? 0) as int,
      'issuesDone': (g['issuesDone'] ?? 0) as int,
      'issuesTotal': (g['issuesTotal'] ?? 10) as int, // Default for mock
      'warningCount': (g['warningCount'] ?? 0) as int,
      'sprintCompletion': (g['sprintCompletion'] ?? 0) as int,
      'jiraCoverage': (g['jiraCoverage'] ?? 0) as int,
      'githubCoverage': (g['githubCoverage'] ?? 0) as int,
      'riskLevel': (g['riskLevel'] ?? 'Low').toString(),
      'overdueTasks': (g['overdueTasks'] ?? 0) as int,
      'githubStatus': (g['githubStatus'] ?? integration['approvalStatus'] ?? 'NOT_CONNECTED').toString(),
      'jiraStatus': (g['jiraStatus'] ?? integration['approvalStatus'] ?? 'NOT_CONNECTED').toString(),
    };
  }

  Map<String, dynamic> _normalizeStudent(Map<String, dynamic> s) {
    return {
      'id': (s['userId'] ?? s['id'] ?? 0).toString(),
      'name': (s['fullName'] ?? s['name'] ?? 'N/A').toString(),
      'studentCode': (s['studentCode'] ?? s['code'] ?? '').toString(),
      'contributionScore': (s['contributionScore'] ?? 0) as int,
      'sprintCoverage': (s['sprintCoverage'] ?? 0) as int,
      'commits': (s['commitsCount'] ?? 0) as int,
      'status': (s['status'] ?? 'Active').toString(),
      'teamId': (s['groupId'] ?? s['teamId'] ?? '').toString(),
    };
  }

  Map<String,dynamic> get _selectedConfig => _exportTypes.firstWhere((e) => e['id'] == _selectedType);

  List<Map<String,dynamic>> get _teamOptions {
    if (_courseFilter == 'all') return _teamList;
    return _teamList.where((t) => t['courseId'] == _courseFilter).toList();
  }

  // Computed preview data
  Map<String,dynamic> get _preview {
    var teams = _teamList.toList();
    var students = _studentList.toList();
    if (_courseFilter != 'all') {
      teams = teams.where((t) => t['courseId'] == _courseFilter).toList();
      students = students.where((s) => s['courseId'] == _courseFilter).toList();
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
  int get _riskyTeams => _teamList.where((t) => t['riskLevel'] == 'High').length;
  int get _warnStudents => _studentList.where((s) => s['status'] == 'Warning' || s['status'] == 'At Risk').length;
  int get _overdueTasks => _teamList.fold<int>(0, (s, t) => s + (t['overdueTasks'] as int));
  int get _avgCompletion => _teamList.isEmpty ? 0 : (_teamList.fold<int>(0, (s, t) => s + (t['sprintCompletion'] as int)) / _teamList.length).round();

  String get _scopeLabel {
    if (_teamFilter != 'all') {
      final t = _teamList.firstWhere((t) => t['id'] == _teamFilter, orElse: () => {});
      return t['name'] ?? 'Nhóm đã chọn';
    }
    if (_courseFilter != 'all') {
      final c = _courseList.firstWhere((c) => c['id'] == _courseFilter, orElse: () => {});
      return '${c['code']} - ${c['className']}';
    }
    return 'Toàn bộ dữ liệu phù hợp';
  }

  Future<void> _handleExport(String fmt) async {
    try {
      _snack('Đang yêu cầu tạo file $fmt cho "${_selectedConfig['title']}"...');
      
      Map<String, dynamic>? res;
      final typeId = _selectedType;
      
      if (typeId == "by-course") {
        if (_courseFilter == 'all') throw Exception("Vui lòng chọn một lớp cụ thể để xuất báo cáo lớp.");
        res = await _lecturerService.generateCommitStats(courseId: _courseFilter, format: fmt);
      } else if (typeId == "by-group") {
        if (_teamFilter == 'all') throw Exception("Vui lòng chọn một nhóm cụ thể để xuất báo cáo nhóm.");
        res = await _lecturerService.generateTeamRoster(projectId: _teamFilter, format: fmt);
      } else if (typeId == "by-sync") {
        if (_teamFilter == 'all') throw Exception("Vui lòng chọn một nhóm để đối chiếu.");
        res = await _lecturerService.generateSrsReport(projectId: _teamFilter, format: fmt);
      } else {
        _snack('Tính năng trích xuất "${_selectedConfig['title']}" sẽ sớm khả dụng.');
        return;
      }

      if (res != null && res['reportId'] != null) {
        final rid = res['reportId'];
        final fileName = (res['fileName'] ?? 'report_$rid.${fmt.toLowerCase()}').toString();
        final filePath = res['filePath'] ?? res['fileUrl'] ?? res['url'];
        _snack('Đang tải file $fmt...');
        final path = await _lecturerService.downloadReportFile(rid, fileName, filePath: filePath?.toString());
        final result = await OpenFile.open(path);
        if (result.type != ResultType.done) {
          throw Exception('Không thể mở file: ${result.message}');
        }
        _loadInitialData();
      } else {
        throw Exception("Không khởi tạo được yêu cầu trích xuất.");
      }
    } catch (e) {
      _snack('Lỗi: ${e.toString().replaceAll('Exception: ', '')}');
    }
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
            Text('Báo cáo', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _kTxt)),
          ]),
          const SizedBox(height: 12),
          // Header
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Trung tâm Báo cáo', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: _kTxt)),
              SizedBox(height: 4),
              Text('Trích xuất dữ liệu học thuật, đối chiếu tiến độ Jira/GitHub và đánh giá rủi ro.', style: TextStyle(fontSize: 12, color: _kSub, height: 1.5)),
            ])),
            Column(children: [
              _outlineBtn(Icons.filter_list_rounded, 'Báo cáo tùy chỉnh', () => _snack('Đang tạo báo cáo tùy chỉnh... (demo)')),
              const SizedBox(height: 6),
              _solidBtn(Icons.download_rounded, 'Export nhanh', () => _snack('Đang export nhanh báo cáo tổng quan... (demo)')),
            ]),
          ]),
          const SizedBox(height: 14),
          _buildStats(),
          const SizedBox(height: 14),
          _buildFilters(p),
          const SizedBox(height: 24),
          const Text('DANH MỤC BÁO CÁO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: _kSub, letterSpacing: 1.0)),
          const SizedBox(height: 12),
          _buildExportTypeCards(),
          const SizedBox(height: 24),
          _buildPreviewPanel(p),
          const SizedBox(height: 24),
          _buildSyncCard(),
          const SizedBox(height: 24),
          _buildExportHistory(),
          const SizedBox(height: 32),
          const Center(child: Text('Dữ liệu được bảo mật và mã hóa theo tiêu chuẩn hệ thống.', style: TextStyle(fontSize: 10, color: _kSub), textAlign: TextAlign.center)),
        ]),
      ),
    );
  }

  Widget _buildStats() {
    final items = [
      {'label':'Tổng báo cáo','value':'${_exportHistory.length}','icon':Icons.bar_chart_rounded,'bg':Colors.white,'bd':_kBd,'color':_kTxt},
      {'label':'Xuất tuần này','value':'3','icon':Icons.file_download_outlined,'bg':const Color(0xFFF0FDFA),'bd':const Color(0xFF99F6E4),'color':const Color(0xFF0D9488)},
      {'label':'Nhóm rủi ro','value':'$_riskyTeams','icon':Icons.warning_amber_rounded,'bg':const Color(0xFFFEF2F2),'bd':const Color(0xFFFECACA),'color':const Color(0xFFDC2626)},
      {'label':'SV cần chú ý','value':'$_warnStudents','icon':Icons.shield_outlined,'bg':const Color(0xFFFFFBEB),'bd':const Color(0xFFFDE68A),'color':const Color(0xFFB45309)},
      {'label':'Overdue tasks','value':'$_overdueTasks','icon':Icons.access_time_rounded,'bg':const Color(0xFFEFF6FF),'bd':const Color(0xFFBFDBFE),'color':const Color(0xFF2563EB)},
      {'label':'TB Sprint','value':'$_avgCompletion%','icon':Icons.check_circle_outline_rounded,'bg':const Color(0xFFEEF2FF),'bd':const Color(0xFFC7D2FE),'color':const Color(0xFF6366F1)},
    ];
    return GridView.builder(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 2.3),
      itemCount: items.length,
      itemBuilder: (_, i) {
        final s = items[i];
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(color: s['bg'] as Color, border: Border.all(color: s['bd'] as Color), borderRadius: BorderRadius.circular(16)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Expanded(child: Text(s['label'] as String, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: (s['color'] as Color).withOpacity(0.7)), overflow: TextOverflow.ellipsis)),
              Icon(s['icon'] as IconData, size: 14, color: s['color'] as Color),
            ]),
            const SizedBox(height: 2),
            Text(s['value'] as String, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: s['color'] as Color)),
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
          decoration: InputDecoration(hintText: 'Tìm nhóm, dự án...', hintStyle: const TextStyle(fontSize: 12, color: _kSub),
            prefixIcon: const Icon(Icons.search_rounded, size: 16, color: _kSub),
            filled: true, fillColor: _kBg, contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kBd)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kBd)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _kT, width: 1.5)))),
        const SizedBox(height: 10),
        Row(children: [
          Expanded(child: _dropdown({'all':'Tất cả lớp học', ..._courseList.asMap().map((_, c) => MapEntry(c['id'] as String, '${c['code']} - ${c['className'] ?? c['name']}'))}, _courseFilter, (v) => setState(() { _courseFilter = v!; _teamFilter = 'all'; }))),
          const SizedBox(width: 8),
          Expanded(child: _dropdown({'all':'Tất cả nhóm', ..._teamOptions.asMap().map((_, t) => MapEntry(t['id'] as String, t['name'] as String))}, _teamFilter, (v) => setState(() => _teamFilter = v!))),
        ]),
        const SizedBox(height: 10),
        Container(
          width: double.infinity, padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(color: const Color(0xFFF0FDFA), border: Border.all(color: const Color(0xFF99F6E4)), borderRadius: BorderRadius.circular(12)),
          child: Center(child: Text('Tìm thấy ${(p['teams'] as List).length} mục', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF0F766E)))),
        ),
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
    final riskyTeams = teams.where((t) => t['riskLevel'] == 'High' || t['riskLevel'] == 'Medium').toList();

    return Container(
      decoration: _cardDeco(),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.fromLTRB(14, 14, 14, 10), child: Row(children: [
          Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: const Color(0xFFF0FDFA), borderRadius: BorderRadius.circular(8)),
            child: const Icon(Icons.remove_red_eye_outlined, size: 15, color: Color(0xFF0F766E))),
          const SizedBox(width: 8),
          Expanded(child: Text('Preview: ${sc['title']}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: _kTxt), overflow: TextOverflow.ellipsis)),
          const Spacer(),
          ...((sc['formats'] as List<String>).map((f) => Padding(
            padding: const EdgeInsets.only(left: 6),
            child: _outlineBtn(Icons.download_rounded, f, () => _handleExport(f))))),
        ])),
        const Divider(height: 1, color: Color(0xFFF3F4F6)),
        Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Real-time Data Generation', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: _kSub)),
          const SizedBox(height: 12),
          GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: 2.2,
            children: [
              _miniStat('Teams', '${teams.length}', Icons.people_outline, const Color(0xFFF0FDFA), const Color(0xFF99F6E4), const Color(0xFF0D9488)),
              _miniStat('Commits', '${p['totalCommits']}', Icons.code_rounded, const Color(0xFFEFF6FF), const Color(0xFFBFDBFE), const Color(0xFF2563EB)),
              _miniStat('Avg Sync', '${p['avgSync']}%', Icons.account_tree_outlined, const Color(0xFFEEF2FF), const Color(0xFFC7D2FE), const Color(0xFF6366F1)),
              _miniStat('Warnings', '${p['totalWarnings']}', Icons.warning_amber_rounded, const Color(0xFFFEF2F2), const Color(0xFFFECACA), const Color(0xFFDC2626)),
            ]),
          const SizedBox(height: 20),
          const Text('DANH SÁCH NHÓM RỦI RO', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: _kSub, letterSpacing: 0.8)),
          const SizedBox(height: 12),
          if (riskyTeams.isEmpty) 
            const Padding(padding: EdgeInsets.symmetric(vertical: 20), child: Center(child: Text('Không có nhóm rủi ro nào', style: TextStyle(fontSize: 11, color: _kSub, fontStyle: FontStyle.italic))))
          else ...riskyTeams.map((t) => Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFFF9FAFB), border: Border.all(color: _kBd), borderRadius: BorderRadius.circular(14)),
            child: Row(children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Expanded(child: Text(t['name'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: _kTxt), overflow: TextOverflow.ellipsis)),
                  const SizedBox(width: 8),
                  _iBadge(t['githubStatus'] == 'APPROVED', 'GH'),
                  const SizedBox(width: 4),
                  _iBadge(t['jiraStatus'] == 'APPROVED', 'JR'),
                ]),
                Text(t['project'] as String, style: const TextStyle(fontSize: 10, color: _kSub), overflow: TextOverflow.ellipsis),
              ])),
              const SizedBox(width: 8),
              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: (t['riskLevel'] == 'High' ? Colors.red.shade50 : Colors.orange.shade50), borderRadius: BorderRadius.circular(6)),
                child: Text(t['riskLevel'] as String, style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: (t['riskLevel'] == 'High' ? Colors.red.shade700 : Colors.orange.shade700)))),
            ]),
          )),
        ])),
      ]),
    );
  }

  Widget _buildSyncCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(32)),
      child: Column(children: [
        Container(width: 56, height: 56, decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle), child: const Icon(Icons.sync_rounded, size: 28, color: Color(0xFF4F46E5))),
        const SizedBox(height: 16),
        const Text('Đồng bộ tự động', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF1E1B4B))),
        const SizedBox(height: 6),
        const Text('Dữ liệu được làm mới mỗi 15 phút từ Jira & GitHub.', style: TextStyle(fontSize: 12, color: Color(0xFF475569)), textAlign: TextAlign.center),
        const SizedBox(height: 20),
        SizedBox(width: double.infinity, height: 52, child: ElevatedButton(
          onPressed: () async {
            if (_teamFilter != 'all') {
              _snack('Đang yêu cầu đồng bộ cho nhóm ${_teamFilter}...');
              final ok = await _lecturerService.syncProject(_teamFilter);
              if (ok) {
                _snack('Đã bắt đầu đồng bộ dữ liệu mã nguồn!');
              } else {
                _snack('Lỗi: Không thể khởi tạo đồng bộ.');
              }
            } else {
              _snack('Vui lòng chọn một nhóm để đồng bộ.');
            }
          },
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F46E5), foregroundColor: Colors.white, elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
          child: const Text('Sync Now', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
        )),
      ]),
    );
  }

  Widget _iBadge(bool ok, String label) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
    decoration: BoxDecoration(
      color: ok ? const Color(0xFFF0FDFA) : const Color(0xFFF9FAFB),
      borderRadius: BorderRadius.circular(4),
      border: Border.all(color: ok ? const Color(0xFF99F6E4) : _kBd),
    ),
    child: Text(label, style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: ok ? _kT : _kSub)),
  );

  Widget _miniStat(String label, String value, IconData icon, Color bg, Color bd, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
    decoration: BoxDecoration(color: bg, border: Border.all(color: bd), borderRadius: BorderRadius.circular(12)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [Expanded(child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color), overflow: TextOverflow.ellipsis)), const SizedBox(width: 4), Icon(icon, size: 12, color: color)]),
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

  Widget _buildExportHistory() {
    return Container(
      decoration: _cardDeco(),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.fromLTRB(20, 20, 20, 16), child: Row(children: [
          Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: _kBg, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.history_rounded, size: 18, color: _kT)),
          const SizedBox(width: 12),
          const Text('Lịch sử xuất', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF1F2937))),
        ])),
        const Divider(height: 1, color: Color(0xFFF3F4F6)),
        if (_exportHistory.isEmpty)
          const Padding(padding: EdgeInsets.symmetric(vertical: 40), child: Center(child: Text('Chưa có lịch sử', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: _kSub))))
        else
          Column(children: _exportHistory.map((ex) {
            final fb = _formatBadge(ex['format'] as String);
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF9FAFB)))),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Expanded(child: Text(ex['type'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF374151)), overflow: TextOverflow.ellipsis)),
                  Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: fb['bg'] as Color, borderRadius: BorderRadius.circular(6)),
                    child: Text(ex['format'] as String, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: fb['color'] as Color))),
                ]),
                const SizedBox(height: 4),
                Text('${ex['fileName'] ?? 'Báo cáo'} • ${ex['date']}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
                const SizedBox(height: 14),
                SizedBox(height: 36, child: _solidBtn(Icons.download_rounded, 'Tải xuống', () => _downloadReport(ex['id'] ?? ex['reportId']))),
              ]),
            );
          }).toList()),
      ]),
    );
  }

  Future<void> _downloadReport(dynamic reportId) async {
    final report = _exportHistory.firstWhere(
      (r) => (r['id'] ?? r['reportId'])?.toString() == reportId?.toString(),
      orElse: () => {},
    );
    final fileName = report['fileName']?.toString() ?? 'report_$reportId.pdf';
    final filePath = report['filePath']?.toString();

    try {
      _snack('Đang tải file báo cáo...');

      // Thử 1: download file cũ (nếu vẫn còn trên server)
      String? localPath;
      try {
        localPath = await _lecturerService.downloadReportFile(
          reportId, fileName, filePath: filePath);
      } catch (_) {
        localPath = null;
      }

      // Thử 2: file không còn → regenerate rồi tải file mới vừa tạo
      if (localPath == null) {
        _snack('Đang tạo lại báo cáo...');
        final newData = await _lecturerService.regenerateReport(report);
        if (newData == null) throw Exception('Không thể tạo lại báo cáo này.');

        final newId = newData['reportId'] ?? newData['ReportId'] ?? newData['id'];
        if (newId == null) throw Exception('Không nhận được ID báo cáo mới.');

        final newFileUrl = newData['fileUrl'] ?? newData['FileUrl']
            ?? newData['filePath'] ?? newData['file_url'];

        _snack('Đang tải file...');
        localPath = await _lecturerService.downloadReportFile(
          newId, fileName, filePath: newFileUrl?.toString());

        _loadInitialData(); // refresh lịch sử
      }

      final result = await OpenFile.open(localPath);
      if (result.type != ResultType.done) {
        throw Exception('Không thể mở file: ${result.message}');
      }
    } catch (e) {
      _snack('Lỗi: ${e.toString().replaceAll('Exception: ', '')}');
    }
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
