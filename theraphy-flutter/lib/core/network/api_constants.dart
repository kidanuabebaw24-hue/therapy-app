import '../constants/app_constants.dart';

class ApiConstants {
  static String get baseUrl => AppConstants.baseUrl;

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String profile = '/auth/profile';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';

  // CBT
  static const String cbtExercises = '/cbt/exercises';
  static const String submitCbt = '/cbt/progress';
  static const String cbtHistory = '/cbt/progress/me';

  // Assessments
  static const String assessmentQuestions = '/assessments/questions';
  static const String submitAssessment = '/assessments';
  static const String assessmentHistory = '/assessments/history';

  // Therapists & Appointments
  static const String therapists = '/therapists';
  static const String checkAppointmentAvailability =
      '/appointments/check-availability';
  static const String bookAppointment = '/appointments/book';
  static const String appointments = '/appointments';

  // Mood & Progress
  static const String moods = '/moods';
  static const String moodHistory = '/moods/history';
  static const String progress = '/progress';

  // Exposure Therapy
  static const String exposureSessions = '/exposure/sessions';
  static const String exposurePlan = '/exposure/plan';
  static const String exposureUpdate = '/exposure';

  // AI
  static const String aiChat = '/ai';

  // Notifications
  static const String notifications = '/notifications/my';
  static const String markAllNotificationsRead = '/notifications/read-all';
  // Note: For individual read, use '/notifications/$id/read'
}
