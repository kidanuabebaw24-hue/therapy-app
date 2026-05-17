import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../routes/app_routes.dart';
import '../providers/cbt_provider.dart';
import '../mock_data/cbt_mock_data.dart';
import '../widgets/cbt_progress_chart.dart';
import '../../../widgets/app_card.dart';

class CbtHomeScreen extends ConsumerStatefulWidget {
  const CbtHomeScreen({super.key});

  @override
  ConsumerState<CbtHomeScreen> createState() => _CbtHomeScreenState();
}

class _CbtHomeScreenState extends ConsumerState<CbtHomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(cbtProvider.notifier).fetchExercises());
  }

  @override
  Widget build(BuildContext context) {
    final cbtState = ref.watch(cbtProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('CBT Workshop'),
      ),
      body: cbtState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const CbtProgressChart().animate().fadeIn(duration: 600.ms).slideY(begin: 0.1, end: 0),
                  const SizedBox(height: 32),
                  _buildSectionHeader('Your Exercises', 'See all'),
                  const SizedBox(height: 16),
                  if (cbtState.exercises.isEmpty)
                    const Center(child: Text('No exercises assigned yet.'))
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: cbtState.exercises.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 16),
                      itemBuilder: (context, index) {
                        final exercise = cbtState.exercises[index];
                        return _buildExerciseCard(context, exercise)
                            .animate(delay: (index * 100).ms)
                            .fadeIn(duration: 500.ms)
                            .slideX(begin: 0.05, end: 0);
                      },
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionHeader(String title, String action) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: AppTextStyles.titleLarge),
        TextButton(
          onPressed: () {},
          child: Text(action, style: AppTextStyles.labelMedium.copyWith(color: AppColors.primary)),
        ),
      ],
    );
  }

  Widget _buildExerciseCard(BuildContext context, dynamic exercise) {
    final colors = exercise.themeColors;
    final color1 = Color(int.parse(colors[0].replaceFirst('#', '0xFF')));
    final color2 = Color(int.parse(colors[1].replaceFirst('#', '0xFF')));

    return AppCard(
      onTap: () => context.push(AppRoutes.cbtExerciseDetail.replaceFirst(':id', exercise.id)),
      child: Row(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [color1, color2]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.psychology, color: Colors.white, size: 32),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(exercise.title, style: AppTextStyles.titleMedium),
                const SizedBox(height: 4),
                Text(
                  exercise.category,
                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.textHint),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _buildTinyBadge(Icons.timer_outlined, '${exercise.estimatedMinutes}m'),
                    const SizedBox(width: 12),
                    _buildTinyBadge(Icons.bar_chart, exercise.difficulty),
                  ],
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppColors.textHint),
        ],
      ),
    );
  }

  Widget _buildTinyBadge(IconData icon, String label) {
    return Row(
      children: [
        Icon(icon, size: 12, color: AppColors.textHint),
        const SizedBox(width: 4),
        Text(label, style: AppTextStyles.labelMedium.copyWith(fontSize: 10)),
      ],
    );
  }
}
