import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../models/assessment_model.dart';
import '../../../widgets/app_button.dart';

class AssessmentResultScreen extends StatelessWidget {
  final int score;
  final AssessmentSeverity severity;

  const AssessmentResultScreen({
    super.key,
    required this.score,
    required this.severity,
  });

  @override
  Widget build(BuildContext context) {
    Color severityColor;
    String description;
    switch (severity) {
      case AssessmentSeverity.mild:
        severityColor = AppColors.success;
        description = 'You are experiencing mild anxiety symptoms. This is often manageable with self-care and daily mindfulness.';
        break;
      case AssessmentSeverity.moderate:
        severityColor = AppColors.accent;
        description = 'You are experiencing moderate anxiety. We recommend scheduling a session with one of our therapists to discuss these feelings.';
        break;
      case AssessmentSeverity.severe:
        severityColor = AppColors.error;
        description = 'Your anxiety levels are currently high. Please consider reaching out to our emergency support or booking an immediate session.';
        break;
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const SizedBox(height: 40),
                    const Icon(Icons.analytics_rounded, size: 80, color: AppColors.primary),
                    const SizedBox(height: 24),
                    const Text('Assessment Complete', style: AppTextStyles.displayMedium),
                    const SizedBox(height: 40),
                    
                    // Score Circle
                    Container(
                      width: 160,
                      height: 160,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                        boxShadow: AppColors.cardShadow,
                        border: Border.all(color: severityColor, width: 4),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('$score', style: AppTextStyles.displayLarge.copyWith(color: severityColor, fontSize: 48)),
                          Text('Score', style: AppTextStyles.bodyMedium),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 32),
                    
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: severityColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        'SEVERITY: ${severity.name.toUpperCase()}',
                        style: TextStyle(color: severityColor, fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    Text(
                      description,
                      textAlign: TextAlign.center,
                      style: AppTextStyles.bodyLarge.copyWith(height: 1.6),
                    ),
                    
                    const SizedBox(height: 40),
                    
                    // Recommendations
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: Text('Next Steps', style: AppTextStyles.headlineMedium),
                    ),
                    const SizedBox(height: 16),
                    _RecommendationCard(
                      icon: Icons.psychology_rounded,
                      title: 'Try CBT Exercise',
                      subtitle: 'Start with a simple breathing task',
                      onTap: () => context.go('/cbt'),
                    ),
                    const SizedBox(height: 12),
                    _RecommendationCard(
                      icon: Icons.calendar_month_rounded,
                      title: 'Book a Session',
                      subtitle: 'Talk to a certified therapist',
                      onTap: () => context.go('/scheduling'),
                    ),
                  ],
                ),
              ),
            ),
            
            Padding(
              padding: const EdgeInsets.all(24),
              child: AppButton(
                label: 'Back to Dashboard',
                onPressed: () => context.go('/dashboard'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RecommendationCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _RecommendationCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: AppColors.cardShadow,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppColors.primary),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTextStyles.titleMedium.copyWith(fontWeight: FontWeight.bold)),
                  Text(subtitle, style: AppTextStyles.bodySmall),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textHint),
          ],
        ),
      ),
    );
  }
}
