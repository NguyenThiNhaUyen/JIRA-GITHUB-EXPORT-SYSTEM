import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'admin_service.dart';

class AdminDashboardService {
  final AuthService _auth = AuthService();
  final AdminService _adminService = AdminService();

  Future<Map<String, dynamic>> getDashboardData() async {
    try {
      final results = await Future.wait([
        _adminService.getSemesters(),
        _adminService.getSubjects(),
        _adminService.getCourses(),
        _adminService.getUsers(),
        _adminService.getGroups(),
      ]);

      final semesters = results[0];
      final subjects = results[1];
      final courses = results[2];
      final users = results[3];
      final groups = results[4];

      // Calculate roles safely based on 'roles' array or 'role' map
      int lecturersCount = 0;
      int studentsCount = 0;
      for (var u in users) {
        bool isLecturer = false;
        bool isStudent = false;

        if (u['roles'] is List) {
           isLecturer = (u['roles'] as List).any((r) => r.toString().toUpperCase() == 'LECTURER');
           isStudent = (u['roles'] as List).any((r) => r.toString().toUpperCase() == 'STUDENT');
        } else if (u['role'] != null) {
           if (u['role'] is Map && u['role']['name'] != null) {
              isLecturer = u['role']['name'].toString().toUpperCase() == 'LECTURER';
              isStudent = u['role']['name'].toString().toUpperCase() == 'STUDENT';
           } else {
              isLecturer = u['role'].toString().toUpperCase() == 'LECTURER';
              isStudent = u['role'].toString().toUpperCase() == 'STUDENT';
           }
        }
        
        if (isLecturer) lecturersCount++;
        if (isStudent) studentsCount++;
      }

      final activeSemesters = semesters.where((s) => s['status'] == 'ACTIVE' || s['status'] == 'Active').length;

      final stats = {
        'semesters': semesters.length,
        'subjects': subjects.length,
        'courses': courses.length,
        'projects': groups.length,
        'lecturers': lecturersCount,
        'students': studentsCount,
        'activeSemesters': activeSemesters,
      };

      final integrationStats = {
        'repoConnected': groups.where((g) => g['githubRepo'] != null && g['githubRepo'].toString().isNotEmpty).length,
        'repoMissing': groups.where((g) => g['githubRepo'] == null || g['githubRepo'].toString().isEmpty).length,
        'jiraConnected': groups.where((g) => g['jiraInstance'] != null && g['jiraInstance'].toString().isNotEmpty).length,
        'syncErrors': 0,
        'reportsExported': 0,
      };

      // Fallback arrays for UI components that don't have backend logic yet
      return {
        'stats': stats,
        'integrationStats': integrationStats,
        'commitData': [],
        'heatmapData': [],
        'teamRanking': [],
        'inactiveTeams': [],
        'teamActivity': [],
        'systemActivity': [],
        'recentCourses': courses.take(5).toList(),
        'recentGroups': groups.take(5).toList(),
        'semestersData': semesters,
        'subjectsData': subjects,
        'coursesData': courses,
      };
  // --- New Advanced Analytics APIs ---

  /// GET /api/analytics/stats - Thống kê tổng quan Admin
  Future<Map<String, dynamic>?> getAdminStats() async {
    final data = await _get("/analytics/stats");
    return data != null ? Map<String, dynamic>.from(data) : null;
  }

  /// GET /api/analytics/integration-stats - Thống kê kết nối Jira/Github
  Future<Map<String, dynamic>?> getIntegrationStats() async {
    final data = await _get("/analytics/integration-stats");
    return data != null ? Map<String, dynamic>.from(data) : null;
  }

  /// GET /api/analytics/commit-trends - Xu hướng commit
  Future<List<dynamic>> getCommitTrends({int days = 7}) async {
    final data = await _get("/analytics/commit-trends?days=$days");
    if (data is List) return data;
    return [];
  }

  /// GET /api/analytics/heatmap - Biểu đồ nhiệt hoạt động
  Future<List<dynamic>> getHeatmap({int days = 90}) async {
    final data = await _get("/analytics/heatmap?days=$days");
    if (data is List) return data;
    return [];
  }

  /// GET /api/analytics/team-rankings - Xếp hạng nhóm hiệu suất cao
  Future<List<dynamic>> getTeamRankings({int limit = 4}) async {
    final data = await _get("/analytics/team-rankings?limit=$limit");
    if (data is List) return data;
    return [];
  }

  /// GET /api/analytics/inactive-teams - Các nhóm không hoạt động
  Future<List<dynamic>> getInactiveTeams() async {
    final data = await _get("/analytics/inactive-teams");
    if (data is List) return data;
    return [];
  }

  /// GET /api/analytics/activity-log - Nhật ký hệ thống (Audit logs)
  Future<List<dynamic>> getAuditLogs({int limit = 10}) async {
    final data = await _get("/analytics/activity-log?limit=$limit");
    if (data is List) return data;
    return [];
  }

  /// GET /api/analytics/team-activities - Dòng hoạt động của các nhóm
  Future<List<dynamic>> getTeamActivities() async {
    final data = await _get("/analytics/team-activities");
    if (data is List) return data;
    return [];
  }

  Future<dynamic> _get(String endpoint) async {
    try {
      final token = await _auth.getToken();
      final response = await http.get(
        Uri.parse('${AuthService.baseUrl}/api$endpoint'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final payload = data['data'] ?? data['Data'] ?? data;
        return payload;
      }
      return null;
    } catch (e) {
      print('AdminDashboardService GET error ($endpoint): $e');
      return null;
    }
  }
}
