import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/core/network/dio_client.dart';
import 'package:trademaster/core/network/server_url_provider.dart';
import 'package:trademaster/core/network/server_url_repository.dart';
import 'package:trademaster/l10n/generated/app_localizations.dart';
import 'package:trademaster/presentation/components/tm_button.dart';
import 'package:trademaster/presentation/components/tm_input.dart';
import 'package:trademaster/presentation/components/tm_theme_toggle.dart';
import 'package:trademaster/presentation/providers/auth_provider.dart';
import 'package:trademaster/presentation/providers/locale_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final _controller = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _hasChanged = false;

  @override
  void initState() {
    super.initState();
    final currentUrl = ref.read(serverUrlProvider).url;
    _controller.text = currentUrl ?? ServerUrlRepository.defaultUrl();
    _controller.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _controller.removeListener(_onTextChanged);
    _controller.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    final currentUrl = ref.read(serverUrlProvider).url ?? ServerUrlRepository.defaultUrl();
    setState(() => _hasChanged = _controller.text.trim() != currentUrl);
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    await ref.read(serverUrlProvider.notifier).save(_controller.text.trim());
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppLocalizations.of(context).serverUrlSaved)),
      );
      setState(() => _hasChanged = false);
    }
  }

  Future<void> _deleteAccount() async {
    final l10n = AppLocalizations.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.deleteAccount),
        content: Text(l10n.deleteAccountConfirmation),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l10n.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(l10n.deleteAccount),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    try {
      final user = ref.read(authProvider).user;
      if (user == null) return;
      await DioClient.instance.delete('/users/${user.id}');
      if (!mounted) return;
      await ref.read(authProvider.notifier).signOut();
      if (!mounted) return;
      context.go('/signin');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${l10n.deleteAccountFailed}: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final state = ref.watch(serverUrlProvider);
    final locale = ref.watch(localeProvider);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.settings),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            l10n.language,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          SegmentedButton<String>(
            segments: [
              ButtonSegment(
                value: 'fa',
                label: Text(l10n.persian),
              ),
              ButtonSegment(
                value: 'en',
                label: Text(l10n.english),
              ),
            ],
            selected: {locale.languageCode},
            onSelectionChanged: (selection) {
              if (selection.isNotEmpty) {
                ref.read(localeProvider.notifier).setLocale(selection.first);
              }
            },
          ),
          const SizedBox(height: 32),
          Text(
            l10n.appearance,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            l10n.appearanceSubtitle,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          const TMThemeToggle(),
          const SizedBox(height: 32),
          Text(
            l10n.serverConnection,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            l10n.serverConnectionSubtitle,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          Form(
            key: _formKey,
            child: TMInput(
              label: l10n.serverUrl,
              hint: l10n.serverUrlHint,
              controller: _controller,
              keyboardType: TextInputType.url,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return l10n.serverUrlRequired;
                }
                return null;
              },
            ),
          ),
          const SizedBox(height: 16),
          TMButton(
            label: l10n.saveServerUrl,
            onTap: state.isLoading || !_hasChanged ? null : _save,
            isLoading: state.isLoading,
          ),
          const SizedBox(height: 32),
          Text(
            l10n.deleteAccount,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.error,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            l10n.deleteAccountSubtitle,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          TMButton(
            label: l10n.deleteAccount,
            onTap: _deleteAccount,
          ),
        ],
      ),
    );
  }
}
