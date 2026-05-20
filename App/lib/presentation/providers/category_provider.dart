import 'dart:developer' as developer;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/data/datasources/category_remote_datasource.dart';
import 'package:trademaster/data/models/category_model.dart';

final categoryDatasourceProvider = Provider<CategoryRemoteDatasource>((ref) {
  return CategoryRemoteDatasource();
});

final categoriesProvider = StateNotifierProvider<CategoriesNotifier,
    AsyncValue<List<CategoryModel>>>((ref) {
  final notifier = CategoriesNotifier(ref.watch(categoryDatasourceProvider));
  notifier.load();
  return notifier;
});

class CategoriesNotifier
    extends StateNotifier<AsyncValue<List<CategoryModel>>> {
  final CategoryRemoteDatasource _datasource;

  CategoriesNotifier(this._datasource) : super(const AsyncValue.loading());

  Future<void> load() async {
    developer.log('CategoriesNotifier.load: starting', name: 'CategoryProvider');
    state = const AsyncValue.loading();
    try {
      final categories = await _datasource.getCategories();
      developer.log('CategoriesNotifier.load: success, ${categories.length} categories', name: 'CategoryProvider');
      state = AsyncValue.data(categories);
    } catch (e, st) {
      developer.log('CategoriesNotifier.load: FAILED - $e', name: 'CategoryProvider', level: 1000);
      state = AsyncValue.error(e, st);
    }
  }
}
