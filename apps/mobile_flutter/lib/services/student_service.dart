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

  // --- Helpers ---
  Future<dynamic> _get(String path) async {
    try {
      final response = await http.get(Uri.parse("$_baseUrl$path"), headers: await _headers());
      if (response.statusCode >= 200 && response.statusCode < 300) {
        final json = jsonDecode(response.body);
        return json['data'] ?? json['Data'] ?? json;
      }
      return null;
    } catch(e) {
      return null;
    }
  }

  Future<bool> _post(String path, dynamic body) async {
    try {
      final response = await http.post(
        Uri.parse("$_baseUrl$path"),
        headers: await _headers(),
        body: jsonEncode(body),
      );
      return response.statusCode >= 200 && response.statusCode < 300;
    } catch(e) {
      return false;
    }
  }

  Future<bool> _patch(String path, dynamic body) async {
    try {
      final response = await http.patch(
        Uri.parse("$_baseUrl$path"),
        headers: await _headers(),
        body: jsonEncode(body),
      );
      return response.statusCode >= 200 && response.statusCode < 300;
    } catch(e) {
      return false;
    }
  }

  // --- Student APIs ---

  /// GET /api/student/me/stats - Dashboard cá nhân
  Future<Map<String, dynamic>?> getStats() async {
    final data = await _get("/student/me/stats");
    return data != null ? Map<String, dynamic>.from(data) : null;
  }

  /// GET /api/student/me/courses - Lớp học đang học
  Future<List<Map<String, dynamic>>> getMyCourses() async {
    final data = await _get("/student/me/courses");
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }

  /// GET /api/student/me/projects - Dự án đang tham gia
  Future<List<Map<String, dynamic>>> getMyProjects() async {
    final data = await _get("/student/me/projects");
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }

  /// GET /api/student/me/invitations - Lời mời vào nhóm
  Future<List<Map<String, dynamic>>> getInvitations() async {
    final data = await _get("/student/me/invitations");
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }

  /// PATCH /api/invitations/{id}/accept - Chấp nhận vào Team
  Future<bool> acceptInvitation(dynamic id) async {
    return _patch("/invitations/$id/accept", {});
  }

  /// PATCH /api/invitations/{id}/reject - Từ chối vào Team
  Future<bool> rejectInvitation(dynamic id) async {
    return _patch("/invitations/$id/reject", {});
  }

  /// POST /api/projects - Tạo nhóm
  Future<bool> createProject(Map<String, dynamic> body) async {
    return _post("/projects", body);
  }

  /// POST /api/srs - Nộp báo cáo SRS
  Future<bool> submitSrs(Map<String, dynamic> body) async {
    return _post("/srs", body);
  }

  /// POST /api/users/student/{userId}/links - Liên kết accounts
  Future<bool> linkAccounts(dynamic userId, Map<String, dynamic> links) async {
    return _post("/users/student/$userId/links", links);
  }
}
