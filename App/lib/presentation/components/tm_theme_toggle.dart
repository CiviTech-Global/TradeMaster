import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/core/theme/theme_provider.dart';

class TMThemeToggle extends ConsumerWidget {
  const TMThemeToggle({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final currentMode = ref.watch(themeProvider);

    return SegmentedButton<TMThemeMode>(
      segments: TMThemeMode.values
          .map(
            (mode) => ButtonSegment(
              value: mode,
              label: Text(mode.label),
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
