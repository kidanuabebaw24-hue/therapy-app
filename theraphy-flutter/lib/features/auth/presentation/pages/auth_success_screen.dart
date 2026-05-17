import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../routes/app_routes.dart';

class AuthSuccessScreen extends StatefulWidget {
  const AuthSuccessScreen({super.key});

  @override
  State<AuthSuccessScreen> createState() => _AuthSuccessScreenState();
}

class _AuthSuccessScreenState extends State<AuthSuccessScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (mounted) context.go(AppRoutes.clientDashboard);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.primary, AppColors.secondary],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.sentiment_very_satisfied_rounded,
              size: 100,
              color: Colors.white,
            ).animate()
             .scale(duration: 800.ms, curve: Curves.easeOutBack)
             .rotate(begin: -0.1, end: 0, duration: 800.ms)
             .then()
             .shimmer(duration: 1200.ms),
             
            const SizedBox(height: 32),
            
            Text(
              "Welcome Back!",
              style: AppTextStyles.headlineLarge.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ).animate().fade(delay: 300.ms).slideY(begin: 0.2, end: 0),
            
            const SizedBox(height: 12),
            
            Text(
              "Preparing your personalized sanctuary...",
              style: AppTextStyles.bodyMedium.copyWith(color: Colors.white.withOpacity(0.8)),
            ).animate().fade(delay: 500.ms).slideY(begin: 0.2, end: 0),
            
            const SizedBox(height: 60),
            
            const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(
                color: Colors.white,
                strokeWidth: 2,
              ),
            ).animate().fade(delay: 800.ms),
          ],
        ),
      ),
    );
  }
}
