import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/admin_navigation.dart';

class CourseManagementScreen extends StatefulWidget {
  const CourseManagementScreen({super.key});
  @override
  State<CourseManagementScreen> createState() => _CourseManagementScreenState();
}

class _CourseManagementScreenState extends State<CourseManagementScreen> {
  static const Color bg = Color(0xFFF8FAFC);
  static const Color border = Color(0xFFE2E8F0);
  static const Color txtPrimary = Color(0xFF0F172A);
  static const Color txtSec = Color(0xFF64748B);
  static const Color blue = Color(0xFF2563EB);

  final _searchCtrl = TextEditingController();
  String _search = '';
  String _filterSem = '';

  final List<Map<String, dynamic>> _semesters = [
    {'id': 1, 'code': 'FA24', 'name': 'Fall 2024'},
    {'id': 2, 'code': 'SP25', 'name': 'Spring 2025'},
    {'id': 3, 'code': 'SU25', 'name': 'Summer 2025'},
  ];

  final List<Map<String, dynamic>> _subjects = [
    {'id': 1, 'code': 'SWD392', 'name': 'Software Architecture'},
    {'id': 2, 'code': 'PRJ301', 'name': 'Java Web Application'},
    {'id': 3, 'code': 'SWP391', 'name': 'Software Engineering Project'},
    {'id': 4, 'code': 'AI301', 'name': 'Machine Learning'},
  ];

  final List<Map<String, dynamic>> _lecturers = [
    {'id': 'L1', 'name': 'Nguyễn Văn Nam', 'email': 'namnv@fe.edu.vn'},
    {'id': 'L2', 'name': 'Trần Thị Lan', 'email': 'lantt@fe.edu.vn'},
    {'id': 'L3', 'name': 'Lê Văn Hùng', 'email': 'hunglv@fe.edu.vn'},
    {'id': 'L4', 'name': 'Phạm Minh Tuấn', 'email': 'tuanpm@fe.edu.vn'},
    {'id': 'L5', 'name': 'Hoàng Thị Mai', 'email': 'maiht@fe.edu.vn'},
  ];

  final List<Map<String, dynamic>> _allStudents = List.generate(
    20,
    (i) => {
      'id': i + 1,
      'name': 'Sinh viên ${i + 1}',
      'studentId': 'SE18${(100 + i).toString().padLeft(3, '0')}',
      'email': 'sv${i + 1}@fpt.edu.vn',
    },
  );

  late List<Map<String, dynamic>> _courses;

  @override
  void initState() {
    super.initState();
    _courses = [
      {
        'id': 'C1',
        'code': 'se1821',
        'name': 'Software Architecture – Lớp 01',
        'subjectId': 1,
        'semesterId': 1,
        'currentStudents': 32,
        'maxStudents': 40,
        'status': 'ACTIVE',
        'lecturers': [
          {'id': 'L1', 'name': 'Nguyễn Văn Nam'},
        ],
        'students': _allStudents
            .take(32)
            .map((s) => {...s, 'enrollmentId': 'E${s["id"]}'})
            .toList(),
      },
      {
        'id': 'C2',
        'code': 'prj1801',
        'name': 'Java Web Application – Lớp 01',
        'subjectId': 2,
        'semesterId': 1,
        'currentStudents': 15,
        'maxStudents': 40,
        'status': 'UPCOMING',
        'lecturers': [],
        'students': [],
      },
      {
        'id': 'C3',
        'code': 'swp1810',
        'name': 'SE Project – Lớp 01',
        'subjectId': 3,
        'semesterId': 2,
        'currentStudents': 15,
        'maxStudents': 35,
        'status': 'COMPLETED',
        'lecturers': [
          {'id': 'L3', 'name': 'Lê Văn Hùng'},
        ],
        'students': _allStudents
            .take(15)
            .map((s) => {...s, 'enrollmentId': 'E${s["id"]}'})
            .toList(),
      },
      {
        'id': 'C4',
        'code': 'ai1820',
        'name': 'Machine Learning – Lớp 01',
        'subjectId': 4,
        'semesterId': 2,
        'currentStudents': 28,
        'maxStudents': 45,
        'status': 'ACTIVE',
        'lecturers': [
          {'id': 'L4', 'name': 'Phạm Minh Tuấn'},
        ],
        'students': _allStudents
            .take(5)
            .map((s) => {...s, 'enrollmentId': 'E${s["id"]}'})
            .toList(),
      },
    ];
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  // ── Helpers ──────────────────────────────────────────────
  String _subjectCode(int id) =>
      (_subjects.firstWhere((s) => s['id'] == id, orElse: () => {})['code'] ??
              'N/A')
          as String;

  String _semesterName(int id) =>
      (_semesters.firstWhere((s) => s['id'] == id, orElse: () => {})['name'] ??
              'N/A')
          as String;

  String? _lecturerName(Map<String, dynamic> c) {
    final lecs = c['lecturers'] as List? ?? [];
    return lecs.isNotEmpty ? lecs[0]['name'] as String : null;
  }

  List<Map<String, dynamic>> get _filtered {
    return _courses.where((c) {
      final matchSem =
          _filterSem.isEmpty || c['semesterId'].toString() == _filterSem;
      final matchSearch =
          _search.isEmpty ||
          (c['code'] as String).toLowerCase().contains(_search.toLowerCase()) ||
          (c['name'] as String).toLowerCase().contains(_search.toLowerCase());
      return matchSem && matchSearch;
    }).toList();
  }

  void _snack(String msg, {bool ok = true}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: ok ? const Color(0xFF16A34A) : Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  // ── Build ────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isMobile = width < 900;
    final horizontalPadding = isMobile ? 16.0 : 24.0;

    return Scaffold(
      backgroundColor: const Color(0xFFEFF7F5),
      drawer: isMobile ? const AdminDrawer() : null,
      body: SafeArea(
        child: Row(
          children: [
            if (!isMobile) const AdminSidebar(),
            Expanded(
              child: Container(
                margin: EdgeInsets.all(isMobile ? 0 : 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(isMobile ? 0 : 36),
                ),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  children: [
                    _buildTopHeader(isMobile),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: EdgeInsets.all(horizontalPadding),
                        child: Center(
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(maxWidth: 1400),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildStats(),
                                const SizedBox(height: 12),
                                _buildSearchFilter(),
                                const SizedBox(height: 12),
                                if (_filtered.isEmpty)
                                  _buildEmpty()
                                else
                                  ListView.builder(
                                    shrinkWrap: true,
                                    physics: const NeverScrollableScrollPhysics(),
                                    itemCount: _filtered.length,
                                    itemBuilder: (_, i) => _buildCourseCard(_filtered[i]),
                                  ),
                                const SizedBox(height: 24),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopHeader(bool isMobile) {
    return AppTopHeader(
      title: 'Quản lý Lớp học',
      primary: false,
      user: const AppUser(
        name: 'Super Admin',
        email: 'admin@fe.edu.vn',
        role: 'ADMIN',
      ),
      actions: [
        IconButton(
          icon: const Icon(
            Icons.add_circle_outline_rounded,
            color: Color(0xFF2563EB),
          ),
          onPressed: _openCreate,
          tooltip: 'Thêm lớp học',
        ),
      ],
    );
  }

  Widget _buildSearchFilter() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Column(
        children: [
          TextField(
            controller: _searchCtrl,
            onChanged: (v) => setState(() => _search = v),
            decoration: InputDecoration(
              hintText: 'Tìm mã lớp, tên lớp...',
              hintStyle: const TextStyle(color: txtSec, fontSize: 13),
              prefixIcon: const Icon(Icons.search_rounded, color: txtSec),
              filled: true,
              fillColor: bg,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 0,
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: border),
              ),
            ),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: _filterSem.isEmpty ? null : _filterSem,
            hint: const Text('Tất cả học kỳ', style: TextStyle(fontSize: 13)),
            onChanged: (v) => setState(() => _filterSem = v ?? ''),
            decoration: InputDecoration(
              filled: true,
              fillColor: bg,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 10,
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: border),
              ),
            ),
            items: [
              const DropdownMenuItem(
                value: '',
                child: Text('Tất cả học kỳ', style: TextStyle(fontSize: 13)),
              ),
              ..._semesters.map(
                (s) => DropdownMenuItem(
                  value: s['id'].toString(),
                  child: Text(
                    s['name'] as String,
                    style: const TextStyle(fontSize: 13),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStats() {
    final total = _courses.length;
    final active = _courses.where((c) => c['status'] == 'ACTIVE').length;
    final upcoming = _courses.where((c) => c['status'] == 'UPCOMING').length;
    final done = _courses.where((c) => c['status'] == 'COMPLETED').length;

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Row(
        children: [
          _statChip('$total Tổng', const Color(0xFF3B82F6)),
          const SizedBox(width: 8),
          _statChip('$active Mở', const Color(0xFF16A34A)),
          const SizedBox(width: 8),
          _statChip('$upcoming Sắp', const Color(0xFF6366F1)),
          const SizedBox(width: 8),
          _statChip('$done Đóng', txtSec),
        ],
      ),
    );
  }

  Widget _statChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }

  Widget _buildCourseCard(Map<String, dynamic> c) {
    final status = c['status'] as String;
    final lect = _lecturerName(c);
    final Color statusColor;
    final String statusLabel;

    switch (status) {
      case 'ACTIVE':
        statusColor = const Color(0xFF16A34A);
        statusLabel = 'ĐANG MỞ';
        break;
      case 'UPCOMING':
        statusColor = const Color(0xFF2563EB);
        statusLabel = 'SẮP MỞ';
        break;
      default:
        statusColor = txtSec;
        statusLabel = 'ĐÃ ĐÓNG';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF2563EB), Color(0xFF3B82F6)],
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Center(
                    child: Text(
                      _subjectCode(c['subjectId'] as int),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 10,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        c['code'] as String,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                          color: txtPrimary,
                        ),
                      ),
                      Text(
                        c['name'] as String,
                        style: const TextStyle(fontSize: 11, color: txtSec),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    statusLabel,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      color: statusColor,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Info row
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 10),
            child: Row(
              children: [
                _infoTag(
                  Icons.calendar_today_outlined,
                  _semesterName(c['semesterId'] as int),
                  const Color(0xFF6366F1),
                ),
                const SizedBox(width: 8),
                _infoTag(
                  Icons.people_outline,
                  '${c['currentStudents']}/${c['maxStudents']} SV',
                  const Color(0xFF0891B2),
                ),
              ],
            ),
          ),

          // Lecturer
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 10),
            child: Row(
              children: [
                const Icon(
                  Icons.person_outline_rounded,
                  size: 13,
                  color: txtSec,
                ),
                const SizedBox(width: 4),
                Text(
                  lect ?? 'Chưa phân công giảng viên',
                  style: TextStyle(
                    fontSize: 11,
                    color: lect != null ? txtPrimary : txtSec,
                    fontStyle: lect == null
                        ? FontStyle.italic
                        : FontStyle.normal,
                    fontWeight: lect != null
                        ? FontWeight.w600
                        : FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),

          // Progress bar
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Sĩ số',
                      style: TextStyle(fontSize: 10, color: txtSec),
                    ),
                    Text(
                      '${((c['currentStudents'] as int) / (c['maxStudents'] as int) * 100).round()}%',
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: txtPrimary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value:
                        (c['currentStudents'] as int) /
                        (c['maxStudents'] as int),
                    minHeight: 6,
                    backgroundColor: const Color(0xFFE2E8F0),
                    valueColor: const AlwaysStoppedAnimation(blue),
                  ),
                ),
              ],
            ),
          ),

          // Actions
          Container(
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: border)),
            ),
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
            child: Row(
              children: [
                if (lect == null)
                  _actionBtn(
                    '+ GV',
                    const Color(0xFF16A34A),
                    const Color(0xFFDCFCE7),
                    () => _openAssign(c),
                  )
                else
                  _actionBtn(
                    'Đổi GV',
                    const Color(0xFF0F766E),
                    const Color(0xFFCCFBF1),
                    () => _openAssign(c),
                  ),

                const SizedBox(width: 6),
                _actionBtn(
                  'Xem SV',
                  const Color(0xFF2563EB),
                  const Color(0xFFDBEAFE),
                  () => _openViewStudents(c),
                ),
                const Spacer(),
                _iconBtn(
                  Icons.edit_outlined,
                  const Color(0xFF2563EB),
                  () => _openEdit(c),
                ),
                const SizedBox(width: 4),
                _iconBtn(
                  Icons.delete_outline,
                  const Color(0xFFEF4444),
                  () => _confirmDelete(c['id'] as String),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoTag(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 10, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionBtn(
    String label,
    Color color,
    Color bg,
    VoidCallback onTap, {
    IconData? icon,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 11, color: color),
              const SizedBox(width: 3),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _iconBtn(IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(7),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Icon(icon, size: 14, color: color),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(24),
            ),
            child: const Icon(Icons.class_outlined, size: 36, color: blue),
          ),
          const SizedBox(height: 16),
          const Text(
            'Không tìm thấy lớp học',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: txtPrimary,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Thử thay đổi bộ lọc hoặc thêm mới',
            style: TextStyle(fontSize: 13, color: txtSec),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: _openCreate,
            style: ElevatedButton.styleFrom(
              backgroundColor: blue,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            icon: const Icon(Icons.add_rounded, color: Colors.white),
            label: const Text(
              'Thêm lớp học',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  // ── Form state ────────────────────────────────────────────
  Map<String, dynamic>? _editingCourse;
  Map<String, dynamic> _form = {
    'code': '',
    'name': '',
    'description': '',
    'subjectId': '',
    'semesterId': '',
    'lecturerId': '',
    'startDate': '',
    'endDate': '',
    'maxStudents': 40,
    'status': 'ACTIVE',
  };

  void _openCreate() {
    _editingCourse = null;
    _form = {
      'code': '',
      'name': '',
      'description': '',
      'subjectId': '',
      'semesterId': '',
      'lecturerId': '',
      'startDate': '',
      'endDate': '',
      'maxStudents': 40,
      'status': 'ACTIVE',
    };
    _showCourseSheet();
  }

  void _openEdit(Map<String, dynamic> c) {
    _editingCourse = c;
    final lecs = c['lecturers'] as List? ?? [];
    _form = {
      'code': c['code'],
      'name': c['name'],
      'description': c['description'] ?? '',
      'subjectId': c['subjectId'].toString(),
      'semesterId': c['semesterId'].toString(),
      'lecturerId': lecs.isNotEmpty ? lecs[0]['id'] : '',
      'startDate': c['startDate'] ?? '',
      'endDate': c['endDate'] ?? '',
      'maxStudents': c['maxStudents'] ?? 40,
      'status': c['status'] ?? 'ACTIVE',
    };
    _showCourseSheet();
  }

  void _showCourseSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => StatefulBuilder(
        builder: (ctx, setModalState) {
          void setField(String k, dynamic v) =>
              setModalState(() => _form[k] = v);

          return Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(ctx).viewInsets.bottom,
            ),
            child: DraggableScrollableSheet(
              expand: false,
              initialChildSize: 0.85,
              builder: (_, ctrl) => Column(
                children: [
                  const SizedBox(height: 8),
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                    child: Row(
                      children: [
                        Text(
                          _editingCourse != null
                              ? 'Sửa lớp học'
                              : 'Tạo lớp học mới',
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: txtPrimary,
                          ),
                        ),
                        const Spacer(),
                        GestureDetector(
                          onTap: () => Navigator.pop(ctx),
                          child: const Icon(Icons.close, color: txtSec),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  Expanded(
                    child: ListView(
                      controller: ctrl,
                      padding: const EdgeInsets.all(20),
                      children: [
                        _sheetField(
                          'Mã lớp *',
                          _form['code'],
                          (v) => setField('code', v),
                          hint: 'VD: se1821',
                        ),
                        const SizedBox(height: 14),
                        _sheetField(
                          'Tên lớp *',
                          _form['name'],
                          (v) => setField('name', v),
                        ),
                        const SizedBox(height: 14),
                        _sheetField(
                          'Mô tả',
                          _form['description'],
                          (v) => setField('description', v),
                          maxLines: 2,
                        ),
                        const SizedBox(height: 14),
                        _sheetDropdown(
                          'Môn học *',
                          _form['subjectId'],
                          (v) => setField('subjectId', v),
                          [
                            const DropdownMenuItem(
                              value: '',
                              child: Text('-- Chọn môn học --'),
                            ),
                            ..._subjects.map(
                              (s) => DropdownMenuItem(
                                value: s['id'].toString(),
                                child: Text(
                                  '${s["code"]} - ${s["name"]}',
                                  style: const TextStyle(fontSize: 13),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        _sheetDropdown(
                          'Học kỳ *',
                          _form['semesterId'],
                          (v) => setField('semesterId', v),
                          [
                            const DropdownMenuItem(
                              value: '',
                              child: Text('-- Chọn học kỳ --'),
                            ),
                            ..._semesters.map(
                              (s) => DropdownMenuItem(
                                value: s['id'].toString(),
                                child: Text(
                                  s['name'] as String,
                                  style: const TextStyle(fontSize: 13),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        _sheetDropdown(
                          'Giảng viên',
                          _form['lecturerId'],
                          (v) => setField('lecturerId', v),
                          [
                            const DropdownMenuItem(
                              value: '',
                              child: Text('-- Chọn giảng viên --'),
                            ),
                            ..._lecturers.map(
                              (l) => DropdownMenuItem(
                                value: l['id'] as String,
                                child: Text(
                                  l['name'] as String,
                                  style: const TextStyle(fontSize: 13),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: _sheetField(
                                'Ngày bắt đầu',
                                _form['startDate'],
                                (v) => setField('startDate', v),
                                hint: 'YYYY-MM-DD',
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _sheetField(
                                'Ngày kết thúc',
                                _form['endDate'],
                                (v) => setField('endDate', v),
                                hint: 'YYYY-MM-DD',
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: _sheetField(
                                'Sĩ số tối đa *',
                                _form['maxStudents'].toString(),
                                (v) => setField(
                                  'maxStudents',
                                  int.tryParse(v) ?? 40,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _sheetDropdown(
                                'Trạng thái',
                                _form['status'],
                                (v) => setField('status', v),
                                const [
                                  DropdownMenuItem(
                                    value: 'ACTIVE',
                                    child: Text(
                                      'Đang mở',
                                      style: TextStyle(fontSize: 13),
                                    ),
                                  ),
                                  DropdownMenuItem(
                                    value: 'UPCOMING',
                                    child: Text(
                                      'Sắp mở',
                                      style: TextStyle(fontSize: 13),
                                    ),
                                  ),
                                  DropdownMenuItem(
                                    value: 'COMPLETED',
                                    child: Text(
                                      'Đã đóng',
                                      style: TextStyle(fontSize: 13),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () => Navigator.pop(ctx),
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 14,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: const Text(
                                  'Hủy',
                                  style: TextStyle(color: txtSec),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () {
                                  _submitCourse();
                                  Navigator.pop(ctx);
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: blue,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 14,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: Text(
                                  _editingCourse != null
                                      ? 'Cập nhật'
                                      : 'Tạo mới',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _submitCourse() {
    if (_form['code'].toString().trim().isEmpty ||
        _form['name'].toString().trim().isEmpty ||
        _form['subjectId'].toString().isEmpty ||
        _form['semesterId'].toString().isEmpty) {
      _snack('Vui lòng nhập đủ các trường bắt buộc (*)', ok: false);
      return;
    }
    setState(() {
      if (_editingCourse != null) {
        final idx = _courses.indexWhere(
          (c) => c['id'] == _editingCourse!['id'],
        );
        if (idx != -1) {
          _courses[idx] = {
            ..._courses[idx],
            'code': _form['code'],
            'name': _form['name'],
            'description': _form['description'],
            'subjectId': int.parse(_form['subjectId'].toString()),
            'semesterId': int.parse(_form['semesterId'].toString()),
            'maxStudents': _form['maxStudents'],
            'status': _form['status'],
            'startDate': _form['startDate'],
            'endDate': _form['endDate'],
          };
          if (_form['lecturerId'].toString().isNotEmpty) {
            final l = _lecturers.firstWhere(
              (l) => l['id'] == _form['lecturerId'],
            );
            _courses[idx]['lecturers'] = [
              {'id': l['id'], 'name': l['name']},
            ];
          }
        }
        _snack('Cập nhật lớp học thành công!');
      } else {
        final newC = {
          'id': 'C${DateTime.now().millisecondsSinceEpoch}',
          'code': _form['code'],
          'name': _form['name'],
          'description': _form['description'],
          'subjectId': int.parse(_form['subjectId'].toString()),
          'semesterId': int.parse(_form['semesterId'].toString()),
          'currentStudents': 0,
          'maxStudents': _form['maxStudents'],
          'status': _form['status'],
          'startDate': _form['startDate'],
          'endDate': _form['endDate'],
          'lecturers': <Map<String, dynamic>>[],
          'students': <Map<String, dynamic>>[],
        };
        if (_form['lecturerId'].toString().isNotEmpty) {
          final l = _lecturers.firstWhere(
            (l) => l['id'] == _form['lecturerId'],
          );
          (newC['lecturers'] as List).add({'id': l['id'], 'name': l['name']});
        }
        _courses.add(newC);
        _snack('Tạo lớp học thành công!');
      }
    });
  }

  void _confirmDelete(String id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Xác nhận xóa'),
        content: const Text('Bạn có chắc muốn xóa lớp học này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              setState(() => _courses.removeWhere((c) => c['id'] == id));
              Navigator.pop(ctx);
              _snack('Xóa lớp học thành công!');
            },
            child: const Text('Xóa'),
          ),
        ],
      ),
    );
  }

  // ── Assign Lecturer Sheet ─────────────────────────────────
  String _assignLecturerId = '';

  void _openAssign(Map<String, dynamic> c) {
    _assignLecturerId = '';
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => StatefulBuilder(
        builder: (ctx, setMs) {
          return Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(ctx).viewInsets.bottom,
            ),
            child: Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Phân công Giảng viên',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: txtPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Lớp: ${c["code"]} — ${c["name"]}',
                    style: const TextStyle(fontSize: 12, color: txtSec),
                  ),
                  const SizedBox(height: 18),
                  _sheetDropdown(
                    'Chọn Giảng viên *',
                    _assignLecturerId,
                    (v) => setMs(() => _assignLecturerId = v!),
                    [
                      const DropdownMenuItem(
                        value: '',
                        child: Text('-- Chọn giảng viên --'),
                      ),
                      ..._lecturers.map(
                        (l) => DropdownMenuItem(
                          value: l['id'] as String,
                          child: Text(
                            '${l["name"]} · ${l["email"]}',
                            style: const TextStyle(fontSize: 13),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(ctx),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Hủy',
                            style: TextStyle(color: txtSec),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            if (_assignLecturerId.isEmpty) {
                              _snack('Vui lòng chọn giảng viên', ok: false);
                              return;
                            }
                            setState(() {
                              final l = _lecturers.firstWhere(
                                (l) => l['id'] == _assignLecturerId,
                              );
                              final idx = _courses.indexWhere(
                                (x) => x['id'] == c['id'],
                              );
                              if (idx != -1)
                                _courses[idx]['lecturers'] = [
                                  {'id': l['id'], 'name': l['name']},
                                ];
                            });
                            Navigator.pop(ctx);
                            _snack('Đã phân công giảng viên thành công!');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF16A34A),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Phân công',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }



  // ── View Students Sheet ───────────────────────────────────
  void _openViewStudents(Map<String, dynamic> c) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => StatefulBuilder(
        builder: (ctx, setMs) {
          List<Map<String, dynamic>> stuList = List.from(c['students'] ?? []);

          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.75,
            builder: (_, ctrl) => Column(
              children: [
                const SizedBox(height: 8),
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                  child: Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Danh sách Sinh viên',
                            style: TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w800,
                              color: txtPrimary,
                            ),
                          ),
                          Text(
                            '${stuList.length} sinh viên · ${c["code"]}',
                            style: const TextStyle(fontSize: 12, color: txtSec),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),
                Expanded(
                  child: stuList.isEmpty
                      ? const Center(
                          child: Text(
                            'Chưa có sinh viên nào trong lớp',
                            style: TextStyle(color: txtSec),
                          ),
                        )
                      : ListView.separated(
                          controller: ctrl,
                          itemCount: stuList.length,
                          separatorBuilder: (_, __) =>
                              const Divider(height: 1, color: border),
                          itemBuilder: (_, i) {
                            final s = stuList[i];
                            return Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 18,
                                    backgroundColor: const Color(0xFFDBEAFE),
                                    child: Text(
                                      (s['name'] as String)[0],
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                        color: blue,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          s['name'] as String,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 13,
                                            color: txtPrimary,
                                          ),
                                        ),
                                        Text(
                                          '${s["studentId"]} · ${s["email"]}',
                                          style: const TextStyle(
                                            fontSize: 10,
                                            color: txtSec,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  GestureDetector(
                                    onTap: () {
                                      showDialog(
                                        context: ctx,
                                        builder: (dCtx) => AlertDialog(
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              16,
                                            ),
                                          ),
                                          title: const Text('Xác nhận'),
                                          content: Text(
                                            'Đuổi ${s["name"]} khỏi lớp?',
                                          ),
                                          actions: [
                                            TextButton(
                                              onPressed: () =>
                                                  Navigator.pop(dCtx),
                                              child: const Text('Hủy'),
                                            ),
                                            ElevatedButton(
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: Colors.red,
                                                foregroundColor: Colors.white,
                                              ),
                                              onPressed: () {
                                                setMs(
                                                  () => stuList.removeAt(i),
                                                );
                                                setState(() {
                                                  final idx = _courses
                                                      .indexWhere(
                                                        (x) =>
                                                            x['id'] == c['id'],
                                                      );
                                                  if (idx != -1) {
                                                    _courses[idx]['students'] =
                                                        stuList;
                                                    _courses[idx]['currentStudents'] =
                                                        stuList.length;
                                                  }
                                                });
                                                Navigator.pop(dCtx);
                                                _snack(
                                                  'Đã đuổi ${s["name"]} khỏi lớp',
                                                );
                                              },
                                              child: const Text('Đuổi'),
                                            ),
                                          ],
                                        ),
                                      );
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFFEF2F2),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                          color: const Color(0xFFFCA5A5),
                                        ),
                                      ),
                                      child: const Text(
                                        'Đuổi',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                          color: Color(0xFFDC2626),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // ── Sheet Form Helpers ────────────────────────────────────
  Widget _sheetField(
    String label,
    String value,
    Function(String) onChange, {
    String? hint,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: txtPrimary,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          initialValue: value,
          onChanged: onChange,
          maxLines: maxLines,
          style: const TextStyle(fontSize: 13),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: txtSec, fontSize: 12),
            filled: true,
            fillColor: bg,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 12,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: border),
            ),
          ),
        ),
      ],
    );
  }

  Widget _sheetDropdown(
    String label,
    dynamic value,
    Function(String?) onChange,
    List<DropdownMenuItem<String>> items,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: txtPrimary,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: border),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              isExpanded: true,
              value: value?.toString().isEmpty ?? true
                  ? null
                  : value.toString(),
              style: const TextStyle(fontSize: 13, color: txtPrimary),
              items: items,
              onChanged: onChange,
            ),
          ),
        ),
      ],
    );
  }
}
