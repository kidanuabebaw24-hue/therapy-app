import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../models/exposure_model.dart';
import '../../../widgets/app_button.dart';
import '../../../features/exposure/presentation/providers/exposure_provider.dart';

class ExposurePlanScreen extends ConsumerStatefulWidget {
  const ExposurePlanScreen({super.key});

  @override
  ConsumerState<ExposurePlanScreen> createState() => _ExposurePlanScreenState();
}

class _ExposurePlanScreenState extends ConsumerState<ExposurePlanScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(exposureProvider.notifier).fetchPlans();
    });
  }

  void _generatePlan() async {
    final success = await ref.read(exposureProvider.notifier).createSelfGuidedPlan('Public Speaking');
    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Self-Guided plan generated successfully!')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to generate plan. Please try again.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(exposureProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Exposure Therapy'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(exposureProvider.notifier).fetchPlans(),
          ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.plans.isEmpty
              ? _buildEmptyState()
              : _buildPlansList(state.plans),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.psychology_outlined,
              size: 100,
              color: AppColors.primary,
            ),
            const SizedBox(height: 24),
            const Text(
              'No Exposure Plan Yet',
              style: AppTextStyles.displayMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            const Text(
              'Exposure therapy helps you confront fears gradually. You can wait for a therapist to assign a plan, or generate a self-guided plan immediately.',
              style: AppTextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),
            if (ref.watch(exposureProvider).isSubmitting)
              const CircularProgressIndicator()
            else
              AppButton(
                label: 'Start Self-Guided Plan',
                onPressed: _generatePlan,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlansList(List<ExposurePlan> plans) {
    // Show the first plan (usually our active phobia plan)
    final plan = plans.first;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: AppColors.calmGradient,
              borderRadius: BorderRadius.circular(20),
              boxShadow: AppColors.cardShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(plan.title, style: AppTextStyles.displaySmall.copyWith(color: Colors.white)),
                const SizedBox(height: 8),
                Text(plan.description, style: AppTextStyles.bodyMedium.copyWith(color: Colors.white.withOpacity(0.9))),
                const SizedBox(height: 20),
                LinearProgressIndicator(
                  value: plan.overallProgress,
                  backgroundColor: Colors.white.withOpacity(0.2),
                  color: Colors.white,
                  minHeight: 8,
                  borderRadius: BorderRadius.circular(10),
                ),
                const SizedBox(height: 8),
                Text('${(plan.overallProgress * 100).round()}% Completed', style: AppTextStyles.bodySmall.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          
          const SizedBox(height: 32),
          const Text('Exposure Hierarchy', style: AppTextStyles.headlineMedium),
          const SizedBox(height: 16),
          
          ...plan.levels.map((level) {
            return _ExposureLevelItem(level: level);
          }).toList(),
        ],
      ),
    );
  }
}

class _ExposureLevelItem extends StatelessWidget {
  final ExposureLevel level;

  const _ExposureLevelItem({required this.level});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 300),
        opacity: level.isLocked ? 0.6 : 1.0,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: AppColors.cardShadow,
            border: level.isCompleted ? Border.all(color: AppColors.success, width: 2) : null,
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: level.isLocked ? AppColors.surfaceVariant : (level.isCompleted ? AppColors.success.withOpacity(0.1) : AppColors.primary.withOpacity(0.1)),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  level.isLocked ? Icons.lock_rounded : (level.isCompleted ? Icons.check_circle_rounded : Icons.play_arrow_rounded),
                  color: level.isLocked ? AppColors.textHint : (level.isCompleted ? AppColors.success : AppColors.primary),
                  size: 20,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      level.title, 
                      style: AppTextStyles.titleMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: level.isLocked ? AppColors.textHint : AppColors.textPrimary,
                      )
                    ),
                    const SizedBox(height: 4),
                    Text(
                      level.isLocked ? 'Complete previous level to unlock.' : level.description, 
                      style: AppTextStyles.bodySmall.copyWith(
                        color: level.isLocked ? AppColors.textHint : AppColors.textSecondary,
                      )
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              if (!level.isLocked && !level.isCompleted)
                GestureDetector(
                  onTap: () => context.push('/exposure/session', extra: level),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.2),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Text(
                      'Start',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
