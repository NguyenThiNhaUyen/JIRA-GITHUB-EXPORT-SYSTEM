import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class AdminDashboardService {
  final AuthService _auth = AuthService();

  Future<Map<String, dynamic>> getDashboardData() async {
    try {
      final results = await Future.wait([
        _get('/analytics/stats'),
        _get('/analytics/integration-stats'),
        _get('/analytics/commit-trends?days=7'),
        _get('/analytics/heatmap?days=90'),
        _get('/analytics/team-rankings?limit=4'),
        _get('/analytics/inactive-teams'),
        _get('/analytics/team-activities'),
        _get('/analytics/activity-log?limit=5'),
        _get('/courses?pageSize=5'),
        _get('/projects?pageSize=5'),
      ]);

      return {
        'stats': results[0],
        'integrationStats': results[1],
        'commitData': results[2],
        'heatmapData': results[3],
        'teamRanking': results[4],
        'inactiveTeams': results[5],
        'teamActivity': results[6],
        'systemActivity': results[7],
        'recentCourses': (results[8] is Map) ? (results[8]['items'] ?? []) : (results[8] is List ? results[8] : []),
        'recentGroups': (results[9] is Map) ? (results[9]['items'] ?? []) : (results[9] is List ? results[9] : []),
      };
    } catch (e) {
      print('AdminDashboardService Error: $e');
      throw Exception('Lỗi nạp dữ liệu Dashboard: $e');
    }
  }

  Future<dynamic> _get(String endpoint) async {
    try {
      final token = await _auth.getToken();
      final response = await http.get(
        Uri.parse('${AuthService.baseUrl}$endpoint'),
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
