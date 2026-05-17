import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_charts/charts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';

class ProgressAnalyticsScreen extends StatelessWidget {
  const ProgressAnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Progress & Analytics'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Wellness Overview', style: AppTextStyles.headlineMedium),
            const SizedBox(height: 16),
            
            // Wellness Score Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: AppColors.cardShadow,
              ),
              child: Row(
                children: [
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 80,
                        height: 80,
                        child: CircularProgressIndicator(
                          value: 0.82,
                          strokeWidth: 8,
                          backgroundColor: AppColors.surfaceVariant,
                          color: AppColors.primary,
                        ),
                      ),
                      const Text('82%', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary)),
                    ],
                  ),
                  const SizedBox(width: 24),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Great job!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text('Your wellness score improved by 12% this week.', style: AppTextStyles.bodySmall),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 32),
            const Text('Mood Trends', style: AppTextStyles.headlineMedium),
            const SizedBox(height: 16),
            
            // Mood Chart
            Container(
              height: 300,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: AppColors.cardShadow,
              ),
              child: SfCartesianChart(
                primaryXAxis: const CategoryAxis(),
                title: const ChartTitle(text: 'Last 7 Days'),
                legend: const Legend(isVisible: true, position: LegendPosition.bottom),
                tooltipBehavior: TooltipBehavior(enable: true),
                series: <CartesianSeries<dynamic, String>>[
                  SplineSeries<dynamic, String>(
                    name: 'Mood',
                    dataSource: [
                      {'day': 'Mon', 'val': 4},
                      {'day': 'Tue', 'val': 3},
                      {'day': 'Wed', 'val': 5},
                      {'day': 'Thu', 'val': 4},
                      {'day': 'Fri', 'val': 6},
                      {'day': 'Sat', 'val': 7},
                      {'day': 'Sun', 'val': 6},
                    ],
                    xValueMapper: (dynamic data, _) => data['day'],
                    yValueMapper: (dynamic data, _) => data['val'],
                    color: AppColors.primary,
                    markerSettings: const MarkerSettings(isVisible: true),
                  ),
                  SplineSeries<dynamic, String>(
                    name: 'Anxiety',
                    dataSource: [
                      {'day': 'Mon', 'val': 6},
                      {'day': 'Tue', 'val': 7},
                      {'day': 'Wed', 'val': 5},
                      {'day': 'Thu', 'val': 4},
                      {'day': 'Fri', 'val': 3},
                      {'day': 'Sat', 'val': 2},
                      {'day': 'Sun', 'val': 3},
                    ],
                    xValueMapper: (dynamic data, _) => data['day'],
                    yValueMapper: (dynamic data, _) => data['val'],
                    color: AppColors.accent,
                    markerSettings: const MarkerSettings(isVisible: true),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 32),
            const Text('Habit Streaks', style: AppTextStyles.headlineMedium),
            const SizedBox(height: 16),
            
            Row(
              children: [
                _StreakItem(icon: Icons.auto_awesome_rounded, label: 'Breathing', days: 12),
                const SizedBox(width: 16),
                _StreakItem(icon: Icons.edit_note_rounded, label: 'Journaling', days: 5),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _StreakItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int days;

  const _StreakItem({required this.icon, required this.label, required this.days});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: AppColors.cardShadow,
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.primary, size: 32),
            const SizedBox(height: 12),
            Text('$days Days', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.primary)),
            Text(label, style: AppTextStyles.bodySmall),
          ],
        ),
      ),
    );
  }
}
