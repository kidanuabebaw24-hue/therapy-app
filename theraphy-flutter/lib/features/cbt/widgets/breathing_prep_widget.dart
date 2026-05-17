import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';

class BreathingPrepWidget extends StatefulWidget {
  final VoidCallback onComplete;
  const BreathingPrepWidget({super.key, required this.onComplete});

  @override
  State<BreathingPrepWidget> createState() => _BreathingPrepWidgetState();
}

class _BreathingPrepWidgetState extends State<BreathingPrepWidget> {
  String _instruction = 'Inhale...';
  int _cycles = 0;
  final int _maxCycles = 2; // 2 full cycles (approx 10-12 seconds)

  @override
  void initState() {
    super.initState();
    _startBreathing();
  }

  void _startBreathing() async {
    while (_cycles < _maxCycles && mounted) {
      if (!mounted) return;
      setState(() => _instruction = 'Inhale...');
      await Future.delayed(const Duration(milliseconds: 3000));
      
      if (!mounted) return;
      setState(() => _instruction = 'Hold...');
      await Future.delayed(const Duration(milliseconds: 1000));
      
      if (!mounted) return;
      setState(() => _instruction = 'Exhale...');
      await Future.delayed(const Duration(milliseconds: 3000));
      
      _cycles++;
    }
    if (mounted) widget.onComplete();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              // Outer glow
              Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary.withOpacity(0.05),
                ),
              ).animate(onPlay: (c) => c.repeat(reverse: true))
                .scale(begin: const Offset(1.0, 1.0), end: const Offset(1.4, 1.4), duration: 3000.ms),
              
              // Inner circle
              Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: AppColors.calmGradient,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.3),
                      blurRadius: 20,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    _instruction,
                    style: const TextStyle(
                      fontFamily: 'Outfit',
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ).animate(onPlay: (c) => c.repeat(reverse: true))
                .scale(begin: const Offset(0.8, 0.8), end: const Offset(1.2, 1.2), duration: 3000.ms),
            ],
          ),
          const SizedBox(height: 60),
          Text(
            'Let\'s take a moment to center ourselves.',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 8),
          Text(
            'Cycle ${_cycles + 1} of $_maxCycles',
            style: AppTextStyles.labelMedium.copyWith(color: AppColors.textHint),
          ),
        ],
      ),
    );
  }
}
