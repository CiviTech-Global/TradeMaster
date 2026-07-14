import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:trademaster/core/constants/api_constants.dart';

/// Persistent storage for the server base URL.
///
/// Uses flutter_secure_storage on mobile and falls back to a simple in-memory
/// value on web (secure storage is not reliably available there).
class ServerUrlRepository {
  static const _storageKey = 'server_base_url';
  static String? _memoryValue;

  final FlutterSecureStorage _secureStorage;

  ServerUrlRepository({FlutterSecureStorage? secureStorage})
      : _secureStorage = secureStorage ?? const FlutterSecureStorage();

  Future<String?> getServerUrl() async {
    if (kIsWeb) {
      return _memoryValue;
    }
    return _secureStorage.read(key: _storageKey);
  }

  Future<void> setServerUrl(String url) async {
    if (kIsWeb) {
      _memoryValue = url;
      return;
    }
    await _secureStorage.write(key: _storageKey, value: url);
  }

  Future<void> clearServerUrl() async {
    if (kIsWeb) {
      _memoryValue = null;
      return;
    }
    await _secureStorage.delete(key: _storageKey);
  }

  /// Returns a sanitized URL, or the platform default if none is stored.
  static String defaultUrl() => ApiConstants.baseUrl;

  /// Ensures the URL has a scheme and no trailing slash.
  static String sanitize(String url) {
    var sanitized = url.trim();
    if (sanitized.isEmpty) return defaultUrl();
    if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
      sanitized = 'http://$sanitized';
    }
    while (sanitized.endsWith('/')) {
      sanitized = sanitized.substring(0, sanitized.length - 1);
    }
    return sanitized;
  }
}
