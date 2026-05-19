import 'package:trademaster/core/network/dio_client.dart';
import 'package:trademaster/data/models/order_model.dart';

class OrderRemoteDatasource {
  final DioClient _dioClient;

  OrderRemoteDatasource({DioClient? dioClient})
      : _dioClient = dioClient ?? DioClient.instance;

  Future<OrderModel> createOrder({
    required int businessId,
    required List<Map<String, dynamic>> items,
    String? shippingAddress,
    String? notes,
  }) async {
    final response = await _dioClient.post('/orders', data: {
      'business_id': businessId,
      'items': items,
      'shipping_address': ?shippingAddress,
      'notes': ?notes,
    });
    return OrderModel.fromJson(response.data['data']);
  }

  Future<OrderListResponse> getOrders({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
    };
    if (status != null) params['status'] = status;

    final response =
        await _dioClient.get('/orders', queryParameters: params);
    return OrderListResponse.fromJson(response.data);
  }

  Future<OrderModel> getOrderById(int id) async {
    final response = await _dioClient.get('/orders/$id');
    return OrderModel.fromJson(response.data['data']);
  }

  Future<OrderModel> updateOrderStatus(int id, String status) async {
    final response = await _dioClient.patch('/orders/$id/status', data: {
      'status': status,
    });
    return OrderModel.fromJson(response.data['data']);
  }
}
