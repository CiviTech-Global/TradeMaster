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

  @override
  Future<User> signIn({
    required String email,
    required String password,
  }) async {
    final data = await _datasource.signIn(email: email, password: password);

    final accessToken = data['accessToken'] as String?;
    final refreshTokenValue = data['refreshToken'] as String?;

    if (accessToken != null) {
      await _storage.write(key: AppConstants.tokenKey, value: accessToken);
    }
    if (refreshTokenValue != null) {
      await _storage.write(
        key: AppConstants.refreshTokenKey,
        value: refreshTokenValue,
      );
    }

    final userModel = UserModel.fromJson(data['user'] as Map<String, dynamic>);
    return _mapModelToEntity(userModel);
  }

  @override
  Future<User> signUp({
    required String firstname,
    required String lastname,
    required String email,
    required String password,
  }) async {
    final data = await _datasource.signUp(
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: password,
    );

    final accessToken = data['accessToken'] as String?;
    final refreshTokenValue = data['refreshToken'] as String?;

    if (accessToken != null) {
      await _storage.write(key: AppConstants.tokenKey, value: accessToken);
    }
    if (refreshTokenValue != null) {
      await _storage.write(
        key: AppConstants.refreshTokenKey,
        value: refreshTokenValue,
      );
    }

    final userModel = UserModel.fromJson(data['user'] as Map<String, dynamic>);
    return _mapModelToEntity(userModel);
  }

  @override
  Future<void> signOut() async {
    await _storage.delete(key: AppConstants.tokenKey);
    await _storage.delete(key: AppConstants.refreshTokenKey);
  }

  @override
  Future<User?> getCurrentUser() async {
    final token = await _storage.read(key: AppConstants.tokenKey);
    if (token == null) return null;

    try {
      final userModel = await _datasource.getCurrentUser();
      return _mapModelToEntity(userModel);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<bool> refreshToken() async {
    final refreshTokenValue =
        await _storage.read(key: AppConstants.refreshTokenKey);
    if (refreshTokenValue == null) return false;

    try {
      final data = await _datasource.refreshToken(refreshTokenValue);
      final newToken = data['accessToken'] as String?;
      final newRefresh = data['refreshToken'] as String?;

      if (newToken != null) {
        await _storage.write(key: AppConstants.tokenKey, value: newToken);
      }
      if (newRefresh != null) {
        await _storage.write(
          key: AppConstants.refreshTokenKey,
          value: newRefresh,
        );
      }
      return true;
    } catch (_) {
      return false;
    }
  }
}
