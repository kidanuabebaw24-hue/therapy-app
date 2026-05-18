class AppConstants {
  AppConstants._();

  // App Info
  static const String appName = 'Theraphy';
  static const String appTagline = 'Treating Anxiety & Phobias';

  // API
  static const bool useMockData = false;
  static const String baseUrl = String.fromEnvironment(
    'BASE_URL',
    defaultValue: 'https://theraphy-backend.onrender.com/api',
  );
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'current_user';
  static const String onboardingKey = 'onboarding_done';

  // Pagination
  static const int pageSize = 20;

  // Anxiety Scale
  static const int minAnxietyLevel = 1;
  static const int maxAnxietyLevel = 10;

  // Session Duration (minutes)
  static const List<int> sessionDurations = [30, 45, 60, 90];
}
