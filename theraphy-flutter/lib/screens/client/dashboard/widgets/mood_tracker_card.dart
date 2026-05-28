import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class MoodTrackerCard extends StatelessWidget {
  final Function(int) onMoodSelected;

  const MoodTrackerCard({super.key, required this.onMoodSelected});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary.withOpacity(0.08),
            AppColors.secondary.withOpacity(0.05),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.white.withOpacity(0.6), width: 1.5),
            borderRadius: BorderRadius.circular(28),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'How are you feeling?',
                    style: AppTextStyles.titleMedium,
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Daily Check-in',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 10,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _MoodEmoji(emoji: '😔', label: 'Sad', score: 1, color: Colors.blue.shade300, onTap: onMoodSelected),
                  _MoodEmoji(emoji: '😐', label: 'Neutral', score: 3, color: Colors.amber.shade300, onTap: onMoodSelected),
                  _MoodEmoji(emoji: '😊', label: 'Happy', score: 5, color: Colors.green.shade300, onTap: onMoodSelected),
                  _MoodEmoji(emoji: '🧘', label: 'Calm', score: 5, color: Colors.teal.shade300, onTap: onMoodSelected),
                  _MoodEmoji(emoji: '😰', label: 'Anxious', score: 2, color: Colors.orange.shade300, onTap: onMoodSelected),
                ],
              ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.1, end: 0),
            ],
          ),
        ),
      ),
    );
  }
}

class _MoodEmoji extends StatelessWidget {
  final String emoji;
  final String label;
  final int score;
  final Color color;
  final Function(int) onTap;

  const _MoodEmoji({
    required this.emoji,
    required this.label,
    required this.score,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => onTap(score),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Text(emoji, style: const TextStyle(fontSize: 30)),
            ).animate(onPlay: (controller) => controller.repeat(reverse: true))
             .shimmer(delay: 2000.ms, duration: 1500.ms, color: Colors.white.withOpacity(0.4)),
            const SizedBox(height: 8),
            Text(
              label,
              style: AppTextStyles.bodySmall.copyWith(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

