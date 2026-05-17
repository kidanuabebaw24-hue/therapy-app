import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../models/cbt_exercise_model.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../providers/cbt_provider.dart';
import '../widgets/breathing_prep_widget.dart';
import '../widgets/emotion_selector.dart';
import '../widgets/anxiety_slider.dart';
import '../../../widgets/app_button.dart';
import '../../../widgets/app_card.dart';
import '../../../widgets/app_text_field.dart';
import '../../../routes/app_routes.dart';

class CbtExerciseScreen extends ConsumerStatefulWidget {
  final String exerciseId;

  const CbtExerciseScreen({super.key, required this.exerciseId});

  @override
  ConsumerState<CbtExerciseScreen> createState() => _CbtExerciseScreenState();
}

class _CbtExerciseScreenState extends ConsumerState<CbtExerciseScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final notifier = ref.read(cbtProvider.notifier);
      notifier.clearActiveExercise();
      notifier.startExercise(widget.exerciseId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(cbtProvider);
    final notifier = ref.read(cbtProvider.notifier);

    if (state.activeExercise == null || state.activeExercise?.id != widget.exerciseId) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _buildAppBar(context, state, notifier),
      body: Column(
        children: [
          _buildProgressBar(state),
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 500),
              transitionBuilder: (child, animation) {
                return FadeTransition(
                  opacity: animation,
                  child: SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(0.05, 0),
                      end: Offset.zero,
                    ).animate(animation),
                    child: child,
                  ),
                );
              },
              child: _buildPhaseContent(state, notifier),
            ),
          ),
          _buildBottomNavigation(context, state, notifier),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context, CbtState state, CbtNotifier notifier) {
    return AppBar(
      title: Text(state.activeExercise?.title ?? 'CBT Exercise'),
      leading: IconButton(
        icon: const Icon(Icons.close),
        onPressed: () {
          notifier.clearActiveExercise();
          context.pop();
        },
      ),
    );
  }

  Widget _buildProgressBar(CbtState state) {
    if (state.phase == CbtPhase.intro || state.phase == CbtPhase.breathing) {
      return const SizedBox(height: 4);
    }
    
    final totalSteps = state.activeExercise?.steps.length ?? 1;
    final progress = (state.currentStepIndex + 1) / totalSteps;
    
    return LinearProgressIndicator(
      value: state.phase == CbtPhase.summary ? 1.0 : progress,
      backgroundColor: AppColors.surfaceVariant,
      color: AppColors.primary,
      minHeight: 4,
    );
  }

  Widget _buildPhaseContent(CbtState state, CbtNotifier notifier) {
    switch (state.phase) {
      case CbtPhase.intro:
        return _buildIntro(state, notifier);
      case CbtPhase.breathing:
        return BreathingPrepWidget(onComplete: notifier.startSteps);
      case CbtPhase.steps:
        return _buildStep(state, notifier);
      case CbtPhase.summary:
        return _buildSummary(state, notifier);
      case CbtPhase.celebration:
        return _buildCelebration(state, notifier);
    }
  }

  Widget _buildIntro(CbtState state, CbtNotifier notifier) {
    final exercise = state.activeExercise!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primary.withOpacity(0.1),
            ),
            child: const Icon(Icons.psychology, size: 64, color: AppColors.primary),
          ).animate().scale(duration: 600.ms, curve: Curves.easeOutBack),
          const SizedBox(height: 32),
          Text(exercise.title, style: AppTextStyles.displaySmall, textAlign: TextAlign.center),
          const SizedBox(height: 16),
          Text(exercise.description, style: AppTextStyles.bodyLarge, textAlign: TextAlign.center),
          const SizedBox(height: 40),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildBadge(Icons.timer_outlined, '${exercise.estimatedMinutes} min'),
              const SizedBox(width: 16),
              _buildBadge(Icons.bar_chart, exercise.difficulty),
            ],
          ),
          const SizedBox(height: 40),
          const Text(
            '“Take your time. There are no right or wrong answers.”',
            style: TextStyle(
              fontFamily: 'Outfit',
              fontStyle: FontStyle.italic,
              color: AppColors.textSecondary,
              fontSize: 16,
            ),
            textAlign: TextAlign.center,
          ).animate().fadeIn(delay: 400.ms),
        ],
      ),
    );
  }

  Widget _buildBadge(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.textHint),
          const SizedBox(width: 8),
          Text(label, style: AppTextStyles.labelMedium),
        ],
      ),
    );
  }

  Widget _buildStep(CbtState state, CbtNotifier notifier) {
    final step = state.activeExercise!.steps[state.currentStepIndex];
    final response = state.responses[state.currentStepIndex];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Step ${state.currentStepIndex + 1} of ${state.activeExercise!.steps.length}',
            style: AppTextStyles.labelMedium.copyWith(color: AppColors.primary),
          ),
          const SizedBox(height: 12),
          Text(step.prompt, style: AppTextStyles.headlineMedium),
          if (step.guidance != null) ...[
            const SizedBox(height: 12),
            Text(step.guidance!, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
          ],
          const SizedBox(height: 32),
          _buildQuestionInput(step, response, state.currentStepIndex, notifier),
          const SizedBox(height: 40),
          if (state.currentStepIndex == 0)
             _buildTip('Focus on just this moment. You\'re doing great.')
          else if (state.currentStepIndex == state.activeExercise!.steps.length - 1)
             _buildTip('Almost there. This reflection is a huge step forward.')
          else
             _buildTip('Small steps matter.'),
        ],
      ),
    );
  }

  Widget _buildQuestionInput(CbtStep step, dynamic value, int index, CbtNotifier notifier) {
    switch (step.type) {
      case CbtQuestionType.mood:
        return EmotionSelector(
          selectedEmotion: value is String ? value : null,
          onSelected: (val) => notifier.updateResponse(index, val),
        );
      case CbtQuestionType.anxietyScale:
        return AnxietySlider(
          value: value is num ? value.toDouble() : 0.0,
          onChanged: (val) => notifier.updateResponse(index, val),
        );
      case CbtQuestionType.yesNo:
        return Row(
          children: [
            _buildChoiceChip('Yes', value == 'Yes', () => notifier.updateResponse(index, 'Yes')),
            const SizedBox(width: 12),
            _buildChoiceChip('No', value == 'No', () => notifier.updateResponse(index, 'No')),
          ],
        );
      default:
        // Use a Keyed Subtree or handle the controller more carefully if this was a stateful widget.
        // For now, we'll just ensure the cast is safe.
        final textValue = value is String ? value : '';
        return AppTextField(
          label: 'Your Reflection',
          hint: step.placeholder ?? 'Share your thoughts...',
          maxLines: 6,
          // We use a key to preserve state or reconsider stateful approach if needed
          controller: TextEditingController(text: textValue)..selection = TextSelection.fromPosition(TextPosition(offset: textValue.length)),
          onChanged: (val) => notifier.updateResponse(index, val),
        );
    }
  }

  Widget _buildChoiceChip(String label, bool isSelected, VoidCallback onTap) {
    return Expanded(
      child: AppButton(
        label: label,
        variant: isSelected ? AppButtonVariant.primary : AppButtonVariant.outlined,
        onPressed: onTap,
      ),
    );
  }

  Widget _buildTip(String text) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          const Icon(Icons.favorite, color: AppColors.primary, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: AppTextStyles.bodySmall)),
        ],
      ),
    );
  }

  Widget _buildSummary(CbtState state, CbtNotifier notifier) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Reflection Summary', style: AppTextStyles.displaySmall),
          const SizedBox(height: 8),
          const Text('Take a moment to review your thoughts from today.', style: AppTextStyles.bodyMedium),
          const SizedBox(height: 32),
          ...state.activeExercise!.steps.asMap().entries.map((entry) {
            final idx = entry.key;
            final step = entry.value;
            final response = state.responses[idx]?.toString() ?? 'No response';
            return Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(step.prompt, style: AppTextStyles.labelMedium.copyWith(color: AppColors.textHint)),
                    const SizedBox(height: 8),
                    Text(response, style: AppTextStyles.titleMedium),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildCelebration(CbtState state, CbtNotifier notifier) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.stars, size: 80, color: AppColors.primary)
                .animate().scale(duration: 800.ms, curve: Curves.elasticOut),
            const SizedBox(height: 32),
            const Text('Excellent work!', style: AppTextStyles.displaySmall),
            const SizedBox(height: 16),
            const Text(
              'You took a meaningful step for your mental wellbeing today. How do you feel now?',
              style: AppTextStyles.bodyLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),
            EmotionSelector(
              selectedEmotion: state.postExerciseEmotion,
              onSelected: (val) => notifier.updatePostExerciseEmotion(val),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomNavigation(BuildContext context, CbtState state, CbtNotifier notifier) {
    String label = 'Continue';
    VoidCallback? onPressed;

    if (state.phase == CbtPhase.intro) {
      label = 'Begin Exercise';
      onPressed = notifier.startBreathing;
    } else if (state.phase == CbtPhase.breathing) {
      return const SizedBox.shrink();
    } else if (state.phase == CbtPhase.steps) {
      label = 'Next Step';
      onPressed = notifier.nextStep;
    } else if (state.phase == CbtPhase.summary) {
      label = 'Finish Reflection';
      onPressed = notifier.showCelebration;
    } else if (state.phase == CbtPhase.celebration) {
      label = 'Return to Dashboard';
      onPressed = () async {
        await notifier.complete();
        if (context.mounted) {
          notifier.clearActiveExercise();
          context.go(AppRoutes.clientDashboard);
        }
      };
    }

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: AppColors.cardShadow,
      ),
      child: Row(
        children: [
          if (state.phase == CbtPhase.steps || state.phase == CbtPhase.summary)
            Expanded(
              child: AppButton(
                label: 'Back',
                variant: AppButtonVariant.outlined,
                onPressed: notifier.previousStep,
              ),
            ),
          if (state.phase == CbtPhase.steps || state.phase == CbtPhase.summary)
            const SizedBox(width: 16),
          Expanded(
            child: AppButton(
              label: label,
              onPressed: onPressed,
              isLoading: state.isSubmitting,
            ),
          ),
        ],
      ),
    );
  }
}
