import 'dart:developer' as developer;

import 'package:dio/dio.dart';
import 'package:trademaster/core/constants/api_constants.dart';
import 'package:trademaster/core/network/api_interceptor.dart';

class DioClient {
  static DioClient? _instance;
  late Dio _dio;

  DioClient._() {
    _initDio(ApiConstants.baseUrl);
  }

  void _initDio(String base) {
    developer.log('DioClient: initializing with baseUrl=$base', name: 'DioClient');
    _dio = Dio(
      BaseOptions(
        baseUrl: base,
        connectTimeout: ApiConstants.connectTimeout,
        receiveTimeout: ApiConstants.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );
    _dio.interceptors.add(ApiInterceptor());
  }

  static DioClient get instance {
    _instance ??= DioClient._();
    return _instance!;
  }

  /// Reconfigures the singleton with a new base URL.
  static void setBaseUrl(String baseUrl) {
    instance._initDio(baseUrl);
  }

  Dio get dio => _dio;

  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.get(path, queryParameters: queryParameters, options: options);
  }

  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.post(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.patch(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.delete(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
}
