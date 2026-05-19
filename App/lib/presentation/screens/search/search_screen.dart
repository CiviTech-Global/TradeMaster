import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/data/datasources/search_remote_datasource.dart';
import 'package:trademaster/presentation/providers/category_provider.dart';
import 'package:trademaster/presentation/providers/location_provider.dart';
import 'package:trademaster/presentation/widgets/business_card.dart';
import 'package:trademaster/presentation/widgets/product_card.dart';

final searchDatasourceProvider = Provider<SearchRemoteDatasource>((ref) {
  return SearchRemoteDatasource();
});

final searchResultProvider =
    StateNotifierProvider<SearchResultNotifier, AsyncValue<SearchResult?>>(
        (ref) {
  return SearchResultNotifier(ref.watch(searchDatasourceProvider));
});

class SearchResultNotifier
    extends StateNotifier<AsyncValue<SearchResult?>> {
  final SearchRemoteDatasource _datasource;

  SearchResultNotifier(this._datasource)
      : super(const AsyncValue.data(null));

  Future<void> search({
    required String query,
    String type = 'all',
    double? lat,
    double? lng,
    int? categoryId,
  }) async {
    if (query.trim().isEmpty) {
      state = const AsyncValue.data(null);
      return;
    }
    state = const AsyncValue.loading();
    try {
      final result = await _datasource.search(
        query: query,
        type: type,
        lat: lat,
        lng: lng,
        categoryId: categoryId,
      );
      state = AsyncValue.data(result);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void clear() {
    state = const AsyncValue.data(null);
  }
}

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _controller = TextEditingController();
  Timer? _debounce;
  int? _selectedCategoryId;

  @override
  void dispose() {
    _controller.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      _performSearch();
    });
  }

  void _performSearch() {
    final location = ref.read(locationProvider);
    ref.read(searchResultProvider.notifier).search(
          query: _controller.text,
          lat: location.position?.latitude,
          lng: location.position?.longitude,
          categoryId: _selectedCategoryId,
        );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final searchState = ref.watch(searchResultProvider);
    final categories = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _controller,
          autofocus: false,
          decoration: InputDecoration(
            hintText: 'Search products & businesses...',
            border: InputBorder.none,
            contentPadding: EdgeInsets.zero,
            suffixIcon: _controller.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear),
                    onPressed: () {
                      _controller.clear();
                      ref.read(searchResultProvider.notifier).clear();
                    },
                  )
                : null,
          ),
          onChanged: _onSearchChanged,
          onSubmitted: (_) => _performSearch(),
        ),
      ),
      body: Column(
        children: [
          // Category filter chips
          SizedBox(
            height: 50,
            child: categories.when(
              data: (cats) => ListView.builder(
                scrollDirection: Axis.horizontal,
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
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
                          if (_controller.text.isNotEmpty) _performSearch();
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
                        if (_controller.text.isNotEmpty) _performSearch();
                      },
                    ),
                  );
                },
              ),
              loading: () => const SizedBox.shrink(),
              error: (_, _) => const SizedBox.shrink(),
            ),
          ),

          // Results
          Expanded(
            child: searchState.when(
              data: (result) {
                if (result == null) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.search,
                            size: 64,
                            color: theme.colorScheme.onSurfaceVariant
                                .withValues(alpha: 0.4)),
                        const SizedBox(height: 12),
                        Text(
                          'Search for products or businesses',
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                final hasProducts =
                    result.products != null && result.products!.isNotEmpty;
                final hasBusinesses =
                    result.businesses != null && result.businesses!.isNotEmpty;

                if (!hasProducts && !hasBusinesses) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.search_off,
                            size: 48,
                            color: theme.colorScheme.onSurfaceVariant),
                        const SizedBox(height: 8),
                        Text('No results found',
                            style: theme.textTheme.bodyLarge),
                      ],
                    ),
                  );
                }

                return ListView(
                  padding: const EdgeInsets.all(12),
                  children: [
                    // Businesses section
                    if (hasBusinesses) ...[
                      Text('Businesses',
                          style: theme.textTheme.titleMedium),
                      const SizedBox(height: 8),
                      ...result.businesses!.map(
                        (b) => BusinessCard(
                          business: b,
                          onTap: () => context.push('/business/${b.id}'),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Products section
                    if (hasProducts) ...[
                      Text('Products',
                          style: theme.textTheme.titleMedium),
                      const SizedBox(height: 8),
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.65,
                          crossAxisSpacing: 8,
                          mainAxisSpacing: 8,
                        ),
                        itemCount: result.products!.length,
                        itemBuilder: (context, index) {
                          final product = result.products![index];
                          return ProductCard(
                            product: product,
                            onTap: () => context.push('/product/${product.id}'),
                          );
                        },
                      ),
                    ],
                  ],
                );
              },
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.error_outline,
                        size: 48, color: theme.colorScheme.error),
                    const SizedBox(height: 8),
                    Text('Search failed', style: theme.textTheme.bodyLarge),
                    const SizedBox(height: 8),
                    FilledButton(
                      onPressed: _performSearch,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
