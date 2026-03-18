import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../services/student_service.dart';
import '../../../services/auth_service.dart';
import '../../../models/user.dart';

class StudentProjectScreen extends StatefulWidget {
  final String? projectId;
  const StudentProjectScreen({super.key, this.projectId});

  @override
  State<StudentProjectScreen> createState() => _StudentProjectScreenState();
}

class _StudentProjectScreenState extends State<StudentProjectScreen>
    with SingleTickerProviderStateMixin {
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color cardBorder = Color(0xFFE2E8F0);

  final StudentService _studentService = StudentService();
  final AuthService _authService = AuthService();

  late TabController _tabController;
  bool _isLoading = true;
  User? _currentUser;
  Map<String, dynamic> _project = {};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final user = await _authService.getCurrentUser();
      final projects = await _studentService.getMyProjects();
      
      // Find the specific project by ID
      final target = projects.firstWhere(
        (p) => p['id'].toString() == widget.projectId || p['projectId'].toString() == widget.projectId,
        orElse: () => projects.isNotEmpty ? projects[0] : <String, dynamic>{},
      );

      setState(() {
        _currentUser = user;
        _project = target;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8FAFC),
        body: Center(child: CircularProgressIndicator(color: Color(0xFF0F766E))),
      );
    }

    if (_project.isEmpty) {
       return Scaffold(
         appBar: AppBar(title: const Text('Project không tồn tại')),
         body: const Center(child: Text('Không tìm thấy thông tin project này.')),
       );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: NestedScrollView(
        headerSliverBuilder: (context, _) => [
          _buildSliverAppBar(),
        ],
        body: Column(
          children: [
            _buildTabBar(),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildOverviewTab(),
                  _buildTasksTab(),
                  _buildTeamTab(),
                  _buildSrsTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSliverAppBar() {
    return SliverAppBar(
      expandedHeight: 200,
      floating: false,
      pinned: true,
      backgroundColor: Colors.white,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded,
            color: textPrimary, size: 18),
        onPressed: () => context.go('/student'),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.ios_share_outlined, color: textPrimary),
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Export báo cáo project thành công'),
                backgroundColor: Color(0xFF10B981),
              ),
            );
          },
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          padding: const EdgeInsets.fromLTRB(16, 90, 16, 16),
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Badges
              Row(
                children: [
                  _buildBadge(_project['role']?.toString() ?? 'MEMBER', Colors.blue),
                  const SizedBox(width: 6),
                  _buildBadge(
                      _project['courseCode']?.toString() ?? 'Course', Colors.purple),
                  const SizedBox(width: 6),
                  _buildBadge(_project['status']?.toString() ?? 'ACTIVE', Colors.green),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                _project['title']?.toString() ?? _project['name']?.toString() ?? '',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                _project['groupName']?.toString() ?? '',
                style: const TextStyle(
                  color: Colors.white60,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBadge(String text, MaterialColor color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color.shade200,
          fontSize: 9,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildTabBar() {
    final bool isLeader = _project['role']?.toString().toUpperCase() == 'LEADER' || _project['isLeader'] == true;
    return Container(
      color: Colors.white,
      child: TabBar(
        controller: _tabController,
        labelColor: const Color(0xFF0F766E),
        unselectedLabelColor: textSecondary,
        indicatorColor: const Color(0xFF0F766E),
        indicatorWeight: 2,
        labelStyle:
            const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
        tabs: const [
          Tab(text: 'Tổng quan'),
          Tab(text: 'Tasks'),
          Tab(text: 'Team'),
          Tab(text: 'SRS'),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    final weeklyCommits = (_project['weeklyCommits'] as List?)?.cast<int>() ?? [0,0,0,0,0,0,0];
    final weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    final milestones = (_project['milestones'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final teamMembers = (_project['team'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    
    final maxCommit = weeklyCommits.isEmpty ? 0 : weeklyCommits.reduce((a, b) => a > b ? a : b);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Stats
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 2.2,
            children: [
              _buildStatCard('Commits', '${_project['commits']}',
                  Icons.commit, const Color(0xFF3B82F6)),
              _buildStatCard(
                  'Issues Done',
                  '${_project['issuesDone']}',
                  Icons.task_alt_outlined,
                  const Color(0xFF10B981)),
              _buildStatCard(
                  'PRs Merged',
                  '${_project['prsMerged']}',
                  Icons.merge_outlined,
                  const Color(0xFF6366F1)),
              _buildStatCard(
                  'Đóng góp',
                  '${_project['myContribution']}%',
                  Icons.pie_chart_outline,
                  const Color(0xFFF59E0B)),
            ],
          ),
          const SizedBox(height: 16),

          // Milestones
          _buildCard(
            title: 'Milestones',
            child: milestones.isEmpty
              ? const Padding(padding: EdgeInsets.all(20), child: Center(child: Text('Chưa có milestones', style: TextStyle(fontSize: 12, color: textSecondary))))
              : Column(
                  children: milestones.map((m) => _buildMilestoneItem(m)).toList(),
                ),
          ),
          const SizedBox(height: 16),

          // Commit chart
          _buildCard(
            title: 'Weekly Commit Activity',
            child: SizedBox(
              height: 140,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: List.generate(weeklyCommits.length, (i) {
                  final h = maxCommit == 0
                      ? 0.0
                      : (weeklyCommits[i] / maxCommit) * 110.0 + 10;
                  return Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          '${weeklyCommits[i]}',
                          style: const TextStyle(
                              fontSize: 9, color: textSecondary),
                        ),
                        const SizedBox(height: 3),
                        Container(
                          height: h,
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              begin: Alignment.bottomCenter,
                              end: Alignment.topCenter,
                              colors: [
                                Color(0xFF0F766E),
                                Color(0xFF14B8A6)
                              ],
                            ),
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          i < weekDays.length ? weekDays[i] : '',
                          style: const TextStyle(
                              fontSize: 9, color: textSecondary),
                        ),
                      ],
                    ),
                  );
                }),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Project info
          _buildCard(
            title: 'Thông tin project',
            child: Column(
              children: [
                _buildInfoRow('Sprint completion',
                    '${_project['sprintCompletion'] ?? 0}%'),
                _buildInfoRow('Open issues', '${_project['openIssues'] ?? 0}'),
                _buildInfoRow('Team size', '${teamMembers.length}'),
                _buildInfoRow('Repository', _project['repository']?.toString() ?? '—'),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children:
                      ((_project['techStack'] as List?)?.cast<String>() ?? []).map((t) {
                    return Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: cardBorder),
                      ),
                      child: Text(t,
                          style: const TextStyle(
                              fontSize: 10, color: textPrimary)),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Quick actions
          _buildCard(
            title: 'Thao tác nhanh',
            child: Column(
              children: [
                _buildActionButton(
                  'Sync Commits',
                  Icons.sync_rounded,
                  const Color(0xFF3B82F6),
                  _handleSyncCommits,
                ),
                if (_project['role']?.toString().toUpperCase() == 'LEADER') ...[
                  const SizedBox(height: 8),
                  _buildActionButton(
                    'Cập nhật Integrations',
                    Icons.settings_input_component_rounded,
                    const Color(0xFF0F766E),
                    _handleUpdateIntegrations,
                  ),
                ],
                const SizedBox(height: 8),
                _buildActionButton(
                  'Upload SRS',
                  Icons.upload_file_outlined,
                  const Color(0xFF6366F1),
                  () => context.go('/student/srs'),
                ),
                const SizedBox(height: 8),
                _buildActionButton(
                  'Open GitHub Repo',
                  Icons.open_in_new_rounded,
                  const Color(0xFF0F766E),
                  () => ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content:
                          Text('Mở repo: ${_project['repository']}'),
                      backgroundColor: const Color(0xFF10B981),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleSyncCommits() async {
    final ok = await _studentService.syncCommits(_project['id']);
    if (ok) {
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã yêu cầu đồng bộ commits thành công!'), backgroundColor: Color(0xFF10B981)));
       _loadData();
    }
  }

  Future<void> _handleUpdateIntegrations() async {
    // Show dialog to enter Github & Jira links
    final ok = await _studentService.updateIntegrations(_project['id'], {
      "githubRepo": _project['repository'],
      "jiraProject": _project['jiraKey'] ?? "PROJ",
    });
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cập nhật liên kết tích hợp thành công!'), backgroundColor: Color(0xFF10B981)));
    }
  }

  Widget _buildTasksTab() {
    final personalTasks = (_project['tasks'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    if (personalTasks.isEmpty) return const Center(child: Text('Chưa có task nào'));
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: personalTasks.length,
      itemBuilder: (context, i) {
        final task = personalTasks[i];
        Color statusColor;
        switch (task['status'] as String) {
          case 'Done':
            statusColor = const Color(0xFF10B981);
            break;
          case 'In Progress':
            statusColor = const Color(0xFF3B82F6);
            break;
          default:
            statusColor = textSecondary;
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      task['key']?.toString() ?? 'Task',
                      style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: textPrimary),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      task['status']?.toString() ?? 'Open',
                      style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: statusColor),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFFBEB),
                      borderRadius: BorderRadius.circular(6),
                      border:
                          Border.all(color: const Color(0xFFFCD34D)),
                    ),
                    child: Text(
                      task['priority']?.toString() ?? 'Normal',
                      style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF92400E)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                task['title'] as String,
                style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: textPrimary),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.calendar_today_outlined,
                      size: 11, color: textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    'Due: ${task['due'] ?? '—'}',
                    style: const TextStyle(
                        fontSize: 11, color: textSecondary),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTeamTab() {
    final teamMembers = (_project['team'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final bool isLeader = _project['role']?.toString().toUpperCase() == 'LEADER';
    
    if (teamMembers.isEmpty) return const Center(child: Text('Chưa có thông tin team'));
    return Column(
      children: [
        if (isLeader)
          Padding(
            padding: const EdgeInsets.all(16),
            child: _buildActionButton('Mời thành viên mới', Icons.person_add_rounded, const Color(0xFF0F766E), _handleInviteMember),
          ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: teamMembers.length,
            itemBuilder: (context, i) {
              final m = teamMembers[i];
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: cardBorder),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            const Color(0xFF0F766E).withValues(alpha: 0.8),
                            const Color(0xFF14B8A6),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Center(
                        child: Text(
                          '#${i + 1}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            m['studentName']?.toString() ?? m['name']?.toString() ?? '',
                            style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                                color: textPrimary),
                          ),
                          Text(
                            m['role']?.toString() ?? '',
                            style: const TextStyle(
                                fontSize: 11, color: textSecondary),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Row(
                          children: [
                            _buildMiniMetric('${m['commits'] ?? 0}', 'Commits'),
                            const SizedBox(width: 12),
                            _buildMiniMetric('${m['issuesDone'] ?? 0}', 'Issues'),
                            const SizedBox(width: 12),
                            _buildMiniMetric('${m['contributionScore'] ?? m['score'] ?? 0}%', 'Score'),
                            if (isLeader && m['studentId'] != _currentUser?.studentCode) ...[
                               const SizedBox(width: 12),
                               IconButton(
                                 icon: const Icon(Icons.person_remove_outlined, color: Color(0xFFEF4444), size: 18),
                                 onPressed: () => _handleRemoveMember(m['studentId'] ?? m['id']),
                               ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Future<void> _handleInviteMember() async {
     // For now, simple mock invite
     final ok = await _studentService.inviteMember(_project['id'], {
       "studentCode": "STUDENT_CODE",
     });
     if (ok) {
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã gửi lời mời tham gia nhóm!'), backgroundColor: Color(0xFF10B981)));
     }
  }

  Future<void> _handleRemoveMember(dynamic userId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xác nhận'),
        content: const Text('Bạn có chắc muốn mời thành viên này khỏi nhóm?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Đuổi', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirm == true) {
      final ok = await _studentService.removeMember(_project['id'], userId);
      if (ok) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã xóa thành viên khỏi nhóm.'), backgroundColor: Color(0xFF10B981)));
        _loadData();
      }
    }
  }

  Widget _buildSrsTab() {
    final srsFiles = (_project['srs'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    if (srsFiles.isEmpty) return const Center(child: Text('Chưa có file SRS nào'));
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: srsFiles.length,
      itemBuilder: (context, i) {
        final f = srsFiles[i];
        final isLatest = i == 0;

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isLatest
                  ? const Color(0xFF10B981).withValues(alpha: 0.4)
                  : cardBorder,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.description_outlined,
                    color: Color(0xFF3B82F6), size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          f['version'] as String,
                          style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                              color: textPrimary),
                        ),
                        if (isLatest) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD1FAE5),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Latest',
                              style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF065F46)),
                            ),
                          ),
                        ],
                      ],
                    ),
                    Text(
                      'Updated: ${f['updatedAt']}',
                      style: const TextStyle(
                          fontSize: 11, color: textSecondary),
                    ),
                  ],
                ),
              ),
              Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: f['status'] == 'Approved'
                          ? const Color(0xFFD1FAE5)
                          : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      f['status'] as String,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: f['status'] == 'Approved'
                            ? const Color(0xFF065F46)
                            : textSecondary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  GestureDetector(
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content:
                              Text('Mở ${f['version']}'),
                          backgroundColor: const Color(0xFF10B981),
                        ),
                      );
                    },
                    child: const Icon(Icons.open_in_new_rounded,
                        size: 16, color: Color(0xFF3B82F6)),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatCard(
      String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: cardBorder),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
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
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: textPrimary,
                ),
              ),
              Text(label,
                  style: const TextStyle(
                      fontSize: 10, color: textSecondary)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCard({required String title, required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _buildMilestoneItem(Map<String, dynamic> m) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  m['title'] as String,
                  style: const TextStyle(fontSize: 12, color: textPrimary),
                ),
              ),
              Text(
                '${m['progress']}%',
                style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (m['progress'] as int) / 100,
              minHeight: 6,
              backgroundColor: const Color(0xFFE2E8F0),
              valueColor: AlwaysStoppedAnimation<Color>(
                m['progress'] == 100
                    ? const Color(0xFF10B981)
                    : const Color(0xFF3B82F6),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text(label,
              style: const TextStyle(fontSize: 12, color: textSecondary)),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: textPrimary),
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
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: color),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniMetric(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: textPrimary),
        ),
        Text(label,
            style: const TextStyle(fontSize: 9, color: textSecondary)),
      ],
    );
  }
}
