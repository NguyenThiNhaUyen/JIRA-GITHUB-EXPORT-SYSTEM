import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'auth_service.dart';

class LecturerService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final String _baseUrl = AuthService.baseUrl;

  Future<Map<String, String>> _headers() async {
    final token = await _storage.read(key: "token");
    return {
      "Content-Type": "application/json",
      "Authorization": "Bearer $token",
    };
  }

  /// GET /api/lecturers/{id}/workload
  Future<Map<String, dynamic>> getWorkload(int lecturerId) async {
    final url = Uri.parse("$_baseUrl/lecturers/$lecturerId/workload");
    final response = await http.get(url, headers: await _headers());

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return (data['data'] ?? data['Data'] ?? data) as Map<String, dynamic>;
    }
    throw Exception("Failed to load workload");
  }

  /// GET /api/analytics/lecturer/activity-logs
  Future<List<Map<String, dynamic>>> getActivityLogs({int limit = 5}) async {
    final url = Uri.parse("$_baseUrl/analytics/lecturer/activity-logs?limit=$limit");
    final response = await http.get(url, headers: await _headers());

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final list = (data['data'] ?? data['Data'] ?? data['items'] ?? []) as List;
      return list.cast<Map<String, dynamic>>();
    }
    return [];
  }

  /// GET /api/courses (Filtered by lecturer if needed, or backend might handle it)
  Future<List<Map<String, dynamic>>> getMyCourses() async {
    // Current backend might return all courses, we might need to filter manually
    // or use a specific endpoint if exists.
    final url = Uri.parse("$_baseUrl/courses?pageSize=1000");
    final response = await http.get(url, headers: await _headers());

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final list = (data['data'] ?? data['Data'] ?? data['items'] ?? data['results'] ?? []) as List;
      return list.cast<Map<String, dynamic>>();
    }
    return [];
  }

  /// GET /api/courses/{id}/projects (groups)
  Future<List<Map<String, dynamic>>> getCourseGroups(dynamic courseId) async {
    final url = Uri.parse("$_baseUrl/courses/$courseId/projects?pageSize=1000");
    final response = await http.get(url, headers: await _headers());

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final list = (data['data'] ?? data['Data'] ?? data['items'] ?? data['results'] ?? []) as List;
      return list.cast<Map<String, dynamic>>();
    }
    return [];
  }

  /// GET /api/courses/{id}/students
  Future<List<Map<String, dynamic>>> getCourseStudents(dynamic courseId) async {
    final url = Uri.parse("$_baseUrl/courses/$courseId/students?pageSize=1000");
    final response = await http.get(url, headers: await _headers());

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final list = (data['data'] ?? data['Data'] ?? data['items'] ?? data['results'] ?? []) as List;
      return list.cast<Map<String, dynamic>>();
    }
    return [];
  }

  /// POST /api/courses/{id}/projects
  Future<bool> createGroup(dynamic courseId, String name, List<String> studentIds) async {
    final url = Uri.parse("$_baseUrl/courses/$courseId/projects");
    final response = await http.post(
      url,
      headers: await _headers(),
      body: jsonEncode({
        "name": name,
        "studentIds": studentIds,
      }),
    );
    return response.statusCode == 200 || response.statusCode == 201;
  }
}
