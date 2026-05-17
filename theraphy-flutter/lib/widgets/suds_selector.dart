import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_text_styles.dart';

class SudsSelector extends StatelessWidget {
  final int? selectedValue;
  final ValueChanged<int> onSelected;

  const SudsSelector({
    super.key,
    required this.selectedValue,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          alignment: WrapAlignment.center,
          children: List.generate(11, (index) {
            final isSelected = selectedValue == index;
            final color = AppColors.anxietyColor(index);
            
            return GestureDetector(
              onTap: () => onSelected(index),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isSelected ? color : Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isSelected ? color : AppColors.surfaceVariant,
                    width: 2,
                  ),
                  boxShadow: isSelected ? [
                    BoxShadow(
                      color: color.withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    )
                  ] : null,
                ),
                child: Center(
                  child: Text(
                    index.toString(),
                    style: AppTextStyles.titleMedium.copyWith(
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('No Distress', style: AppTextStyles.bodySmall),
            Text('Extreme Distress', style: AppTextStyles.bodySmall),
          ],
        ),
      ],
    );
  }
}
