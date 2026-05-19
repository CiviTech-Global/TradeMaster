import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
import 'package:trademaster/data/models/business_model.dart';
import 'package:trademaster/presentation/providers/business_provider.dart';
import 'package:trademaster/presentation/providers/category_provider.dart';
import 'package:trademaster/presentation/providers/location_provider.dart';
import 'package:trademaster/presentation/providers/product_provider.dart';
import 'package:trademaster/presentation/widgets/product_card.dart';

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
      ref.read(locationProvider.notifier).getCurrentLocation();
      ref.read(activeBusinessesProvider.notifier).load();
      _loadProducts();
    });
  }

  void _loadProducts() {
    final location = ref.read(locationProvider);
    ref.read(productListProvider.notifier).loadProducts(
          ProductFilters(
            categoryId: _selectedCategoryId,
            lat: location.position?.latitude,
            lng: location.position?.longitude,
            radiusKm: 50,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final location = ref.watch(locationProvider);
    final businesses = ref.watch(activeBusinessesProvider);
    final productState = ref.watch(productListProvider);
    final categories = ref.watch(categoriesProvider);

    final center = location.position != null
        ? LatLng(location.position!.latitude, location.position!.longitude)
        : const LatLng(40.7128, -74.0060); // Default NYC

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            title: const Text('Explore'),
            actions: [
              IconButton(
                icon: Icon(_mapExpanded
                    ? Icons.map_outlined
                    : Icons.map),
                onPressed: () {
                  setState(() => _mapExpanded = !_mapExpanded);
                },
              ),
            ],
          ),

          // Map section
          SliverToBoxAdapter(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              height: _mapExpanded ? 350 : 200,
              child: FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                  initialCenter: center,
                  initialZoom: 12,
                ),
                children: [
                  TileLayer(
                    urlTemplate:
                        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.trademaster.app',
                  ),
                  // Business markers
                  businesses.when(
                    data: (list) => MarkerLayer(
                      markers: list
                          .where((b) => b.latitude != null && b.longitude != null)
                          .map((b) => _buildMarker(b))
                          .toList(),
                    ),
                    loading: () => const MarkerLayer(markers: []),
                    error: (_, _) => const MarkerLayer(markers: []),
                  ),
                  // User location marker
                  if (location.position != null)
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: center,
                          width: 20,
                          height: 20,
                          child: Container(
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ),

          // Category chips
          SliverToBoxAdapter(
            child: SizedBox(
              height: 50,
              child: categories.when(
                data: (cats) => ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  itemCount: cats.length + 1,
                  itemBuilder: (context, index) {
                    if (index == 0) {
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: const Text('All'),
                          selected: _selectedCategoryId == null,
                          onSelected: (_) {
                            setState(() => _selectedCategoryId = null);
                            _loadProducts();
                          },
                        ),
                      );
                    }
                    final cat = cats[index - 1];
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        label: Text(cat.name),
                        selected: _selectedCategoryId == cat.id,
                        onSelected: (_) {
                          setState(() => _selectedCategoryId =
                              _selectedCategoryId == cat.id ? null : cat.id);
                          _loadProducts();
                        },
                      ),
                    );
                  },
                ),
                loading: () =>
                    const Center(child: CircularProgressIndicator(strokeWidth: 2)),
                error: (_, _) => const SizedBox.shrink(),
              ),
            ),
          ),

          // Section header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Row(
                children: [
                  Icon(Icons.local_fire_department_rounded,
                      color: theme.colorScheme.secondary, size: 24),
                  const SizedBox(width: 6),
                  Text(
                    'Products Near You',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Products grid
          if (productState.isLoading && productState.products.isEmpty)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            )
          else if (productState.error != null && productState.products.isEmpty)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.error_outline,
                        size: 48, color: theme.colorScheme.error),
                    const SizedBox(height: 8),
                    Text('Failed to load products',
                        style: theme.textTheme.bodyLarge),
                    const SizedBox(height: 8),
                    FilledButton(
                      onPressed: _loadProducts,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            )
          else if (productState.products.isEmpty)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.inventory_2_outlined,
                        size: 48,
                        color: theme.colorScheme.onSurfaceVariant),
                    const SizedBox(height: 8),
                    Text('No products found',
                        style: theme.textTheme.bodyLarge),
                  ],
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.65,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final product = productState.products[index];
                    return ProductCard(
                      product: product,
                      onTap: () => context.push('/product/${product.id}'),
                    );
                  },
                  childCount: productState.products.length,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Marker _buildMarker(BusinessModel business) {
    return Marker(
      point: LatLng(business.latitude!, business.longitude!),
      width: 40,
      height: 40,
      child: GestureDetector(
        onTap: () => context.push('/business/${business.id}'),
        child: Container(
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: const Icon(Icons.store, color: Colors.white, size: 20),
        ),
      ),
    );
  }
}
