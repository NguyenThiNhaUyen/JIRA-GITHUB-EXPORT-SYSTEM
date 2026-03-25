import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'auth_service.dart';
import 'api_mapper.dart';

class StudentService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final String _baseUrl = AuthService.baseUrl;

  Future<Map<String, String>> _headers() async {
    final token = await _storage.read(key: "token");
    return <String, String>{
      "Content-Type": "application/json",
      if (token != null) "Authorization": "Bearer $token",
    };
  }

  // --- Helpers ---
  Future<dynamic> _get(String path) async {
    try {
      final response = await http.get(Uri.parse("$_baseUrl/api$path"), headers: await _headers());
      if (response.statusCode >= 200 && response.statusCode < 300) {
        final decoded = ApiMapper.decodeBody(response.body);
        return ApiMapper.extractData(decoded);
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

  Future<bool> _delete(String path) async {
    try {
      final response = await http.delete(
        Uri.parse("$_baseUrl/api$path"),
        headers: await _headers(),
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
    return ApiMapper.extractItems(data).map(_normalizeCourse).toList();
  }

  /// GET /api/student/me/projects - Dự án đang tham gia
  Future<List<Map<String, dynamic>>> getMyProjects() async {
    final data = await _get("/student/me/projects");
    return ApiMapper.extractItems(data).map(_normalizeProject).toList();
  }

  /// GET /api/alerts - Danh sách cảnh báo
  Future<List<Map<String, dynamic>>> getAlerts() async {
    final data = await _get("/alerts?pageSize=1000");
    return ApiMapper.extractItems(data);
  }

  /// GET /api/student/me/invitations - Lời mời vào nhóm
  Future<List<Map<String, dynamic>>> getInvitations() async {
    final data = await _get("/student/me/invitations");
    return ApiMapper.extractItems(data);
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
    final payload = {
      'courseId': body['courseId'] ?? body['CourseId'],
      'name': body['name'] ?? body['projectName'] ?? body['topic'],
      'description': body['description'] ?? body['desc'],
      'maxMembers': body['maxMembers'] ?? body['teamSize'] ?? 5,
    };
    return _post("/projects", payload);
  }

  /// POST /api/srs - Nộp báo cáo SRS
  Future<bool> submitSrs(Map<String, dynamic> body) async {
    // Backend expects multipart/form-data with fields: projectId + file
    final token = await _storage.read(key: "token");
    final projectId = body['projectId'] ?? body['project_id'];
    final filePath = body['filePath'] ?? body['path'];
    if (projectId == null || filePath == null) return false;

    try {
      final request = http.MultipartRequest(
        "POST",
        Uri.parse("$_baseUrl/api/srs"),
      );
      if (token != null) request.headers["Authorization"] = "Bearer $token";
      request.fields["projectId"] = projectId.toString();
      request.files.add(await http.MultipartFile.fromPath("file", File(filePath).path));
      final streamed = await request.send();
      return streamed.statusCode >= 200 && streamed.statusCode < 300;
    } catch (_) {
      return false;
    }
  }

  /// POST /api/users/student/{userId}/links - Liên kết accounts
  Future<bool> linkAccounts(dynamic userId, Map<String, dynamic> links) async {
    final payload = {
      'courseId': links['courseId'],
      'githubUrl': links['githubUrl'] ?? links['githubRepoUrl'],
      'jiraUrl': links['jiraUrl'] ?? links['jiraSiteUrl'],
    };
    return _post("/users/student/$userId/links", payload);
  }

  // --- Project Leader APIs ---

  /// POST /api/projects/{id}/members - Mời bạn vào nhóm
  Future<bool> inviteMember(dynamic projectId, Map<String, dynamic> body) async {
    final payload = {
      'studentUserId': body['studentUserId'] ?? body['userId'] ?? body['id'],
      'teamRole': body['teamRole'] ?? body['role'] ?? 'MEMBER',
      'responsibility': body['responsibility'],
    };
    return _post("/projects/$projectId/members", payload);
  }

  /// DELETE /api/projects/{id}/members/{uId} - Đuổi bạn khỏi nhóm
  Future<bool> removeMember(dynamic projectId, dynamic userId) async {
    return _delete("/projects/$projectId/members/$userId");
  }

  /// POST /api/projects/{id}/integrations - Gửi link tích hợp
  Future<bool> updateIntegrations(dynamic projectId, Map<String, dynamic> body) async {
    final payload = {
      'githubRepoUrl': body['githubRepoUrl'] ?? body['githubUrl'] ?? body['repositoryUrl'],
      'jiraProjectKey': body['jiraProjectKey'] ?? body['jiraKey'],
      'jiraSiteUrl': body['jiraSiteUrl'] ?? body['jiraUrl'],
    };
    return _post("/projects/$projectId/integrations", payload);
  }

  /// POST /api/projects/{id}/sync-commits - Đồng bộ dữ liệu thủ công
  Future<bool> syncCommits(dynamic projectId) async {
    return _post("/projects/$projectId/sync-commits", {});
  }

  Map<String, dynamic> _normalizeCourse(Map<String, dynamic> c) {
    return {
      ...c,
      'id': c['id'],
      'courseCode': ApiMapper.pickString(c, ['courseCode', 'subjectCode', 'code'], 'N/A'),
      'courseName': ApiMapper.pickString(c, ['courseName', 'name', 'title'], 'N/A'),
      'code': ApiMapper.pickString(c, ['courseCode', 'subjectCode', 'code'], 'N/A'),
      'name': ApiMapper.pickString(c, ['courseName', 'name', 'title'], 'N/A'),
      'status': ApiMapper.pickString(c, ['status'], 'ACTIVE').toUpperCase(),
      'lecturerNames': c['lecturerNames'] ?? c['lecturers'] ?? const [],
    };
  }

  Map<String, dynamic> _normalizeProject(Map<String, dynamic> p) {
    final integration = (p['integration'] is Map) ? Map<String, dynamic>.from(p['integration']) : <String, dynamic>{};
    return {
      ...p,
      'id': p['id'],
      'name': ApiMapper.pickString(p, ['name', 'teamName', 'topic'], 'N/A'),
      'courseId': p['courseId'],
      'team': p['team'] ?? p['members'] ?? p['teamMembers'] ?? const [],
      'members': p['members'] ?? p['team'] ?? p['teamMembers'] ?? const [],
      'repositoryName': ApiMapper.pickString(p, ['repositoryName'], ApiMapper.pickString(integration, ['githubRepoName'], 'No GitHub')),
      'jiraProjectKey': ApiMapper.pickString(p, ['jiraProjectKey'], ApiMapper.pickString(integration, ['jiraProjectKey'], 'No Jira')),
      'integration': integration,
    };
  }
}
