import 'package:flutter/material.dart';

class TMCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? padding;
  final double borderRadius;
  final bool glassmorphic;
  final List<BoxShadow>? boxShadow;
  final Color? backgroundColor;
  final BorderSide? borderSide;

  const TMCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding,
    this.borderRadius = 16,
    this.glassmorphic = false,
    this.boxShadow,
    this.backgroundColor,
    this.borderSide,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final card = Container(
      padding: padding ?? const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: backgroundColor ??
            (glassmorphic
                ? colorScheme.surface.withValues(alpha: 0.85)
                : colorScheme.surface),
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.fromBorderSide(
          borderSide ??
              BorderSide(
                color: glassmorphic
                    ? colorScheme.outline.withValues(alpha: 0.2)
                    : colorScheme.outlineVariant,
                width: 1,
              ),
        ),
        boxShadow: boxShadow ??
            [
              BoxShadow(
                color: colorScheme.shadow.withValues(alpha: 0.06),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
      ),
      child: child,
    );

    if (onTap == null) return card;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(borderRadius),
      child: card,
    );
  }
}
