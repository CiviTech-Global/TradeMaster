import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
import 'package:trademaster/core/constants/api_constants.dart';
import 'package:trademaster/data/models/product_model.dart';
import 'package:trademaster/data/models/review_model.dart';
import 'package:trademaster/presentation/providers/business_provider.dart';
import 'package:trademaster/presentation/providers/product_provider.dart';
import 'package:trademaster/presentation/providers/review_provider.dart';
import 'package:trademaster/presentation/widgets/product_card.dart';
import 'package:trademaster/presentation/widgets/star_rating.dart';

class BusinessDetailScreen extends ConsumerStatefulWidget {
  final int businessId;

  const BusinessDetailScreen({super.key, required this.businessId});

  @override
  ConsumerState<BusinessDetailScreen> createState() =>
      _BusinessDetailScreenState();
}

class _BusinessDetailScreenState extends ConsumerState<BusinessDetailScreen> {
  List<ProductModel>? _products;
  bool _loadingProducts = true;

  List<ReviewModel>? _reviews;
  ReviewStatsModel? _reviewStats;
  bool _loadingReviews = true;

  @override
  void initState() {
    super.initState();
    _loadProducts();
    _loadReviews();
  }

  Future<void> _loadProducts() async {
    try {
      final datasource = ref.read(productDatasourceProvider);
      final products =
          await datasource.getProductsByBusiness(widget.businessId);
      if (mounted) {
        setState(() {
          _products = products;
          _loadingProducts = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingProducts = false);
    }
  }

  Future<void> _loadReviews() async {
    try {
      final datasource = ref.read(reviewDatasourceProvider);
      final response =
          await datasource.getBusinessReviews(widget.businessId);
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
    final businessState = ref.watch(businessDetailProvider(widget.businessId));

    return Scaffold(
      body: businessState.when(
        data: (business) {
          return CustomScrollView(
            slivers: [
              // App bar with cover image
              SliverAppBar(
                expandedHeight: 200,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  title: Text(
                    business.title,
                    style: const TextStyle(
                      shadows: [Shadow(blurRadius: 8, color: Colors.black)],
                    ),
                  ),
                  background: business.coverImage != null
                      ? CachedNetworkImage(
                          imageUrl: business.coverImage!.startsWith('http')
                              ? business.coverImage!
                              : '${ApiConstants.baseUrl}${business.coverImage}',
                          fit: BoxFit.cover,
                        )
                      : Container(
                          color: theme.colorScheme.primaryContainer,
                          child: Center(
                            child: Icon(Icons.store,
                                size: 64,
                                color: theme.colorScheme.onPrimaryContainer),
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
                      // Category chip
                      if (business.category != null)
                        Chip(
                          label: Text(business.category!.name),
                          avatar: const Icon(Icons.category, size: 16),
                        ),
                      if (business.description != null) ...[
                        const SizedBox(height: 12),
                        Text(business.description!,
                            style: theme.textTheme.bodyLarge),
                      ],

                      // Contact info
                      const SizedBox(height: 16),
                      if (business.address != null)
                        _InfoRow(
                            icon: Icons.location_on, text: business.address!),
                      if (business.phones != null &&
                          business.phones!.isNotEmpty)
                        _InfoRow(
                            icon: Icons.phone,
                            text: business.phones!.join(', ')),
                      if (business.emails != null &&
                          business.emails!.isNotEmpty)
                        _InfoRow(
                            icon: Icons.email,
                            text: business.emails!.join(', ')),

                      // Map
                      if (business.latitude != null &&
                          business.longitude != null) ...[
                        const SizedBox(height: 16),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: SizedBox(
                            height: 150,
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
                                      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                  userAgentPackageName: 'com.trademaster.app',
                                ),
                                MarkerLayer(
                                  markers: [
                                    Marker(
                                      point: LatLng(business.latitude!,
                                          business.longitude!),
                                      child: Icon(Icons.location_pin,
                                          color: theme.colorScheme.primary,
                                          size: 40),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              // Products header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                  child: Text('Products', style: theme.textTheme.titleLarge),
                ),
              ),

              // Products grid
              if (_loadingProducts)
                const SliverToBoxAdapter(
                  child: Center(
                      child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator(),
                  )),
                )
              else if (_products == null || _products!.isEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Center(
                      child: Text('No products yet',
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          )),
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  sliver: SliverGrid(
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.65,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final product = _products![index];
                        return ProductCard(
                          product: product,
                          onTap: () => context.push('/product/${product.id}'),
                        );
                      },
                      childCount: _products!.length,
                    ),
                  ),
                ),

              // Reviews header with stats
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
                  child: Row(
                    children: [
                      Text('Reviews', style: theme.textTheme.titleLarge),
                      if (_reviewStats != null &&
                          _reviewStats!.averageRating != null) ...[
                        const SizedBox(width: 12),
                        StarRating(
                            rating: _reviewStats!.averageRating!, size: 18),
                        const SizedBox(width: 6),
                        Text(
                          '${_reviewStats!.averageRating!.toStringAsFixed(1)} (${_reviewStats!.reviewCount})',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              // Reviews list
              if (_loadingReviews)
                const SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: CircularProgressIndicator(),
                    ),
                  ),
                )
              else if (_reviews == null || _reviews!.isEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Center(
                      child: Text(
                        'No reviews yet',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
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

              const SliverToBoxAdapter(child: SizedBox(height: 24)),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline,
                  size: 48, color: theme.colorScheme.error),
              const SizedBox(height: 8),
              Text('Failed to load business'),
              const SizedBox(height: 8),
              FilledButton(
                onPressed: () => ref
                    .read(businessDetailProvider(widget.businessId).notifier)
                    .load(widget.businessId),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text, style: Theme.of(context).textTheme.bodyMedium),
          ),
        ],
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
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  child: Text(
                    review.reviewer != null
                        ? review.reviewer!.firstname.isNotEmpty
                            ? review.reviewer!.firstname[0].toUpperCase()
                            : '?'
                        : '?',
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        review.reviewer?.fullName ?? 'Anonymous',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (review.createdAt != null)
                        Text(
                          _formatDate(review.createdAt!),
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
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

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${months[date.month - 1]} ${date.day}, ${date.year}';
    } catch (_) {
      return dateStr;
    }
  }
}
