import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:path_provider/path_provider.dart';
import 'auth_service.dart';
import 'api_mapper.dart';

class LecturerService {
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

  // --- Lecturer APIs ---

  /// GET /api/lecturers/me/workload
  Future<Map<String, dynamic>?> getWorkload() async {
    final data = await _get("/lecturers/me/workload");
    return data != null ? Map<String, dynamic>.from(data) : null;
  }

  /// GET /api/lecturers/me/courses
  Future<List<Map<String, dynamic>>> getMyCourses() async {
    final data = await _get("/lecturers/me/courses");
    return ApiMapper.extractItems(data).map(_normalizeCourse).toList();
  }

  /// GET /api/courses/{id}/pending-integrations
  Future<List<Map<String, dynamic>>> getPendingIntegrations(dynamic courseId) async {
    final data = await _get("/courses/$courseId/pending-integrations");
    return ApiMapper.extractItems(data).map(_normalizeProject).toList();
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
    return ApiMapper.extractItems(data);
  }

  /// GET /api/alerts
  Future<List<Map<String, dynamic>>> getAlerts() async {
    final data = await _get("/alerts?pageSize=1000");
    return ApiMapper.extractItems(data);
  }

  /// POST /api/alerts/{id}/resolve
  Future<bool> resolveAlert(dynamic id) async {
    final ok = await _patch("/alerts/$id/resolve", {});
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
    String? rawUrl;
    if (data is Map) {
      rawUrl = data['downloadUrl'] ?? data['url'] ?? data['link'] ?? data['filePath'];
    } else if (data is String) {
      rawUrl = data;
    }
    if (rawUrl == null || rawUrl.isEmpty) return null;
    // If the API returns a relative path, prepend the base URL
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      return '$_baseUrl$rawUrl';
    }
    return rawUrl;
  }

  /// GET /api/reports (My Reports)
  /// Backend trả về List<ReportExportResponse> với các field camelCase:
  /// id, type, format, status, fileUrl, fileName, createdAt, errorMessage
  Future<List<Map<String, dynamic>>> getMyReports() async {
    final data = await _get("/reports");
    final items = ApiMapper.extractItems(data);
    return items.map((r) {
      final id = r['id'] ?? r['reportId'];
      final type = r['type'] ?? r['reportType'] ?? 'Báo cáo';
      final format = (r['format'] ?? r['fileType'] ?? 'PDF').toString().toUpperCase();
      final status = r['status'] ?? 'COMPLETED';
      final fileUrl = r['fileUrl'] ?? r['FileUrl'] ?? r['filePath'] ?? r['url'] ?? r['downloadUrl'];
      final fileName = r['fileName'] ?? r['FileName']
          ?? (fileUrl != null ? fileUrl.toString().split('/').last : null)
          ?? 'report_$id.${format.toLowerCase()}';
      final createdAt = r['createdAt'] ?? r['date'] ?? r['generatedAt'] ?? r['requestedAt'] ?? '';

      // Parse scopeEntityId từ fileName vì backend chưa trả về trực tiếp
      // Pattern: project_{id}_srs_... / project_{id}_roster_... / course_{id}_commits_...
      final scopeEntityId = _parseScopeEntityId(fileName?.toString() ?? '');
      // Infer reportTypeCode từ type string hoặc filename
      final reportTypeCode = _inferReportTypeCode(type.toString(), fileName?.toString() ?? '');

      return {
        ...r,
        'id': id,
        'reportId': id,
        'type': type,
        'format': format,
        'status': status,
        'fileUrl': fileUrl,
        'filePath': fileUrl,
        'fileName': fileName,
        'date': createdAt,
        'errorMessage': r['errorMessage'],
        'scopeEntityId': scopeEntityId,
        'reportTypeCode': reportTypeCode,
      };
    }).toList();
  }

  /// Parse project/course ID từ tên file
  /// Ví dụ: project_24_srs_20260325.pdf → 24
  ///         course_5_commits_20260325.pdf → 5
  String? _parseScopeEntityId(String fileName) {
    final patterns = [
      RegExp(r'project_(\d+)_'),
      RegExp(r'course_(\d+)_'),
    ];
    for (final p in patterns) {
      final m = p.firstMatch(fileName);
      if (m != null) return m.group(1);
    }
    return null;
  }

  /// Infer loại report từ type string hoặc tên file
  String _inferReportTypeCode(String type, String fileName) {
    final t = type.toLowerCase();
    final f = fileName.toLowerCase();
    if (t.contains('srs') || f.contains('_srs_') || f.contains('_sra_')) return 'SRS_ISO29148';
    if (t.contains('commit') || f.contains('_commit')) return 'COMMIT_STATISTICS';
    if (t.contains('roster') || f.contains('_roster')) return 'TEAM_ROSTER';
    if (t.contains('activity') || t.contains('tổng kết') || f.contains('_activity')) return 'ACTIVITY_SUMMARY';
    return 'SRS_ISO29148'; // default
  }

  /// Tái tạo report bằng cách gọi lại generate endpoint, trả về Map data của report mới
  Future<Map<String, dynamic>?> regenerateReport(Map<String, dynamic> report) async {
    final typeCode = report['reportTypeCode']?.toString() ?? 'SRS_ISO29148';
    final entityId = report['scopeEntityId']?.toString();
    final format = report['format']?.toString() ?? 'PDF';

    if (entityId == null) throw Exception('Không xác định được ID nguồn của báo cáo này.');

    Map<String, dynamic>? result;
    switch (typeCode) {
      case 'COMMIT_STATISTICS':
        result = await generateCommitStats(courseId: entityId, format: format);
        break;
      case 'TEAM_ROSTER':
        result = await generateTeamRoster(projectId: entityId, format: format);
        break;
      case 'SRS_ISO29148':
      default:
        result = await generateSrsReport(projectId: entityId, format: format);
        break;
    }
    if (result == null) return null;

    // Lấy reportId từ result (backend trả { reportId: long })
    final newId = result['reportId'] ?? result['ReportId'] ?? result['id'];
    if (newId == null) return result;

    // Lấy fileUrl từ /download-link (file vừa tạo còn fresh trên disk)
    final freshUrl = await getDownloadLink(newId);
    return {
      ...result,
      'reportId': newId,
      'id': newId,
      'fileUrl': freshUrl,
      'filePath': freshUrl,
    };
  }


  /// Download report file — gọi endpoint /download (tái tạo on-demand từ DB)
  /// Fallback về fileUrl hoặc /download-link nếu endpoint mới chưa deploy
  Future<String> downloadReportFile(dynamic reportId, String fileName, {String? filePath}) async {
    final headers = await _headers();
    final candidates = <String>[];

    // 1. Endpoint mới: /api/reports/{id}/download — tái tạo on-demand, không cần file trên disk
    candidates.add('$_baseUrl/api/reports/$reportId/download');

    // 2. fileUrl đầy đủ từ API (nếu file vẫn còn trên disk)
    if (filePath != null && filePath.isNotEmpty) {
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        candidates.add(filePath);
      } else {
        final cleanPath = filePath.startsWith('/') ? filePath : '/$filePath';
        candidates.add('$_baseUrl$cleanPath');
      }
    }

    // 3. /download-link endpoint → lấy URL rồi fetch
    final linkData = await _get('/reports/$reportId/download-link');
    String? rawUrl;
    if (linkData is Map) {
      rawUrl = linkData['downloadUrl'] ?? linkData['url'] ?? linkData['link'];
    } else if (linkData is String) {
      rawUrl = linkData;
    }
    if (rawUrl != null && rawUrl.isNotEmpty) {
      if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        candidates.add(rawUrl);
      } else {
        candidates.add('$_baseUrl${rawUrl.startsWith('/') ? rawUrl : '/$rawUrl'}');
      }
    }

    // Thử từng URL, lấy cái đầu tiên trả về bytes thực (không phải JSON lỗi)
    http.Response? successResponse;
    for (final url in candidates) {
      try {
        final response = await http.get(Uri.parse(url), headers: headers);
        if (response.statusCode >= 200 &&
            response.statusCode < 300 &&
            response.bodyBytes.isNotEmpty) {
          final ct = response.headers['content-type'] ?? '';
          // Bỏ qua nếu là JSON (tức là lỗi từ server)
          if (!ct.contains('application/json')) {
            successResponse = response;
            break;
          }
        }
      } catch (_) {
        continue;
      }
    }

    if (successResponse == null) {
      throw Exception('Không thể tải file báo cáo. Vui lòng thử lại sau.');
    }

    // Lưu vào thư mục Documents
    final dir = await getApplicationDocumentsDirectory();
    final ext = _getExtFromContentType(successResponse.headers['content-type'] ?? '', fileName);
    final safeFileName = fileName.isNotEmpty ? fileName : 'report_$reportId$ext';
    final localPath = '${dir.path}/$safeFileName';
    await File(localPath).writeAsBytes(successResponse.bodyBytes);
    return localPath;
  }

  String _getExtFromContentType(String contentType, String fallbackFileName) {
    if (contentType.contains('pdf')) return '.pdf';
    if (contentType.contains('spreadsheetml') || contentType.contains('excel')) return '.xlsx';
    if (contentType.contains('csv')) return '.csv';
    // Suy ra từ tên file gốc
    final lower = fallbackFileName.toLowerCase();
    if (lower.endsWith('.pdf')) return '.pdf';
    if (lower.endsWith('.xlsx')) return '.xlsx';
    if (lower.endsWith('.csv')) return '.csv';
    return '.pdf'; // default
  }

  /// GET /api/projects - Tổng quan dự án (lọc theo courseId nếu có)
  Future<List<Map<String, dynamic>>> getProjects({dynamic courseId}) async {
    final path = courseId != null ? "/projects?courseId=$courseId" : "/projects";
    final data = await _get(path);
    return ApiMapper.extractItems(data).map(_normalizeProject).toList();
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
    // Backend provides projects by course via /api/projects?courseId=...
    final data = await _get("/projects?courseId=$courseId&pageSize=1000");
    return ApiMapper.extractItems(data).map(_normalizeProject).toList();
  }

  Future<List<Map<String, dynamic>>> getCourseStudents(dynamic courseId) async {
    final data = await _get("/courses/$courseId/students?pageSize=1000");
    return ApiMapper.extractItems(data).map(_normalizeStudent).toList();
  }

  Map<String, dynamic> _normalizeCourse(Map<String, dynamic> c) {
    return {
      ...c,
      'id': c['id'],
      'courseCode': ApiMapper.pickString(c, ['courseCode', 'code'], 'N/A'),
      'courseName': ApiMapper.pickString(c, ['courseName', 'name'], 'N/A'),
      'code': ApiMapper.pickString(c, ['courseCode', 'code'], 'N/A'),
      'name': ApiMapper.pickString(c, ['courseName', 'name'], 'N/A'),
      'subjectId': c['subjectId'],
      'subjectCode': ApiMapper.pickString(c, ['subjectCode'], ''),
      'semesterId': c['semesterId'],
      'semesterName': ApiMapper.pickString(c, ['semesterName'], ''),
      'currentStudents': ApiMapper.pickInt(c, ['currentStudents', 'studentCount'], 0),
      'maxStudents': ApiMapper.pickInt(c, ['maxStudents'], 0),
      'status': ApiMapper.pickString(c, ['status'], 'ACTIVE').toUpperCase(),
    };
  }

  Map<String, dynamic> _normalizeProject(Map<String, dynamic> p) {
    final integration = (p['integration'] is Map) ? Map<String, dynamic>.from(p['integration']) : <String, dynamic>{};
    return {
      ...p,
      'id': p['id'],
      'name': ApiMapper.pickString(p, ['name', 'projectName', 'groupName'], 'N/A'),
      'description': ApiMapper.pickString(p, ['description', 'topic'], ''),
      'githubStatus': ApiMapper.pickString(p, ['githubStatus', 'approvalStatus'], ApiMapper.pickString(integration, ['approvalStatus'], 'NONE')).toUpperCase(),
      'jiraStatus': ApiMapper.pickString(p, ['jiraStatus', 'approvalStatus'], ApiMapper.pickString(integration, ['approvalStatus'], 'NONE')).toUpperCase(),
      'students': p['students'] ?? p['members'] ?? p['teamMembers'] ?? const [],
      'members': p['members'] ?? p['students'] ?? p['teamMembers'] ?? const [],
      'integration': integration,
    };
  }

  Map<String, dynamic> _normalizeStudent(Map<String, dynamic> s) {
    return {
      ...s,
      'id': s['userId'] ?? s['id'],
      'userId': s['userId'] ?? s['id'],
      'fullName': ApiMapper.pickString(s, ['fullName', 'name'], 'N/A'),
      'name': ApiMapper.pickString(s, ['fullName', 'name'], 'N/A'),
      'studentCode': ApiMapper.pickString(s, ['studentCode', 'studentId'], ''),
      'code': ApiMapper.pickString(s, ['studentCode', 'studentId'], ''),
    };
  }
}
