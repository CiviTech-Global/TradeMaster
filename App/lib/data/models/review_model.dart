import 'package:trademaster/data/models/product_model.dart';

class ReviewerModel {
  final int id;
  final String firstname;
  final String lastname;
  final String? avatar;

  ReviewerModel({
    required this.id,
    required this.firstname,
    required this.lastname,
    this.avatar,
  });

  String get fullName => '$firstname $lastname';

  factory ReviewerModel.fromJson(Map<String, dynamic> json) => ReviewerModel(
        id: json['id'] as int? ?? 0,
        firstname: json['firstname'] as String? ?? '',
        lastname: json['lastname'] as String? ?? '',
        avatar: json['avatar'] as String?,
      );
}

class ReviewModel {
  final int id;
  final int reviewerId;
  final int businessId;
  final int? productId;
  final int? orderId;
  final int rating;
  final String? comment;
  final ReviewerModel? reviewer;
  final String? createdAt;
  final String? updatedAt;

  ReviewModel({
    required this.id,
    required this.reviewerId,
    required this.businessId,
    this.productId,
    this.orderId,
    required this.rating,
    this.comment,
    this.reviewer,
    this.createdAt,
    this.updatedAt,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) => ReviewModel(
        id: json['id'] as int? ?? 0,
        reviewerId: json['reviewer_id'] as int? ?? 0,
        businessId: json['business_id'] as int? ?? 0,
        productId: json['product_id'] as int?,
        orderId: json['order_id'] as int?,
        rating: json['rating'] as int? ?? 0,
        comment: json['comment'] as String?,
        reviewer: json['reviewer'] != null
            ? ReviewerModel.fromJson(json['reviewer'])
            : null,
        createdAt: json['createdAt'],
        updatedAt: json['updatedAt'],
      );
}

class ReviewStatsModel {
  final double? averageRating;
  final int reviewCount;

  ReviewStatsModel({
    this.averageRating,
    required this.reviewCount,
  });

  factory ReviewStatsModel.fromJson(Map<String, dynamic> json) =>
      ReviewStatsModel(
        averageRating: json['averageRating'] != null
            ? double.tryParse(json['averageRating'].toString())
            : null,
        reviewCount: json['reviewCount'] ?? 0,
      );
}

class ReviewListResponse {
  final List<ReviewModel> reviews;
  final PaginationModel pagination;
  final ReviewStatsModel? stats;

  ReviewListResponse({
    required this.reviews,
    required this.pagination,
    this.stats,
  });

  factory ReviewListResponse.fromJson(Map<String, dynamic> json) =>
      ReviewListResponse(
        reviews: (json['data'] as List)
            .map((r) => ReviewModel.fromJson(r))
            .toList(),
        pagination: PaginationModel.fromJson(json['pagination']),
        stats: json['stats'] != null
            ? ReviewStatsModel.fromJson(json['stats'])
            : null,
      );
}
