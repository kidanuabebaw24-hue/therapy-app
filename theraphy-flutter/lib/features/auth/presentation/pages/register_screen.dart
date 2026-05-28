import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:theraphy_flutter/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../widgets/auth_button.dart';
import '../widgets/auth_text_field.dart';
import '../widgets/glass_card.dart';
import '../utils/register_validators.dart';
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
  final _ageController = TextEditingController();
  final _passwordController = TextEditingController();
  String? _selectedGender;
  bool _isLoading = false;

  static final _nameFormatters = [
    FilteringTextInputFormatter.deny(RegExp(r'[0-9]')),
    FilteringTextInputFormatter.allow(RegExp(r"[a-zA-Z\s'.-]")),
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _ageController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final age = int.parse(_ageController.text.trim());
      final success = await ref.read(authProvider.notifier).register(
            name: _nameController.text,
            email: _emailController.text,
            password: _passwordController.text,
            age: age,
            gender: _selectedGender!,
          );

      if (success && mounted) {
        // Router redirects when auth state becomes authenticated.
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
    final l10n = AppLocalizations.of(context);

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
                    l10n.joinUs,
                    style: AppTextStyles.headlineLarge.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ).animate().fade().slideX(begin: -0.1, end: 0),
                  const SizedBox(height: 8),
                  Text(
                    l10n.startYourPath,
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
                            hintText: l10n.fullName,
                            prefixIcon: Icons.person_outline_rounded,
                            inputFormatters: _nameFormatters,
                            validator: RegisterValidators.validateName,
                          ),
                          const SizedBox(height: 20),
                          AuthTextField(
                            controller: _emailController,
                            hintText: '${l10n.emailAddress} (@gmail.com)',
                            prefixIcon: Icons.email_outlined,
                            keyboardType: TextInputType.emailAddress,
                            validator: RegisterValidators.validateGmail,
                          ),
                          const SizedBox(height: 20),
                          AuthTextField(
                            controller: _ageController,
                            hintText: 'Age (18+)',
                            prefixIcon: Icons.cake_outlined,
                            keyboardType: TextInputType.number,
                            maxLength: 3,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                            ],
                            validator: RegisterValidators.validateAge,
                          ),
                          const SizedBox(height: 20),
                          _GenderField(
                            value: _selectedGender,
                            onChanged: (value) =>
                                setState(() => _selectedGender = value),
                            validator: RegisterValidators.validateGender,
                          ),
                          const SizedBox(height: 20),
                          AuthTextField(
                            controller: _passwordController,
                            hintText: l10n.password,
                            prefixIcon: Icons.lock_outline_rounded,
                            isPassword: true,
                            validator: RegisterValidators.validatePassword,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'You must be 18 or older. Email must end with @gmail.com.',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.textHint,
                            ),
                          ),
                          const SizedBox(height: 20),
                          AuthButton(
                            text: l10n.signUp,
                            onPressed: _handleRegister,
                            isLoading: _isLoading,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            l10n.termsNotice,
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
                        l10n.alreadyHaveAccount,
                        style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                      ),
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: Text(
                          l10n.login,
                          style: const TextStyle(fontWeight: FontWeight.bold),
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

class _GenderField extends StatelessWidget {
  final String? value;
  final ValueChanged<String?> onChanged;
  final String? Function(String?)? validator;

  const _GenderField({
    required this.value,
    required this.onChanged,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: InputDecoration(
        hintText: 'Gender',
        prefixIcon: const Icon(Icons.wc_outlined, size: 22),
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.85),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: AppColors.surfaceVariant.withValues(alpha: 0.5)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.error),
        ),
      ),
      style: AppTextStyles.bodyMedium,
      items: const [
        DropdownMenuItem(value: 'male', child: Text('Male')),
        DropdownMenuItem(value: 'female', child: Text('Female')),
      ],
      onChanged: onChanged,
      validator: validator,
    );
  }
}
