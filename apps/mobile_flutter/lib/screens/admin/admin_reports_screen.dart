import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/admin_navigation.dart';
import '../../services/admin_service.dart';
import '../../services/auth_service.dart';

class AdminReportsScreen extends StatefulWidget {
  const AdminReportsScreen({super.key});

  @override
  State<AdminReportsScreen> createState() => _AdminReportsScreenState();
}

class _AdminReportsScreenState extends State<AdminReportsScreen> {
  String selectedSemester = '';
  String selectedCourse = '';
  final AdminService _adminService = AdminService();
  final AuthService _authService = AuthService();
  bool _isLoading = false;
  AppUser? _currentUser;

  static const Color bgColor = Color(0xFFEFF7F5);
  static const Color contentBg = Color(0xFFF8FAFC);
  static const Color cardBorder = Color(0xFFE7ECF3);
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color teal = Color(0xFF0F766E);
  static const Color cyan = Color(0xFF0891B2);
  static const Color blue = Color(0xFF2563EB);

  bool get isMobile => MediaQuery.of(context).size.width < 900;
  bool get isTablet =>
      MediaQuery.of(context).size.width >= 900 &&
      MediaQuery.of(context).size.width < 1200;

  List<Map<String, dynamic>> semesters = [];
  List<Map<String, dynamic>> courses = [];

  List<Map<String, dynamic>> get allCourses {
    if (selectedSemester.isEmpty) return courses;
    return courses.where((c) => c['semesterId'].toString() == selectedSemester).toList();
  }

  List<Map<String, dynamic>> get filteredCourses {
    List<Map<String, dynamic>> result = courses;
    if (selectedSemester.isNotEmpty) {
      result = result.where((c) => c['semesterId'].toString() == selectedSemester).toList();
    }
    if (selectedCourse.isNotEmpty) {
      result = result.where((c) => c['id'].toString() == selectedCourse).toList();
    }
    return result;
  }

  Map<String, dynamic> get stats {
    final resultCourses = courses; // Always calculate based on all for overview if needed, or filtered?
    // AdminReports.jsx uses allCourses for stats overview usually
    return {
      'totalCourses': resultCourses.length,
      'activeCourses': resultCourses.where((c) => c['status'] == 'ACTIVE').length,
      'totalStudents': resultCourses.fold<int>(0, (sum, c) => sum + ((c['currentStudents'] as num?)?.toInt() ?? 0)),
      'totalProjects': resultCourses.fold<int>(0, (sum, c) => sum + ((c['projectsCount'] as num?)?.toInt() ?? 0)),
    };
  }

  Map<String, dynamic> get projectStats {
    return {
      'totalProjects': stats['totalProjects'],
      'activeProjects': stats['totalProjects'],
      'silentProjects': 0,
      'projectsWithSrs': 0,
    };
  }

  List<Map<String, dynamic>> get commitChartData => const [];

  List<Map<String, dynamic>> get projectDistribution => filteredCourses
      .map<Map<String, dynamic>>(
        (course) => <String, dynamic>{
          'name': course['code'],
          'projects': course['projectsCount'] ?? 0,
          'students': course['currentStudents'] ?? 0,
        },
      )
      .toList();


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
      final results = await Future.wait([
        _adminService.getSemesters(),
        _adminService.getCourses(),
      ]);

      setState(() {
        semesters = List<Map<String, dynamic>>.from(results[0]);
        courses = List<Map<String, dynamic>>.from(results[1]);
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> handleGenerateReport(String type, String id) async {
    String message;
    switch (type) {
      case 'COMMIT':
        message = 'Đã bắt đầu tạo báo cáo Commit cho lớp.';
        break;
      case 'ROSTER':
        message = 'Đã bắt đầu tạo báo cáo Team Roster.';
        break;
      case 'SRS':
        message = 'Đã bắt đầu xuất báo cáo SRS.';
        break;
      default:
        message = 'Đã bắt đầu tạo báo cáo.';
    }

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message), backgroundColor: teal));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgColor,
      drawer: isMobile ? const AdminDrawer() : null,
      body: SafeArea(
        child: Row(
          children: [
            if (!isMobile) const AdminSidebar(),
            Expanded(
              child: Container(
                margin: EdgeInsets.all(isMobile ? 0 : 14),
                decoration: BoxDecoration(
                  color: contentBg,
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
                        padding: EdgeInsets.all(isMobile ? 16 : 24),
                        child: Center(
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(maxWidth: 1400),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildPageHeader(),
                                if (isMobile) _buildMobileActions(),
                                const SizedBox(height: 18),
                                _buildFiltersCard(),
                                const SizedBox(height: 18),
                                _buildOverviewStats(),
                                const SizedBox(height: 18),
                                _buildChartsGrid(),
                                const SizedBox(height: 18),
                                _buildCourseReportTable(),
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
      title: 'Trung tâm Báo cáo',
      primary: false,
      user: _currentUser ?? const AppUser(
        name: 'Admin',
        email: '',
        role: 'ADMIN',
      ),
    );
  }

  Widget _buildPageHeader() {
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
                'Trung tâm Báo cáo',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Tổng hợp dữ liệu, thống kê hiệu suất và xuất các báo cáo chuyên sâu.',
                style: TextStyle(
                  fontSize: 13,
                  color: textSecondary,
                ),
              ),
            ],
          ),
        ),
        if (!isMobile)
          Row(
            children: [
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.print_outlined, size: 16),
                label: const Text('In báo cáo'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton.icon(
                onPressed: _handleExportAll,
                icon: const Icon(Icons.download, size: 16),
                label: const Text('Export Tổng hợp'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: teal,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ],
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
            child: OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.print_outlined, size: 16),
              label: const Text('In báo cáo'),
              style: OutlinedButton.styleFrom(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: ElevatedButton.icon(
              onPressed: _handleExportAll,
              icon: const Icon(Icons.download, size: 16),
              label: const Text('Export'),
              style: ElevatedButton.styleFrom(
                backgroundColor: teal,
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

  void _handleExportAll() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đang trích xuất báo cáo tổng hợp...'), backgroundColor: teal),
    );
  }

  Widget _buildBreadcrumb() {
    return Row(
      children: const [
        Text(
          'Admin',
          style: TextStyle(
            color: teal,
            fontWeight: FontWeight.w700,
            fontSize: 12,
          ),
        ),
        SizedBox(width: 4),
        Icon(Icons.chevron_right, size: 14, color: textSecondary),
        SizedBox(width: 4),
        Text(
          'Phân tích hệ thống',
          style: TextStyle(
            color: textPrimary,
            fontWeight: FontWeight.w700,
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildFiltersCard() {
    return _SectionCard(
      child: isMobile
          ? Column(
              children: [
                _buildSemesterDropdown(),
                const SizedBox(height: 12),
                _buildCourseDropdown(),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.filter_list, size: 18),
                    label: const Text('Áp dụng lọc'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: teal,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            )
          : Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(flex: 3, child: _buildSemesterDropdown()),
                const SizedBox(width: 16),
                Expanded(flex: 3, child: _buildCourseDropdown()),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: SizedBox(
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Đã cập nhật bộ lọc'), backgroundColor: teal),
                        );
                      },
                      icon: const Icon(Icons.filter_list, size: 18),
                      label: const Text('Áp dụng lọc'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: teal,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildSemesterDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Học kỳ',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: selectedSemester.isEmpty ? null : selectedSemester,
          onChanged: (value) {
            setState(() {
              selectedSemester = value ?? '';
              selectedCourse = '';
            });
          },
          decoration: InputDecoration(
            hintText: 'Tất cả học kỳ',
            hintStyle: const TextStyle(color: textSecondary),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 14,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: cardBorder),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: cardBorder),
            ),
          ),
          items: semesters
              .map(
                (semester) => DropdownMenuItem<String>(
                  value: semester['id'].toString(),
                  child: Text('${semester['name']}'),
                ),
              )
              .toList(),
        ),
      ],
    );
  }

  Widget _buildCourseDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Lớp học',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: selectedCourse.isEmpty ? null : selectedCourse,
          onChanged: (value) {
            setState(() {
              selectedCourse = value ?? '';
            });
          },
          decoration: InputDecoration(
            hintText: 'Tất cả lớp học',
            hintStyle: const TextStyle(color: textSecondary),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 14,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: cardBorder),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: cardBorder),
            ),
          ),
          items: allCourses
              .map(
                (course) => DropdownMenuItem<String>(
                  value: course['id'].toString(),
                  child: Text('${course['code']} - ${course['name']}'),
                ),
              )
              .toList(),
        ),
      ],
    );
  }

  Widget _buildOverviewStats() {
    final items = [
      {
        'title': 'Tổng số lớp',
        'value': '${stats['totalCourses']}',
        'icon': Icons.book_outlined,
        'color': const Color(0xFF6366F1), // indigo
      },
      {
        'title': 'Lớp đang mở',
        'value': '${stats['activeCourses']}',
        'icon': Icons.check_circle_outline,
        'color': const Color(0xFF10B981), // success/teal
      },
      {
        'title': 'Tổng sinh viên',
        'value': '${stats['totalStudents']}',
        'icon': Icons.people_outline,
        'color': const Color(0xFF3B82F6), // info/blue
      },
      {
        'title': 'Dự án/Nhóm',
        'value': '${stats['totalProjects']}',
        'icon': Icons.folder_copy_outlined,
        'color': const Color(0xFFF59E0B), // warning/amber
      },
    ];

    return _SectionCard(
      title: 'Tổng quan hệ thống',
      subtitle: 'Tóm tắt nhanh tình trạng lớp học và dự án',
      child: LayoutBuilder(
        builder: (context, constraints) {
          // Tính aspect ratio phù hợp theo độ rộng thực tế của card
          final cardWidth = constraints.maxWidth;
          // Mỗi cell = (cardWidth - crossAxisSpacing) / 2
          final cellWidth = (cardWidth - 16) / 2;
          // Chiều cao tối thiểu cần: icon 46 + text ~72 + padding 32 = ~150
          // Aspect ratio = cellWidth / cellHeight
          final aspectRatio = (cellWidth / 110).clamp(1.1, 1.8);
          final isNarrow = cellWidth < 160;

          return GridView.builder(
            itemCount: items.length,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: aspectRatio,
            ),
            itemBuilder: (context, index) {
              final item = items[index];

              return Container(
                padding: EdgeInsets.all(isNarrow ? 10 : 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFCFDFE),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: cardBorder),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Container(
                      width: isNarrow ? 36 : 46,
                      height: isNarrow ? 36 : 46,
                      decoration: BoxDecoration(
                        color: (item['color'] as Color).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        item['icon'] as IconData,
                        color: item['color'] as Color,
                        size: isNarrow ? 18 : 22,
                      ),
                    ),
                    SizedBox(width: isNarrow ? 8 : 12),
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            '${item['title']}',
                            style: TextStyle(
                              fontSize: isNarrow ? 10 : 12,
                              color: textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${item['value']}',
                            style: TextStyle(
                              fontSize: isNarrow ? 18 : 22,
                              fontWeight: FontWeight.w800,
                              color: textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildChartsGrid() {
    final children = [
      _SectionCard(
        title: 'Commit Trends',
        subtitle: '30 Ngày qua',
        child: SizedBox(
          height: 250,
          child: _SimpleLineChart(data: const []),
        ),
      ),
      _SectionCard(
        title: 'Phân bổ dự án',
        child: SizedBox(
          height: 250,
          child: _SimpleBarChart(data: projectDistribution),
        ),
      ),
    ];

    if (isMobile) {
      return Column(
        children: [
          for (int i = 0; i < children.length; i++) ...[
            children[i],
            if (i != children.length - 1) const SizedBox(height: 18),
          ],
        ],
      );
    }

    return GridView.builder(
      itemCount: children.length,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 18,
        mainAxisSpacing: 18,
        childAspectRatio: 1.45,
      ),
      itemBuilder: (context, index) => children[index],
    );
  }

  Widget _buildCourseReportTable() {
    return _SectionCard(
      title: 'Thông tin Lớp học & Báo cáo',
      trailing: OutlinedButton.icon(
        onPressed: () => context.go('/admin/my-reports'),
        icon: const Icon(Icons.description_outlined, size: 16),
        label: const Text('Xem LS Báo cáo'),
        style: OutlinedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minWidth: 980),
          child: Table(
            columnWidths: const {
              0: FlexColumnWidth(3.3),
              1: FlexColumnWidth(1.3),
              2: FlexColumnWidth(1.1),
              3: FlexColumnWidth(1.5),
              4: FlexColumnWidth(2.1),
            },
            defaultVerticalAlignment: TableCellVerticalAlignment.middle,
            children: [
              TableRow(
                decoration: const BoxDecoration(color: Color(0xFFF8FAFC)),
                children: [
                  _buildHeaderCell('Lớp học'),
                  _buildHeaderCell('Sinh viên', align: TextAlign.center),
                  _buildHeaderCell('Dự án', align: TextAlign.center),
                  _buildHeaderCell('Trạng thái', align: TextAlign.center),
                  _buildHeaderCell('Xuất Báo cáo', align: TextAlign.right),
                ],
              ),
              if (filteredCourses.isEmpty)
                const TableRow(
                  children: [
                    _EmptyTableCell(),
                    _EmptyTableCell(),
                    _EmptyTableCell(),
                    _EmptyTableCell(),
                    _EmptyTableCell(),
                  ],
                )
              else
                ...filteredCourses.map((course) {
                  return TableRow(
                    decoration: const BoxDecoration(
                      border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
                    ),
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${course['code']}',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${course['name']}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Center(
                          child: RichText(
                            text: TextSpan(
                              text: '${course['currentStudents']}',
                              style: const TextStyle(
                                color: textPrimary,
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                              ),
                              children: [
                                TextSpan(
                                  text: '/${course['maxStudents']}',
                                  style: const TextStyle(
                                    color: Color(0xFF94A3B8),
                                    fontWeight: FontWeight.w500,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Center(
                          child: Text(
                            '${course['projectsCount'] ?? 0}',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: textPrimary,
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Center(
                          child: _courseStatusBadge('${course['status']}'),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(12),
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: Wrap(
                            spacing: 8,
                            children: [
                              _IconActionButton(
                                icon: Icons.print_outlined,
                                color: const Color(0xFFEA580C),
                                tooltip: 'Báo cáo Commit',
                                onTap: () => handleGenerateReport(
                                  'COMMIT',
                                  course['id'].toString(),
                                ),
                              ),
                              _IconActionButton(
                                icon: Icons.people_alt_outlined,
                                color: const Color(0xFF2563EB),
                                tooltip: 'Báo cáo Team Roster',
                                onTap: () => handleGenerateReport(
                                  'ROSTER',
                                  course['id'].toString(),
                                ),
                              ),
                              _IconActionButton(
                                icon: Icons.description_outlined,
                                color: const Color(0xFF4F46E5),
                                tooltip: 'Xuất SRS ISO',
                                onTap: () => handleGenerateReport(
                                  'SRS',
                                  course['id'].toString(),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  );
                }),
            ],
          ),
        ),
      ),
    );
  }


  Widget _buildHeaderCell(String text, {TextAlign align = TextAlign.left}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Text(
        text,
        textAlign: align,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: textSecondary,
        ),
      ),
    );
  }

  Widget _courseStatusBadge(String status) {
    String label;
    Color bg;
    Color fg;

    switch (status) {
      case 'ACTIVE':
        label = 'ĐANG MỞ';
        bg = const Color(0xFFECFDF5);
        fg = const Color(0xFF15803D);
        break;
      case 'UPCOMING':
        label = 'SẮP MỞ';
        bg = const Color(0xFFEFF6FF);
        fg = const Color(0xFF2563EB);
        break;
      default:
        label = 'ĐÃ ĐÓNG';
        bg = const Color(0xFFF3F4F6);
        fg = const Color(0xFF6B7280);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          color: fg,
          letterSpacing: 0.4,
        ),
      ),
    );
  }
}


class _SectionCard extends StatelessWidget {
  final String? title;
  final String? subtitle;
  final Widget child;
  final Widget? trailing;

  const _SectionCard({
    this.title,
    this.subtitle,
    required this.child,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: _AdminReportsScreenState.cardBorder),
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 14,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null) ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title!,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: _AdminReportsScreenState.textPrimary,
                        ),
                      ),
                      if (subtitle != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          subtitle!,
                          style: const TextStyle(
                            fontSize: 12,
                            color: _AdminReportsScreenState.textSecondary,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                if (trailing != null) trailing!,
              ],
            ),
            const SizedBox(height: 14),
          ],
          child,
        ],
      ),
    );
  }
}

class _IconActionButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String tooltip;
  final VoidCallback onTap;

  const _IconActionButton({
    required this.icon,
    required this.color,
    required this.tooltip,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: Ink(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 18, color: color),
        ),
      ),
    );
  }
}

class _EmptyTableCell extends StatelessWidget {
  const _EmptyTableCell();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Text(
          'Không có dữ liệu lớp học phù hợp.',
          style: TextStyle(
            color: _AdminReportsScreenState.textSecondary,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

class _SimpleBarChart extends StatelessWidget {
  final List<Map<String, dynamic>> data;

  const _SimpleBarChart({required this.data});

  @override
  Widget build(BuildContext context) {
    final maxValue = data.isEmpty
        ? 1
        : data
              .map((e) => (e['projects'] as num?)?.toInt() ?? 0)
              .fold<int>(0, (a, b) => a > b ? a : b);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: data.map((item) {
        final value = (item['projects'] as num?)?.toInt() ?? 0;
        final ratio = maxValue == 0 ? 0.0 : value / maxValue;
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  '$value',
                  style: const TextStyle(
                    fontSize: 11,
                    color: _AdminReportsScreenState.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  height: 150 * ratio + 10,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        _AdminReportsScreenState.cyan,
                        _AdminReportsScreenState.blue,
                      ],
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  '${item['name']}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: _AdminReportsScreenState.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _SimpleLineChart extends StatelessWidget {
  final List<Map<String, dynamic>> data;

  const _SimpleLineChart({required this.data});

  @override
  Widget build(BuildContext context) {
    final maxValue = data.isEmpty
        ? 1
        : data
              .map((e) => (e['value'] as int))
              .fold<int>(0, (a, b) => a > b ? a : b);

    return Column(
      children: [
        Expanded(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: data.map((item) {
              final value = item['value'] as int;
              final ratio = maxValue == 0 ? 0.0 : value / maxValue;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Container(
                        height: 150 * ratio + 8,
                        decoration: BoxDecoration(
                          color: const Color(0xFFBFDBFE),
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${item['label']}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: _AdminReportsScreenState.textPrimary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Biểu đồ xu hướng commit giả lập',
          style: TextStyle(
            fontSize: 12,
            color: _AdminReportsScreenState.textSecondary,
          ),
        ),
      ],
    );
  }
}

