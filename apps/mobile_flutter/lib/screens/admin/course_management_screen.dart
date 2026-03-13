import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class CourseManagementScreen extends StatefulWidget {
  const CourseManagementScreen({super.key});

  @override
  State<CourseManagementScreen> createState() => _CourseManagementScreenState();
}

class _CourseManagementScreenState extends State<CourseManagementScreen> {
  // Mock Data Fetching
  final List<Map<String, dynamic>> semesters = [
    {"id": 1, "name": "Spring 2026"},
    {"id": 2, "name": "Summer 2026"},
    {"id": 3, "name": "Fall 2026"},
  ];

  final List<Map<String, dynamic>> subjects = [
    {"id": 1, "code": "PRN222", "name": "Cross-platform Programming"},
    {"id": 2, "code": "SWD392", "name": "Software Architecture"},
    {"id": 3, "code": "MAD101", "name": "Mobile App Development"},
  ];

  final List<Map<String, dynamic>> lecturers = [
    {"id": 1, "name": "Nguyễn Văn A", "email": "a@fpt.edu.vn"},
    {"id": 2, "name": "Trần Thị B", "email": "b@fpt.edu.vn"},
    {"id": 3, "name": "Lê Văn C", "email": "c@fpt.edu.vn"},
  ];

  final List<Map<String, dynamic>> allStudents = List.generate(
    40,
    (index) => {
      "id": 1000 + index,
      "name": "Sinh viên ${index + 1}",
      "email": "student${index + 1}@fpt.edu.vn",
      "studentId": "SE18${(index + 1).toString().padLeft(3, '0')}",
    },
  );

  late List<Map<String, dynamic>> courses;

  bool loadingCourses = false;
  bool loadingSems = false;
  bool loadingSubs = false;
  bool loadingLects = false;
  bool loadingStus = false;

  Map<String, dynamic>? viewStudentsCourse;
  List<Map<String, dynamic>> viewStudentsList = [];

  Map<String, dynamic>? importCourse;
  List<int> importSelectedIds = [];

  String filterSemester = "";
  Map<String, dynamic>? editingCourse;
  Map<String, dynamic>? selectedCourse;

  Map<String, dynamic> formData = {
    "code": "",
    "name": "",
    "description": "",
    "subjectId": "",
    "semesterId": "",
    "lecturerId": "",
    "room": "",
    "startDate": "",
    "endDate": "",
    "minStudents": 10,
    "maxStudents": 40,
    "status": "ACTIVE",
  };

  Map<String, dynamic> assignForm = {
    "lecturerId": "",
  };

  int _courseIdSeed = 10;
  int _enrollmentSeed = 10000;

  @override
  void initState() {
    super.initState();

    courses = [
      {
        "id": 1,
        "code": "prn222-se1821",
        "name": "PRN222 - SE1821",
        "description": "Lớp học môn PRN222",
        "subjectId": 1,
        "semesterId": 1,
        "lecturers": [lecturers[0]],
        "room": "BE-204",
        "startDate": "2026-01-10",
        "endDate": "2026-04-25",
        "minStudents": 10,
        "maxStudents": 40,
        "status": "ACTIVE",
        "students": [
          {
            "id": allStudents[0]["id"],
            "name": allStudents[0]["name"],
            "email": allStudents[0]["email"],
            "studentId": allStudents[0]["studentId"],
            "enrollmentId": _nextEnrollmentId(),
          },
          {
            "id": allStudents[1]["id"],
            "name": allStudents[1]["name"],
            "email": allStudents[1]["email"],
            "studentId": allStudents[1]["studentId"],
            "enrollmentId": _nextEnrollmentId(),
          },
        ],
      },
      {
        "id": 2,
        "code": "swd392-se1822",
        "name": "SWD392 - SE1822",
        "description": "Lớp học môn SWD392",
        "subjectId": 2,
        "semesterId": 2,
        "lecturers": [],
        "room": "AL-101",
        "startDate": "2026-05-10",
        "endDate": "2026-08-20",
        "minStudents": 10,
        "maxStudents": 35,
        "status": "UPCOMING",
        "students": [],
      },
      {
        "id": 3,
        "code": "mad101-se1823",
        "name": "MAD101 - SE1823",
        "description": "Lớp học môn MAD101",
        "subjectId": 3,
        "semesterId": 1,
        "lecturers": [lecturers[1]],
        "room": "LAB-02",
        "startDate": "2026-01-15",
        "endDate": "2026-04-28",
        "minStudents": 10,
        "maxStudents": 30,
        "status": "COMPLETED",
        "students": [
          {
            "id": allStudents[2]["id"],
            "name": allStudents[2]["name"],
            "email": allStudents[2]["email"],
            "studentId": allStudents[2]["studentId"],
            "enrollmentId": _nextEnrollmentId(),
          },
          {
            "id": allStudents[3]["id"],
            "name": allStudents[3]["name"],
            "email": allStudents[3]["email"],
            "studentId": allStudents[3]["studentId"],
            "enrollmentId": _nextEnrollmentId(),
          },
          {
            "id": allStudents[4]["id"],
            "name": allStudents[4]["name"],
            "email": allStudents[4]["email"],
            "studentId": allStudents[4]["studentId"],
            "enrollmentId": _nextEnrollmentId(),
          },
        ],
      },
    ];
  }

  bool get isLoading =>
      loadingCourses || loadingSems || loadingSubs || loadingLects || loadingStus;

  int _nextCourseId() => _courseIdSeed++;
  int _nextEnrollmentId() => _enrollmentSeed++;

  void success(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.green),
    );
  }

  void showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  String getSemesterName(dynamic semesterId) {
    final sem = semesters.firstWhereOrNull(
      (s) => "${s["id"]}" == "$semesterId",
    );
    return sem?["name"] ?? "N/A";
  }

  String getSubjectCode(dynamic subjectId) {
    final sub = subjects.firstWhereOrNull(
      (s) => "${s["id"]}" == "$subjectId",
    );
    return sub?["code"] ?? "N/A";
  }

  List<Map<String, dynamic>> getCourseLecturers(Map<String, dynamic> course) {
    return List<Map<String, dynamic>>.from(course["lecturers"] ?? []);
  }

  String? getCourseLecturerName(Map<String, dynamic> course) {
    final lecs = getCourseLecturers(course);
    return lecs.isNotEmpty ? lecs[0]["name"] : null;
  }

  int getCurrentStudents(Map<String, dynamic> course) {
    final students = List<Map<String, dynamic>>.from(course["students"] ?? []);
    return students.length;
  }

  Future<bool> _confirm(String message) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Xác nhận"),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text("Hủy"),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text("Đồng ý"),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  void handleExport() {
    try {
      const headers = [
        "Mã Lớp",
        "Môn Học",
        "Học Kỳ",
        "Sinh Viên",
        "Tối Đa",
        "Giảng Viên"
      ];

      final rows = courses.map((course) {
        final subjectCode = getSubjectCode(course["subjectId"]);
        final semesterName = getSemesterName(course["semesterId"]);
        final lecturerName = getCourseLecturerName(course) ?? "Chưa có GV";

        return [
          course["code"],
          subjectCode,
          semesterName,
          getCurrentStudents(course),
          course["maxStudents"] ?? 0,
          lecturerName
        ].map((v) => '"$v"').join(",");
      }).toList();

      final csvContent = [headers.join(","), ...rows].join("\n");

      Clipboard.setData(ClipboardData(text: csvContent));
      success("Đã copy CSV vào clipboard!");
    } catch (_) {
      showError("Lỗi khi xuất file CSV");
    }
  }

  void handleEdit(Map<String, dynamic> course) {
    editingCourse = course;
    formData = {
      "code": course["code"] ?? "",
      "name": course["name"] ?? "",
      "description": course["description"] ?? "",
      "subjectId": "${course["subjectId"] ?? ""}",
      "semesterId": "${course["semesterId"] ?? ""}",
      "lecturerId": course["lecturers"] != null &&
              (course["lecturers"] as List).isNotEmpty
          ? "${course["lecturers"][0]["id"]}"
          : "",
      "room": course["room"] ?? "",
      "startDate": course["startDate"] ?? "",
      "endDate": course["endDate"] ?? "",
      "minStudents": course["minStudents"] ?? 10,
      "maxStudents": course["maxStudents"] ?? 40,
      "status": course["status"] ?? "ACTIVE",
    };
    _openCreateEditDialog();
  }

  Future<void> handleDelete(dynamic id) async {
    final ok = await _confirm("Bạn có chắc chắn muốn xóa lớp học này?");
    if (!ok) return;

    setState(() {
      courses.removeWhere((c) => "${c["id"]}" == "$id");
    });

    success("Xóa lớp học thành công!");
  }

  Future<void> handleSubmit(Map<String, dynamic> submitData) async {
    final minStudents = int.tryParse("${submitData["minStudents"]}") ?? 0;
    final maxStudents = int.tryParse("${submitData["maxStudents"]}") ?? 0;

    if (minStudents > maxStudents) {
      showError("Sĩ số tối thiểu không được lớn hơn sĩ số tối đa");
      return;
    }

    final startDate = "${submitData["startDate"]}";
    final endDate = "${submitData["endDate"]}";

    if (startDate.isNotEmpty && endDate.isNotEmpty) {
      final start = DateTime.tryParse(startDate);
      final end = DateTime.tryParse(endDate);

      if (start != null && end != null && start.isAfter(end)) {
        showError("Ngày bắt đầu phải trước ngày kết thúc");
        return;
      }
    }

    final selectedLecturer = lecturers.firstWhereOrNull(
      (l) => "${l["id"]}" == "${submitData["lecturerId"]}",
    );

    if (editingCourse != null) {
      setState(() {
        editingCourse!["code"] = submitData["code"];
        editingCourse!["name"] = submitData["name"];
        editingCourse!["description"] = submitData["description"];
        editingCourse!["subjectId"] = int.tryParse("${submitData["subjectId"]}") ?? 0;
        editingCourse!["semesterId"] = int.tryParse("${submitData["semesterId"]}") ?? 0;
        editingCourse!["room"] = submitData["room"];
        editingCourse!["startDate"] = submitData["startDate"];
        editingCourse!["endDate"] = submitData["endDate"];
        editingCourse!["minStudents"] = minStudents;
        editingCourse!["maxStudents"] = maxStudents;
        editingCourse!["status"] = submitData["status"];
        editingCourse!["lecturers"] =
            selectedLecturer != null ? [selectedLecturer] : [];
      });
      success("Cập nhật lớp học thành công!");
    } else {
      setState(() {
        courses.add({
          "id": _nextCourseId(),
          "code": submitData["code"],
          "name": submitData["name"],
          "description": submitData["description"],
          "subjectId": int.tryParse("${submitData["subjectId"]}") ?? 0,
          "semesterId": int.tryParse("${submitData["semesterId"]}") ?? 0,
          "room": submitData["room"],
          "startDate": submitData["startDate"],
          "endDate": submitData["endDate"],
          "minStudents": minStudents,
          "maxStudents": maxStudents,
          "status": submitData["status"],
          "lecturers": selectedLecturer != null ? [selectedLecturer] : [],
          "students": [],
        });
      });
      success("Tạo lớp học thành công!");
    }

    editingCourse = null;
  }

  void handleAssignLecturer(Map<String, dynamic> course) {
    selectedCourse = course;
    assignForm = {
      "lecturerId": "",
    };
    _openAssignDialog();
  }

  Future<void> handleAssignSubmit(String lecturerId) async {
    if (selectedCourse == null) return;

    final lecturer = lecturers.firstWhereOrNull(
      (l) => "${l["id"]}" == lecturerId,
    );

    if (lecturer == null) {
      showError("Vui lòng chọn giảng viên");
      return;
    }

    setState(() {
      selectedCourse!["lecturers"] = [lecturer];
    });

    success("Đã phân công GV ${lecturer["name"]} cho lớp ${selectedCourse!["code"]}!");
  }

  Future<void> handleRemoveLecturer(Map<String, dynamic> course) async {
    final lecs = getCourseLecturers(course);
    if (lecs.isEmpty) return;

    final ok = await _confirm("Xóa giảng viên khỏi lớp ${course["code"]}?");
    if (!ok) return;

    setState(() {
      course["lecturers"] = [];
    });

    success("Đã xóa giảng viên khỏi lớp ${course["code"]}");
  }

  void handleOpenViewStudents(Map<String, dynamic> course) {
    viewStudentsCourse = course;
    viewStudentsList = List<Map<String, dynamic>>.from(course["students"] ?? []);
    _openViewStudentsDialog();
  }

  Future<void> handleKickStudent(int enrollmentId, String studentName) async {
    final ok = await _confirm("Đuổi $studentName khỏi lớp?");
    if (!ok) return;

    setState(() {
      viewStudentsList.removeWhere((s) => s["enrollmentId"] == enrollmentId);
      if (viewStudentsCourse != null) {
        final courseStudents =
            List<Map<String, dynamic>>.from(viewStudentsCourse!["students"] ?? []);
        courseStudents.removeWhere((s) => s["enrollmentId"] == enrollmentId);
        viewStudentsCourse!["students"] = courseStudents;
      }
    });

    success("Đã đuổi $studentName khỏi lớp");
  }

  void handleOpenImport(Map<String, dynamic> course) {
    importCourse = course;
    importSelectedIds = [];
    _openImportDialog();
  }

  void handleCreate() {
    editingCourse = null;
    formData = {
      "code": "",
      "name": "",
      "description": "",
      "subjectId": "",
      "semesterId": "",
      "lecturerId": "",
      "room": "",
      "startDate": "",
      "endDate": "",
      "minStudents": 10,
      "maxStudents": 40,
      "status": "ACTIVE",
    };
    _openCreateEditDialog();
  }

  List<Map<String, dynamic>> get importAvailableStudents {
    if (importCourse == null) return [];

    final courseStudents = List<Map<String, dynamic>>.from(importCourse!["students"] ?? []);
    return allStudents
        .where((s) => !courseStudents.any((v) => "${v["id"]}" == "${s["id"]}"))
        .toList();
  }

  void toggleImportStudent(int id) {
    setState(() {
      if (importSelectedIds.contains(id)) {
        importSelectedIds.remove(id);
      } else {
        importSelectedIds.add(id);
      }
    });
  }

  Future<void> handleImportSubmit() async {
    if (importCourse == null) return;

    if (importSelectedIds.isEmpty) {
      showError("Vui lòng chọn ít nhất 1 sinh viên!");
      return;
    }

    final currentStudents = getCurrentStudents(importCourse!);
    final maxStudents = importCourse!["maxStudents"] ?? 0;

    if (importSelectedIds.length + currentStudents > maxStudents) {
      showError("Lớp đã vượt quá sĩ số tối đa");
      return;
    }

    final selectedStudents = allStudents
        .where((s) => importSelectedIds.contains(s["id"]))
        .map((s) => {
              "id": s["id"],
              "name": s["name"],
              "email": s["email"],
              "studentId": s["studentId"],
              "enrollmentId": _nextEnrollmentId(),
            })
        .toList();

    setState(() {
      final current = List<Map<String, dynamic>>.from(importCourse!["students"] ?? []);
      importCourse!["students"] = [...current, ...selectedStudents];
    });

    success(
      "Đã thêm ${importSelectedIds.length} sinh viên vào lớp ${importCourse!["code"]}!",
    );

    importSelectedIds = [];
    if (mounted) Navigator.pop(context);
  }

  Future<void> _openCreateEditDialog() async {
    final localFormData = Map<String, dynamic>.from(formData);

    final codeController = TextEditingController(text: "${localFormData["code"]}");
    final nameController = TextEditingController(text: "${localFormData["name"]}");
    final descriptionController =
        TextEditingController(text: "${localFormData["description"]}");
    final roomController = TextEditingController(text: "${localFormData["room"]}");
    final startDateController =
        TextEditingController(text: "${localFormData["startDate"]}");
    final endDateController =
        TextEditingController(text: "${localFormData["endDate"]}");
    final minStudentsController =
        TextEditingController(text: "${localFormData["minStudents"]}");
    final maxStudentsController =
        TextEditingController(text: "${localFormData["maxStudents"]}");

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            Future<void> pickDate(TextEditingController controller, String key) async {
              final initialDate =
                  DateTime.tryParse(controller.text) ?? DateTime.now();

              final picked = await showDatePicker(
                context: context,
                initialDate: initialDate,
                firstDate: DateTime(2020),
                lastDate: DateTime(2035),
              );

              if (picked == null) return;

              final formatted =
                  "${picked.year.toString().padLeft(4, '0')}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";

              controller.text = formatted;
              localFormData[key] = formatted;
              setModalState(() {});
            }

            return Dialog(
              insetPadding: const EdgeInsets.all(20),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 820),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              editingCourse != null ? "Sửa lớp học" : "Tạo lớp học mới",
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          IconButton(
                            onPressed: () => Navigator.pop(context),
                            icon: const Icon(Icons.close),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      _buildInputField(
                        label: "Mã lớp *",
                        controller: codeController,
                        hint: "Ví dụ: se1821, exe1822, prn1823",
                        onChanged: (value) =>
                            localFormData["code"] = value.toLowerCase(),
                      ),
                      const SizedBox(height: 16),

                      _buildInputField(
                        label: "Tên lớp *",
                        controller: nameController,
                        onChanged: (value) => localFormData["name"] = value,
                      ),
                      const SizedBox(height: 16),

                      LayoutBuilder(
                        builder: (context, constraints) {
                          final mobile = constraints.maxWidth < 700;
                          if (mobile) {
                            return Column(
                              children: [
                                _buildDropdownField<String>(
                                  label: "Môn học *",
                                  value: "${localFormData["subjectId"]}".isEmpty
                                      ? null
                                      : "${localFormData["subjectId"]}",
                                  items: subjects
                                      .map(
                                        (subject) => DropdownMenuItem<String>(
                                          value: "${subject["id"]}",
                                          child: Text(
                                            "${subject["code"]} - ${subject["name"]}",
                                          ),
                                        ),
                                      )
                                      .toList(),
                                  onChanged: (value) {
                                    setModalState(() {
                                      localFormData["subjectId"] = value ?? "";
                                    });
                                  },
                                ),
                                const SizedBox(height: 16),
                                _buildDropdownField<String>(
                                  label: "Học kỳ *",
                                  value: "${localFormData["semesterId"]}".isEmpty
                                      ? null
                                      : "${localFormData["semesterId"]}",
                                  items: semesters
                                      .map(
                                        (semester) => DropdownMenuItem<String>(
                                          value: "${semester["id"]}",
                                          child: Text("${semester["name"]}"),
                                        ),
                                      )
                                      .toList(),
                                  onChanged: (value) {
                                    setModalState(() {
                                      localFormData["semesterId"] = value ?? "";
                                    });
                                  },
                                ),
                              ],
                            );
                          }

                          return Row(
                            children: [
                              Expanded(
                                child: _buildDropdownField<String>(
                                  label: "Môn học *",
                                  value: "${localFormData["subjectId"]}".isEmpty
                                      ? null
                                      : "${localFormData["subjectId"]}",
                                  items: subjects
                                      .map(
                                        (subject) => DropdownMenuItem<String>(
                                          value: "${subject["id"]}",
                                          child: Text(
                                            "${subject["code"]} - ${subject["name"]}",
                                          ),
                                        ),
                                      )
                                      .toList(),
                                  onChanged: (value) {
                                    setModalState(() {
                                      localFormData["subjectId"] = value ?? "";
                                    });
                                  },
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _buildDropdownField<String>(
                                  label: "Học kỳ *",
                                  value: "${localFormData["semesterId"]}".isEmpty
                                      ? null
                                      : "${localFormData["semesterId"]}",
                                  items: semesters
                                      .map(
                                        (semester) => DropdownMenuItem<String>(
                                          value: "${semester["id"]}",
                                          child: Text("${semester["name"]}"),
                                        ),
                                      )
                                      .toList(),
                                  onChanged: (value) {
                                    setModalState(() {
                                      localFormData["semesterId"] = value ?? "";
                                    });
                                  },
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: 16),

                      _buildInputField(
                        label: "Mô tả",
                        controller: descriptionController,
                        maxLines: 3,
                        onChanged: (value) => localFormData["description"] = value,
                      ),
                      const SizedBox(height: 16),

                      LayoutBuilder(
                        builder: (context, constraints) {
                          final mobile = constraints.maxWidth < 700;
                          if (mobile) {
                            return Column(
                              children: [
                                _buildDropdownField<String>(
                                  label: "Giảng viên phụ trách",
                                  value: "${localFormData["lecturerId"]}".isEmpty
                                      ? null
                                      : "${localFormData["lecturerId"]}",
                                  items: lecturers
                                      .map(
                                        (l) => DropdownMenuItem<String>(
                                          value: "${l["id"]}",
                                          child: Text("${l["name"]} - ${l["email"]}"),
                                        ),
                                      )
                                      .toList(),
                                  onChanged: (value) {
                                    setModalState(() {
                                      localFormData["lecturerId"] = value ?? "";
                                    });
                                  },
                                ),
                                const SizedBox(height: 16),
                                _buildInputField(
                                  label: "Phòng học",
                                  controller: roomController,
                                  onChanged: (value) => localFormData["room"] = value,
                                ),
                              ],
                            );
                          }

                          return Row(
                            children: [
                              Expanded(
                                child: _buildDropdownField<String>(
                                  label: "Giảng viên phụ trách",
                                  value: "${localFormData["lecturerId"]}".isEmpty
                                      ? null
                                      : "${localFormData["lecturerId"]}",
                                  items: lecturers
                                      .map(
                                        (l) => DropdownMenuItem<String>(
                                          value: "${l["id"]}",
                                          child: Text("${l["name"]} - ${l["email"]}"),
                                        ),
                                      )
                                      .toList(),
                                  onChanged: (value) {
                                    setModalState(() {
                                      localFormData["lecturerId"] = value ?? "";
                                    });
                                  },
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _buildInputField(
                                  label: "Phòng học",
                                  controller: roomController,
                                  onChanged: (value) => localFormData["room"] = value,
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: 16),

                      LayoutBuilder(
                        builder: (context, constraints) {
                          final mobile = constraints.maxWidth < 700;
                          if (mobile) {
                            return Column(
                              children: [
                                _buildDateField(
                                  label: "Ngày bắt đầu",
                                  controller: startDateController,
                                  onTap: () => pickDate(startDateController, "startDate"),
                                ),
                                const SizedBox(height: 16),
                                _buildDateField(
                                  label: "Ngày kết thúc",
                                  controller: endDateController,
                                  onTap: () => pickDate(endDateController, "endDate"),
                                ),
                              ],
                            );
                          }

                          return Row(
                            children: [
                              Expanded(
                                child: _buildDateField(
                                  label: "Ngày bắt đầu",
                                  controller: startDateController,
                                  onTap: () => pickDate(startDateController, "startDate"),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _buildDateField(
                                  label: "Ngày kết thúc",
                                  controller: endDateController,
                                  onTap: () => pickDate(endDateController, "endDate"),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: 16),

                      LayoutBuilder(
                        builder: (context, constraints) {
                          final mobile = constraints.maxWidth < 700;
                          if (mobile) {
                            return Column(
                              children: [
                                _buildInputField(
                                  label: "Sĩ số tối thiểu *",
                                  controller: minStudentsController,
                                  keyboardType: TextInputType.number,
                                  onChanged: (value) =>
                                      localFormData["minStudents"] = int.tryParse(value) ?? 0,
                                ),
                                const SizedBox(height: 16),
                                _buildInputField(
                                  label: "Sĩ số tối đa *",
                                  controller: maxStudentsController,
                                  keyboardType: TextInputType.number,
                                  onChanged: (value) =>
                                      localFormData["maxStudents"] = int.tryParse(value) ?? 0,
                                ),
                              ],
                            );
                          }

                          return Row(
                            children: [
                              Expanded(
                                child: _buildInputField(
                                  label: "Sĩ số tối thiểu *",
                                  controller: minStudentsController,
                                  keyboardType: TextInputType.number,
                                  onChanged: (value) =>
                                      localFormData["minStudents"] = int.tryParse(value) ?? 0,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _buildInputField(
                                  label: "Sĩ số tối đa *",
                                  controller: maxStudentsController,
                                  keyboardType: TextInputType.number,
                                  onChanged: (value) =>
                                      localFormData["maxStudents"] = int.tryParse(value) ?? 0,
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: 16),

                      _buildDropdownField<String>(
                        label: "Trạng thái",
                        value: "${localFormData["status"]}",
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
                          setModalState(() {
                            localFormData["status"] = value ?? "ACTIVE";
                          });
                        },
                      ),
                      const SizedBox(height: 24),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          OutlinedButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text("Hủy"),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton(
                            onPressed: () async {
                              localFormData["code"] =
                                  codeController.text.trim().toLowerCase();
                              localFormData["name"] = nameController.text.trim();
                              localFormData["description"] =
                                  descriptionController.text.trim();
                              localFormData["room"] = roomController.text.trim();
                              localFormData["startDate"] =
                                  startDateController.text.trim();
                              localFormData["endDate"] = endDateController.text.trim();
                              localFormData["minStudents"] =
                                  int.tryParse(minStudentsController.text.trim()) ?? 0;
                              localFormData["maxStudents"] =
                                  int.tryParse(maxStudentsController.text.trim()) ?? 0;

                              if ("${localFormData["code"]}".isEmpty ||
                                  "${localFormData["name"]}".isEmpty ||
                                  "${localFormData["subjectId"]}".isEmpty ||
                                  "${localFormData["semesterId"]}".isEmpty) {
                                showError("Vui lòng nhập đầy đủ thông tin bắt buộc");
                                return;
                              }

                              Navigator.pop(context);
                              await handleSubmit(localFormData);
                            },
                            child: Text(editingCourse != null ? "Cập nhật" : "Tạo mới"),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _openAssignDialog() async {
    String lecturerId = assignForm["lecturerId"] ?? "";

    await showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Dialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 560),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        "Phân công Giảng viên",
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 16),
                      if (selectedCourse != null)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.blue.shade100),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Lớp học: ${selectedCourse!["code"]} - ${selectedCourse!["name"]}",
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "Môn học: ${getSubjectCode(selectedCourse!["subjectId"])} | Học kỳ: ${getSemesterName(selectedCourse!["semesterId"])}",
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 16),
                      _buildDropdownField<String>(
                        label: "Chọn Giảng viên *",
                        value: lecturerId.isEmpty ? null : lecturerId,
                        items: lecturers
                            .map(
                              (lecturer) => DropdownMenuItem<String>(
                                value: "${lecturer["id"]}",
                                child: Text(
                                  "${lecturer["name"]} - ${lecturer["email"]}",
                                ),
                              ),
                            )
                            .toList(),
                        onChanged: (value) {
                          setModalState(() {
                            lecturerId = value ?? "";
                          });
                        },
                      ),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          OutlinedButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text("Hủy"),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton(
                            onPressed: () async {
                              await handleAssignSubmit(lecturerId);
                              if (mounted) Navigator.pop(context);
                            },
                            child: const Text("Phân công"),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _openImportDialog() async {
    importSelectedIds = [];

    await showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final availableStudents = importAvailableStudents;

            return Dialog(
              insetPadding: const EdgeInsets.all(20),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 860),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        "Import Sinh viên vào lớp",
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 16),

                      if (importCourse != null)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.purple.shade50,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.purple.shade100),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Lớp học: ${importCourse!["code"]} — ${importCourse!["name"]}",
                                style: const TextStyle(fontWeight: FontWeight.w700),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "${getSubjectCode(importCourse!["subjectId"])} · ${getSemesterName(importCourse!["semesterId"])}",
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 16),

                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.purple.shade200, width: 2),
                          color: Colors.purple.shade50.withOpacity(0.35),
                        ),
                        child: Column(
                          children: [
                            Icon(Icons.upload_file, size: 28, color: Colors.purple.shade400),
                            const SizedBox(height: 8),
                            Text(
                              "Kéo & thả file Excel hoặc nhấn để chọn",
                              style: TextStyle(
                                color: Colors.purple.shade700,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              ".xlsx, .xls (tính năng parse sẽ kết nối BE)",
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey.shade500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              "Chọn sinh viên chưa có trong lớp (${availableStudents.length} SV)",
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                          ),
                          if (importSelectedIds.isNotEmpty)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.purple,
                                borderRadius: BorderRadius.circular(50),
                              ),
                              child: Text(
                                "Đã chọn: ${importSelectedIds.length}",
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      if (availableStudents.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 30),
                          child: Text(
                            "Tất cả sinh viên đã có trong lớp này.",
                            style: TextStyle(color: Colors.grey.shade500),
                          ),
                        )
                      else
                        Container(
                          constraints: const BoxConstraints(maxHeight: 320),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: ListView.separated(
                            shrinkWrap: true,
                            itemCount: availableStudents.length,
                            separatorBuilder: (_, __) => Divider(
                              height: 1,
                              color: Colors.grey.shade200,
                            ),
                            itemBuilder: (context, index) {
                              final stu = availableStudents[index];
                              final checked = importSelectedIds.contains(stu["id"]);

                              return CheckboxListTile(
                                value: checked,
                                onChanged: (_) {
                                  setModalState(() {
                                    if (checked) {
                                      importSelectedIds.remove(stu["id"]);
                                    } else {
                                      importSelectedIds.add(stu["id"] as int);
                                    }
                                  });
                                },
                                controlAffinity: ListTileControlAffinity.leading,
                                title: Text(
                                  "${stu["name"]}",
                                  style: const TextStyle(fontWeight: FontWeight.w600),
                                ),
                                subtitle: Text(
                                  "${stu["studentId"]} · ${stu["email"]}",
                                ),
                              );
                            },
                          ),
                        ),

                      const SizedBox(height: 18),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          OutlinedButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text("Hủy"),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton(
                            onPressed: importSelectedIds.isEmpty
                                ? null
                                : () async {
                                    await handleImportSubmit();
                                  },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.purple,
                              foregroundColor: Colors.white,
                            ),
                            child: Text(
                              importSelectedIds.isNotEmpty
                                  ? "Thêm ${importSelectedIds.length} SV vào lớp"
                                  : "Thêm vào lớp",
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _openViewStudentsDialog() async {
    await showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Dialog(
              insetPadding: const EdgeInsets.all(20),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 860),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        "Danh sách Sinh viên trong lớp",
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 16),
                      if (viewStudentsCourse != null)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.blue.shade100),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Lớp: ${viewStudentsCourse!["code"]} — ${viewStudentsCourse!["name"]}",
                                style: const TextStyle(fontWeight: FontWeight.w700),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "${viewStudentsList.length} sinh viên đang enrolled",
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 16),

                      if (viewStudentsList.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 28),
                          child: Text(
                            "Chưa có sinh viên nào trong lớp.",
                            style: TextStyle(color: Colors.grey.shade500),
                          ),
                        )
                      else
                        Container(
                          constraints: const BoxConstraints(maxHeight: 360),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: ListView.separated(
                            shrinkWrap: true,
                            itemCount: viewStudentsList.length,
                            separatorBuilder: (_, __) => Divider(
                              height: 1,
                              color: Colors.grey.shade200,
                            ),
                            itemBuilder: (context, index) {
                              final stu = viewStudentsList[index];

                              return ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: Colors.blue.shade100,
                                  child: Text(
                                    "${stu["name"]}".isNotEmpty
                                        ? "${stu["name"]}"[0].toUpperCase()
                                        : "?",
                                    style: TextStyle(
                                      color: Colors.blue.shade700,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                title: Text(
                                  "${stu["name"]}",
                                  style: const TextStyle(fontWeight: FontWeight.w600),
                                ),
                                subtitle: Text(
                                  "${stu["studentId"]} · ${stu["email"]}",
                                ),
                                trailing: TextButton(
                                  onPressed: () async {
                                    await handleKickStudent(
                                      stu["enrollmentId"] as int,
                                      "${stu["name"]}",
                                    );
                                    setModalState(() {});
                                  },
                                  style: TextButton.styleFrom(
                                    foregroundColor: Colors.red,
                                  ),
                                  child: const Text("Đuổi"),
                                ),
                              );
                            },
                          ),
                        ),

                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          OutlinedButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text("Đóng"),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    String? hint,
    int maxLines = 1,
    TextInputType? keyboardType,
    ValueChanged<String>? onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: keyboardType,
          onChanged: onChanged,
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Colors.blue),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdownField<T>({
    required String label,
    required T? value,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<T>(
          value: value,
          isExpanded: true,
          items: items,
          onChanged: onChanged,
          decoration: InputDecoration(
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Colors.blue),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDateField({
    required String label,
    required TextEditingController controller,
    required VoidCallback onTap,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        InkWell(
          onTap: onTap,
          child: IgnorePointer(
            child: TextField(
              controller: controller,
              decoration: InputDecoration(
                suffixIcon: const Icon(Icons.calendar_today),
                filled: true,
                fillColor: const Color(0xFFF8FAFC),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: Colors.grey.shade300),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: Colors.grey.shade300),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required Color color,
    required IconData icon,
    required String title,
    required String value,
    double? width,
  }) {
    return Container(
      width: width,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(icon, color: Colors.white, size: 26),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1F2937),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color fg;
    Color bg;
    String label;

    if (status == "ACTIVE") {
      fg = Colors.green.shade700;
      bg = Colors.green.shade50;
      label = "ĐANG MỞ";
    } else if (status == "UPCOMING") {
      fg = Colors.blue.shade700;
      bg = Colors.blue.shade50;
      label = "SẮP MỞ";
    } else {
      fg = Colors.grey.shade700;
      bg = Colors.grey.shade200;
      label = "ĐÃ ĐÓNG";
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: fg,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredCourses = courses
        .where((c) =>
            filterSemester.isEmpty || "${c["semesterId"]}" == filterSemester)
        .toList();

    final totalCourses = courses.length;
    final activeCourses =
        courses.where((c) => c["status"] == "ACTIVE").length;
    final upcomingCourses =
        courses.where((c) => c["status"] == "UPCOMING").length;
    final completedCourses =
        courses.where((c) => c["status"] == "COMPLETED").length;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: LayoutBuilder(
            builder: (context, constraints) {
              final isMobile = constraints.maxWidth < 900;
              final statWidth =
                  isMobile ? double.infinity : (constraints.maxWidth - 60) / 4;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 16,
                    runSpacing: 16,
                    children: [
                      _buildStatCard(
                        color: Colors.blue,
                        icon: Icons.book_rounded,
                        title: "Tổng số lớp",
                        value: "$totalCourses",
                        width: statWidth,
                      ),
                      _buildStatCard(
                        color: Colors.blue.shade700,
                        icon: Icons.play_circle_fill_rounded,
                        title: "Lớp đang mở",
                        value: "$activeCourses",
                        width: statWidth,
                      ),
                      _buildStatCard(
                        color: Colors.indigo,
                        icon: Icons.warning_amber_rounded,
                        title: "Lớp sắp mở",
                        value: "$upcomingCourses",
                        width: statWidth,
                      ),
                      _buildStatCard(
                        color: Colors.lightBlue,
                        icon: Icons.check_circle_rounded,
                        title: "Lớp đã đóng",
                        value: "$completedCourses",
                        width: statWidth,
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFF1F5F9)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 12,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
                          child: LayoutBuilder(
                            builder: (context, box) {
                              final small = box.maxWidth < 900;

                              final semesterDropdown = SizedBox(
                                width: small ? double.infinity : 220,
                                child: DropdownButtonFormField<String>(
                                  value: filterSemester.isEmpty ? null : filterSemester,
                                  isExpanded: true,
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: const Color(0xFFF8FAFC),
                                    contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 14,
                                      vertical: 12,
                                    ),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(14),
                                      borderSide:
                                          BorderSide(color: Colors.grey.shade300),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(14),
                                      borderSide:
                                          BorderSide(color: Colors.grey.shade300),
                                    ),
                                  ),
                                  hint: const Text("Tất cả học kỳ"),
                                  items: [
                                    const DropdownMenuItem<String>(
                                      value: "",
                                      child: Text("Tất cả học kỳ"),
                                    ),
                                    ...semesters.map(
                                      (sem) => DropdownMenuItem<String>(
                                        value: "${sem["id"]}",
                                        child: Text("${sem["name"]}"),
                                      ),
                                    ),
                                  ],
                                  onChanged: (value) {
                                    setState(() {
                                      filterSemester = value ?? "";
                                    });
                                  },
                                ),
                              );

                              final exportButton = OutlinedButton.icon(
                                onPressed: handleExport,
                                icon: const Icon(Icons.download_rounded),
                                label: const Text("Xuất CSV"),
                              );

                              final addButton = ElevatedButton.icon(
                                onPressed: handleCreate,
                                icon: const Icon(Icons.add),
                                label: const Text("Thêm Lớp học"),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.blue,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 18,
                                    vertical: 14,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                              );

                              if (small) {
                                return Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      "Danh sách lớp học",
                                      style: TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF1F2937),
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    semesterDropdown,
                                    const SizedBox(height: 12),
                                    Wrap(
                                      spacing: 12,
                                      runSpacing: 12,
                                      children: [
                                        exportButton,
                                        addButton,
                                      ],
                                    ),
                                  ],
                                );
                              }

                              return Row(
                                children: [
                                  const Expanded(
                                    child: Text(
                                      "Danh sách lớp học",
                                      style: TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF1F2937),
                                      ),
                                    ),
                                  ),
                                  semesterDropdown,
                                  const SizedBox(width: 12),
                                  exportButton,
                                  const SizedBox(width: 12),
                                  addButton,
                                ],
                              );
                            },
                          ),
                        ),
                        Divider(height: 1, color: Colors.grey.shade200),

                        if (isLoading)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 80),
                            child: Center(
                              child: Text(
                                "Đang tải dữ liệu...",
                                style: TextStyle(color: Colors.grey),
                              ),
                            ),
                          )
                        else
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: DataTable(
                              headingRowColor: WidgetStatePropertyAll(
                                Colors.grey.shade50,
                              ),
                              columns: const [
                                DataColumn(label: Text("Mã lớp / Tên lớp")),
                                DataColumn(label: Text("Môn học / Học kỳ")),
                                DataColumn(label: Text("Giảng viên")),
                                DataColumn(label: Text("Sĩ số")),
                                DataColumn(label: Text("Trạng thái")),
                                DataColumn(label: Text("Thao tác")),
                              ],
                              rows: filteredCourses.asMap().entries.map((entry) {
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
                                              "${index + 1}",
                                              textAlign: TextAlign.center,
                                              style: TextStyle(
                                                color: Colors.grey.shade400,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Column(
                                            mainAxisAlignment:
                                                MainAxisAlignment.center,
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                "${course["code"]}",
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.w700,
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              SizedBox(
                                                width: 160,
                                                child: Text(
                                                  "${course["name"]}",
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.grey.shade600,
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
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 10,
                                              vertical: 5,
                                            ),
                                            decoration: BoxDecoration(
                                              color: Colors.blue.shade50,
                                              borderRadius:
                                                  BorderRadius.circular(10),
                                            ),
                                            child: Text(
                                              getSubjectCode(course["subjectId"]),
                                              style: TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600,
                                                color: Colors.blue.shade700,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(height: 6),
                                          Text(
                                            getSemesterName(course["semesterId"]),
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey.shade600,
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
                                                fontWeight: FontWeight.w600,
                                              ),
                                            )
                                          : Text(
                                              "Chưa phân công",
                                              style: TextStyle(
                                                fontSize: 12,
                                                fontStyle: FontStyle.italic,
                                                color: Colors.grey.shade500,
                                              ),
                                            ),
                                    ),
                                    DataCell(
                                      Text(
                                        "${getCurrentStudents(course)} / ${course["maxStudents"]}",
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                    DataCell(
                                      _buildStatusChip("${course["status"]}"),
                                    ),
                                    DataCell(
                                      SizedBox(
                                        width: 380,
                                        child: Wrap(
                                          spacing: 8,
                                          runSpacing: 8,
                                          children: [
                                            if (lecturerName != null)
                                              Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  Container(
                                                    padding:
                                                        const EdgeInsets.symmetric(
                                                      horizontal: 10,
                                                      vertical: 8,
                                                    ),
                                                    decoration: BoxDecoration(
                                                      color: Colors.teal.shade50,
                                                      borderRadius:
                                                          BorderRadius.circular(10),
                                                      border: Border.all(
                                                        color:
                                                            Colors.teal.shade100,
                                                      ),
                                                    ),
                                                    child: Text(
                                                      lecturerName,
                                                      style: TextStyle(
                                                        color:
                                                            Colors.teal.shade700,
                                                        fontSize: 12,
                                                        fontWeight:
                                                            FontWeight.w600,
                                                      ),
                                                    ),
                                                  ),
                                                  IconButton(
                                                    onPressed: () =>
                                                        handleRemoveLecturer(course),
                                                    icon: const Icon(
                                                      Icons.close,
                                                      color: Colors.red,
                                                      size: 18,
                                                    ),
                                                    tooltip: "Xóa GV khỏi lớp",
                                                  ),
                                                ],
                                              )
                                            else
                                              OutlinedButton(
                                                onPressed: () =>
                                                    handleAssignLecturer(course),
                                                child: const Text("+ GV"),
                                              ),
                                            OutlinedButton.icon(
                                              onPressed: () =>
                                                  handleOpenImport(course),
                                              icon: const Icon(Icons.upload, size: 16),
                                              label: const Text("Import SV"),
                                            ),
                                            OutlinedButton(
                                              onPressed: () =>
                                                  handleOpenViewStudents(course),
                                              child: const Text("Xem SV"),
                                            ),
                                            IconButton(
                                              onPressed: () => handleEdit(course),
                                              icon: const Icon(
                                                Icons.edit_outlined,
                                                color: Colors.blue,
                                              ),
                                              tooltip: "Sửa",
                                            ),
                                            IconButton(
                                              onPressed: () =>
                                                  handleDelete(course["id"]),
                                              icon: const Icon(
                                                Icons.delete_outline,
                                                color: Colors.red,
                                              ),
                                              tooltip: "Xóa",
                                            ),
                                          ],
                                        ),
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
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

extension FirstWhereOrNullExtension<E> on Iterable<E> {
  E? firstWhereOrNull(bool Function(E element) test) {
    for (final element in this) {
      if (test(element)) return element;
    }
    return null;
  }
}