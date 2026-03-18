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

  // --- Lecturer APIs ---

  /// GET /api/lecturers/me/workload
  Future<Map<String, dynamic>?> getWorkload() async {
    final data = await _get("/lecturers/me/workload");
    return data != null ? Map<String, dynamic>.from(data) : null;
  }

  /// GET /api/lecturers/me/courses
  Future<List<Map<String, dynamic>>> getMyCourses() async {
    final data = await _get("/lecturers/me/courses");
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }

  /// GET /api/courses/{id}/pending-integrations
  Future<List<Map<String, dynamic>>> getPendingIntegrations(dynamic courseId) async {
    final data = await _get("/courses/$courseId/pending-integrations");
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }

  /// POST /api/projects/{id}/integrations/approve
  Future<bool> approveIntegration(dynamic projectId) async {
    return _post("/projects/$projectId/integrations/approve", {});
  }

  /// POST /api/projects/{id}/integrations/reject
  Future<bool> rejectIntegration(dynamic projectId, String reason) async {
    return _post("/projects/$projectId/integrations/reject", {"reason": reason});
  }

  /// Chấm báo cáo SRS (Review status & feedback)
  Future<bool> reviewSrs(dynamic srsId, {String? status, String? feedback, double? score}) async {
    bool ok = true;
    if (status != null) {
      ok = ok && await _patch("/srs/$srsId/status", {"status": status, "score": score});
    }
    if (feedback != null) {
      ok = ok && await _patch("/srs/$srsId/feedback", {"feedback": feedback});
    }
    return ok;
  }

  /// POST /api/alerts/send
  Future<bool> sendAlert(dynamic groupId, String message, {String severity = "MEDIUM"}) async {
    return _post("/alerts/send", {
      "groupId": groupId,
      "message": message,
      "severity": severity,
    });
  }

  /// GET /api/analytics/courses/{id}/contributions
  Future<List<Map<String, dynamic>>> getCourseContributions(dynamic courseId) async {
    final data = await _get("/analytics/courses/$courseId/contributions");
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }

  // --- Legacy / Extra ---

  Future<List<Map<String, dynamic>>> getActivityLogs({int limit = 5}) async {
    final data = await _get("/analytics/lecturer/activity-logs?limit=$limit");
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }

  Future<List<Map<String, dynamic>>> getCourseGroups(dynamic courseId) async {
    final data = await _get("/courses/$courseId/projects?pageSize=1000");
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }

  Future<List<Map<String, dynamic>>> getCourseStudents(dynamic courseId) async {
    final data = await _get("/courses/$courseId/students?pageSize=1000");
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }
}
