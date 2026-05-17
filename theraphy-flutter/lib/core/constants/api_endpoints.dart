class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const String register = '/auth/register';
  static const String login = '/auth/login';

  // User
  static const String userProfile = '/users/profile';
  static const String userStats = '/users/stats';
  static const String clients = '/users/clients';

  // Therapists
  static const String therapists = '/therapists';
  static const String therapistProfile = '/therapists/profile';

  // Appointments (replaces old /sessions)
  static const String appointments = '/appointments';
  static const String myAppointments = '/appointments/my';
  static const String therapistAppointments = '/appointments/therapist';
  static String completeAppointment(String id) => '/appointments/$id/complete';
  static String cancelAppointment(String id) => '/appointments/$id/cancel';

  // Assessments
  static const String assessments = '/assessments';
  static const String myAssessments = '/assessments/my';
  static const String assessmentQuestions = '/assessments/questions';

  // CBT
  static const String cbt = '/cbt';
  static const String assignedCBT = '/cbt/assigned/my';
  static const String completeCBT = '/cbt/assigned/complete';
  static const String skipCBT = '/cbt/assigned/skip';
  static const String cbtProgress = '/cbt/progress/my';

  // Mood
  static const String mood = '/mood';

  // AI Chat
  static const String aiConversations = '/ai/conversations';
  static String aiMessages(String id) => '/ai/conversations/$id/messages';
  static String aiConversation(String id) => '/ai/conversations/$id';

  // Chat
  static const String chatConversations = '/chat/conversations';
  static String chatMessages(String id) => '/chat/messages/$id';
  static String markRead(String id) => '/chat/messages/read/$id';
  static const String unreadCount = '/chat/unread';

  // Emergency
  static const String emergency = '/emergency';
  static const String myEmergencies = '/emergency/my';

  // Payments
  static const String payments = '/payments';
  static const String myPayments = '/payments/my';
  static const String paymentStats = '/payments/stats';

  // Therapist Assignments
  static const String assignments = '/assignments';
  static const String myTherapist = '/assignments/my-therapist';
  static const String myClients = '/assignments/my-clients';
  static const String availableTherapists = '/assignments/available-therapists';
  static String endAssignment(String id) => '/assignments/$id/end';

  // Booking Requests
  static const String bookingRequests = '/booking';
  static const String myBookings = '/booking/my';
  static String cancelBooking(String id) => '/booking/$id/cancel';
  static String approveBooking(String id) => '/booking/admin/$id/approve';
  static String rejectBooking(String id) => '/booking/admin/$id/reject';

  // Progress
  static const String progress = '/progress';
  static const String myProgress = '/progress/my';

  // Exposure Therapy
  static const String exposure = '/exposure';

  // Reports
  static const String reports = '/reports';

  // Admin
  static const String adminStats = '/admin/stats';
  static const String adminUsers = '/admin/users';
  static const String adminAnalytics = '/admin/analytics';
  static String verifyTherapist(String id) => '/admin/verify-therapist/$id';
  static const String adminBookings = '/booking/admin/all';
  static const String adminEmergencies = '/emergency/admin/all';
}
