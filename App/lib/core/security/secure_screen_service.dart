import 'package:flutter/services.dart';

/// Controls Android's FLAG_SECURE to prevent screenshots / screen recording
/// on sensitive screens (sign-in, sign-up, password reset).
class SecureScreenService {
  static const _channel = MethodChannel('com.example.trademaster/security');

  static Future<void> setFlagSecure(bool enable) async {
    try {
      await _channel.invokeMethod('setFlagSecure', {'enable': enable});
    } catch (e) {
      // FLAG_SECURE is a defense-in-depth measure; failures should not block the UI.
    }
  }
}
