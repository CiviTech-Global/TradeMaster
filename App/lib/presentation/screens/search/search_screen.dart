import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/data/datasources/search_remote_datasource.dart';
import 'package:trademaster/presentation/components/tm_empty_state.dart';
import 'package:trademaster/presentation/components/tm_input.dart';
import 'package:trademaster/presentation/components/tm_skeleton.dart';
import 'package:trademaster/presentation/providers/category_provider.dart';
import 'package:trademaster/presentation/providers/location_provider.dart';
import 'package:trademaster/presentation/widgets/business_card.dart';

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
        type: 'business',
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
  final List<String> _recentSearches = [];

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
    final query = _controller.text.trim();
    if (query.isNotEmpty && !_recentSearches.contains(query)) {
      setState(() {
        _recentSearches.insert(0, query);
        if (_recentSearches.length > 8) _recentSearches.removeLast();
      });
    }
    ref.read(searchResultProvider.notifier).search(
          query: query,
          lat: location.position?.latitude,
          lng: location.position?.longitude,
          categoryId: _selectedCategoryId,
        );
  }

  void _clearSearch() {
    _controller.clear();
    ref.read(searchResultProvider.notifier).clear();
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(searchResultProvider);
    final categories = ref.watch(categoriesProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Search header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Row(
                children: [
                  Expanded(
                    child: Material(
                      color: Colors.transparent,
                      child: TMInput(
                        label: null,
                        hint: 'Search businesses...',
                        controller: _controller,
                        onChanged: _onSearchChanged,
                        onSubmitted: (_) => _performSearch(),
                        textInputAction: TextInputAction.search,
                        suffix: _controller.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear),
                                onPressed: _clearSearch,
                              )
                            : const Icon(Icons.search),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Category filter chips
            SizedBox(
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
                          onTap: () {
                            setState(() => _selectedCategoryId = null);
                            if (_controller.text.isNotEmpty) _performSearch();
                          },
                        ),
                      );
                    }
                    final cat = cats[index - 1];
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: _CategoryChip(
                        label: cat.name,
                        isSelected: _selectedCategoryId == cat.id,
                        onTap: () {
                          setState(() => _selectedCategoryId =
                              _selectedCategoryId == cat.id ? null : cat.id);
                          if (_controller.text.isNotEmpty) _performSearch();
                        },
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

            // Results or empty state
            Expanded(
              child: searchState.when(
                data: (result) {
                  if (result == null) {
                    return ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        if (_recentSearches.isNotEmpty) ...[
                          _SectionTitle('Recent Searches'),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: _recentSearches.map((q) {
                              return ActionChip(
                                avatar: const Icon(Icons.history, size: 16),
                                label: Text(q),
                                onPressed: () {
                                  _controller.text = q;
                                  _performSearch();
                                },
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 24),
                        ],
                        _SectionTitle('Trending Categories'),
                        const SizedBox(height: 8),
                        categories.when(
                          data: (cats) => Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: cats.take(8).map((cat) {
                              return ActionChip(
                                avatar: const Icon(Icons.trending_up, size: 16),
                                label: Text(cat.name),
                                onPressed: () {
                                  setState(() => _selectedCategoryId = cat.id);
                                  _performSearch();
                                },
                              );
                            }).toList(),
                          ),
                          loading: () => const CircularProgressIndicator(strokeWidth: 2),
                          error: (_, err) => const SizedBox.shrink(),
                        ),
                      ],
                    );
                  }

                  final hasBusinesses =
                      result.businesses != null && result.businesses!.isNotEmpty;

                  if (!hasBusinesses) {
                    return TMEmptyState(
                      icon: Icons.search_off,
                      title: 'No results found',
                      subtitle: 'Try a different search term or category.',
                      actionLabel: 'Clear Search',
                      onAction: _clearSearch,
                    );
                  }

                  return ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      _SectionTitle(
                        'Businesses (${result.businesses!.length})',
                      ),
                      const SizedBox(height: 12),
                      ...result.businesses!.map(
                        (b) => BusinessCard(
                          business: b,
                          onTap: () => context.push('/business/${b.id}'),
                        ),
                      ),
                    ],
                  );
                },
                loading: () => ListView(
                  padding: const EdgeInsets.all(16),
                  children: List.generate(
                    4,
                    (_) => const Padding(
                      padding: EdgeInsets.only(bottom: 12),
                      child: TMSkeleton(width: double.infinity, height: 140),
                    ),
                  ),
                ),
                error: (e, _) => TMEmptyState(
                  icon: Icons.error_outline,
                  title: 'Search failed',
                  subtitle: e.toString(),
                  actionLabel: 'Retry',
                  onAction: _performSearch,
                ),
              ),
            ),
          ],
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

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
    );
  }
}
