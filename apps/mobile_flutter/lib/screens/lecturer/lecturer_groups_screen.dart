// Lecturer Groups Management Screen
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';

class LecturerGroupsScreen extends StatefulWidget {
  const LecturerGroupsScreen({super.key});

  @override
  State<LecturerGroupsScreen> createState() => _LecturerGroupsScreenState();
}

class _LecturerGroupsScreenState extends State<LecturerGroupsScreen> {
  static const Color bgColor = Color(0xFFF0FDF4);
  static const Color cardBorder = Color(0xFFE2E8F0);
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color teal = Color(0xFF0F766E);

  String _searchQuery = '';
  String _courseFilter = 'all';
  String _statusFilter = 'all';

  static final List<Map<String, dynamic>> _groups = [
    {
      'id': '1',
      'name': 'Team Alpha',
      'topic': 'AI Interview System',
      'course': 'SWD392',
      'courseClass': 'SE1830',
      'members': [
        {'name': 'Nguyễn Văn An', 'code': 'SE161234'},
        {'name': 'Trần Thị Bình', 'code': 'SE161235'},
        {'name': 'Lê Văn Chi', 'code': 'SE161236'},
        {'name': 'Phạm Thị Dung', 'code': 'SE161237'},
      ],
      'githubUrl': 'https://github.com/team-alpha/ai-interview',
      'jiraUrl': 'https://alpha.atlassian.net/jira',
      'githubStatus': 'APPROVED',
      'jiraStatus': 'APPROVED',
      'commits': 145,
      'issues': 23,
      'lastActive': '2 giờ trước',
      'srsVersion': 'v2.1',
    },
    {
      'id': '2',
      'name': 'Team Beta',
      'topic': 'Job Matching Platform',
      'course': 'SWD392',
      'courseClass': 'SE1830',
      'members': [
        {'name': 'Hoàng Văn Em', 'code': 'SE161238'},
        {'name': 'Ngô Thị Phượng', 'code': 'SE161239'},
        {'name': 'Võ Văn Giang', 'code': 'SE161240'},
      ],
      'githubUrl': 'https://github.com/team-beta/job-match',
      'jiraUrl': 'https://beta.atlassian.net/jira',
      'githubStatus': 'PENDING',
      'jiraStatus': 'APPROVED',
      'commits': 32,
      'issues': 15,
      'lastActive': '1 ngày trước',
      'srsVersion': 'v1.0',
    },
    {
      'id': '3',
      'name': 'Team Gamma',
      'topic': 'Smart Resume Analyzer',
      'course': 'PRJ301',
      'courseClass': 'SE1825',
      'members': [
        {'name': 'Đinh Thị Hoa', 'code': 'SE161241'},
        {'name': 'Bùi Văn Ích', 'code': 'SE161242'},
        {'name': 'Đỗ Thị Kim', 'code': 'SE161243'},
        {'name': 'Lý Văn Long', 'code': 'SE161244'},
        {'name': 'Cao Thị Mai', 'code': 'SE161245'},
      ],
      'githubUrl': 'https://github.com/team-gamma/resume',
      'jiraUrl': 'https://gamma.atlassian.net/jira',
      'githubStatus': 'APPROVED',
      'jiraStatus': 'PENDING',
      'commits': 88,
      'issues': 31,
      'lastActive': '3 giờ trước',
      'srsVersion': 'v1.5',
    },
    {
      'id': '4',
      'name': 'Team Delta',
      'topic': 'E-learning Platform',
      'course': 'PRJ301',
      'courseClass': 'SE1825',
      'members': [
        {'name': 'Phan Văn Nam', 'code': 'SE161246'},
        {'name': 'Tô Thị Oanh', 'code': 'SE161247'},
        {'name': 'Hồ Văn Phong', 'code': 'SE161248'},
        {'name': 'Lưu Thị Quỳnh', 'code': 'SE161249'},
      ],
      'githubUrl': '',
      'jiraUrl': '',
      'githubStatus': 'MISSING',
      'jiraStatus': 'MISSING',
      'commits': 0,
      'issues': 0,
      'lastActive': '7 ngày trước',
      'srsVersion': 'Chưa có',
    },
  ];

  List<Map<String, dynamic>> get _filteredGroups {
    return _groups.where((g) {
      final matchSearch = _searchQuery.isEmpty ||
          (g['name'] as String)
              .toLowerCase()
              .contains(_searchQuery.toLowerCase()) ||
          (g['topic'] as String)
              .toLowerCase()
              .contains(_searchQuery.toLowerCase());
      final matchCourse =
          _courseFilter == 'all' || g['course'] == _courseFilter;
      final matchStatus = _statusFilter == 'all' ||
          (_statusFilter == 'ok' &&
              g['githubStatus'] == 'APPROVED' &&
              g['jiraStatus'] == 'APPROVED') ||
          (_statusFilter == 'pending' &&
              (g['githubStatus'] == 'PENDING' ||
                  g['jiraStatus'] == 'PENDING')) ||
          (_statusFilter == 'missing' &&
              (g['githubStatus'] == 'MISSING' ||
                  g['jiraStatus'] == 'MISSING'));
      return matchSearch && matchCourse && matchStatus;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgColor,
      appBar: const AppTopHeader(
        title: 'Quản lý nhóm',
        showBack: true,
        backPath: '/lecturer',
        user: AppUser(name: 'Nguyễn Văn Nam', email: 'namnv@fe.edu.vn', role: 'LECTURER'),
      ),
      body: Column(
        children: [
          // Search + filter
          _buildFilters(),
          // Groups list
          Expanded(
            child: _filteredGroups.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                    itemCount: _filteredGroups.length,
                    itemBuilder: (context, i) =>
                        _buildGroupCard(_filteredGroups[i]),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Column(
        children: [
          // Search bar
          TextField(
            onChanged: (v) => setState(() => _searchQuery = v),
            decoration: InputDecoration(
              hintText: 'Tìm tên nhóm, đề tài...',
              hintStyle: const TextStyle(color: textSecondary, fontSize: 13),
              prefixIcon:
                  const Icon(Icons.search_rounded, color: textSecondary),
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 0),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: cardBorder),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: cardBorder),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildDropdown(
                  value: _courseFilter,
                  items: const {
                    'all': 'Tất cả môn',
                    'SWD392': 'SWD392',
                    'PRJ301': 'PRJ301'
                  },
                  onChanged: (v) => setState(() => _courseFilter = v!),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildDropdown(
                  value: _statusFilter,
                  items: const {
                    'all': 'Tất cả trạng thái',
                    'ok': '✅ Hoàn chỉnh',
                    'pending': '⏳ Chờ duyệt',
                    'missing': '❌ Thiếu kết nối'
                  },
                  onChanged: (v) => setState(() => _statusFilter = v!),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDropdown({
    required String value,
    required Map<String, String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      onChanged: onChanged,
      isDense: true,
      decoration: InputDecoration(
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: cardBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: cardBorder),
        ),
      ),
      items: items.entries
          .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value, style: const TextStyle(fontSize: 12))))
          .toList(),
    );
  }

  Widget _buildGroupCard(Map<String, dynamic> g) {
    final githubOk = g['githubStatus'] == 'APPROVED';
    final jiraOk = g['jiraStatus'] == 'APPROVED';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
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
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 0),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [teal.withOpacity(0.8), const Color(0xFF14B8A6)],
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.groups_2_outlined,
                      color: Colors.white, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        g['name'] as String,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                          color: textPrimary,
                        ),
                      ),
                      Text(
                        g['topic'] as String,
                        style: const TextStyle(
                          fontSize: 11,
                          color: textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    g['course'] as String,
                    style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: textSecondary),
                  ),
                ),
              ],
            ),
          ),

          // Stats row
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 0),
            child: Row(
              children: [
                _buildMiniStat(
                    Icons.people_outline, '${(g['members'] as List).length}', 'SV'),
                const SizedBox(width: 16),
                _buildMiniStat(Icons.commit, '${g['commits']}', 'Commits'),
                const SizedBox(width: 16),
                _buildMiniStat(Icons.task_alt_outlined, '${g['issues']}', 'Issues'),
                const SizedBox(width: 16),
                _buildMiniStat(
                    Icons.description_outlined, g['srsVersion'] as String, 'SRS'),
              ],
            ),
          ),

          // Integration status
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
            child: Row(
              children: [
                _buildStatusBadge('GitHub', g['githubStatus'] as String),
                const SizedBox(width: 8),
                _buildStatusBadge('Jira', g['jiraStatus'] as String),
                const Spacer(),
                Text(
                  g['lastActive'] as String,
                  style: const TextStyle(fontSize: 10, color: textSecondary),
                ),
              ],
            ),
          ),

          // Action buttons
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Expanded(
                  child: _buildActionBtn(
                    'Xem thành viên',
                    Icons.people_outline,
                    const Color(0xFF6366F1),
                    () => _showMembersDialog(context, g),
                  ),
                ),
                if (!githubOk || !jiraOk) ...[
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildActionBtn(
                      g['githubStatus'] == 'PENDING' ||
                              g['jiraStatus'] == 'PENDING'
                          ? 'Duyệt tích hợp'
                          : 'Nhắc nhở',
                      g['githubStatus'] == 'PENDING' ||
                              g['jiraStatus'] == 'PENDING'
                          ? Icons.check_circle_outline
                          : Icons.notifications_outlined,
                      g['githubStatus'] == 'PENDING' ||
                              g['jiraStatus'] == 'PENDING'
                          ? const Color(0xFF10B981)
                          : const Color(0xFFF59E0B),
                      () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              g['githubStatus'] == 'PENDING' ||
                                      g['jiraStatus'] == 'PENDING'
                                  ? 'Đã duyệt tích hợp cho ${g['name']}'
                                  : 'Đã gửi nhắc nhở đến ${g['name']}',
                            ),
                            backgroundColor: teal,
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStat(IconData icon, String value, String label) {
    return Column(
      children: [
        Row(
          children: [
            Icon(icon, size: 11, color: textSecondary),
            const SizedBox(width: 3),
            Text(
              value,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: textPrimary,
              ),
            ),
          ],
        ),
        Text(label, style: const TextStyle(fontSize: 9, color: textSecondary)),
      ],
    );
  }

  Widget _buildStatusBadge(String label, String status) {
    Color color;
    IconData icon;

    switch (status) {
      case 'APPROVED':
        color = const Color(0xFF10B981);
        icon = Icons.check_circle_outline;
        break;
      case 'PENDING':
        color = const Color(0xFFF59E0B);
        icon = Icons.schedule_outlined;
        break;
      default:
        color = const Color(0xFFEF4444);
        icon = Icons.cancel_outlined;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 10, color: color),
          const SizedBox(width: 3),
          Text(
            label,
            style: TextStyle(
                fontSize: 10, color: color, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildActionBtn(
      String label, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 5),
            Text(
              label,
              style: TextStyle(
                  fontSize: 11, fontWeight: FontWeight.w600, color: color),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(24),
            ),
            child: const Icon(Icons.groups_2_outlined,
                size: 36, color: Color(0xFF14B8A6)),
          ),
          const SizedBox(height: 16),
          const Text(
            'Không có nhóm nào',
            style: TextStyle(
                fontSize: 16, fontWeight: FontWeight.w600, color: textPrimary),
          ),
          const SizedBox(height: 6),
          const Text(
            'Thử thay đổi bộ lọc',
            style: TextStyle(fontSize: 13, color: textSecondary),
          ),
        ],
      ),
    );
  }

  void _showMembersDialog(BuildContext context, Map<String, dynamic> g) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.55,
        builder: (_, controller) => Column(
          children: [
            const SizedBox(height: 8),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Row(
                children: [
                  const Icon(Icons.people_outline, color: teal),
                  const SizedBox(width: 8),
                  Text(
                    '${g['name']} · Thành viên',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            const Divider(),
            Expanded(
              child: ListView.builder(
                controller: controller,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: (g['members'] as List).length,
                itemBuilder: (_, i) {
                  final m = (g['members'] as List)[i] as Map<String, dynamic>;
                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: CircleAvatar(
                      backgroundColor: teal.withOpacity(0.1),
                      child: Text(
                        m['name'].toString().split(' ').last[0],
                        style: const TextStyle(
                            color: teal, fontWeight: FontWeight.w700),
                      ),
                    ),
                    title: Text(m['name'] as String,
                        style: const TextStyle(
                            fontSize: 13, fontWeight: FontWeight.w600)),
                    subtitle: Text(m['code'] as String,
                        style: const TextStyle(fontSize: 11)),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
