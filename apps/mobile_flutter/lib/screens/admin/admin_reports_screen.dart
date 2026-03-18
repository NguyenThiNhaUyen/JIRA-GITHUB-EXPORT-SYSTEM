import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/admin_navigation.dart';
import '../../services/admin_service.dart';

class AdminReportsScreen extends StatefulWidget {
  const AdminReportsScreen({super.key});

  @override
  State<AdminReportsScreen> createState() => _AdminReportsScreenState();
}

class _AdminReportsScreenState extends State<AdminReportsScreen> {
  String selectedSemester = '';
  String selectedCourse = '';
  final AdminService _adminService = AdminService();
  bool _isLoading = false;

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

  List<Map<String, dynamic>> allCoursesRaw = [];

  List<Map<String, dynamic>> get allCourses {
    if (selectedSemester.isEmpty) return allCoursesRaw;
    return allCoursesRaw
        .where((c) => c['semesterId'] == selectedSemester)
        .toList();
  }

  List<Map<String, dynamic>> get filteredCourses {
    if (selectedCourse.isEmpty) return allCourses;
    return allCourses.where((c) => c['id'] == selectedCourse).toList();
  }

  Map<String, dynamic> get stats {
    final totalCourses = allCourses.length;
    final totalStudents = allCourses.fold<int>(
      0,
      (sum, c) => sum + ((c['currentStudents'] ?? 0) as int),
    );
    final totalProjects = allCourses.fold<int>(
      0,
      (sum, c) => sum + ((c['projectsCount'] ?? 0) as int),
    );
    final activeCourses = allCourses
        .where((c) => c['status'] == 'ACTIVE')
        .length;

    return {
      'totalCourses': totalCourses,
      'totalStudents': totalStudents,
      'totalProjects': totalProjects,
      'activeCourses': activeCourses,
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

  List<Map<String, dynamic>> get srsStatusData => const [];

  @override
  void initState() {
    super.initState();
    _loadData();
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
        allCoursesRaw = List<Map<String, dynamic>>.from(results[1]);
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
                                _buildBreadcrumb(),
                                const SizedBox(height: 18),
                                _buildFiltersCard(),
                                const SizedBox(height: 18),
                                _buildOverviewStats(),
                                const SizedBox(height: 18),
                                _buildChartsGrid(),
                                const SizedBox(height: 18),
                                _buildCourseReportTable(),
                                const SizedBox(height: 18),
                                _buildSilentProjectsAlert(),
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
      title: 'Phân tích hệ thống',
      primary: false,
      user: const AppUser(
        name: 'Super Admin',
        email: 'admin@fe.edu.vn',
        role: 'ADMIN',
      ),
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
              ],
            )
          : Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(child: _buildSemesterDropdown()),
                const SizedBox(width: 16),
                Expanded(child: _buildCourseDropdown()),
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
                  value: semester['id'] as String,
                  child: Text(semester['name'] as String),
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
                  value: course['id'] as String,
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
        'color': const Color(0xFF3B82F6),
        'sub': '${stats['activeCourses']} đang mở',
        'subColor': const Color(0xFF16A34A),
      },
      {
        'title': 'Tổng sinh viên',
        'value': '${stats['totalStudents']}',
        'icon': Icons.people_outline,
        'color': const Color(0xFF6366F1),
        'sub': 'Toàn hệ thống',
        'subColor': textSecondary,
      },
      {
        'title': 'Số lượng dự án',
        'value': '${stats['totalProjects']}',
        'icon': Icons.folder_copy_outlined,
        'color': const Color(0xFF8B5CF6),
        'sub': '${projectStats['activeProjects']} đang hoạt động',
        'subColor': const Color(0xFF2563EB),
      },
      {
        'title': 'Dự án cần chú ý',
        'value': '${projectStats['silentProjects']}',
        'icon': Icons.warning_amber_rounded,
        'color': const Color(0xFFF87171),
        'sub': 'Không có hoạt động 7 ngày',
        'subColor': const Color(0xFFEF4444),
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
                            item['title'] as String,
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
                            item['value'] as String,
                            style: TextStyle(
                              fontSize: isNarrow ? 18 : 22,
                              fontWeight: FontWeight.w800,
                              color: textPrimary,
                            ),
                          ),
                          Text(
                            item['sub'] as String,
                            style: TextStyle(
                              fontSize: isNarrow ? 9 : 10,
                              color: item['subColor'] as Color,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
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
        title: 'Lịch sử Commit (30 ngày qua)',
        child: SizedBox(
          height: 250,
          child: _SimpleLineChart(data: commitChartData),
        ),
      ),
      _SectionCard(
        title: 'Tình trạng Báo cáo SRS',
        child: SizedBox(
          height: 250,
          child: _SimpleDonutLegendChart(data: srsStatusData),
        ),
      ),
      _SectionCard(
        title: 'Dự án theo Lớp học',
        child: SizedBox(
          height: 250,
          child: _SimpleBarChart(data: projectDistribution),
        ),
      ),
      _SectionCard(
        title: 'Tiến độ Các môn học',
        child: SizedBox(
          height: 250,
          child: _SimpleProgressChart(
            data: filteredCourses
                .map<Map<String, dynamic>>(
                  (course) => <String, dynamic>{
                    'name': course['code'],
                    'completed': ((course['projectsCount'] ?? 0) as int) + 4,
                    'remaining': 5,
                  },
                )
                .toList(),
          ),
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
                                  course['id'] as String,
                                ),
                              ),
                              _IconActionButton(
                                icon: Icons.people_alt_outlined,
                                color: const Color(0xFF2563EB),
                                tooltip: 'Báo cáo Team Roster',
                                onTap: () => handleGenerateReport(
                                  'ROSTER',
                                  course['id'] as String,
                                ),
                              ),
                              _IconActionButton(
                                icon: Icons.description_outlined,
                                color: const Color(0xFF4F46E5),
                                tooltip: 'Xuất SRS ISO',
                                onTap: () => handleGenerateReport(
                                  'SRS',
                                  course['id'] as String,
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

  Widget _buildSilentProjectsAlert() {
    final int silentProjects = projectStats['silentProjects'] as int;

    if (silentProjects > 0) {
      return _SectionCard(
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: const Color(0xFFFEF2F2),
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: const Color(0xFFFECACA)),
          ),
          child: Column(
            children: [
              const SizedBox(height: 10),
              const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.warning_amber_rounded, color: Color(0xFFDC2626)),
                  SizedBox(width: 8),
                  Text(
                    'Cảnh báo Dự án',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFFB91C1C),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  color: Color(0xFFFEE2E2),
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  '$silentProjects',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFFDC2626),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Dự án chưa hoạt động',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Các dự án này không có hoạt động cập nhật mã nguồn trong 7 ngày qua.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: textSecondary),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFDCFCE7)),
      ),
      child: Column(
        children: const [
          CircleAvatar(
            radius: 32,
            backgroundColor: Color(0xFFDCFCE7),
            child: Icon(
              Icons.check_circle_outline,
              size: 32,
              color: Color(0xFF16A34A),
            ),
          ),
          SizedBox(height: 16),
          Text(
            'Tất cả dự án đang hoạt động',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: textPrimary,
            ),
          ),
          SizedBox(height: 6),
          Text(
            'Không có dự án nào bị bỏ trống tuần này',
            style: TextStyle(fontSize: 13, color: textSecondary),
          ),
        ],
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
            color: Colors.black.withOpacity(0.03),
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
              .map((e) => (e['projects'] as int))
              .fold<int>(0, (a, b) => a > b ? a : b);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: data.map((item) {
        final value = item['projects'] as int;
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

class _SimpleDonutLegendChart extends StatelessWidget {
  final List<Map<String, dynamic>> data;

  const _SimpleDonutLegendChart({required this.data});

  @override
  Widget build(BuildContext context) {
    final total = data.fold<int>(0, (sum, e) => sum + (e['value'] as int));

    return Row(
      children: [
        Expanded(
          flex: 4,
          child: Center(
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFE2E8F0), width: 18),
              ),
              child: Center(
                child: Text(
                  '$total',
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: _AdminReportsScreenState.textPrimary,
                  ),
                ),
              ),
            ),
          ),
        ),
        Expanded(
          flex: 5,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: data.map((item) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: item['color'] as Color,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        '${item['name']}',
                        style: const TextStyle(
                          fontSize: 13,
                          color: _AdminReportsScreenState.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    Text(
                      '${item['value']}',
                      style: const TextStyle(
                        fontSize: 13,
                        color: _AdminReportsScreenState.textSecondary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _SimpleProgressChart extends StatelessWidget {
  final List<Map<String, dynamic>> data;

  const _SimpleProgressChart({required this.data});

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return const Center(
        child: Text(
          'Không có dữ liệu',
          style: TextStyle(color: _AdminReportsScreenState.textSecondary),
        ),
      );
    }

    return Column(
      children: data.map((item) {
        final int completed = item['completed'] as int;
        final int remaining = item['remaining'] as int;
        final int total = completed + remaining;
        final double ratio = total == 0 ? 0 : completed / total;

        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Row(
            children: [
              SizedBox(
                width: 64,
                child: Text(
                  '${item['name']}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: _AdminReportsScreenState.textPrimary,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: LinearProgressIndicator(
                    value: ratio,
                    minHeight: 12,
                    backgroundColor: const Color(0xFFE2E8F0),
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      _AdminReportsScreenState.teal,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                '${(ratio * 100).round()}%',
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  color: _AdminReportsScreenState.textSecondary,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
