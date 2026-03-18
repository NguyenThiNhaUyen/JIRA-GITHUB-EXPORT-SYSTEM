// Authentication Provider - State Management
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  
  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;

  bool get isAuthenticated => _user != null;

  /// lấy role đầu tiên (backend trả array)
  String? get userRole =>
      _user != null && _user!.roles.isNotEmpty ? _user!.roles.first : null;

  /// init app
  Future<void> init() async {
    _isLoading = true;
    notifyListeners();

    try {
      final isLoggedIn = await _authService.isLoggedIn();
      if (isLoggedIn) {
        _user = await _authService.getCurrentUser();
      }
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  /// login
  Future<Map<String, dynamic>> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.login(email, password);

      if (result['success'] == true) {
        _user = result['user'];
        _error = null;
      } else {
        _error = result['error'];
      }

      _isLoading = false;
      notifyListeners();

      return result;
    } catch (e) {
      _error = 'Đăng nhập thất bại';
      _isLoading = false;
      notifyListeners();

      return {
        'success': false,
        'error': _error,
      };
    }
  }

  /// logout
  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    _error = null;
    notifyListeners();
  }
}
