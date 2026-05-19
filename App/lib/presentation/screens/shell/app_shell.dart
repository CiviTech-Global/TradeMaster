import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/presentation/providers/message_provider.dart';
import 'package:trademaster/presentation/screens/explore/explore_screen.dart';
import 'package:trademaster/presentation/screens/messages/messages_screen.dart';
import 'package:trademaster/presentation/screens/orders/orders_screen.dart';
import 'package:trademaster/presentation/screens/profile/profile_screen.dart';
import 'package:trademaster/presentation/screens/search/search_screen.dart';

class AppShell extends ConsumerStatefulWidget {
  const AppShell({super.key});

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
  int _selectedIndex = 0;

  static const List<_TabInfo> _tabs = [
    _TabInfo(icon: Icons.explore_outlined, activeIcon: Icons.explore_rounded, label: 'Explore'),
    _TabInfo(icon: Icons.search_outlined, activeIcon: Icons.search_rounded, label: 'Search'),
    _TabInfo(icon: Icons.receipt_long_outlined, activeIcon: Icons.receipt_long_rounded, label: 'Orders'),
    _TabInfo(icon: Icons.chat_bubble_outline_rounded, activeIcon: Icons.chat_bubble_rounded, label: 'Messages'),
    _TabInfo(icon: Icons.person_outline_rounded, activeIcon: Icons.person_rounded, label: 'Profile'),
  ];

  static const List<Widget> _screens = [
    ExploreScreen(),
    SearchScreen(),
    OrdersScreen(),
    MessagesScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final unreadCount = ref.watch(unreadCountProvider);

    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: [
          for (int i = 0; i < _tabs.length; i++)
            NavigationDestination(
              icon: i == 3 && unreadCount > 0
                  ? Badge(
                      label: Text('$unreadCount'),
                      child: Icon(_tabs[i].icon),
                    )
                  : Icon(_tabs[i].icon),
              selectedIcon: i == 3 && unreadCount > 0
                  ? Badge(
                      label: Text('$unreadCount'),
                      child: Icon(_tabs[i].activeIcon),
                    )
                  : Icon(_tabs[i].activeIcon),
              label: _tabs[i].label,
            ),
        ],
      ),
    );
  }
}

class _TabInfo {
  final IconData icon;
  final IconData activeIcon;
  final String label;

  const _TabInfo({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}
