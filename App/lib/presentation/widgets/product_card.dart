import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:trademaster/core/constants/api_constants.dart';
import 'package:trademaster/data/models/product_model.dart';

class ProductCard extends StatelessWidget {
  final ProductModel product;
  final VoidCallback? onTap;

  const ProductCard({super.key, required this.product, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final imageUrl = product.primaryImageUrl;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 3,
              child: SizedBox(
                width: double.infinity,
                child: imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: ApiConstants.imageUrl(imageUrl),
                        fit: BoxFit.cover,
                        placeholder: (_, _) => Container(
                          color: theme.colorScheme.surfaceContainerHighest,
                          child: const Center(
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        ),
                        errorWidget: (_, _, _) =>
                            _PlaceholderImage(theme: theme),
                      )
                    : _PlaceholderImage(theme: theme),
              ),
            ),
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Flexible(
                      child: Text(
                        product.title,
                        style: theme.textTheme.titleSmall,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '\$${product.price.toStringAsFixed(2)}',
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                    ),
                    if (product.business != null)
                      Text(
                        product.business!.title,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlaceholderImage extends StatelessWidget {
  final ThemeData theme;

  const _PlaceholderImage({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            theme.colorScheme.tertiary.withValues(alpha: 0.08),
            theme.colorScheme.secondary.withValues(alpha: 0.06),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Icon(
          Icons.image_outlined,
          size: 48,
          color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.3),
        ),
      ),
    );
  }
}
