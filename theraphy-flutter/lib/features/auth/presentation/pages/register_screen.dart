import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../routes/app_routes.dart';
import '../widgets/auth_button.dart';
import '../widgets/auth_text_field.dart';
import '../widgets/glass_card.dart';
import 'package:theraphy_flutter/features/auth/presentation/providers/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    
    try {
      final success = await ref.read(authProvider.notifier).register(
        _nameController.text,
        _emailController.text,
        _passwordController.text,
      );
      
      if (success && mounted) {
        // The router will automatically redirect to the dashboard 
        // because the auth state is now authenticated.
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(authProvider, (previous, next) {
      if (next.status == AuthStatus.error && next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.error!), backgroundColor: AppColors.error),
        );
      }
    });

    return Scaffold(
      body: Stack(
        children: [
          // Background Gradient
          Container(
            decoration: const BoxDecoration(
              gradient: AppColors.softBlueGradient,
            ),
          ),
          
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const BackButton(),
                  const SizedBox(height: 20),
                  
                  Text(
                    "Join Us",
                    style: AppTextStyles.headlineLarge.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ).animate().fade().slideX(begin: -0.1, end: 0),
                  
                  const SizedBox(height: 8),
                  
                  Text(
                    "Start your path to tranquility today.",
                    style: AppTextStyles.bodyLarge.copyWith(color: AppColors.textSecondary),
                  ).animate().fade(delay: 100.ms).slideX(begin: -0.1, end: 0),
                  
                  const SizedBox(height: 40),
                  
                  GlassCard(
                    padding: const EdgeInsets.all(32),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          AuthTextField(
                            controller: _nameController,
                            hintText: "Full Name",
                            prefixIcon: Icons.person_outline_rounded,
                            validator: (val) => val == null || val.isEmpty ? "Enter your name" : null,
                          ),
                          const SizedBox(height: 20),
                          AuthTextField(
                            controller: _emailController,
                            hintText: "Email Address",
                            prefixIcon: Icons.email_outlined,
                            keyboardType: TextInputType.emailAddress,
                            validator: (val) => val == null || !val.contains('@') ? "Enter a valid email" : null,
                          ),
                          const SizedBox(height: 20),
                          AuthTextField(
                            controller: _passwordController,
                            hintText: "Password",
                            prefixIcon: Icons.lock_outline_rounded,
                            isPassword: true,
                            validator: (val) => val == null || val.length < 6 ? "Password must be at least 6 characters" : null,
                          ),
                          
                          const SizedBox(height: 32),
                          
                          AuthButton(
                            text: "Sign Up",
                            onPressed: _handleRegister,
                            isLoading: _isLoading,
                          ),
                          
                          const SizedBox(height: 16),
                          
                          Text(
                            "By signing up, you agree to our Terms of Service and Privacy Policy.",
                            textAlign: TextAlign.center,
                            style: AppTextStyles.bodySmall.copyWith(color: AppColors.textHint),
                          ),
                        ],
                      ),
                    ),
                  ).animate().fade(delay: 200.ms).scale(duration: 500.ms, curve: Curves.easeOutBack),
                  
                  const SizedBox(height: 32),
                  
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Already have an account? ",
                        style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                      ),
                      TextButton(
                        onPressed: () => context.pop(),
                        child: const Text(
                          "Log In",
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ).animate().fade(delay: 400.ms),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
