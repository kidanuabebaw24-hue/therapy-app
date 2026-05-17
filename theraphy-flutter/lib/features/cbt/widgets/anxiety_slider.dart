import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';

class AnxietySlider extends StatelessWidget {
  final double value;
  final ValueChanged<double> onChanged;

  const AnxietySlider({
    super.key,
    required this.value,
    required this.onChanged,
  });

  Color _getColor(double value) {
    if (value <= 3) return Colors.green;
    if (value <= 7) return Colors.orange;
    return Colors.red;
  }

  String _getLabel(double value) {
    if (value <= 2) return 'Minimal';
    if (value <= 4) return 'Mild';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Severe';
    return 'Extreme';
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Not at all', style: AppTextStyles.bodySmall),
            Text('Very Intense', style: AppTextStyles.bodySmall),
          ],
        ),
        const SizedBox(height: 8),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: _getColor(value),
            inactiveTrackColor: AppColors.surfaceVariant,
            thumbColor: _getColor(value),
            overlayColor: _getColor(value).withOpacity(0.2),
            valueIndicatorColor: _getColor(value),
            valueIndicatorTextStyle: const TextStyle(color: Colors.white),
            trackHeight: 8,
          ),
          child: Slider(
            value: value,
            min: 0,
            max: 10,
            divisions: 10,
            label: value.round().toString(),
            onChanged: onChanged,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: _getColor(value).withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            '${value.round()} - ${_getLabel(value)}',
            style: TextStyle(
              fontFamily: 'Outfit',
              color: _getColor(value),
              fontWeight: FontWeight.w700,
              fontSize: 16,
            ),
          ),
        ),
      ],
    );
  }
}
