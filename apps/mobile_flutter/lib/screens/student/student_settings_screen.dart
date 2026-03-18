import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/student_service.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';
import '../../widgets/student_navigation.dart';
import '../../widgets/app_top_header.dart';

class StudentSettingsScreen extends StatefulWidget {
  const StudentSettingsScreen({super.key});

  @override
  State<StudentSettingsScreen> createState() => _StudentSettingsScreenState();
}

class _StudentSettingsScreenState extends State<StudentSettingsScreen> {
  final StudentService _studentService = StudentService();
  final AuthService _authService = AuthService();
  
  bool _isLoading = true;
  User? _currentUser;
  
  final TextEditingController _githubController = TextEditingController();
  final TextEditingController _jiraController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final user = await _authService.getCurrentUser();
      setState(() {
        _currentUser = user;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleLinkAccounts() async {
    if (_currentUser == null) return;
    
    setState(() => _isLoading = true);
    final ok = await _studentService.linkAccounts(_currentUser!.id, {
      "github": _githubController.text,
      "jira": _jiraController.text,
    });
    
    setState(() => _isLoading = false);
    
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Liên kết tài khoản thành công!'), backgroundColor: Color(0xFF10B981))
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Liên kết thất bại. Vui lòng thử lại.'), backgroundColor: Color(0xFFEF4444))
      );
    }
  }

  @override
  Widget build(BuildContext context) {
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
                    AppTopHeader(
                      title: 'Cài đặt',
                      primary: false,
                      user: AppUser(
                        name: _currentUser?.fullName ?? 'Student',
                        email: _currentUser?.email ?? '',
                        role: 'STUDENT',
                      ),
                    ),
                    Expanded(
                      child: _isLoading 
                        ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F766E)))
                        : SingleChildScrollView(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildSectionHeader('Liên kết tài khoản', 'Gán link Github/Jira cá nhân để hệ thống đồng bộ đóng góp'),
                                const SizedBox(height: 24),
                                _buildInputLabel('Link Profile GitHub'),
                                _buildTextField(_githubController, 'https://github.com/username', Icons.link_rounded),
                                const SizedBox(height: 16),
                                _buildInputLabel('Link Profile Jira'),
                                _buildTextField(_jiraController, 'https://jira.com/username', Icons.link_rounded),
                                const SizedBox(height: 32),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF0F766E),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                    onPressed: _handleLinkAccounts,
                                    child: const Text('Lưu thông tin liên kết', style: TextStyle(fontWeight: FontWeight.w700)),
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

  Widget _buildSectionHeader(String title, String sub) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
        const SizedBox(height: 4),
        Text(sub, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
      ],
    );
  }

  Widget _buildInputLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF475569))),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint, IconData icon) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        prefixIcon: Icon(icon, color: const Color(0xFF64748B), size: 18),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF0F766E), width: 1.5)),
      ),
    );
  }
}
