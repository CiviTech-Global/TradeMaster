import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/core/network/server_url_provider.dart';
import 'package:trademaster/presentation/components/tm_button.dart';
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

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Spacer(flex: 2),
                Icon(
                  Icons.storefront_rounded,
                  size: 80,
                  color: theme.colorScheme.primary,
                ),
                const SizedBox(height: 24),
                Text(
                  'Welcome to TradeMaster',
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Enter your server address to get started. You can change this later in Settings.',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
                const Spacer(flex: 1),
                TMInput(
                  label: 'Server URL',
                  hint: 'e.g. 192.168.1.100:3000',
                  controller: _controller,
                  keyboardType: TextInputType.url,
                  textInputAction: TextInputAction.done,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter a server URL';
                    }
                    return null;
                  },
                  onSubmitted: (_) => _save(),
                ),
                const SizedBox(height: 8),
                Text(
                  'Tip: Use your computer\'s local IP if testing on a physical device.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 24),
                TMButton(
                  label: 'Connect',
                  onTap: state.isLoading ? null : _save,
                  isLoading: state.isLoading,
                ),
                const SizedBox(height: 12),
                TMButton(
                  label: 'Use Default (localhost)',
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
