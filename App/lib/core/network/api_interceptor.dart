import 'dart:developer' as developer;

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
    developer.log(
      '[HTTP] --> ${options.method} ${options.uri}'
      '${options.queryParameters.isNotEmpty ? ' query=${options.queryParameters}' : ''}'
      '${token != null ? ' [auth]' : ' [no-auth]'}',
      name: 'ApiInterceptor',
    );
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    final data = response.data;
    final preview = data is Map
        ? '{keys: ${data.keys.toList()}, message: ${data['message'] ?? 'n/a'}}'
        : '${data.runtimeType}';
    developer.log(
      '[HTTP] <-- ${response.statusCode} ${response.requestOptions.method} '
      '${response.requestOptions.uri} | $preview',
      name: 'ApiInterceptor',
    );
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    developer.log(
      '[HTTP] <-- ERROR ${err.response?.statusCode ?? 'NO_STATUS'} '
      '${err.requestOptions.method} ${err.requestOptions.uri}\n'
      '  type: ${err.type}\n'
      '  message: ${err.message}\n'
      '  response: ${err.response?.data}',
      name: 'ApiInterceptor',
      level: 1000, // severe
    );

    if (err.response?.statusCode == 401) {
      developer.log('[HTTP] 401 received, attempting token refresh...',
          name: 'ApiInterceptor');
      final refreshed = await _refreshToken();
      if (refreshed) {
        // Retry the original request with the new token
        final token = await _storage.read(key: AppConstants.tokenKey);
        err.requestOptions.headers['Authorization'] = 'Bearer $token';

        try {
          final dio = Dio();
          final response = await dio.fetch(err.requestOptions);
          developer.log('[HTTP] Retry succeeded after token refresh',
              name: 'ApiInterceptor');
          return handler.resolve(response);
        } on DioException catch (e) {
          developer.log(
              '[HTTP] Retry failed after token refresh: ${e.message}',
              name: 'ApiInterceptor');
          return handler.next(e);
        }
      } else {
        developer.log('[HTTP] Token refresh failed, propagating 401',
            name: 'ApiInterceptor');
      }
    }
    handler.next(err);
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken =
          await _storage.read(key: AppConstants.refreshTokenKey);
      if (refreshToken == null) {
        developer.log('[HTTP] No refresh token available',
            name: 'ApiInterceptor');
        return false;
      }

      final dio = Dio();
      final response = await dio.post(
        '${ApiConstants.baseUrl}/auth/refresh-token',
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Server returns { data: { accessToken, refreshToken, ... }, message }
        final innerData = response.data['data'] as Map<String, dynamic>;
        final newToken = innerData['accessToken'] as String?;
        final newRefreshToken = innerData['refreshToken'] as String?;

        if (newToken != null) {
          await _storage.write(key: AppConstants.tokenKey, value: newToken);
        }
        if (newRefreshToken != null) {
          await _storage.write(
            key: AppConstants.refreshTokenKey,
            value: newRefreshToken,
          );
        }
        developer.log('[HTTP] Token refresh succeeded',
            name: 'ApiInterceptor');
        return true;
      }
    } catch (e) {
      developer.log('[HTTP] Token refresh error: $e', name: 'ApiInterceptor');
    }
    return false;
  }
}
