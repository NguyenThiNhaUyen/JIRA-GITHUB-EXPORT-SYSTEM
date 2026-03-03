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
  String? get userRole => _user?.role;

  // Initialize - check if user is already logged in
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

  // Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.login(email, password);
      
      if (result['success'] == true) {
        _user = result['user'] as User;
        _error = null;
      } else {
        _error = result['error'] as String;
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

  // Logout
  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    _error = null;
    notifyListeners();
  }
}
