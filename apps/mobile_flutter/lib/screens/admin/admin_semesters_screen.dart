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
  final AdminService _adminService = AdminService();
  final AuthService _authService = AuthService();
  AppUser? _currentUser;
  
  List<Map<String, dynamic>> _semesters = [];
  List<Map<String, dynamic>> _courses = [];
  bool _isLoading = false;
  
  String _search = "";
  String _filterStatus = "ALL";

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
        _adminService.getCourses(),
      ]);

      if (!mounted) return;
      setState(() {
        _semesters = List<Map<String, dynamic>>.from(results[0]);
        _courses = List<Map<String, dynamic>>.from(results[1]);
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
      ),
    );
  }

  String _formatDisplayDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty || dateStr.startsWith('0001')) return "N/A";
    try {
      final dt = DateTime.parse(dateStr);
      return "${dt.day}/${dt.month}/${dt.year}";
    } catch (_) {
      return dateStr;
    }
  }

  List<Map<String, dynamic>> get _filteredSemesters {
    return _semesters.where((s) {
      final name = (s["name"] ?? s["Name"] ?? "").toString();
      final code = (s["code"] ?? s["Code"] ?? "").toString();
      final status = (s["status"] ?? s["Status"] ?? "UPCOMING").toString().toUpperCase();
      
      final nameMatches = name.toLowerCase().contains(_search.toLowerCase());
      final codeMatches = code.toLowerCase().contains(_search.toLowerCase());
      final statusMatches = _filterStatus == "ALL" || status == _filterStatus;
      
      return (nameMatches || codeMatches) && statusMatches;
    }).toList();
  }

  int _getCourseCount(dynamic semesterId) {
    if (semesterId == null) return 0;
    return _courses.where((c) {
      final sId = (c["semesterId"] ?? c["semester_id"] ?? c["SemesterId"] ?? "").toString();
      return sId == semesterId.toString();
    }).length;
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width > 1024;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      drawer: isDesktop ? null : const AdminDrawer(),
      appBar: _buildHeader(width),
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
                            if (width > 1200)
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(flex: 3, child: _buildTimelineCard()),
                                  const SizedBox(width: 32),
                                  Expanded(flex: 2, child: _buildDistributionCard()),
                                ],
                              )
                            else
                              Column(
                                children: [
                                  _buildTimelineCard(),
                                  const SizedBox(height: 32),
                                  _buildDistributionCard(),
                                ],
                              ),
                            const SizedBox(height: 32),
                            _buildDetailedTable(width),
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

  AppTopHeader _buildHeader(double width) {
    return AppTopHeader(
      title: "Quản lý Học kỳ",
      primary: false,
      user: _currentUser ?? const AppUser(name: 'Admin', email: '', role: 'ADMIN'),
    );
  }

  Widget _buildPageHeader(double width) {
    final bool isSmall = width < 800;
    
    final headerText = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Quản lý Học kỳ", 
          style: TextStyle(fontSize: isSmall ? 20 : 24, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
        const Text("Quản lý chu kỳ đào tạo và giai đoạn tổ chức lớp học", 
          style: TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );

    final actions = Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        OutlinedButton.icon(
          onPressed: () => _handleGenerate(),
          icon: const Icon(Icons.flash_on, size: 16),
          label: const Text("Tự động tạo"),
          style: OutlinedButton.styleFrom(
            foregroundColor: const Color(0xFF0F766E),
            side: const BorderSide(color: Color(0xFFCCFBF1)),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
        ),
        FilledButton.icon(
          onPressed: () => _showSemesterModal(),
          icon: const Icon(Icons.add, size: 18),
          label: const Text("Thêm Học kỳ"),
          style: FilledButton.styleFrom(
            backgroundColor: const Color(0xFF0F766E),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          ),
        ),
      ],
    );

    if (isSmall) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          headerText,
          const SizedBox(height: 16),
          actions,
        ],
      );
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(child: headerText),
        const SizedBox(width: 16),
        actions,
      ],
    );
  }

  Widget _buildStatsGrid(double width) {
    int activeCount = 0;
    int upcomingCount = 0;
    int completedCount = 0;

    for (var s in _semesters) {
      final status = (s["status"] ?? s["Status"] ?? "").toString().toUpperCase();
      if (status == "ACTIVE") activeCount++;
      else if (status == "UPCOMING") upcomingCount++;
      else if (status == "COMPLETED") completedCount++;
    }

    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32), side: BorderSide(color: Colors.grey.shade100)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: GridView.count(
          crossAxisCount: width < 600 ? 2 : (width < 1200 ? 2 : 4),
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: width < 600 ? 1.5 : (width < 1200 ? 3.0 : 2.5),
          children: [
            _StatItem(label: "Tổng học kỳ", value: _semesters.length.toString(), icon: Icons.calendar_today, color: Colors.indigo),
            _StatItem(label: "Đang diễn ra", value: activeCount.toString(), icon: Icons.play_circle_fill, color: Colors.teal),
            _StatItem(label: "Sắp đến", value: upcomingCount.toString(), icon: Icons.info_outline, color: Colors.orange),
            _StatItem(label: "Đã đóng", value: completedCount.toString(), icon: Icons.check_circle_outline, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineCard() {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32), side: BorderSide(color: Colors.grey.shade100)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.timeline, color: Colors.indigo, size: 20),
                SizedBox(width: 12),
                Text("Dòng thời gian Học kỳ", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            const SizedBox(height: 24),
            if (_semesters.isEmpty)
              const Center(child: Text("Không có dữ liệu", style: TextStyle(color: Colors.grey, fontSize: 12)))
            else
              ..._semesters.take(3).map((s) {
                final startStr = s["startDate"] ?? s["start_date"] ?? s["StartDate"] ?? "";
                final endStr = s["endDate"] ?? s["end_date"] ?? s["EndDate"] ?? "";
                final start = DateTime.tryParse(startStr) ?? DateTime.now();
                final end = DateTime.tryParse(endStr) ?? DateTime.now();
                final totalDays = end.difference(start).inDays;
                final elapsedDays = DateTime.now().difference(start).inDays;
                final progress = (totalDays > 0) ? (elapsedDays / totalDays).clamp(0.0, 1.0) : 0.0;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(s["name"] ?? "N/A", style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                          Text("${(progress * 100).toInt()}%", style: const TextStyle(color: Colors.indigo, fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: LinearProgressIndicator(
                          value: progress,
                          backgroundColor: Colors.grey.shade50,
                          color: Colors.indigo.shade400,
                          minHeight: 8,
                        ),
                      ),
                    ],
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }

  Widget _buildDistributionCard() {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32), side: BorderSide(color: Colors.grey.shade100)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.donut_large, color: Colors.teal, size: 20),
                SizedBox(width: 12),
                Text("Phân bổ Lớp học", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            const SizedBox(height: 24),
            if (_semesters.isEmpty)
              const Center(child: Text("Không có dữ liệu", style: TextStyle(color: Colors.grey, fontSize: 12)))
            else
              ..._semesters.take(3).map((s) {
                final sId = s["id"] ?? s["Id"] ?? 0;
                final count = _getCourseCount(sId);
                final sName = s["name"] ?? s["Name"] ?? "N/A";
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    children: [
                      Container(width: 8, height: 8, decoration: BoxDecoration(color: Colors.teal.shade300, shape: BoxShape.circle)),
                      const SizedBox(width: 12),
                      Expanded(child: Text(sName, style: const TextStyle(fontSize: 13, color: Colors.grey))),
                      Text("$count lớp", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ],
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailedTable(double width) {
    final bool isSmall = width < 800;
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32), side: BorderSide(color: Colors.grey.shade100)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: width < 600
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Danh sách Chi tiết", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    _buildTableControls(),
                  ],
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Danh sách Chi tiết", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    _buildTableControls(),
                  ],
                ),
          ),
          if (isSmall)
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              itemCount: _filteredSemesters.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, idx) => _buildSemesterCard(_filteredSemesters[idx]),
            )
          else
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columnSpacing: 40,
                headingRowColor: WidgetStateProperty.all(const Color(0xFFF9FAFB)),
                columns: const [
                  DataColumn(label: Text("Học kỳ")),
                  DataColumn(label: Text("Thời gian")),
                  DataColumn(label: Text("Lớp môn học")),
                  DataColumn(label: Text("Trạng thái")),
                  DataColumn(label: Text("Thao tác")),
                ],
                rows: _filteredSemesters.map((s) {
                  final sId = s["id"] ?? s["Id"] ?? 0;
                  final count = _getCourseCount(sId);
                  final status = (s["status"] ?? s["Status"] ?? "").toString().toUpperCase();
                  final sName = s["name"] ?? s["Name"] ?? "N/A";
                  final sCode = (s["code"] ?? s["Code"] ?? "").toString().toUpperCase();
                  final startStr = s["startDate"] ?? s["start_date"] ?? s["StartDate"];
                  final endStr = s["endDate"] ?? s["end_date"] ?? s["EndDate"];

                  return DataRow(cells: [
                    DataCell(Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(sName, style: const TextStyle(fontWeight: FontWeight.bold)),
                        Text(sCode, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                      ],
                    )),
                    DataCell(Text("${_formatDisplayDate(startStr)} - ${_formatDisplayDate(endStr)}", style: const TextStyle(fontSize: 12))),
                    DataCell(Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(color: count > 0 ? Colors.indigo.shade50 : Colors.grey.shade50, borderRadius: BorderRadius.circular(12)),
                      child: Text("$count Lớp học", style: TextStyle(color: count > 0 ? Colors.indigo : Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                    )),
                    DataCell(Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: status == "ACTIVE" ? Colors.teal.shade50 : (status == "UPCOMING" ? Colors.blue.shade50 : Colors.grey.shade50),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(status == "ACTIVE" ? "Đang mở" : (status == "UPCOMING" ? "Sắp mở" : "Đã đóng"), 
                        style: TextStyle(color: status == "ACTIVE" ? Colors.teal : (status == "UPCOMING" ? Colors.blue : Colors.grey), 
                        fontSize: 10, fontWeight: FontWeight.bold)),
                    )),
                    DataCell(Row(
                      children: [
                        IconButton(icon: const Icon(Icons.edit, size: 18), onPressed: () => _showSemesterModal(semester: s)),
                        IconButton(icon: const Icon(Icons.delete, size: 18, color: Colors.red), onPressed: () => _handleDelete(sId)),
                      ],
                    )),
                  ]);
                }).toList(),
              ),
            ),
          const SizedBox(height: 24),
          if (_filteredSemesters.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 40),
              child: Center(child: Text("Không tìm thấy học kỳ khả dụng", style: TextStyle(color: Colors.grey))),
            ),
        ],
      ),
    );
  }

  Widget _buildSemesterCard(Map<String, dynamic> s) {
    final sId = s["id"] ?? s["Id"] ?? 0;
    final count = _getCourseCount(sId);
    final status = (s["status"] ?? s["Status"] ?? "").toString().toUpperCase();
    final Color statusColor = status == "ACTIVE" ? Colors.teal : (status == "UPCOMING" ? Colors.blue : Colors.grey);
    final sName = s["name"] ?? s["Name"] ?? "N/A";
    final sCode = (s["code"] ?? s["Code"] ?? "").toString().toUpperCase();
    final startStr = s["startDate"] ?? s["start_date"] ?? s["StartDate"] ?? "";
    final endStr = s["endDate"] ?? s["end_date"] ?? s["EndDate"] ?? "";
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(sName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  Text(sCode, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                child: Text(status == "ACTIVE" ? "Đang mở" : (status == "UPCOMING" ? "Sắp mở" : "Đã đóng"), 
                  style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _infoRow(Icons.calendar_today, Colors.indigo.shade300, "${_formatDisplayDate(startStr)} - ${_formatDisplayDate(endStr)}"),
          const SizedBox(height: 8),
          _infoRow(Icons.class_outlined, Colors.teal.shade300, "$count lớp đang hoạt động"),
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton.icon(
                onPressed: () => _showSemesterModal(semester: s),
                icon: const Icon(Icons.edit, size: 16),
                label: const Text("Sửa"),
                style: TextButton.styleFrom(foregroundColor: Colors.indigo),
              ),
              const SizedBox(width: 8),
              TextButton.icon(
                onPressed: () => _handleDelete(sId),
                icon: const Icon(Icons.delete_outline, size: 16),
                label: const Text("Xóa"),
                style: TextButton.styleFrom(foregroundColor: Colors.red),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, Color color, String text) {
    return Row(
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: const TextStyle(fontSize: 12, color: Colors.grey))),
      ],
    );
  }

  Widget _buildTableControls() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 180,
          child: TextField(
            onChanged: (v) => setState(() => _search = v),
            decoration: InputDecoration(
              hintText: "Tìm kiếm...",
              prefixIcon: const Icon(Icons.search, size: 18),
              isDense: true,
              contentPadding: const EdgeInsets.all(10),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade100)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade100)),
            ),
          ),
        ),
        const SizedBox(width: 8),
        DropdownButton<String>(
          value: _filterStatus,
          underline: const SizedBox(),
          items: const [
            DropdownMenuItem(value: "ALL", child: Text("Tất cả")),
            DropdownMenuItem(value: "ACTIVE", child: Text("Đang mở")),
            DropdownMenuItem(value: "UPCOMING", child: Text("Sắp tới")),
            DropdownMenuItem(value: "COMPLETED", child: Text("Đã đóng")),
          ],
          onChanged: (v) => setState(() => _filterStatus = v!),
        ),
      ],
    );
  }

  void _showSemesterModal({Map<String, dynamic>? semester}) {
    final bool isEdit = semester != null;
    final yearController = TextEditingController(text: semester?["name"]?.toString().split(" ").last ?? DateTime.now().year.toString());
    final startController = TextEditingController(text: semester?["startDate"]?.split("T")[0] ?? "");
    final endController = TextEditingController(text: semester?["endDate"]?.split("T")[0] ?? "");
    String type = semester?["name"]?.toString().split(" ").first ?? "Spring";

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(isEdit ? "Cập nhật Học kỳ" : "Thiết lập Học kỳ mới", 
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        contentPadding: const EdgeInsets.fromLTRB(24, 20, 24, 8),
        content: StatefulBuilder(
          builder: (context, setLocalState) => SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: type,
                  decoration: _inputDeco("Giai đoạn đào tạo"),
                  items: const [
                    DropdownMenuItem(value: "Spring", child: Text("SPRING (Xuân)")),
                    DropdownMenuItem(value: "Summer", child: Text("SUMMER (Hè)")),
                    DropdownMenuItem(value: "Fall", child: Text("FALL (Thu)")),
                  ],
                  onChanged: (v) => setLocalState(() => type = v!),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: yearController,
                  keyboardType: TextInputType.number,
                  decoration: _inputDeco("Năm học", hint: "VD: 2024"),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: startController,
                  readOnly: true,
                  decoration: _inputDeco("Ngày bắt đầu", hint: "Chọn ngày..."),
                  onTap: () async {
                    final dt = await showDatePicker(
                      context: context,
                      initialDate: DateTime.tryParse(startController.text) ?? DateTime.now(),
                      firstDate: DateTime(2000),
                      lastDate: DateTime(2100),
                      builder: (context, child) => Theme(
                        data: ThemeData.light().copyWith(colorScheme: const ColorScheme.light(primary: Color(0xFF0F766E))),
                        child: child!,
                      ),
                    );
                    if (dt != null) setLocalState(() => startController.text = dt.toString().split(" ")[0]);
                  },
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: endController,
                  readOnly: true,
                  decoration: _inputDeco("Ngày kết thúc", hint: "Chọn ngày..."),
                  onTap: () async {
                    final dt = await showDatePicker(
                      context: context,
                      initialDate: DateTime.tryParse(endController.text) ?? DateTime.now(),
                      firstDate: DateTime(2000),
                      lastDate: DateTime(2100),
                      builder: (context, child) => Theme(
                        data: ThemeData.light().copyWith(colorScheme: const ColorScheme.light(primary: Color(0xFF0F766E))),
                        child: child!,
                      ),
                    );
                    if (dt != null) setLocalState(() => endController.text = dt.toString().split(" ")[0]);
                  },
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Hủy bỏ", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
          ),
          FilledButton(
            onPressed: () => _handleSubmit(semester?["id"], type, yearController.text, startController.text, endController.text),
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF0F766E),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: Text(isEdit ? "Lưu thay đổi" : "Khởi tạo học kỳ"),
          ),
        ],
      ),
    );
  }

  InputDecoration _inputDeco(String label, {String? hint}) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      labelStyle: const TextStyle(fontSize: 13, color: Colors.grey),
      hintStyle: const TextStyle(fontSize: 13, color: Color(0xFFCBD5E1)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      filled: true,
      fillColor: const Color(0xFFF8FAFC),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFF0F766E), width: 1.5)),
    );
  }

  Future<void> _handleSubmit(int? id, String type, String year, String start, String end) async {
    if (start.isEmpty || end.isEmpty || year.isEmpty) {
      _showSnack("Vui lòng nhập đầy đủ thông tin", success: false);
      return;
    }
    final payload = { "name": "$type $year", "startDate": start, "endDate": end };
    bool success = false;
    if (id != null) {
      success = await _adminService.updateSemester(id, payload);
    } else {
      final res = await _adminService.createSemester(payload);
      success = res != null;
    }
    if (success) {
      _showSnack(id != null ? "Cập nhật thành công" : "Khởi tạo thành công");
      _loadData();
      Navigator.pop(context);
    } else {
      _showSnack("Thao tác thất bại", success: false);
    }
  }

  Future<void> _handleDelete(dynamic id) async {
    final hasCourses = _courses.any((c) => c["semesterId"].toString() == id.toString());
    if (hasCourses) {
      _showSnack("Học kỳ đang có lớp học, không thể xóa", success: false);
      return;
    }
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Xác nhận xóa"),
        content: const Text("Bạn có chắc chắn muốn xóa học kỳ này?"),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Hủy")),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text("Xóa", style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirm == true) {
      final ok = await _adminService.deleteSemester(id is int ? id : int.parse(id.toString()));
      if (ok) {
        _showSnack("Đã xóa học kỳ");
        _loadData();
      } else {
        _showSnack("Xóa thất bại", success: false);
      }
    }
  }

  Future<void> _handleGenerate() async {
    final year = DateTime.now().year;
    final ok = await _adminService.generateSemesters(year);
    if (ok) {
      _showSnack("Đã tự động khởi tạo 3 học kỳ cho năm $year");
      _loadData();
    } else {
      _showSnack("Không thể tự động tạo học kỳ", success: false);
    }
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatItem({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
              Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 24), overflow: TextOverflow.ellipsis),
            ],
          ),
        ),
      ],
    );
  }
}