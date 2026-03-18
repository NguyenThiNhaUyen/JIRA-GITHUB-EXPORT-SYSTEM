import 'package:flutter/material.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/admin_navigation.dart';
import '../../services/admin_service.dart';

class AdminSubjectsScreen extends StatefulWidget {
  const AdminSubjectsScreen({super.key});

  @override
  State<AdminSubjectsScreen> createState() => _AdminSubjectsScreenState();
}

class _AdminSubjectsScreenState extends State<AdminSubjectsScreen> {
  final TextEditingController _searchController = TextEditingController();

  static const Map<String, String> _departmentPrefix = {
    "Software Engineering": "SWD",
    "Artificial Intelligence": "AI",
    "Information Security": "SEC",
    "Business Administration": "BUS",
  };

  final AdminService _adminService = AdminService();
  bool _isLoading = false;
  final List<Map<String, dynamic>> _subjects = [];

  String _filter = "ALL";
  String _search = "";

  List<Map<String, dynamic>> get _filteredSubjects {
    var result = [..._subjects];

    if (_filter != "ALL") {
      result = result.where((s) => s["status"] == _filter).toList();
    }

    if (_search.trim().isNotEmpty) {
      final keyword = _search.trim().toLowerCase();
      result = result.where((s) {
        final code = (s["code"] as String).toLowerCase();
        final name = (s["name"] as String).toLowerCase();
        final department = (s["department"] as String).toLowerCase();
        final description = (s["description"] as String? ?? "").toLowerCase();

        return code.contains(keyword) ||
            name.contains(keyword) ||
            department.contains(keyword) ||
            description.contains(keyword);
      }).toList();
    }

    return result;
  }

  int get _nextId {
    if (_subjects.isEmpty) return 1;
    return _subjects
            .map((e) => e["id"] as int)
            .reduce((value, element) => value > element ? value : element) +
        1;
  }

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final subjects = await _adminService.getSubjects();
      setState(() {
        _subjects.clear();
        _subjects.addAll(subjects);
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _showSnack("Lỗi tải danh sách môn học", success: false);
      }
    }
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
      default:
        return Colors.grey;
    }
  }

  double _statusProgress(String status) {
    switch (status) {
      case "ACTIVE":
        return 0.85;
      default:
        return 0.45;
    }
  }

  double _creditLoadProgress(int credits) {
    return (credits / 6).clamp(0.0, 1.0);
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

  void _autoGenerateSubject() {
    final count = _subjects.length + 1;

    final generated = {
      "id": _nextId,
      "department": "Software Engineering",
      "courseNumber": "30$count",
      "code": "SWD30$count",
      "name": "Auto Subject $count",
      "description": "Auto generated subject for demo purpose",
      "credits": 3,
      "maxStudents": 40,
      "status": "ACTIVE",
    };

    setState(() {
      _subjects.add(generated);
    });

    _showSnack("Đã tạo môn học mẫu tự động.");
  }

  Future<void> _showSubjectDialog({Map<String, dynamic>? subject}) async {
    final bool isEdit = subject != null;

    final nameController = TextEditingController(text: subject?["name"] ?? "");
    final descriptionController = TextEditingController(
      text: subject?["description"] ?? "",
    );
    final courseNumberController = TextEditingController(
      text: subject?["courseNumber"]?.toString() ?? "",
    );
    final creditsController = TextEditingController(
      text: (subject?["credits"] ?? 3).toString(),
    );
    final maxStudentsController = TextEditingController(
      text: (subject?["maxStudents"] ?? 40).toString(),
    );

    String department = subject?["department"] ?? "";
    String code = subject?["code"] ?? "";
    String status = subject?["status"] ?? "ACTIVE";

    void regenerateCode(void Function(VoidCallback fn) setLocalState) {
      final prefix = _departmentPrefix[department] ?? "";
      final courseNumber = courseNumberController.text.trim();

      setLocalState(() {
        if (department.isNotEmpty && courseNumber.isNotEmpty) {
          code = "$prefix$courseNumber";
        } else {
          code = "";
        }
      });
    }

    await showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setLocalState) {
            final width = MediaQuery.of(context).size.width;
            final isMobile = width < 700;

            return AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              title: Text(isEdit ? "Chỉnh sửa môn học" : "Thêm môn học"),
              content: SizedBox(
                width: 560,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (isMobile) ...[
                        DropdownButtonFormField<String>(
                          value: department.isEmpty ? null : department,
                          decoration: const InputDecoration(
                            labelText: "Bộ môn",
                            border: OutlineInputBorder(),
                          ),
                          items: const [
                            DropdownMenuItem(
                              value: "Software Engineering",
                              child: Text("Software Engineering"),
                            ),
                            DropdownMenuItem(
                              value: "Artificial Intelligence",
                              child: Text("Artificial Intelligence"),
                            ),
                            DropdownMenuItem(
                              value: "Information Security",
                              child: Text("Information Security"),
                            ),
                            DropdownMenuItem(
                              value: "Business Administration",
                              child: Text("Business Administration"),
                            ),
                          ],
                          onChanged: (value) {
                            department = value ?? "";
                            regenerateCode(setLocalState);
                          },
                        ),
                        const SizedBox(height: 14),
                        TextField(
                          controller: courseNumberController,
                          keyboardType: TextInputType.number,
                          onChanged: (_) => regenerateCode(setLocalState),
                          decoration: const InputDecoration(
                            labelText: "Course Number",
                            hintText: "Ví dụ: 392",
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ] else
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: department.isEmpty ? null : department,
                                decoration: const InputDecoration(
                                  labelText: "Bộ môn",
                                  border: OutlineInputBorder(),
                                ),
                                items: const [
                                  DropdownMenuItem(
                                    value: "Software Engineering",
                                    child: Text("Software Engineering"),
                                  ),
                                  DropdownMenuItem(
                                    value: "Artificial Intelligence",
                                    child: Text("Artificial Intelligence"),
                                  ),
                                  DropdownMenuItem(
                                    value: "Information Security",
                                    child: Text("Information Security"),
                                  ),
                                  DropdownMenuItem(
                                    value: "Business Administration",
                                    child: Text("Business Administration"),
                                  ),
                                ],
                                onChanged: (value) {
                                  department = value ?? "";
                                  regenerateCode(setLocalState);
                                },
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: TextField(
                                controller: courseNumberController,
                                keyboardType: TextInputType.number,
                                onChanged: (_) => regenerateCode(setLocalState),
                                decoration: const InputDecoration(
                                  labelText: "Course Number",
                                  hintText: "Ví dụ: 392",
                                  border: OutlineInputBorder(),
                                ),
                              ),
                            ),
                          ],
                        ),
                      const SizedBox(height: 14),
                      TextField(
                        readOnly: true,
                        controller: TextEditingController(text: code),
                        decoration: const InputDecoration(
                          labelText: "Mã môn học",
                          border: OutlineInputBorder(),
                          filled: true,
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: nameController,
                        decoration: const InputDecoration(
                          labelText: "Tên môn học",
                          hintText: "Ví dụ: Software Architecture",
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: descriptionController,
                        maxLines: 3,
                        decoration: const InputDecoration(
                          labelText: "Mô tả môn học",
                          hintText: "Nhập mô tả ngắn...",
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 14),
                      if (isMobile) ...[
                        TextField(
                          controller: creditsController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: "Tín chỉ",
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 14),
                        TextField(
                          controller: maxStudentsController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: "SV tối đa",
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
                              child: Text("Đang áp dụng"),
                            ),
                            DropdownMenuItem(
                              value: "INACTIVE",
                              child: Text("Ngừng áp dụng"),
                            ),
                          ],
                          onChanged: (value) {
                            if (value == null) return;
                            setLocalState(() {
                              status = value;
                            });
                          },
                        ),
                      ] else
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: creditsController,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(
                                  labelText: "Tín chỉ",
                                  border: OutlineInputBorder(),
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: TextField(
                                controller: maxStudentsController,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(
                                  labelText: "SV tối đa",
                                  border: OutlineInputBorder(),
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: status,
                                decoration: const InputDecoration(
                                  labelText: "Trạng thái",
                                  border: OutlineInputBorder(),
                                ),
                                items: const [
                                  DropdownMenuItem(
                                    value: "ACTIVE",
                                    child: Text("Đang áp dụng"),
                                  ),
                                  DropdownMenuItem(
                                    value: "INACTIVE",
                                    child: Text("Ngừng áp dụng"),
                                  ),
                                ],
                                onChanged: (value) {
                                  if (value == null) return;
                                  setLocalState(() {
                                    status = value;
                                  });
                                },
                              ),
                            ),
                          ],
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
                    final description = descriptionController.text.trim();
                    final courseNumber = courseNumberController.text.trim();
                    final credits =
                        int.tryParse(creditsController.text.trim()) ?? 0;
                    final maxStudents =
                        int.tryParse(maxStudentsController.text.trim()) ?? 0;

                    if (department.isEmpty ||
                        courseNumber.isEmpty ||
                        code.isEmpty ||
                        name.isEmpty ||
                        credits <= 0 ||
                        maxStudents <= 0) {
                      _showSnack(
                        "Vui lòng nhập đầy đủ thông tin hợp lệ.",
                        success: false,
                      );
                      return;
                    }

                    if (isEdit) {
                      setState(() {
                        subject["department"] = department;
                        subject["courseNumber"] = courseNumber;
                        subject["code"] = code;
                        subject["name"] = name;
                        subject["description"] = description;
                        subject["credits"] = credits;
                        subject["maxStudents"] = maxStudents;
                        subject["status"] = status;
                      });
                      _showSnack("Cập nhật môn học thành công.");
                    } else {
                      setState(() {
                        _subjects.add({
                          "id": _nextId,
                          "department": department,
                          "courseNumber": courseNumber,
                          "code": code,
                          "name": name,
                          "description": description,
                          "credits": credits,
                          "maxStudents": maxStudents,
                          "status": status,
                        });
                      });
                      _showSnack("Đã thêm môn học mới.");
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
    descriptionController.dispose();
    courseNumberController.dispose();
    creditsController.dispose();
    maxStudentsController.dispose();
  }

  Future<void> _confirmDeleteSubject(Map<String, dynamic> subject) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: const Text("Xóa môn học"),
          content: Text('Bạn có chắc muốn xóa "${subject["name"]}" không?'),
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
        _subjects.removeWhere((s) => s["id"] == subject["id"]);
      });
      _showSnack("Đã xóa môn học.");
    }
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
        Icon(Icons.chevron_right_rounded, size: 18, color: Color(0xFF94A3B8)),
        SizedBox(width: 8),
        Text(
          "Quản lý môn học",
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
          icon: Icons.library_books_outlined,
          title: "Tổng số môn học",
          value: _subjects.length.toString(),
        ),
        StatCard(
          icon: Icons.check_circle_outline,
          title: "Đang áp dụng",
          value: _subjects
              .where((s) => s["status"] == "ACTIVE")
              .length
              .toString(),
        ),
        StatCard(
          icon: Icons.pause_circle_outline,
          title: "Ngừng áp dụng",
          value: _subjects
              .where((s) => s["status"] == "INACTIVE")
              .length
              .toString(),
        ),
        StatCard(
          icon: Icons.account_balance_outlined,
          title: "Bộ môn",
          value: _subjects
              .map((s) => s["department"] as String)
              .toSet()
              .length
              .toString(),
        ),
      ],
    );
  }

  Widget _buildSubjectStatusCard(double width) {
    final isNarrow = width < 760;

    return _SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Subject Status Overview",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 20),
          ..._subjects.map((s) {
            final color = _statusColor(s["status"] as String);
            final progress = _statusProgress(s["status"] as String);

            if (isNarrow) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      s["code"] as String,
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
                      s["name"] as String,
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
                      s["code"] as String,
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
                      s["name"] as String,
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

  Widget _buildCreditLoadCard() {
    return _SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Credit Load Analyzer",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 20),
          ..._subjects.map((s) {
            final credits = s["credits"] as int;

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
                        "$credits credits",
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
                      value: _creditLoadProgress(credits),
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
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 12,
        ),
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
        DropdownMenuItem(value: "ACTIVE", child: Text("Đang áp dụng")),
        DropdownMenuItem(value: "INACTIVE", child: Text("Ngừng áp dụng")),
      ],
    );

    final searchField = TextField(
      controller: _searchController,
      onChanged: (value) => setState(() => _search = value),
      decoration: InputDecoration(
        hintText: 'Tìm kiếm bộ môn, tên môn...',
        hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
        prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF64748B)),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 0),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
      ),
    );

    if (width < 760) {
      return Column(
        children: [
          searchField,
          const SizedBox(height: 12),
          SizedBox(width: double.infinity, child: filterDropdown),
        ],
      );
    }

    return Row(
      children: [
        Expanded(child: searchField),
        const SizedBox(width: 16),
        SizedBox(width: 240, child: filterDropdown),
      ],
    );
  }

  Widget _buildSubjectTable(double width) {
    final isNarrow = width < 980;

    return _SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isNarrow)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Danh sách Môn học",
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
                      onPressed: () => _showSubjectDialog(),
                      icon: const Icon(Icons.add),
                      label: const Text("Thêm"),
                    ),
                    OutlinedButton.icon(
                      onPressed: _autoGenerateSubject,
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
                  "Danh sách Môn học",
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
                      onPressed: () => _showSubjectDialog(),
                      icon: const Icon(Icons.add),
                      label: const Text("Thêm"),
                    ),
                    OutlinedButton.icon(
                      onPressed: _autoGenerateSubject,
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
                    minWidth: isNarrow ? 1180 : width - 40,
                  ),
                  child: DataTable(
                    headingRowColor: WidgetStateProperty.all(
                      const Color(0xFFF9FAFB),
                    ),
                    dataRowMinHeight: 64,
                    dataRowMaxHeight: 88,
                    columns: const [
                      DataColumn(label: Text("Mã")),
                      DataColumn(label: Text("Tên")),
                      DataColumn(label: Text("Bộ môn")),
                      DataColumn(label: Text("Tín chỉ")),
                      DataColumn(label: Text("SV tối đa")),
                      DataColumn(label: Text("Trạng thái")),
                      DataColumn(label: Text("Thao tác")),
                    ],
                    rows: _filteredSubjects.map<DataRow>((s) {
                      return DataRow(
                        cells: [
                          DataCell(Text(s["code"] as String)),
                          DataCell(
                            SizedBox(
                              width: 220,
                              child: Text(
                                s["name"] as String,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                          DataCell(
                            SizedBox(
                              width: 190,
                              child: Text(
                                s["department"] as String,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                          DataCell(Text("${s["credits"]}")),
                          DataCell(Text("${s["maxStudents"]}")),
                          DataCell(
                            SubjectStatusBadge(status: s["status"] as String),
                          ),
                          DataCell(
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  tooltip: "Chỉnh sửa",
                                  onPressed: () =>
                                      _showSubjectDialog(subject: s),
                                  icon: const Icon(Icons.edit_outlined),
                                ),
                                IconButton(
                                  tooltip: "Xóa",
                                  onPressed: () => _confirmDeleteSubject(s),
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
          if (_filteredSubjects.isEmpty) ...[
            const SizedBox(height: 18),
            const Center(
              child: Text(
                "Không tìm thấy môn học phù hợp.",
                style: TextStyle(fontSize: 14, color: Color(0xFF6B7280)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTopNavbar() {
    return AppTopHeader(
      title: 'Môn học',
      primary: false,
      user: const AppUser(
        name: 'Super Admin',
        email: 'admin@fe.edu.vn',
        role: 'ADMIN',
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isMobile = width < 900;
    final horizontalPadding = isMobile ? 16.0 : 24.0;
    final sideBySideCards = width >= 1050;

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
                    _buildTopNavbar(),
                    Expanded(
                      child: _isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : SingleChildScrollView(
                        padding: EdgeInsets.all(horizontalPadding),
                        child: Center(
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(maxWidth: 1400),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildBreadcrumb(),
                                const SizedBox(height: 18),
                                const Text(
                                  "Môn học",
                                  style: TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF111827),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                const Text(
                                  "Theo dõi trạng thái, tín chỉ và danh sách môn học trong hệ thống.",
                                  style: TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
                                ),
                                const SizedBox(height: 22),
                                _buildOverviewStats(width),
                                const SizedBox(height: 22),
                                if (sideBySideCards)
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Expanded(child: _buildSubjectStatusCard(width / 2)),
                                      const SizedBox(width: 18),
                                      Expanded(child: _buildCreditLoadCard()),
                                    ],
                                  )
                                else
                                  Column(
                                    children: [
                                      _buildSubjectStatusCard(width),
                                      const SizedBox(height: 18),
                                      _buildCreditLoadCard(),
                                    ],
                                  ),
                                const SizedBox(height: 22),
                                _buildSubjectTable(width),
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

class SubjectStatusBadge extends StatelessWidget {
  final String status;

  const SubjectStatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    String label;

    switch (status) {
      case "ACTIVE":
        bg = Colors.green;
        label = "Đang áp dụng";
        break;
      default:
        bg = Colors.grey;
        label = "Ngừng áp dụng";
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(color: bg, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }
}
