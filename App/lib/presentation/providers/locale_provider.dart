import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class LocaleNotifier extends StateNotifier<Locale> {
  static const _key = 'app_locale_code';
  static const _defaultLocaleCode = 'fa';
  final FlutterSecureStorage _storage;

  LocaleNotifier({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage(),
        super(const Locale(_defaultLocaleCode)) {
    _load();
  }

  Future<void> _load() async {
    final stored = await _storage.read(key: _key);
    final code = stored ?? _defaultLocaleCode;
    state = _toLocale(code);
  }

  Future<void> setLocale(String code) async {
    final locale = _toLocale(code);
    if (locale == state) return;
    await _storage.write(key: _key, value: code);
    state = locale;
  }

  Future<void> toggle() async {
    final nextCode = state.languageCode == 'fa' ? 'en' : 'fa';
    await setLocale(nextCode);
  }

  static Locale _toLocale(String code) {
    return Locale(code);
  }
}

final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>(
  (ref) => LocaleNotifier(),
);

extension LocaleDirectionality on Locale {
  TextDirection get textDirection {
    return languageCode == 'fa' ? TextDirection.rtl : TextDirection.ltr;
  }
}
