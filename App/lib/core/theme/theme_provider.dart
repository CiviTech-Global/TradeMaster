import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

enum TMThemeMode { system, light, dark }

class ThemeNotifier extends StateNotifier<TMThemeMode> {
  static const _key = 'app_theme_mode';
  final FlutterSecureStorage _storage;

  ThemeNotifier({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage(),
        super(TMThemeMode.system) {
    _load();
  }

  Future<void> _load() async {
    final stored = await _storage.read(key: _key);
    state = TMThemeMode.values.firstWhere(
      (e) => e.name == stored,
      orElse: () => TMThemeMode.system,
    );
  }

  Future<void> setMode(TMThemeMode mode) async {
    await _storage.write(key: _key, value: mode.name);
    state = mode;
  }
}

final themeProvider = StateNotifierProvider<ThemeNotifier, TMThemeMode>(
  (ref) => ThemeNotifier(),
);

extension TMThemeModeExtension on TMThemeMode {
  ThemeMode get flutterValue => switch (this) {
        TMThemeMode.system => ThemeMode.system,
        TMThemeMode.light => ThemeMode.light,
        TMThemeMode.dark => ThemeMode.dark,
      };

  IconData get icon => switch (this) {
        TMThemeMode.system => Icons.brightness_auto,
        TMThemeMode.light => Icons.light_mode,
        TMThemeMode.dark => Icons.dark_mode,
      };
}
