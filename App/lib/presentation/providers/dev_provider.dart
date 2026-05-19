import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/data/datasources/dev_remote_datasource.dart';

class SeedState {
  final bool isLoading;
  final bool isSuccess;
  final String? error;

  const SeedState({
    this.isLoading = false,
    this.isSuccess = false,
    this.error,
  });

  SeedState copyWith({
    bool? isLoading,
    bool? isSuccess,
    String? error,
  }) {
    return SeedState(
      isLoading: isLoading ?? this.isLoading,
      isSuccess: isSuccess ?? this.isSuccess,
      error: error,
    );
  }
}

class SeedNotifier extends StateNotifier<SeedState> {
  final DevRemoteDatasource _datasource;

  SeedNotifier(this._datasource) : super(const SeedState());

  Future<void> seed() async {
    state = const SeedState(isLoading: true);
    try {
      await _datasource.seedDemoData();
      state = const SeedState(isSuccess: true);
    } catch (e) {
      String message = 'Failed to seed demo data';
      if (e is DioException) {
        final responseData = e.response?.data;
        if (responseData is Map<String, dynamic>) {
          message = responseData['error'] as String? ?? message;
        }
      }
      state = SeedState(error: message);
    }
  }
}

final seedProvider = StateNotifierProvider<SeedNotifier, SeedState>((ref) {
  return SeedNotifier(DevRemoteDatasource());
});
