import 'package:flutter/material.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/admin_navigation.dart';
import '../../services/admin_service.dart';
import '../../services/auth_service.dart';

class AdminSemestersScreen extends StatefulWidget {
  const AdminSemestersScreen({super.key});

  @override
  State<AdminSemestersScreen> createState() => _AdminSemestersScreenState();
}

class _AdminSemestersScreenState extends State<AdminSemestersScreen> {
  final TextEditingController _searchController = TextEditingController();
  final AdminService _adminService = AdminService();
  final AuthService _authService = AuthService();
  AppUser? _currentUser;

  final List<Map<String, dynamic>> _semesters = [];

  final List<Map<String, dynamic>> _subjects = [];

  final List<Map<String, dynamic>> _lecturers = [];

  final List<Map<String, dynamic>> _courses = [];

  bool _isLoading = false;

  String _filterSemester = "";
  String _search = "";

  List<Map<String, dynamic>> _viewStudentsList = [];

  List<Map<String, dynamic>> get _filteredCourses {
    var result = [..._courses];

    if (_filterSemester.isNotEmpty) {
      result = result
          .where(
            (c) => c["semesterId"].toString() == _filterSemester.toString(),
          )
          .toList();
    }

    if (_search.trim().isNotEmpty) {
      final keyword = _search.trim().toLowerCase();

      result = result.where((c) {
        final code = (c["code"] as String).toLowerCase();
        final name = (c["name"] as String).toLowerCase();
        final subjectCode = getSubjectCode(c["subjectId"]).toLowerCase();
        final semesterName = getSemesterName(c["semesterId"]).toLowerCase();
        final lecturerName = (getCourseLecturerName(c) ?? "").toLowerCase();

        return code.contains(keyword) ||
            name.contains(keyword) ||
            subjectCode.contains(keyword) ||
            semesterName.contains(keyword) ||
            lecturerName.contains(keyword);
      }).toList();
    }

    return result;
  }

  int get _nextCourseId {
    if (_courses.isEmpty) return 1;
    return _courses.map((e) => e["id"] as int).reduce((a, b) => a > b ? a : b) +
        1;
  }

  @override
  void initState() {
    super.initState();
    _loadUser();
    _loadData();
  }

  Future<void> _loadUser() async {
    final user = await _authService.getCurrentUser();
    if (user != null && mounted) {
      setState(() {
        _currentUser = AppUser(
          name: user.fullName.isNotEmpty ? user.fullName : 'Admin',
          email: user.email,
          role: user.roles.isNotEmpty ? user.roles.first : 'ADMIN',
        );
      });
    }
  }

  Future<void> _loadData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        _adminService.getSemesters(),
        _adminService.getSubjects(),
        _adminService.getUsers(),
        _adminService.getCourses(),
      ]);

      if (!mounted) return;
      setState(() {
        _semesters.clear();
        _semesters.addAll(List<Map<String, dynamic>>.from(results[0]));
        _subjects.clear();
        _subjects.addAll(List<Map<String, dynamic>>.from(results[1]));

        _lecturers.clear();
        _lecturers.addAll(List<Map<String, dynamic>>.from(results[2])
            .where((u) => u['role'] == 'LECTURER' || u['role'] == 'lecturer'));

        _courses.clear();
        _courses.addAll(List<Map<String, dynamic>>.from(results[3]));
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _showSnack("Lỗi tải dữ liệu", success: false);
      }
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
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

  String getSemesterName(dynamic semesterId) {
    final sem = _semesters.firstWhere(
      (s) => s["id"].toString() == semesterId.toString(),
      orElse: () => <String, dynamic>{},
    );
    return sem["name"]?.toString() ?? "N/A";
  }

  String getSubjectCode(dynamic subjectId) {
    final sub = _subjects.firstWhere(
      (s) => s["id"].toString() == subjectId.toString(),
      orElse: () => <String, dynamic>{},
    );
    return sub["code"]?.toString() ?? "N/A";
  }

  List<Map<String, dynamic>> getCourseLecturers(Map<String, dynamic> course) {
    return List<Map<String, dynamic>>.from(course["lecturers"] ?? []);
  }

  String? getCourseLecturerName(Map<String, dynamic> course) {
    final lecturers = getCourseLecturers(course);
    return lecturers.isNotEmpty ? lecturers.first["name"]?.toString() : null;
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

  double _courseStatusProgress(String status) {
    switch (status) {
      case "ACTIVE":
        return 0.78;
      case "UPCOMING":
        return 0.48;
      default:
        return 1.0;
    }
  }

  double _studentLoadProgress(int currentStudents, int maxStudents) {
    if (maxStudents <= 0) return 0;
    return (currentStudents / maxStudents).clamp(0.0, 1.0);
  }

  void _handleCreate() {
    _showCourseDialog();
  }

  Future<void> _handleDelete(int id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: const Text("Xóa lớp học"),
          content: const Text("Bạn có chắc chắn muốn xóa lớp học này?"),
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
      setState(() => _isLoading = true);
      final success = await _adminService.deleteCourse(id);
      if (success) {
        _showSnack("Xóa lớp học thành công!");
        _loadData();
      } else {
        setState(() => _isLoading = false);
        _showSnack("Không thể xóa lớp học này.", success: false);
      }
    }
  }

  Future<void> _showCourseDialog({Map<String, dynamic>? course}) async {
    final bool isEdit = course != null;

    final codeController = TextEditingController(text: course?["code"] ?? "");
    final nameController = TextEditingController(text: course?["name"] ?? "");
    final descriptionController = TextEditingController(
      text: course?["description"] ?? "",
    );
    final roomController = TextEditingController(text: course?["room"] ?? "");
    final startDateController = TextEditingController(
      text: course?["startDate"] ?? "",
    );
    final endDateController = TextEditingController(
      text: course?["endDate"] ?? "",
    );
    final minStudentsController = TextEditingController(
      text: (course?["minStudents"] ?? 10).toString(),
    );
    final maxStudentsController = TextEditingController(
      text: (course?["maxStudents"] ?? 40).toString(),
    );

    String subjectId = course?["subjectId"]?.toString() ?? "";
    String semesterId = course?["semesterId"]?.toString() ?? "";
    String lecturerId = getCourseLecturers(course ?? {}).isNotEmpty
        ? getCourseLecturers(course!).first["id"].toString()
        : "";
    String status = course?["status"] ?? "ACTIVE";

    await showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setLocalState) {
            final width = MediaQuery.of(context).size.width;
            final isMobile = width < 760;

            return AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              title: Text(isEdit ? "Chỉnh sửa lớp học" : "Tạo lớp học mới"),
              content: SizedBox(
                width: 720,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextField(
                        controller: codeController,
                        decoration: const InputDecoration(
                          labelText: "Mã lớp *",
                          hintText: "Ví dụ: se1821",
                          border: OutlineInputBorder(),
                        ),
                        onChanged: (value) {
                          final newText = value.toLowerCase();
                          if (value != newText) {
                            codeController.value = TextEditingValue(
                              text: newText,
                              selection: TextSelection.collapsed(
                                offset: newText.length,
                              ),
                            );
                          }
                        },
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: nameController,
                        decoration: const InputDecoration(
                          labelText: "Tên lớp *",
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 14),
                      if (isMobile) ...[
                        DropdownButtonFormField<String>(
                          value: subjectId.isEmpty ? null : subjectId,
                          decoration: const InputDecoration(
                            labelText: "Môn học *",
                            border: OutlineInputBorder(),
                          ),
                          items: _subjects
                              .map(
                                (subject) => DropdownMenuItem<String>(
                                  value: subject["id"].toString(),
                                  child: Text(
                                    '${subject["code"]} - ${subject["name"]}',
                                  ),
                                ),
                              )
                              .toList(),
                          onChanged: (value) {
                            subjectId = value ?? "";
                            setLocalState(() {});
                          },
                        ),
                        const SizedBox(height: 14),
                        DropdownButtonFormField<String>(
                          value: semesterId.isEmpty ? null : semesterId,
                          decoration: const InputDecoration(
                            labelText: "Học kỳ *",
                            border: OutlineInputBorder(),
                          ),
                          items: _semesters
                              .map(
                                (semester) => DropdownMenuItem<String>(
                                  value: semester["id"].toString(),
                                  child: Text(semester["name"]),
                                ),
                              )
                              .toList(),
                          onChanged: (value) {
                            semesterId = value ?? "";
                            setLocalState(() {});
                          },
                        ),
                      ] else
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: subjectId.isEmpty ? null : subjectId,
                                decoration: const InputDecoration(
                                  labelText: "Môn học *",
                                  border: OutlineInputBorder(),
                                ),
                                items: _subjects
                                    .map(
                                      (subject) => DropdownMenuItem<String>(
                                        value: subject["id"].toString(),
                                        child: Text(
                                          '${subject["code"]} - ${subject["name"]}',
                                        ),
                                      ),
                                    )
                                    .toList(),
                                onChanged: (value) {
                                  subjectId = value ?? "";
                                  setLocalState(() {});
                                },
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: semesterId.isEmpty ? null : semesterId,
                                decoration: const InputDecoration(
                                  labelText: "Học kỳ *",
                                  border: OutlineInputBorder(),
                                ),
                                items: _semesters
                                    .map(
                                      (semester) => DropdownMenuItem<String>(
                                        value: semester["id"].toString(),
                                        child: Text(semester["name"]),
                                      ),
                                    )
                                    .toList(),
                                onChanged: (value) {
                                  semesterId = value ?? "";
                                  setLocalState(() {});
                                },
                              ),
                            ),
                          ],
                        ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: descriptionController,
                        maxLines: 2,
                        decoration: const InputDecoration(
                          labelText: "Mô tả",
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 14),
                      if (isMobile) ...[
                        DropdownButtonFormField<String>(
                          value: lecturerId.isEmpty ? null : lecturerId,
                          decoration: const InputDecoration(
                            labelText: "Giảng viên phụ trách",
                            border: OutlineInputBorder(),
                          ),
                          items: [
                            const DropdownMenuItem<String>(
                              value: "",
                              child: Text("-- Chọn giảng viên --"),
                            ),
                            ..._lecturers.map(
                              (lecturer) => DropdownMenuItem<String>(
                                value: lecturer["id"].toString(),
                                child: Text(
                                  '${lecturer["name"]} - ${lecturer["email"]}',
                                ),
                              ),
                            ),
                          ],
                          onChanged: (value) {
                            lecturerId = value ?? "";
                            setLocalState(() {});
                          },
                        ),
                        const SizedBox(height: 14),
                        TextField(
                          controller: roomController,
                          decoration: const InputDecoration(
                            labelText: "Phòng học",
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
                        TextField(
                          controller: minStudentsController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: "Sĩ số tối thiểu",
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 14),
                        TextField(
                          controller: maxStudentsController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: "Sĩ số tối đa *",
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
                              child: Text("Đang mở (ACTIVE)"),
                            ),
                            DropdownMenuItem(
                              value: "UPCOMING",
                              child: Text("Sắp mở (UPCOMING)"),
                            ),
                            DropdownMenuItem(
                              value: "COMPLETED",
                              child: Text("Đã đóng (COMPLETED)"),
                            ),
                          ],
                          onChanged: (value) {
                            status = value ?? "ACTIVE";
                            setLocalState(() {});
                          },
                        ),
                      ] else
                        Column(
                          children: [
                            DropdownButtonFormField<String>(
                              value: lecturerId.isEmpty ? null : lecturerId,
                              decoration: const InputDecoration(
                                labelText: "Giảng viên phụ trách",
                                border: OutlineInputBorder(),
                              ),
                              items: [
                                const DropdownMenuItem<String>(
                                  value: "",
                                  child: Text("-- Chọn giảng viên --"),
                                ),
                                ..._lecturers.map(
                                  (lecturer) => DropdownMenuItem<String>(
                                    value: lecturer["id"].toString(),
                                    child: Text(
                                      '${lecturer["name"]} - ${lecturer["email"]}',
                                    ),
                                  ),
                                ),
                              ],
                              onChanged: (value) {
                                lecturerId = value ?? "";
                                setLocalState(() {});
                              },
                            ),
                            const SizedBox(height: 14),
                            Row(
                              children: [
                                Expanded(
                                  child: TextField(
                                    controller: roomController,
                                    decoration: const InputDecoration(
                                      labelText: "Phòng học",
                                      border: OutlineInputBorder(),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: TextField(
                                    controller: startDateController,
                                    decoration: const InputDecoration(
                                      labelText: "Ngày bắt đầu",
                                      hintText: "YYYY-MM-DD",
                                      border: OutlineInputBorder(),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: TextField(
                                    controller: endDateController,
                                    decoration: const InputDecoration(
                                      labelText: "Ngày kết thúc",
                                      hintText: "YYYY-MM-DD",
                                      border: OutlineInputBorder(),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            Row(
                              children: [
                                Expanded(
                                  child: TextField(
                                    controller: minStudentsController,
                                    keyboardType: TextInputType.number,
                                    decoration: const InputDecoration(
                                      labelText: "Sĩ số tối thiểu",
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
                                      labelText: "Sĩ số tối đa *",
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
                                        child: Text("Đang mở"),
                                      ),
                                      DropdownMenuItem(
                                        value: "UPCOMING",
                                        child: Text("Sắp mở"),
                                      ),
                                      DropdownMenuItem(
                                        value: "COMPLETED",
                                        child: Text("Đã đóng"),
                                      ),
                                    ],
                                    onChanged: (value) {
                                      status = value ?? "ACTIVE";
                                      setLocalState(() {});
                                    },
                                  ),
                                ),
                              ],
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
                    final code = codeController.text.trim().toLowerCase();
                    final name = nameController.text.trim();
                    final description = descriptionController.text.trim();
                    final room = roomController.text.trim();
                    final startDate = startDateController.text.trim();
                    final endDate = endDateController.text.trim();
                    final minStudents =
                        int.tryParse(minStudentsController.text.trim()) ?? 0;
                    final maxStudents =
                        int.tryParse(maxStudentsController.text.trim()) ?? 0;

                    if (code.isEmpty ||
                        name.isEmpty ||
                        subjectId.isEmpty ||
                        semesterId.isEmpty ||
                        maxStudents <= 0) {
                      _showSnack(
                        "Vui lòng nhập đầy đủ thông tin bắt buộc.",
                        success: false,
                      );
                      return;
                    }

                    if (minStudents > maxStudents) {
                      _showSnack(
                        "Sĩ số tối thiểu không được lớn hơn sĩ số tối đa",
                        success: false,
                      );
                      return;
                    }

                    if (startDate.isNotEmpty && endDate.isNotEmpty) {
                      final start = DateTime.tryParse(startDate);
                      final end = DateTime.tryParse(endDate);

                      if (start == null || end == null) {
                        _showSnack(
                          "Ngày không đúng định dạng YYYY-MM-DD.",
                          success: false,
                        );
                        return;
                      }

                      if (start.isAfter(end)) {
                        _showSnack(
                          "Ngày bắt đầu phải trước ngày kết thúc",
                          success: false,
                        );
                        return;
                      }
                    }

                    final selectedLecturer = _lecturers.where(
                      (l) => l["id"].toString() == lecturerId,
                    );
                    final payload = {
                      'courseCode': code,
                      'courseName': name,
                      'subjectId': int.parse(subjectId),
                      'semesterId': int.parse(semesterId),
                      'maxStudents': maxStudents,
                      'status': status,
                      'description': description,
                      'room': room,
                      'startDate': startDate,
                      'endDate': endDate,
                      'minStudents': minStudents == 0 ? 10 : minStudents,
                    };

                    _isLoading = true;
                    setState(() {});

                    if (isEdit) {
                      _adminService.updateCourse(course["id"], payload).then((success) async {
                        if (success) {
                          if (lecturerId.isNotEmpty) {
                            await _adminService.assignLecturer(course["id"], int.parse(lecturerId));
                          }
                          _showSnack("Cập nhật lớp học thành công!");
                          _loadData();
                        } else {
                          _showSnack("Cập nhật thất bại.", success: false);
                          setState(() => _isLoading = false);
                        }
                      });
                    } else {
                      _adminService.createCourse(payload).then((newCourse) async {
                        if (newCourse != null) {
                          if (lecturerId.isNotEmpty) {
                            final cid = newCourse["id"] ?? newCourse["Id"];
                            if (cid != null) {
                              await _adminService.assignLecturer(cid, int.parse(lecturerId));
                            }
                          }
                          _showSnack("Tạo lớp học thành công!");
                          _loadData();
                        } else {
                          _showSnack("Tạo lớp học thất bại.", success: false);
                          setState(() => _isLoading = false);
                        }
                      });
                    }

                    Navigator.pop(dialogContext);
                  },
                  child: Text(isEdit ? "Cập nhật" : "Tạo mới"),
                ),
              ],
            );
          },
        );
      },
    );

    codeController.dispose();
    nameController.dispose();
    descriptionController.dispose();
    roomController.dispose();
    startDateController.dispose();
    endDateController.dispose();
    minStudentsController.dispose();
    maxStudentsController.dispose();
  }

  Future<void> _showAssignLecturerDialog(Map<String, dynamic> course) async {
    String lecturerId = "";

    await showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setLocalState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              title: const Text("Phân công Giảng viên"),
              content: SizedBox(
                width: 480,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFBFDBFE)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Lớp học: ${course["code"]} - ${course["name"]}',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Môn học: ${getSubjectCode(course["subjectId"])} | Học kỳ: ${getSemesterName(course["semesterId"])}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF6B7280),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: lecturerId.isEmpty ? null : lecturerId,
                      decoration: const InputDecoration(
                        labelText: "Chọn Giảng viên *",
                        border: OutlineInputBorder(),
                      ),
                      items: _lecturers
                          .map(
                            (lecturer) => DropdownMenuItem<String>(
                              value: lecturer["id"].toString(),
                              child: Text(
                                '${lecturer["name"]} - ${lecturer["email"]}',
                              ),
                            ),
                          )
                          .toList(),
                      onChanged: (value) {
                        lecturerId = value ?? "";
                        setLocalState(() {});
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  child: const Text("Hủy"),
                ),
                ElevatedButton(
                  onPressed: () {
                    if (lecturerId.isEmpty) {
                      _showSnack("Vui lòng chọn giảng viên!", success: false);
                      return;
                    }

                    final lecturer = _lecturers.firstWhere(
                      (l) => l["id"].toString() == lecturerId,
                    );

                    setState(() {
                      course["lecturers"] = [
                        {
                          "id": lecturer["id"],
                          "name": lecturer["name"],
                          "email": lecturer["email"],
                        },
                      ];
                    });

                    _showSnack(
                      'Đã phân công GV ${lecturer["name"]} cho lớp ${course["code"]}!',
                    );

                    Navigator.pop(dialogContext);
                  },
                  child: const Text("Phân công"),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _handleRemoveLecturer(Map<String, dynamic> course) async {
    final lecturers = getCourseLecturers(course);
    if (lecturers.isEmpty) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: const Text("Xóa giảng viên"),
          content: Text('Xóa giảng viên khỏi lớp ${course["code"]}?'),
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
        course["lecturers"] = <Map<String, dynamic>>[];
      });
      _showSnack("Đã xóa giảng viên khỏi lớp.");
    }
  }



  Future<void> _showViewStudentsDialog(Map<String, dynamic> course) async {
    setState(() {
      _viewStudentsList = List<Map<String, dynamic>>.from(
        course["students"] ?? [],
      );
    });

    await showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setLocalState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              title: const Text("Danh sách Sinh viên trong lớp"),
              content: SizedBox(
                width: 720,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFBFDBFE)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Lớp: ${course["code"]} — ${course["name"]}',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '${_viewStudentsList.length} sinh viên đang enrolled',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF6B7280),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    if (_viewStudentsList.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 28),
                        child: Text(
                          "Chưa có sinh viên nào trong lớp.",
                          style: TextStyle(
                            fontSize: 14,
                            color: Color(0xFF9CA3AF),
                          ),
                        ),
                      )
                    else
                      Container(
                        constraints: const BoxConstraints(maxHeight: 360),
                        decoration: BoxDecoration(
                          border: Border.all(color: Color(0xFFF3F4F6)),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: ListView.separated(
                          shrinkWrap: true,
                          itemCount: _viewStudentsList.length,
                          separatorBuilder: (_, __) => const Divider(height: 1),
                          itemBuilder: (context, index) {
                            final student = _viewStudentsList[index];

                            return Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 10,
                              ),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 16,
                                    backgroundColor: const Color(0xFFDBEAFE),
                                    child: Text(
                                      (student["name"] as String)
                                          .substring(0, 1)
                                          .toUpperCase(),
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF1D4ED8),
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
                                          student["name"],
                                          style: const TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '${student["studentId"]} · ${student["email"]}',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: Color(0xFF9CA3AF),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  OutlinedButton(
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: Colors.red,
                                      side: const BorderSide(
                                        color: Color(0xFFFECACA),
                                      ),
                                    ),
                                    onPressed: () async {
                                      final confirmed = await showDialog<bool>(
                                        context: context,
                                        builder: (confirmContext) {
                                          return AlertDialog(
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(20),
                                            ),
                                            title: const Text("Đuổi sinh viên"),
                                            content: Text(
                                              'Đuổi ${student["name"]} khỏi lớp?',
                                            ),
                                            actions: [
                                              TextButton(
                                                onPressed: () => Navigator.pop(
                                                  confirmContext,
                                                  false,
                                                ),
                                                child: const Text("Hủy"),
                                              ),
                                              ElevatedButton(
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor: Colors.red,
                                                  foregroundColor: Colors.white,
                                                ),
                                                onPressed: () => Navigator.pop(
                                                  confirmContext,
                                                  true,
                                                ),
                                                child: const Text("Đuổi"),
                                              ),
                                            ],
                                          );
                                        },
                                      );

                                      if (confirmed == true) {
                                        setState(() {
                                          final courseStudents =
                                              List<Map<String, dynamic>>.from(
                                                course["students"] ?? [],
                                              );
                                          courseStudents.removeWhere(
                                            (s) =>
                                                s["enrollmentId"] ==
                                                student["enrollmentId"],
                                          );
                                          course["students"] = courseStudents;
                                          course["currentStudents"] =
                                              courseStudents.length;
                                          _viewStudentsList = courseStudents;
                                        });

                                        setLocalState(() {});
                                        _showSnack(
                                          'Đã đuổi ${student["name"]} khỏi lớp',
                                        );
                                      }
                                    },
                                    child: const Text("Đuổi"),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  child: const Text("Đóng"),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildTopNavbar(double width) {
    return AppTopHeader(
      title: 'Lớp học',
      primary: false,
      user: _currentUser ?? const AppUser(
        name: 'Admin',
        email: '',
        role: 'ADMIN',
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
        Icon(Icons.chevron_right_rounded, size: 18, color: Color(0xFF94A3B8)),
        SizedBox(width: 8),
        Text(
          "Quản lý lớp học",
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
          icon: Icons.menu_book_outlined,
          title: "Tổng số lớp",
          value: _courses.length.toString(),
        ),
        StatCard(
          icon: Icons.play_circle_outline,
          title: "Lớp đang mở",
          value: _courses
              .where((c) => c["status"] == "ACTIVE")
              .length
              .toString(),
        ),
        StatCard(
          icon: Icons.warning_amber_rounded,
          title: "Lớp sắp mở",
          value: _courses
              .where((c) => c["status"] == "UPCOMING")
              .length
              .toString(),
        ),
        StatCard(
          icon: Icons.check_circle_outline,
          title: "Lớp đã đóng",
          value: _courses
              .where((c) => c["status"] == "COMPLETED")
              .length
              .toString(),
        ),
      ],
    );
  }

  Widget _buildCourseStatusCard(double width) {
    final isNarrow = width < 760;

    return _SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Course Status Overview",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 20),
          ..._courses.map((course) {
            final color = _statusColor(course["status"] as String);
            final progress = _courseStatusProgress(course["status"] as String);

            if (isNarrow) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      course["code"],
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
                      course["name"],
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
                      course["code"],
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
                      course["name"],
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

  Widget _buildStudentLoadCard() {
    return _SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Student Load Analyzer",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 20),
          ..._courses.map((course) {
            final currentStudents = (course["currentStudents"] ?? 0) as int;
            final maxStudents = (course["maxStudents"] ?? 0) as int;

            return Padding(
              padding: const EdgeInsets.only(bottom: 18),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          course["name"],
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
                        "$currentStudents / $maxStudents",
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
                      value: _studentLoadProgress(currentStudents, maxStudents),
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
      value: _filterSemester.isEmpty ? null : _filterSemester,
      onChanged: (value) {
        setState(() {
          _filterSemester = value ?? "";
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
      items: [
        const DropdownMenuItem<String>(value: "", child: Text("Tất cả học kỳ")),
        ..._semesters.map(
          (sem) => DropdownMenuItem<String>(
            value: sem["id"].toString(),
            child: Text(sem["name"]),
          ),
        ),
      ],
    );

    final searchField = TextField(
      controller: _searchController,
      onChanged: (value) => setState(() => _search = value),
      decoration: InputDecoration(
        hintText: 'Tìm kiếm mã lớp, tên lớp...',
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
        SizedBox(width: 260, child: filterDropdown),
      ],
    );
  }

  Widget _buildCourseTable(double width) {
    final isNarrow = width < 1260;

    return _SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isNarrow)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Danh sách lớp học",
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
                      onPressed: _handleCreate,
                      icon: const Icon(Icons.add),
                      label: const Text("Thêm"),
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
                  "Danh sách lớp học",
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
                      onPressed: _handleCreate,
                      icon: const Icon(Icons.add),
                      label: const Text("Thêm"),
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
                    minWidth: isNarrow ? 1440 : width - 40,
                  ),
                  child: DataTable(
                    headingRowColor: WidgetStateProperty.all(
                      const Color(0xFFF9FAFB),
                    ),
                    dataRowMinHeight: 74,
                    dataRowMaxHeight: 96,
                    columns: const [
                      DataColumn(label: Text("Mã lớp / Tên lớp")),
                      DataColumn(label: Text("Môn học / Học kỳ")),
                      DataColumn(label: Text("Giảng viên")),
                      DataColumn(label: Text("Sĩ số")),
                      DataColumn(label: Text("Trạng thái")),
                      DataColumn(label: Text("Thao tác")),
                    ],
                    rows: _filteredCourses.asMap().entries.map<DataRow>((
                      entry,
                    ) {
                      final index = entry.key;
                      final course = entry.value;
                      final lecturerName = getCourseLecturerName(course);

                      return DataRow(
                        cells: [
                          DataCell(
                            Row(
                              children: [
                                SizedBox(
                                  width: 28,
                                  child: Text(
                                    '${index + 1}',
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF9CA3AF),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      course["code"],
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    SizedBox(
                                      width: 150,
                                      child: Text(
                                        course["name"],
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: Color(0xFF6B7280),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          DataCell(
                            Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEFF6FF),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: const Color(0xFFDBEAFE),
                                    ),
                                  ),
                                  child: Text(
                                    getSubjectCode(course["subjectId"]),
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF2563EB),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 5),
                                Text(
                                  getSemesterName(course["semesterId"]),
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: Color(0xFF6B7280),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          DataCell(
                            lecturerName != null
                                ? Text(
                                    lecturerName,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  )
                                : const Text(
                                    "Chưa phân công",
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFF9CA3AF),
                                      fontStyle: FontStyle.italic,
                                    ),
                                  ),
                          ),
                          DataCell(
                            RichText(
                              text: TextSpan(
                                style: const TextStyle(
                                  color: Color(0xFF111827),
                                  fontSize: 13,
                                ),
                                children: [
                                  TextSpan(
                                    text: '${course["currentStudents"]}',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  TextSpan(
                                    text: ' / ${course["maxStudents"]}',
                                    style: const TextStyle(
                                      color: Color(0xFF9CA3AF),
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          DataCell(CourseStatusBadge(status: course["status"])),
                          DataCell(
                            Wrap(
                              spacing: 6,
                              runSpacing: 6,
                              children: [
                                if (lecturerName != null)
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 6,
                                        ),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF0FDFA),
                                          borderRadius: BorderRadius.circular(
                                            10,
                                          ),
                                          border: Border.all(
                                            color: const Color(0xFFCCFBF1),
                                          ),
                                        ),
                                        child: Text(
                                          lecturerName,
                                          style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                            color: Color(0xFF0F766E),
                                          ),
                                        ),
                                      ),
                                      IconButton(
                                        tooltip: "Xóa GV khỏi lớp",
                                        onPressed: () =>
                                            _handleRemoveLecturer(course),
                                        icon: const Icon(
                                          Icons.close,
                                          size: 16,
                                          color: Colors.red,
                                        ),
                                      ),
                                    ],
                                  )
                                else
                                  OutlinedButton(
                                    onPressed: () =>
                                        _showAssignLecturerDialog(course),
                                    child: const Text("+ GV"),
                                  ),

                                OutlinedButton(
                                  onPressed: () =>
                                      _showViewStudentsDialog(course),
                                  child: const Text("Xem SV"),
                                ),
                                IconButton(
                                  tooltip: "Sửa",
                                  onPressed: () =>
                                      _showCourseDialog(course: course),
                                  icon: const Icon(Icons.edit_outlined),
                                ),
                                IconButton(
                                  tooltip: "Xóa",
                                  onPressed: () =>
                                      _handleDelete(course["id"] as int),
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
          if (_filteredCourses.isEmpty) ...[
            const SizedBox(height: 18),
            const Center(
              child: Text(
                "Không tìm thấy lớp học phù hợp.",
                style: TextStyle(fontSize: 14, color: Color(0xFF6B7280)),
              ),
            ),
          ],
        ],
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
                    _buildTopNavbar(width),
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
                                        "Lớp học",
                                        style: TextStyle(
                                          fontSize: 28,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF111827),
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      const Text(
                                        "Theo dõi lớp học, giảng viên, sĩ số và danh sách sinh viên trong hệ thống.",
                                        style: TextStyle(
                                          fontSize: 13,
                                          color: Color(0xFF6B7280),
                                        ),
                                      ),
                                      const SizedBox(height: 22),
                                      _buildOverviewStats(width),
                                      const SizedBox(height: 22),
                                      if (sideBySideCards)
                                        Row(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Expanded(
                                              child: _buildCourseStatusCard(width / 2),
                                            ),
                                            const SizedBox(width: 18),
                                            Expanded(child: _buildStudentLoadCard()),
                                          ],
                                        )
                                      else
                                        Column(
                                          children: [
                                            _buildCourseStatusCard(width),
                                            const SizedBox(height: 18),
                                            _buildStudentLoadCard(),
                                          ],
                                        ),
                                      const SizedBox(height: 22),
                                      _buildCourseTable(width),
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

class CourseStatusBadge extends StatelessWidget {
  final String status;

  const CourseStatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    String label;

    switch (status) {
      case "ACTIVE":
        bg = Colors.green;
        label = "ĐANG MỞ";
        break;
      case "UPCOMING":
        bg = Colors.blue;
        label = "SẮP MỞ";
        break;
      default:
        bg = Colors.grey;
        label = "ĐÃ ĐÓNG";
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(color: bg, fontSize: 12, fontWeight: FontWeight.w700),
      ),
    );
  }
}
