import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';

class AuthService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static const String baseUrl =
      "https://jira-github-export-system.onrender.com/api";

  /// LOGIN
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse("$baseUrl/sessions"),
        headers: {
          "Content-Type": "application/json"
        },
        body: jsonEncode({
          "email": email,
          "password": password
        }),
      );

      print("Status: ${response.statusCode}");
      print("Body: ${response.body}");

      final Map<String, dynamic> json = jsonDecode(response.body);

      if (response.statusCode == 200 && json["success"] == true) {
        final token = json["data"]["accessToken"];
        final user = User.fromJson(json["data"]["user"]);

        await _storage.write(key: "token", value: token);
        await _storage.write(key: "user", value: jsonEncode(user.toJson()));

        return {
          "success": true,
          "user": user
        };
      } else {
        return {
          "success": false,
          "error": json["message"] ?? "Login failed"
        };
      }
    } catch (e) {
      print("Login error: $e");
      return {
        "success": false,
        "error": "Cannot connect to server"
      };
    }
  }

  /// LOGOUT
  Future<void> logout() async {
    await _storage.delete(key: "token");
    await _storage.delete(key: "user");
  }

  /// CHECK LOGIN
  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: "token");
    return token != null;
  }

  /// GET CURRENT USER
  Future<User?> getCurrentUser() async {
    final userData = await _storage.read(key: "user");
    if (userData == null) return null;
    final Map<String, dynamic> json = jsonDecode(userData);
    return User.fromJson(json);
  }

  /// GET TOKEN
  Future<String?> getToken() async {
    return await _storage.read(key: "token");
  }
}
