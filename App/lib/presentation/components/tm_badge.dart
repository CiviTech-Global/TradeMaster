import 'package:flutter/material.dart';

enum TMBadgeVariant { primary, secondary, success, warning, error, muted }

class TMBadge extends StatelessWidget {
  final String label;
  final TMBadgeVariant variant;
  final IconData? icon;

  const TMBadge({
    super.key,
    required this.label,
    this.variant = TMBadgeVariant.primary,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final (bg, fg) = switch (variant) {
      TMBadgeVariant.primary => (
          colorScheme.primaryContainer,
          colorScheme.onPrimaryContainer,
        ),
      TMBadgeVariant.secondary => (
          colorScheme.secondaryContainer,
          colorScheme.onSecondaryContainer,
        ),
      TMBadgeVariant.success => (
          colorScheme.tertiaryContainer,
          colorScheme.onTertiaryContainer,
        ),
      TMBadgeVariant.warning => (
          Colors.orange.withValues(alpha: 0.15),
          Colors.orange.shade800,
        ),
      TMBadgeVariant.error => (
          colorScheme.errorContainer,
          colorScheme.onErrorContainer,
        ),
      TMBadgeVariant.muted => (
          colorScheme.surfaceContainerHighest,
          colorScheme.onSurfaceVariant,
        ),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: theme.textTheme.labelMedium?.copyWith(
              color: fg,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
