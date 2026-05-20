import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/core/theme/app_theme.dart';
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
    // Restore session from stored tokens on app startup
    Future.microtask(
      () => ref.read(authProvider.notifier).initializeAuth(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'TradeMaster',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: router,
    );
  }
}
