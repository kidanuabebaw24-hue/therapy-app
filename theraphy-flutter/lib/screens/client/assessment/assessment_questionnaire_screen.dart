import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../mock_data/mock_data_source.dart';
import '../../../models/assessment_model.dart';
import '../../../widgets/app_button.dart';
import 'package:theraphy_flutter/features/assessments/presentation/providers/assessment_provider.dart';

class AssessmentQuestionnaireScreen extends ConsumerStatefulWidget {
  const AssessmentQuestionnaireScreen({super.key});

  @override
  ConsumerState<AssessmentQuestionnaireScreen> createState() => _AssessmentQuestionnaireScreenState();
}

class _AssessmentQuestionnaireScreenState extends ConsumerState<AssessmentQuestionnaireScreen> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;
  final Map<String, int> _answers = {};

  void _onOptionSelected(String questionId, int value) {
    setState(() {
      _answers[questionId] = value;
    });
    if (_currentIndex < MockData.assessmentQuestions.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    }
  }

  void _finish() async {
    final questions = MockData.assessmentQuestions;
    final responses = questions.map((q) {
      final answerIndex = _answers[q.id] ?? 1;
      return {
        'questionId': q.id,
        'question': q.text,
        'answer': q.options[answerIndex - 1],
        'score': answerIndex,
      };
    }).toList();

    // Submit to backend
    final assessment = await ref.read(assessmentProvider.notifier).submitAssessment(
      type: 'anxiety',
      responses: responses,
    );

    if (mounted) {
      if (assessment != null) {
        // Navigate to results
        context.push('/assessment/result', extra: {
          'score': assessment.score,
          'severity': assessment.severity,
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to submit assessment')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final questions = MockData.assessmentQuestions;
    final progress = (_currentIndex + 1) / questions.length;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, color: AppColors.textPrimary),
          onPressed: () => context.pop(),
        ),
        title: const Text('Anxiety Assessment', style: AppTextStyles.titleLarge),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Progress Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            child: Column(
              children: [
                LinearProgressIndicator(
                  value: progress,
                  backgroundColor: AppColors.surfaceVariant,
                  color: AppColors.primary,
                  minHeight: 6,
                  borderRadius: BorderRadius.circular(10),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Question ${_currentIndex + 1} of ${questions.length}', style: AppTextStyles.bodySmall),
                    Text('${(progress * 100).round()}%', style: AppTextStyles.bodySmall.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),

          Expanded(
            child: PageView.builder(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              onPageChanged: (index) => setState(() => _currentIndex = index),
              itemCount: questions.length,
              itemBuilder: (context, index) {
                final q = questions[index];
                return Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        q.text,
                        style: AppTextStyles.displayMedium.copyWith(height: 1.3),
                      ),
                      const SizedBox(height: 40),
                      ...q.options.asMap().entries.map((entry) {
                        final optionIndex = entry.key + 1;
                        final optionText = entry.value;
                        final isSelected = _answers[q.id] == optionIndex;

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: InkWell(
                            onTap: () => _onOptionSelected(q.id, optionIndex),
                            borderRadius: BorderRadius.circular(16),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                              decoration: BoxDecoration(
                                color: isSelected ? AppColors.primary.withOpacity(0.1) : Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isSelected ? AppColors.primary : AppColors.surfaceVariant,
                                  width: 2,
                                ),
                                boxShadow: isSelected ? [] : AppColors.cardShadow,
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 24,
                                    height: 24,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: isSelected ? AppColors.primary : AppColors.textHint,
                                        width: 2,
                                      ),
                                      color: isSelected ? AppColors.primary : Colors.transparent,
                                    ),
                                    child: isSelected ? const Icon(Icons.check, size: 16, color: Colors.white) : null,
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Text(
                                      optionText,
                                      style: AppTextStyles.bodyLarge.copyWith(
                                        color: isSelected ? AppColors.primary : AppColors.textPrimary,
                                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ],
                  ),
                );
              },
            ),
          ),

          if (_currentIndex == questions.length - 1 && _answers[questions.last.id] != null)
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: AppButton(
                label: 'Finish Assessment',
                onPressed: _finish,
              ),
            )
          else if (_currentIndex > 0)
            Padding(
              padding: const EdgeInsets.only(left: 24, bottom: 24),
              child: Align(
                alignment: Alignment.centerLeft,
                child: TextButton.icon(
                  onPressed: () => _pageController.previousPage(duration: const Duration(milliseconds: 400), curve: Curves.easeInOut),
                  icon: const Icon(Icons.arrow_back_rounded),
                  label: const Text('Previous'),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
