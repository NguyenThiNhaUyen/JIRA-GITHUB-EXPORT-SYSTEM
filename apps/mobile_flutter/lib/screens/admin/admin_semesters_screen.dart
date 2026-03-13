import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AdminSemestersScreen extends StatefulWidget {
  const AdminSemestersScreen({super.key});

  @override
  State<AdminSemestersScreen> createState() => _AdminSemestersScreenState();
}

class _AdminSemestersScreenState extends State<AdminSemestersScreen> {
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, dynamic>> _semesters = [
    {
      "id": 1,
      "name": "Spring 2026",
      "startDate": "2026-01-01",
      "endDate": "2026-04-30",
      "status": "ACTIVE",
      "courses": ["SWD392", "PRN222"],
    },
    {
      "id": 2,
      "name": "Summer 2026",
      "startDate": "2026-05-01",
      "endDate": "2026-08-31",
      "status": "UPCOMING",
      "courses": ["MAD101"],
    },
    {
      "id": 3,
      "name": "Fall 2025",
      "startDate": "2025-09-01",
      "endDate": "2025-12-31",
      "status": "COMPLETED",
      "courses": ["SWR302", "PRJ301", "SWP391"],
    },
  ];

  String _filter = "ALL";
  String _search = "";

  List<Map<String, dynamic>> get _filteredSemesters {
    var result = [..._semesters];

    if (_filter != "ALL") {
      result = result.where((s) => s["status"] == _filter).toList();
    }

    if (_search.trim().isNotEmpty) {
      final keyword = _search.trim().toLowerCase();
      result = result.where((s) {
        final name = (s["name"] as String).toLowerCase();
        final courses =
            List<String>.from(s["courses"] as List).join(", ").toLowerCase();
        return name.contains(keyword) || courses.contains(keyword);
      }).toList();
    }

    return result;
  }

  int get _nextId {
    if (_semesters.isEmpty) return 1;
    return _semesters
            .map((e) => e["id"] as int)
            .reduce((value, element) => value > element ? value : element) +
        1;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Color _statusColor(String status) {
    switch (status) {
      case "ACTIVE":
        return Colors.green;
      case "UPCOMING":
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  double _timelineProgress(String status) {
    switch (status) {
      case "ACTIVE":
        return 0.72;
      case "UPCOMING":
        return 0.42;
      default:
        return 1.0;
    }
  }

  double _courseLoadProgress(int courseCount) {
    return (courseCount / 4).clamp(0.0, 1.0);
  }

  void _showSnack(String message, {bool success = true}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: success ? Colors.green : Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _autoGenerateSemester() {
    final year = DateTime.now().year + 1;
    final count = _semesters
            .where((s) => (s["name"] as String).contains("Auto $year"))
            .length +
        1;

    final generated = {
      "id": _nextId,
      "name": "Auto $year - $count",
      "startDate": "$year-09-01",
      "endDate": "$year-12-31",
      "status": "UPCOMING",
      "courses": ["EXE101", "SWR300"],
    };

    setState(() {
      _semesters.add(generated);
    });

    _showSnack("Đã tạo học kỳ mẫu tự động.");
  }

  Future<void> _showSemesterDialog({Map<String, dynamic>? semester}) async {
    final bool isEdit = semester != null;

    final nameController = TextEditingController(text: semester?["name"] ?? "");
    final startDateController =
        TextEditingController(text: semester?["startDate"] ?? "");
    final endDateController =
        TextEditingController(text: semester?["endDate"] ?? "");
    final coursesController = TextEditingController(
      text: semester == null
          ? ""
          : (List<String>.from(semester["courses"] as List)).join(", "),
    );

    String status = semester?["status"] ?? "UPCOMING";

    await showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setLocalState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              title: Text(isEdit ? "Chỉnh sửa học kỳ" : "Thêm học kỳ"),
              content: SizedBox(
                width: 460,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextField(
                        controller: nameController,
                        decoration: const InputDecoration(
                          labelText: "Tên học kỳ",
                          hintText: "Ví dụ: Spring 2027",
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: startDateController,
                        decoration: const InputDecoration(
                          labelText: "Ngày bắt đầu",
                          hintText: "YYYY-MM-DD",
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: endDateController,
                        decoration: const InputDecoration(
                          labelText: "Ngày kết thúc",
                          hintText: "YYYY-MM-DD",
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 14),
                      DropdownButtonFormField<String>(
                        value: status,
                        decoration: const InputDecoration(
                          labelText: "Trạng thái",
                          border: OutlineInputBorder(),
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: "ACTIVE",
                            child: Text("Đang diễn ra"),
                          ),
                          DropdownMenuItem(
                            value: "UPCOMING",
                            child: Text("Sắp tới"),
                          ),
                          DropdownMenuItem(
                            value: "COMPLETED",
                            child: Text("Đã kết thúc"),
                          ),
                        ],
                        onChanged: (value) {
                          if (value == null) return;
                          setLocalState(() {
                            status = value;
                          });
                        },
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: coursesController,
                        maxLines: 2,
                        decoration: const InputDecoration(
                          labelText: "Môn học",
                          hintText: "PRN222, SWD392, EXE101",
                          border: OutlineInputBorder(),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  child: const Text("Hủy"),
                ),
                ElevatedButton(
                  onPressed: () {
                    final name = nameController.text.trim();
                    final startDate = startDateController.text.trim();
                    final endDate = endDateController.text.trim();
                    final courses = coursesController.text
                        .split(",")
                        .map((e) => e.trim())
                        .where((e) => e.isNotEmpty)
                        .toList();

                    if (name.isEmpty ||
                        startDate.isEmpty ||
                        endDate.isEmpty ||
                        courses.isEmpty) {
                      _showSnack("Vui lòng nhập đầy đủ thông tin.", success: false);
                      return;
                    }

                    final start = DateTime.tryParse(startDate);
                    final end = DateTime.tryParse(endDate);

                    if (start == null || end == null) {
                      _showSnack(
                        "Ngày không đúng định dạng YYYY-MM-DD.",
                        success: false,
                      );
                      return;
                    }

                    if (end.isBefore(start)) {
                      _showSnack(
                        "Ngày kết thúc phải sau ngày bắt đầu.",
                        success: false,
                      );
                      return;
                    }

                    if (isEdit) {
                      setState(() {
                        semester["name"] = name;
                        semester["startDate"] = startDate;
                        semester["endDate"] = endDate;
                        semester["status"] = status;
                        semester["courses"] = courses;
                      });
                      _showSnack("Cập nhật học kỳ thành công.");
                    } else {
                      setState(() {
                        _semesters.add({
                          "id": _nextId,
                          "name": name,
                          "startDate": startDate,
                          "endDate": endDate,
                          "status": status,
                          "courses": courses,
                        });
                      });
                      _showSnack("Đã thêm học kỳ mới.");
                    }

                    Navigator.pop(dialogContext);
                  },
                  child: Text(isEdit ? "Lưu" : "Thêm"),
                ),
              ],
            );
          },
        );
      },
    );

    nameController.dispose();
    startDateController.dispose();
    endDateController.dispose();
    coursesController.dispose();
  }

  Future<void> _confirmDeleteSemester(Map<String, dynamic> semester) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: const Text("Xóa học kỳ"),
          content: Text('Bạn có chắc muốn xóa "${semester["name"]}" không?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text("Hủy"),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              onPressed: () => Navigator.pop(dialogContext, true),
              child: const Text("Xóa"),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      setState(() {
        _semesters.removeWhere((s) => s["id"] == semester["id"]);
      });
      _showSnack("Đã xóa học kỳ.");
    }
  }

  Widget _buildTopNavbar(double width) {
    final isMobile = width < 900;

    return Container(
      height: 78,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: Color(0xFFE7ECF3)),
        ),
      ),
      child: Row(
        children: [
          if (isMobile)
            Builder(
              builder: (context) => IconButton(
                onPressed: () => Scaffold.of(context).openDrawer(),
                icon: const Icon(Icons.menu_rounded),
              ),
            ),
          if (isMobile) const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: _searchController,
              onChanged: (value) {
                setState(() {
                  _search = value;
                });
              },
              decoration: InputDecoration(
                hintText: 'Tìm kiếm...',
                hintStyle: const TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 14,
                ),
                prefixIcon: const Icon(
                  Icons.search_rounded,
                  color: Color(0xFF64748B),
                ),
                filled: true,
                fillColor: const Color(0xFFF8FAFC),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 0,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFFE7ECF3)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFFE7ECF3)),
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE7ECF3)),
            ),
            child: const Icon(Icons.notifications_none_rounded),
          ),
          const SizedBox(width: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE7ECF3)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: Color(0xFFE0F2FE),
                  child: Icon(
                    Icons.admin_panel_settings_outlined,
                    size: 18,
                    color: Color(0xFF2563EB),
                  ),
                ),
                SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Super Admin',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    Text(
                      'ADMIN',
                      style: TextStyle(
                        fontSize: 11,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBreadcrumb() {
    return const Row(
      children: [
        Text(
          "Admin",
          style: TextStyle(
            color: Color(0xFF0F8B8D),
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
        SizedBox(width: 8),
        Icon(
          Icons.chevron_right_rounded,
          size: 18,
          color: Color(0xFF94A3B8),
        ),
        SizedBox(width: 8),
        Text(
          "Quản lý học kỳ",
          style: TextStyle(
            color: Color(0xFF1E293B),
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  Widget _buildOverviewStats(double width) {
    final crossAxisCount = width < 640 ? 2 : 4;

    return GridView.count(
      crossAxisCount: crossAxisCount,
      shrinkWrap: true,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisExtent: width < 640 ? 118 : 140,
      children: [
        StatCard(
          icon: Icons.calendar_month,
          title: "Tổng số học kỳ",
          value: _semesters.length.toString(),
        ),
        StatCard(
          icon: Icons.play_circle,
          title: "Đang diễn ra",
          value:
              _semesters.where((s) => s["status"] == "ACTIVE").length.toString(),
        ),
        StatCard(
          icon: Icons.warning_amber_rounded,
          title: "Sắp tới",
          value: _semesters
              .where((s) => s["status"] == "UPCOMING")
              .length
              .toString(),
        ),
        StatCard(
          icon: Icons.check_circle,
          title: "Đã kết thúc",
          value: _semesters
              .where((s) => s["status"] == "COMPLETED")
              .length
              .toString(),
        ),
      ],
    );
  }

  Widget _buildTimelineCard(double width) {
    final isNarrow = width < 760;

    return _SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Timeline Học kỳ",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 20),
          ..._semesters.map((s) {
            final color = _statusColor(s["status"] as String);
            final progress = _timelineProgress(s["status"] as String);

            if (isNarrow) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      s["name"] as String,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF111827),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 12,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: progress,
                        child: Container(
                          decoration: BoxDecoration(
                            color: color,
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${s["startDate"]} → ${s["endDate"]}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF6B7280),
                      ),
                    ),
                  ],
                ),
              );
            }

            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Row(
                children: [
                  SizedBox(
                    width: 140,
                    child: Text(
                      s["name"] as String,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF111827),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Container(
                      height: 12,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: progress,
                        child: Container(
                          decoration: BoxDecoration(
                            color: color,
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  SizedBox(
                    width: 180,
                    child: Text(
                      '${s["startDate"]} → ${s["endDate"]}',
                      textAlign: TextAlign.right,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF6B7280),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildCourseLoadCard() {
    return _SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Course Load Analyzer",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 20),
          ..._semesters.map((s) {
            final courses = List<String>.from(s["courses"] as List);
            final count = courses.length;

            return Padding(
              padding: const EdgeInsets.only(bottom: 18),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          s["name"] as String,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF111827),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        "$count courses",
                        style: const TextStyle(
                          fontSize: 14,
                          color: Color(0xFF374151),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      value: _courseLoadProgress(count),
                      backgroundColor: Colors.grey.shade200,
                      color: Colors.blue,
                      minHeight: 10,
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildFilterToolbar(double width) {
    final filterDropdown = DropdownButtonFormField<String>(
      value: _filter,
      onChanged: (value) {
        if (value == null) return;
        setState(() {
          _filter = value;
        });
      },
      decoration: InputDecoration(
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
      ),
      items: const [
        DropdownMenuItem(value: "ALL", child: Text("Tất cả")),
        DropdownMenuItem(value: "ACTIVE", child: Text("Đang diễn ra")),
        DropdownMenuItem(value: "UPCOMING", child: Text("Sắp tới")),
        DropdownMenuItem(value: "COMPLETED", child: Text("Đã kết thúc")),
      ],
    );

    if (width < 760) {
      return SizedBox(
        width: double.infinity,
        child: filterDropdown,
      );
    }

    return Row(
      children: [
        SizedBox(
          width: 240,
          child: filterDropdown,
        ),
      ],
    );
  }

  Widget _buildSemesterTable(double width) {
    final isNarrow = width < 860;

    return _SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isNarrow)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Danh sách Học kỳ",
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1F2937),
                  ),
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => _showSemesterDialog(),
                      icon: const Icon(Icons.add),
                      label: const Text("Thêm"),
                    ),
                    OutlinedButton.icon(
                      onPressed: _autoGenerateSemester,
                      icon: const Icon(Icons.auto_fix_high),
                      label: const Text("Auto Generate"),
                    ),
                  ],
                ),
              ],
            )
          else
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "Danh sách Học kỳ",
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1F2937),
                  ),
                ),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => _showSemesterDialog(),
                      icon: const Icon(Icons.add),
                      label: const Text("Thêm"),
                    ),
                    OutlinedButton.icon(
                      onPressed: _autoGenerateSemester,
                      icon: const Icon(Icons.auto_fix_high),
                      label: const Text("Auto Generate"),
                    ),
                  ],
                ),
              ],
            ),
          const SizedBox(height: 18),
          _buildFilterToolbar(width),
          const SizedBox(height: 18),
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xFFE5E7EB)),
              borderRadius: BorderRadius.circular(16),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    minWidth: isNarrow ? 900 : width - 40,
                  ),
                  child: DataTable(
                    headingRowColor: WidgetStateProperty.all(
                      const Color(0xFFF9FAFB),
                    ),
                    dataRowMinHeight: 64,
                    dataRowMaxHeight: 84,
                    columns: const [
                      DataColumn(label: Text("Tên")),
                      DataColumn(label: Text("Thời gian")),
                      DataColumn(label: Text("Môn học")),
                      DataColumn(label: Text("Trạng thái")),
                      DataColumn(label: Text("Thao tác")),
                    ],
                    rows: _filteredSemesters.map<DataRow>((s) {
                      final courses = List<String>.from(s["courses"] as List);

                      return DataRow(
                        cells: [
                          DataCell(
                            Text(
                              s["name"] as String,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          DataCell(
                            Text(
                              '${s["startDate"]} - ${s["endDate"]}',
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          DataCell(
                            SizedBox(
                              width: 220,
                              child: Text(
                                courses.join(", "),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                          DataCell(
                            StatusBadge(status: s["status"] as String),
                          ),
                          DataCell(
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  tooltip: "Chỉnh sửa",
                                  onPressed: () => _showSemesterDialog(
                                    semester: s,
                                  ),
                                  icon: const Icon(Icons.edit_outlined),
                                ),
                                IconButton(
                                  tooltip: "Xóa",
                                  onPressed: () => _confirmDeleteSemester(s),
                                  icon: const Icon(
                                    Icons.delete_outline,
                                    color: Colors.red,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      );
                    }).toList(),
                  ),
                ),
              ),
            ),
          ),
          if (_filteredSemesters.isEmpty) ...[
            const SizedBox(height: 18),
            const Center(
              child: Text(
                "Không tìm thấy học kỳ phù hợp.",
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF6B7280),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final horizontalPadding = width < 640 ? 16.0 : 24.0;
        final sideBySideCards = width >= 1050;
        final isMobile = width < 900;

        return Scaffold(
          backgroundColor: const Color(0xFFF6F8FC),
          drawer: isMobile ? const _AdminDrawer() : null,
          body: SafeArea(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(horizontalPadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildTopNavbar(width),
                  const SizedBox(height: 22),
                  _buildBreadcrumb(),
                  const SizedBox(height: 22),
                  const Text(
                    "Học kỳ",
                    style: TextStyle(
                      fontSize: 34,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF111827),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "Theo dõi timeline, tải môn học và danh sách học kỳ trong hệ thống.",
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFF6B7280),
                    ),
                  ),
                  const SizedBox(height: 24),
                  _buildOverviewStats(width),
                  const SizedBox(height: 24),
                  if (sideBySideCards)
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: _buildTimelineCard(width / 2)),
                        const SizedBox(width: 18),
                        Expanded(child: _buildCourseLoadCard()),
                      ],
                    )
                  else
                    Column(
                      children: [
                        _buildTimelineCard(width),
                        const SizedBox(height: 18),
                        _buildCourseLoadCard(),
                      ],
                    ),
                  const SizedBox(height: 24),
                  _buildSemesterTable(width),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _AdminDrawer extends StatelessWidget {
  const _AdminDrawer();

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: const Color(0xFF0B5D5B),
      child: SafeArea(
        child: Column(
          children: [
            Container(
              height: 76,
              padding: const EdgeInsets.symmetric(horizontal: 22),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.menu_book_rounded,
                      color: Color(0xFF0F766E),
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Devora',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(18, 10, 18, 18),
                children: const [
                  _SidebarSectionTitle('TỔNG QUAN'),
                  SizedBox(height: 8),
                  _SidebarItem(
                    icon: Icons.grid_view_rounded,
                    label: 'Dashboard',
                    route: '/admin',
                  ),
                  _SidebarItem(
                    icon: Icons.bar_chart_rounded,
                    label: 'Phân tích hệ thống',
                    route: '/admin/reports',
                  ),
                  SizedBox(height: 18),
                  _SidebarSectionTitle('HỌC VỤ'),
                  SizedBox(height: 8),
                  _SidebarItem(
                    icon: Icons.calendar_month_outlined,
                    label: 'Học kỳ',
                    route: '/admin/semesters',
                  ),
                  _SidebarItem(
                    icon: Icons.library_books_outlined,
                    label: 'Môn học',
                    route: '/admin/subjects',
                  ),
                  _SidebarItem(
                    icon: Icons.menu_book_outlined,
                    label: 'Lớp học phần',
                    route: '/admin/courses',
                  ),
                  _SidebarItem(
                    icon: Icons.account_tree_outlined,
                    label: 'Phân công giảng viên',
                    route: '/admin/assignments',
                  ),
                  SizedBox(height: 18),
                  _SidebarSectionTitle('NGƯỜI DÙNG'),
                  SizedBox(height: 8),
                  _SidebarItem(
                    icon: Icons.people_outline_rounded,
                    label: 'Tài khoản',
                    route: '/admin/accounts',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SidebarSectionTitle extends StatelessWidget {
  final String title;

  const _SidebarSectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF33D1C6),
          fontSize: 12,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.6,
        ),
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String route;

  const _SidebarItem({
    required this.icon,
    required this.label,
    required this.route,
  });

  @override
  Widget build(BuildContext context) {
    final String location = GoRouterState.of(context).uri.toString();

    final bool active =
        location == route || (route != '/admin' && location.startsWith(route));

    const Color activeBg = Color(0xFF0E746E);
    const Color activeText = Colors.white;
    const Color inactiveText = Color(0xFFD7FFFB);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            Navigator.of(context).maybePop();
            context.go(route);
          },
          child: Ink(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            decoration: BoxDecoration(
              color: active ? activeBg : Colors.transparent,
              borderRadius: BorderRadius.circular(16),
              boxShadow: active
                  ? [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.10),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ]
                  : null,
            ),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 22,
                  color: active ? activeText : inactiveText,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      color: active ? activeText : inactiveText,
                      fontSize: 15,
                      fontWeight: active ? FontWeight.w700 : FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final Widget child;

  const _SectionCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0F000000),
            blurRadius: 24,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: child,
    );
  }
}

class StatCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;

  const StatCard({
    super.key,
    required this.icon,
    required this.title,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0F000000),
            blurRadius: 18,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 24, color: const Color(0xFF1F2937)),
          const SizedBox(height: 8),
          Flexible(
            child: Text(
              title,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF6B7280),
                fontWeight: FontWeight.w600,
                height: 1.15,
              ),
            ),
          ),
          const SizedBox(height: 6),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              maxLines: 1,
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Color(0xFF111827),
                height: 1,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    String label;

    switch (status) {
      case "ACTIVE":
        bg = Colors.green;
        label = "Đang diễn ra";
        break;
      case "UPCOMING":
        bg = Colors.blue;
        label = "Sắp tới";
        break;
      default:
        bg = Colors.grey;
        label = "Đã kết thúc";
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: bg,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}