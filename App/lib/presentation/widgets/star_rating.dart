import 'package:flutter/material.dart';

/// Display-only star rating widget. Shows filled, half, and empty stars.
class StarRating extends StatelessWidget {
  final double rating;
  final double size;
  final Color? color;

  const StarRating({
    super.key,
    required this.rating,
    this.size = 20,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final starColor = color ?? Colors.amber;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final starValue = index + 1;
        IconData icon;
        if (rating >= starValue) {
          icon = Icons.star;
        } else if (rating >= starValue - 0.5) {
          icon = Icons.star_half;
        } else {
          icon = Icons.star_border;
        }
        return Icon(icon, size: size, color: starColor);
      }),
    );
  }
}

/// Interactive star rating widget. Allows users to tap to select a rating.
class InteractiveStarRating extends StatelessWidget {
  final int rating;
  final ValueChanged<int> onChanged;
  final double size;

  const InteractiveStarRating({
    super.key,
    required this.rating,
    required this.onChanged,
    this.size = 32,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final starValue = index + 1;
        return GestureDetector(
          onTap: () => onChanged(starValue),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2),
            child: Icon(
              starValue <= rating ? Icons.star : Icons.star_border,
              size: size,
              color: Colors.amber,
            ),
          ),
        );
      }),
    );
  }
}
