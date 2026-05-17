import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary â€” calm teal/blue
  static const Color primary = Color(0xFF4A90D9);
  static const Color primaryLight = Color(0xFF7BB3E8);
  static const Color primaryDark = Color(0xFF2C6FAC);

  // Secondary â€” soft lavender
  static const Color secondary = Color(0xFF8B7FD4);
  static const Color secondaryLight = Color(0xFFB3ABEA);
  static const Color secondaryDark = Color(0xFF6358B0);

  // Accent â€” gentle mint
  static const Color accent = Color(0xFF4ECDC4);
  static const Color accentLight = Color(0xFF80E8E2);

  // Backgrounds
  static const Color background = Color(0xFFF7F9FC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFEEF2F8);
  static const Color surfaceBlur = Color(0x99FFFFFF);
  static const Color border = Color(0xFFE2E8F0);

  // Text
  static const Color textPrimary = Color(0xFF1A2340);
  static const Color textSecondary = Color(0xFF5A6478);
  static const Color textHint = Color(0xFF9BA5B7);

  // Status
  static const Color success = Color(0xFF4CAF82);
  static const Color warning = Color(0xFFF5A623);
  static const Color error = Color(0xFFE05C5C);
  static const Color info = Color(0xFF4A90D9);
  
  // Material 3 aliases
  static const Color primaryContainer = Color(0xFFD1E4FF);
  static const Color secondaryContainer = Color(0xFFE2E2F6);

  // Anxiety Level Colors (1-10)
  static const Color anxietyLow = Color(0xFF4CAF82);
  static const Color anxietyMedium = Color(0xFFF5A623);
  static const Color anxietyHigh = Color(0xFFE05C5C);

  // Gradient
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, secondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient calmGradient = LinearGradient(
    colors: [Color(0xFF4A90D9), Color(0xFF4ECDC4)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient lavenderGradient = LinearGradient(
    colors: [Color(0xFF8B7FD4), Color(0xFFB3ABEA)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient softBlueGradient = LinearGradient(
    colors: [Color(0xFFE0EAFC), Color(0xFFCFDEF3)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  // Card shadow
  static List<BoxShadow> cardShadow = [
    BoxShadow(
      color: primary.withOpacity(0.08),
      blurRadius: 20,
      offset: const Offset(0, 4),
    ),
  ];

  static Color anxietyColor(int level) {
    if (level <= 3) return anxietyLow;
    if (level <= 6) return anxietyMedium;
    return anxietyHigh;
  }
}
