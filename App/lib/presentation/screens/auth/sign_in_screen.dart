import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/core/security/secure_screen_service.dart';
import 'package:trademaster/core/utils/validators.dart';
import 'package:trademaster/l10n/generated/app_localizations.dart';
import 'package:trademaster/presentation/components/tm_button.dart';
import 'package:trademaster/presentation/components/tm_input.dart';
import 'package:trademaster/presentation/providers/auth_provider.dart';
import 'package:trademaster/presentation/screens/auth/auth_scaffold.dart';
import 'package:trademaster/presentation/widgets/common/loading_overlay.dart';

class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    SecureScreenService.setFlagSecure(true);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    SecureScreenService.setFlagSecure(false);
    super.dispose();
  }

  Future<void> _handleSignIn() async {
    if (!_formKey.currentState!.validate()) return;

    await ref.read(authProvider.notifier).signIn(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );
  }

  String _localizeAuthError(BuildContext context, String error) {
    final l10n = AppLocalizations.of(context);
    if (error == 'Connection timed out. Please check your internet connection.') {
      return l10n.connectionTimedOut;
    }
    if (error == 'Unable to connect to server. Please check your connection.') {
      return l10n.unableToConnect;
    }
    if (error == 'Invalid email or password.') {
      return l10n.invalidEmailOrPassword;
    }
    if (error == 'An account with this email already exists.') {
      return l10n.emailAlreadyExists;
    }
    if (error == 'Server error. Please try again later.') {
      return l10n.serverError;
    }
    if (error == 'An unexpected error occurred. Please try again.') {
      return l10n.unexpectedError;
    }
    final statusMatch = RegExp(r'Request failed \(status (\d+)\)\.').firstMatch(error);
    if (statusMatch != null) {
      final code = int.tryParse(statusMatch.group(1) ?? '');
      if (code != null) return l10n.requestFailedStatus(code);
    }
    return error;
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final l10n = AppLocalizations.of(context);

    ref.listen<AuthState>(authProvider, (previous, next) {
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_localizeAuthError(context, next.error!))),
        );
      }
      if (next.isAuthenticated) {
        context.go('/');
      }
    });

    return AuthScaffold(
      child: LoadingOverlay(
        isLoading: authState.isLoading,
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Logo
              Center(
                child: Container(
                  width: 88,
                  height: 88,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [
                        colorScheme.primary,
                        colorScheme.secondary,
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: colorScheme.primary.withValues(alpha: 0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.storefront_rounded,
                    size: 42,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                l10n.welcomeBack,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(
                l10n.signInSubtitle,
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              TMInput(
                label: l10n.emailLabel,
                hint: l10n.emailHint,
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                validator: (v) => Validators.validateEmail(v, l10n),
                prefix: const Icon(Icons.email_outlined),
              ),
              const SizedBox(height: 16),
              TMInput(
                label: l10n.passwordLabel,
                hint: '••••••••',
                controller: _passwordController,
                obscureText: _obscurePassword,
                textInputAction: TextInputAction.done,
                validator: (v) => Validators.validatePassword(v, l10n),
                prefix: const Icon(Icons.lock_outlined),
                suffix: IconButton(
                  icon: Icon(
                    _obscurePassword ? Icons.visibility_off : Icons.visibility,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  onPressed: () {
                    setState(() => _obscurePassword = !_obscurePassword);
                  },
                ),
                onSubmitted: (_) => _handleSignIn(),
              ),
              const SizedBox(height: 24),
              TMButton(
                label: l10n.signIn,
                onTap: authState.isLoading ? null : _handleSignIn,
                isLoading: authState.isLoading,
              ),
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () => context.go('/signup'),
                  child: RichText(
                    text: TextSpan(
                      text: l10n.dontHaveAccount,
                      style: TextStyle(color: colorScheme.onSurfaceVariant),
                      children: [
                        TextSpan(
                          text: l10n.signUp,
                          style: TextStyle(
                            color: colorScheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
