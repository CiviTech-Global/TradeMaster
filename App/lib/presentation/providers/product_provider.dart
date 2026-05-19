import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/data/datasources/product_remote_datasource.dart';
import 'package:trademaster/data/models/product_model.dart';

final productDatasourceProvider = Provider<ProductRemoteDatasource>((ref) {
  return ProductRemoteDatasource();
});

// Single product detail
class ProductDetailNotifier extends StateNotifier<AsyncValue<ProductModel>> {
  final ProductRemoteDatasource _datasource;

  ProductDetailNotifier(this._datasource) : super(const AsyncValue.loading());

  Future<void> loadProduct(int id) async {
    state = const AsyncValue.loading();
    try {
      final product = await _datasource.getProductById(id);
      state = AsyncValue.data(product);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final productDetailProvider =
    StateNotifierProvider.family<ProductDetailNotifier, AsyncValue<ProductModel>, int>(
  (ref, id) {
    final notifier = ProductDetailNotifier(ref.watch(productDatasourceProvider));
    notifier.loadProduct(id);
    return notifier;
  },
);

// Products list with filters
class ProductFilters {
  final int? businessId;
  final int? categoryId;
  final double? minPrice;
  final double? maxPrice;
  final String? search;
  final double? lat;
  final double? lng;
  final double? radiusKm;
  final int page;
  final int limit;
  final String? sortBy;

  const ProductFilters({
    this.businessId,
    this.categoryId,
    this.minPrice,
    this.maxPrice,
    this.search,
    this.lat,
    this.lng,
    this.radiusKm,
    this.page = 1,
    this.limit = 20,
    this.sortBy,
  });

  ProductFilters copyWith({
    int? businessId,
    int? categoryId,
    double? minPrice,
    double? maxPrice,
    String? search,
    double? lat,
    double? lng,
    double? radiusKm,
    int? page,
    int? limit,
    String? sortBy,
  }) {
    return ProductFilters(
      businessId: businessId ?? this.businessId,
      categoryId: categoryId ?? this.categoryId,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      search: search ?? this.search,
      lat: lat ?? this.lat,
      lng: lng ?? this.lng,
      radiusKm: radiusKm ?? this.radiusKm,
      page: page ?? this.page,
      limit: limit ?? this.limit,
      sortBy: sortBy ?? this.sortBy,
    );
  }
}

class ProductListState {
  final List<ProductModel> products;
  final PaginationModel? pagination;
  final bool isLoading;
  final String? error;

  const ProductListState({
    this.products = const [],
    this.pagination,
    this.isLoading = false,
    this.error,
  });

  bool get hasMore =>
      pagination != null && pagination!.page < pagination!.totalPages;
}

class ProductListNotifier extends StateNotifier<ProductListState> {
  final ProductRemoteDatasource _datasource;

  ProductListNotifier(this._datasource) : super(const ProductListState());

  Future<void> loadProducts(ProductFilters filters) async {
    state = ProductListState(isLoading: true);
    try {
      final response = await _datasource.getProducts(
        businessId: filters.businessId,
        categoryId: filters.categoryId,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        search: filters.search,
        lat: filters.lat,
        lng: filters.lng,
        radiusKm: filters.radiusKm,
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
      );
      state = ProductListState(
        products: response.products,
        pagination: response.pagination,
      );
    } catch (e) {
      state = ProductListState(error: e.toString());
    }
  }

  Future<void> loadMore(ProductFilters filters) async {
    if (state.isLoading || !state.hasMore) return;
    state = ProductListState(
      products: state.products,
      pagination: state.pagination,
      isLoading: true,
    );
    try {
      final nextPage = (state.pagination?.page ?? 0) + 1;
      final response = await _datasource.getProducts(
        businessId: filters.businessId,
        categoryId: filters.categoryId,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        search: filters.search,
        lat: filters.lat,
        lng: filters.lng,
        radiusKm: filters.radiusKm,
        page: nextPage,
        limit: filters.limit,
        sortBy: filters.sortBy,
      );
      state = ProductListState(
        products: [...state.products, ...response.products],
        pagination: response.pagination,
      );
    } catch (e) {
      state = ProductListState(
        products: state.products,
        pagination: state.pagination,
        error: e.toString(),
      );
    }
  }
}

final productListProvider =
    StateNotifierProvider<ProductListNotifier, ProductListState>((ref) {
  return ProductListNotifier(ref.watch(productDatasourceProvider));
});

// Nearby products
class NearbyProductsNotifier
    extends StateNotifier<AsyncValue<List<ProductModel>>> {
  final ProductRemoteDatasource _datasource;

  NearbyProductsNotifier(this._datasource)
      : super(const AsyncValue.loading());

  Future<void> loadNearby({
    required double lat,
    required double lng,
    double radiusKm = 10,
    int limit = 20,
  }) async {
    state = const AsyncValue.loading();
    try {
      final products = await _datasource.getNearbyProducts(
        lat: lat,
        lng: lng,
        radiusKm: radiusKm,
        limit: limit,
      );
      state = AsyncValue.data(products);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final nearbyProductsProvider = StateNotifierProvider<NearbyProductsNotifier,
    AsyncValue<List<ProductModel>>>((ref) {
  return NearbyProductsNotifier(ref.watch(productDatasourceProvider));
});
