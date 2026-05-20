import 'dart:io' show Platform;

class ApiConstants {
  /// Base URL for the API server.
  ///
  /// Uses environment variable `API_BASE_URL` if set (via --dart-define).
  /// Otherwise auto-detects:
  ///   - Android emulator: 10.0.2.2 (maps to host localhost)
  ///   - Everything else (iOS sim, physical device): localhost
  ///
  /// For a physical device on the same WiFi, pass:
  ///   `flutter run --dart-define=API_BASE_URL=http://YOUR_IP:3000`
  static const String _envBaseUrl = String.fromEnvironment('API_BASE_URL');

  static String get baseUrl {
    if (_envBaseUrl.isNotEmpty) return _envBaseUrl;

    // Android emulator maps 10.0.2.2 -> host machine localhost
    if (Platform.isAndroid) {
      return 'http://192.168.1.105:3000';
    }
    // iOS simulator / desktop can reach localhost directly
    return 'http://localhost:3000';
  }

  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
