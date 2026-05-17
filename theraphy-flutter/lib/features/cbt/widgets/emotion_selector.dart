import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';

class EmotionSelector extends StatelessWidget {
  final String? selectedEmotion;
  final Function(String) onSelected;

  const EmotionSelector({
    super.key,
    this.selectedEmotion,
    required this.onSelected,
  });

  static const List<Map<String, String>> _emotions = [
    {'name': 'Anxious', 'emoji': '😟'},
    {'name': 'Stressed', 'emoji': '😫'},
    {'name': 'Sad', 'emoji': '😢'},
    {'name': 'Angry', 'emoji': '😠'},
    {'name': 'Overwhelmed', 'emoji': '😵'},
    {'name': 'Fearful', 'emoji': '😨'},
    {'name': 'Guilty', 'emoji': '😔'},
    {'name': 'Frustrated', 'emoji': '😤'},
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: _emotions.map((e) {
        final isSelected = selectedEmotion == e['name'];
        return GestureDetector(
          onTap: () => onSelected(e['name']!),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.primary : AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isSelected ? AppColors.primary : AppColors.border,
                width: 1.5,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      )
                    ]
                  : null,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(e['emoji']!, style: const TextStyle(fontSize: 18)),
                const SizedBox(width: 8),
                Text(
                  e['name']!,
                  style: AppTextStyles.labelMedium.copyWith(
                    color: isSelected ? Colors.white : AppColors.textPrimary,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}
