import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import 'admin_field_mapper.dart';

class AdminService {
  final AuthService _auth = AuthService();

  // ─── GET Methods ──────────────────────────────────────────

  Future<List<Map<String, dynamic>>> getSemesters() async {
    final raw = await _getList('/semesters?pageSize=1000');
    return raw
        .map((s) => {
              ...s,
              'id': AdminFieldMapper.pick(s, ['id', 'Id'], 0),
              'name': AdminFieldMapper.pickString(s, ['name', 'Name'], 'N/A'),
              'code': AdminFieldMapper.pickString(s, ['code', 'Code'], ''),
              'startDate': AdminFieldMapper.pickString(s, ['startDate', 'start_date', 'StartDate'], ''),
              'endDate': AdminFieldMapper.pickString(s, ['endDate', 'end_date', 'EndDate'], ''),
              'status': AdminFieldMapper.pickString(s, ['status', 'Status'], 'UPCOMING').toUpperCase(),
            })
        .toList();
  }

  Future<List<Map<String, dynamic>>> getSubjects() async {
    final raw = await _getList('/subjects?pageSize=1000');
    return raw
        .map((s) => {
              ...s,
              'id': AdminFieldMapper.pick(s, ['id', 'Id'], 0),
              'subjectCode': AdminFieldMapper.pickString(s, ['subjectCode', 'code', 'SubjectCode'], ''),
              'subjectName': AdminFieldMapper.pickString(s, ['subjectName', 'name', 'SubjectName'], ''),
              'department': AdminFieldMapper.pickString(s, ['department', 'Department'], 'N/A'),
              'description': AdminFieldMapper.pickString(s, ['description', 'Description'], ''),
              'credits': AdminFieldMapper.pickInt(s, ['credits', 'Credits'], 0),
              'maxStudents': AdminFieldMapper.pickInt(s, ['maxStudents', 'max_students', 'MaxStudents'], 40),
              'status': AdminFieldMapper.pickString(s, ['status', 'Status'], 'ACTIVE').toUpperCase(),
              // Backward-compatible aliases for existing UI
              'code': AdminFieldMapper.pickString(s, ['subjectCode', 'code', 'SubjectCode'], ''),
              'name': AdminFieldMapper.pickString(s, ['subjectName', 'name', 'SubjectName'], ''),
            })
        .toList();
  }

  Future<List<Map<String, dynamic>>> getCourses() async {
    final raw = await _getList('/courses?pageSize=1000');
    return raw.map(_normalizeCourse).toList();
  }

  Future<List<Map<String, dynamic>>> getUsers({String? role}) async {
    String url = '/users?pageSize=1000';
    if (role != null) url += '&role=$role';
    final raw = await _getList(url);
    return raw
        .map((u) => {
              ...u,
              'id': AdminFieldMapper.pick(u, ['id', 'Id'], 0),
              'fullName': AdminFieldMapper.pickString(u, ['fullName', 'name', 'FullName'], 'N/A'),
              'email': AdminFieldMapper.pickString(u, ['email', 'Email'], ''),
              'role': AdminFieldMapper.pickString(u, ['role', 'Role'], '').toUpperCase().isNotEmpty
                  ? AdminFieldMapper.pickString(u, ['role', 'Role'], '').toUpperCase()
                  : ((u['roles'] is List && (u['roles'] as List).isNotEmpty)
                      ? (u['roles'] as List).first.toString().toUpperCase()
                      : 'STUDENT'),
              'enabled': u['status'] != null
                  ? AdminFieldMapper.pickString(u, ['status']).toUpperCase() != 'DISABLED'
                  : AdminFieldMapper.pickBool(u, ['enabled', 'isEnabled'], true),
              'studentCode': AdminFieldMapper.pick(u, ['studentCode', 'StudentCode', 'studentId']),
              // Backward-compatible aliases
              'name': AdminFieldMapper.pickString(u, ['fullName', 'name', 'FullName'], 'N/A'),
              'studentId': AdminFieldMapper.pick(u, ['studentId', 'studentCode', 'StudentCode']),
            })
        .toList();
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
    return _post('/courses', _normalizeCoursePayload(data));
  }

  Future<bool> updateCourse(int id, Map<String, dynamic> data) async {
    return _request('PUT', '/courses/$id', body: _normalizeCoursePayload(data));
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

  Map<String, dynamic> _normalizeCoursePayload(Map<String, dynamic> data) {
    // Keep compatibility with existing UI payload keys while sending backend contract names.
    return {
      if (data['subjectId'] != null) 'subjectId': data['subjectId'],
      if (data['semesterId'] != null) 'semesterId': data['semesterId'],
      if ((data['courseCode'] ?? data['code']) != null)
        'courseCode': (data['courseCode'] ?? data['code']).toString(),
      if ((data['courseName'] ?? data['name']) != null)
        'courseName': (data['courseName'] ?? data['name']).toString(),
      if (data['maxStudents'] != null) 'maxStudents': data['maxStudents'],
      if (data['status'] != null) 'status': data['status'],
    };
  }

  Map<String, dynamic> _normalizeCourse(Map<String, dynamic> c) {
    final lecturers = (c['lecturers'] is List) ? List.from(c['lecturers']) : const <dynamic>[];
    final enrollments = (c['enrollments'] is List) ? List.from(c['enrollments']) : const <dynamic>[];

    return {
      ...c,
      // Canonical camelCase values from backend contracts
      'id': c['id'] ?? c['Id'],
      'courseCode': c['courseCode'] ?? c['code'] ?? c['CourseCode'],
      'courseName': c['courseName'] ?? c['name'] ?? c['CourseName'],
      'subjectId': c['subjectId'] ?? c['subject_id'] ?? c['SubjectId'],
      'semesterId': c['semesterId'] ?? c['semester_id'] ?? c['SemesterId'],
      'status': c['status'] ?? c['Status'],
      'maxStudents': c['maxStudents'] ?? c['max_students'] ?? c['MaxStudents'],
      'currentStudents': c['currentStudents'] ?? c['current_students'] ?? c['CurrentStudents'] ?? 0,
      'projectsCount': c['projectsCount'] ?? c['projects_count'] ?? c['ProjectsCount'] ?? 0,
      // Backward-compatible aliases used by existing screens
      'code': c['courseCode'] ?? c['code'] ?? c['CourseCode'],
      'name': c['courseName'] ?? c['name'] ?? c['CourseName'],
      'lecturers': lecturers
          .map((l) => {
                ...Map<String, dynamic>.from(l as Map),
                'id': (l as Map)['id'] ?? l['userId'] ?? l['Id'] ?? l['UserId'],
                'name': l['name'] ?? l['fullName'] ?? l['FullName'],
              })
          .toList(),
      'enrollments': enrollments
          .map((e) => {
                ...Map<String, dynamic>.from(e as Map),
                'user': {
                  ...((e as Map)['user'] is Map ? Map<String, dynamic>.from(e['user']) : <String, dynamic>{}),
                  'id': (e['user'] is Map ? e['user']['id'] : null) ?? e['userId'] ?? e['Id'] ?? e['UserId'],
                  'name': (e['user'] is Map ? e['user']['name'] : null) ?? e['fullName'] ?? e['FullName'],
                }
              })
          .toList(),
    };
  }
}
