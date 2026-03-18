import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/student_navigation.dart';
import '../../services/student_service.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';

class StudentCoursesScreen extends StatefulWidget {
  const StudentCoursesScreen({super.key});
  @override
  State<StudentCoursesScreen> createState() => _StudentCoursesScreenState();
}

class _StudentCoursesScreenState extends State<StudentCoursesScreen> {
  final StudentService _studentService = StudentService();
  final AuthService _authService = AuthService();
  
  User? _currentUser;
  bool _isLoading = true;
  List<Map<String, dynamic>> _courses = [];
  List<Map<String, dynamic>> _projects = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final user = await _authService.getCurrentUser();
      final results = await Future.wait([
        _studentService.getMyCourses(),
        _studentService.getMyProjects(),
      ]);

      if (mounted) {
        setState(() {
          _currentUser = user;
          _courses = (results[0] as List).map(_normalizeCourse).toList();
          _projects = (results[1] as List).map(_normalizeProject).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Map<String, dynamic> _normalizeCourse(dynamic c) {
    final map = c as Map<String, dynamic>;
    return {
      'id': (map['id'] ?? map['Id'] ?? '').toString(),
      'code': (map['code'] ?? map['SubjectCode'] ?? 'SWD392').toString(),
      'name': (map['name'] ?? map['Title'] ?? map['topic'] ?? 'N/A').toString(),
      'status': (map['status'] ?? 'ACTIVE').toString(),
      'lecturerNames': map['lecturerNames'] ?? (map['lecturers'] as List?)?.map((l) => l['fullName'] ?? l['name']).toList() ?? [],
    };
  }

  Map<String, dynamic> _normalizeProject(dynamic p) {
    final map = p as Map<String, dynamic>;
    final integration = map['integration'] ?? map['Integration'] ?? {};
    final github = integration['github'] ?? integration['GitHub'] ?? {};
    final jira = integration['jira'] ?? integration['Jira'] ?? {};
    
    return {
      'id': (map['id'] ?? map['Id'] ?? '').toString(),
      'name': (map['name'] ?? map['topic'] ?? map['teamName'] ?? 'Dự án chưa tên').toString(),
      'courseId': (map['courseId'] ?? map['CourseId'] ?? '').toString(),
      'team': map['team'] ?? map['members'] ?? [],
      'repositoryName': github['repositoryName'] ?? map['repositoryName'] ?? 'No GitHub',
      'jiraProjectKey': jira['projectKey'] ?? map['jiraProjectKey'] ?? 'No Jira',
    };
  }

  @override
  Widget build(BuildContext context) {
    final scWidth = MediaQuery.of(context).size.width;
    final isMobile = scWidth < 900;
    final isSmall = scWidth < 400;
    
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: isMobile ? const StudentDrawer() : null,
      appBar: AppTopHeader(
        title: 'Khóa học của tôi',
        user: AppUser(name: _currentUser?.fullName ?? 'Student', email: _currentUser?.email ?? '', role: 'STUDENT'),
      ),
      body: Row(children: [
        if (!isMobile) const StudentSidebar(),
        Expanded(
          child: _isLoading 
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)))
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: EdgeInsets.fromLTRB(isSmall ? 12 : 20, 24, isSmall ? 12 : 20, 40),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      _buildHeader(scWidth),
                      const SizedBox(height: 24),
                      _buildStatsGrid(scWidth),
                      const SizedBox(height: 32),
                      const Text('Danh sách lớp học phần', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                      const SizedBox(height: 16),
                      if (_courses.isEmpty)
                        _buildEmptyState()
                      else
                        _buildCoursesGrid(isMobile, scWidth),
                    ]),
                  ),
                ),
        ),
      ]),
    );
  }

  Widget _buildHeader(double width) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(children: [
          GestureDetector(
            onTap: () => context.go('/student'),
            child: const Text('Sinh viên', style: TextStyle(fontSize: 11, color: Color(0xFF0D9488), fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 8),
          Icon(Icons.chevron_right_rounded, size: 14, color: const Color(0xFF64748B).withValues(alpha: 0.5)),
          const SizedBox(width: 8),
          const Text('Lớp học', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
        ]),
      ),
      const SizedBox(height: 12),
      Text('Khóa học của tôi', style: TextStyle(fontSize: width < 400 ? 20 : 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
      const SizedBox(height: 4),
      Text('Các lớp học phần bạn đang tham gia trong học kỳ này.', style: TextStyle(fontSize: 12, color: Color(0xFF64748B)), maxLines: 2),
    ]);
  }

  Widget _buildStatsGrid(double width) {
    final activeCount = _courses.where((c) => c['status'] == 'ACTIVE').length;
    final stats = [
      {'lbl': 'Tổng số lớp', 'val': '${_courses.length}', 'icon': Icons.book_outlined, 'color': Colors.blue},
      {'lbl': 'Đang hoạt động', 'val': '$activeCount', 'icon': Icons.track_changes_outlined, 'color': Color(0xFF0D9488)},
      {'lbl': 'Dự án nhóm', 'val': '${_projects.length}', 'icon': Icons.people_outline_rounded, 'color': Colors.orange},
    ];
    
    // Completely avoid GridView fixed aspect ratio on mobile to prevent bottom overflow
    if (width < 600) {
      return Column(children: stats.map((s) => _buildStatCard(s)).toList());
    }

    int crossCount = width < 800 ? 2 : 3;
    return GridView.builder(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossCount, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 2.8
      ),
      itemCount: 3,
      itemBuilder: (_, i) => _buildStatCard(stats[i]),
    );
  }

  Widget _buildStatCard(Map<String, dynamic> s) {
    final color = s['color'] as Color;
    return Container(
      margin: const EdgeInsets.only(bottom: 8), // Use margin for Column mode
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
        Row(children: [
          Icon(s['icon'] as IconData, size: 14, color: color),
          const SizedBox(width: 8),
          Expanded(child: Text(s['lbl'] as String, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B)), maxLines: 1)),
        ]),
        const SizedBox(height: 4),
        Text(s['val'] as String, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
      ]),
    );
  }

  Widget _buildCoursesGrid(bool isMobile, double width) {
    int crossCount = isMobile ? 1 : 2;
    return GridView.builder(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossCount, crossAxisSpacing: 20, mainAxisSpacing: 20, mainAxisExtent: 350 // Even safer height
      ),
      itemCount: _courses.length,
      itemBuilder: (_, i) => _buildCourseCard(_courses[i]),
    );
  }

  Widget _buildCourseCard(Map<String, dynamic> course) {
    final project = _projects.firstWhere((p) => p['courseId'] == course['id'], orElse: () => {});
    final bool hasProject = project.isNotEmpty;
    final bool isLeader = hasProject && (project['team'] as List?)?.any((m) => m['studentId'] == _currentUser?.studentCode && m['role'] == 'LEADER') == true;

    return GestureDetector(
      onTap: () => context.go('/student/workspace/${course['id']}'),
      child: Container(
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(32), border: Border.all(color: const Color(0xFFF1F5F9)),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))]),
        clipBehavior: Clip.antiAlias,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(height: 6, decoration: const BoxDecoration(gradient: LinearGradient(colors: [Color(0xFF0D9488), Color(0xFF4F46E5)]))),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: const Color(0xFF0D9488).withValues(alpha: 0.05), borderRadius: BorderRadius.circular(20)),
                  child: Text(course['code'] ?? 'N/A', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF0D9488))),
                ),
                const SizedBox(height: 12),
                Text(course['name'] ?? 'N/A', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), height: 1.25), maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 8),
                Row(children: [
                  const Icon(Icons.people_outline_rounded, size: 14, color: Color(0xFF94A3B8)),
                  const SizedBox(width: 8),
                  Expanded(child: Text('GV: ${course['lecturerNames']?.join(", ") ?? "N/A"}', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis)),
                ]),
                const Spacer(),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                const SizedBox(height: 16),
                if (hasProject)
                  Row(children: [
                    Container(width: 32, height: 32, decoration: BoxDecoration(color: const Color(0xFF64748B).withValues(alpha: 0.05), borderRadius: BorderRadius.circular(10)),
                      child: const Icon(Icons.folder_copy_outlined, size: 14, color: Color(0xFF64748B))),
                    const SizedBox(width: 10),
                    Expanded(child: Text(project['name'] ?? 'Dự án', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)), maxLines: 1, overflow: TextOverflow.ellipsis)),
                    const SizedBox(width: 6),
                    _statusBadge(isLeader ? 'Leader' : 'Member', isLeader ? Colors.orange : const Color(0xFF0D9488)),
                  ])
                else
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    const Text('Chưa phân nhóm', style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold, fontStyle: FontStyle.italic)),
                    Icon(Icons.chevron_right_rounded, size: 16, color: const Color(0xFF64748B).withValues(alpha: 0.3)),
                  ]),
              ]),
            ),
          ),
        ]),
      ),
    );
  }

  Widget _statusBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(20)),
      child: Text(label, style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.w900, color: color)),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 40),
        child: Column(children: [
          Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(20)),
            child: const Icon(Icons.book_outlined, size: 40, color: Color(0xFFCBD5E1))),
          const SizedBox(height: 16),
          const Text('Chưa có lớp học phần nào', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8))),
        ]),
      ),
    );
  }
}
