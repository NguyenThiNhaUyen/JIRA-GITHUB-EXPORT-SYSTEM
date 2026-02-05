// Authentication Service - Mock authentication
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';

class AuthService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  // Mock users database
  final Map<String, Map<String, dynamic>> _mockUsers = {
    'admin@fpt.edu.vn': {
      'id': 'admin1',
      'email': 'admin@fpt.edu.vn',
      'name': 'Admin User',
      'role': 'ADMIN',
      'password': 'admin123',
      'department': 'IT',
    },
    'namngv@fpt.edu.vn': {
      'id': 'lec1',
      'email': 'namngv@fpt.edu.vn',
      'name': 'Nguyễn Văn Nam',
      'role': 'LECTURER',
      'password': 'lecturer123',
      'department': 'Software Engineering',
    },
    'anvse2026001@fpt.edu.vn': {
      'id': 'stu1',
      'email': 'anvse2026001@fpt.edu.vn',
      'name': 'Nguyễn Văn A',
      'role': 'STUDENT',
      'password': 'student123',
      'studentCode': 'SE2026001',
    },
  };

  // Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    await Future.delayed(const Duration(milliseconds: 500)); // Simulate network delay
    
    if (_mockUsers.containsKey(email)) {
      final userData = _mockUsers[email]!;
      
      if (userData['password'] == password) {
        final user = User.fromJson(userData);
        
        // Save token and user data
        await _storage.write(key: 'token', value: 'mock_token_${user.id}');
        await _storage.write(key: 'user', value: user.toJson().toString());
        
        return {
          'success': true,
          'user': user,
        };
      }
    }
    
    return {
      'success': false,
      'error': 'Email hoặc mật khẩu không đúng',
    };
  }

  // Logout
  Future<void> logout() async {
    await _storage.delete(key: 'token');
    await _storage.delete(key: 'user');
  }

  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: 'token');
    return token != null;
  }

  // Get stored user (simplified)
  Future<User?> getCurrentUser() async {
    final token = await _storage.read(key: 'token');
    if (token == null) return null;
    
    // In real app, validate token and fetch user from server
    // For now, return mock user based on token
    if (token.contains('admin1')) {
      return User.fromJson(_mockUsers['admin@fpt.edu.vn']!);
    } else if (token.contains('lec1')) {
      return User.fromJson(_mockUsers['namngv@fpt.edu.vn']!);
    } else if (token.contains('stu1')) {
      return User.fromJson(_mockUsers['anvse2026001@fpt.edu.vn']!);
    }
    return null;
  }
}
