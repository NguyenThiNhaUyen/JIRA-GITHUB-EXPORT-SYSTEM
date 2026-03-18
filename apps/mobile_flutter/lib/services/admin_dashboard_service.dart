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
