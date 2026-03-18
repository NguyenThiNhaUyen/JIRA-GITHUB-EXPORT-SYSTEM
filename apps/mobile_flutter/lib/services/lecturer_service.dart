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
      final response = await http.get(Uri.parse("$_baseUrl/api$path"), headers: await _headers());
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
        Uri.parse("$_baseUrl/api$path"),
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
        Uri.parse("$_baseUrl/api$path"),
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

  /// Duyệt dự án (Bắt đầu cho hệ thống Sync code)
  Future<bool> approveIntegration(dynamic projectId) async {
    return _post("/projects/$projectId/integrations/approve", {});
  }

  /// Từ chối dự án (Yêu cầu nhóm gửi lại link đúng)
  Future<bool> rejectIntegration(dynamic projectId, String reason) async {
    return _post("/projects/$projectId/integrations/reject", {"reason": reason});
  }

  /// Chấm báo cáo SRS (Gán trạng thái, điểm và feedback)
  /// POST /api/srs/{id}/review
  Future<bool> reviewSrs(dynamic srsId, {required String status, required String feedback, required double score}) async {
    return _post("/srs/$srsId/review", {
      "status": status,
      "feedback": feedback,
      "score": score
    });
  }

  /// GET /api/srs
  Future<List<Map<String, dynamic>>> getSrsReports() async {
    final data = await _get("/srs?pageSize=1000");
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }

  /// GET /api/alerts
  Future<List<Map<String, dynamic>>> getAlerts() async {
    final data = await _get("/alerts?pageSize=1000");
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }

  /// POST /api/alerts/{id}/resolve
  Future<bool> resolveAlert(dynamic id) async {
    final ok = await _post("/alerts/$id/resolve", {});
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
  Future<dynamic> getCourseContributions(dynamic courseId) async {
    final data = await _get("/analytics/courses/$courseId/contributions");
    return data;
  }

  // --- New Advanced Analytics APIs (Lecturer) ---

  /// GET /api/analytics/lecturer/courses - Thống kê khối lượng giảng dạy (Lecturer workload)
  Future<Map<String, dynamic>?> getLecturerCoursesStats() async {
    final data = await _get("/analytics/lecturer/courses");
    return data != null ? Map<String, dynamic>.from(data) : null;
  }

  /// GET /api/analytics/lecturer/activity-logs - Nhật ký hoạt động của riêng giảng viên
  Future<List<dynamic>> getLecturerActivityLogs({int limit = 10}) async {
    final data = await _get("/analytics/lecturer/activity-logs?limit=$limit");
    if (data is List) return data;
    return [];
  }

  /// GET /api/analytics/commit-trends - Xu hướng commit trong các lớp mình dạy
  Future<List<dynamic>> getCommitTrends({int days = 7}) async {
    final data = await _get("/analytics/commit-trends?days=$days");
    if (data is List) return data;
    return [];
  }

  /// GET /api/analytics/heatmap - Biểu đồ nhiệt hoạt động chung của các nhóm phụ trách
  Future<List<dynamic>> getHeatmap({int days = 90}) async {
    final data = await _get("/analytics/heatmap?days=$days");
    if (data is List) return data;
    return [];
  }

  /// GET /api/analytics/activity-log - Nhật ký hệ thống (Audit logs - bản Lecturer rút gọn)
  Future<List<dynamic>> getAuditLogs({int limit = 10}) async {
    final data = await _get("/analytics/activity-log?limit=$limit");
    if (data is List) return data;
    return [];
  }

  // --- Legacy / Extra ---

  Future<List<Map<String, dynamic>>> getActivityLogs({int limit = 5}) async {
    final data = await _get("/analytics/lecturer/activity-logs?limit=$limit");
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }

  // --- Export / Reports ---

  /// POST /api/reports/commit-statistics
  Future<Map<String, dynamic>?> generateCommitStats({required String courseId, String format = "PDF"}) async {
    final response = await http.post(
      Uri.parse("$_baseUrl/api/reports/commit-statistics?courseId=$courseId&format=$format"),
      headers: await _headers(),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final json = jsonDecode(response.body);
      return json['data'] ?? json['Data'] ?? json;
    }
    return null;
  }

  /// POST /api/reports/team-roster
  Future<Map<String, dynamic>?> generateTeamRoster({required String projectId, String format = "PDF"}) async {
    final response = await http.post(
      Uri.parse("$_baseUrl/api/reports/team-roster?projectId=$projectId&format=$format"),
      headers: await _headers(),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final json = jsonDecode(response.body);
      return json['data'] ?? json['Data'] ?? json;
    }
    return null;
  }

  /// POST /api/reports/srs
  Future<Map<String, dynamic>?> generateSrsReport({required String projectId, String format = "PDF"}) async {
    final response = await http.post(
      Uri.parse("$_baseUrl/api/reports/srs?projectId=$projectId&format=$format"),
      headers: await _headers(),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final json = jsonDecode(response.body);
      return json['data'] ?? json['Data'] ?? json;
    }
    return null;
  }

  /// GET /api/reports/{id}/download-link
  Future<String?> getDownloadLink(dynamic reportId) async {
    final data = await _get("/reports/$reportId/download-link");
    if (data is Map) return data['downloadUrl'] ?? data['url'] ?? data['link'];
    if (data is String) return data;
    return null;
  }

  /// GET /api/reports (My Reports)
  Future<List<Map<String, dynamic>>> getMyReports() async {
    final data = await _get("/reports");
    if (data is List) return data.cast<Map<String, dynamic>>();
    return [];
  }
  /// GET /api/projects - Tổng quan dự án (lọc theo courseId nếu có)
  Future<List<Map<String, dynamic>>> getProjects({dynamic courseId}) async {
    final path = courseId != null ? "/projects?courseId=$courseId" : "/projects";
    final data = await _get(path);
    if (data is List) return data.cast<Map<String, dynamic>>();
    if (data is Map && (data['items'] != null || data['Items'] != null)) {
      final items = data['items'] ?? data['Items'];
      if (items is List) return items.cast<Map<String, dynamic>>();
    }
    return [];
  }

  /// GET /api/projects/{id}/metrics - Chỉ số chi tiết dự án
  Future<Map<String, dynamic>?> getProjectMetrics(dynamic projectId) async {
    final data = await _get("/projects/$projectId/metrics");
    return data != null ? Map<String, dynamic>.from(data) : null;
  }

  /// POST /api/projects/{id}/sync-commits - Bắt đầu đồng bộ code (Sync Now)
  Future<bool> syncProject(dynamic projectId) async {
    return _post("/projects/$projectId/sync-commits", {});
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
