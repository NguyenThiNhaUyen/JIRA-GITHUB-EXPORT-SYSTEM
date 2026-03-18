import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';

class AuthService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static const String baseUrl =
      "https://jira-github-export-system.onrender.com";

  /// =========================
  /// BASE REQUEST (giống interceptor)
  /// =========================
  Future<http.Response> _request(
    String method,
    String endpoint, {
    Map<String, dynamic>? body,
    bool auth = false,
    int retry = 2,
  }) async {
    final url = Uri.parse("$baseUrl$endpoint");

    int attempt = 0;

    while (true) {
      try {
        final headers = {
          "Content-Type": "application/json",
        };

        // attach token giống Axios interceptor
        if (auth) {
          final token = await _storage.read(key: "token");
          if (token != null) {
            headers["Authorization"] = "Bearer $token";
          }
        }

        late http.Response response;

        if (method == "POST") {
          response = await http.post(
            url,
            headers: headers,
            body: jsonEncode(body ?? {}),
          );
        } else if (method == "GET") {
          response = await http.get(url, headers: headers);
        } else {
          throw Exception("Unsupported method");
        }

        return response;
      } catch (e) {
        if (attempt >= retry) rethrow;
        attempt++;
        await Future.delayed(const Duration(seconds: 2));
      }
    }
  }

  /// =========================
  /// LOGIN
  /// =========================
  Future<Map<String, dynamic>> login(
      String email, String password) async {
    try {
      final response = await _request(
        "POST",
        "/api/sessions",
        body: {
          "email": email,
          "password": password,
        },
      );

      print("Status: ${response.statusCode}");
      print("Body: ${response.body}");

      final Map<String, dynamic> json = jsonDecode(response.body);

      if (response.statusCode == 200 && json["success"] == true) {
        final token = json["data"]["accessToken"];
        final user = User.fromJson(json["data"]["user"]);

        await _storage.write(key: "token", value: token);
        await _storage.write(
            key: "user", value: jsonEncode(user.toJson()));

        return {
          "success": true,
          "user": user,
        };
      }

      return {
        "success": false,
        "error": json["message"] ?? "Login failed",
      };
    } catch (e) {
      print("Login error: $e");

      return {
        "success": false,
        "error": "Server is waking up, please try again",
      };
    }
  }

  /// =========================
  /// LOGOUT
  /// =========================
  Future<void> logout() async {
    await _storage.deleteAll();
  }

  /// =========================
  /// CHECK LOGIN
  /// =========================
  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: "token");
    return token != null;
  }

  /// =========================
  /// GET CURRENT USER
  /// =========================
  Future<User?> getCurrentUser() async {
    final userData = await _storage.read(key: "user");

    if (userData == null) return null;

    final Map<String, dynamic> json = jsonDecode(userData);
    return User.fromJson(json);
  }

  /// =========================
  /// GET TOKEN
  /// =========================
  Future<String?> getToken() async {
    return await _storage.read(key: "token");
  }
}