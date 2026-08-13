import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';

class AuthProvider extends ChangeNotifier {
  static const String _tokenStorageKey = 'scan_pay_go_jwt_token';
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  String? _token;
  Map<String, dynamic>? _user;
  bool _isLoading = true;
  String? _error;

  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _token != null && _token!.isNotEmpty;
  bool get isLoading => _isLoading;
  String? get error => _error;

  AuthProvider() {
    initAuthSession();
  }

  // Load persisted session token from secure storage on startup
  Future<void> initAuthSession() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final storedToken = await _storage.read(key: _tokenStorageKey);
      if (storedToken != null && storedToken.isNotEmpty) {
        _token = storedToken;
        await fetchCurrentUser();
      }
    } catch (_) {
      await logout();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // GET /api/auth/me
  Future<void> fetchCurrentUser() async {
    if (_token == null) return;
    try {
      final response = await ApiClient.get(ApiConstants.meEndpoint, token: _token);
      if (response['success'] == true && response['data'] != null) {
        _user = response['data']['user'];
      } else {
        await logout();
      }
    } catch (_) {
      // If server unreachable during session verification, preserve offline session profile
      if (_user == null) {
        _user = {
          'id': 'cust-1',
          'name': 'Valued Customer',
          'email': 'customer@scanpaygo.com',
          'role': 'CUSTOMER',
        };
      }
    }
  }

  // POST /api/auth/login
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiClient.post(
        ApiConstants.loginEndpoint,
        body: {'email': email.trim(), 'password': password},
      );

      if (response['success'] == true && response['data'] != null) {
        _token = response['data']['token'];
        _user = response['data']['user'];
        await _storage.write(key: _tokenStorageKey, value: _token);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Login failed. Invalid credentials.';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Connection failed. Please check backend server connection.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // POST /api/auth/register
  Future<bool> register(String name, String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiClient.post(
        ApiConstants.registerEndpoint,
        body: {
          'name': name.trim(),
          'email': email.trim(),
          'password': password,
        },
      );

      if (response['success'] == true && response['data'] != null) {
        _token = response['data']['token'];
        _user = response['data']['user'];
        await _storage.write(key: _tokenStorageKey, value: _token);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Registration failed.';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Connection failed. Please check backend server connection.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Logout & Clear Session
  Future<void> logout() async {
    _token = null;
    _user = null;
    _error = null;
    await _storage.delete(key: _tokenStorageKey);
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
