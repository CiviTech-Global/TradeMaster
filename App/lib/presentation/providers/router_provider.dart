import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/l10n/generated/app_localizations.dart';
import 'package:trademaster/presentation/providers/auth_provider.dart';
import 'package:trademaster/core/network/server_url_provider.dart';
import 'package:trademaster/presentation/screens/auth/sign_in_screen.dart';
import 'package:trademaster/presentation/screens/auth/sign_up_screen.dart';
import 'package:trademaster/presentation/screens/business/business_detail_screen.dart';
// [DISABLED] Cart not shown in business directory mode
// import 'package:trademaster/presentation/screens/cart/cart_screen.dart';
// [DISABLED] Checkout not shown in business directory mode
// import 'package:trademaster/presentation/screens/checkout/checkout_screen.dart';
// [DISABLED] Chat not shown in business directory mode
// import 'package:trademaster/presentation/screens/messages/chat_screen.dart';
// [DISABLED] Order detail not shown in business directory mode
// import 'package:trademaster/presentation/screens/orders/order_detail_screen.dart';
// [DISABLED] Product detail not shown in business directory mode
// import 'package:trademaster/presentation/screens/product/product_detail_screen.dart';
// [DISABLED] Product creation not shown in business directory mode
// import 'package:trademaster/presentation/screens/product/create_product_screen.dart';
import 'package:trademaster/presentation/screens/server_url/server_url_setup_screen.dart';
import 'package:trademaster/presentation/screens/settings/settings_screen.dart';
import 'package:trademaster/presentation/screens/shell/app_shell.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  final serverUrlState = ref.watch(serverUrlProvider);

  return GoRouter(
    initialLocation: '/signin',
    redirect: (context, state) {
      // Wait for both auth and server URL initialization
      if (authState.isInitializing || serverUrlState.isLoading) {
        if (state.matchedLocation != '/splash') return '/splash';
        return null;
      }

      final isAuthenticated = authState.isAuthenticated;
      final isAuthRoute = state.matchedLocation == '/signin' ||
          state.matchedLocation == '/signup';
      final isSplash = state.matchedLocation == '/splash';
      final isServerUrlSetup = state.matchedLocation == '/server-url-setup';
      final isServerUrlConfigured = serverUrlState.isConfigured;

      // Force server URL setup before anything else
      if (!isServerUrlConfigured && !isServerUrlSetup) {
        return '/server-url-setup';
      }

      // Once URL is set, leave the setup screen
      if (isServerUrlConfigured && isServerUrlSetup) {
        return isAuthenticated ? '/' : '/signin';
      }

      // Once init is done, leave splash
      if (isSplash) {
        return isAuthenticated ? '/' : '/signin';
      }

      if (!isAuthenticated && !isAuthRoute) {
        return '/signin';
      }
      if (isAuthenticated && isAuthRoute) {
        return '/';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const _SplashScreen(),
      ),
      GoRoute(
        path: '/server-url-setup',
        builder: (context, state) => const ServerUrlSetupScreen(),
      ),
      GoRoute(
        path: '/signin',
        builder: (context, state) => const SignInScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignUpScreen(),
      ),
      GoRoute(
        path: '/',
        builder: (context, state) => const AppShell(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/business/:id',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return BusinessDetailScreen(businessId: id);
        },
      ),
      // [DISABLED] Product detail not shown in business directory mode
      // GoRoute(
      //   path: '/product/:id',
      //   builder: (context, state) {
      //     final id = int.parse(state.pathParameters['id']!);
      //     return ProductDetailScreen(productId: id);
      //   },
      // ),
      // [DISABLED] Product creation not shown in business directory mode
      // GoRoute(
      //   path: '/business/:businessId/create-product',
      //   builder: (context, state) {
      //     final businessId = int.parse(state.pathParameters['businessId']!);
      //     return CreateProductScreen(businessId: businessId);
      //   },
      // ),
      // [DISABLED] Cart not shown in business directory mode
      // GoRoute(
      //   path: '/cart',
      //   builder: (context, state) => const CartScreen(),
      // ),
      // [DISABLED] Checkout not shown in business directory mode
      // GoRoute(
      //   path: '/checkout',
      //   builder: (context, state) => const CheckoutScreen(),
      // ),
      // [DISABLED] Order detail not shown in business directory mode
      // GoRoute(
      //   path: '/orders/:id',
      //   builder: (context, state) {
      //     final id = int.parse(state.pathParameters['id']!);
      //     return OrderDetailScreen(orderId: id);
      //   },
      // ),
      // [DISABLED] Chat not shown in business directory mode
      // GoRoute(
      //   path: '/messages/:userId',
      //   builder: (context, state) {
      //     final userId = int.parse(state.pathParameters['userId']!);
      //     return ChatScreen(partnerId: userId);
      //   },
      // ),
    ],
  );
});

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [
                    theme.colorScheme.primary,
                    theme.colorScheme.secondary,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: const Icon(
                Icons.storefront_rounded,
                size: 48,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              AppLocalizations.of(context).appTitle,
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                color: theme.colorScheme.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
