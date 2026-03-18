import 'package:flutter/material.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/admin_navigation.dart';
import '../../services/admin_service.dart';
import '../../services/auth_service.dart';

class LecturerWorkloadScreen extends StatefulWidget {
  const LecturerWorkloadScreen({super.key});

  @override
  State<LecturerWorkloadScreen> createState() => _LecturerWorkloadScreenState();
}

class _LecturerWorkloadScreenState extends State<LecturerWorkloadScreen> {
  final AdminService _adminService = AdminService();
  final AuthService _authService = AuthService();
  AppUser? _currentUser;

  bool _isLoading = false;
  List<Map<String, dynamic>> _courses = [];
  List<Map<String, dynamic>> _lecturers = [];

  String _search = "";
  String _filterType = "all"; // all | high | low

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
        _adminService.getUsers(role: 'LECTURER'),
      ]);

      if (!mounted) return;
      setState(() {
        _courses = List<Map<String, dynamic>>.from(results[0]);
        _lecturers = List<Map<String, dynamic>>.from(results[1]);
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

  List<Map<String, dynamic>> get _workloadData {
    return _lecturers.map((lecturer) {
      final lecturerCourses = _courses.where((c) {
        final lecturers = c["lecturers"] as List? ?? [];
        return lecturers.any((l) => l["id"].toString() == lecturer["id"].toString());
      }).toList();

      int studentCount = 0;
      for (var c in lecturerCourses) {
        studentCount += (c["enrollments"] as List? ?? []).length;
      }

      return {
        "id": lecturer["id"],
        "name": lecturer["name"],
        "email": lecturer["email"],
        "courseCount": lecturerCourses.length,
        "studentCount": studentCount,
        "courses": lecturerCourses.map((c) => c["code"].toString()).toList(),
      };
    }).toList();
  }

  List<Map<String, dynamic>> get _filteredData {
    return _workloadData.where((item) {
      final name = (item["name"] ?? "").toString().toLowerCase();
      final email = (item["email"] ?? "").toString().toLowerCase();
      final matchesSearch = _search.isEmpty || name.contains(_search.toLowerCase()) || email.contains(_search.toLowerCase());

      if (_filterType == "high") return matchesSearch && (item["courseCount"] as int) >= 4;
      if (_filterType == "low") return matchesSearch && (item["courseCount"] as int) < 2;
      return matchesSearch;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width > 1024;

    double avgWorkload = _workloadData.isEmpty ? 0 : _courses.length / _workloadData.length;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      drawer: isDesktop ? null : const AdminDrawer(),
      appBar: AppTopHeader(
        title: "Khối lượng Giảng dạy",
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
                              _buildBreadcrumb(),
                              const SizedBox(height: 12),
                              _buildPageHeader(width),
                              const SizedBox(height: 32),
                              _buildStatsGrid(width, avgWorkload),
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

  Widget _buildBreadcrumb() {
    return Row(
      children: [
        const Text("Admin", style: TextStyle(color: Color(0xFF0F766E), fontSize: 13, fontWeight: FontWeight.bold)),
        const SizedBox(width: 8),
        const Icon(Icons.chevron_right, size: 16, color: Colors.grey),
        const SizedBox(width: 8),
        Text("Workload", style: TextStyle(color: Colors.grey.shade600, fontSize: 13, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildPageHeader(double width) {
    final bool isSmall = width < 800;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Khối lượng Giảng dạy", 
          style: TextStyle(fontSize: isSmall ? 22 : 28, fontWeight: FontWeight.w900, color: const Color(0xFF1E293B), letterSpacing: -0.5)),
        const Text("Theo dõi và cân bằng khối lượng công việc, số lượng sinh viên của đội ngũ giảng viên.", 
          style: TextStyle(fontSize: 13, color: Colors.blueGrey, fontWeight: FontWeight.w500)),
      ],
    );
  }

  Widget _buildStatsGrid(double width, double avg) {
    return GridView.count(
      crossAxisCount: width < 600 ? 1 : (width < 1200 ? 3 : 3),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: width < 600 ? 3.5 : 2.5,
      children: [
        _StatCard(label: "TRUNG BÌNH", value: "${avg.toStringAsFixed(1)} Lớp/GV", icon: Icons.trending_up, color: Colors.indigo, variant: 'info'),
        _StatCard(label: "TỔNG GIẢNG VIÊN", value: _lecturers.length.toString(), icon: Icons.people_alt, color: Colors.teal, variant: 'success'),
        _StatCard(label: "LỚP ĐANG VẬN HÀNH", value: _courses.length.toString(), icon: Icons.book, color: Colors.orange, variant: 'warning'),
      ],
    );
  }

  Widget _buildMainCard(double width) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32), side: BorderSide(color: Colors.grey.shade100)),
      child: Column(
        children: [
          _buildToolbar(width),
          const Divider(height: 1),
          _filteredData.isEmpty
              ? const Padding(
                  padding: EdgeInsets.symmetric(vertical: 80),
                  child: Center(child: Text("Không tìm thấy giảng viên phù hợp", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold))),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(24),
                  itemCount: _filteredData.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 20),
                  itemBuilder: (ctx, idx) => _buildLecturerRow(_filteredData[idx], width),
                ),
        ],
      ),
    );
  }

  Widget _buildToolbar(double width) {
    bool isSmall = width < 800;
    return Padding(
      padding: const EdgeInsets.all(24),
      child: isSmall 
        ? Column(
            children: [
              _buildSearchBar(),
              const SizedBox(height: 16),
              _buildFilterDropdown(),
            ],
          )
        : Row(
            children: [
              Expanded(flex: 2, child: _buildSearchBar()),
              const SizedBox(width: 24),
              Expanded(flex: 1, child: _buildFilterDropdown()),
            ],
          ),
    );
  }

  Widget _buildSearchBar() {
    return TextField(
      onChanged: (v) => setState(() => _search = v),
      decoration: InputDecoration(
        hintText: "Tìm giảng viên...",
        prefixIcon: const Icon(Icons.search, size: 20, color: Color(0xFF0F766E)),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
      ),
    );
  }

  Widget _buildFilterDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(16)),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _filterType,
          isExpanded: true,
          style: const TextStyle(fontSize: 13, color: Color(0xFF1E293B), fontWeight: FontWeight.bold),
          items: const [
            DropdownMenuItem(value: "all", child: Text("Tất cả giảng viên")),
            DropdownMenuItem(value: "high", child: Text("Khối lượng cao (≥ 4 lớp)")),
            DropdownMenuItem(value: "low", child: Text("Khối lượng thấp (< 2 lớp)")),
          ],
          onChanged: (v) => setState(() => _filterType = v!),
        ),
      ),
    );
  }

  Widget _buildLecturerRow(Map<String, dynamic> item, double width) {
    int count = item["courseCount"] as int;
    bool isHigh = count >= 4;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Column(
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: const Color(0xFFCCFBF1),
                child: Text(item["name"]?[0] ?? "G", style: const TextStyle(color: Color(0xFF0F766E), fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item["name"] ?? "N/A", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text(item["email"] ?? "N/A", style: const TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: isHigh ? Colors.red.shade50 : Colors.teal.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isHigh ? Colors.red.shade100 : Colors.teal.shade100),
                ),
                child: Text("$count lớp", style: TextStyle(color: isHigh ? Colors.red : Colors.teal, fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _infoCompact("Sinh viên", item["studentCount"].toString(), Icons.people_outline),
              _infoCompact("Dự án", "---", Icons.folder_outlined), // Mapping projek count depends on schema
            ],
          ),
          const SizedBox(height: 16),
          const Align(
            alignment: Alignment.centerLeft,
            child: Text("CÁC LỚP PHỤ TRÁCH", style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
          ),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerLeft,
            child: Wrap(
              spacing: 6,
              runSpacing: 6,
              children: (item["courses"] as List).map((code) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.grey.shade200)),
                child: Text(code.toString(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.blueGrey)),
              )).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoCompact(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, size: 16, color: Colors.grey),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final String variant;

  const _StatCard({required this.label, required this.value, required this.icon, required this.color, required this.variant});

  @override
  Widget build(BuildContext context) {
    Color bg = variant == 'success' ? const Color(0xFFF0FDF4) : (variant == 'warning' ? const Color(0xFFFFF7ED) : const Color(0xFFEFF6FF));
    Color border = variant == 'success' ? const Color(0xFFDCFCE7) : (variant == 'warning' ? const Color(0xFFFFEDD5) : const Color(0xFFDBEAFE));
    Color textC = variant == 'success' ? const Color(0xFF15803D) : (variant == 'warning' ? const Color(0xFFEA580C) : const Color(0xFF1D4ED8));

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(24), border: Border.all(color: border, width: 1.5)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(label, style: TextStyle(fontSize: 10, color: textC, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                const SizedBox(height: 4),
                Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: textC)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.5), borderRadius: BorderRadius.circular(16)),
            child: Icon(icon, color: textC, size: 24),
          ),
        ],
      ),
    );
  }
}
