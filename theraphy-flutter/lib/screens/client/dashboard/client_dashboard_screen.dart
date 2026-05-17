import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:animations/animations.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import 'package:theraphy_flutter/features/auth/presentation/providers/auth_provider.dart';
import 'package:theraphy_flutter/features/mood/presentation/providers/mood_provider.dart';
import 'package:theraphy_flutter/features/appointments/presentation/providers/session_provider.dart';
import '../../../routes/app_routes.dart';
import '../../../widgets/app_card.dart';
import 'widgets/welcome_header.dart';
import 'widgets/mood_tracker_card.dart';
import 'widgets/anxiety_chart_card.dart';
import 'widgets/quick_actions_grid.dart';
import 'widgets/activity_carousel.dart';
import 'widgets/motivation_quote_card.dart';

class ClientDashboardScreen extends ConsumerStatefulWidget {
  const ClientDashboardScreen({super.key});

  @override
  ConsumerState<ClientDashboardScreen> createState() => _ClientDashboardScreenState();
}

class _ClientDashboardScreenState extends ConsumerState<ClientDashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(moodProvider.notifier).fetchMoods();
      ref.read(sessionProvider.notifier).fetchSessions();
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final moodState = ref.watch(moodProvider);
    final sessionState = ref.watch(sessionProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await ref.read(moodProvider.notifier).fetchMoods();
            await ref.read(sessionProvider.notifier).fetchSessions();
          },
          child: CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              // Welcome Header
              SliverToBoxAdapter(
                child: WelcomeHeader(
                  userName: user?.name.split(" ").first ?? "there",
                  onNotificationTap: () {
                    // Open notifications
                  },
                ),
              ),

              // Motivation Quote
              const SliverToBoxAdapter(
                child: MotivationQuoteCard(
                  quote: "Every step forward, no matter how small, is progress toward your healing.",
                  author: "Theraphy Team",
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 24)),

              // Mood Tracker
              SliverToBoxAdapter(
                child: MoodTrackerCard(
                  onMoodSelected: (score) {
                    context.push(AppRoutes.moodTracking);
                  },
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 24)),

              // Anxiety Chart
              const SliverToBoxAdapter(
                child: AnxietyChartCard(),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 24)),

              // Upcoming Session
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                sliver: SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Next Session', style: AppTextStyles.titleMedium),
                      const SizedBox(height: 12),
                      if (sessionState.isLoading)
                        const _LoadingPlaceholder()
                      else if (sessionState.upcoming.isEmpty)
                        _EmptyActionCard(
                          icon: Icons.calendar_today_rounded,
                          message: 'No sessions scheduled',
                          buttonLabel: 'Book Session',
                          onTap: () => context.push(AppRoutes.sessions),
                        )
                      else
                        _UpcomingSessionCard(session: sessionState.upcoming.first),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 24)),

              // Quick Actions
              SliverToBoxAdapter(
                child: QuickActionsGrid(
                  items: [
                    QuickActionItem(
                      label: 'Breathing',
                      icon: Icons.air_rounded,
                      color: AppColors.primary,
                      onTap: () => context.push(AppRoutes.breathingExercise),
                    ),
                    QuickActionItem(
                      label: 'CBT',
                      icon: Icons.psychology_rounded,
                      color: AppColors.secondary,
                      onTap: () => context.push(AppRoutes.cbtExercises),
                    ),
                    QuickActionItem(
                      label: 'Exposure',
                      icon: Icons.record_voice_over_rounded,
                      color: AppColors.accent,
                      onTap: () => context.push(AppRoutes.exposure),
                    ),
                    QuickActionItem(
                      label: 'Assess',
                      icon: Icons.assignment_rounded,
                      color: AppColors.success,
                      onTap: () => context.push(AppRoutes.assessmentQuestionnaire),
                    ),
                    QuickActionItem(
                      label: 'AI Chat',
                      icon: Icons.smart_toy_rounded,
                      color: Colors.deepPurpleAccent,
                      onTap: () => context.push(AppRoutes.aiChat),
                    ),
                  ],
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 24)),

              // CBT Exercises
              SliverToBoxAdapter(
                child: ActivityCarousel(
                  title: 'CBT Exercises',
                  onSeeAll: () => context.push(AppRoutes.cbtExercises),
                  activities: [
                    ActivityItem(
                      title: 'Thought Record',
                      subtitle: 'Challenge your thoughts',
                      progress: 0.6,
                      icon: Icons.edit_note_rounded,
                      color: AppColors.primary,
                      onTap: () {},
                    ),
                    ActivityItem(
                      title: 'Mindful Breathing',
                      subtitle: 'Guided relaxation',
                      progress: 0.3,
                      icon: Icons.air_rounded,
                      color: AppColors.secondary,
                      onTap: () => context.push(AppRoutes.breathingExercise),
                    ),
                  ],
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 24)),

              // Exposure Tasks
              SliverToBoxAdapter(
                child: ActivityCarousel(
                  title: 'Exposure Therapy',
                  onSeeAll: () => context.push(AppRoutes.exposure),
                  activities: [
                    ActivityItem(
                      title: 'Public Speaking',
                      subtitle: 'Level 4 Exposure',
                      progress: 0.4,
                      icon: Icons.record_voice_over_rounded,
                      color: AppColors.accent,
                      onTap: () => context.push(AppRoutes.exposure),
                    ),
                    ActivityItem(
                      title: 'Social Greeting',
                      subtitle: 'Level 2 Exposure',
                      progress: 0.8,
                      icon: Icons.people_rounded,
                      color: AppColors.success,
                      onTap: () => context.push(AppRoutes.exposure),
                    ),
                  ],
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 40)),
            ],
          ),
        ),
      ),
    );
  }
}

class _UpcomingSessionCard extends StatelessWidget {
  final dynamic session;
  const _UpcomingSessionCard({required this.session});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppColors.cardShadow,
        border: Border.all(color: AppColors.surfaceVariant.withOpacity(0.5)),
      ),
      child: Row(
        children: [
          Icon(
            Icons.video_camera_front_rounded,
            color: AppColors.primary,
            size: 22,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Row(
              children: [
                Flexible(
                  child: Text(
                    session.therapistName ?? 'With Dr. Smith',
                    style: AppTextStyles.titleMedium.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '•  Today, 4:00 PM',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 0,
              minimumSize: const Size(64, 34),
              padding: const EdgeInsets.symmetric(horizontal: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text(
              'Join',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyActionCard extends StatelessWidget {
  final IconData icon;
  final String message;
  final String buttonLabel;
  final VoidCallback onTap;

  const _EmptyActionCard({
    required this.icon,
    required this.message,
    required this.buttonLabel,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: AppColors.cardShadow,
            ),
            child: Icon(icon, color: AppColors.primary, size: 32),
          ),
          const SizedBox(height: 16),
          Text(message, style: AppTextStyles.titleMedium),
          const SizedBox(height: 6),
          Text(
            'Schedule your next therapy session to stay on track.',
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: onTap,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text(buttonLabel, style: const TextStyle(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

class _LoadingPlaceholder extends StatelessWidget {
  const _LoadingPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 60,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }
}


