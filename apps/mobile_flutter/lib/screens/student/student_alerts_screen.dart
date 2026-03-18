import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/student_navigation.dart';
import '../../services/student_service.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';

class StudentAlertsScreen extends StatefulWidget {
  const StudentAlertsScreen({super.key});

  @override
  State<StudentAlertsScreen> createState() => _StudentAlertsScreenState();
}

class _StudentAlertsScreenState extends State<StudentAlertsScreen> {
  final StudentService _studentService = StudentService();
  final AuthService _authService = AuthService();
  
  bool _isLoading = true;
  User? _currentUser;
  List<Map<String, dynamic>> _alerts = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final user = await _authService.getCurrentUser();
      final alerts = await _studentService.getAlerts();
      if (mounted) {
        setState(() {
          _currentUser = user;
          _alerts = alerts;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final scWidth = MediaQuery.of(context).size.width;
    final isMobile = scWidth < 900;
    
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      drawer: isMobile ? const StudentDrawer() : null,
      appBar: AppTopHeader(
        title: 'Cảnh báo',
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
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      _buildHeader(scWidth),
                      const SizedBox(height: 32),
                      _buildAlertsContainer(scWidth),
                      const SizedBox(height: 40),
                    ]),
                  ),
                ),
        ),
      ]),
    );
  }

  Widget _buildHeader(double width) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        const Text('Sinh viên', style: TextStyle(fontSize: 11, color: Color(0xFF0D9488), fontWeight: FontWeight.bold)),
        const SizedBox(width: 8),
        const Icon(Icons.chevron_right_rounded, size: 14, color: Color(0xFFCBD5E1)),
        const SizedBox(width: 8),
        const Text('Cảnh báo', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
      ]),
      const SizedBox(height: 12),
      Text('Thông báo & Cảnh báo', style: TextStyle(fontSize: width < 400 ? 24 : 32, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A), letterSpacing: -1)),
      const SizedBox(height: 4),
      const Text('Các nhắc nhở về tiến độ từ hệ thống và Giảng viên hướng dẫn.', style: TextStyle(fontSize: 14, color: Color(0xFF64748B))),
    ]);
  }

  Widget _buildAlertsContainer(double width) {
    if (_alerts.isEmpty) {
      return _buildEmptyState();
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(48),
        boxShadow: [BoxShadow(color: const Color(0xFFCBD5E1).withValues(alpha: 0.2), blurRadius: 40, offset: const Offset(0, 10))],
      ),
      clipBehavior: Clip.antiAlias,
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: _alerts.length,
        separatorBuilder: (context, index) => Divider(height: 1, color: const Color(0xFFF1F5F9).withValues(alpha: 0.5)),
        itemBuilder: (context, index) {
          final a = _alerts[index];
          return _buildAlertItem(a, width);
        },
      ),
    );
  }

  Widget _buildAlertItem(Map<String, dynamic> a, double width) {
    final severity = (a['severity'] ?? 'MEDIUM').toString().toUpperCase();
    final type = (a['type'] ?? '').toString().toUpperCase();
    final isHigh = severity == 'HIGH';
    final date = a['createdAt'] != null ? DateFormat('dd/MM/yyyy HH:mm').format(DateTime.parse(a['createdAt'])) : 'Vừa xong';

    // Determine icon based on integration source
    IconData alertIcon = Icons.notifications_none_rounded;
    Color alertColor = const Color(0xFF64748B);
    
    if (type.contains('GITHUB') || (a['message'] ?? '').toString().toLowerCase().contains('github')) {
      alertIcon = Icons.code_rounded;
      alertColor = const Color(0xFF6366F1);
    } else if (type.contains('JIRA') || (a['message'] ?? '').toString().toLowerCase().contains('jira')) {
      alertIcon = Icons.task_alt_rounded;
      alertColor = const Color(0xFF0369A1);
    } else if (isHigh) {
      alertIcon = Icons.warning_rounded;
      alertColor = const Color(0xFFEF4444);
    } else {
      alertIcon = Icons.lightbulb_outline_rounded;
      alertColor = const Color(0xFFF59E0B);
    }

    return InkWell(
      onTap: () {},
      child: Padding(
        padding: EdgeInsets.all(width < 500 ? 24 : 32),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 56, height: 56,
              decoration: BoxDecoration(
                color: alertColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(alertIcon, color: alertColor, size: 28),
            ),
            const SizedBox(width: 24),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text(
                    type.isNotEmpty ? type : (isHigh ? 'Cảnh báo rủi ro' : 'Nhắc nhở nhẹ'), 
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: alertColor)
                  ),
                  Text(date, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFCBD5E1))),
                ]),
                const SizedBox(height: 8),
                Text(
                  a['message'] ?? 'Bạn có một thông báo mới từ hệ thống.',
                  style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.5, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 16),
                Row(children: [
                  Container(width: 6, height: 6, decoration: BoxDecoration(color: alertColor, shape: BoxShape.circle)),
                  const SizedBox(width: 8),
                  Text('Dự án: ${a['groupName'] ?? a['projectName'] ?? 'Hệ thống'}', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: alertColor, letterSpacing: 0.5)),
                ]),
              ]),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 80),
        child: Column(children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(color: const Color(0xFFF0FDFA), borderRadius: BorderRadius.circular(32)),
            child: const Icon(Icons.check_circle_rounded, size: 40, color: Color(0xFF10B981)),
          ),
          const SizedBox(height: 24),
          const Text('Hệ thống an toàn!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
          const SizedBox(height: 8),
          const Text('Không có cảnh báo nào cho bạn trong lúc này.', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 2)),
        ]),
      ),
    );
  }
}
