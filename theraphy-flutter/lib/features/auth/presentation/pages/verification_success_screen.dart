import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../routes/app_routes.dart';
import '../widgets/auth_button.dart';

class VerificationSuccessScreen extends StatelessWidget {
  const VerificationSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 40),
        decoration: const BoxDecoration(gradient: AppColors.softBlueGradient),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(32),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_circle_rounded,
                size: 80,
                color: AppColors.success,
              ),
            ).animate().scale(duration: 600.ms, curve: Curves.easeOutBack).shimmer(delay: 800.ms),
            
            const SizedBox(height: 48),
            
            Text(
              "All Set!",
              style: AppTextStyles.headlineLarge.copyWith(fontWeight: FontWeight.bold),
            ).animate().fade(delay: 200.ms).slideY(begin: 0.2, end: 0),
            
            const SizedBox(height: 16),
            
            Text(
              "Your action was successful. You can now continue your journey to mental wellness.",
              textAlign: TextAlign.center,
              style: AppTextStyles.bodyLarge.copyWith(color: AppColors.textSecondary),
            ).animate().fade(delay: 400.ms).slideY(begin: 0.2, end: 0),
            
            const SizedBox(height: 60),
            
            AuthButton(
              text: "Continue",
              onPressed: () => context.go(AppRoutes.login),
            ).animate().fade(delay: 600.ms).scale(),
          ],
        ),
      ),
    );
  }
}
