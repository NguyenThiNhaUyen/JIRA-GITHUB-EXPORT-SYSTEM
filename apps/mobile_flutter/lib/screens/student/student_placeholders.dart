// Student Placeholders - based on student-placeholders.jsx
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:math';
import '../../../widgets/app_top_header.dart';
import '../../../widgets/student_navigation.dart';

// ───────────────────────── MOCK DATA ─────────────────────────

const List<Map<String, dynamic>> _mockCourses = [];

const List<Map<String, dynamic>> _mockProjects = [];

const Map<String, dynamic> _mockProjectMetrics = {};

const List<Map<String, dynamic>> _mockAlerts = [];

const Map<String, dynamic> _mockSrsData = {};

const Map<String, Color> _srsStatusColors = {
  "SUBMITTED": Color(0xFF3B82F6),
  "UNDER_REVIEW": Color(0xFFF59E0B),
  "NEEDS_REVISION": Color(0xFFEF4444),
  "APPROVED": Color(0xFF10B981),
  "REJECTED": Color(0xFF64748B),
};

const Map<String, Color> _srsStatusBgColors = {
  "SUBMITTED": Color(0xFFEFF6FF),
  "UNDER_REVIEW": Color(0xFFFFFBEB),
  "NEEDS_REVISION": Color(0xFFFEF2F2),
  "APPROVED": Color(0xFFECFDF5),
  "REJECTED": Color(0xFFF8FAFC),
};

// ───────────────────────── UI HELPERS ─────────────────────────

Widget _buildBreadcrumb(BuildContext context, String currentTitle) {
  return Row(
    children: [
      InkWell(
        onTap: () => context.go('/student'),
        child: const Text('Sinh viên', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF0F766E))),
      ),
      const SizedBox(width: 4),
      const Icon(Icons.chevron_right, size: 14, color: Color(0xFF94A3B8)),
      const SizedBox(width: 4),
      Text(currentTitle, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
    ],
  );
}

Widget _buildSectionHeader(String title, String subtitle) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
      const SizedBox(height: 4),
      Text(subtitle, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
    ],
  );
}

Widget _buildSummaryCard(IconData icon, Color bgIcon, String label, String value) {
  return Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: const Color(0xFFF1F5F9)),
      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2))],
    ),
    child: Row(
      children: [
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(color: bgIcon, borderRadius: BorderRadius.circular(14)),
          child: Icon(icon, color: Colors.white, size: 20),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Color(0xFF64748B))),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
            ],
          ),
        ),
      ],
    ),
  );
}

Widget _buildEmptyState(IconData icon, String title, String desc) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 40),
    child: Column(
      children: [
        Container(
          width: 64, height: 64,
          decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(20)),
          child: Icon(icon, size: 32, color: const Color(0xFFCBD5E1)),
        ),
        const SizedBox(height: 12),
        Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
        const SizedBox(height: 4),
        Text(desc, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
      ],
    ),
  );
}

// ───────────────────────── PAGES ─────────────────────────

// 1. Courses Page
class StudentCoursesScreen extends StatelessWidget {
  const StudentCoursesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final activeCourses = _mockCourses.where((c) => c['status'] == 'ACTIVE').length;
    final isMobile = MediaQuery.of(context).size.width < 900;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: isMobile ? const StudentDrawer() : null,
      body: SafeArea(
        child: Row(
          children: [
            if (!isMobile) const StudentSidebar(),
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
                    const AppTopHeader(title: 'Lớp của tôi', primary: false),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildBreadcrumb(context, 'Lớp của tôi'),
                            const SizedBox(height: 16),
                            _buildSectionHeader('Lớp học của tôi', 'Tất cả lớp học phần bạn đang tham gia'),
                            const SizedBox(height: 20),
                            Row(
                              children: [
                                Expanded(child: _buildSummaryCard(Icons.menu_book_rounded, const Color(0xFF14B8A6), 'Tổng số lớp', '${_mockCourses.length}')),
                                const SizedBox(width: 12),
                                Expanded(child: _buildSummaryCard(Icons.folder_shared_rounded, const Color(0xFF3B82F6), 'Project đang tham gia', '${_mockProjects.length}')),
                              ],
                            ),
                            const SizedBox(height: 12),
                            _buildSummaryCard(Icons.verified_rounded, const Color(0xFF10B981), 'Lớp đang hoạt động', '$activeCourses'),
                            const SizedBox(height: 20),
                            if (_mockCourses.isEmpty)
                              _buildEmptyState(Icons.menu_book_rounded, 'Bạn chưa được đăng ký lớp nào', 'Hiện chưa có khóa học nào hiển thị')
                            else
                              ..._mockCourses.map((c) => _buildCourseCard(context, c)),
                          ],
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

  Widget _buildCourseCard(BuildContext context, Map<String, dynamic> course) {
    final project = _mockProjects.firstWhere((p) => p['courseId'] == course['id'], orElse: () => {});
    final isLeader = project.isNotEmpty && project['teamLeaderId'] == 'SE123456';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 6)],
      ),
      child: Column(
        children: [
          Container(height: 4, decoration: const BoxDecoration(borderRadius: BorderRadius.vertical(top: Radius.circular(24)), gradient: LinearGradient(colors: [Color(0xFF14B8A6), Color(0xFF3B82F6)]))),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: const Color(0xFFF0FDFA), borderRadius: BorderRadius.circular(6)),
                            child: Text(course['subject']['code'] ?? course['code'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF0F766E))),
                          ),
                          const SizedBox(height: 6),
                          Text(course['name'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF1E293B))),
                          const SizedBox(height: 2),
                          Text(course['lecturerNames'].join(", "), style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFD1FAE5))),
                      child: Text(course['status'], style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF047857))),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(course['description'], style: const TextStyle(fontSize: 13, height: 1.5, color: Color(0xFF475569))),
                const SizedBox(height: 16),
                GridView.count(
                  crossAxisCount: 2, shrinkWrap: true, crossAxisSpacing: 10, mainAxisSpacing: 10, childAspectRatio: 2.2, physics: const NeverScrollableScrollPhysics(),
                  children: [
                    _infoBox('Học kỳ', course['semester']),
                    _infoBox('Số tín chỉ', '${course['credits']}'),
                    _infoBox('Lịch học', course['schedule']),
                    _infoBox('Phòng', course['room']),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [const Text('Tiến độ môn học', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))), Text('${course['progress']}%', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)))],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(value: course['progress'] / 100, minHeight: 8, backgroundColor: const Color(0xFFF1F5F9), valueColor: const AlwaysStoppedAnimation(Color(0xFF14B8A6))),
                ),
                const SizedBox(height: 16),
                if (project.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: const Color(0xFFF8FAFC), border: Border.all(color: const Color(0xFFF1F5F9)), borderRadius: BorderRadius.circular(16)),
                    child: Row(
                      children: [
                        Expanded(child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(project['name'], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
                            const SizedBox(height: 4),
                            Text('Repo: ${project['repositoryName']}', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                            Text('Jira: ${project['jiraProjectKey']}', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                          ],
                        )),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(color: isLeader ? const Color(0xFFFFFBEB) : Colors.white, border: Border.all(color: isLeader ? const Color(0xFFFEF3C7) : const Color(0xFFE2E8F0)), borderRadius: BorderRadius.circular(12)),
                          child: Text(isLeader ? 'Leader' : 'Member', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: isLeader ? const Color(0xFFB45309) : const Color(0xFF64748B))),
                        ),
                      ],
                    ),
                  )
                else
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: const Color(0xFFF8FAFC), border: Border.all(color: const Color(0xFFE2E8F0), style: BorderStyle.solid), borderRadius: BorderRadius.circular(16)),
                    child: const Center(child: Text('Chưa có project được gán cho lớp này', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)))),
                  ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _outlineBtn('Nhóm của tôi', Icons.folder_shared_rounded, () => context.go('/student/my-project')),
                    const SizedBox(width: 8),
                    if (project.isNotEmpty)
                      _primaryBtn('Xem project', Icons.visibility_rounded, () => context.go('/student/project/${project['id']}'))
                    else
                      _outlineBtn('Về dashboard', Icons.open_in_new_rounded, () => context.go('/student'))
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoBox(String label, String value) => Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(16)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))), const SizedBox(height: 4), Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)), maxLines: 1, overflow: TextOverflow.ellipsis)]),
      );
}

// 2. My Project Page
class StudentMyProjectScreen extends StatelessWidget {
  const StudentMyProjectScreen({super.key});

  @override
  Widget build(BuildContext context) {
    int leaderCount = _mockProjects.where((p) => p['teamLeaderId'] == 'SE123456').length;
    final isMobile = MediaQuery.of(context).size.width < 900;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: isMobile ? const StudentDrawer() : null,
      body: SafeArea(
        child: Row(
          children: [
            if (!isMobile) const StudentSidebar(),
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
                    const AppTopHeader(title: 'Nhóm của tôi', primary: false),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildBreadcrumb(context, 'Nhóm của tôi'),
                            const SizedBox(height: 16),
                            _buildSectionHeader('Nhóm / Project của tôi', 'Danh sách project bạn đang tham gia'),
                            const SizedBox(height: 20),
                            Row(
                              children: [
                                Expanded(child: _buildSummaryCard(Icons.folder_shared_rounded, const Color(0xFF14B8A6), 'Số project', '${_mockProjects.length}')),
                                const SizedBox(width: 12),
                                Expanded(child: _buildSummaryCard(Icons.group_rounded, const Color(0xFF3B82F6), 'Leader', '$leaderCount')),
                              ],
                            ),
                            const SizedBox(height: 20),
                            if (_mockProjects.isEmpty)
                              _buildEmptyState(Icons.folder_shared_rounded, 'Bạn chưa tham gia project nào', 'Project sẽ hiển thị khi bạn được thêm vào nhóm')
                            else
                              ..._mockProjects.map((p) => _buildProjectCard(context, p)),
                          ],
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

  Widget _buildProjectCard(BuildContext context, Map<String, dynamic> project) {
    final isLeader = project['teamLeaderId'] == 'SE123456';
    final memberCount = (project['team'] as List).length;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFF1F5F9)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 6)]),
      child: Column(
        children: [
          Container(height: 4, decoration: const BoxDecoration(borderRadius: BorderRadius.vertical(top: Radius.circular(24)), gradient: LinearGradient(colors: [Color(0xFF14B8A6), Color(0xFF3B82F6)]))),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(project['name'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF1E293B))), const SizedBox(height: 2), Text('${project['course']['name']} · ${project['course']['subject']['code']}', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)))] )),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: isLeader ? const Color(0xFFFFFBEB) : const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(20), border: Border.all(color: isLeader ? const Color(0xFFFEF3C7) : const Color(0xFFE2E8F0))), child: Text(isLeader ? 'Leader' : 'Member', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: isLeader ? const Color(0xFFB45309) : const Color(0xFF475569)))),
                  ],
                ),
                const SizedBox(height: 16),
                GridView.count(
                  crossAxisCount: 2, shrinkWrap: true, crossAxisSpacing: 10, mainAxisSpacing: 10, childAspectRatio: 2.2, physics: const NeverScrollableScrollPhysics(),
                  children: [
                    _infoBox2('Repository', project['repositoryName']),
                    _infoBox2('Jira Project', project['jiraProjectKey']),
                    _infoBox2('Team size', '$memberCount thành viên'),
                    _infoBox2Color('Trạng thái', 'ACTIVE', const Color(0xFF047857)),
                  ],
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8, runSpacing: 8,
                  children: [
                    _outlineBtn('Xem chi tiết', Icons.visibility_rounded, () => context.go('/student/project/${project['id']}')),
                    _primaryBtn('Sync commits', Icons.sync_rounded, () {
                       ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Đã đồng bộ commits cho ${project['name']}'), behavior: SnackBarBehavior.floating, backgroundColor: const Color(0xFF2563EB)));
                    }),
                    _outlineBtn('Nộp SRS', Icons.upload_rounded, () {
                       ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Mở form nộp SRS cho ${project['name']}'), behavior: SnackBarBehavior.floating, backgroundColor: const Color(0xFF0F766E)));
                    }),
                  ],
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoBox2(String label, String value) => Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(16)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))), const SizedBox(height: 4), Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)), maxLines: 1, overflow: TextOverflow.ellipsis)]));
  Widget _infoBox2Color(String label, String value, Color color) => Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(16)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))), const SizedBox(height: 4), Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: color), maxLines: 1, overflow: TextOverflow.ellipsis)]));
}

// 3. Contribution Page
class StudentContributionScreen extends StatelessWidget {
  const StudentContributionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    int totalCommits = 0;
    _mockProjectMetrics.forEach((k, v) {
      final lst = v['studentMetrics'] as List;
      final me = lst.firstWhere((m) => m['studentId'] == 'SE123456', orElse: () => {'commitCount': 0});
      totalCommits += (me['commitCount'] as int);
    });
    final isMobile = MediaQuery.of(context).size.width < 900;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: isMobile ? const StudentDrawer() : null,
      body: SafeArea(
        child: Row(
          children: [
            if (!isMobile) const StudentSidebar(),
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
                    const AppTopHeader(title: 'Đóng góp của tôi', primary: false),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildBreadcrumb(context, 'Đóng góp của tôi'),
                            const SizedBox(height: 16),
                            _buildSectionHeader('Đóng góp của tôi', 'Tổng quan commit và đóng góp cá nhân theo nhóm'),
                            const SizedBox(height: 20),
                            Row(
                              children: [
                                Expanded(child: _buildSummaryCard(Icons.call_split_rounded, const Color(0xFF14B8A6), 'Tổng commits', '$totalCommits')),
                                const SizedBox(width: 12),
                                Expanded(child: _buildSummaryCard(Icons.group_rounded, const Color(0xFF3B82F6), 'Nhóm tham gia', '${_mockProjects.length}')),
                              ],
                            ),
                            const SizedBox(height: 20),
                            if (_mockProjects.isEmpty)
                              _buildEmptyState(Icons.bar_chart_rounded, 'Bạn chưa tham gia nhóm nào', 'Khi có project, contribution sẽ hiển thị')
                            else
                              ..._mockProjects.map((p) => _buildContributionCard(p)),
                          ],
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

  Widget _buildContributionCard(Map<String, dynamic> project) {
    final metrics = _mockProjectMetrics[project['id']];
    if (metrics == null) return const SizedBox();

    final members = project['team'] as List;
    final stdMetrics = metrics['studentMetrics'] as List;
    final maxCommits = (stdMetrics.map((e) => e['commitCount'] as int).reduce(max)).toDouble().clamp(1.0, 1000.0);
    final myCommits = stdMetrics.firstWhere((m) => m['studentId'] == 'SE123456', orElse: () => {'commitCount': 0})['commitCount'];
    final total = metrics['totalCommits'];

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFF1F5F9)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 6)]),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(project['name'], style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))), const SizedBox(height: 2), Text(project['course']['name'], style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)))] )),
                Row(
                  children: [
                    Column(crossAxisAlignment: CrossAxisAlignment.end, children: [Text('$myCommits', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF0F766E))), const Text('My commits', style: TextStyle(fontSize: 9, color: Color(0xFF94A3B8)))]),
                    const SizedBox(width: 12),
                    Column(crossAxisAlignment: CrossAxisAlignment.end, children: [Text('$total', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF334155))), const Text('Total', style: TextStyle(fontSize: 9, color: Color(0xFF94A3B8)))]),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF8FAFC)),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: stdMetrics.map((m) {
                final student = members.firstWhere((s) => s['studentId'] == m['studentId'], orElse: () => {'studentName': 'Unknown'});
                final isMe = m['studentId'] == 'SE123456';
                final p = m['commitCount'] / maxCommits;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    children: [
                      Container(width: 28, height: 28, decoration: BoxDecoration(color: isMe ? const Color(0xFFCCFBF1) : const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(14)), child: Center(child: Text(student['studentName'].toString()[0], style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: isMe ? const Color(0xFF0F766E) : const Color(0xFF475569))))),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(student['studentName'], style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
                                const SizedBox(width: 6),
                                if (isMe) Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: const Color(0xFFF0FDFA), border: Border.all(color: const Color(0xFFCCFBF1)), borderRadius: BorderRadius.circular(10)), child: const Text('Bạn', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w700, color: Color(0xFF0D9488))))
                              ],
                            ),
                            const SizedBox(height: 4),
                            ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(value: p, minHeight: 6, backgroundColor: const Color(0xFFF1F5F9), valueColor: AlwaysStoppedAnimation(isMe ? const Color(0xFF14B8A6) : const Color(0xFFCBD5E1))))
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text('${m['commitCount']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF475569))),
                    ],
                  ),
                );
              }).toList(),
            ),
          )
        ],
      ),
    );
  }
}

// 4. Alerts Page
class StudentAlertsScreen extends StatelessWidget {
  const StudentAlertsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    int highAlerts = _mockAlerts.where((a) => a['severity'] == 'high').length;
    final isMobile = MediaQuery.of(context).size.width < 900;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: isMobile ? const StudentDrawer() : null,
      body: SafeArea(
        child: Row(
          children: [
            if (!isMobile) const StudentSidebar(),
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
                    const AppTopHeader(title: 'Thông báo / Cảnh báo', primary: false),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildBreadcrumb(context, 'Cảnh báo'),
                            const SizedBox(height: 16),
                            _buildSectionHeader('Cảnh báo cá nhân', 'Nhắc nhở từ hệ thống liên quan đến các nhóm'),
                            const SizedBox(height: 20),
                            Row(
                              children: [
                                Expanded(child: _buildSummaryCard(Icons.notifications_active_rounded, const Color(0xFFFB923C), 'Tổng cảnh báo', '${_mockAlerts.length}')),
                                const SizedBox(width: 12),
                                Expanded(child: _buildSummaryCard(Icons.warning_rounded, const Color(0xFFF87171), 'Cần xử lý ngay', '$highAlerts')),
                              ],
                            ),
                            const SizedBox(height: 20),
                            Container(
                              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFF1F5F9)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 6)]),
                              child: _mockAlerts.isEmpty
                                  ? _buildEmptyState(Icons.check_circle_rounded, 'Không có cảnh báo nào!', 'Tất cả nhóm của bạn đang hoạt động tốt')
                                  : Column(
                                      children: _mockAlerts.asMap().entries.map((ent) {
                                        final a = ent.value;
                                        final sev = a['severity'];
                                        Color bg = sev == 'high' ? const Color(0xFFFEF2F2) : (sev == 'medium' ? const Color(0xFFFFF7ED) : const Color(0xFFEFF6FF));
                                        Color border = sev == 'high' ? const Color(0xFFFEE2E2) : (sev == 'medium' ? const Color(0xFFFFEDD5) : const Color(0xFFDBEAFE));
                                        Color iconClr = sev == 'high' ? const Color(0xFFEF4444) : (sev == 'medium' ? const Color(0xFFF97316) : const Color(0xFF3B82F6));
                                        Color txtClr = sev == 'high' ? const Color(0xFF991B1B) : (sev == 'medium' ? const Color(0xFF9A3412) : const Color(0xFF1E40AF));

                                        return Container(
                                          padding: const EdgeInsets.all(16),
                                          decoration: BoxDecoration(color: bg, border: Border(bottom: BorderSide(color: border))),
                                          child: Row(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Icon(Icons.warning_amber_rounded, size: 16, color: iconClr),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(a['groupName'].toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF94A3B8), letterSpacing: 0.5)),
                                                    const SizedBox(height: 4),
                                                    Text(a['message'], style: TextStyle(fontSize: 13, color: txtClr, height: 1.4)),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                        );
                                      }).toList(),
                                    ),
                            ),
                          ],
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

// 5. SRS Page
class StudentSrsScreen extends StatelessWidget {
  const StudentSrsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    Map<String, int> summary = {"SUBMITTED": 0, "UNDER_REVIEW": 0, "NEEDS_REVISION": 0, "APPROVED": 0, "REJECTED": 0};
    for (var list in _mockSrsData.values) {
      for (var s in list) {
        String st = s['status'] ?? "SUBMITTED";
        if (summary.containsKey(st)) summary[st] = summary[st]! + 1;
      }
    }
    final isMobile = MediaQuery.of(context).size.width < 900;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: isMobile ? const StudentDrawer() : null,
      body: SafeArea(
        child: Row(
          children: [
            if (!isMobile) const StudentSidebar(),
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
                    const AppTopHeader(title: 'SRS', primary: false),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildBreadcrumb(context, 'SRS Reports'),
                            const SizedBox(height: 16),
                            _buildSectionHeader('SRS Reports của nhóm', 'Xem lịch sử nộp SRS và phản hồi từ admin'),
                            const SizedBox(height: 20),
                            SizedBox(
                              height: 70,
                              child: ListView(
                                scrollDirection: Axis.horizontal,
                                children: summary.entries.map((e) {
                                  return Container(
                                    margin: const EdgeInsets.only(right: 12),
                                    padding: const EdgeInsets.symmetric(horizontal: 16),
                                    decoration: BoxDecoration(
                                      color: _srsStatusBgColors[e.key],
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: (_srsStatusColors[e.key] ?? const Color(0xFF64748B)).withValues(alpha: 0.2)),
                                    ),
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(e.key, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: _srsStatusColors[e.key])),
                                        const SizedBox(height: 2),
                                        Text('${e.value}', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: _srsStatusColors[e.key])),
                                      ],
                                    ),
                                  );
                                }).toList(),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Align(
                              alignment: Alignment.centerRight,
                              child: _primaryBtn('Nộp SRS mới', Icons.upload_rounded, () {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mở form nộp SRS mới'), behavior: SnackBarBehavior.floating, backgroundColor: Color(0xFF2563EB)));
                              }),
                            ),
                            const SizedBox(height: 16),
                            Container(
                              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFF1F5F9)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 6)]),
                              child: _mockProjects.isEmpty
                                  ? _buildEmptyState(Icons.menu_book_rounded, 'Nhóm chưa có SRS nào được nộp', 'Khi có file SRS, danh sách sẽ hiển thị ở đây')
                                  : Column(
                                      children: _mockProjects.expand((p) {
                                        final srsList = _mockSrsData[p['id']] ?? [];
                                        if ((srsList as List).isEmpty) return [const SizedBox()];
                                        return srsList.map((rpt) => Container(
                                          padding: const EdgeInsets.all(16),
                                          decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF8FAFC)))),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Row(
                                                children: [
                                                  Text('v${rpt['version']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, fontFamily: 'monospace', color: Color(0xFF334155))),
                                                  const SizedBox(width: 8),
                                                  Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: _srsStatusBgColors[rpt['status']] ?? Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: (_srsStatusColors[rpt['status']] ?? const Color(0xFF64748B)).withValues(alpha: 0.2))), child: Text(rpt['status'] ?? '', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: _srsStatusColors[rpt['status']] ?? const Color(0xFF64748B)))),
                                                  const SizedBox(width: 8),
                                                  Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFE2E8F0))), child: Text(rpt['receiver'] ?? 'Admin', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Color(0xFF475569)))),
                                                ],
                                              ),
                                              const SizedBox(height: 6),
                                              Text('${p['name']} · ${p['course']['name']}', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                                              if (rpt['feedback'] != null) ...[
                                                const SizedBox(height: 4),
                                                Text('Phản hồi admin: ${rpt['feedback']}', style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Color(0xFF2563EB))),
                                              ],
                                              const SizedBox(height: 10),
                                              Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Row(
                                                    children: [
                                                      const Icon(Icons.access_time, size: 10, color: Color(0xFF94A3B8)),
                                                      const SizedBox(width: 4),
                                                      Text(rpt['submittedAt'].toString().split('T')[0], style: const TextStyle(fontSize: 9, color: Color(0xFF94A3B8))),
                                                    ],
                                                  ),
                                                  Row(
                                                    children: [
                                                      _textBtn('Tải file', Icons.download_rounded, const Color(0xFF0D9488), () {}),
                                                      const SizedBox(width: 12),
                                                      _textBtn('Xem', Icons.visibility_rounded, const Color(0xFF2563EB), () {}),
                                                      const SizedBox(width: 12),
                                                      _textBtn('Nộp lại', Icons.upload_rounded, const Color(0xFFEA580C), () {}),
                                                    ],
                                                  )
                                                ],
                                              )
                                            ],
                                          ),
                                        )).toList();
                                      }).toList(),
                                    ),
                            ),
                          ],
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

  Widget _textBtn(String label, IconData icon, Color color, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Row(
          children: [
            Icon(icon, size: 10, color: color),
            const SizedBox(width: 4),
            Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color)),
          ],
        ),
      );
}

// ───────────────────────── COMMON BUTTONS ─────────────────────────

Widget _outlineBtn(String label, IconData icon, VoidCallback onTap) => GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
        child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(icon, size: 14, color: const Color(0xFF64748B)), const SizedBox(width: 6), Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)))]),
      ),
    );

Widget _primaryBtn(String label, IconData icon, VoidCallback onTap) => GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(color: const Color(0xFF2563EB), borderRadius: BorderRadius.circular(12)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [Icon(icon, size: 14, color: Colors.white), const SizedBox(width: 6), Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white))]),
      ),
    );
