class AppRoutes {
  AppRoutes._();

  static const splash = '/';
  static const onboarding = '/onboarding';
  static const welcome = '/welcome';
  static const login = '/login';
  static const register = '/register';
  static const forgotPassword = '/forgot-password';
  static const resetPassword = '/reset-password';
  static const verificationSuccess = '/verification-success';
  static const authSuccess = '/auth-success';

  static const clientDashboard = '/dashboard';
  static const moodTracking = '/mood';
  static const sessions = '/sessions';
  static const aiChat = '/ai-chat';
  static const therapistChat = '/therapist-chat';
  static const cbtExercises = '/cbt';
  static const cbtExerciseDetail = '/cbt/exercise/:id';
  static const breathingExercise = '/cbt/breathing';
  static const assessments = '/assessments';
  static const assessmentQuestionnaire = '/assessment/questions';
  static const assessmentResult = '/assessment/result';
  static const progress = '/progress';
  static const clientProfile = '/profile';
  static const editProfile = '/profile/edit';
  static const notifications = '/notifications';
  static const emergency = '/emergency';
  static const scheduling = '/scheduling';
  static const therapistProfile = '/scheduling/profile';
  static const exposure = '/exposure';
  static const exposureSession = '/exposure/session';

  static const languageSettings = '/settings/language';
  static const bookingSummary = '/booking/summary';
  static const paymentMethod = '/booking/payment-method';
  static const cardPayment = '/booking/card-payment';
  static const paymentProcessing = '/booking/processing';
  static const bookingConfirmation = '/booking/confirmation';
}
