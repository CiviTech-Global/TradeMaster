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

const _privacyPolicyVersion = '1.0.0';
const _termsVersion = '1.0.0';

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
  bool _consentGiven = false;

  @override
  void initState() {
    super.initState();
    SecureScreenService.setFlagSecure(true);
  }

  @override
  void dispose() {
    _firstnameController.dispose();
    _lastnameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    SecureScreenService.setFlagSecure(false);
    super.dispose();
  }

  Future<void> _handleSignUp() async {
    if (!_formKey.currentState!.validate()) return;

    await ref.read(authProvider.notifier).signUp(
          firstname: _firstnameController.text.trim(),
          lastname: _lastnameController.text.trim(),
          email: _emailController.text.trim(),
          password: _passwordController.text,
          consentGiven: _consentGiven,
          privacyPolicyVersion: _privacyPolicyVersion,
          termsVersion: _termsVersion,
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
    final statusMatch = RegExp(r'Request failed \(status (\d+)\)\.', multiLine: true).firstMatch(error);
    if (statusMatch != null) {
      final code = int.tryParse(statusMatch.group(1) ?? '');
      if (code != null) return l10n.requestFailedStatus(code);
    }
    return error;
  }

  String? _validateConsent(bool? value, AppLocalizations l10n) {
    if (value != true) {
      return l10n.consentRequired;
    }
    return null;
  }

  void _showLegalDialog({required String title, required String body}) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: SingleChildScrollView(child: Text(body)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(AppLocalizations.of(context).cancel),
          ),
        ],
      ),
    );
  }

  Widget _buildConsentRow(AppLocalizations l10n, ColorScheme colorScheme) {
    final label = l10n.consentLabel;
    final privacy = l10n.privacyPolicy;
    final terms = l10n.termsOfService;

    final spans = <InlineSpan>[];
    int start = 0;
    final privacyKey = '[$privacy]';
    final termsKey = '[$terms]';

    void addText(String text) {
      if (text.isNotEmpty) {
        spans.add(TextSpan(text: text));
      }
    }

    while (start < label.length) {
      final privacyIndex = label.indexOf(privacyKey, start);
      final termsIndex = label.indexOf(termsKey, start);

      if (privacyIndex == -1 && termsIndex == -1) {
        addText(label.substring(start));
        break;
      }

      final isPrivacy = privacyIndex != -1 &&
          (termsIndex == -1 || privacyIndex < termsIndex);
      final index = isPrivacy ? privacyIndex : termsIndex;
      final key = isPrivacy ? privacyKey : termsKey;
      final linkText = isPrivacy ? privacy : terms;

      addText(label.substring(start, index));
      spans.add(
        WidgetSpan(
          alignment: PlaceholderAlignment.middle,
          child: GestureDetector(
            onTap: () => _showLegalDialog(
              title: linkText,
              body: isPrivacy ? _privacyPolicyBody(l10n) : _termsBody(l10n),
            ),
            child: Text(
              linkText,
              style: TextStyle(
                color: colorScheme.primary,
                fontWeight: FontWeight.bold,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ),
      );
      start = index + key.length;
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Checkbox(
          value: _consentGiven,
          onChanged: (value) {
            setState(() => _consentGiven = value ?? false);
          },
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 10),
            child: RichText(
              text: TextSpan(
                style: TextStyle(color: colorScheme.onSurface),
                children: spans,
              ),
            ),
          ),
        ),
      ],
    );
  }

  String _privacyPolicyBody(AppLocalizations l10n) {
    return '''TradeMaster respects your privacy. This policy explains what personal information we collect, how we use it, and your rights.

1. Information we collect
We collect your name, email address, phone number, business details, location data, and any content you upload to create your business profile.

2. How we use your information
We use your information to provide the business-directory service, display your public profile, communicate with you, and improve the platform.

3. Sharing and disclosure
We do not sell your personal information. Business contact details you choose to display are public to directory visitors. We may disclose information when required by law.

4. Data retention and deletion
We retain your data as long as your account is active. You can request account deletion at any time from your profile settings.

5. Your rights
You have the right to access, correct, or delete your personal information.'''.trim();
  }

  String _termsBody(AppLocalizations l10n) {
    return '''Welcome to TradeMaster. By creating an account or using the platform, you agree to these terms.

1. Service description
TradeMaster provides a local business directory that lets users discover businesses, view profiles, and contact business owners.

2. Account responsibilities
You are responsible for keeping your password secure and for all activity under your account.

3. Acceptable use
You may not use the platform for illegal activity, harassment, fraud, or to upload harmful content.

4. Termination
We may suspend or terminate accounts that violate these terms. You may delete your account at any time.

5. Limitation of liability
TradeMaster is provided "as is".'''.trim();
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
                l10n.createAccount,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(
                l10n.signUpSubtitle,
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),
              TMInput(
                label: l10n.firstName,
                controller: _firstnameController,
                textInputAction: TextInputAction.next,
                validator: (v) => Validators.validateRequired(
                  v,
                  l10n,
                  fieldName: l10n.firstName,
                ),
                prefix: const Icon(Icons.person_outlined),
              ),
              const SizedBox(height: 14),
              TMInput(
                label: l10n.lastName,
                controller: _lastnameController,
                textInputAction: TextInputAction.next,
                validator: (v) => Validators.validateRequired(
                  v,
                  l10n,
                  fieldName: l10n.lastName,
                ),
                prefix: const Icon(Icons.person_outlined),
              ),
              const SizedBox(height: 14),
              TMInput(
                label: l10n.emailLabel,
                hint: l10n.emailHint,
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                validator: (v) => Validators.validateEmail(v, l10n),
                prefix: const Icon(Icons.email_outlined),
              ),
              const SizedBox(height: 14),
              TMInput(
                label: l10n.passwordLabel,
                controller: _passwordController,
                obscureText: _obscurePassword,
                textInputAction: TextInputAction.next,
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
              ),
              const SizedBox(height: 14),
              TMInput(
                label: l10n.confirmPassword,
                controller: _confirmPasswordController,
                obscureText: _obscureConfirmPassword,
                textInputAction: TextInputAction.done,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return l10n.confirmPasswordRequired;
                  }
                  if (value != _passwordController.text) {
                    return l10n.passwordsDoNotMatch;
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
              const SizedBox(height: 14),
              FormField<bool>(
                initialValue: _consentGiven,
                validator: (v) => _validateConsent(v, l10n),
                builder: (field) => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildConsentRow(l10n, colorScheme),
                    if (field.hasError)
                      Padding(
                        padding: const EdgeInsets.only(right: 12, left: 12, top: 4),
                        child: Text(
                          field.errorText!,
                          style: TextStyle(
                            color: colorScheme.error,
                            fontSize: 12,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              TMButton(
                label: l10n.signUp,
                onTap: authState.isLoading ? null : _handleSignUp,
                isLoading: authState.isLoading,
              ),
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () => context.go('/signin'),
                  child: RichText(
                    text: TextSpan(
                      text: l10n.alreadyHaveAccount,
                      style: TextStyle(color: colorScheme.onSurfaceVariant),
                      children: [
                        TextSpan(
                          text: l10n.signIn,
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
