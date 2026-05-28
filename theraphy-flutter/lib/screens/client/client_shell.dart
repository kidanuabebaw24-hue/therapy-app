import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:theraphy_flutter/l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/notification_provider.dart';
import '../../routes/app_routes.dart';

class ClientShell extends ConsumerStatefulWidget {
  final Widget child;
  const ClientShell({super.key, required this.child});

  static const _tabs = [
    AppRoutes.clientDashboard,
    AppRoutes.scheduling,
    AppRoutes.aiChat,
    AppRoutes.progress,
    AppRoutes.clientProfile,
  ];

  @override
  ConsumerState<ClientShell> createState() => _ClientShellState();
}

class _ClientShellState extends ConsumerState<ClientShell> {
  @override
  void initState() {
    super.initState();
    // Start polling for notifications when the shell mounts
    Future.microtask(
        () => ref.read(notificationProvider.notifier).startPolling());
  }

  @override
  void dispose() {
    ref.read(notificationProvider.notifier).stopPolling();
    super.dispose();
  }

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    for (int i = 0; i < ClientShell._tabs.length; i++) {
      if (location.startsWith(ClientShell._tabs[i])) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final index = _currentIndex(context);
    final unreadCount = ref.watch(
        notificationProvider.select((s) => s.unreadCount));

    return Scaffold(
      body: widget.child,
      // Notification bell floats above the bottom nav on the dashboard
      floatingActionButton: index == 0
          ? _NotificationBell(unreadCount: unreadCount)
          : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.endTop,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.06),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavItem(
                    icon: Icons.home_outlined,
                    activeIcon: Icons.home,
                    labelKey: 'home',
                    index: 0,
                    current: index),
                _NavItem(
                    icon: Icons.favorite_outline,
                    activeIcon: Icons.favorite,
                    labelKey: 'therapy',
                    index: 1,
                    current: index),
                _NavItem(
                    icon: Icons.smart_toy_outlined,
                    activeIcon: Icons.smart_toy,
                    labelKey: 'support',
                    index: 2,
                    current: index),
                _NavItem(
                    icon: Icons.bar_chart_outlined,
                    activeIcon: Icons.bar_chart,
                    labelKey: 'progress',
                    index: 3,
                    current: index),
                _NavItem(
                    icon: Icons.person_outline,
                    activeIcon: Icons.person,
                    labelKey: 'profile',
                    index: 4,
                    current: index),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Bell icon with unread badge — taps to /notifications
class _NotificationBell extends StatelessWidget {
  final int unreadCount;
  const _NotificationBell({required this.unreadCount});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Material(
            color: Colors.white,
            shape: const CircleBorder(),
            elevation: 3,
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: () => context.push(AppRoutes.notifications),
              child: const Padding(
                padding: EdgeInsets.all(10),
                child: Icon(Icons.notifications_outlined,
                    color: AppColors.primary, size: 24),
              ),
            ),
          ),
          if (unreadCount > 0)
            Positioned(
              top: -2,
              right: -2,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  color: AppColors.error,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  unreadCount > 9 ? '9+' : '$unreadCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String labelKey;
  final int index;
  final int current;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.labelKey,
    required this.index,
    required this.current,
  });

  String _getLabel(AppLocalizations l10n) {
    switch (labelKey) {
      case 'home':
        return l10n.home;
      case 'therapy':
        return l10n.therapy;
      case 'support':
        return l10n.support;
      case 'progress':
        return l10n.progress;
      case 'profile':
        return l10n.profile;
      default:
        return labelKey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isActive = index == current;
    final l10n = AppLocalizations.of(context);
    return GestureDetector(
      onTap: () => context.go(ClientShell._tabs[index]),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive
              ? AppColors.primary.withOpacity(0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isActive ? activeIcon : icon,
              color: isActive ? AppColors.primary : AppColors.textHint,
              size: 22,
            ),
            const SizedBox(height: 3),
            Text(
              _getLabel(l10n),
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 11,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                color: isActive ? AppColors.primary : AppColors.textHint,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
