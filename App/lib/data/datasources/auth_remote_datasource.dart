import 'dart:developer' as developer;

import 'package:trademaster/core/network/dio_client.dart';
import 'package:trademaster/data/models/user_model.dart';

class AuthRemoteDatasource {
  final DioClient _dioClient;

  AuthRemoteDatasource({DioClient? dioClient})
      : _dioClient = dioClient ?? DioClient.instance;

  Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
  }) async {
    developer.log('AuthRemoteDatasource.signIn: attempting sign in for $email');
    final response = await _dioClient.post(
      '/auth/signin',
      data: {'email': email, 'password': password},
    );
    developer.log('AuthRemoteDatasource.signIn: response status ${response.statusCode}');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> signUp({
    required String firstname,
    required String lastname,
    required String email,
    required String password,
  }) async {
    developer.log('AuthRemoteDatasource.signUp: attempting sign up for $email');
    final response = await _dioClient.post(
      '/auth/signup',
      data: {
        'firstname': firstname,
        'lastname': lastname,
        'email': email,
        'password': password,
      },
    );
    developer.log('AuthRemoteDatasource.signUp: response status ${response.statusCode}');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    developer.log('AuthRemoteDatasource.refreshToken: refreshing token');
    final response = await _dioClient.post(
      '/auth/refresh-token',
      data: {'refreshToken': refreshToken},
    );
    developer.log('AuthRemoteDatasource.refreshToken: response status ${response.statusCode}');
    return response.data as Map<String, dynamic>;
  }

  Future<UserModel> getCurrentUser() async {
    developer.log('AuthRemoteDatasource.getCurrentUser: verifying token');
    final response = await _dioClient.get('/auth/verify-token');
    developer.log('AuthRemoteDatasource.getCurrentUser: response status ${response.statusCode}');
    final responseData = response.data as Map<String, dynamic>;
    final innerData = responseData['data'] as Map<String, dynamic>;
    return UserModel.fromJson(innerData['user'] as Map<String, dynamic>);
  }
}
