import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class AdminService {
  final AuthService _auth = AuthService();

  // ─── GET Methods ──────────────────────────────────────────

  Future<List<Map<String, dynamic>>> getSemesters() async {
    return _getList('/semesters?pageSize=1000');
  }

  Future<List<Map<String, dynamic>>> getSubjects() async {
    return _getList('/subjects?pageSize=1000');
  }

  Future<List<Map<String, dynamic>>> getCourses() async {
    return _getList('/courses?pageSize=1000');
  }

  Future<List<Map<String, dynamic>>> getUsers({String? role}) async {
    String url = '/users?pageSize=1000';
    if (role != null) url += '&role=$role';
    return _getList(url);
  }

  Future<List<Map<String, dynamic>>> getGroups() async {
    return _getList('/projects?pageSize=1000');
  }

  // ─── POST / PUT / DELETE Methods (Semesters) ─────────────

  Future<Map<String, dynamic>?> createSemester(Map<String, dynamic> data) async {
    return _post('/semesters', data);
  }

  Future<bool> updateSemester(int id, Map<String, dynamic> data) async {
    return _request('PUT', '/semesters/$id', body: data);
  }

  Future<bool> deleteSemester(int id) async {
    return _request('DELETE', '/semesters/$id');
  }

  Future<bool> generateSemesters(int year) async {
    return _request('POST', '/semesters/generate', body: {'year': year});
  }

  // ─── POST / PUT / DELETE Methods (Subjects) ──────────────

  Future<Map<String, dynamic>?> createSubject(Map<String, dynamic> data) async {
    return _post('/subjects', data);
  }

  Future<bool> updateSubject(int id, Map<String, dynamic> data) async {
    return _request('PUT', '/subjects/$id', body: data);
  }

  Future<bool> deleteSubject(int id) async {
    return _request('DELETE', '/subjects/$id');
  }

  // ─── POST / PUT / DELETE Methods (Courses) ───────────────

  Future<Map<String, dynamic>?> createCourse(Map<String, dynamic> data) async {
    return _post('/courses', data);
  }

  Future<bool> updateCourse(int id, Map<String, dynamic> data) async {
    return _request('PUT', '/courses/$id', body: data);
  }

  Future<bool> deleteCourse(int id) async {
    return _request('DELETE', '/courses/$id');
  }

  Future<bool> assignLecturer(int courseId, int lecturerUserId) async {
    return _request('POST', '/courses/$courseId/lecturers', 
      body: {'lecturerUserId': lecturerUserId});
  }

  Future<bool> removeLecturer(int courseId, int lecturerUserId) async {
    return _request('DELETE', '/courses/$courseId/lecturers/$lecturerUserId');
  }

  Future<bool> removeEnrollment(int courseId, int studentUserId) async {
    return _request('DELETE', '/courses/$courseId/enrollments/$studentUserId');
  }

  // ─── PATCH Methods (Users) ────────────────────────────────

  Future<bool> updateUserRole(int userId, String role) async {
    return _request('PATCH', '/users/$userId/role', body: {'role': role});
  }

  Future<bool> updateUserStatus(int userId, bool enabled) async {
    return _request('PATCH', '/users/$userId/status', body: {'enabled': enabled});
  }

  Future<bool> resetPassword(int userId, String newPassword) async {
    return _request('POST', '/users/$userId/reset-password', 
      body: {'newPassword': newPassword});
  }

  // ─── REPORT Generation Methods ──────────────────────────

  Future<bool> generateCommitStats(String courseId, {String format = "PDF"}) async {
    return _request('POST', '/reports/commit-statistics?courseId=$courseId&format=$format');
  }

  Future<bool> generateTeamRoster(String courseId, {String format = "PDF"}) async {
    return _request('POST', '/reports/team-roster?courseId=$courseId&format=$format');
  }

  Future<bool> generateSrs(String courseId, {String format = "PDF"}) async {
    return _request('POST', '/reports/srs?courseId=$courseId&format=$format');
  }

  // ─── Private Helpers ─────────────────────────────────────

  Future<List<Map<String, dynamic>>> _getList(String endpoint) async {
    try {
      final token = await _auth.getToken();
      final response = await http.get(
        Uri.parse('${AuthService.baseUrl}/api$endpoint'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        dynamic payload = data['data'] ?? data['Data'] ?? data;

        if (payload is Map) {
          final items = payload['items'] ?? payload['Items'] ?? 
                        payload['results'] ?? payload['Results'];
          if (items is List) return List<Map<String, dynamic>>.from(items);
        }
        if (payload is List) return List<Map<String, dynamic>>.from(payload);
      }
      return [];
    } catch (e) {
      print('AdminService GET Error ($endpoint): $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> _post(String endpoint, dynamic body) async {
    try {
      final token = await _auth.getToken();
      final url = Uri.parse('${AuthService.baseUrl}/api$endpoint');
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        return data['data'] ?? data['Data'] ?? data;
      }
      return null;
    } catch (e) {
      print('AdminService POST Error ($endpoint): $e');
      return null;
    }
  }

  Future<bool> _request(String method, String endpoint, {dynamic body}) async {
    try {
      final token = await _auth.getToken();
      final url = Uri.parse('${AuthService.baseUrl}/api$endpoint');
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      http.Response response;
      switch (method.toUpperCase()) {
        case 'POST':
          response = await http.post(url, headers: headers, body: jsonEncode(body));
          break;
        case 'PUT':
          response = await http.put(url, headers: headers, body: jsonEncode(body));
          break;
        case 'PATCH':
          response = await http.patch(url, headers: headers, body: jsonEncode(body));
          break;
        case 'DELETE':
          response = await http.delete(url, headers: headers);
          break;
        default:
          return false;
      }

      print('AdminService $method ($endpoint) Response: ${response.statusCode} - ${response.body}');
      return response.statusCode >= 200 && response.statusCode < 300;
    } catch (e) {
      print('AdminService $method Error ($endpoint): $e');
      return false;
    }
  }
}
