import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/core/utils/validators.dart';
import 'package:trademaster/presentation/components/tm_button.dart';
import 'package:trademaster/presentation/components/tm_input.dart';
import 'package:trademaster/presentation/providers/auth_provider.dart';
import 'package:trademaster/presentation/screens/auth/auth_scaffold.dart';
import 'package:trademaster/presentation/widgets/common/loading_overlay.dart';

class SignUpScreen extends ConsumerStatefulWidget {
  const SignUpScreen({super.key});

  @override
  ConsumerState<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends ConsumerState<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstnameController = TextEditingController();
  final _lastnameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _firstnameController.dispose();
    _lastnameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleSignUp() async {
    if (!_formKey.currentState!.validate()) return;

    await ref.read(authProvider.notifier).signUp(
          firstname: _firstnameController.text.trim(),
          lastname: _lastnameController.text.trim(),
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    ref.listen<AuthState>(authProvider, (previous, next) {
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.error!)),
        );
      }
      if (next.isAuthenticated) {
        context.go('/');
      }
    });

    return AuthScaffold(
      showBackButton: true,
      onBack: () => context.go('/signin'),
      child: LoadingOverlay(
        isLoading: authState.isLoading,
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 80,
                  height: 80,
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
                  ),
                  child: const Icon(
                    Icons.person_add_rounded,
                    size: 38,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Create Account',
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(
                'Join the local business directory',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),
              TMInput(
                label: 'First Name',
                controller: _firstnameController,
                textInputAction: TextInputAction.next,
                validator: (v) =>
                    Validators.validateRequired(v, fieldName: 'First name'),
                prefix: const Icon(Icons.person_outlined),
              ),
              const SizedBox(height: 14),
              TMInput(
                label: 'Last Name',
                controller: _lastnameController,
                textInputAction: TextInputAction.next,
                validator: (v) =>
                    Validators.validateRequired(v, fieldName: 'Last name'),
                prefix: const Icon(Icons.person_outlined),
              ),
              const SizedBox(height: 14),
              TMInput(
                label: 'Email',
                hint: 'your@email.com',
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                validator: Validators.validateEmail,
                prefix: const Icon(Icons.email_outlined),
              ),
              const SizedBox(height: 14),
              TMInput(
                label: 'Password',
                controller: _passwordController,
                obscureText: _obscurePassword,
                textInputAction: TextInputAction.next,
                validator: Validators.validatePassword,
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
              ),
              const SizedBox(height: 14),
              TMInput(
                label: 'Confirm Password',
                controller: _confirmPasswordController,
                obscureText: _obscureConfirmPassword,
                textInputAction: TextInputAction.done,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please confirm your password';
                  }
                  if (value != _passwordController.text) {
                    return 'Passwords do not match';
                  }
                  return null;
                },
                prefix: const Icon(Icons.lock_outlined),
                suffix: IconButton(
                  icon: Icon(
                    _obscureConfirmPassword
                        ? Icons.visibility_off
                        : Icons.visibility,
                    color: colorScheme.onSurfaceVariant,
                  ),
                  onPressed: () {
                    setState(() =>
                        _obscureConfirmPassword = !_obscureConfirmPassword);
                  },
                ),
                onSubmitted: (_) => _handleSignUp(),
              ),
              const SizedBox(height: 24),
              TMButton(
                label: 'Sign Up',
                onTap: authState.isLoading ? null : _handleSignUp,
                isLoading: authState.isLoading,
              ),
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () => context.go('/signin'),
                  child: RichText(
                    text: TextSpan(
                      text: 'Already have an account? ',
                      style: TextStyle(color: colorScheme.onSurfaceVariant),
                      children: [
                        TextSpan(
                          text: 'Sign In',
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
