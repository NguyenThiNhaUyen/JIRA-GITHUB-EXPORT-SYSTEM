import 'package:flutter/material.dart';

class AdminSubjectsScreen extends StatefulWidget {
  const AdminSubjectsScreen({super.key});

  @override
  State<AdminSubjectsScreen> createState() => _AdminSubjectsScreenState();
}

class _AdminSubjectsScreenState extends State<AdminSubjectsScreen> {
  static const Map<String, String> departmentPrefix = {
    "Software Engineering": "SWD",
    "Artificial Intelligence": "AI",
    "Information Security": "SEC",
    "Business Administration": "BUS",
  };

  final List<Map<String, dynamic>> _subjects = [
    {
      "id": 1,
      "department": "Software Engineering",
      "courseNumber": "392",
      "code": "SWD392",
      "name": "Software Architecture and Design",
      "description": "Môn học về kiến trúc và thiết kế phần mềm.",
      "credits": 3,
      "maxStudents": 40,
      "status": "ACTIVE",
    },
    {
      "id": 2,
      "department": "Artificial Intelligence",
      "courseNumber": "301",
      "code": "AI301",
      "name": "Introduction to AI",
      "description": "Nhập môn trí tuệ nhân tạo.",
      "credits": 3,
      "maxStudents": 35,
      "status": "ACTIVE",
    },
    {
      "id": 3,
      "department": "Information Security",
      "courseNumber": "201",
      "code": "SEC201",
      "name": "Cyber Security Basics",
      "description": "Kiến thức nền tảng về bảo mật thông tin.",
      "credits": 4,
      "maxStudents": 45,
      "status": "INACTIVE",
    },
  ];

  bool _isLoading = false;
  bool _showModal = false;
  Map<String, dynamic>? _editingSubject;

  Map<String, dynamic> _formData = {
    "department": "",
    "courseNumber": "",
    "code": "",
    "name": "",
    "description": "",
    "credits": 3,
    "maxStudents": 40,
    "status": "ACTIVE",
  };

  int get _activeCount =>
      _subjects.where((s) => s["status"] == "ACTIVE").length;

  int get _nextId {
    if (_subjects.isEmpty) return 1;
    return _subjects
            .map((e) => e["id"] as int)
            .reduce((a, b) => a > b ? a : b) +
        1;
  }

  void _showSnack(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _updateGeneratedCode() {
    final department = _formData["department"]?.toString() ?? "";
    final courseNumber = _formData["courseNumber"]?.toString() ?? "";

    if (department.isNotEmpty && courseNumber.isNotEmpty) {
      final prefix = departmentPrefix[department] ?? "";
      _formData["code"] = "$prefix$courseNumber";
    } else {
      _formData["code"] = "";
    }
  }

  void _handleCreate() {
    setState(() {
      _editingSubject = null;
      _formData = {
        "department": "",
        "courseNumber": "",
        "code": "",
        "name": "",
        "description": "",
        "credits": 3,
        "maxStudents": 40,
        "status": "ACTIVE",
      };
      _showModal = true;
    });

    _openSubjectDialog();
  }

  void _handleEdit(Map<String, dynamic> subject) {
    final courseNumber =
        (subject["code"]?.toString() ?? "").replaceAll(RegExp(r'[A-Z]'), '');

    setState(() {
      _editingSubject = subject;
      _formData = {
        "department": subject["department"] ?? "",
        "courseNumber": courseNumber,
        "code": subject["code"] ?? "",
        "name": subject["name"] ?? "",
        "description": subject["description"] ?? "",
        "credits": subject["credits"] ?? 3,
        "maxStudents": subject["maxStudents"] ?? 40,
        "status": subject["status"] ?? "ACTIVE",
      };
      _showModal = true;
    });

    _openSubjectDialog();
  }

  Future<void> _handleDelete(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text("Xác nhận xóa"),
          content: const Text("Bạn có chắc chắn muốn xóa môn học này?"),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          actions: [
            OutlinedButton(
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

    if (confirm != true) return;

    try {
      setState(() {
        _subjects.removeWhere((s) => s["id"] == id);
      });

      _showSnack("Xóa môn học thành công!");
    } catch (e) {
      _showSnack("Xóa thất bại", isError: true);
    }
  }

  Future<void> _handleSubmit() async {
    try {
      if ((_formData["department"]?.toString() ?? "").isEmpty ||
          (_formData["courseNumber"]?.toString() ?? "").isEmpty ||
          (_formData["name"]?.toString() ?? "").isEmpty) {
        _showSnack("Vui lòng nhập đầy đủ các trường bắt buộc", isError: true);
        return;
      }

      _updateGeneratedCode();

      if (_editingSubject != null) {
        final index =
            _subjects.indexWhere((s) => s["id"] == _editingSubject!["id"]);

        if (index != -1) {
          setState(() {
            _subjects[index] = {
              "id": _editingSubject!["id"],
              "department": _formData["department"],
              "courseNumber": _formData["courseNumber"],
              "code": _formData["code"],
              "name": _formData["name"],
              "description": _formData["description"],
              "credits": _formData["credits"],
              "maxStudents": _formData["maxStudents"],
              "status": _formData["status"],
            };
            _showModal = false;
          });
        }

        if (mounted) Navigator.pop(context);
        _showSnack("Cập nhật môn học thành công!");
      } else {
        setState(() {
          _subjects.add({
            "id": _nextId,
            "department": _formData["department"],
            "courseNumber": _formData["courseNumber"],
            "code": _formData["code"],
            "name": _formData["name"],
            "description": _formData["description"],
            "credits": _formData["credits"],
            "maxStudents": _formData["maxStudents"],
            "status": _formData["status"],
          });
          _showModal = false;
        });

        if (mounted) Navigator.pop(context);
        _showSnack("Tạo môn học thành công!");
      }
    } catch (e) {
      _showSnack("Thao tác thất bại", isError: true);
    }
  }

  Future<void> _openSubjectDialog() async {
    final departmentController =
        TextEditingController(text: _formData["department"]?.toString() ?? "");
    final courseNumberController =
        TextEditingController(text: _formData["courseNumber"]?.toString() ?? "");
    final codeController =
        TextEditingController(text: _formData["code"]?.toString() ?? "");
    final nameController =
        TextEditingController(text: _formData["name"]?.toString() ?? "");
    final descriptionController =
        TextEditingController(text: _formData["description"]?.toString() ?? "");
    final creditsController =
        TextEditingController(text: _formData["credits"].toString());
    final maxStudentsController =
        TextEditingController(text: _formData["maxStudents"].toString());

    String selectedDepartment = _formData["department"]?.toString() ?? "";
    String selectedStatus = _formData["status"]?.toString() ?? "ACTIVE";

    void syncFormFromControllers() {
      _formData["department"] = selectedDepartment;
      _formData["courseNumber"] = courseNumberController.text.trim();
      _formData["name"] = nameController.text.trim();
      _formData["description"] = descriptionController.text.trim();
      _formData["credits"] = int.tryParse(creditsController.text.trim()) ?? 3;
      _formData["maxStudents"] =
          int.tryParse(maxStudentsController.text.trim()) ?? 40;
      _formData["status"] = selectedStatus;
      _updateGeneratedCode();
      codeController.text = _formData["code"]?.toString() ?? "";
    }

    Future<void> showValidationError() async {
      _showSnack("Vui lòng nhập đầy đủ các trường bắt buộc", isError: true);
    }

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: Text(
                _editingSubject != null ? "Sửa môn học" : "Tạo môn học mới",
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              content: SizedBox(
                width: 650,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: _buildDropdownField(
                              label: "Bộ môn *",
                              value: selectedDepartment.isEmpty
                                  ? null
                                  : selectedDepartment,
                              items: const [
                                "Software Engineering",
                                "Artificial Intelligence",
                                "Information Security",
                                "Business Administration",
                              ],
                              onChanged: (value) {
                                setDialogState(() {
                                  selectedDepartment = value ?? "";
                                  syncFormFromControllers();
                                });
                              },
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildTextField(
                              controller: courseNumberController,
                              label: "Course Number *",
                              hintText: "VD: 392",
                              keyboardType: TextInputType.number,
                              onChanged: (_) {
                                setDialogState(() {
                                  syncFormFromControllers();
                                });
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      _buildTextField(
                        controller: codeController,
                        label: "Mã môn học",
                        readOnly: true,
                      ),
                      const SizedBox(height: 16),
                      _buildTextField(
                        controller: nameController,
                        label: "Tên môn học *",
                        onChanged: (_) {
                          syncFormFromControllers();
                        },
                      ),
                      const SizedBox(height: 16),
                      _buildTextField(
                        controller: descriptionController,
                        label: "Mô tả môn học",
                        maxLines: 3,
                        onChanged: (_) {
                          syncFormFromControllers();
                        },
                      ),
                      const SizedBox(height: 16),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: _buildTextField(
                              controller: creditsController,
                              label: "Tín chỉ",
                              keyboardType: TextInputType.number,
                              onChanged: (_) {
                                syncFormFromControllers();
                              },
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildTextField(
                              controller: maxStudentsController,
                              label: "SV tối đa",
                              keyboardType: TextInputType.number,
                              onChanged: (_) {
                                syncFormFromControllers();
                              },
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildDropdownField(
                              label: "Trạng thái",
                              value: selectedStatus,
                              items: const ["ACTIVE", "INACTIVE"],
                              onChanged: (value) {
                                setDialogState(() {
                                  selectedStatus = value ?? "ACTIVE";
                                  syncFormFromControllers();
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
                OutlinedButton(
                  onPressed: () {
                    setState(() {
                      _showModal = false;
                    });
                    Navigator.pop(dialogContext);
                  },
                  child: const Text("Hủy"),
                ),
                ElevatedButton(
                  onPressed: () async {
                    syncFormFromControllers();

                    if (selectedDepartment.isEmpty ||
                        courseNumberController.text.trim().isEmpty ||
                        nameController.text.trim().isEmpty) {
                      await showValidationError();
                      return;
                    }

                    await _handleSubmit();
                  },
                  child: Text(_editingSubject != null ? "Cập nhật" : "Tạo mới"),
                ),
              ],
            );
          },
        );
      },
    );

    departmentController.dispose();
    courseNumberController.dispose();
    codeController.dispose();
    nameController.dispose();
    descriptionController.dispose();
    creditsController.dispose();
    maxStudentsController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    const bgColor = Color(0xFFF6F8FC);

    return Scaffold(
      backgroundColor: bgColor,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _buildStatCard(
                          icon: Icons.menu_book_rounded,
                          iconBg: Colors.indigo,
                          title: "Tổng số môn học",
                          value: _subjects.length.toString(),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildStatCard(
                          icon: Icons.check_circle,
                          iconBg: Colors.green,
                          title: "Đang áp dụng",
                          value: _activeCount.toString(),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _buildTableCard(),
                ],
              ),
            ),
    );
  }

  Widget _buildTableCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0D000000),
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          children: [
            Row(
              children: [
                const Expanded(
                  child: Text(
                    "Danh sách Môn học",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                ElevatedButton(
                  onPressed: _handleCreate,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.indigo,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 14,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text("+ Thêm Môn học"),
                ),
              ],
            ),
            const SizedBox(height: 18),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                headingRowColor: WidgetStateProperty.all(
                  const Color(0xFFF8FAFC),
                ),
                columnSpacing: 28,
                columns: const [
                  DataColumn(label: Text("Mã")),
                  DataColumn(label: Text("Tên")),
                  DataColumn(label: Text("Bộ môn")),
                  DataColumn(label: Text("Tín chỉ")),
                  DataColumn(label: Text("SV tối đa")),
                  DataColumn(label: Text("Trạng thái")),
                  DataColumn(label: Text("Thao tác")),
                ],
                rows: _subjects.map((subject) {
                  return DataRow(
                    cells: [
                      DataCell(Text(subject["code"].toString())),
                      DataCell(Text(subject["name"].toString())),
                      DataCell(Text(subject["department"].toString())),
                      DataCell(Text(subject["credits"].toString())),
                      DataCell(Text(subject["maxStudents"].toString())),
                      DataCell(
                        _buildStatusChip(subject["status"].toString()),
                      ),
                      DataCell(
                        Row(
                          children: [
                            OutlinedButton(
                              onPressed: () => _handleEdit(subject),
                              child: const Text("Sửa"),
                            ),
                            const SizedBox(width: 8),
                            OutlinedButton(
                              onPressed: () =>
                                  _handleDelete(subject["id"] as int),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.red,
                                side: const BorderSide(color: Colors.red),
                              ),
                              child: const Text("Xóa"),
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    final isActive = status == "ACTIVE";
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: isActive
            ? Colors.green.withOpacity(0.12)
            : Colors.grey.withOpacity(0.15),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status,
        style: TextStyle(
          fontWeight: FontWeight.w600,
          color: isActive ? Colors.green.shade700 : Colors.grey.shade700,
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required Color iconBg,
    required String title,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0D000000),
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: iconBg,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    String? hintText,
    bool readOnly = false,
    int maxLines = 1,
    TextInputType? keyboardType,
    ValueChanged<String>? onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF374151),
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          readOnly: readOnly,
          maxLines: maxLines,
          keyboardType: keyboardType,
          onChanged: onChanged,
          decoration: InputDecoration(
            hintText: hintText,
            filled: true,
            fillColor:
                readOnly ? const Color(0xFFF3F4F6) : const Color(0xFFF9FAFB),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 14,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.indigo, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdownField({
    required String label,
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF374151),
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: value,
          onChanged: onChanged,
          decoration: InputDecoration(
            filled: true,
            fillColor: const Color(0xFFF9FAFB),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 14,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.indigo, width: 1.5),
            ),
          ),
          items: items
              .map(
                (e) => DropdownMenuItem<String>(
                  value: e,
                  child: Text(e),
                ),
              )
              .toList(),
        ),
      ],
    );
  }
}