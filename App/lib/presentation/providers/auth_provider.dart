import 'dart:developer' as developer;

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/data/repositories/auth_repository_impl.dart';
import 'package:trademaster/domain/entities/user.dart';
import 'package:trademaster/domain/repositories/auth_repository.dart';

class AuthState {
  final User? user;
  final bool isAuthenticated;
  final bool isLoading;
  final bool isInitializing;
  final String? error;

  const AuthState({
    this.user,
    this.isAuthenticated = false,
    this.isLoading = false,
    this.isInitializing = false,
    this.error,
  });

  AuthState copyWith({
    User? user,
    bool? isAuthenticated,
    bool? isLoading,
    bool? isInitializing,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      isInitializing: isInitializing ?? this.isInitializing,
      error: error,
    );
  }
}

String _extractErrorMessage(Object e) {
  if (e is DioException) {
    // Try to get the server error message
    final responseData = e.response?.data;
    if (responseData is Map<String, dynamic>) {
      final errorMsg = responseData['error'] as String?;
      if (errorMsg != null) return errorMsg;
      final message = responseData['message'] as String?;
      if (message != null) return message;
    }

    // Fall back to DioException type-specific messages
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Connection timed out. Please check your internet connection.';
      case DioExceptionType.connectionError:
        return 'Unable to connect to server. Please check your connection.';
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) return 'Invalid email or password.';
        if (statusCode == 409) return 'An account with this email already exists.';
        if (statusCode == 500) return 'Server error. Please try again later.';
        return 'Request failed (status $statusCode).';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
  return e.toString();
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;

  AuthNotifier(this._repository) : super(const AuthState());

  Future<void> initializeAuth() async {
    developer.log('AuthNotifier.initializeAuth: starting');
    state = state.copyWith(isInitializing: true);
    try {
      final user = await _repository.getCurrentUser();
      if (user != null) {
        developer.log('AuthNotifier.initializeAuth: user found (${user.id})');
        state = AuthState(
          user: user,
          isAuthenticated: true,
        );
      } else {
        developer.log('AuthNotifier.initializeAuth: no user session');
        state = const AuthState();
      }
    } catch (e) {
      developer.log('AuthNotifier.initializeAuth: error - $e');
      state = const AuthState();
    }
  }

  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    developer.log('AuthNotifier.signIn: starting for $email');
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _repository.signIn(
        email: email,
        password: password,
      );
      developer.log('AuthNotifier.signIn: success');
      state = AuthState(
        user: user,
        isAuthenticated: true,
        isLoading: false,
      );
    } catch (e) {
      final errorMsg = _extractErrorMessage(e);
      developer.log('AuthNotifier.signIn: failed - $errorMsg (raw: $e)');
      state = state.copyWith(
        isLoading: false,
        error: errorMsg,
      );
    }
  }

  Future<void> signUp({
    required String firstname,
    required String lastname,
    required String email,
    required String password,
  }) async {
    developer.log('AuthNotifier.signUp: starting for $email');
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _repository.signUp(
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
      );
      developer.log('AuthNotifier.signUp: success');
      state = AuthState(
        user: user,
        isAuthenticated: true,
        isLoading: false,
      );
    } catch (e) {
      final errorMsg = _extractErrorMessage(e);
      developer.log('AuthNotifier.signUp: failed - $errorMsg (raw: $e)');
      state = state.copyWith(
        isLoading: false,
        error: errorMsg,
      );
    }
  }

  Future<void> signOut() async {
    developer.log('AuthNotifier.signOut');
    await _repository.signOut();
    state = const AuthState();
  }
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl();
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return AuthNotifier(repository);
});
