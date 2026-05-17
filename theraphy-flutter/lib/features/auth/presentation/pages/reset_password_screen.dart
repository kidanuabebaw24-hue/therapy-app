import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../widgets/auth_button.dart';
import '../widgets/auth_text_field.dart';
import '../widgets/glass_card.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _isLoading = false;

  Future<void> _handleReset() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      context.go('/verification-success');
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
                    "Reset Password",
                    style: AppTextStyles.headlineLarge.copyWith(fontWeight: FontWeight.bold),
                  ).animate().fade().slideX(begin: -0.1),
                  const SizedBox(height: 12),
                  Text(
                    "Create a new secure password for your account.",
                    style: AppTextStyles.bodyLarge.copyWith(color: AppColors.textSecondary),
                  ).animate().fade(delay: 100.ms).slideX(begin: -0.1),
                  const SizedBox(height: 40),
                  GlassCard(
                    child: Column(
                      children: [
                        AuthTextField(
                          controller: _passwordController,
                          hintText: "New Password",
                          prefixIcon: Icons.lock_outline_rounded,
                          isPassword: true,
                        ),
                        const SizedBox(height: 20),
                        AuthTextField(
                          controller: _confirmController,
                          hintText: "Confirm Password",
                          prefixIcon: Icons.lock_outline_rounded,
                          isPassword: true,
                        ),
                        const SizedBox(height: 32),
                        AuthButton(
                          text: "Reset Password",
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
