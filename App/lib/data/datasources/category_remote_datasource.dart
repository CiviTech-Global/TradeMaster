import 'package:trademaster/core/network/dio_client.dart';
import 'package:trademaster/data/models/category_model.dart';

class CategoryRemoteDatasource {
  final DioClient _dioClient;

  CategoryRemoteDatasource({DioClient? dioClient})
      : _dioClient = dioClient ?? DioClient.instance;

  Future<List<CategoryModel>> getCategories({int? parentId}) async {
    final params = <String, dynamic>{};
    if (parentId != null) params['parent_id'] = parentId;

    final response =
        await _dioClient.get('/categories', queryParameters: params);
    return (response.data['data'] as List)
        .map((c) => CategoryModel.fromJson(c))
        .toList();
  }

  Future<CategoryModel> getCategoryById(int id) async {
    final response = await _dioClient.get('/categories/$id');
    return CategoryModel.fromJson(response.data['data']);
  }
}
