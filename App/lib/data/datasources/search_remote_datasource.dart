import 'package:trademaster/core/network/dio_client.dart';
import 'package:trademaster/data/models/business_model.dart';
import 'package:trademaster/data/models/product_model.dart';

class SearchResult {
  final List<ProductModel>? products;
  final PaginationModel? productsPagination;
  final List<BusinessModel>? businesses;

  SearchResult({this.products, this.productsPagination, this.businesses});

  factory SearchResult.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>;

    List<ProductModel>? products;
    PaginationModel? pagination;
    if (data['products'] != null) {
      final productsData = data['products'] as Map<String, dynamic>;
      products = (productsData['data'] as List)
          .map((p) => ProductModel.fromJson(p))
          .toList();
      pagination = PaginationModel.fromJson(productsData['pagination']);
    }

    List<BusinessModel>? businesses;
    if (data['businesses'] != null) {
      businesses = (data['businesses'] as List)
          .map((b) => BusinessModel.fromJson(b))
          .toList();
    }

    return SearchResult(
      products: products,
      productsPagination: pagination,
      businesses: businesses,
    );
  }
}

class SearchRemoteDatasource {
  final DioClient _dioClient;

  SearchRemoteDatasource({DioClient? dioClient})
      : _dioClient = dioClient ?? DioClient.instance;

  Future<SearchResult> search({
    required String query,
    String type = 'all',
    double? lat,
    double? lng,
    double? radiusKm,
    int? categoryId,
  }) async {
    final params = <String, dynamic>{
      'q': query,
      'type': type,
    };
    if (lat != null) params['lat'] = lat;
    if (lng != null) params['lng'] = lng;
    if (radiusKm != null) params['radius_km'] = radiusKm;
    if (categoryId != null) params['category_id'] = categoryId;

    final response =
        await _dioClient.get('/search', queryParameters: params);
    return SearchResult.fromJson(response.data);
  }
}
