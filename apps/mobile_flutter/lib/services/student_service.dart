import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'auth_service.dart';

class StudentService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final String _baseUrl = AuthService.baseUrl;

  Future<Map<String, String>> _headers() async {
    final token = await _storage.read(key: "token");
    return {
      "Content-Type": "application/json",
      "Authorization": "Bearer $token",
    };
  }

  /// GET /api/courses (Filtered by student if needed)
  Future<List<Map<String, dynamic>>> getMyCourses() async {
    final url = Uri.parse("$_baseUrl/courses?pageSize=1000");
    final response = await http.get(url, headers: await _headers());

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final list = (data['data'] ?? data['Data'] ?? data['items'] ?? []) as List;
      return list.cast<Map<String, dynamic>>();
    }
    return [];
  }

  /// GET /api/users/{id}/projects
  Future<List<Map<String, dynamic>>> getMyProjects(int userId) async {
    final url = Uri.parse("$_baseUrl/users/$userId/projects");
    final response = await http.get(url, headers: await _headers());

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final list = (data['data'] ?? data['Data'] ?? data['items'] ?? []) as List;
      return list.cast<Map<String, dynamic>>();
    }
    return [];
  }

  /// GET /api/groups - invitations are often separate
  Future<List<Map<String, dynamic>>> getInvitations() async {
    final url = Uri.parse("$_baseUrl/groups/invitations"); // Mocking endpoint based on common patterns
    final response = await http.get(url, headers: await _headers());

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final list = (data['data'] ?? data['Data'] ?? []) as List;
      return list.cast<Map<String, dynamic>>();
    }
    return [];
  }
}
