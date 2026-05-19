import 'package:trademaster/core/network/dio_client.dart';
import 'package:trademaster/data/models/review_model.dart';

class ReviewRemoteDatasource {
  final DioClient _dioClient;

  ReviewRemoteDatasource({DioClient? dioClient})
      : _dioClient = dioClient ?? DioClient.instance;

  Future<ReviewListResponse> getBusinessReviews(
    int businessId, {
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _dioClient.get(
      '/reviews/business/$businessId',
      queryParameters: {'page': page, 'limit': limit},
    );
    return ReviewListResponse.fromJson(response.data);
  }

  Future<ReviewListResponse> getProductReviews(
    int productId, {
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _dioClient.get(
      '/reviews/product/$productId',
      queryParameters: {'page': page, 'limit': limit},
    );
    return ReviewListResponse.fromJson(response.data);
  }

  Future<ReviewModel> createReview({
    required int businessId,
    int? productId,
    int? orderId,
    required int rating,
    String? comment,
  }) async {
    final response = await _dioClient.post('/reviews', data: {
      'business_id': businessId,
      'product_id': ?productId,
      'order_id': ?orderId,
      'rating': rating,
      if (comment != null && comment.isNotEmpty) 'comment': comment,
    });
    return ReviewModel.fromJson(response.data['data']);
  }

  Future<ReviewModel> updateReview(
    int id, {
    int? rating,
    String? comment,
  }) async {
    final response = await _dioClient.patch('/reviews/$id', data: {
      'rating': ?rating,
      'comment': ?comment,
    });
    return ReviewModel.fromJson(response.data['data']);
  }

  Future<bool> deleteReview(int id) async {
    await _dioClient.delete('/reviews/$id');
    return true;
  }
}
