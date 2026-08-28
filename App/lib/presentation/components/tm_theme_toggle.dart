import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/core/theme/theme_provider.dart';
import 'package:trademaster/l10n/generated/app_localizations.dart';

class TMThemeToggle extends ConsumerWidget {
  const TMThemeToggle({super.key});

  String _label(BuildContext context, TMThemeMode mode) {
    final l10n = AppLocalizations.of(context);
    return switch (mode) {
      TMThemeMode.system => l10n.system,
      TMThemeMode.light => l10n.light,
      TMThemeMode.dark => l10n.dark,
    };
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final currentMode = ref.watch(themeProvider);

    return SegmentedButton<TMThemeMode>(
      segments: TMThemeMode.values
          .map(
            (mode) => ButtonSegment(
              value: mode,
              label: Text(_label(context, mode)),
              icon: Icon(mode.icon),
            ),
          )
          .toList(),
      selected: {currentMode},
      onSelectionChanged: (selection) {
        if (selection.isNotEmpty) {
          ref.read(themeProvider.notifier).setMode(selection.first);
        }
      },
      style: ButtonStyle(
        backgroundColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return theme.colorScheme.primaryContainer;
          }
          return theme.colorScheme.surface;
        }),
        foregroundColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return theme.colorScheme.onPrimaryContainer;
          }
          return theme.colorScheme.onSurfaceVariant;
        }),
      ),
    );
  }
}
