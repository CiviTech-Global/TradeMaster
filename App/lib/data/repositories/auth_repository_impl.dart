import 'dart:convert';
import 'dart:developer' as developer;

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:trademaster/core/constants/app_constants.dart';
import 'package:trademaster/data/datasources/auth_remote_datasource.dart';
import 'package:trademaster/data/models/user_model.dart';
import 'package:trademaster/domain/entities/user.dart';
import 'package:trademaster/domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDatasource _datasource;
  final FlutterSecureStorage _storage;

  AuthRepositoryImpl({
    AuthRemoteDatasource? datasource,
    FlutterSecureStorage? storage,
  })  : _datasource = datasource ?? AuthRemoteDatasource(),
        _storage = storage ?? const FlutterSecureStorage();

  User _mapModelToEntity(UserModel model) {
    return User(
      id: model.id,
      firstname: model.firstname,
      lastname: model.lastname,
      email: model.email,
      avatar: model.avatar,
      phone: model.phone,
      bio: model.bio,
    );
  }

  Future<void> _storeTokens(Map<String, dynamic> innerData) async {
    final accessToken = innerData['accessToken'] as String?;
    final refreshTokenValue = innerData['refreshToken'] as String?;

    if (accessToken != null) {
      await _storage.write(key: AppConstants.tokenKey, value: accessToken);
      developer.log('AuthRepository: access token stored');
    } else {
      developer.log('AuthRepository: WARNING - no accessToken in response');
    }
    if (refreshTokenValue != null) {
      await _storage.write(
        key: AppConstants.refreshTokenKey,
        value: refreshTokenValue,
      );
      developer.log('AuthRepository: refresh token stored');
    } else {
      developer.log('AuthRepository: WARNING - no refreshToken in response');
    }

    // Persist user profile for instant session restore on next launch
    final userData = innerData['user'];
    if (userData != null) {
      await _storage.write(
        key: AppConstants.userDataKey,
        value: jsonEncode(userData),
      );
      developer.log('AuthRepository: user data cached locally');
    }
  }

  @override
  Future<User> signIn({
    required String email,
    required String password,
  }) async {
    developer.log('AuthRepository.signIn: starting');
    final data = await _datasource.signIn(email: email, password: password);

    // Server returns { data: { user, accessToken, refreshToken }, message }
    final innerData = data['data'] as Map<String, dynamic>;
    await _storeTokens(innerData);

    final userModel = UserModel.fromJson(innerData['user'] as Map<String, dynamic>);
    developer.log('AuthRepository.signIn: success for user ${userModel.id}');
    return _mapModelToEntity(userModel);
  }

  @override
  Future<User> signUp({
    required String firstname,
    required String lastname,
    required String email,
    required String password,
  }) async {
    developer.log('AuthRepository.signUp: starting');
    final data = await _datasource.signUp(
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: password,
    );

    // Server returns { data: { user, accessToken, refreshToken }, message }
    final innerData = data['data'] as Map<String, dynamic>;
    await _storeTokens(innerData);

    final userModel = UserModel.fromJson(innerData['user'] as Map<String, dynamic>);
    developer.log('AuthRepository.signUp: success for user ${userModel.id}');
    return _mapModelToEntity(userModel);
  }

  @override
  Future<void> signOut() async {
    developer.log('AuthRepository.signOut: clearing tokens and cached data');
    await _storage.delete(key: AppConstants.tokenKey);
    await _storage.delete(key: AppConstants.refreshTokenKey);
    await _storage.delete(key: AppConstants.userDataKey);
  }

  @override
  Future<User?> getCurrentUser() async {
    final token = await _storage.read(key: AppConstants.tokenKey);
    if (token == null) {
      developer.log('AuthRepository.getCurrentUser: no token stored');
      return null;
    }

    // Restore from locally cached user profile (instant, no network call).
    // Token validity is checked lazily by the API interceptor on the first
    // real request — if expired, it refreshes automatically.
    final userJson = await _storage.read(key: AppConstants.userDataKey);
    if (userJson != null) {
      try {
        final userModel =
            UserModel.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
        developer.log(
            'AuthRepository.getCurrentUser: restored user ${userModel.id} from local cache');
        return _mapModelToEntity(userModel);
      } catch (e) {
        developer.log(
            'AuthRepository.getCurrentUser: local cache parse error - $e');
      }
    }

    // No cached profile but token exists — can't restore without network.
    // Return null so the user is sent to sign-in instead of blocking.
    developer.log(
        'AuthRepository.getCurrentUser: token exists but no cached user data');
    return null;
  }

  @override
  Future<bool> refreshToken() async {
    final refreshTokenValue =
        await _storage.read(key: AppConstants.refreshTokenKey);
    if (refreshTokenValue == null) {
      developer.log('AuthRepository.refreshToken: no refresh token stored');
      return false;
    }

    try {
      final data = await _datasource.refreshToken(refreshTokenValue);

      // Server returns { data: { user, accessToken, refreshToken }, message }
      final innerData = data['data'] as Map<String, dynamic>;
      await _storeTokens(innerData);

      developer.log('AuthRepository.refreshToken: success');
      return true;
    } catch (e) {
      developer.log('AuthRepository.refreshToken: failed - $e');
      return false;
    }
  }
}
