import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class AdminService {
  final AuthService _auth = AuthService();

  Future<List<Map<String, dynamic>>> getSemesters() async {
    return _getList('/semesters?pageSize=1000');
  }

  Future<List<Map<String, dynamic>>> getSubjects() async {
    return _getList('/subjects?pageSize=1000');
  }

  Future<List<Map<String, dynamic>>> getCourses() async {
    return _getList('/courses?pageSize=1000');
  }

  Future<List<Map<String, dynamic>>> getUsers() async {
    return _getList('/users?pageSize=1000');
  }

  Future<List<Map<String, dynamic>>> getGroups() async {
    return _getList('/projects?pageSize=1000');
  }

  Future<List<Map<String, dynamic>>> _getList(String endpoint) async {
    try {
      final token = await _auth.getToken();
      final response = await http.get(
        Uri.parse('${AuthService.baseUrl}$endpoint'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        
        // ASP.NET BE logic: data might be in 'data' field or 'Data'
        dynamic payload = data['data'] ?? data['Data'] ?? data;

        if (payload is Map) {
          // Check for pagination wrappers: items, Items, results, Results
          final items = payload['items'] ?? payload['Items'] ?? 
                        payload['results'] ?? payload['Results'];
          
          if (items is List) {
            return List<Map<String, dynamic>>.from(items);
          }
        }

        if (payload is List) {
          return List<Map<String, dynamic>>.from(payload);
        }
      }
      return [];
    } catch (e) {
      print('AdminService Error ($endpoint): $e');
      return [];
    }
  }
}
