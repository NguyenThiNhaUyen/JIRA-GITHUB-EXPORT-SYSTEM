// Lecturer Dashboard Screen
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/mock_data.dart';
import '../../widgets/app_top_header.dart';

class LecturerDashboardScreen extends StatefulWidget {
  const LecturerDashboardScreen({super.key});

  @override
  State<LecturerDashboardScreen> createState() =>
      _LecturerDashboardScreenState();
}

class _LecturerDashboardScreenState extends State<LecturerDashboardScreen> {
  static const Color bgColor = Color(0xFFF0FDF4);
  static const Color cardBorder = Color(0xFFE2E8F0);
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color teal = Color(0xFF0F766E);

  // Mock data
  static final List<Map<String, dynamic>> _groups = [
    {
      'id': '1',
      'name': 'Team Alpha',
      'topic': 'AI Interview System',
      'course': 'SWD392',
      'members': 4,
      'githubStatus': 'APPROVED',
      'jiraStatus': 'APPROVED',
      'commits': 145,
      'lastActive': '2 giờ trước',
    },
    {
      'id': '2',
      'name': 'Team Beta',
      'topic': 'Job Matching Platform',
      'course': 'SWD392',
      'members': 3,
      'githubStatus': 'PENDING',
      'jiraStatus': 'APPROVED',
      'commits': 32,
      'lastActive': '1 ngày trước',
    },
    {
      'id': '3',
      'name': 'Team Gamma',
      'topic': 'Smart Resume Analyzer',
      'course': 'PRJ301',
      'members': 5,
      'githubStatus': 'APPROVED',
      'jiraStatus': 'PENDING',
      'commits': 88,
      'lastActive': '3 giờ trước',
    },
    {
      'id': '4',
      'name': 'Team Delta',
      'topic': 'E-learning Platform',
      'course': 'PRJ301',
      'members': 4,
      'githubStatus': 'MISSING',
      'jiraStatus': 'MISSING',
      'commits': 0,
      'lastActive': '7 ngày trước',
    },
  ];

  static final List<Map<String, dynamic>> _recentActivities = [
    {
      'icon': Icons.folder_open_outlined,
      'color': const Color(0xFF14B8A6),
      'bg': const Color(0xFFF0FDFA),
      'msg': 'Team Alpha đã submit GitHub repo',
      'time': '5 phút trước',
    },
    {
      'icon': Icons.task_alt,
      'color': const Color(0xFF3B82F6),
      'bg': const Color(0xFFEFF6FF),
      'msg': 'Team Beta kết nối Jira project',
      'time': '1 giờ trước',
    },
    {
      'icon': Icons.description_outlined,
      'color': const Color(0xFF6366F1),
      'bg': const Color(0xFFEEF2FF),
      'msg': 'SRS Draft từ Team Gamma đang chờ review',
      'time': '3 giờ trước',
    },
    {
      'icon': Icons.warning_amber_rounded,
      'color': const Color(0xFFF59E0B),
      'bg': const Color(0xFFFFFBEB),
      'msg': 'Team Delta chưa kết nối repository',
      'time': 'Hôm qua',
    },
  ];

  String _selectedCourse = 'all';

  List<Map<String, dynamic>> get _filteredGroups => _selectedCourse == 'all'
      ? _groups
      : _groups.where((g) => g['course'] == _selectedCourse).toList();

  @override
  Widget build(BuildContext context) {
    final courses = MockData.getLecturerCourses();
    final totalGroups = _groups.length;
    final githubApproved =
        _groups.where((g) => g['githubStatus'] == 'APPROVED').length;
    final jiraApproved =
        _groups.where((g) => g['jiraStatus'] == 'APPROVED').length;
    final needAttention = _groups
        .where((g) =>
            g['githubStatus'] != 'APPROVED' || g['jiraStatus'] != 'APPROVED')
        .length;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: const AppTopHeader(
        title: 'Tổng quan Giảng viên',
        user: AppUser(name: 'Nguyễn Văn Nam', email: 'namnv@fe.edu.vn', role: 'LECTURER'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome card
            _buildWelcomeCard(),
            const SizedBox(height: 16),

            // Stats Row
            _buildStatsRow(
                totalGroups, githubApproved, jiraApproved, needAttention),
            const SizedBox(height: 16),

            // Filter
            _buildCourseFilter(courses),
            const SizedBox(height: 16),

            // Groups list
            _buildGroupsList(),
            const SizedBox(height: 16),

            // Recent activities
            _buildRecentActivities(),
            const SizedBox(height: 16),

            // Quick actions
            _buildQuickActions(),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF0F766E), Color(0xFF14B8A6)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F766E).withOpacity(0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(
              Icons.person_outline_rounded,
              color: Colors.white,
              size: 28,
            ),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Nguyễn Văn Nam 👋',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'namngv@fpt.edu.vn · LECTURER',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => context.go('/lecturer/groups'),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'Quản lý',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow(
      int total, int github, int jira, int needAttention) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 2.2,
      children: [
        _buildStatCard('Tổng nhóm', '$total', Icons.groups_outlined,
            const Color(0xFF3B82F6)),
        _buildStatCard('GitHub ✓', '$github', Icons.folder_outlined,
            const Color(0xFF10B981)),
        _buildStatCard('Jira ✓', '$jira', Icons.task_alt_outlined,
            const Color(0xFF6366F1)),
        _buildStatCard('Cần xem', '$needAttention',
            Icons.warning_amber_rounded, const Color(0xFFF59E0B)),
      ],
    );
  }

  Widget _buildStatCard(
      String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: textPrimary,
                ),
              ),
              Text(
                label,
                style: const TextStyle(fontSize: 11, color: textSecondary),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCourseFilter(List courses) {
    final courseOptions = [
      {'code': 'all', 'name': 'Tất cả lớp'},
      ...courses.map((c) => {'code': c.code, 'name': c.name}),
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Bộ lọc lớp học',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: textPrimary,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: courseOptions.map((c) {
              final isSelected = _selectedCourse == c['code'];
              return GestureDetector(
                onTap: () =>
                    setState(() => _selectedCourse = c['code'] as String),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? teal
                        : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected ? teal : cardBorder,
                    ),
                  ),
                  child: Text(
                    c['code'] == 'all' ? 'Tất cả' : c['code'] as String,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isSelected ? Colors.white : textSecondary,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildGroupsList() {
    final groups = _filteredGroups;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              children: [
                const Text(
                  'Danh sách nhóm',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: textPrimary,
                  ),
                ),
                const Spacer(),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${groups.length} nhóm',
                    style: const TextStyle(
                        fontSize: 11, color: textSecondary),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: cardBorder),
          if (groups.isEmpty)
            const Padding(
              padding: EdgeInsets.all(24),
              child: Center(
                child: Text(
                  'Không có nhóm nào',
                  style: TextStyle(color: textSecondary),
                ),
              ),
            )
          else
            ...groups.map((g) => _buildGroupItem(g)),
        ],
      ),
    );
  }

  Widget _buildGroupItem(Map<String, dynamic> g) {
    final githubOk = g['githubStatus'] == 'APPROVED';
    final jiraOk = g['jiraStatus'] == 'APPROVED';
    final hasPending = g['githubStatus'] == 'PENDING' ||
        g['jiraStatus'] == 'PENDING';
    final hasMissing = g['githubStatus'] == 'MISSING' ||
        g['jiraStatus'] == 'MISSING';

    Color statusColor;
    String statusText;
    if (!githubOk || !jiraOk) {
      if (hasMissing) {
        statusColor = const Color(0xFFEF4444);
        statusText = 'Thiếu kết nối';
      } else {
        statusColor = const Color(0xFFF59E0B);
        statusText = 'Chờ duyệt';
      }
    } else {
      statusColor = const Color(0xFF10B981);
      statusText = 'Hoàn chỉnh';
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: cardBorder)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  teal.withOpacity(0.8),
                  const Color(0xFF14B8A6),
                ],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.groups_outlined,
                color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      g['name'] as String,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        statusText,
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                          color: statusColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  g['topic'] as String,
                  style: const TextStyle(
                      fontSize: 11, color: textSecondary),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    _buildIntegrationBadge(
                        'GitHub', githubOk, g['githubStatus'] as String),
                    const SizedBox(width: 6),
                    _buildIntegrationBadge(
                        'Jira', jiraOk, g['jiraStatus'] as String),
                    const SizedBox(width: 6),
                    Icon(Icons.commit, size: 10, color: Colors.grey.shade400),
                    const SizedBox(width: 2),
                    Text(
                      '${g['commits']} commits',
                      style: const TextStyle(
                          fontSize: 10, color: textSecondary),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Text(
            g['lastActive'] as String,
            style: const TextStyle(fontSize: 10, color: textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildIntegrationBadge(String label, bool ok, String status) {
    Color color;
    if (ok) {
      color = const Color(0xFF10B981);
    } else if (status == 'PENDING') {
      color = const Color(0xFFF59E0B);
    } else {
      color = const Color(0xFFEF4444);
    }

    IconData icon;
    if (ok) {
      icon = Icons.check_circle_outline;
    } else if (status == 'PENDING') {
      icon = Icons.schedule_outlined;
    } else {
      icon = Icons.cancel_outlined;
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 10, color: color),
        const SizedBox(width: 2),
        Text(
          label,
          style: TextStyle(fontSize: 9, color: color, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }

  Widget _buildRecentActivities() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Hoạt động gần đây',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          ..._recentActivities.map((a) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: a['bg'] as Color,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        a['icon'] as IconData,
                        color: a['color'] as Color,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            a['msg'] as String,
                            style: const TextStyle(
                              fontSize: 12,
                              color: textPrimary,
                            ),
                          ),
                          Text(
                            a['time'] as String,
                            style: const TextStyle(
                                fontSize: 10, color: textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Truy cập nhanh',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildActionButton(
                  'Quản lý nhóm',
                  Icons.groups_2_outlined,
                  const Color(0xFF0F766E),
                  () => context.go('/lecturer/groups'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildActionButton(
                  'Danh sách lớp',
                  Icons.menu_book_outlined,
                  const Color(0xFF3B82F6),
                  () {},
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(
      String label, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
