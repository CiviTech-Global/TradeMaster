import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/core/network/server_url_provider.dart';
import 'package:trademaster/core/network/server_url_repository.dart';
import 'package:trademaster/presentation/components/tm_button.dart';
import 'package:trademaster/presentation/components/tm_input.dart';
import 'package:trademaster/presentation/components/tm_theme_toggle.dart';

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
        const SnackBar(content: Text('Server URL saved')),
      );
      setState(() => _hasChanged = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final state = ref.watch(serverUrlProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Appearance',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose how TradeMaster looks on your device.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          const TMThemeToggle(),
          const SizedBox(height: 32),
          Text(
            'Server Connection',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Change the address your app uses to reach the TradeMaster server.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          Form(
            key: _formKey,
            child: TMInput(
              label: 'Server URL',
              hint: 'e.g. 192.168.1.100:3000',
              controller: _controller,
              keyboardType: TextInputType.url,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter a server URL';
                }
                return null;
              },
            ),
          ),
          const SizedBox(height: 16),
          TMButton(
            label: 'Save Server URL',
            onTap: state.isLoading || !_hasChanged ? null : _save,
            isLoading: state.isLoading,
          ),
        ],
      ),
    );
  }
}
