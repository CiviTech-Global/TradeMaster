import 'package:flutter/material.dart';

class TMSkeleton extends StatefulWidget {
  final double width;
  final double height;
  final double borderRadius;

  const TMSkeleton({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 8,
  });

  const TMSkeleton.circle({
    super.key,
    required double diameter,
  })  : width = diameter,
        height = diameter,
        borderRadius = 9999;

  @override
  State<TMSkeleton> createState() => _TMSkeletonState();
}

class _TMSkeletonState extends State<TMSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<Offset> _offset;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();
    _offset = Tween<Offset>(
      begin: const Offset(-2, 0),
      end: const Offset(2, 0),
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final baseColor = theme.colorScheme.surfaceContainerHighest;
    final highlightColor = theme.colorScheme.surface;

    return ClipRRect(
      borderRadius: BorderRadius.circular(widget.borderRadius),
      child: SizedBox(
        width: widget.width,
        height: widget.height,
        child: AnimatedBuilder(
          animation: _offset,
          builder: (context, child) {
            return ShaderMask(
              shaderCallback: (bounds) {
                return LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    baseColor,
                    highlightColor,
                    baseColor,
                  ],
                  stops: const [0.0, 0.5, 1.0],
                  transform: GradientRotation(_offset.value.dx * 0.5),
                ).createShader(bounds);
              },
              child: Container(
                width: widget.width,
                height: widget.height,
                color: baseColor,
              ),
            );
          },
        ),
      ),
    );
  }
}

class TMSkeletonList extends StatelessWidget {
  final int itemCount;
  final Widget item;

  const TMSkeletonList({
    super.key,
    this.itemCount = 5,
    required this.item,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(itemCount, (_) => item),
    );
  }
}
