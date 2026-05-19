import 'package:trademaster/core/network/dio_client.dart';
import 'package:trademaster/data/models/business_model.dart';

class BusinessRemoteDatasource {
  final DioClient _dioClient;

  BusinessRemoteDatasource({DioClient? dioClient})
      : _dioClient = dioClient ?? DioClient.instance;

  Future<List<BusinessModel>> getActiveBusinesses() async {
    final response = await _dioClient.get('/businesses/active');
    return (response.data['data'] as List)
        .map((b) => BusinessModel.fromJson(b))
        .toList();
  }

  Future<BusinessModel> getBusinessById(int id) async {
    final response = await _dioClient.get('/businesses/$id');
    return BusinessModel.fromJson(response.data['data']);
  }
}
