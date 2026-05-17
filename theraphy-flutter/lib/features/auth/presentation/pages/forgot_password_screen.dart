import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../widgets/auth_button.dart';
import '../widgets/auth_text_field.dart';
import '../widgets/glass_card.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  bool _isLoading = false;

  Future<void> _handleReset() async {
    setState(() => _isLoading = true);
    // Mock reset logic
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      context.push('/reset-password');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Container(decoration: const BoxDecoration(gradient: AppColors.softBlueGradient)),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const BackButton(),
                  const SizedBox(height: 40),
                  Text(
                    "Forgot Password?",
                    style: AppTextStyles.headlineLarge.copyWith(fontWeight: FontWeight.bold),
                  ).animate().fade().slideX(begin: -0.1),
                  const SizedBox(height: 12),
                  Text(
                    "Don't worry, it happens. Enter your email and we'll send you instructions.",
                    style: AppTextStyles.bodyLarge.copyWith(color: AppColors.textSecondary),
                  ).animate().fade(delay: 100.ms).slideX(begin: -0.1),
                  const SizedBox(height: 40),
                  GlassCard(
                    child: Column(
                      children: [
                        AuthTextField(
                          controller: _emailController,
                          hintText: "Email Address",
                          prefixIcon: Icons.email_outlined,
                        ),
                        const SizedBox(height: 32),
                        AuthButton(
                          text: "Send Instructions",
                          onPressed: _handleReset,
                          isLoading: _isLoading,
                        ),
                      ],
                    ),
                  ).animate().fade(delay: 200.ms).scale(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
