import 'package:trademaster/core/network/dio_client.dart';
import 'package:trademaster/data/models/product_model.dart';

class ProductRemoteDatasource {
  final DioClient _dioClient;

  ProductRemoteDatasource({DioClient? dioClient})
      : _dioClient = dioClient ?? DioClient.instance;

  Future<ProductListResponse> getProducts({
    int? businessId,
    int? categoryId,
    double? minPrice,
    double? maxPrice,
    String? search,
    double? lat,
    double? lng,
    double? radiusKm,
    int page = 1,
    int limit = 20,
    String? sortBy,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
    };
    if (businessId != null) params['business_id'] = businessId;
    if (categoryId != null) params['category_id'] = categoryId;
    if (minPrice != null) params['min_price'] = minPrice;
    if (maxPrice != null) params['max_price'] = maxPrice;
    if (search != null) params['search'] = search;
    if (lat != null) params['lat'] = lat;
    if (lng != null) params['lng'] = lng;
    if (radiusKm != null) params['radius_km'] = radiusKm;
    if (sortBy != null) params['sort_by'] = sortBy;

    final response =
        await _dioClient.get('/products', queryParameters: params);
    return ProductListResponse.fromJson(response.data);
  }

  Future<ProductModel> getProductById(int id) async {
    final response = await _dioClient.get('/products/$id');
    return ProductModel.fromJson(response.data['data']);
  }

  Future<List<ProductModel>> getProductsByBusiness(int businessId) async {
    final response = await _dioClient.get('/products/business/$businessId');
    return (response.data['data'] as List)
        .map((p) => ProductModel.fromJson(p))
        .toList();
  }

  Future<List<ProductModel>> getNearbyProducts({
    required double lat,
    required double lng,
    double radiusKm = 10,
    int limit = 20,
  }) async {
    final response = await _dioClient.get('/products/nearby', queryParameters: {
      'lat': lat,
      'lng': lng,
      'radius_km': radiusKm,
      'limit': limit,
    });
    return (response.data['data'] as List)
        .map((p) => ProductModel.fromJson(p))
        .toList();
  }
}
