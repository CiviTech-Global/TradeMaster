import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/core/constants/api_constants.dart';
import 'package:trademaster/presentation/providers/auth_provider.dart';
import 'package:trademaster/presentation/providers/dev_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          // Gradient header with avatar
          Container(
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 24,
              bottom: 32,
            ),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  theme.colorScheme.primary,
                  theme.colorScheme.secondary,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              children: [
                Text(
                  'Profile',
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 20),
                CircleAvatar(
                  radius: 48,
                  backgroundColor: Colors.white.withValues(alpha: 0.2),
                  backgroundImage: user?.avatar != null
                      ? CachedNetworkImageProvider(
                          '${ApiConstants.baseUrl}${user!.avatar}')
                      : null,
                  child: user?.avatar == null
                      ? const Icon(Icons.person, size: 48, color: Colors.white)
                      : null,
                ),
                const SizedBox(height: 12),
                Text(
                  user?.fullName ?? 'Guest',
                  style: theme.textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  user?.email ?? '',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withValues(alpha: 0.85),
                  ),
                ),
                if (user?.bio != null) ...[
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Text(
                      user!.bio!,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: Colors.white.withValues(alpha: 0.9),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Menu items
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                _ProfileMenuItem(
                  icon: Icons.person_outline_rounded,
                  iconColor: theme.colorScheme.primary,
                  title: 'Edit Profile',
                  onTap: () {},
                ),
                _ProfileMenuItem(
                  icon: Icons.settings_outlined,
                  iconColor: theme.colorScheme.secondary,
                  title: 'Settings',
                  onTap: () {},
                ),
                _ProfileMenuItem(
                  icon: Icons.help_outline_rounded,
                  iconColor: theme.colorScheme.tertiary,
                  title: 'Help & Support',
                  onTap: () {},
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),
          const Divider(indent: 16, endIndent: 16),
          const SizedBox(height: 8),

          // Developer Tools section
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(left: 16, bottom: 8),
                  child: Text(
                    'Developer Tools',
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                    ),
                  ),
                ),
                _SeedDemoDataButton(),
              ],
            ),
          ),

          const SizedBox(height: 8),
          const Divider(indent: 16, endIndent: 16),
          const SizedBox(height: 8),

          // Logout button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: OutlinedButton.icon(
              onPressed: () async {
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Sign Out'),
                    content: const Text('Are you sure you want to sign out?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text('Cancel'),
                      ),
                      FilledButton(
                        onPressed: () => Navigator.pop(context, true),
                        child: const Text('Sign Out'),
                      ),
                    ],
                  ),
                );
                if (confirmed == true) {
                  ref.read(authProvider.notifier).signOut();
                }
              },
              icon: const Icon(Icons.logout),
              label: const Text('Sign Out'),
              style: OutlinedButton.styleFrom(
                foregroundColor: theme.colorScheme.error,
                side: BorderSide(color: theme.colorScheme.error),
              ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final Color? iconColor;
  final String title;
  final VoidCallback? onTap;

  const _ProfileMenuItem({
    required this.icon,
    this.iconColor,
    required this.title,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: (iconColor ?? theme.colorScheme.primary).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: iconColor ?? theme.colorScheme.primary),
        ),
        title: Text(title),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}

class _SeedDemoDataButton extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final seedState = ref.watch(seedProvider);

    ref.listen<SeedState>(seedProvider, (prev, next) {
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: theme.colorScheme.error,
          ),
        );
      }
      if (next.isSuccess) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Demo data populated successfully!'),
            backgroundColor: const Color(0xFF66BB6A),
          ),
        );
      }
    });

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: theme.colorScheme.secondary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: seedState.isLoading
              ? Padding(
                  padding: const EdgeInsets.all(10),
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: theme.colorScheme.secondary,
                  ),
                )
              : Icon(Icons.dataset_outlined, color: theme.colorScheme.secondary),
        ),
        title: const Text('Populate Demo Data'),
        subtitle: const Text('Add sample data to your account'),
        onTap: seedState.isLoading
            ? null
            : () async {
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Populate Demo Data'),
                    content: const Text(
                      'This will add sample categories, businesses, products, orders, and reviews to your account. Continue?',
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text('Cancel'),
                      ),
                      FilledButton(
                        onPressed: () => Navigator.pop(context, true),
                        child: const Text('Populate'),
                      ),
                    ],
                  ),
                );
                if (confirmed == true) {
                  ref.read(seedProvider.notifier).seed();
                }
              },
      ),
    );
  }
}
