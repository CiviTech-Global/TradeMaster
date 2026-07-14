import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:trademaster/core/constants/api_constants.dart';
import 'package:trademaster/data/models/business_model.dart';
import 'package:trademaster/presentation/components/tm_badge.dart';

class BusinessCard extends StatelessWidget {
  final BusinessModel business;
  final VoidCallback? onTap;

  const BusinessCard({super.key, required this.business, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colorScheme.outlineVariant.withValues(alpha: 0.6)),
        boxShadow: [
          BoxShadow(
            color: colorScheme.shadow.withValues(alpha: 0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cover image or colored header
            SizedBox(
              height: 120,
              width: double.infinity,
              child: business.coverImage != null
                  ? CachedNetworkImage(
                      imageUrl: ApiConstants.imageUrl(business.coverImage!),
                      fit: BoxFit.cover,
                    )
                  : Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            colorScheme.primary.withValues(alpha: 0.8),
                            colorScheme.secondary.withValues(alpha: 0.8),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: Center(
                        child: Icon(
                          Icons.store,
                          size: 40,
                          color: colorScheme.onPrimary,
                        ),
                      ),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  // Logo avatar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: SizedBox(
                      width: 52,
                      height: 52,
                      child: business.logo != null
                          ? CachedNetworkImage(
                              imageUrl: ApiConstants.imageUrl(business.logo!),
                              fit: BoxFit.cover,
                              errorWidget: (_, err, stack) => _FallbackLogo(theme: theme),
                            )
                          : _FallbackLogo(theme: theme),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          business.title,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (business.address != null) ...[
                          const SizedBox(height: 2),
                          Text(
                            business.address!,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: colorScheme.onSurfaceVariant,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                        if (business.category != null) ...[
                          const SizedBox(height: 6),
                          TMBadge(
                            label: business.category!.name,
                            variant: TMBadgeVariant.secondary,
                          ),
                        ],
                      ],
                    ),
                  ),
                  Icon(
                    Icons.chevron_right,
                    color: colorScheme.onSurfaceVariant,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FallbackLogo extends StatelessWidget {
  final ThemeData theme;

  const _FallbackLogo({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: theme.colorScheme.primaryContainer,
      child: Center(
        child: Icon(
          Icons.store,
          color: theme.colorScheme.onPrimaryContainer,
        ),
      ),
    );
  }
}
