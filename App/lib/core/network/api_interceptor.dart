import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:trademaster/core/constants/api_constants.dart';
import 'package:trademaster/core/constants/app_constants.dart';

class ApiInterceptor extends Interceptor {
  final FlutterSecureStorage _storage;

  ApiInterceptor({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.read(key: AppConstants.tokenKey);
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        // Retry the original request with the new token
        final token = await _storage.read(key: AppConstants.tokenKey);
        err.requestOptions.headers['Authorization'] = 'Bearer $token';

        try {
          final dio = Dio();
          final response = await dio.fetch(err.requestOptions);
          return handler.resolve(response);
        } on DioException catch (e) {
          return handler.next(e);
        }
      }
    }
    handler.next(err);
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken =
          await _storage.read(key: AppConstants.refreshTokenKey);
      if (refreshToken == null) return false;

      final dio = Dio();
      final response = await dio.post(
        '${ApiConstants.baseUrl}/auth/refresh-token',
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final newToken = response.data['accessToken'] as String?;
        final newRefreshToken = response.data['refreshToken'] as String?;

        if (newToken != null) {
          await _storage.write(key: AppConstants.tokenKey, value: newToken);
        }
        if (newRefreshToken != null) {
          await _storage.write(
            key: AppConstants.refreshTokenKey,
            value: newRefreshToken,
          );
        }
        return true;
      }
    } catch (_) {
      // Refresh failed
    }
    return false;
  }
}
