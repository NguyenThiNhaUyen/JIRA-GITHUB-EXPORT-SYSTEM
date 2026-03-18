import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'auth_service.dart';

class CommonService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final String _baseUrl = AuthService.baseUrl;

  Future<Map<String, String>> _headers({bool auth = true}) async {
    final Map<String, String> headers = {
      "Content-Type": "application/json",
    };
    if (auth) {
      final token = await _storage.read(key: "token");
      if (token != null) {
        headers["Authorization"] = "Bearer $token";
      }
    }
    return headers;
  }

  // --- Notifications ---

  /// GET /api/notifications - Danh sách thông báo
  Future<List<Map<String, dynamic>>> getNotifications() async {
    try {
      final response = await http.get(
        Uri.parse("$_baseUrl/api/notifications"),
        headers: await _headers(),
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        final data = json['data'] ?? json['Data'] ?? json;
        if (data is List) return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// PATCH /api/notifications/{id}/read - Đã đọc thông báo
  Future<bool> markNotificationAsRead(dynamic id) async {
    try {
      final response = await http.patch(
        Uri.parse("$_baseUrl/api/notifications/$id/read"),
        headers: await _headers(),
      );
      return response.statusCode >= 200 && response.statusCode < 300;
    } catch (e) {
      return false;
    }
  }

  // --- Dropdowns / Meta ---

  /// GET /api/semesters/all - Danh sách học kỳ
  Future<List<Map<String, dynamic>>> getSemesters() async {
    try {
      final response = await http.get(
        Uri.parse("$_baseUrl/api/semesters/all"),
        headers: await _headers(auth: false),
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        final data = json['data'] ?? json['Data'] ?? json;
        if (data is List) return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// GET /api/subjects/all - Danh sách môn học
  Future<List<Map<String, dynamic>>> getSubjects() async {
    try {
      final response = await http.get(
        Uri.parse("$_baseUrl/api/subjects/all"),
        headers: await _headers(auth: false),
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        final data = json['data'] ?? json['Data'] ?? json;
        if (data is List) return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
