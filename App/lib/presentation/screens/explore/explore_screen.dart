import 'dart:developer' as developer;

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
import 'package:trademaster/data/models/business_model.dart';
import 'package:trademaster/presentation/components/tm_card.dart';
import 'package:trademaster/presentation/components/tm_empty_state.dart';
import 'package:trademaster/presentation/components/tm_skeleton.dart';
import 'package:trademaster/presentation/providers/business_provider.dart';
import 'package:trademaster/presentation/providers/category_provider.dart';
import 'package:trademaster/presentation/providers/location_provider.dart';
import 'package:trademaster/presentation/widgets/business_card.dart';

class ExploreScreen extends ConsumerStatefulWidget {
  const ExploreScreen({super.key});

  @override
  ConsumerState<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends ConsumerState<ExploreScreen> {
  final MapController _mapController = MapController();
  bool _mapExpanded = false;
  int? _selectedCategoryId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      developer.log('ExploreScreen.initState: loading data', name: 'ExploreScreen');
      ref.read(locationProvider.notifier).getCurrentLocation();
      ref.read(activeBusinessesProvider.notifier).load();
    });
  }

  Future<void> _refresh() async {
    await ref.read(activeBusinessesProvider.notifier).load();
  }

  List<BusinessModel> _filterByCategory(List<BusinessModel> list) {
    if (_selectedCategoryId == null) return list;
    return list
        .where((b) => b.category?.id == _selectedCategoryId)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final location = ref.watch(locationProvider);
    final businesses = ref.watch(activeBusinessesProvider);
    final categories = ref.watch(categoriesProvider);

    final center = location.position != null
        ? LatLng(location.position!.latitude, location.position!.longitude)
        : const LatLng(40.7128, -74.0060);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _refresh,
        color: colorScheme.primary,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Hero search bar
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(
                  16,
                  MediaQuery.of(context).padding.top + 16,
                  16,
                  8,
                ),
                child: GestureDetector(
                  onTap: () => context.push('/search'),
                  child: TMCard(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.search,
                          color: colorScheme.onSurfaceVariant,
                        ),
                        const SizedBox(width: 12),
                        Text(
                          'Search businesses...',
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const Spacer(),
                        Icon(
                          Icons.tune,
                          color: colorScheme.onSurfaceVariant,
                          size: 20,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // Map section
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: TMCard(
                  padding: EdgeInsets.zero,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      height: _mapExpanded ? 320 : 220,
                      child: Stack(
                        children: [
                          FlutterMap(
                            mapController: _mapController,
                            options: MapOptions(
                              initialCenter: center,
                              initialZoom: 12,
                            ),
                            children: [
                              TileLayer(
                                urlTemplate:
                                    'https://memaps.ir/hot/{z}/{x}/{y}.png',
                                userAgentPackageName: 'com.trademaster.app',
                              ),
                              businesses.when(
                                data: (list) => MarkerLayer(
                                  markers: list
                                      .where((b) =>
                                          b.latitude != null &&
                                          b.longitude != null)
                                      .map((b) => _buildMarker(b))
                                      .toList(),
                                ),
                                loading: () =>
                                    const MarkerLayer(markers: []),
                                error: (_, err) =>
                                    const MarkerLayer(markers: []),
                              ),
                              if (location.position != null)
                                MarkerLayer(
                                  markers: [
                                    Marker(
                                      point: center,
                                      width: 20,
                                      height: 20,
                                      child: Container(
                                        decoration: BoxDecoration(
                                          color: colorScheme.primary,
                                          shape: BoxShape.circle,
                                          border: Border.all(
                                            color: Colors.white,
                                            width: 2,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                            ],
                          ),
                          Positioned(
                            top: 12,
                            right: 12,
                            child: Material(
                              color: colorScheme.surface.withValues(alpha: 0.9),
                              borderRadius: BorderRadius.circular(12),
                              child: InkWell(
                                borderRadius: BorderRadius.circular(12),
                                onTap: () => setState(
                                    () => _mapExpanded = !_mapExpanded),
                                child: Container(
                                  padding: const EdgeInsets.all(8),
                                  child: Icon(
                                    _mapExpanded
                                        ? Icons.fullscreen_exit
                                        : Icons.fullscreen,
                                    color: colorScheme.onSurface,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Category chips
            SliverToBoxAdapter(
              child: SizedBox(
                height: 56,
                child: categories.when(
                  data: (cats) => ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    itemCount: cats.length + 1,
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: _CategoryChip(
                            label: 'All',
                            isSelected: _selectedCategoryId == null,
                            onTap: () => setState(() => _selectedCategoryId = null),
                          ),
                        );
                      }
                      final cat = cats[index - 1];
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: _CategoryChip(
                          label: cat.name,
                          isSelected: _selectedCategoryId == cat.id,
                          onTap: () => setState(() =>
                              _selectedCategoryId =
                                  _selectedCategoryId == cat.id ? null : cat.id),
                        ),
                      );
                    },
                  ),
                  loading: () => const Center(
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                  error: (_, err) => const SizedBox.shrink(),
                ),
              ),
            ),

            // Section header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                child: Row(
                  children: [
                    Icon(
                      Icons.store_rounded,
                      color: colorScheme.secondary,
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Businesses Near You',
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Businesses list
            businesses.when(
              data: (list) {
                final filtered = _filterByCategory(list);
                if (filtered.isEmpty) {
                  return SliverFillRemaining(
                    hasScrollBody: false,
                    child: TMEmptyState(
                      icon: Icons.storefront_outlined,
                      title: 'No businesses found',
                      subtitle: 'Try selecting a different category or pull down to refresh.',
                      actionLabel: 'Refresh',
                      onAction: _refresh,
                    ),
                  );
                }

                return SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final business = filtered[index];
                        return BusinessCard(
                          business: business,
                          onTap: () => context.push('/business/${business.id}'),
                        );
                      },
                      childCount: filtered.length,
                    ),
                  ),
                );
              },
              loading: () => SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => _SkeletonBusinessCard(),
                    childCount: 5,
                  ),
                ),
              ),
              error: (e, _) => SliverFillRemaining(
                hasScrollBody: false,
                child: TMEmptyState(
                  icon: Icons.error_outline,
                  title: 'Failed to load businesses',
                  subtitle: e.toString(),
                  actionLabel: 'Retry',
                  onAction: _refresh,
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }

  Marker _buildMarker(BusinessModel business) {
    final colorScheme = Theme.of(context).colorScheme;
    return Marker(
      point: LatLng(business.latitude!, business.longitude!),
      width: 44,
      height: 44,
      child: GestureDetector(
        onTap: () => context.push('/business/${business.id}'),
        child: Container(
          decoration: BoxDecoration(
            color: colorScheme.primary,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.25),
                blurRadius: 6,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: const Icon(Icons.store, color: Colors.white, size: 20),
        ),
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Material(
      color: isSelected
          ? colorScheme.primary
          : colorScheme.surfaceContainerHighest,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          child: Text(
            label,
            style: TextStyle(
              color: isSelected
                  ? colorScheme.onPrimary
                  : colorScheme.onSurfaceVariant,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              fontSize: 13,
            ),
          ),
        ),
      ),
    );
  }
}

class _SkeletonBusinessCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          const TMSkeleton(width: double.infinity, height: 120, borderRadius: 0),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                const TMSkeleton.circle(diameter: 52),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const TMSkeleton(width: 140, height: 16),
                      const SizedBox(height: 8),
                      const TMSkeleton(width: 100, height: 12),
                      const SizedBox(height: 8),
                      TMSkeleton(width: 70, height: 22, borderRadius: 8),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
