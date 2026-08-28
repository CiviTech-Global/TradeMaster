import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/core/network/server_url_provider.dart';
import 'package:trademaster/l10n/generated/app_localizations.dart';
import 'package:trademaster/presentation/components/tm_button.dart';
import 'package:trademaster/presentation/providers/locale_provider.dart';
import 'package:trademaster/presentation/components/tm_input.dart';

class ServerUrlSetupScreen extends ConsumerStatefulWidget {
  const ServerUrlSetupScreen({super.key});

  @override
  ConsumerState<ServerUrlSetupScreen> createState() => _ServerUrlSetupScreenState();
}

class _ServerUrlSetupScreenState extends ConsumerState<ServerUrlSetupScreen> {
  final _controller = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    await ref.read(serverUrlProvider.notifier).save(_controller.text.trim());
    if (mounted) {
      context.go('/');
    }
  }

  Future<void> _useDefault() async {
    await ref.read(serverUrlProvider.notifier).save('http://localhost:3000');
    if (mounted) {
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final state = ref.watch(serverUrlProvider);
    final locale = ref.watch(localeProvider);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Align(
                  alignment: AlignmentDirectional.topEnd,
                  child: SegmentedButton<String>(
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
                ),
                const Spacer(flex: 2),
                Icon(
                  Icons.storefront_rounded,
                  size: 80,
                  color: theme.colorScheme.primary,
                ),
                const SizedBox(height: 24),
                Text(
                  l10n.welcomeToTradeMaster,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  l10n.serverUrlSetupSubtitle,
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
                const Spacer(flex: 1),
                TMInput(
                  label: l10n.serverUrl,
                  hint: l10n.serverUrlHint,
                  controller: _controller,
                  keyboardType: TextInputType.url,
                  textInputAction: TextInputAction.done,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return l10n.serverUrlRequired;
                    }
                    return null;
                  },
                  onSubmitted: (_) => _save(),
                ),
                const SizedBox(height: 8),
                Text(
                  l10n.serverUrlTip,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 24),
                TMButton(
                  label: l10n.connect,
                  onTap: state.isLoading ? null : _save,
                  isLoading: state.isLoading,
                ),
                const SizedBox(height: 12),
                TMButton(
                  label: l10n.useDefaultLocalhost,
                  onTap: state.isLoading ? null : _useDefault,
                  variant: TMButtonVariant.outline,
                ),
                const Spacer(flex: 2),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
