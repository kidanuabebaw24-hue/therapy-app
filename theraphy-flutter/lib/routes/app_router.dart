import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:theraphy_flutter/features/auth/presentation/providers/auth_provider.dart';
import '../features/auth/presentation/pages/splash_screen.dart';
import '../features/auth/presentation/pages/onboarding_screen.dart';
import '../features/auth/presentation/pages/welcome_screen.dart';
import '../features/auth/presentation/pages/login_screen.dart';
import '../features/auth/presentation/pages/register_screen.dart';
import '../features/auth/presentation/pages/forgot_password_screen.dart';
import '../features/auth/presentation/pages/reset_password_screen.dart';
import '../features/auth/presentation/pages/verification_success_screen.dart';
import '../features/auth/presentation/pages/auth_success_screen.dart';
import '../screens/client/client_shell.dart';
import '../screens/client/dashboard/client_dashboard_screen.dart';
import '../features/cbt/screens/cbt_home_screen.dart';
import '../features/cbt/screens/cbt_exercise_screen.dart';
import '../screens/client/profile/client_profile_screen.dart';
import '../screens/client/profile/edit_profile_screen.dart';
import '../screens/client/assessment/assessment_questionnaire_screen.dart';
import '../screens/client/assessment/assessment_result_screen.dart';
import '../screens/client/scheduling/therapist_list_screen.dart';
import '../screens/client/scheduling/therapist_profile_screen.dart';
import '../screens/client/cbt/breathing_exercise_screen.dart';
import '../screens/client/exposure/exposure_plan_screen.dart';
import '../screens/client/exposure/exposure_session_screen.dart';
import '../screens/client/mood/progress_analytics_screen.dart';
import '../screens/client/mood/mood_tracking_screen.dart';
import '../screens/client/sessions/sessions_screen.dart';
import '../screens/client/ai_chat/ai_chat_screen.dart';
import '../screens/client/ai_chat/ai_conversation_screen.dart';
import '../screens/client/chat/therapist_chat_screen.dart';
import '../screens/client/emergency/emergency_support_screen.dart';
import '../screens/client/notifications/notifications_screen.dart';
import '../features/payments/screens/booking_summary_screen.dart';
import '../features/payments/screens/payment_method_screen.dart';
import '../features/payments/screens/card_payment_screen.dart';
import '../features/payments/screens/payment_processing_screen.dart';
import '../features/payments/screens/booking_confirmation_screen.dart';
import '../core/localization/language_settings_screen.dart';
import '../models/exposure_model.dart';
import '../models/assessment_model.dart';
import '../models/therapist_model.dart';
import 'app_routes.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.splash,
    refreshListenable: _AuthStateListenable(ref),
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final isAuth = authState.isAuthenticated;
      final isInitial = authState.status == AuthStatus.initial ||
          authState.status == AuthStatus.loading;
      final isSplash = state.matchedLocation == AppRoutes.splash;

      // Always let the splash screen handle its own navigation.
      if (isSplash) return null;

      // While auth is still resolving, stay put.
      if (isInitial) return null;

      final onAuthPage = state.matchedLocation == AppRoutes.login ||
          state.matchedLocation == AppRoutes.register ||
          state.matchedLocation == AppRoutes.welcome ||
          state.matchedLocation == AppRoutes.onboarding ||
          state.matchedLocation == AppRoutes.forgotPassword ||
          state.matchedLocation == AppRoutes.resetPassword ||
          state.matchedLocation == AppRoutes.verificationSuccess ||
          state.matchedLocation == AppRoutes.authSuccess;

      // Unauthenticated user trying to access a protected page → welcome.
      if (!isAuth && !onAuthPage) return AppRoutes.welcome;

      // Authenticated user on an auth page → dashboard (or CBT if required).
      if (isAuth && onAuthPage && state.matchedLocation != AppRoutes.authSuccess) {
        final user = authState.user;
        if (user?.requiresCBT == true && user?.hasCompletedInitialCBT == false) {
          return AppRoutes.cbtExercises;
        }
        return AppRoutes.clientDashboard;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        builder: (_, __) => const AnimatedSplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.onboarding,
        builder: (_, __) => const OnboardingScreen(),
      ),
      GoRoute(
        path: AppRoutes.welcome,
        builder: (_, __) => const WelcomeScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        builder: (_, __) => const RegisterScreen(),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        builder: (_, __) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: AppRoutes.resetPassword,
        builder: (_, __) => const ResetPasswordScreen(),
      ),
      GoRoute(
        path: AppRoutes.verificationSuccess,
        builder: (_, __) => const VerificationSuccessScreen(),
      ),
      GoRoute(
        path: AppRoutes.authSuccess,
        builder: (_, __) => const AuthSuccessScreen(),
      ),
      
      // Standalone screens
      GoRoute(
        path: AppRoutes.assessmentQuestionnaire,
        builder: (_, __) => const AssessmentQuestionnaireScreen(),
      ),
      GoRoute(
        path: AppRoutes.assessmentResult,
        builder: (_, state) {
          final extra = state.extra as Map<String, dynamic>;
          return AssessmentResultScreen(
            score: extra['score'] as int,
            severity: extra['severity'] as AssessmentSeverity,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.therapistProfile,
        builder: (_, state) => TherapistProfileScreen(
          therapist: state.extra as TherapistModel,
        ),
      ),
      GoRoute(
        path: AppRoutes.breathingExercise,
        builder: (_, __) => const BreathingExerciseScreen(),
      ),
      GoRoute(
        path: AppRoutes.exposureSession,
        builder: (_, state) => ExposureSessionScreen(
          level: state.extra as ExposureLevel,
        ),
      ),

      // Payment Booking Flow
      GoRoute(
        path: AppRoutes.bookingSummary,
        builder: (_, __) => const BookingSummaryScreen(),
      ),
      GoRoute(
        path: AppRoutes.paymentMethod,
        builder: (_, __) => const PaymentMethodScreen(),
      ),
      GoRoute(
        path: AppRoutes.cardPayment,
        builder: (_, __) => const CardPaymentScreen(),
      ),
      GoRoute(
        path: AppRoutes.paymentProcessing,
        builder: (_, state) => PaymentProcessingScreen(
          args: state.extra,
        ),
      ),
      GoRoute(
        path: AppRoutes.bookingConfirmation,
        builder: (_, __) => const BookingConfirmationScreen(),
      ),
      GoRoute(
        path: AppRoutes.languageSettings,
        builder: (_, __) => const LanguageSettingsScreen(),
      ),

      ShellRoute(
        builder: (context, state, child) => ClientShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.clientDashboard,
            builder: (_, __) => const ClientDashboardScreen(),
          ),
          GoRoute(
            path: AppRoutes.scheduling,
            builder: (_, __) => const TherapistListScreen(),
          ),
          GoRoute(
            path: AppRoutes.assessments,
            builder: (_, __) => const AssessmentQuestionnaireScreen(),
          ),
          GoRoute(
            path: AppRoutes.progress,
            builder: (_, __) => const ProgressAnalyticsScreen(),
          ),
          GoRoute(
            path: AppRoutes.clientProfile,
            builder: (_, __) => const ClientProfileScreen(),
          ),
          GoRoute(
            path: AppRoutes.editProfile,
            builder: (_, __) => const EditProfileScreen(),
          ),
          GoRoute(
            path: AppRoutes.notifications,
            builder: (_, __) => const NotificationsScreen(),
          ),
          GoRoute(
            path: AppRoutes.cbtExercises,
            builder: (_, __) => const CbtHomeScreen(),
          ),
          GoRoute(
            path: AppRoutes.cbtExerciseDetail,
            builder: (_, state) => CbtExerciseScreen(
              exerciseId: state.pathParameters['id']!,
            ),
          ),
          GoRoute(
            path: AppRoutes.exposure,
            builder: (_, __) => const ExposurePlanScreen(),
          ),
          GoRoute(
            path: AppRoutes.moodTracking,
            builder: (_, __) => const MoodTrackingScreen(),
          ),
          GoRoute(
            path: AppRoutes.sessions,
            builder: (_, __) => const SessionsScreen(),
          ),
          GoRoute(
            path: AppRoutes.therapistChat,
            builder: (_, __) => const TherapistChatScreen(),
          ),
          GoRoute(
            path: AppRoutes.aiChat,
            builder: (_, __) => const AiChatScreen(),
          ),
          GoRoute(
            path: '${AppRoutes.aiChat}/:id',
            builder: (_, state) => AiConversationScreen(
              conversationId: state.pathParameters['id']!,
            ),
          ),
          GoRoute(
            path: AppRoutes.emergency,
            builder: (_, __) => const EmergencySupportScreen(),
          ),
          GoRoute(
            path: AppRoutes.notifications,
            builder: (_, __) => const NotificationsScreen(),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Page not found: ${state.error}')),
    ),
  );
});

class _AuthStateListenable extends ChangeNotifier {
  _AuthStateListenable(Ref ref) {
    ref.listen(authProvider, (_, __) => notifyListeners());
  }
}
