import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/admin_navigation.dart';

// ────────────────────────────────────────────────────────────
// Lecturer Assignment Screen  (Admin)
// Converted from lecturer-assignment.jsx
// ────────────────────────────────────────────────────────────

class LecturerAssignmentScreen extends StatefulWidget {
  const LecturerAssignmentScreen({super.key});

  @override
  State<LecturerAssignmentScreen> createState() =>
      _LecturerAssignmentScreenState();
}

class _LecturerAssignmentScreenState extends State<LecturerAssignmentScreen> {
  // ─── Controllers ────────────────────────────────────────
  final TextEditingController _searchController = TextEditingController();

  // ─── Mock Data ──────────────────────────────────────────

  final List<Map<String, dynamic>> _semesters = [
    {"id": 1, "code": "FA24", "name": "Fall 2024"},
    {"id": 2, "code": "SP25", "name": "Spring 2025"},
    {"id": 3, "code": "SU25", "name": "Summer 2025"},
  ];

  final List<Map<String, dynamic>> _subjects = [
    {"id": 1, "code": "SWD392", "name": "Software Architecture"},
    {"id": 2, "code": "PRJ301", "name": "Java Web Application"},
    {"id": 3, "code": "SWP391", "name": "Software Engineering Project"},
    {"id": 4, "code": "AI301", "name": "Machine Learning"},
  ];

  final List<Map<String, dynamic>> _lecturers = [
    {"id": "L1", "name": "Nguyễn Văn Nam"},
    {"id": "L2", "name": "Trần Thị Lan"},
    {"id": "L3", "name": "Lê Văn Hùng"},
    {"id": "L4", "name": "Phạm Minh Tuấn"},
    {"id": "L5", "name": "Hoàng Thị Mai"},
  ];

  late List<Map<String, dynamic>> _courses;

  @override
  void initState() {
    super.initState();
    _courses = [
      {
        "id": "C1",
        "code": "SWD392-01",
        "name": "Software Architecture – Lớp 01",
        "subjectId": 1,
        "semesterId": 1,
        "currentStudents": 32,
        "maxStudents": 40,
        "lecturers": [
          {"id": "L1", "name": "Nguyễn Văn Nam"},
        ],
      },
      {
        "id": "C2",
        "code": "PRJ301-01",
        "name": "Java Web Application – Lớp 01",
        "subjectId": 2,
        "semesterId": 1,
        "currentStudents": 38,
        "maxStudents": 40,
        "lecturers": [
          {"id": "L2", "name": "Trần Thị Lan"},
          {"id": "L3", "name": "Lê Văn Hùng"},
        ],
      },
      {
        "id": "C3",
        "code": "SWP391-01",
        "name": "SE Project – Lớp 01",
        "subjectId": 3,
        "semesterId": 2,
        "currentStudents": 15,
        "maxStudents": 35,
        "lecturers": [],
      },
      {
        "id": "C4",
        "code": "AI301-01",
        "name": "Machine Learning – Lớp 01",
        "subjectId": 4,
        "semesterId": 2,
        "currentStudents": 28,
        "maxStudents": 45,
        "lecturers": [
          {"id": "L4", "name": "Phạm Minh Tuấn"},
        ],
      },
      {
        "id": "C5",
        "code": "SWD392-02",
        "name": "Software Architecture – Lớp 02",
        "subjectId": 1,
        "semesterId": 3,
        "currentStudents": 0,
        "maxStudents": 40,
        "lecturers": [],
      },
      {
        "id": "C6",
        "code": "PRJ301-02",
        "name": "Java Web Application – Lớp 02",
        "subjectId": 2,
        "semesterId": 3,
        "currentStudents": 22,
        "maxStudents": 40,
        "lecturers": [
          {"id": "L5", "name": "Hoàng Thị Mai"},
        ],
      },
      {
        "id": "C7",
        "code": "SWP391-02",
        "name": "SE Project – Lớp 02",
        "subjectId": 3,
        "semesterId": 1,
        "currentStudents": 41,
        "maxStudents": 45,
        "lecturers": [],
      },
      {
        "id": "C8",
        "code": "AI301-02",
        "name": "Machine Learning – Lớp 02",
        "subjectId": 4,
        "semesterId": 1,
        "currentStudents": 10,
        "maxStudents": 35,
        "lecturers": [
          {"id": "L1", "name": "Nguyễn Văn Nam"},
          {"id": "L2", "name": "Trần Thị Lan"},
        ],
      },
      {
        "id": "C9",
        "code": "SWD392-03",
        "name": "Software Architecture – Lớp 03",
        "subjectId": 1,
        "semesterId": 2,
        "currentStudents": 5,
        "maxStudents": 40,
        "lecturers": [],
      },
    ];
  }

  // ─── State ──────────────────────────────────────────────
  String _search = "";
  String _filterSem = "";
  String _sort = "";
  int _page = 1;
  final int _pageSize = 8;
  bool _isLoading = false;

  // ─── Lookup Maps ────────────────────────────────────────
  Map<String, dynamic>? _subjectById(int id) => _subjects
      .cast<Map<String, dynamic>?>()
      .firstWhere((s) => s?["id"] == id, orElse: () => null);

  Map<String, dynamic>? _semesterById(int id) => _semesters
      .cast<Map<String, dynamic>?>()
      .firstWhere((s) => s?["id"] == id, orElse: () => null);

  // ─── Lecturer Workload ──────────────────────────────────
  Map<String, int> get _lecturerWorkload {
    final map = <String, int>{};
    for (final c in _courses) {
      for (final l in (c["lecturers"] as List)) {
        final id = l["id"] as String;
        map[id] = (map[id] ?? 0) + 1;
      }
    }
    return map;
  }

  // ─── Filtered + Sorted Courses ──────────────────────────
  List<Map<String, dynamic>> get _filtered {
    var result = _courses.where((c) {
      final matchSearch =
          _search.isEmpty ||
          (c["code"] as String).toLowerCase().contains(_search.toLowerCase()) ||
          (c["name"] as String).toLowerCase().contains(_search.toLowerCase());

      final matchSem =
          _filterSem.isEmpty || c["semesterId"].toString() == _filterSem;

      return matchSearch && matchSem;
    }).toList();

    if (_sort == "students") {
      result.sort(
        (a, b) => (b["currentStudents"] as int).compareTo(
          a["currentStudents"] as int,
        ),
      );
    }
    if (_sort == "course") {
      result.sort(
        (a, b) => (a["code"] as String).compareTo(b["code"] as String),
      );
    }

    return result;
  }

  // ─── Pagination ─────────────────────────────────────────
  int get _totalPages => (_filtered.length / _pageSize).ceil();

  List<Map<String, dynamic>> get _paginated {
    final start = (_page - 1) * _pageSize;
    final end = start + _pageSize;
    return _filtered.sublist(
      start.clamp(0, _filtered.length),
      end.clamp(0, _filtered.length),
    );
  }

  // ─── Stats ──────────────────────────────────────────────
  int get _assignedCount =>
      _courses.where((c) => (c["lecturers"] as List).isNotEmpty).length;

  int get _unassignedCount =>
      _courses.where((c) => (c["lecturers"] as List).isEmpty).length;

  // ─── Actions ────────────────────────────────────────────
  void _showSnack(String message, {bool success = true}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: success ? const Color(0xFF0D9488) : Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  void _handleRemove(String courseId, String lecturerId, String lecturerName) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text("Xóa phân công"),
        content: Text('Xóa giảng viên $lecturerName khỏi lớp này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Hủy"),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              setState(() {
                final course = _courses.firstWhere((c) => c["id"] == courseId);
                (course["lecturers"] as List).removeWhere(
                  (l) => l["id"] == lecturerId,
                );
              });
              Navigator.pop(ctx);
              _showSnack("Đã xóa phân công");
            },
            child: const Text("Xóa"),
          ),
        ],
      ),
    );
  }

  void _openAssignModal(Map<String, dynamic> course) {
    String selectedLecturer = "";

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setLocalState) {
            final workload = _lecturerWorkload;

            return AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              titlePadding: const EdgeInsets.fromLTRB(24, 24, 12, 0),
              title: Row(
                children: [
                  const Expanded(
                    child: Text(
                      "Phân công giảng viên",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: const Icon(Icons.close, size: 20),
                    splashRadius: 18,
                  ),
                ],
              ),
              content: SizedBox(
                width: 400,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "${course["code"]} — ${course["name"]}",
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF6B7280),
                      ),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: selectedLecturer.isEmpty ? null : selectedLecturer,
                      decoration: InputDecoration(
                        labelText: "Chọn giảng viên",
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      items: _lecturers.map((l) {
                        final id = l["id"] as String;
                        return DropdownMenuItem(
                          value: id,
                          child: Text(
                            "${l["name"]} (${workload[id] ?? 0} lớp)",
                          ),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setLocalState(() {
                          selectedLecturer = value ?? "";
                        });
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0D9488),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () {
                      if (selectedLecturer.isEmpty) {
                        _showSnack("Vui lòng chọn giảng viên", success: false);
                        return;
                      }

                      final lect = _lecturers.firstWhere(
                        (l) => l["id"] == selectedLecturer,
                      );

                      // Check if already assigned
                      final alreadyAssigned = (course["lecturers"] as List).any(
                        (l) => l["id"] == selectedLecturer,
                      );

                      if (alreadyAssigned) {
                        _showSnack(
                          "Giảng viên đã được phân công",
                          success: false,
                        );
                        return;
                      }

                      setState(() {
                        (course["lecturers"] as List).add({
                          "id": lect["id"],
                          "name": lect["name"],
                        });
                      });

                      Navigator.pop(ctx);
                      _showSnack("Đã phân công giảng viên");
                    },
                    child: const Text(
                      "Xác nhận phân công",
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // ════════════════════════════════════════════════════════
  // BUILD
  // ════════════════════════════════════════════════════════

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
                    _buildTopNavbar(isMobile),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: EdgeInsets.all(horizontalPadding),
                        child: Center(
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(maxWidth: 1400),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildBreadcrumb(),
                                const SizedBox(height: 12),
                                _buildTitle(),
                                const SizedBox(height: 20),
                                _buildStatsRow(width),
                                const SizedBox(height: 20),
                                _buildFilterCard(width),
                                const SizedBox(height: 20),
                                _buildDataTable(width),
                                if (_totalPages > 1) ...[
                                  const SizedBox(height: 16),
                                  _buildPagination(),
                                ],
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

  // ─── Top Navbar ─────────────────────────────────────────
  Widget _buildTopNavbar(bool isMobile) {
    return AppTopHeader(
      title: 'Phân công Giảng viên',
      primary: false,
      user: const AppUser(
        name: 'Super Admin',
        email: 'admin@fe.edu.vn',
        role: 'ADMIN',
      ),
    );
  }

  // ─── Breadcrumb ─────────────────────────────────────────
  Widget _buildBreadcrumb() {
    return Row(
      children: [
        GestureDetector(
          onTap: () => context.go("/admin"),
          child: const Text(
            "Admin",
            style: TextStyle(
              color: Color(0xFF0D9488),
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        const SizedBox(width: 6),
        const Icon(
          Icons.chevron_right_rounded,
          size: 16,
          color: Color(0xFF94A3B8),
        ),
        const SizedBox(width: 6),
        const Text(
          "Phân công Giảng viên",
          style: TextStyle(
            color: Color(0xFF1E293B),
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  // ─── Title ──────────────────────────────────────────────
  Widget _buildTitle() {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Phân công Giảng viên",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: Color(0xFF1E293B),
          ),
        ),
        SizedBox(height: 4),
        Text(
          "Gán giảng viên phụ trách các lớp học phần",
          style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
        ),
      ],
    );
  }

  // ─── Stats Row ──────────────────────────────────────────
  Widget _buildStatsRow(double width) {
    final crossAxisCount = width < 640 ? 1 : 3;

    return GridView.count(
      crossAxisCount: crossAxisCount,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 14,
      mainAxisSpacing: 14,
      mainAxisExtent: 80,
      children: [
        _statCard(
          "Tổng lớp",
          _courses.length.toString(),
          const Color(0xFFEFF6FF),
          const Color(0xFFDBEAFE),
          const Color(0xFF1D4ED8),
        ),
        _statCard(
          "Đã phân công",
          _assignedCount.toString(),
          const Color(0xFFF0FDF4),
          const Color(0xFFDCFCE7),
          const Color(0xFF15803D),
        ),
        _statCard(
          "Chưa phân công",
          _unassignedCount.toString(),
          const Color(0xFFFFF7ED),
          const Color(0xFFFFEDD5),
          const Color(0xFFEA580C),
        ),
      ],
    );
  }

  Widget _statCard(
    String title,
    String value,
    Color bg,
    Color border,
    Color textColor,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: textColor,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }

  // ─── Filter Card ────────────────────────────────────────
  Widget _buildFilterCard(double width) {
    final isMobile = width < 700;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: isMobile
          ? Column(
              children: [
                _buildSearchField(),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildSemesterDropdown()),
                    const SizedBox(width: 12),
                    _buildSortButton(),
                  ],
                ),
              ],
            )
          : Row(
              children: [
                Expanded(flex: 3, child: _buildSearchField()),
                const SizedBox(width: 14),
                Expanded(flex: 2, child: _buildSemesterDropdown()),
                const SizedBox(width: 14),
                _buildSortButton(),
              ],
            ),
    );
  }

  Widget _buildSearchField() {
    return TextField(
      controller: _searchController,
      onChanged: (value) {
        setState(() {
          _search = value;
          _page = 1;
        });
      },
      style: const TextStyle(fontSize: 14),
      decoration: InputDecoration(
        hintText: "Tìm lớp học...",
        hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        prefixIcon: const Icon(
          Icons.search,
          size: 18,
          color: Color(0xFF94A3B8),
        ),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 12,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFF1F5F9)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFF1F5F9)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFF0D9488), width: 1.5),
        ),
      ),
    );
  }

  Widget _buildSemesterDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          isExpanded: true,
          value: _filterSem.isEmpty ? null : _filterSem,
          hint: const Text(
            "Tất cả học kỳ",
            style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
          ),
          style: const TextStyle(fontSize: 13, color: Color(0xFF334155)),
          items: [
            const DropdownMenuItem(value: "", child: Text("Tất cả học kỳ")),
            ..._semesters.map(
              (s) => DropdownMenuItem(
                value: s["id"].toString(),
                child: Text("${s["code"]} – ${s["name"]}"),
              ),
            ),
          ],
          onChanged: (value) {
            setState(() {
              _filterSem = value ?? "";
              _page = 1;
            });
          },
        ),
      ),
    );
  }

  Widget _buildSortButton() {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          setState(() {
            if (_sort == "students") {
              _sort = "course";
            } else if (_sort == "course") {
              _sort = "";
            } else {
              _sort = "students";
            }
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFFE2E8F0)),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.swap_vert_rounded,
                size: 16,
                color: Color(0xFF64748B),
              ),
              const SizedBox(width: 6),
              Text(
                _sort == "students"
                    ? "Sĩ số ↓"
                    : _sort == "course"
                    ? "Mã lớp"
                    : "Sort sĩ số",
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─── Data Table ─────────────────────────────────────────
  Widget _buildDataTable(double width) {
    final isMobile = width < 700;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header
          if (!isMobile) _buildTableHeader(),

          // Body
          if (_isLoading)
            ..._buildSkeletonRows()
          else if (_paginated.isEmpty)
            _buildEmptyState()
          else
            ..._paginated.map((course) => _buildCourseRow(course, isMobile)),
        ],
      ),
    );
  }

  Widget _buildTableHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
      decoration: const BoxDecoration(
        color: Color(0xFFF8FAFC),
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(22),
          topRight: Radius.circular(22),
        ),
      ),
      child: const Row(
        children: [
          Expanded(
            flex: 4,
            child: Text(
              "LỚP HỌC PHẦN",
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: Color(0xFF64748B),
                letterSpacing: 0.5,
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              "MÔN / KỲ",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: Color(0xFF64748B),
                letterSpacing: 0.5,
              ),
            ),
          ),
          Expanded(
            flex: 1,
            child: Text(
              "SĨ SỐ",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: Color(0xFF64748B),
                letterSpacing: 0.5,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              "GIẢNG VIÊN",
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: Color(0xFF64748B),
                letterSpacing: 0.5,
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              "THAO TÁC",
              textAlign: TextAlign.right,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: Color(0xFF64748B),
                letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Course Row ─────────────────────────────────────────
  Widget _buildCourseRow(Map<String, dynamic> course, bool isMobile) {
    final assigned = course["lecturers"] as List;
    final subject = _subjectById(course["subjectId"] as int);
    final semester = _semesterById(course["semesterId"] as int);
    final current = course["currentStudents"] as int;
    final max = course["maxStudents"] as int;
    final ratio = max > 0 ? (current / max).clamp(0.0, 1.0) : 0.0;
    final workload = _lecturerWorkload;

    if (isMobile) {
      return _buildMobileCourseCard(
        course,
        assigned,
        subject,
        semester,
        current,
        max,
        ratio,
        workload,
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
      ),
      child: MouseRegion(
        cursor: SystemMouseCursors.basic,
        child: Row(
          children: [
            // Lớp học phần
            Expanded(
              flex: 4,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    course["code"] as String,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                      color: Color(0xFF0D9488),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    course["name"] as String,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
            ),

            // Môn / Kỳ
            Expanded(
              flex: 2,
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      subject?["code"] ?? "N/A",
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1D4ED8),
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    semester?["name"] ?? "N/A",
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
            ),

            // Sĩ số
            Expanded(
              flex: 1,
              child: Column(
                children: [
                  RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: "$current",
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF334155),
                          ),
                        ),
                        TextSpan(
                          text: "/$max",
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF94A3B8),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      value: ratio,
                      minHeight: 4,
                      backgroundColor: const Color(0xFFF1F5F9),
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        Color(0xFF14B8A6),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 14),

            // Giảng viên
            Expanded(
              flex: 3,
              child: assigned.isEmpty
                  ? const Text(
                      "Chưa phân công",
                      style: TextStyle(
                        fontSize: 12,
                        color: Color(0xFF94A3B8),
                        fontStyle: FontStyle.italic,
                      ),
                    )
                  : Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: assigned.map<Widget>((lect) {
                        final wl = workload[lect["id"]] ?? 1;
                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0FDFA),
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(color: const Color(0xFFCCFBF1)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              _lecturerAvatar(lect["name"] as String),
                              const SizedBox(width: 6),
                              Text(
                                lect["name"] as String,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF0D9488),
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                "$wl lớp",
                                style: TextStyle(
                                  fontSize: 11,
                                  color: wl > 4
                                      ? Colors.red
                                      : const Color(0xFF94A3B8),
                                ),
                              ),
                              const SizedBox(width: 4),
                              GestureDetector(
                                onTap: () => _handleRemove(
                                  course["id"] as String,
                                  lect["id"] as String,
                                  lect["name"] as String,
                                ),
                                child: const Icon(
                                  Icons.close,
                                  size: 14,
                                  color: Color(0xFF5EEAD4),
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
            ),

            // Thao tác
            Expanded(
              flex: 2,
              child: Align(
                alignment: Alignment.centerRight,
                child: ElevatedButton.icon(
                  onPressed: () => _openAssignModal(course),
                  icon: const Icon(Icons.add, size: 14),
                  label: const Text("Phân công"),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0D9488),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                    textStyle: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Mobile Course Card ─────────────────────────────────
  Widget _buildMobileCourseCard(
    Map<String, dynamic> course,
    List assigned,
    Map<String, dynamic>? subject,
    Map<String, dynamic>? semester,
    int current,
    int max,
    double ratio,
    Map<String, int> workload,
  ) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Code + Name
          Text(
            course["code"] as String,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 15,
              color: Color(0xFF0D9488),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            course["name"] as String,
            style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
          ),
          const SizedBox(height: 12),

          // Subject & Semester chips
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  subject?["code"] ?? "N/A",
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1D4ED8),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                semester?["name"] ?? "N/A",
                style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
              ),
              const Spacer(),
              // Sĩ số
              RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: "$current",
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF334155),
                      ),
                    ),
                    TextSpan(
                      text: "/$max",
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF94A3B8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: ratio,
              minHeight: 4,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor: const AlwaysStoppedAnimation<Color>(
                Color(0xFF14B8A6),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Lecturers
          if (assigned.isEmpty)
            const Text(
              "Chưa phân công",
              style: TextStyle(
                fontSize: 12,
                color: Color(0xFF94A3B8),
                fontStyle: FontStyle.italic,
              ),
            )
          else
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: assigned.map<Widget>((lect) {
                final wl = workload[lect["id"]] ?? 1;
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0FDFA),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: const Color(0xFFCCFBF1)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _lecturerAvatar(lect["name"] as String),
                      const SizedBox(width: 6),
                      Text(
                        lect["name"] as String,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF0D9488),
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        "$wl lớp",
                        style: TextStyle(
                          fontSize: 11,
                          color: wl > 4 ? Colors.red : const Color(0xFF94A3B8),
                        ),
                      ),
                      const SizedBox(width: 4),
                      GestureDetector(
                        onTap: () => _handleRemove(
                          course["id"] as String,
                          lect["id"] as String,
                          lect["name"] as String,
                        ),
                        child: const Icon(
                          Icons.close,
                          size: 14,
                          color: Color(0xFF5EEAD4),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          const SizedBox(height: 12),

          // Assign button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _openAssignModal(course),
              icon: const Icon(Icons.add, size: 14),
              label: const Text("Phân công"),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D9488),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 10),
                textStyle: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Lecturer Avatar ────────────────────────────────────
  Widget _lecturerAvatar(String name) {
    final letter = name.isNotEmpty ? name[0].toUpperCase() : "L";
    return Container(
      width: 22,
      height: 22,
      decoration: BoxDecoration(
        color: const Color(0xFF99F6E4),
        borderRadius: BorderRadius.circular(11),
      ),
      child: Center(
        child: Text(
          letter,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0F766E),
          ),
        ),
      ),
    );
  }

  // ─── Empty State ────────────────────────────────────────
  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 60),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.menu_book_rounded,
              size: 44,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 12),
            const Text(
              "Chưa có lớp học phần",
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              "Hãy tạo lớp học phần trước khi phân công giảng viên",
              style: TextStyle(fontSize: 12, color: Color(0xFFCBD5E1)),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Skeleton Rows ──────────────────────────────────────
  List<Widget> _buildSkeletonRows() {
    return List.generate(
      3,
      (_) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 18),
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
        ),
        child: Row(
          children: [
            Expanded(
              flex: 4,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _shimmerBox(width: 120, height: 14),
                  const SizedBox(height: 6),
                  _shimmerBox(width: 180, height: 10),
                ],
              ),
            ),
            Expanded(flex: 2, child: _shimmerBox(width: 60, height: 14)),
            Expanded(flex: 1, child: _shimmerBox(width: 40, height: 14)),
            Expanded(flex: 3, child: _shimmerBox(width: 140, height: 14)),
            Expanded(flex: 2, child: _shimmerBox(width: 80, height: 14)),
          ],
        ),
      ),
    );
  }

  Widget _shimmerBox({required double width, required double height}) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(6),
      ),
    );
  }

  // ─── Pagination ─────────────────────────────────────────
  Widget _buildPagination() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        OutlinedButton(
          onPressed: _page > 1 ? () => setState(() => _page--) : null,
          style: OutlinedButton.styleFrom(
            foregroundColor: const Color(0xFF334155),
            side: const BorderSide(color: Color(0xFFE2E8F0)),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          ),
          child: const Text("Prev", style: TextStyle(fontSize: 13)),
        ),
        const SizedBox(width: 14),
        Text(
          "Page $_page / $_totalPages",
          style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
        ),
        const SizedBox(width: 14),
        OutlinedButton(
          onPressed: _page < _totalPages ? () => setState(() => _page++) : null,
          style: OutlinedButton.styleFrom(
            foregroundColor: const Color(0xFF334155),
            side: const BorderSide(color: Color(0xFFE2E8F0)),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          ),
          child: const Text("Next", style: TextStyle(fontSize: 13)),
        ),
      ],
    );
  }
}
