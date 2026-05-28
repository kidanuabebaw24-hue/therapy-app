import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../routes/app_routes.dart';
import 'package:go_router/go_router.dart';
import 'package:theraphy_flutter/features/auth/presentation/providers/auth_provider.dart';

class AnimatedSplashScreen extends ConsumerStatefulWidget {
  const AnimatedSplashScreen({super.key});

  @override
  ConsumerState<AnimatedSplashScreen> createState() =>
      _AnimatedSplashScreenState();
}

class _AnimatedSplashScreenState extends ConsumerState<AnimatedSplashScreen> {
  bool _navigated = false;
  // Minimum time the splash is shown before navigating away.
  static const _minSplashMs = 2000;
  late final DateTime _startTime;

  @override
  void initState() {
    super.initState();
    _startTime = DateTime.now();
  }

  /// Navigate only after both conditions are true:
  ///   1. Auth has resolved (not initial / loading)
  ///   2. Minimum splash time has elapsed
  void _tryNavigate(AuthState authState) {
    if (_navigated || !mounted) return;
    if (authState.status == AuthStatus.initial ||
        authState.status == AuthStatus.loading) return;

    final elapsed =
        DateTime.now().difference(_startTime).inMilliseconds;
    final remaining = _minSplashMs - elapsed;

    if (remaining <= 0) {
      _doNavigate(authState);
    } else {
      Future.delayed(Duration(milliseconds: remaining), () {
        if (mounted) _doNavigate(authState);
      });
    }
  }

  void _doNavigate(AuthState authState) {
    if (_navigated || !mounted) return;
    _navigated = true;

    if (authState.isAuthenticated) {
      final user = authState.user;
      if (user?.requiresCBT == true &&
          user?.hasCompletedInitialCBT == false) {
        context.go(AppRoutes.cbtExercises);
      } else {
        context.go(AppRoutes.clientDashboard);
      }
    } else {
      context.go(AppRoutes.welcome);
    }
  }

  @override
  Widget build(BuildContext context) {
    // React to every auth state change — this is the primary navigation trigger.
    ref.listen<AuthState>(authProvider, (_, next) => _tryNavigate(next));

    // Also check immediately in case auth already resolved before this widget
    // was built (e.g. no token → instant unauthenticated).
    final currentAuth = ref.read(authProvider);
    if (!_navigated) {
      WidgetsBinding.instance.addPostFrameCallback(
          (_) => _tryNavigate(currentAuth));
    }

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFE0EAFC), Color(0xFFCFDEF3)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Breathing background circles
            ...List.generate(3, (index) {
              return Container(
                width: 200.0 + (index * 60),
                height: 200.0 + (index * 60),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary.withOpacity(0.05),
                ),
              )
                  .animate(
                      onPlay: (c) => c.repeat(reverse: true))
                  .scale(
                    duration: (2000 + (index * 500)).ms,
                    begin: const Offset(0.8, 0.8),
                    end: const Offset(1.2, 1.2),
                    curve: Curves.easeInOutSine,
                  )
                  .blur(
                    begin: const Offset(10, 10),
                    end: const Offset(20, 20),
                  );
            }),

            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.2),
                        blurRadius: 30,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.spa_rounded,
                    size: 64,
                    color: AppColors.primary,
                  ),
                )
                    .animate()
                    .fade(duration: 800.ms)
                    .scale(
                        delay: 200.ms,
                        duration: 600.ms,
                        curve: Curves.easeOutBack)
                    .shimmer(delay: 1500.ms, duration: 1500.ms),
                const SizedBox(height: 32),
                Text(
                  'Theraphy',
                  style: AppTextStyles.headlineLarge.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                )
                    .animate()
                    .fade(delay: 800.ms, duration: 800.ms)
                    .slideY(
                        begin: 0.2,
                        end: 0,
                        curve: Curves.easeOutCubic),
                const SizedBox(height: 8),
                Text(
                  'Anxiety & Phobia Treatment',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                    letterSpacing: 0.5,
                  ),
                ).animate().fade(delay: 1200.ms, duration: 800.ms),
              ],
            ),

            Positioned(
              bottom: 60,
              child: Column(
                children: [
                  const SizedBox(
                    width: 40,
                    child: LinearProgressIndicator(
                      backgroundColor: Colors.transparent,
                      valueColor: AlwaysStoppedAnimation<Color>(
                          AppColors.primary),
                      minHeight: 2,
                    ),
                  ).animate().fade(delay: 1800.ms),
                  const SizedBox(height: 16),
                  Text(
                    'Creating a safe space...',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textHint,
                    ),
                  ).animate().fade(delay: 2000.ms),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
