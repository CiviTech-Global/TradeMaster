import 'package:trademaster/domain/entities/user.dart';

abstract class AuthRepository {
  Future<User> signIn({required String email, required String password});
  Future<User> signUp({
    required String firstname,
    required String lastname,
    required String email,
    required String password,
    required bool consentGiven,
    String? privacyPolicyVersion,
    String? termsVersion,
  });
  Future<void> signOut();
  Future<User?> getCurrentUser();
  Future<bool> refreshToken();
}
