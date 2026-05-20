import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trademaster/presentation/providers/auth_provider.dart';
import 'package:trademaster/presentation/screens/auth/sign_in_screen.dart';
import 'package:trademaster/presentation/screens/auth/sign_up_screen.dart';
import 'package:trademaster/presentation/screens/business/business_detail_screen.dart';
import 'package:trademaster/presentation/screens/cart/cart_screen.dart';
import 'package:trademaster/presentation/screens/checkout/checkout_screen.dart';
import 'package:trademaster/presentation/screens/messages/chat_screen.dart';
import 'package:trademaster/presentation/screens/orders/order_detail_screen.dart';
import 'package:trademaster/presentation/screens/product/product_detail_screen.dart';
import 'package:trademaster/presentation/screens/shell/app_shell.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/signin',
    redirect: (context, state) {
      // While the app is restoring a session, stay on a splash screen
      if (authState.isInitializing) {
        if (state.matchedLocation != '/splash') return '/splash';
        return null;
      }

      final isAuthenticated = authState.isAuthenticated;
      final isAuthRoute = state.matchedLocation == '/signin' ||
          state.matchedLocation == '/signup';
      final isSplash = state.matchedLocation == '/splash';

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
        path: '/business/:id',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return BusinessDetailScreen(businessId: id);
        },
      ),
      GoRoute(
        path: '/product/:id',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return ProductDetailScreen(productId: id);
        },
      ),
      GoRoute(
        path: '/cart',
        builder: (context, state) => const CartScreen(),
      ),
      GoRoute(
        path: '/checkout',
        builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
        path: '/orders/:id',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return OrderDetailScreen(orderId: id);
        },
      ),
      GoRoute(
        path: '/messages/:userId',
        builder: (context, state) {
          final userId = int.parse(state.pathParameters['userId']!);
          return ChatScreen(partnerId: userId);
        },
      ),
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
              'TradeMaster',
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
