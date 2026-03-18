// Admin Groups Screen (Flutter Mobile)
import 'package:flutter/material.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/admin_navigation.dart';
import '../../services/admin_service.dart';

class AdminGroupsScreen extends StatefulWidget {
  const AdminGroupsScreen({super.key});

  @override
  State<AdminGroupsScreen> createState() => _AdminGroupsScreenState();
}

class _AdminGroupsScreenState extends State<AdminGroupsScreen> {
  static const Color cardBorder = Color(0xFFE7ECF3);
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color teal = Color(0xFF0F766E);

  String _searchQuery = '';
  String _courseFilter = 'all';
  String _statusFilter = 'all';
  final AdminService _adminService = AdminService();
  bool _isLoading = false;

  final List<Map<String, dynamic>> _groups = [];

  List<Map<String, dynamic>> get _filteredGroups {
    return _groups.where((g) {
      final matchSearch =
          _searchQuery.isEmpty ||
          (g['id'] as String).toLowerCase().contains(
            _searchQuery.toLowerCase(),
          ) ||
          (g['topic'] as String).toLowerCase().contains(
            _searchQuery.toLowerCase(),
          ) ||
          (g['lecturer'] as String).toLowerCase().contains(
            _searchQuery.toLowerCase(),
          );
      final matchCourse =
          _courseFilter == 'all' || g['course'] == _courseFilter;
      final matchStatus =
          _statusFilter == 'all' ||
          (_statusFilter == 'ok' &&
              g['githubStatus'] == 'APPROVED' &&
              g['jiraStatus'] == 'APPROVED') ||
          (_statusFilter == 'pending' &&
              (g['githubStatus'] == 'PENDING' ||
                  g['jiraStatus'] == 'PENDING')) ||
          (_statusFilter == 'missing' &&
              (g['githubStatus'] == 'MISSING' || g['jiraStatus'] == 'MISSING'));
      return matchSearch && matchCourse && matchStatus;
    }).toList();
  }

  int get _totalOk => _groups
      .where(
        (g) => g['githubStatus'] == 'APPROVED' && g['jiraStatus'] == 'APPROVED',
      )
      .length;
  int get _totalPending => _groups
      .where(
        (g) => g['githubStatus'] == 'PENDING' || g['jiraStatus'] == 'PENDING',
      )
      .length;
  int get _totalMissing => _groups
      .where(
        (g) => g['githubStatus'] == 'MISSING' || g['jiraStatus'] == 'MISSING',
      )
      .length;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final groups = await _adminService.getGroups();
      setState(() {
        _groups.clear();
        _groups.addAll(groups);
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isMobile = width < 900;
    final horizontalPadding = isMobile ? 16.0 : 24.0;

    return Scaffold(
      backgroundColor: const Color(0xFFEFF7F5),
      drawer: isMobile ? const AdminDrawer() : null,
      body: SafeArea(
        child: Row(
          children: [
            if (!isMobile) const AdminSidebar(),
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
                    _buildTopHeader(),
                    Expanded(
                      child: _isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : SingleChildScrollView(
                        padding: EdgeInsets.all(horizontalPadding),
                        child: Center(
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(maxWidth: 1400),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildStatsRow(),
                                const SizedBox(height: 12),
                                _buildFilters(),
                                const SizedBox(height: 12),
                                if (_filteredGroups.isEmpty)
                                  _buildEmptyState()
                                else
                                  ListView.builder(
                                    shrinkWrap: true,
                                    physics: const NeverScrollableScrollPhysics(),
                                    itemCount: _filteredGroups.length,
                                    itemBuilder: (context, i) =>
                                        _buildGroupCard(_filteredGroups[i]),
                                  ),
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

  Widget _buildTopHeader() {
    return AppTopHeader(
      title: 'Quản lý nhóm dự án',
      primary: false,
      user: const AppUser(
        name: 'Super Admin',
        email: 'admin@fe.edu.vn',
        role: 'ADMIN',
      ),
      actions: [
        Container(
          margin: const EdgeInsets.only(right: 8),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            '${_groups.length} nhóm',
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: textSecondary,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsRow() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Row(
        children: [
          _buildStatChip('✅ ${_totalOk} OK', const Color(0xFF10B981), 'ok'),
          const SizedBox(width: 8),
          _buildStatChip(
            '⏳ ${_totalPending} Chờ',
            const Color(0xFFF59E0B),
            'pending',
          ),
          const SizedBox(width: 8),
          _buildStatChip(
            '❌ ${_totalMissing} Thiếu',
            const Color(0xFFEF4444),
            'missing',
          ),
        ],
      ),
    );
  }

  Widget _buildStatChip(String label, Color color, String filter) {
    final selected = _statusFilter == filter;
    return GestureDetector(
      onTap: () => setState(() => _statusFilter = selected ? 'all' : filter),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? color.withOpacity(0.15) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: selected ? color : cardBorder),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: selected ? color : textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildFilters() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Column(
        children: [
          TextField(
            onChanged: (v) => setState(() => _searchQuery = v),
            decoration: InputDecoration(
              hintText: 'Tìm nhóm, đề tài, giảng viên...',
              hintStyle: const TextStyle(color: textSecondary, fontSize: 13),
              prefixIcon: const Icon(
                Icons.search_rounded,
                color: textSecondary,
              ),
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 0,
              ),
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
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: _courseFilter,
            onChanged: (v) => setState(() => _courseFilter = v!),
            isDense: true,
            decoration: InputDecoration(
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 10,
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: cardBorder),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: cardBorder),
              ),
            ),
            items: const [
              DropdownMenuItem(
                value: 'all',
                child: Text('Tất cả môn học', style: TextStyle(fontSize: 13)),
              ),
              DropdownMenuItem(
                value: 'SWD392',
                child: Text('SWD392', style: TextStyle(fontSize: 13)),
              ),
              DropdownMenuItem(
                value: 'PRJ301',
                child: Text('PRJ301', style: TextStyle(fontSize: 13)),
              ),
              DropdownMenuItem(
                value: 'PRN222',
                child: Text('PRN222', style: TextStyle(fontSize: 13)),
              ),
            ],
          ),
        ],
      ),
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
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [teal.withOpacity(0.8), const Color(0xFF0891B2)],
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Center(
                    child: Text(
                      g['id'] as String,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 10,
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
                        g['topic'] as String,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                          color: textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '${g['course']} · ${g['class']}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                _buildMiniStatusDot(githubOk && jiraOk),
              ],
            ),
          ),

          // Info row
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 10),
            child: Row(
              children: [
                Icon(
                  Icons.person_outline_rounded,
                  size: 12,
                  color: textSecondary,
                ),
                const SizedBox(width: 4),
                Text(
                  g['lecturer'] as String,
                  style: const TextStyle(fontSize: 11, color: textSecondary),
                ),
                const Spacer(),
                Icon(Icons.people_outline, size: 12, color: textSecondary),
                const SizedBox(width: 4),
                Text(
                  '${g['memberCount']} SV',
                  style: const TextStyle(fontSize: 11, color: textSecondary),
                ),
              ],
            ),
          ),

          // Integration + commits
          Container(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: cardBorder)),
            ),
            child: Row(
              children: [
                _buildBadgeSmall('GitHub', g['githubStatus'] as String),
                const SizedBox(width: 6),
                _buildBadgeSmall('Jira', g['jiraStatus'] as String),
                const SizedBox(width: 6),
                _buildBadgeSmall(
                  'SRS',
                  null,
                  customText: g['srsStatus'] as String,
                  color: const Color(0xFF6366F1),
                ),
                const Spacer(),
                Icon(Icons.commit, size: 11, color: textSecondary),
                const SizedBox(width: 3),
                Text(
                  '${g['commits']}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: textPrimary,
                  ),
                ),
              ],
            ),
          ),

          // Actions
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
            child: Row(
              children: [
                Text(
                  'Hoạt động: ${g['lastCommit']}',
                  style: const TextStyle(fontSize: 10, color: textSecondary),
                ),
                const Spacer(),
                if (!githubOk || !jiraOk)
                  GestureDetector(
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Đã gửi nhắc nhở đến nhóm ${g['id']}'),
                          backgroundColor: teal,
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFFBEB),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFFCD34D)),
                      ),
                      child: const Text(
                        'Nhắc nhở',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF92400E),
                        ),
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

  Widget _buildMiniStatusDot(bool ok) {
    return Container(
      width: 10,
      height: 10,
      decoration: BoxDecoration(
        color: ok ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
        shape: BoxShape.circle,
      ),
    );
  }

  Widget _buildBadgeSmall(
    String label,
    String? status, {
    String? customText,
    Color? color,
  }) {
    Color c;
    String text;

    if (customText != null && color != null) {
      c = color;
      text = customText;
    } else {
      switch (status) {
        case 'APPROVED':
          c = const Color(0xFF10B981);
          break;
        case 'PENDING':
          c = const Color(0xFFF59E0B);
          break;
        default:
          c = const Color(0xFFEF4444);
      }
      text = label;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: c.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: c),
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
            child: const Icon(Icons.group_work_outlined, size: 36, color: teal),
          ),
          const SizedBox(height: 16),
          const Text(
            'Không tìm thấy nhóm',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: textPrimary,
            ),
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
}
