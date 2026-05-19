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
    final response = await _dioClient.post(
      '/auth/signin',
      data: {'email': email, 'password': password},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> signUp({
    required String firstname,
    required String lastname,
    required String email,
    required String password,
  }) async {
    final response = await _dioClient.post(
      '/users',
      data: {
        'firstname': firstname,
        'lastname': lastname,
        'email': email,
        'password': password,
      },
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    final response = await _dioClient.post(
      '/auth/refresh-token',
      data: {'refreshToken': refreshToken},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<UserModel> getCurrentUser() async {
    final response = await _dioClient.get('/auth/me');
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }
}
