import 'package:flutter/material.dart';
import '../../widgets/app_top_header.dart';
import '../../widgets/student_navigation.dart';
import '../../services/student_service.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';

class StudentSrsScreen extends StatefulWidget {
  const StudentSrsScreen({super.key});

  @override
  State<StudentSrsScreen> createState() => _StudentSrsScreenState();
}

class _StudentSrsScreenState extends State<StudentSrsScreen> {
  final StudentService _studentService = StudentService();
  final AuthService _authService = AuthService();
  
  bool _isLoading = true;
  User? _currentUser;
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
      final projects = await _studentService.getMyProjects();
      final normalized = projects.map(_normalizeProject).toList();
      if (mounted) {
        setState(() {
          _currentUser = user;
          _projects = normalized;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Map<String, dynamic> _normalizeProject(Map<String, dynamic> p) {
    final integration = p['integration'] ?? p['Integration'] ?? {};
    final github = integration['github'] ?? integration['GitHub'] ?? {};
    final jira = integration['jira'] ?? integration['Jira'] ?? {};
    
    return {
      ...p,
      'repositoryName': github['repositoryName'] ?? p['repositoryName'] ?? 'No GitHub',
      'jiraProjectKey': jira['projectKey'] ?? p['jiraProjectKey'] ?? 'No Jira',
      'srsStatus': p['srsStatus'] ?? p['SrsStatus'] ?? 'PENDING',
      'srsHistory': p['srsHistory'] ?? p['SrsHistory'] ?? [],
    };
  }

  @override
  Widget build(BuildContext context) {
    final scWidth = MediaQuery.of(context).size.width;
    final isMobile = scWidth < 1200;
    
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      drawer: scWidth < 900 ? const StudentDrawer() : null,
      appBar: AppTopHeader(
        title: 'SRS Center',
        user: AppUser(name: _currentUser?.fullName ?? 'Student', email: _currentUser?.email ?? '', role: 'STUDENT'),
      ),
      body: Row(children: [
        if (scWidth >= 900) const StudentSidebar(),
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
                      if (isMobile) ...[
                        _buildUploadCard(),
                        const SizedBox(height: 24),
                        _buildHistoryList(),
                        const SizedBox(height: 24),
                        _buildTemplatesCard(),
                      ] else 
                        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Expanded(flex: 2, child: _buildHistoryList()),
                          const SizedBox(width: 32),
                          Expanded(child: Column(children: [
                            _buildUploadCard(),
                            const SizedBox(height: 24),
                            _buildTemplatesCard(),
                          ])),
                        ]),
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
        const Text('SRS Center', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
      ]),
      const SizedBox(height: 12),
      Text('Quản lý Tài liệu SRS', style: TextStyle(fontSize: width < 400 ? 24 : 32, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A), letterSpacing: -1)),
      const SizedBox(height: 4),
      const Text('Nộp và theo dõi trạng thái phê duyệt tài liệu Đặc tả Yêu cầu phần mềm.', style: TextStyle(fontSize: 14, color: Color(0xFF64748B))),
    ]);
  }

  Widget _buildHistoryList() {
    if (_projects.isEmpty) {
      return Container(
        height: 300,
        decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(40),
          border: Border.all(color: const Color(0xFFF1F5F9), width: 2),
        ),
        child: const Center(
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.file_copy_outlined, size: 48, color: Color(0xFFCBD5E1)),
            SizedBox(height: 16),
            Text('CHƯA CÓ DỰ ÁN NÀO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFFCBD5E1), letterSpacing: 2)),
          ]),
        ),
      );
    }

    return Column(children: _projects.map((p) => _buildProjectSrsCard(p)).toList());
  }

  Widget _buildProjectSrsCard(Map<String, dynamic> p) {
    final history = (p['srsHistory'] as List?) ?? [];
    final status = (p['srsStatus'] ?? 'PENDING').toString().toUpperCase();
    
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(40),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(
          padding: const EdgeInsets.all(32),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(p['name'] ?? 'Dự án chưa tên', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
              const SizedBox(height: 4),
              Row(children: [
                _miniIntegrationTag(Icons.code_rounded, p['repositoryName'] ?? 'No GitHub', const Color(0xFF6366F1)),
                const SizedBox(width: 8),
                _miniIntegrationTag(Icons.task_alt_rounded, p['jiraProjectKey'] ?? 'No Jira', const Color(0xFF0369A1)),
              ]),
            ])),
            _statusBadge(status),
          ]),
        ),
        const Divider(height: 1, color: Color(0xFFF1F5F9)),
        if (history.isEmpty)
          const Padding(
            padding: EdgeInsets.all(32),
            child: Text('Chưa có lịch sử nộp báo cáo.', style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8), fontStyle: FontStyle.italic)),
          )
        else
          ...history.map((h) => _buildHistoryItem(h)),
      ]),
    );
  }

  Widget _miniIntegrationTag(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(8), border: Border.all(color: color.withValues(alpha: 0.1))),
      child: Row(children: [
        Icon(icon, size: 10, color: color),
        const SizedBox(width: 6),
        Text(label, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: color)),
      ]),
    );
  }

  Widget _buildHistoryItem(Map<String, dynamic> h) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))),
      child: Row(children: [
        Container(
          width: 40, height: 40,
          decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)),
          child: const Icon(Icons.description_rounded, size: 20, color: Color(0xFF64748B)),
        ),
        const SizedBox(width: 16),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Phiên bản ${h['version']}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
          Text('Nộp ngày: ${h['submittedAt'] ?? 'N/A'}', style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
        ])),
        TextButton(
          onPressed: () {}, // Download/View
          child: const Text('XEM FILE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF0D9488))),
        ),
      ]),
    );
  }

  Widget _statusBadge(String status) {
    Color color = const Color(0xFF64748B);
    String text = 'CHƯA NỘP';

    if (status == 'APPROVED') { color = const Color(0xFF10B981); text = 'ĐÃ PHÊ DUYỆT'; }
    else if (status == 'REJECTED') { color = const Color(0xFFEF4444); text = 'BỊ TỪ CHỐI'; }
    else if (status == 'UNDER_REVIEW') { color = const Color(0xFFF59E0B); text = 'ĐANG CHẤM'; }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
      child: Text(text, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: color)),
    );
  }

  Widget _buildUploadCard() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A), 
        borderRadius: BorderRadius.circular(40),
        boxShadow: [BoxShadow(color: const Color(0xFF0F172A).withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Icon(Icons.cloud_upload_outlined, color: Color(0xFF2DD4BF), size: 32),
        const SizedBox(height: 20),
        const Text('Nộp báo cáo mới', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
        const SizedBox(height: 8),
        const Text('Chọn dự án và tải tài liệu phần mềm của bạn lên hệ thống để giảng viên chấm điểm.', style: TextStyle(fontSize: 12, color: Colors.white60)),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => _showSubmitDialog(),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2DD4BF),
              foregroundColor: const Color(0xFF0F172A),
              elevation: 0,
              padding: const EdgeInsets.symmetric(vertical: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            ),
            child: const Text('BẮT ĐẦU NỘP', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1)),
          ),
        ),
      ]),
    );
  }

  Widget _buildTemplatesCard() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(40),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('RESOURCES & TEMPLATES', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 1.5)),
        const SizedBox(height: 24),
        _templateLink('IEEE 29148 Standard SRS'),
        const Divider(height: 24, color: Color(0xFFF8FAFC)),
        _templateLink('Tài liệu hướng dẫn nộp bài'),
        const Divider(height: 24, color: Color(0xFFF8FAFC)),
        _templateLink('Ví dụ Website SRS'),
      ]),
    );
  }

  Widget _templateLink(String title) {
    return Row(children: [
      const Icon(Icons.file_download_outlined, size: 16, color: Color(0xFF0D9488)),
      const SizedBox(width: 12),
      Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
    ]);
  }

  void _showSubmitDialog() {
    // Modal implementation... Placeholder for now
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Chức năng nộp SRS đang được cập nhật!')));
  }
}
