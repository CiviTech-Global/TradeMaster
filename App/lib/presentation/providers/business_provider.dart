import 'dart:developer' as developer;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/data/datasources/business_remote_datasource.dart';
import 'package:trademaster/data/models/business_model.dart';

final businessDatasourceProvider = Provider<BusinessRemoteDatasource>((ref) {
  return BusinessRemoteDatasource();
});

// Active businesses list (for map)
final activeBusinessesProvider =
    StateNotifierProvider<ActiveBusinessesNotifier, AsyncValue<List<BusinessModel>>>((ref) {
  return ActiveBusinessesNotifier(ref.watch(businessDatasourceProvider));
});

class ActiveBusinessesNotifier
    extends StateNotifier<AsyncValue<List<BusinessModel>>> {
  final BusinessRemoteDatasource _datasource;

  ActiveBusinessesNotifier(this._datasource)
      : super(const AsyncValue.loading());

  Future<void> load() async {
    developer.log('ActiveBusinessesNotifier.load: starting', name: 'BusinessProvider');
    state = const AsyncValue.loading();
    try {
      final businesses = await _datasource.getActiveBusinesses();
      developer.log('ActiveBusinessesNotifier.load: success, ${businesses.length} businesses', name: 'BusinessProvider');
      state = AsyncValue.data(businesses);
    } catch (e, st) {
      developer.log('ActiveBusinessesNotifier.load: FAILED - $e', name: 'BusinessProvider', level: 1000);
      state = AsyncValue.error(e, st);
    }
  }
}

// Single business detail
final businessDetailProvider = StateNotifierProvider.family<
    BusinessDetailNotifier, AsyncValue<BusinessModel>, int>((ref, id) {
  final notifier = BusinessDetailNotifier(ref.watch(businessDatasourceProvider));
  notifier.load(id);
  return notifier;
});

class BusinessDetailNotifier
    extends StateNotifier<AsyncValue<BusinessModel>> {
  final BusinessRemoteDatasource _datasource;

  BusinessDetailNotifier(this._datasource)
      : super(const AsyncValue.loading());

  Future<void> load(int id) async {
    state = const AsyncValue.loading();
    try {
      final business = await _datasource.getBusinessById(id);
      state = AsyncValue.data(business);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}
