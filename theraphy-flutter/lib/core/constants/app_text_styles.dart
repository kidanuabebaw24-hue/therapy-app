import 'package:flutter/material.dart';
import 'app_colors.dart';

// Outfit is loaded via google_fonts in AppTheme; we reference it by name here
// so these can remain const.
class AppTextStyles {
  AppTextStyles._();

  static const String _f = 'Outfit';

  static const TextStyle displayLarge = TextStyle(fontFamily: _f, fontSize: 32, fontWeight: FontWeight.w700, color: AppColors.textPrimary, height: 1.2);
  static const TextStyle displayMedium = TextStyle(fontFamily: _f, fontSize: 26, fontWeight: FontWeight.w700, color: AppColors.textPrimary, height: 1.3);
  static const TextStyle displaySmall = TextStyle(fontFamily: _f, fontSize: 24, fontWeight: FontWeight.w600, color: AppColors.textPrimary, height: 1.3);
  static const TextStyle headlineLarge = TextStyle(fontFamily: _f, fontSize: 22, fontWeight: FontWeight.w600, color: AppColors.textPrimary, height: 1.3);
  static const TextStyle headlineMedium = TextStyle(fontFamily: _f, fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary, height: 1.4);
  static const TextStyle titleLarge = TextStyle(fontFamily: _f, fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary, height: 1.4);
  static const TextStyle titleMedium = TextStyle(fontFamily: _f, fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary, height: 1.5);
  static const TextStyle bodyLarge = TextStyle(fontFamily: _f, fontSize: 16, fontWeight: FontWeight.w400, color: AppColors.textPrimary, height: 1.6);
  static const TextStyle bodyMedium = TextStyle(fontFamily: _f, fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textSecondary, height: 1.6);
  static const TextStyle bodySmall = TextStyle(fontFamily: _f, fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textHint, height: 1.5);
  static const TextStyle labelLarge = TextStyle(fontFamily: _f, fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary, letterSpacing: 0.5);
  static const TextStyle labelMedium = TextStyle(fontFamily: _f, fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textSecondary, letterSpacing: 0.4);
  static const TextStyle button = TextStyle(fontFamily: _f, fontSize: 16, fontWeight: FontWeight.w600, letterSpacing: 0.5);
}
