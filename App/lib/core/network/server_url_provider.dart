import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/core/network/dio_client.dart';
import 'package:trademaster/core/network/server_url_repository.dart';

class ServerUrlState {
  final String? url;
  final bool isLoading;
  final bool hasChecked;

  const ServerUrlState({
    this.url,
    this.isLoading = false,
    this.hasChecked = false,
  });

  ServerUrlState copyWith({
    String? url,
    bool? isLoading,
    bool? hasChecked,
  }) {
    return ServerUrlState(
      url: url ?? this.url,
      isLoading: isLoading ?? this.isLoading,
      hasChecked: hasChecked ?? this.hasChecked,
    );
  }

  bool get isConfigured => url != null && url!.isNotEmpty;
}

class ServerUrlNotifier extends StateNotifier<ServerUrlState> {
  final ServerUrlRepository _repository;

  ServerUrlNotifier(this._repository) : super(const ServerUrlState(isLoading: true));

  /// Loads the stored URL and applies it to DioClient.
  Future<void> load() async {
    state = state.copyWith(isLoading: true);
    final stored = await _repository.getServerUrl();
    final url = stored ?? ServerUrlRepository.defaultUrl();
    DioClient.setBaseUrl(url);
    state = ServerUrlState(
      url: stored,
      isLoading: false,
      hasChecked: true,
    );
  }

  /// Saves a new URL and applies it immediately.
  Future<void> save(String rawUrl) async {
    state = state.copyWith(isLoading: true);
    final sanitized = ServerUrlRepository.sanitize(rawUrl);
    await _repository.setServerUrl(sanitized);
    DioClient.setBaseUrl(sanitized);
    state = ServerUrlState(
      url: sanitized,
      isLoading: false,
      hasChecked: true,
    );
  }

  /// Resets to default platform URL.
  Future<void> reset() async {
    state = state.copyWith(isLoading: true);
    await _repository.clearServerUrl();
    final defaultUrl = ServerUrlRepository.defaultUrl();
    DioClient.setBaseUrl(defaultUrl);
    state = ServerUrlState(
      url: null,
      isLoading: false,
      hasChecked: true,
    );
  }
}

final serverUrlProvider =
    StateNotifierProvider<ServerUrlNotifier, ServerUrlState>((ref) {
  return ServerUrlNotifier(ServerUrlRepository());
});
