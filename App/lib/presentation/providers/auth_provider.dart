import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/data/repositories/auth_repository_impl.dart';
import 'package:trademaster/domain/entities/user.dart';
import 'package:trademaster/domain/repositories/auth_repository.dart';

class AuthState {
  final User? user;
  final bool isAuthenticated;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.user,
    this.isAuthenticated = false,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    User? user,
    bool? isAuthenticated,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;

  AuthNotifier(this._repository) : super(const AuthState());

  Future<void> initializeAuth() async {
    state = state.copyWith(isLoading: true);
    try {
      final user = await _repository.getCurrentUser();
      if (user != null) {
        state = AuthState(
          user: user,
          isAuthenticated: true,
          isLoading: false,
        );
      } else {
        state = const AuthState(isLoading: false);
      }
    } catch (_) {
      state = const AuthState(isLoading: false);
    }
  }

  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _repository.signIn(
        email: email,
        password: password,
      );
      state = AuthState(
        user: user,
        isAuthenticated: true,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> signUp({
    required String firstname,
    required String lastname,
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _repository.signUp(
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
      );
      state = AuthState(
        user: user,
        isAuthenticated: true,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> signOut() async {
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
