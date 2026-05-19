import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:trademaster/core/constants/api_constants.dart';
import 'package:trademaster/data/models/business_model.dart';

class BusinessCard extends StatelessWidget {
  final BusinessModel business;
  final VoidCallback? onTap;

  const BusinessCard({super.key, required this.business, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: SizedBox(
                  width: 64,
                  height: 64,
                  child: business.logo != null
                      ? CachedNetworkImage(
                          imageUrl: business.logo!.startsWith('http')
                              ? business.logo!
                              : '${ApiConstants.baseUrl}${business.logo}',
                          fit: BoxFit.cover,
                          errorWidget: (_, _, _) => _BusinessIcon(theme: theme),
                        )
                      : _BusinessIcon(theme: theme),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      business.title,
                      style: theme.textTheme.titleMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (business.category != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        business.category!.name,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.primary,
                        ),
                      ),
                    ],
                    if (business.address != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        business.address!,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BusinessIcon extends StatelessWidget {
  final ThemeData theme;

  const _BusinessIcon({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: theme.colorScheme.surfaceContainerHighest,
      child: Center(
        child: Icon(
          Icons.store,
          color: theme.colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }
}
