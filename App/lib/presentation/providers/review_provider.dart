import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/data/datasources/review_remote_datasource.dart';
import 'package:trademaster/data/models/review_model.dart';
import 'package:trademaster/data/models/product_model.dart';

final reviewDatasourceProvider = Provider<ReviewRemoteDatasource>((ref) {
  return ReviewRemoteDatasource();
});

// Business reviews state
class BusinessReviewsState {
  final List<ReviewModel> reviews;
  final PaginationModel? pagination;
  final ReviewStatsModel? stats;
  final bool isLoading;
  final String? error;

  const BusinessReviewsState({
    this.reviews = const [],
    this.pagination,
    this.stats,
    this.isLoading = false,
    this.error,
  });

  bool get hasMore =>
      pagination != null && pagination!.page < pagination!.totalPages;
}

class BusinessReviewsNotifier extends StateNotifier<BusinessReviewsState> {
  final ReviewRemoteDatasource _datasource;

  BusinessReviewsNotifier(this._datasource)
      : super(const BusinessReviewsState());

  Future<void> loadReviews(int businessId) async {
    state = const BusinessReviewsState(isLoading: true);
    try {
      final response = await _datasource.getBusinessReviews(businessId);
      state = BusinessReviewsState(
        reviews: response.reviews,
        pagination: response.pagination,
        stats: response.stats,
      );
    } catch (e) {
      state = BusinessReviewsState(error: e.toString());
    }
  }

  Future<void> loadMore(int businessId) async {
    if (state.isLoading || !state.hasMore) return;
    state = BusinessReviewsState(
      reviews: state.reviews,
      pagination: state.pagination,
      stats: state.stats,
      isLoading: true,
    );
    try {
      final nextPage = (state.pagination?.page ?? 0) + 1;
      final response = await _datasource.getBusinessReviews(
        businessId,
        page: nextPage,
      );
      state = BusinessReviewsState(
        reviews: [...state.reviews, ...response.reviews],
        pagination: response.pagination,
        stats: response.stats ?? state.stats,
      );
    } catch (e) {
      state = BusinessReviewsState(
        reviews: state.reviews,
        pagination: state.pagination,
        stats: state.stats,
        error: e.toString(),
      );
    }
  }
}

final businessReviewsProvider = StateNotifierProvider.family<
    BusinessReviewsNotifier, BusinessReviewsState, int>(
  (ref, businessId) {
    final notifier =
        BusinessReviewsNotifier(ref.watch(reviewDatasourceProvider));
    notifier.loadReviews(businessId);
    return notifier;
  },
);

// Submit review action
Future<ReviewModel> submitReview(
  ReviewRemoteDatasource datasource, {
  required int businessId,
  int? productId,
  int? orderId,
  required int rating,
  String? comment,
}) async {
  return datasource.createReview(
    businessId: businessId,
    productId: productId,
    orderId: orderId,
    rating: rating,
    comment: comment,
  );
}
