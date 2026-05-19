import 'package:trademaster/core/network/dio_client.dart';

class DevRemoteDatasource {
  final DioClient _dioClient;

  DevRemoteDatasource({DioClient? dioClient})
      : _dioClient = dioClient ?? DioClient.instance;

  Future<Map<String, dynamic>> seedDemoData() async {
    final response = await _dioClient.post('/dev/seed');
    return response.data as Map<String, dynamic>;
  }
}
