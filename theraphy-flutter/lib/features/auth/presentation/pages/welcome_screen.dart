import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:theraphy_flutter/l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/localization/locale_provider.dart';
import '../../../../routes/app_routes.dart';
import '../widgets/auth_button.dart';

class WelcomeScreen extends ConsumerWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final currentLocale = ref.watch(localeProvider);
    final isAmharic = currentLocale.languageCode == 'am';

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFE0EAFC), Color(0xFFCFDEF3)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              children: [
                const Spacer(),

                // Logo
                const Icon(
                  Icons.spa_rounded,
                  size: 80,
                  color: AppColors.primary,
                ).animate().fade().scale(
                    duration: 800.ms, curve: Curves.easeOutBack),

                const SizedBox(height: 40),

                // Headline
                Text(
                  l10n.takeADeepBreath,
                  textAlign: TextAlign.center,
                  style: AppTextStyles.headlineLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ).animate().fade(delay: 200.ms).slideY(begin: 0.2, end: 0),

                const SizedBox(height: 16),

                // Subtitle
                Text(
                  l10n.welcomeSubtitle,
                  textAlign: TextAlign.center,
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: AppColors.textSecondary,
                    height: 1.5,
                  ),
                ).animate().fade(delay: 400.ms).slideY(begin: 0.2, end: 0),

                const Spacer(),

                // ── Language toggle — clearly visible above the buttons ──
                _LanguageToggle(
                  isAmharic: isAmharic,
                  onToggle: (locale) =>
                      ref.read(localeProvider.notifier).setLocale(locale),
                ).animate().fade(delay: 500.ms),

                const SizedBox(height: 24),

                // Log In button
                AuthButton(
                  text: l10n.login,
                  onPressed: () => context.push(AppRoutes.login),
                ).animate().fade(delay: 600.ms).slideY(begin: 0.2, end: 0),

                const SizedBox(height: 16),

                // Create Account button
                AuthButton(
                  text: l10n.createAccount,
                  isSecondary: true,
                  onPressed: () => context.push(AppRoutes.register),
                ).animate().fade(delay: 800.ms).slideY(begin: 0.2, end: 0),

                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Pill-shaped EN / አማ toggle.
class _LanguageToggle extends StatelessWidget {
  final bool isAmharic;
  final ValueChanged<Locale> onToggle;

  const _LanguageToggle({
    required this.isAmharic,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.15),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _LangChip(
            label: 'English',
            flag: '🇬🇧',
            selected: !isAmharic,
            onTap: () => onToggle(const Locale('en')),
          ),
          _LangChip(
            label: 'አማርኛ',
            flag: '🇪🇹',
            selected: isAmharic,
            onTap: () => onToggle(const Locale('am')),
          ),
        ],
      ),
    );
  }
}

class _LangChip extends StatelessWidget {
  final String label;
  final String flag;
  final bool selected;
  final VoidCallback onTap;

  const _LangChip({
    required this.label,
    required this.flag,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 11),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(flag, style: const TextStyle(fontSize: 18)),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: selected ? Colors.white : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
