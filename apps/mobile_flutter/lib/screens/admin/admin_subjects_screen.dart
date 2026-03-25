import 'package:flutter/material.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/admin_navigation.dart';
import '../../services/admin_service.dart';
import '../../services/auth_service.dart';

class AdminSubjectsScreen extends StatefulWidget {
  const AdminSubjectsScreen({super.key});

  @override
  State<AdminSubjectsScreen> createState() => _AdminSubjectsScreenState();
}

class _AdminSubjectsScreenState extends State<AdminSubjectsScreen> {
  final TextEditingController _searchController = TextEditingController();

  static const List<String> _departments = [
    "Software Engineering",
    "Artificial Intelligence",
    "Information Security",
    "Digital Marketing",
    "Business Administration"
  ];

  static const Map<String, String> _departmentPrefix = {
    "Software Engineering": "SWD",
    "Artificial Intelligence": "AI",
    "Information Security": "SEC",
    "Business Administration": "BUS",
    "Digital Marketing": "MKT"
  };

  final AdminService _adminService = AdminService();
  final AuthService _authService = AuthService();
  bool _isLoading = false;
  final List<Map<String, dynamic>> _subjects = [];
  AppUser? _currentUser;

  String _deptFilter = "ALL";
  String _search = "";

  List<Map<String, dynamic>> get _filteredSubjects {
    return _subjects.where((s) {
      final name = (s['subjectName'] ?? s['name'] ?? "").toString();
      final code = (s['subjectCode'] ?? s['code'] ?? "").toString();
      final dept = (s['department'] ?? "ALL").toString();
      
      final matchesSearch = name.toLowerCase().contains(_search.toLowerCase()) || 
                           code.toLowerCase().contains(_search.toLowerCase());
      final matchesDept = _deptFilter == "ALL" || dept == _deptFilter;
      return matchesSearch && matchesDept;
    }).toList()..sort((a, b) {
      final codeA = (a['subjectCode'] ?? a['code'] ?? "").toString();
      final codeB = (b['subjectCode'] ?? b['code'] ?? "").toString();
      return codeA.compareTo(codeB);
    });
  }

  Map<String, dynamic> get stats {
    final normalized = _subjects.map(_normalizeSubjectData).toList();
    final activeCount = normalized.where((s) => s['status'] == 'ACTIVE').length;
    
    final totalCredits = normalized.fold<num>(0, (sum, s) => sum + s['credits']);
    final avgCredits = normalized.isEmpty ? 0.0 : totalCredits / normalized.length;
    
    return {
      'total': normalized.length,
      'active': activeCount,
      'avgCredits': avgCredits.toStringAsFixed(1),
    };
  }

  int get _nextId {
    if (_subjects.isEmpty) return 1;
    return _subjects
            .map((e) => (e["id"] as num).toInt())
            .reduce((value, element) => value > element ? value : element) +
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
  Map<String, dynamic> _normalizeSubjectData(Map<String, dynamic> s) {
    return {
      'id': s['id'] ?? 0,
      'name': (s['subjectName'] ?? s['name'] ?? "").toString(),
      'code': (s['subjectCode'] ?? s['code'] ?? "").toString(),
      'department': (s['department'] ?? "N/A").toString(),
      'credits': (s['credits'] ?? 0) as num,
      'maxStudents': (s['maxStudents'] ?? 40) as num,
      'status': (s['status'] ?? "ACTIVE").toString().toUpperCase(),
      'description': (s['description'] ?? "").toString(),
      'courseNumber': (s['courseNumber'] ?? "").toString(),
    };
  }

  Future<void> _showSubjectDialog({Map<String, dynamic>? subject}) async {
    final bool isEdit = subject != null;
    final Map<String, dynamic> s = subject != null ? _normalizeSubjectData(subject) : {};

    final nameController = TextEditingController(text: (s['name'] ?? "").toString());
    final descriptionController = TextEditingController(text: (s['description'] ?? "").toString());
    final courseNumberController = TextEditingController(text: (s['courseNumber'] ?? "").toString());
    final creditsController = TextEditingController(text: (s['credits'] ?? 3).toString());
    final maxStudentsController = TextEditingController(text: (s['maxStudents'] ?? 40).toString());

    String department = (s['department'] ?? "").toString();
    String code = (s['code'] ?? "").toString();
    String status = (s['status'] ?? "ACTIVE").toString().toUpperCase();

    void regenerateCode(void Function(VoidCallback fn) setLocalState) {
      final prefix = _departmentPrefix[department] ?? "";
      final courseNumber = courseNumberController.text.trim();

      setLocalState(() {
        if (department.isNotEmpty && courseNumber.isNotEmpty) {
          code = "$prefix$courseNumber";
        } else {
          code = isEdit ? (subject?["code"] ?? "") : "";
        }
      });
    }

    await showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setLocalState) {
            final width = MediaQuery.of(context).size.width;
            final isNarrow = width < 600;

            InputDecoration inputDeco(String label, {String? hint, Widget? prefix}) {
              return InputDecoration(
                labelText: label,
                hintText: hint,
                prefixIcon: prefix,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
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
                  borderSide: const BorderSide(color: Color(0xFF0D9488), width: 2),
                ),
                filled: true,
                fillColor: Colors.white,
              );
            }

            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              contentPadding: EdgeInsets.zero,
              clipBehavior: Clip.antiAlias,
              content: SizedBox(
                width: 600,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(24),
                      color: const Color(0xFFF9FAFB),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0D9488).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: const Icon(Icons.library_books, color: Color(0xFF0D9488), size: 24),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  isEdit ? "Chỉnh sửa học phần" : "Thêm mới học phần",
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                                ),
                                const Text(
                                  "Vui lòng điền đầy đủ các thông tin bắt buộc (*)",
                                  style: TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    Flexible(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            DropdownButtonFormField<String>(
                              value: department.isEmpty ? null : department,
                              decoration: inputDeco("Bộ môn / Khoa (*)", prefix: const Icon(Icons.business_outlined, size: 20)),
                              items: _departments.map((d) => DropdownMenuItem(value: d, child: Text(d))).toList(),
                              onChanged: (v) {
                                department = v ?? "";
                                regenerateCode(setLocalState);
                              },
                            ),
                            const SizedBox(height: 18),
                            if (isNarrow) ...[
                              TextField(
                                controller: courseNumberController,
                                keyboardType: TextInputType.number,
                                onChanged: (_) => regenerateCode(setLocalState),
                                decoration: inputDeco("Số hiệu học phần (*)", hint: "Ví dụ: 301"),
                              ),
                              const SizedBox(height: 18),
                              TextField(
                                readOnly: true,
                                controller: TextEditingController(text: code),
                                decoration: inputDeco("Mã học phần (Tự động)", prefix: const Icon(Icons.qr_code_outlined, size: 20)),
                              ),
                            ] else
                              Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      controller: courseNumberController,
                                      keyboardType: TextInputType.number,
                                      onChanged: (_) => regenerateCode(setLocalState),
                                      decoration: inputDeco("Số hiệu học phần (*)", hint: "Ví dụ: 301"),
                                    ),
                                  ),
                                  const SizedBox(width: 18),
                                  Expanded(
                                    child: TextField(
                                      readOnly: true,
                                      controller: TextEditingController(text: code),
                                      decoration: inputDeco("Mã học phần (Tự động)", prefix: const Icon(Icons.qr_code_outlined, size: 20)),
                                    ),
                                  ),
                                ],
                              ),
                            const SizedBox(height: 18),
                            TextField(
                              controller: nameController,
                              decoration: inputDeco("Tên học phần (*)", hint: "Ví dụ: Software Architecture"),
                            ),
                            const SizedBox(height: 18),
                            if (isNarrow) ...[
                              TextField(
                                controller: creditsController,
                                keyboardType: TextInputType.number,
                                decoration: inputDeco("Số tín chỉ (*)", prefix: const Icon(Icons.badge_outlined, size: 20)),
                              ),
                              const SizedBox(height: 18),
                              TextField(
                                controller: maxStudentsController,
                                keyboardType: TextInputType.number,
                                decoration: inputDeco("SV tối đa (*)", prefix: const Icon(Icons.people_outline, size: 20)),
                              ),
                            ] else
                              Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      controller: creditsController,
                                      keyboardType: TextInputType.number,
                                      decoration: inputDeco("Số tín chỉ (*)", prefix: const Icon(Icons.badge_outlined, size: 20)),
                                    ),
                                  ),
                                  const SizedBox(width: 18),
                                  Expanded(
                                    child: TextField(
                                      controller: maxStudentsController,
                                      keyboardType: TextInputType.number,
                                      decoration: inputDeco("SV tối đa (*)", prefix: const Icon(Icons.people_outline, size: 20)),
                                    ),
                                  ),
                                ],
                              ),
                            const SizedBox(height: 18),
                            DropdownButtonFormField<String>(
                              value: status,
                              decoration: inputDeco("Trạng thái (*)"),
                              items: const [
                                DropdownMenuItem(value: "ACTIVE", child: Text("Đang hoạt động")),
                                DropdownMenuItem(value: "INACTIVE", child: Text("Ngừng hoạt động")),
                              ],
                              onChanged: (v) => setLocalState(() => status = v ?? "ACTIVE"),
                            ),
                            const SizedBox(height: 18),
                            TextField(
                              controller: descriptionController,
                              maxLines: 3,
                              decoration: inputDeco("Mô tả chi tiết"),
                            ),
                          ],
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                      decoration: const BoxDecoration(
                        color: Color(0xFFF9FAFB),
                        border: Border(top: BorderSide(color: Color(0xFFF3F4F6))),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton(
                            onPressed: () => Navigator.pop(dialogContext),
                            style: TextButton.styleFrom(
                              foregroundColor: const Color(0xFF6B7280),
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            ),
                            child: const Text("Hủy bỏ", style: TextStyle(fontWeight: FontWeight.w600)),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton(
                            onPressed: () {
                              final name = nameController.text.trim();
                              final description = descriptionController.text.trim();
                              final courseNumber = courseNumberController.text.trim();
                              final credits = int.tryParse(creditsController.text.trim()) ?? 0;
                              final maxStudents = int.tryParse(maxStudentsController.text.trim()) ?? 0;

                              if (department.isEmpty || code.isEmpty || name.isEmpty || credits <= 0 || maxStudents <= 0) {
                                _showSnack("Vui lòng điền đầy đủ các thông tin bắt buộc hợp lệ.", success: false);
                                return;
                              }

                              final payload = {
                                'subjectCode': code,
                                'subjectName': name,
                                'department': department,
                                'description': description,
                                'credits': credits,
                                'maxStudents': maxStudents,
                                'status': status,
                              };

                              _isLoading = true;
                              setState(() {});
                              Navigator.pop(dialogContext);

                              if (isEdit) {
                                _adminService.updateSubject(subject["id"], payload).then((success) {
                                  if (success) {
                                    _showSnack("Cập nhật học phần thành công.");
                                    _loadData();
                                  } else {
                                    _showSnack("Thao tác thất bại. Vui lòng thử lại.", success: false);
                                    setState(() => _isLoading = false);
                                  }
                                });
                              } else {
                                _adminService.createSubject(payload).then((newSubject) {
                                  if (newSubject != null) {
                                    _showSnack("Đã thêm học phần mới vào hệ thống.");
                                    _loadData();
                                  } else {
                                    _showSnack("Thao tác thất bại. Vui lòng thử lại.", success: false);
                                    setState(() => _isLoading = false);
                                  }
                                });
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0D9488),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: Text(isEdit ? "Cập nhật" : "Tạo mới", style: const TextStyle(fontWeight: FontWeight.w800)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
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
      setState(() => _isLoading = true);
      final success = await _adminService.deleteSubject(subject["id"]);
      if (success) {
        _showSnack("Đã xóa môn học.");
        _loadData();
      } else {
        setState(() => _isLoading = false);
        _showSnack("Không thể xóa môn học này.", success: false);
      }
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
    final crossAxisCount = width < 640 ? 1 : 3;
    final s = stats;

    return GridView.count(
      crossAxisCount: crossAxisCount,
      shrinkWrap: true,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisExtent: 100,
      children: [
        _buildStatCard(
          label: "Tổng môn học",
          value: s['total'].toString(),
          icon: Icons.library_books_outlined,
          color: const Color(0xFF6366F1), // indigo
        ),
        _buildStatCard(
          label: "Đang hoạt động",
          value: s['active'].toString(),
          icon: Icons.check_circle_outline,
          color: const Color(0xFF10B981), // success/green
        ),
        _buildStatCard(
          label: "Tín chỉ trung bình",
          value: s['avgCredits'],
          icon: Icons.book_outlined,
          color: const Color(0xFF0EA5E9), // info/blue
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required String label,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF3F4F6)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF6B7280),
                ),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF111827),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }


  Widget _buildSubjectTable(double width) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF3F4F6)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 16,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Danh mục học phần',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF1F2937),
                  ),
                ),
                if (width >= 800)
                  _buildTableFilters()
              ],
            ),
          ),
          if (width < 800)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: _buildTableFilters(),
            ),
          const Divider(height: 1, color: Color(0xFFF3F4F6)),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              headingRowColor: WidgetStateProperty.all(const Color(0xFFF9FAFB)),
              columnSpacing: 30,
              horizontalMargin: 20,
              columns: [
                DataColumn(label: _buildHeaderCell("Mã môn / Tên môn")),
                DataColumn(label: _buildHeaderCell("Tín chỉ", center: true)),
                DataColumn(label: _buildHeaderCell("SV tối đa", center: true)),
                DataColumn(label: _buildHeaderCell("Trạng thái", center: true)),
                DataColumn(label: _buildHeaderCell("Thao tác", end: true)),
              ],
              rows: _filteredSubjects.map((s) {
                final normalizedSubject = _normalizeSubjectData(s);
                final code = normalizedSubject['code'];
                final name = normalizedSubject['name'];
                final credits = normalizedSubject['credits'];
                final maxStudents = normalizedSubject['maxStudents'];
                final status = normalizedSubject['status'];

                return DataRow(
                  cells: [
                    DataCell(
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: const Color(0xFFF3F4F6),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Center(
                              child: Text(
                                code.substring(0, code.length >= 3 ? 3 : code.length),
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF0D9488),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                code,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF111827),
                                ),
                              ),
                              SizedBox(
                                width: 200,
                                child: Text(
                                  name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: Color(0xFF94A3B8),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    DataCell(
                      Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEEF2FF),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFE0E7FF)),
                          ),
                          child: Text(
                            "$credits tín chỉ",
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF4F46E5),
                            ),
                          ),
                        ),
                      ),
                    ),
                    DataCell(
                      Center(
                        child: Text(
                          "$maxStudents",
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                    DataCell(
                      Center(child: SubjectStatusBadge(status: status)),
                    ),
                    DataCell(
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          IconButton(
                            onPressed: () => _showSubjectDialog(subject: s),
                            icon: const Icon(Icons.edit_outlined, size: 18),
                            color: const Color(0xFF0D9488),
                          ),
                          IconButton(
                            onPressed: () => _confirmDeleteSubject(s),
                            icon: const Icon(Icons.delete_outline, size: 18),
                            color: const Color(0xFFEF4444),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              }).toList(),
            ),
          ),
          if (_filteredSubjects.isEmpty)
            const Padding(
              padding: EdgeInsets.all(40),
              child: Center(
                child: Text(
                  "Không tìm thấy môn học nào",
                  style: TextStyle(color: Color(0xFF94A3B8)),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTableFilters() {
    final width = MediaQuery.of(context).size.width;
    final isMobile = width < 600;

    if (isMobile) {
      return Column(
        children: [
          TextField(
            onChanged: (v) => setState(() => _search = v),
            decoration: InputDecoration(
              hintText: 'Tìm mã hoặc tên môn...',
              prefixIcon: const Icon(Icons.search, size: 18),
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _deptFilter,
                isExpanded: true,
                items: [
                  const DropdownMenuItem(value: "ALL", child: Text("Tất cả khoa")),
                  ..._departments.map((d) => DropdownMenuItem(value: d, child: Text(d))),
                ],
                onChanged: (v) => setState(() => _deptFilter = v ?? "ALL"),
              ),
            ),
          ),
        ],
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 250,
          child: TextField(
            onChanged: (v) => setState(() => _search = v),
            decoration: InputDecoration(
              hintText: 'Tìm mã hoặc tên môn...',
              prefixIcon: const Icon(Icons.search, size: 18),
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Container(
          width: 180,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE5E7EB)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _deptFilter,
              isExpanded: true,
              items: [
                const DropdownMenuItem(value: "ALL", child: Text("Tất cả khoa")),
                ..._departments.map((d) => DropdownMenuItem(value: d, child: Text(d))),
              ],
              onChanged: (v) => setState(() => _deptFilter = v ?? "ALL"),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeaderCell(String label, {bool center = false, bool end = false}) {
    return Container(
      width: center || end ? null : 200,
      alignment: center ? Alignment.center : (end ? Alignment.centerRight : Alignment.centerLeft),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          color: Color(0xFF94A3B8),
        ),
      ),
    );
  }

  Widget _buildTopNavbar() {
    return AppTopHeader(
      title: 'Môn học',
      primary: false,
      user: _currentUser ?? const AppUser(
        name: 'Admin',
        email: '',
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
                    _buildTopBar(),
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
                                _buildPageHeader(isMobile),
                                if (isMobile) _buildMobileActions(),
                                const SizedBox(height: 18),
                                _buildOverviewStats(width),
                                const SizedBox(height: 18),
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

  Widget _buildTopBar() {
    return AppTopHeader(
      title: 'Quản lý Môn học',
      primary: false,
      user: _currentUser ?? const AppUser(
        name: 'Admin',
        email: '',
        role: 'ADMIN',
      ),
    );
  }

  Widget _buildPageHeader(bool isMobile) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildBreadcrumb(),
              const SizedBox(height: 8),
              const Text(
                'Quản lý Môn học',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF111827),
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Danh mục chương trình đào tạo và cấu trúc các học phần.',
                style: TextStyle(
                  fontSize: 13,
                  color: Color(0xFF6B7280),
                ),
              ),
            ],
          ),
        ),
        if (!isMobile)
          ElevatedButton.icon(
            onPressed: () => _showSubjectDialog(),
            icon: const Icon(Icons.add, size: 16),
            label: const Text('Thêm Môn học'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0D9488), // teal-600
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
      ],
    );
  }

  Widget _buildMobileActions() {
    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () => _showSubjectDialog(),
              icon: const Icon(Icons.add, size: 16),
              label: const Text('Thêm Môn học'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D9488),
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
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
