import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trademaster/core/constants/api_constants.dart';
import 'package:trademaster/presentation/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Avatar and name
          Center(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 48,
                  backgroundImage: user?.avatar != null
                      ? CachedNetworkImageProvider(
                          '${ApiConstants.baseUrl}${user!.avatar}')
                      : null,
                  child: user?.avatar == null
                      ? Icon(Icons.person, size: 48,
                          color: theme.colorScheme.onPrimaryContainer)
                      : null,
                ),
                const SizedBox(height: 12),
                Text(
                  user?.fullName ?? 'Guest',
                  style: theme.textTheme.headlineSmall,
                ),
                Text(
                  user?.email ?? '',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                if (user?.bio != null) ...[
                  const SizedBox(height: 8),
                  Text(user!.bio!, style: theme.textTheme.bodyLarge),
                ],
              ],
            ),
          ),

          const SizedBox(height: 32),
          const Divider(),

          // Menu items
          _ProfileMenuItem(
            icon: Icons.person_outline,
            title: 'Edit Profile',
            onTap: () {
            },
          ),
          _ProfileMenuItem(
            icon: Icons.settings_outlined,
            title: 'Settings',
            onTap: () {
            },
          ),
          _ProfileMenuItem(
            icon: Icons.help_outline,
            title: 'Help & Support',
            onTap: () {
            },
          ),

          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 8),

          // Logout button
          OutlinedButton.icon(
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
        ],
      ),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback? onTap;

  const _ProfileMenuItem({
    required this.icon,
    required this.title,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
