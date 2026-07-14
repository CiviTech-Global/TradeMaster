import 'package:flutter/material.dart';

enum TMButtonVariant { primary, secondary, ghost, outline }

class TMButton extends StatefulWidget {
  final String label;
  final VoidCallback? onTap;
  final TMButtonVariant variant;
  final bool isLoading;
  final bool isFullWidth;
  final IconData? icon;
  final double? height;
  final EdgeInsetsGeometry? padding;

  const TMButton({
    super.key,
    required this.label,
    this.onTap,
    this.variant = TMButtonVariant.primary,
    this.isLoading = false,
    this.isFullWidth = true,
    this.icon,
    this.height,
    this.padding,
  });

  @override
  State<TMButton> createState() => _TMButtonState();
}

class _TMButtonState extends State<TMButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scale = Tween<double>(begin: 1, end: 0.96).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOut,
        reverseCurve: Curves.easeIn,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _handleTapDown(_) async {
    if (widget.onTap == null || widget.isLoading) return;
    await _controller.forward();
  }

  Future<void> _handleTapUp(_) async {
    await _controller.reverse();
  }

  Future<void> _handleTapCancel() async {
    await _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final (bgColor, fgColor, borderColor) = switch (widget.variant) {
      TMButtonVariant.primary => (
          colorScheme.primary,
          colorScheme.onPrimary,
          Colors.transparent,
        ),
      TMButtonVariant.secondary => (
          colorScheme.secondaryContainer,
          colorScheme.onSecondaryContainer,
          Colors.transparent,
        ),
      TMButtonVariant.ghost => (
          Colors.transparent,
          colorScheme.primary,
          Colors.transparent,
        ),
      TMButtonVariant.outline => (
          colorScheme.surface,
          colorScheme.onSurface,
          colorScheme.outlineVariant,
        ),
    };

    final child = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (widget.isLoading)
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(fgColor),
            ),
          )
        else ...[
          if (widget.icon != null) ...[
            Icon(widget.icon, size: 18, color: fgColor),
            const SizedBox(width: 8),
          ],
          Text(
            widget.label,
            style: theme.textTheme.labelLarge?.copyWith(
              color: fgColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ],
    );

    return GestureDetector(
      onTapDown: _handleTapDown,
      onTapUp: _handleTapUp,
      onTapCancel: _handleTapCancel,
      onTap: widget.isLoading ? null : widget.onTap,
      child: AnimatedBuilder(
        animation: _scale,
        builder: (context, child) => Transform.scale(
          scale: _scale.value,
          child: child,
        ),
        child: Container(
          width: widget.isFullWidth ? double.infinity : null,
          height: widget.height ?? 48,
          padding: widget.padding ??
              const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: borderColor, width: 1.5),
            boxShadow: widget.variant == TMButtonVariant.primary
                ? [
                    BoxShadow(
                      color: colorScheme.primary.withValues(alpha: 0.25),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : null,
          ),
          alignment: Alignment.center,
          child: child,
        ),
      ),
    );
  }
}
