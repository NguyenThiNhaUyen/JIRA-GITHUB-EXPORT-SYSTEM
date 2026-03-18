import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/lecturer_navigation.dart';
import '../../services/lecturer_service.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';

class MyCoursesScreen extends StatefulWidget {
  const MyCoursesScreen({super.key});

  @override
  State<MyCoursesScreen> createState() => _MyCoursesScreenState();
}

class _MyCoursesScreenState extends State<MyCoursesScreen> {
  static const Color bgColor = Color(0xFFF8FAFB);
  static const Color cardBorder = Color(0xFFF0F0F0);
  static const Color textPrimary = Color(0xFF1A202C);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color teal = Color(0xFF0F766E);
  static const Color tealLight = Color(0xFF14B8A6);

  final LecturerService _lecturerService = LecturerService();
  final AuthService _authService = AuthService();
  bool _isLoading = true;
  User? _currentUser;
  List<Map<String, dynamic>> _courses = [];

  String _search = '';
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final user = await _authService.getCurrentUser();
      final courses = await _lecturerService.getMyCourses();
      setState(() {
        _currentUser = user;
        _courses = courses;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      _showSnack("Lỗi tải danh sách lớp học");
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _filtered {
    final kw = _search.toLowerCase();
    if (kw.isEmpty) return _courses;
    return _courses.where((c) {
      return (c['code'] as String).toLowerCase().contains(kw) ||
          (c['name'] as String).toLowerCase().contains(kw) ||
          (c['subjectCode'] as String? ?? '').toLowerCase().contains(kw);
    }).toList();
  }

  int get _totalGroups =>
      _courses.fold(0, (s, c) => s + ((c['projectsCount'] ?? (c['projects'] as List?)?.length ?? 0) as int));

  int get _totalStudents =>
      _courses.fold(0, (s, c) => s + ((c['currentStudents'] ?? 0) as int));

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: teal,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filtered;
    final width = MediaQuery.of(context).size.width;
    final isNarrow = width < 760;

    return Scaffold(
      backgroundColor: bgColor,
      drawer: const LecturerDrawer(),
      appBar: AppTopHeader(
        title: 'Lớp của tôi',
        user: AppUser(
          name: _currentUser?.fullName ?? 'Giảng viên',
          email: _currentUser?.email ?? '',
          role: 'LECTURER',
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: teal))
          : SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildBreadcrumb(),
            const SizedBox(height: 16),
            _buildHeader(isNarrow),
            const SizedBox(height: 16),
            _buildMiniStats(isNarrow),
            const SizedBox(height: 16),
            if (filtered.isEmpty)
              _buildEmptyState(
                _search.isNotEmpty
                    ? 'Không tìm thấy lớp học phù hợp'
                    : 'Bạn chưa được giao lớp nào',
              )
            else
              ...filtered.map(
                (c) => Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: _buildCourseCard(c),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildBreadcrumb() {
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 4,
      children: const [
        Text(
          'Giảng viên',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: teal,
          ),
        ),
        Icon(Icons.chevron_right, size: 14, color: Color(0xFF94A3B8)),
        Text(
          'Lớp của tôi',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildHeader(bool isNarrow) {
    if (isNarrow) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Lớp của tôi',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: textPrimary,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 2),
          const Text(
            'Các lớp học bạn đang giảng dạy',
            style: TextStyle(fontSize: 13, color: textSecondary),
          ),
          const SizedBox(height: 12),
          _buildSearchField(),
        ],
      );
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Lớp của tôi',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              SizedBox(height: 2),
              Text(
                'Các lớp học bạn đang giảng dạy',
                style: TextStyle(fontSize: 13, color: textSecondary),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        SizedBox(
          width: 220,
          child: _buildSearchField(),
        ),
      ],
    );
  }

  Widget _buildSearchField() {
    return TextField(
      controller: _searchCtrl,
      onChanged: (v) => setState(() => _search = v),
      style: const TextStyle(fontSize: 13, color: textPrimary),
      decoration: InputDecoration(
        hintText: 'Tìm kiếm lớp học...',
        hintStyle: const TextStyle(fontSize: 13, color: textSecondary),
        prefixIcon:
            const Icon(Icons.search_rounded, size: 16, color: textSecondary),
        suffixIcon: _search.isNotEmpty
            ? GestureDetector(
                onTap: () {
                  _searchCtrl.clear();
                  setState(() => _search = '');
                },
                child: const Icon(
                  Icons.close_rounded,
                  size: 15,
                  color: textSecondary,
                ),
              )
            : null,
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: teal, width: 1.5),
        ),
      ),
    );
  }

  Widget _buildMiniStats(bool isNarrow) {
    final stats = [
      {
        'label': 'Tổng lớp',
        'value': '${_courses.length}',
        'color': teal,
        'bg': const Color(0xFFF0FDFA),
        'border': const Color(0xFFCCFBF1),
      },
      {
        'label': 'Tổng nhóm',
        'value': '$_totalGroups',
        'color': const Color(0xFF2563EB),
        'bg': const Color(0xFFEFF6FF),
        'border': const Color(0xFFBFDBFE),
      },
      {
        'label': 'Tổng sinh viên',
        'value': '$_totalStudents',
        'color': const Color(0xFF4F46E5),
        'bg': const Color(0xFFEEF2FF),
        'border': const Color(0xFFC7D2FE),
      },
    ];

    if (isNarrow) {
      return Column(
        children: List.generate(stats.length, (index) {
          final s = stats[index];
          final color = s['color'] as Color;
          final bg = s['bg'] as Color;
          final border = s['border'] as Color;

          return Container(
            width: double.infinity,
            margin: EdgeInsets.only(bottom: index == stats.length - 1 ? 0 : 10),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: border),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    s['label'] as String,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: color.withValues(alpha: 0.85),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  s['value'] as String,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: color,
                  ),
                ),
              ],
            ),
          );
        }),
      );
    }

    return Row(
      children: stats.map((s) {
        final color = s['color'] as Color;
        final bg = s['bg'] as Color;
        final border = s['border'] as Color;

        return Expanded(
          child: Container(
            margin: EdgeInsets.only(right: s == stats.last ? 0 : 10),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: border),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    s['label'] as String,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: color.withValues(alpha: 0.85),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  s['value'] as String,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildCourseCard(Map<String, dynamic> course) {
    final projects = course['projects'] as List;
    final groupCount = projects.length;
    final activeTeams =
        projects.where((p) => p['repoConnected'] == true).length;
    final jiraConnected =
        projects.where((p) => p['jiraConnected'] == true).length;
    final inactiveTeams = groupCount - activeTeams;
    final alerts = inactiveTeams;
    final progress =
        groupCount == 0 ? 0 : ((activeTeams / groupCount) * 100).round();
    final lastCommit = course['lastCommit'] as String? ?? 'No activity';
    final isArchived = course['archived'] as bool? ?? false;

    String status;
    if (isArchived) {
      status = 'ARCHIVED';
    } else if (activeTeams == 0) {
      status = 'NO REPO';
    } else if (activeTeams < groupCount / 2) {
      status = 'LOW';
    } else {
      status = 'ACTIVE';
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: cardBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 5,
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [teal, tealLight]),
              borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDFA),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(
                        Icons.school_outlined,
                        size: 20,
                        color: teal,
                      ),
                    ),
                    const Spacer(),
                    Flexible(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0FDFA),
                          borderRadius: BorderRadius.circular(20),
                          border:
                              Border.all(color: const Color(0xFFCCFBF1)),
                        ),
                        child: Text(
                          course['subjectCode'] as String? ?? '—',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: teal,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                Text(
                  course['code'] as String,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  course['name'] as String,
                  style: const TextStyle(fontSize: 12, color: textSecondary),
                ),
                const SizedBox(height: 2),
                Text(
                  'Semester: ${course['semester'] ?? 'Fall 2025'}',
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF94A3B8),
                  ),
                ),
                const SizedBox(height: 10),

                Wrap(
                  spacing: 14,
                  runSpacing: 6,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.people_outline_rounded,
                          size: 13,
                          color: textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${course['currentStudents'] ?? 0} sinh viên',
                          style: const TextStyle(
                            fontSize: 11,
                            color: textSecondary,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.book_outlined,
                          size: 13,
                          color: textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '$groupCount nhóm',
                          style: const TextStyle(
                            fontSize: 11,
                            color: textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                _buildMiniCommitChart(course),
                const SizedBox(height: 12),

                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Project progress',
                        style: TextStyle(fontSize: 10, color: textSecondary),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '$progress%',
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progress / 100,
                    minHeight: 6,
                    backgroundColor: const Color(0xFFF1F5F9),
                    valueColor:
                        const AlwaysStoppedAnimation<Color>(tealLight),
                  ),
                ),
                const SizedBox(height: 10),

                Wrap(
                  spacing: 16,
                  runSpacing: 6,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.account_tree_outlined,
                          size: 12,
                          color: textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Repo: $activeTeams/$groupCount',
                          style: const TextStyle(
                            fontSize: 11,
                            color: textSecondary,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      'Jira: $jiraConnected/$groupCount',
                      style:
                          const TextStyle(fontSize: 11, color: textSecondary),
                    ),
                  ],
                ),
                const SizedBox(height: 6),

                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        'Active teams: $activeTeams/$groupCount',
                        style: const TextStyle(
                          fontSize: 11,
                          color: textSecondary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Flexible(
                      child: Text(
                        'Last activity: $lastCommit',
                        textAlign: TextAlign.right,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 11,
                          color: textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),

                if (alerts > 0) ...[
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(
                        Icons.warning_amber_rounded,
                        size: 12,
                        color: Color(0xFFEF4444),
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '$alerts alerts detected',
                          style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFFEF4444),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],

                const SizedBox(height: 10),

                Align(
                  alignment: Alignment.centerRight,
                  child: _buildStatusBadge(status),
                ),
                const SizedBox(height: 12),

                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _buildActionButton(
                      label: 'Dashboard',
                      filled: false,
                      onTap: () => context.go(
                        '/lecturer/course/${course['id']}/dashboard',
                      ),
                    ),
                    _buildActionButton(
                      label: 'Manage',
                      filled: true,
                      onTap: () => context.go(
                        '/lecturer/course/${course['id']}/manage-groups',
                      ),
                    ),
                    _buildActionButton(
                      label: 'Alerts',
                      filled: false,
                      onTap: () => _showSnack(
                        'Alerts cho ${course['code']}',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniCommitChart(Map<String, dynamic> course) {
    final List<int> defaultCommits = (course['commits'] as List<dynamic>?)?.map((e) => e as int).toList() ?? [];
    if (defaultCommits.isEmpty) return const SizedBox(height: 36);
    final max = defaultCommits.reduce((a, b) => a > b ? a : b);
    return SizedBox(
      height: 36,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: defaultCommits.map((v) {
          final pct = v / max;
          return Expanded(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 1.5),
              height: (28 * pct).clamp(4.0, 36.0),
              decoration: BoxDecoration(
                color: tealLight.withValues(alpha: 0.55 + pct * 0.45),
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg, fg;
    switch (status) {
      case 'ACTIVE':
        bg = const Color(0xFFF0FDF4);
        fg = const Color(0xFF16A34A);
        break;
      case 'LOW':
        bg = const Color(0xFFFEFCE8);
        fg = const Color(0xFFCA8A04);
        break;
      case 'NO REPO':
        bg = const Color(0xFFFFF1F2);
        fg = const Color(0xFFE11D48);
        break;
      default:
        bg = const Color(0xFFF1F5F9);
        fg = textSecondary;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status,
        style: TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.w700,
          color: fg,
          letterSpacing: 0.6,
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required String label,
    required bool filled,
    required VoidCallback onTap,
  }) {
    return SizedBox(
      width: 110,
      child: filled
          ? _buildFilledButton(label, onTap)
          : _buildOutlineButton(label, onTap),
    );
  }

  Widget _buildFilledButton(String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 9),
        decoration: BoxDecoration(
          color: teal,
          borderRadius: BorderRadius.circular(12),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _buildOutlineButton(String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 9),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFD1D5DB)),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: textPrimary,
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 64),
      child: Center(
        child: Column(
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(
                Icons.school_outlined,
                size: 28,
                color: textSecondary,
              ),
            ),
            const SizedBox(height: 14),
            Text(
              message,
              style: const TextStyle(fontSize: 13, color: textSecondary),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}