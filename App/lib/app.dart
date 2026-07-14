import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/core/theme/app_theme.dart';
import 'package:trademaster/core/theme/theme_provider.dart';
import 'package:trademaster/core/network/server_url_provider.dart';
import 'package:trademaster/presentation/providers/auth_provider.dart';
import 'package:trademaster/presentation/providers/router_provider.dart';

class TradeMasterApp extends ConsumerStatefulWidget {
  const TradeMasterApp({super.key});

  @override
  ConsumerState<TradeMasterApp> createState() => _TradeMasterAppState();
}

class _TradeMasterAppState extends ConsumerState<TradeMasterApp> {
  @override
  void initState() {
    super.initState();
    // Load server URL first, then restore auth session
    Future.microtask(() async {
      await ref.read(serverUrlProvider.notifier).load();
      await ref.read(authProvider.notifier).initializeAuth();
    });
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeProvider);

    return MaterialApp.router(
      title: 'TradeMaster',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode.flutterValue,
      routerConfig: router,
    );
  }
}
