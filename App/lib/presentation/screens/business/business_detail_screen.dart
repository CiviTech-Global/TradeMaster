import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';
import 'package:trademaster/core/constants/api_constants.dart';
import 'package:trademaster/data/models/review_model.dart';
import 'package:trademaster/l10n/generated/app_localizations.dart';
import 'package:trademaster/presentation/components/tm_badge.dart';
import 'package:trademaster/presentation/components/tm_button.dart';
import 'package:trademaster/presentation/components/tm_card.dart';
import 'package:trademaster/presentation/components/tm_empty_state.dart';
import 'package:trademaster/presentation/components/tm_skeleton.dart';
import 'package:trademaster/presentation/providers/business_provider.dart';
import 'package:trademaster/presentation/providers/review_provider.dart';
import 'package:trademaster/presentation/widgets/star_rating.dart';

class BusinessDetailScreen extends ConsumerStatefulWidget {
  final int businessId;

  const BusinessDetailScreen({super.key, required this.businessId});

  @override
  ConsumerState<BusinessDetailScreen> createState() =>
      _BusinessDetailScreenState();
}

class _BusinessDetailScreenState extends ConsumerState<BusinessDetailScreen> {
  List<ReviewModel>? _reviews;
  ReviewStatsModel? _reviewStats;
  bool _loadingReviews = true;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    try {
      final datasource = ref.read(reviewDatasourceProvider);
      final response = await datasource.getBusinessReviews(widget.businessId);
      if (mounted) {
        setState(() {
          _reviews = response.reviews;
          _reviewStats = response.stats;
          _loadingReviews = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingReviews = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final businessState = ref.watch(businessDetailProvider(widget.businessId));
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      body: businessState.when(
        data: (business) {
          return CustomScrollView(
            slivers: [
              // Hero app bar with cover image
              SliverAppBar(
                expandedHeight: 240,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      business.coverImage != null
                          ? CachedNetworkImage(
                              imageUrl: ApiConstants.imageUrl(business.coverImage!),
                              fit: BoxFit.cover,
                            )
                          : Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    colorScheme.primary,
                                    colorScheme.secondary,
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                              ),
                            ),
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withValues(alpha: 0.4),
                              Colors.transparent,
                              Colors.black.withValues(alpha: 0.5),
                            ],
                            stops: const [0.0, 0.5, 1.0],
                          ),
                        ),
                      ),
                    ],
                  ),
                  title: Text(
                    business.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      shadows: [Shadow(blurRadius: 8, color: Colors.black)],
                    ),
                  ),
                ),
              ),

              // Business info
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          if (business.category != null)
                            TMBadge(
                              label: business.category!.name,
                              variant: TMBadgeVariant.secondary,
                              icon: Icons.category,
                            ),
                          const Spacer(),
                          if (_reviewStats?.averageRating != null) ...[
                            const Icon(Icons.star,
                                color: Colors.amber, size: 18),
                            const SizedBox(width: 4),
                            Text(
                              _reviewStats!.averageRating!.toStringAsFixed(1),
                              style: theme.textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              ' (${_reviewStats!.reviewCount} ${l10n.reviews})',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 16),
                      if (business.description != null)
                        Text(
                          business.description!,
                          style: theme.textTheme.bodyLarge,
                        ),

                      // Quick actions
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Expanded(
                            child: TMButton(
                              label: l10n.call,
                              icon: Icons.phone,
                              variant: TMButtonVariant.outline,
                              isFullWidth: true,
                              onTap: business.phones != null &&
                                      business.phones!.isNotEmpty
                                  ? () {}
                                  : null,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TMButton(
                              label: l10n.directions,
                              icon: Icons.directions,
                              variant: TMButtonVariant.outline,
                              isFullWidth: true,
                              onTap: business.latitude != null &&
                                      business.longitude != null
                                  ? () {}
                                  : null,
                            ),
                          ),
                        ],
                      ),

                      // Info cards
                      const SizedBox(height: 20),
                      if (business.address != null)
                        _InfoCard(
                          icon: Icons.location_on,
                          title: l10n.address,
                          content: business.address!,
                        ),
                      if (business.phones != null &&
                          business.phones!.isNotEmpty)
                        _InfoCard(
                          icon: Icons.phone,
                          title: l10n.phone,
                          content: business.phones!.join(', '),
                        ),
                      if (business.emails != null &&
                          business.emails!.isNotEmpty)
                        _InfoCard(
                          icon: Icons.email,
                          title: l10n.email,
                          content: business.emails!.join(', '),
                        ),

                      // Map
                      if (business.latitude != null &&
                          business.longitude != null) ...[
                        const SizedBox(height: 16),
                        TMCard(
                          padding: EdgeInsets.zero,
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: SizedBox(
                              height: 180,
                              child: FlutterMap(
                                options: MapOptions(
                                  initialCenter: LatLng(
                                      business.latitude!, business.longitude!),
                                  initialZoom: 15,
                                  interactionOptions: const InteractionOptions(
                                    flags: InteractiveFlag.none,
                                  ),
                                ),
                                children: [
                                  TileLayer(
                                    urlTemplate:
                                        'https://memaps.ir/hot/{z}/{x}/{y}.png',
                                    userAgentPackageName: 'com.trademaster.app',
                                  ),
                                  MarkerLayer(
                                    markers: [
                                      Marker(
                                        point: LatLng(business.latitude!,
                                            business.longitude!),
                                        child: Icon(Icons.location_pin,
                                            color: colorScheme.primary,
                                            size: 40),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              // Reviews header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsetsDirectional.fromSTEB(16, 24, 16, 8),
                  child: Text(
                    l10n.reviews,
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),

              // Reviews list
              if (_loadingReviews)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: List.generate(
                        3,
                        (_) => const Padding(
                          padding: EdgeInsets.only(bottom: 12),
                          child: TMSkeleton(width: double.infinity, height: 80),
                        ),
                      ),
                    ),
                  ),
                )
              else if (_reviews == null || _reviews!.isEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 32),
                    child: TMEmptyState(
                      icon: Icons.rate_review_outlined,
                      title: l10n.noReviewsYet,
                      subtitle: l10n.noReviewsYetSubtitle,
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final review = _reviews![index];
                        return _ReviewCard(review: review);
                      },
                      childCount: _reviews!.length,
                    ),
                  ),
                ),

              const SliverToBoxAdapter(child: SizedBox(height: 32)),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: TMEmptyState(
            icon: Icons.error_outline,
            title: AppLocalizations.of(context).failedToLoadBusiness,
            subtitle: e.toString(),
            actionLabel: AppLocalizations.of(context).retry,
            onAction: () => ref
                .read(businessDetailProvider(widget.businessId).notifier)
                .load(widget.businessId),
          ),
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String content;

  const _InfoCard({
    required this.icon,
    required this.title,
    required this.content,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TMCard(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: colorScheme.onPrimaryContainer, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    content,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
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

class _ReviewCard extends StatelessWidget {
  final ReviewModel review;

  const _ReviewCard({required this.review});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final l10n = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TMCard(
        child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: colorScheme.primaryContainer,
                child: Text(
                  review.reviewer != null
                      ? review.reviewer!.firstname.isNotEmpty
                          ? review.reviewer!.firstname[0].toUpperCase()
                          : '?'
                      : '?',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: colorScheme.onPrimaryContainer,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      review.reviewer?.fullName ?? l10n.anonymous,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (review.createdAt != null)
                      Text(
                        _formatDate(context, review.createdAt!),
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          StarRating(rating: review.rating.toDouble(), size: 16),
          if (review.comment != null && review.comment!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(review.comment!, style: theme.textTheme.bodyMedium),
          ],
        ],
      ),
    ),
  );
}

  String _formatDate(BuildContext context, String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final locale = Localizations.localeOf(context).toString();
      return DateFormat.yMMMMd(locale).format(date);
    } catch (_) {
      return dateStr;
    }
  }
}
