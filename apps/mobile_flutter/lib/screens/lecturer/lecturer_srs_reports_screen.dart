import 'package:flutter/material.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/lecturer_navigation.dart';
import '../../services/auth_service.dart';
import '../../services/lecturer_service.dart';
import '../../models/user.dart';

// ── Design Tokens ──────────────────────────────────────────
const _kTeal = Color(0xFF0D9488);
const _kBg = Color(0xFFF9FAFB);
const _kBorder = Color(0xFFF1F5F9);
const _kText = Color(0xFF111827);
const _kSub = Color(0xFF94A3B8);

class LecturerSrsReportsScreen extends StatefulWidget {
  const LecturerSrsReportsScreen({super.key});
  @override
  State<LecturerSrsReportsScreen> createState() => _LecturerSrsReportsScreenState();
}

class _LecturerSrsReportsScreenState extends State<LecturerSrsReportsScreen> {
  final LecturerService _lecturerService = LecturerService();
  final AuthService _authService = AuthService();
  
  User? _currentUser;
  bool _isLoading = true;
  bool _isReviewing = false;

  List<Map<String, dynamic>> _srsList = [];
  List<Map<String, dynamic>> _courses = [];
  String? _selectedId;
  String _search = '';
  String _statusFilter = 'all';
  String _courseFilter = 'all';
  
  // Review Form
  final TextEditingController _feedbackCtrl = TextEditingController();
  final TextEditingController _scoreCtrl = TextEditingController();

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
        _lecturerService.getSrsReports(),
        _lecturerService.getMyCourses(),
      ]);

      if (mounted) {
        setState(() {
          _currentUser = user;
          _srsList = (results[0] as List).map((e) => _normalizeSrs(e as Map<String, dynamic>)).toList();
          _courses = (results[1] as List).map((e) => e as Map<String, dynamic>).toList();
          
          if (_srsList.isNotEmpty) {
            _selectSrs(_srsList.first['id']);
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Map<String, dynamic> _normalizeSrs(Map<String, dynamic> s) {
    final stats = s['stats'] ?? s['Stats'] ?? s['metrics'] ?? {};
    return {
      'id': (s['id'] ?? s['Id'] ?? 0).toString(),
      'teamName': (s['teamName'] ?? s['groupName'] ?? 'Nhóm chưa tên').toString(),
      'projectName': (s['projectName'] ?? s['topic'] ?? 'N/A').toString(),
      'leaderName': (s['leaderName'] ?? s['leader'] ?? 'N/A').toString(),
      'status': (s['status'] ?? 'SUBMITTED').toString().toUpperCase(),
      'score': (s['score'] ?? 0.0).toDouble(),
      'feedback': (s['feedback'] ?? '').toString(),
      'submittedAt': (s['submittedAt'] ?? s['createdAt'] ?? '2025-03-15').toString(),
      'courseCode': (s['courseCode'] ?? 'N/A').toString(),
      'fileUrl': s['fileUrl'],
      'version': (s['version'] ?? s['Version'] ?? '1.0').toString(),
      'jiraMapped': (s['jiraMapped'] ?? stats['jiraMapped'] ?? stats['jira_task_count'] ?? 0) as int,
      'githubCoverage': (s['githubCoverage'] ?? stats['githubCoverage'] ?? stats['code_coverage'] ?? 0) as int,
      'deadline': (s['deadline'] ?? '2025-04-01').toString(),
    };
  }

  void _selectSrs(String id) {
    final s = _srsList.firstWhere((x) => x['id'] == id);
    setState(() {
      _selectedId = id;
      _feedbackCtrl.text = s['feedback'];
      _scoreCtrl.text = s['score'].toString();
    });
  }

  List<Map<String, dynamic>> get _filtered {
    return _srsList.where((s) {
      final matchKw = _search.isEmpty || 
          s['teamName'].toLowerCase().contains(_search.toLowerCase()) ||
          s['projectName'].toLowerCase().contains(_search.toLowerCase());
      final matchStatus = _statusFilter == 'all' || s['status'] == _statusFilter;
      final matchCourse = _courseFilter == 'all' || s['courseCode'] == _courseFilter;
      return matchKw && matchStatus && matchCourse;
    }).toList();
  }

  // Stats
  int get _reviewingCount => _srsList.where((s) => s['status'] == 'REVIEW' || s['status'] == 'SUBMITTED').length;
  int get _needRevisionCount => _srsList.where((s) => s['status'] == 'NEED_REVISION').length;
  int get _finalCount => _srsList.where((s) => s['status'] == 'FINAL' || s['status'] == 'APPROVED').length;

  Future<void> _handleReview(String status) async {
    if (_selectedId == null) return;
    setState(() => _isReviewing = true);
    
    final scoreText = _scoreCtrl.text.replaceAll(',', '.');
    final score = double.tryParse(scoreText) ?? 0.0;
    
    final ok = await _lecturerService.reviewSrs(
      _selectedId!, 
      status: status, 
      feedback: _feedbackCtrl.text,
      score: score
    );

    if (mounted) {
      setState(() => _isReviewing = false);
      if (ok) {
        final idx = _srsList.indexWhere((s) => s['id'] == _selectedId);
        if (idx >= 0) {
          setState(() {
            _srsList[idx] = {
              ..._srsList[idx],
              'status': status,
              'feedback': _feedbackCtrl.text,
              'score': score
            };
          });
        }
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Cập nhật Review thành công'),
          backgroundColor: _kTeal,
          behavior: SnackBarBehavior.floating,
        ));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Lỗi khi cập nhật Review'),
          backgroundColor: Colors.redAccent,
          behavior: SnackBarBehavior.floating,
        ));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      drawer: const LecturerDrawer(),
      appBar: AppTopHeader(
        title: 'Báo cáo SRS',
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
                  _buildSrsList(),
                  const SizedBox(height: 24),
                  _buildReviewPanel(),
                ]),
              ),
            ),
    );
  }

  Widget _buildBreadcrumb() {
    return Row(children: [
      const Text('Giảng viên', style: TextStyle(fontSize: 11, color: _kTeal, fontWeight: FontWeight.bold)),
      const Icon(Icons.chevron_right, size: 14, color: _kSub),
      const Text('Báo cáo', style: TextStyle(fontSize: 11, color: _kSub, fontWeight: FontWeight.bold)),
      const Icon(Icons.chevron_right, size: 14, color: _kSub),
      const Text('SRS', style: TextStyle(fontSize: 11, color: _kText, fontWeight: FontWeight.bold)),
    ]);
  }

  Widget _buildHeader() {
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Quản lý Tài liệu SRS', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: _kText)),
        SizedBox(height: 4),
        Text('Review, đánh giá và phản hồi các bản đặc tả yêu cầu.', style: TextStyle(fontSize: 13, color: _kSub)),
      ])),
      const SizedBox(width: 12),
      _headerIconBtn(Icons.message_outlined, Colors.orangeAccent),
      const SizedBox(width: 8),
      _headerIconBtn(Icons.download_outlined, _kTeal),
    ]);
  }

  Widget _headerIconBtn(IconData icon, Color color) {
    return Container(
      width: 44, height: 44,
      decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(16), border: Border.all(color: color.withOpacity(0.1))),
      child: IconButton(onPressed: () {}, icon: Icon(icon, size: 18, color: color)),
    );
  }

  Widget _buildStatsGrid() {
    return LayoutBuilder(builder: (context, c) {
      final w = (c.maxWidth - 12) / 2;
      return Wrap(spacing: 12, runSpacing: 12, children: [
        _statCard('Tổng bản nộp', _srsList.length, Icons.file_present_outlined, Colors.indigo, w),
        _statCard('Đang Review', _reviewingCount, Icons.remove_red_eye_outlined, Colors.blue, w),
        _statCard('Cần chỉnh sửa', _needRevisionCount, Icons.refresh_rounded, Colors.orange, w),
        _statCard('Đã hoàn tất', _finalCount, Icons.check_circle_outline, Colors.teal, w),
      ]);
    });
  }

  Widget _statCard(String lbl, int val, IconData icon, Color color, double w) {
    return Container(
      width: w, padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: color.withOpacity(0.05), border: Border.all(color: color.withOpacity(0.1)), borderRadius: BorderRadius.circular(24)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, size: 18, color: color),
        const SizedBox(height: 12),
        Text(val.toString(), style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: color)),
        Text(lbl, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color.withOpacity(0.7))),
      ]),
    );
  }

  Widget _buildFilters() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: _kBorder)),
      child: Column(children: [
        TextField(
          onChanged: (v) => setState(() => _search = v),
          decoration: InputDecoration(
            hintText: 'Tìm nhóm hoặc dự án...', prefixIcon: const Icon(Icons.search, size: 18, color: _kSub),
            filled: true, fillColor: _kBg, border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
          ),
        ),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: _miniSelect('Trạng thái', _statusFilter, {
            'all': 'Tất cả', 'SUBMITTED': 'Đã nộp', 'REVIEW': 'Đang review', 'NEED_REVISION': 'Cần sửa', 'FINAL': 'Hoàn tất'
          }, (v) => setState(() => _statusFilter = v!))),
          const SizedBox(width: 8),
          Expanded(child: _miniSelect('Lớp học', _courseFilter, 
            {'all': 'Tất cả lớp', ...{for (var c in _courses) c['code']: c['code']}}, 
            (v) => setState(() => _courseFilter = v!))),
        ]),
      ]),
    );
  }

  Widget _miniSelect(String lbl, String val, Map<String, String> items, ValueChanged<String?> onChanged) {
    return DropdownButtonFormField<String>(
      value: val, onChanged: onChanged,
      decoration: InputDecoration(
        labelText: lbl, labelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _kSub),
        filled: true, fillColor: _kBg, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      ),
      items: items.entries.map((e) => DropdownMenuItem(value: e.key, child: Text(e.value, style: const TextStyle(fontSize: 12)))).toList(),
    );
  }

  Widget _buildSrsList() {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(32), border: Border.all(color: _kBorder)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Padding(padding: EdgeInsets.all(24), child: Text('Danh sách nộp bài', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900))),
        if (_filtered.isEmpty) 
          const Padding(padding: EdgeInsets.all(40), child: Center(child: Text('Không có dữ liệu', style: TextStyle(color: _kSub))))
        else ..._filtered.asMap().entries.map((e) => _srsItem(e.value, e.key == _filtered.length - 1)),
      ]),
    );
  }

  Widget _srsItem(Map<String, dynamic> s, bool isLast) {
    final selected = _selectedId == s['id'];
    return InkWell(
      onTap: () => _selectSrs(s['id']),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: selected ? _kTeal.withOpacity(0.05) : Colors.transparent,
          border: isLast ? null : const Border(bottom: BorderSide(color: _kBg)),
        ),
        child: Row(children: [
          Container(width: 40, height: 40, decoration: BoxDecoration(color: _kBg, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.insert_drive_file_outlined, size: 18, color: _kTeal)),
          const SizedBox(width: 16),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(s['teamName'], style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
            Text(s['courseCode'], style: const TextStyle(color: _kSub, fontSize: 10, fontWeight: FontWeight.bold)),
          ])),
          _badge(s['status']),
        ]),
      ),
    );
  }

  Widget _badge(String status) {
    final color = status == 'FINAL' ? Colors.teal : (status == 'NEED_REVISION' ? Colors.orange : Colors.blue);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
      child: Text(status, style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: color)),
    );
  }

  Widget _buildReviewPanel() {
    if (_selectedId == null) return _emptyReview();
    final s = _srsList.firstWhere((x) => x['id'] == _selectedId);
    
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(32), border: Border.all(color: _kBorder)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('CHI TIẾT THẨM ĐỊNH', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: _kSub, letterSpacing: 1.2)),
          if (s['fileUrl'] != null) IconButton(onPressed: () {}, icon: const Icon(Icons.open_in_new, size: 16, color: _kTeal)),
        ]),
        const SizedBox(height: 16),
        Text(s['teamName'], style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: _kText)),
        const SizedBox(height: 4),
        Row(children: [
          const Icon(Icons.people_outline, size: 14, color: _kSub),
          const SizedBox(width: 6),
          Text(s['leaderName'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _kSub)),
          const SizedBox(width: 12),
          const Icon(Icons.calendar_today_outlined, size: 12, color: _kSub),
          const SizedBox(width: 6),
          Text('Hạn chót: ${s['deadline']}', style: const TextStyle(fontSize: 11, color: _kSub)),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          _miniStat(Icons.terminal_rounded, 'GitHub', '${s['githubCoverage']}%'),
          const SizedBox(width: 12),
          _miniStat(Icons.folder_shared_outlined, 'Jira', '${s['jiraMapped']} items'),
        ]),
        const SizedBox(height: 24),
        Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: _kBg, borderRadius: BorderRadius.circular(24), border: Border.all(color: _kBorder)),
          child: Text('"${s['projectName']}"', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, fontStyle: FontStyle.italic, color: Color(0xFF475569), height: 1.5))),
        const SizedBox(height: 24),
        
        const Text('Điểm Review (0-10)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: _kSub)),
        const SizedBox(height: 8),
        TextField(
          controller: _scoreCtrl, keyboardType: TextInputType.number,
          decoration: InputDecoration(
            suffixIcon: const Icon(Icons.star, color: Colors.amber, size: 18),
            filled: true, fillColor: _kBg, border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
          ),
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.amber),
        ),
        
        const SizedBox(height: 20),
        const Text('Phản hồi của Giảng viên', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: _kSub)),
        const SizedBox(height: 8),
        TextField(
          controller: _feedbackCtrl, maxLines: 5,
          decoration: InputDecoration(
            hintText: 'Nhập nội dung góp ý...',
            filled: true, fillColor: _kBg, border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
          ),
          style: const TextStyle(fontSize: 13, height: 1.5),
        ),
        
        const SizedBox(height: 32),
        Row(children: [
          Expanded(child: _actionBtn('Yêu cầu sửa', () => _handleReview('NEED_REVISION'), color: Colors.orangeAccent)),
          const SizedBox(width: 12),
          Expanded(child: _actionBtn('Duyệt Final', () => _handleReview('FINAL'), color: _kTeal)),
        ]),
      ]),
    );
  }

  Widget _miniStat(IconData icon, String lbl, String val) {
    return Row(children: [
      Icon(icon, size: 14, color: _kTeal),
      const SizedBox(width: 4),
      Text('$lbl: ', style: const TextStyle(fontSize: 10, color: _kSub)),
      Text(val, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _kTeal)),
    ]);
  }

  Widget _emptyReview() {
    return Container(
      width: double.infinity, padding: const EdgeInsets.all(60),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(32), border: Border.all(color: _kBorder)),
      child: const Center(child: Text('Vui lòng chọn một bản nộp để review', style: TextStyle(color: _kSub, fontWeight: FontWeight.bold, fontSize: 12))),
    );
  }

  Widget _actionBtn(String label, VoidCallback onTap, {required Color color}) {
    return SizedBox(height: 58, 
      child: ElevatedButton(
        onPressed: _isReviewing ? null : onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: color, foregroundColor: Colors.white, elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
        child: _isReviewing ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
          : Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
      ));
  }
}
