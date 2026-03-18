import 'package:flutter/material.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/admin_navigation.dart';
import '../../services/admin_service.dart';
import '../../services/auth_service.dart';

class CourseManagementScreen extends StatefulWidget {
  const CourseManagementScreen({super.key});

  @override
  State<CourseManagementScreen> createState() => _CourseManagementScreenState();
}

class _CourseManagementScreenState extends State<CourseManagementScreen> {
  final AdminService _adminService = AdminService();
  final AuthService _authService = AuthService();
  AppUser? _currentUser;

  bool _isLoading = false;
  List<Map<String, dynamic>> _courses = [];
  List<Map<String, dynamic>> _semesters = [];
  List<Map<String, dynamic>> _subjects = [];
  List<Map<String, dynamic>> _lecturers = [];
  List<Map<String, dynamic>> _allStudents = [];

  String _search = "";
  String _filterSemesterId = "ALL";

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
        _adminService.getCourses(),
        _adminService.getSemesters(),
        _adminService.getSubjects(),
        _adminService.getUsers(role: 'LECTURER'),
        _adminService.getUsers(role: 'STUDENT'),
      ]);

      if (!mounted) return;
      setState(() {
        _courses = List<Map<String, dynamic>>.from(results[0]);
        _semesters = List<Map<String, dynamic>>.from(results[1]);
        _subjects = List<Map<String, dynamic>>.from(results[2]);
        _lecturers = List<Map<String, dynamic>>.from(results[3]);
        _allStudents = List<Map<String, dynamic>>.from(results[4]);
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _showSnack("Lỗi tải dữ liệu", success: false);
      }
    }
  }

  void _showSnack(String message, {bool success = true}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: success ? const Color(0xFF0F766E) : Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  List<Map<String, dynamic>> get _filteredCourses {
    return _courses.map(_normalizeCourseData).where((c) {
      final code = c["code"].toLowerCase();
      final name = c["name"].toLowerCase();
      final matchesSearch = _search.isEmpty || code.contains(_search.toLowerCase()) || name.contains(_search.toLowerCase());
      final matchesSem = _filterSemesterId == "ALL" || c["semesterId"].toString() == _filterSemesterId;
      return matchesSearch && matchesSem;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width > 1024;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      drawer: isDesktop ? null : const AdminDrawer(),
      appBar: AppTopHeader(
        title: "Quản lý Lớp học",
        primary: false,
        user: _currentUser ?? const AppUser(name: 'Admin', email: '', role: 'ADMIN'),
      ),
      body: Row(
        children: [
          if (isDesktop) const AdminSidebar(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F766E)))
                : RefreshIndicator(
                    onRefresh: _loadData,
                    child: SingleChildScrollView(
                      padding: EdgeInsets.symmetric(
                        horizontal: width < 600 ? 16 : 40,
                        vertical: 32,
                      ),
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 1400),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildPageHeader(width),
                              const SizedBox(height: 32),
                              _buildStatsGrid(width),
                              const SizedBox(height: 32),
                              _buildMainCard(width),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Map<String, dynamic> _normalizeCourseData(Map<String, dynamic> c) {
    return {
      'id': c['id'] ?? c['Id'] ?? 0,
      'name': (c['name'] ?? c['courseName'] ?? c['CourseName'] ?? 'N/A').toString(),
      'code': (c['code'] ?? c['courseCode'] ?? c['CourseCode'] ?? 'N/A').toString(),
      'status': (c['status'] ?? c['Status'] ?? 'ACTIVE').toString().toUpperCase(),
      'maxStudents': (c['maxStudents'] ?? c['max_students'] ?? c['MaxStudents'] ?? 40) as num,
      'semesterId': (c['semesterId'] ?? c['semester_id'] ?? c['SemesterId'] ?? 0),
      'subjectId': (c['subjectId'] ?? c['subject_id'] ?? c['SubjectId'] ?? 0),
      'enrollments': c['enrollments'] ?? c['Enrollments'] ?? c['students'] ?? c['Students'] ?? [],
      'lecturers': c['lecturers'] ?? c['Lecturers'] ?? c['teachingBy'] ?? c['teaching_by'] ?? [],
    };
  }

  Widget _buildPageHeader(double width) {
    final bool isSmall = width < 800;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: isSmall ? CrossAxisAlignment.start : CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Quản lý Lớp học", 
                style: TextStyle(fontSize: isSmall ? 20 : 24, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
              const Text("Quản lý danh sách lớp học phần, phân công giảng viên và import sinh viên.", 
                style: TextStyle(fontSize: 12, color: Colors.grey),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        if (!isSmall)
          FilledButton.icon(
            onPressed: () => _showCourseModal(),
            icon: const Icon(Icons.plus_one, size: 18),
            label: const Text("Tạo lớp học"),
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF0F766E),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
          ),
      ],
    );
  }

  Widget _buildStatsGrid(double width) {
    final normalized = _courses.map(_normalizeCourseData).toList();
    int active = normalized.where((c) => c["status"] == "ACTIVE").length;
    int upcoming = normalized.where((c) => c["status"] == "UPCOMING").length;
    int totalEnrollments = 0;
    for (var c in normalized) {
      totalEnrollments += (c["enrollments"] as List).length;
    }

    return GridView.count(
      crossAxisCount: width < 600 ? 2 : (width < 1200 ? 2 : 4),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: width < 600 ? 1.5 : 2.5,
      children: [
        _StatCard(label: "Tổng số lớp", value: _courses.length.toString(), icon: Icons.book, color: Colors.indigo),
        _StatCard(label: "Lớp đang mở", value: active.toString(), icon: Icons.play_circle_fill, color: Colors.teal),
        _StatCard(label: "Lớp sắp mở", value: upcoming.toString(), icon: Icons.info_outline, color: Colors.orange),
        _StatCard(label: "Tổng sinh viên", value: totalEnrollments.toString(), icon: Icons.people, color: Colors.blue),
      ],
    );
  }

  Widget _buildMainCard(double width) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: BorderSide(color: Colors.grey.shade100)),
      child: Column(
        children: [
          _buildToolbar(width),
          const Divider(height: 1),
          _filteredCourses.isEmpty
              ? const Padding(
                  padding: EdgeInsets.symmetric(vertical: 60),
                  child: Center(child: Text("Không tìm thấy lớp học phù hợp", style: TextStyle(color: Colors.grey))),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(24),
                  itemCount: _filteredCourses.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (ctx, idx) => _buildCourseItem(_filteredCourses[idx], width),
                ),
        ],
      ),
    );
  }

  Widget _buildToolbar(double width) {
    bool isSmall = width < 800;
    return Padding(
      padding: const EdgeInsets.all(20),
      child: isSmall 
        ? Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSemesterFilter(),
              const SizedBox(height: 16),
              _buildSearchBar(),
            ],
          )
        : Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildSemesterFilter(),
              SizedBox(width: 300, child: _buildSearchBar()),
            ],
          ),
    );
  }

  Widget _buildSemesterFilter() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _filterChip("ALL", "Tất cả học kỳ"),
          ..._semesters.take(3).map((s) => _filterChip(s["id"].toString(), s["name"] ?? "N/A")),
        ],
      ),
    );
  }

  Widget _filterChip(String id, String label) {
    bool isSelected = _filterSemesterId == id;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : Colors.grey)),
        selected: isSelected,
        onSelected: (v) => setState(() => _filterSemesterId = id),
        selectedColor: const Color(0xFF0F766E),
        backgroundColor: const Color(0xFFF8FAFC),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: isSelected ? Colors.transparent : Colors.grey.shade100)),
        showCheckmark: false,
      ),
    );
  }

  Widget _buildSearchBar() {
    return TextField(
      onChanged: (v) => setState(() => _search = v),
      decoration: InputDecoration(
        hintText: "Tìm mã lớp, tên lớp...",
        prefixIcon: const Icon(Icons.search, size: 18),
        isDense: true,
        contentPadding: const EdgeInsets.all(12),
        fillColor: const Color(0xFFF8FAFC),
        filled: true,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      ),
    );
  }

  Widget _buildCourseItem(Map<String, dynamic> course, double width) {
    final c = _normalizeCourseData(course);
    final status = c["status"];
    final enrollments = c["enrollments"] as List;
    final lecturers = c["lecturers"] as List;
    final lecturer = lecturers.isNotEmpty ? lecturers[0] : null;
    final subject = _subjects.firstWhere((s) {
      final sId = s["id"] ?? s["Id"] ?? 0;
      return sId.toString() == c["subjectId"].toString();
    }, orElse: () => {});
    final semester = _semesters.firstWhere((s) {
      final semId = s["id"] ?? s["Id"] ?? 0;
      return semId.toString() == c["semesterId"].toString();
    }, orElse: () => {});

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC).withOpacity(0.5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.indigo.shade50, borderRadius: BorderRadius.circular(14)),
                child: const Icon(Icons.book, color: Colors.indigo, size: 20),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(c["code"] ?? "N/A", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    Text(c["name"] ?? "N/A", style: const TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
              ),
              _buildStatusBadge(status),
            ],
          ),
          const Divider(height: 32),
          Row(
            children: [
              Expanded(child: _infoIcon(Icons.school, Colors.blue, subject["code"] ?? "N/A")),
              const SizedBox(width: 8),
              Expanded(child: _infoIcon(Icons.calendar_month, Colors.orange, semester["name"] ?? "N/A")),
              const SizedBox(width: 8),
              Expanded(child: _infoIcon(Icons.people, Colors.teal, "${enrollments.length}/${c["maxStudents"] ?? 40}")),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              const Icon(Icons.person, size: 16, color: Colors.grey),
              const SizedBox(width: 8),
              Expanded(
                child: lecturer != null 
                  ? Text("Giảng viên: ${lecturer["name"]}", style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600))
                  : const Text("Chưa phân công giảng viên", style: TextStyle(fontSize: 13, color: Colors.grey, fontStyle: FontStyle.italic)),
              ),
              if (lecturer == null)
                TextButton(onPressed: () => _showAssignModal(c), child: const Text("Phân công")),
            ],
          ),
          const Divider(height: 32),
          Row(
            children: [
              _actionIcon(Icons.people_outline, Colors.indigo, () => _showViewStudentsModal(c), "SV"),
              const SizedBox(width: 8),
              _actionIcon(Icons.upload_file, const Color(0xFF10B981), () => _showImportModal(c), "Import"),
              const Spacer(),
              _actionIcon(Icons.edit_outlined, Colors.teal, () => _showCourseModal(course: course), null),
              const SizedBox(width: 8),
              _actionIcon(Icons.delete_outline, Colors.red, () => _handleDelete(c["id"]), null),
            ],
          ),
        ],
      ),
    );
  }

  Widget _infoIcon(IconData icon, Color color, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 4),
        Expanded(child: Text(text, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF334155)), overflow: TextOverflow.ellipsis, maxLines: 1)),
      ],
    );
  }

  Widget _actionIcon(IconData icon, Color color, VoidCallback onTap, String? label) {
    if (label != null) {
      return Flexible(
        child: TextButton(
          onPressed: onTap,
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            backgroundColor: color.withOpacity(0.05),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 4),
              Flexible(child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis, maxLines: 1)),
            ],
          ),
        ),
      );
    }
    return IconButton(
      onPressed: onTap,
      icon: Icon(icon, size: 18, color: color),
      style: IconButton.styleFrom(
        backgroundColor: color.withOpacity(0.05),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color = status == "ACTIVE" ? Colors.teal : (status == "UPCOMING" ? Colors.blue : Colors.grey);
    String text = status == "ACTIVE" ? "ĐANG MỞ" : (status == "UPCOMING" ? "SẮP MỞ" : "ĐÃ ĐÓNG");
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: color.withOpacity(0.2))),
      child: Text(text, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }

  // ── Modals ────────────────────────────────────────────────

  void _showCourseModal({Map<String, dynamic>? course}) {
    final bool isEdit = course != null;
    final Map<String, dynamic> c = course != null ? _normalizeCourseData(course) : {};
    
    final codeCtrl = TextEditingController(text: (c["code"] ?? "").toString());
    final nameCtrl = TextEditingController(text: (c["name"] ?? "").toString());
    final maxCtrl = TextEditingController(text: (c["maxStudents"] ?? 40).toString());
    String subjectId = (c["subjectId"] ?? "").toString();
    String semesterId = (c["semesterId"] ?? "").toString();
    String status = (c["status"] ?? "ACTIVE").toString().toUpperCase();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(isEdit ? "Cập nhật lớp học" : "Tạo lớp học mới", style: const TextStyle(fontWeight: FontWeight.bold)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: StatefulBuilder(
          builder: (context, setLocal) => SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _textField("Mã lớp", codeCtrl, hint: "VD: SE1234"),
                const SizedBox(height: 16),
                _textField("Tên lớp", nameCtrl, hint: "VD: Lớp SE1234 - Kỳ Fall 2024"),
                const SizedBox(height: 16),
                _dropdownField("Môn học", subjectId, _subjects.map((s) => DropdownMenuItem(value: s["id"].toString(), child: Text(s["code"] ?? "N/A"))).toList(), (v) => setLocal(() => subjectId = v!)),
                const SizedBox(height: 16),
                _dropdownField("Học kỳ", semesterId, _semesters.map((s) => DropdownMenuItem(value: s["id"].toString(), child: Text(s["name"] ?? "N/A"))).toList(), (v) => setLocal(() => semesterId = v!)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _textField("Sĩ số tối đa", maxCtrl, isNumber: true)),
                    const SizedBox(width: 16),
                    Expanded(child: _dropdownField("Trạng thái", status, const [
                      DropdownMenuItem(value: "ACTIVE", child: Text("Đang mở")),
                      DropdownMenuItem(value: "UPCOMING", child: Text("Sắp mở")),
                      DropdownMenuItem(value: "COMPLETED", child: Text("Đã đóng")),
                    ], (v) => setLocal(() => status = v!))),
                  ],
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Hủy")),
          FilledButton(
            onPressed: () => _handleSubmit(course?["id"], codeCtrl.text, nameCtrl.text, subjectId, semesterId, maxCtrl.text, status),
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF0F766E), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            child: Text(isEdit ? "Lưu thay đổi" : "Xác nhận tạo"),
          ),
        ],
      ),
    );
  }

  void _showAssignModal(Map<String, dynamic> course) {
    String lecturerId = "";
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Phân công Giảng viên", style: TextStyle(fontWeight: FontWeight.bold)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: StatefulBuilder(
          builder: (context, setLocal) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.teal.shade50, borderRadius: BorderRadius.circular(12)),
                child: Row(children: [const Icon(Icons.book, size: 16, color: Colors.teal), const SizedBox(width: 8), Text(course["code"] ?? "N/A", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13))]),
              ),
              const SizedBox(height: 20),
              _dropdownField("Chọn giảng viên", lecturerId, _lecturers.map((l) => DropdownMenuItem(value: l["id"].toString(), child: Text(l["name"] ?? "N/A"))).toList(), (v) => setLocal(() => lecturerId = v!)),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Hủy")),
          FilledButton(
            onPressed: () async {
              if (lecturerId.isEmpty) return;
              final ok = await _adminService.assignLecturer(int.parse(course["id"].toString()), int.parse(lecturerId));
              if (ok) {
                _showSnack("Phân công thành công");
                _loadData();
                Navigator.pop(ctx);
              } else {
                _showSnack("Phân công thất bại", success: false);
              }
            },
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF0F766E), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            child: const Text("Xác nhận"),
          ),
        ],
      ),
    );
  }

  void _showImportModal(Map<String, dynamic> course) {
    List<int> selectedIds = [];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Import Sinh viên", style: TextStyle(fontWeight: FontWeight.bold)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: StatefulBuilder(
          builder: (context, setLocal) => SizedBox(
            width: 400,
            height: 500,
            child: Column(
              children: [
                const Text("Chọn sinh viên từ hệ thống để thêm vào lớp", style: TextStyle(fontSize: 12, color: Colors.grey)),
                const SizedBox(height: 16),
                Expanded(
                  child: ListView.separated(
                    itemCount: _allStudents.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (c, i) {
                      final s = _allStudents[i];
                      final bool isSelected = selectedIds.contains(s["id"]);
                      return CheckboxListTile(
                        value: isSelected,
                        title: Text(s["name"] ?? "N/A", style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        subtitle: Text(s["email"] ?? "N/A", style: const TextStyle(fontSize: 11)),
                        onChanged: (v) => setLocal(() => v! ? selectedIds.add(s["id"]) : selectedIds.remove(s["id"])),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Đóng")),
          FilledButton(
            onPressed: () {
              // Placeholder for actual import logic
              _showSnack("Đã thêm ${selectedIds.length} sinh viên vào lớp (Mock)");
              Navigator.pop(ctx);
            },
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF0F766E), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            child: const Text("Xác nhận"),
          ),
        ],
      ),
    );
  }

  void _showViewStudentsModal(Map<String, dynamic> course) {
    final c = _normalizeCourseData(course);
    final enrollments = List<Map<String, dynamic>>.from(c["enrollments"] ?? []);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text("Sinh viên lớp ${course["code"]}", style: const TextStyle(fontWeight: FontWeight.bold)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: SizedBox(
          width: 400,
          child: enrollments.isEmpty
            ? const Center(child: Text("Chưa có sinh viên", style: TextStyle(color: Colors.grey)))
            : ListView.separated(
                shrinkWrap: true,
                itemCount: enrollments.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (c, i) {
                  final e = enrollments[i];
                  final user = e["user"] ?? {};
                  return ListTile(
                    leading: CircleAvatar(backgroundColor: Colors.teal.shade50, child: Text(user["name"]?[0] ?? "U", style: const TextStyle(color: Colors.teal))),
                    title: Text(user["name"] ?? "N/A", style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    trailing: IconButton(icon: const Icon(Icons.remove_circle_outline, color: Colors.red, size: 20), onPressed: () async {
                      final ok = await _adminService.removeEnrollment(course["id"], user["id"]);
                      if (ok) {
                        _showSnack("Đã gỡ sinh viên");
                        _loadData();
                        Navigator.pop(ctx);
                      }
                    }),
                  );
                },
              ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Đóng")),
        ],
      ),
    );
  }

  // ── Logic ──────────────────────────────────────────────────

  Future<void> _handleSubmit(dynamic id, String code, String name, String subId, String semId, String max, String status) async {
    if (code.isEmpty || name.isEmpty || subId.isEmpty || semId.isEmpty) {
      _showSnack("Vui lòng điền đủ thông tin", success: false);
      return;
    }
    final data = {
      "code": code,
      "name": name,
      "subjectId": int.parse(subId),
      "semesterId": int.parse(semId),
      "maxStudents": int.tryParse(max) ?? 40,
      "status": status,
    };

    bool ok = false;
    if (id != null) {
      ok = await _adminService.updateCourse(int.parse(id.toString()), data);
    } else {
      final res = await _adminService.createCourse(data);
      ok = res != null;
    }

    if (ok) {
      _showSnack(id != null ? "Cập nhật thành công" : "Tạo mới thành công");
      _loadData();
      Navigator.pop(context);
    } else {
      _showSnack("Thao tác thất bại", success: false);
    }
  }

  Future<void> _handleDelete(dynamic id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Xác nhận xóa"),
        content: const Text("Bạn có chắc muốn xóa lớp học này?"),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Hủy")),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text("Xóa", style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirm == true) {
      final ok = await _adminService.deleteCourse(int.parse(id.toString()));
      if (ok) {
        _showSnack("Đã xóa lớp học");
        _loadData();
      } else {
        _showSnack("Xóa thất bại", success: false);
      }
    }
  }

  // ── Shared Widgets ────────────────────────────────────────

  Widget _textField(String label, TextEditingController ctrl, {String? hint, bool isNumber = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
        const SizedBox(height: 8),
        TextField(
          controller: ctrl,
          keyboardType: isNumber ? TextInputType.number : TextInputType.text,
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
          ),
        ),
      ],
    );
  }

  Widget _dropdownField(String label, String value, List<DropdownMenuItem<String>> items, Function(String?) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: value.isEmpty ? null : value,
          items: items,
          onChanged: onChanged,
          decoration: InputDecoration(
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: Colors.grey.shade100)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
                  Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
