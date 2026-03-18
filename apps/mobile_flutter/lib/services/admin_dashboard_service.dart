import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'admin_service.dart';

class AdminDashboardService {
  final AuthService _auth = AuthService();
  final AdminService _adminService = AdminService();

  Future<Map<String, dynamic>> getDashboardData() async {
    try {
      // 1. Fetch statistics and integration details via Analytics API
      final results = await Future.wait([
        getAdminStats(),
        getIntegrationStats(),
        getCommitTrends(),
        getHeatmap(),
        getTeamRankings(),
        getInactiveTeams(),
        getAuditLogs(),
        getTeamActivities(),
        _adminService.getCourses(), 
        _adminService.getSemesters(),
        _adminService.getSubjects(),
      ]);

      // 2. Normalize Admin Stats (Support multiple naming conventions from backend)
      final rawStats = results[0] as Map<String, dynamic>? ?? {};
      final semestersData = results[9] as List? ?? [];
      final subjectsData = (results[10] as List?) ?? [];
      final coursesData = (results[8] as List?) ?? [];
      
      final stats = {
        'semesters': rawStats['semesters'] ?? rawStats['Semesters'] ?? semestersData.length,
        'subjects': rawStats['subjects'] ?? rawStats['Subjects'] ?? subjectsData.length,
        'courses': rawStats['courses'] ?? rawStats['Courses'] ?? coursesData.length,
        'lecturers': rawStats['lecturers'] ?? rawStats['Lecturers'] ?? 0,
        'students': rawStats['students'] ?? rawStats['Students'] ?? 0,
        'projects': rawStats['projects'] ?? rawStats['Projects'] ?? 0,
        'activeSemesters': rawStats['activeSemesters'] ?? rawStats['ActiveSemesters'] ?? 
                          semestersData.where((s) => s['status'] == 'ACTIVE' || s['Status'] == 'ACTIVE').length,
      };
      
      // 3. Normalize Integration Stats
      final rawIntegration = results[1] as Map<String, dynamic>? ?? {};
      final integrationStats = {
        'repoConnected': rawIntegration['repoConnected'] ?? rawIntegration['RepoConnected'] ?? rawIntegration['repo_connected'] ?? 0,
        'repoMissing': rawIntegration['repoMissing'] ?? rawIntegration['RepoMissing'] ?? rawIntegration['repo_missing'] ?? 0,
        'jiraConnected': rawIntegration['jiraConnected'] ?? rawIntegration['JiraConnected'] ?? rawIntegration['jira_connected'] ?? 0,
        'syncErrors': rawIntegration['syncErrors'] ?? rawIntegration['SyncErrors'] ?? rawIntegration['sync_errors'] ?? 0,
        'reportsExported': rawIntegration['reportsExported'] ?? rawIntegration['ReportsExported'] ?? rawIntegration['reports_exported'] ?? 0,
      };

      return {
        'stats': stats,
        'integrationStats': integrationStats,
        'commitData': results[2] ?? [],
        'heatmapData': results[3] ?? [],
        'teamRanking': results[4] ?? [],
        'inactiveTeams': results[5] ?? [],
        'systemActivity': results[6] ?? [],
        'teamActivity': results[7] ?? [],
        'recentCourses': coursesData.take(6).toList(), // Web uses 6
        'coursesData': results[8] ?? [],
        'semestersData': results[9] ?? [],
        'subjectsData': results[10] ?? [],
      };
    } catch (e) {
      print('AdminDashboardService Error: $e');
      throw Exception('Lỗi nạp dữ liệu Dashboard: $e');
    }
  }

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
