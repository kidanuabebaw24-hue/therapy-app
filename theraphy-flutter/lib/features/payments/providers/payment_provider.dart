import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/booking_payment_model.dart';
import '../services/mock_payment_service.dart';
import '../../../../models/therapist_model.dart';
import '../../../../models/session_model.dart';
import '../../auth/presentation/providers/auth_provider.dart';
import '../../../../core/network/network_providers.dart';
import '../../../../core/network/api_constants.dart';
import '../../../../core/utils/slot_time_utils.dart';
import '../../appointments/presentation/providers/session_provider.dart';

class PaymentState {
  final BookingPaymentModel? currentBooking;
  final bool isProcessing;
  final bool isSubmittingBooking;
  final bool isCheckingAvailability;
  final String? error;
  final String? lastTransactionId;
  final String? txRef;
  final String? chapaCheckoutUrl;
  final bool isVerified;
  final bool isAvailable;
  final String? availabilityMessage;
  final String? availabilityReasonCode;
  final List<String> suggestedSlots;

  const PaymentState({
    this.currentBooking,
    this.isProcessing = false,
    this.isSubmittingBooking = false,
    this.isCheckingAvailability = false,
    this.error,
    this.lastTransactionId,
    this.txRef,
    this.chapaCheckoutUrl,
    this.isVerified = false,
    this.isAvailable = false,
    this.availabilityMessage,
    this.availabilityReasonCode,
    this.suggestedSlots = const [],
  });

  PaymentState copyWith({
    BookingPaymentModel? currentBooking,
    bool? isProcessing,
    bool? isSubmittingBooking,
    bool? isCheckingAvailability,
    String? error,
    String? lastTransactionId,
    String? txRef,
    String? chapaCheckoutUrl,
    bool? isVerified,
    bool? isAvailable,
    String? availabilityMessage,
    String? availabilityReasonCode,
    List<String>? suggestedSlots,
  }) {
    return PaymentState(
      currentBooking: currentBooking ?? this.currentBooking,
      isProcessing: isProcessing ?? this.isProcessing,
      isSubmittingBooking: isSubmittingBooking ?? this.isSubmittingBooking,
      isCheckingAvailability:
          isCheckingAvailability ?? this.isCheckingAvailability,
      error: error,
      lastTransactionId: lastTransactionId ?? this.lastTransactionId,
      txRef: txRef ?? this.txRef,
      chapaCheckoutUrl: chapaCheckoutUrl ?? this.chapaCheckoutUrl,
      isVerified: isVerified ?? this.isVerified,
      isAvailable: isAvailable ?? this.isAvailable,
      availabilityMessage: availabilityMessage,
      availabilityReasonCode: availabilityReasonCode,
      suggestedSlots: suggestedSlots ?? this.suggestedSlots,
    );
  }
}

class PaymentNotifier extends StateNotifier<PaymentState> {
  final MockPaymentService _paymentService = MockPaymentService();
  final Ref _ref;

  PaymentNotifier(this._ref) : super(const PaymentState());

  /// Submits booking to backend; stays pending until admin approves.
  Future<bool> submitBookingRequest({
    required TherapistModel therapist,
    required DateTime date,
    required String timeSlot,
    int duration = 50,
  }) async {
    state = state.copyWith(isSubmittingBooking: true, error: null);

    try {
      final apiClient = _ref.read(apiClientProvider);
      final datePart = SlotTimeUtils.formatDatePart(date);
      final timePart = SlotTimeUtils.toBackendTime(timeSlot);
      final dayName = SlotTimeUtils.weekdayName(date.weekday);
      final timezoneOffsetMinutes = DateTime(
        date.year,
        date.month,
        date.day,
      ).timeZoneOffset.inMinutes;

      final response = await apiClient.post(
        ApiConstants.bookAppointment,
        data: {
          'therapistId': therapist.id,
          'appointmentDate': datePart,
          'appointmentTime': timePart,
          'appointmentDay': dayName,
          'timezoneOffsetMinutes': timezoneOffsetMinutes,
          'duration': duration,
          'notes': 'Booked via mobile app',
          'type': 'consultation',
        },
      );

      final payload = response.data['data'] ?? response.data;
      final appointment = payload['appointment'] ?? payload;
      final appointmentId = appointment['id']?.toString();

      final authState = _ref.read(authProvider);
      final patientName = authState.user?.name ?? 'Valued Client';

      final booking = BookingPaymentModel(
        appointmentId: appointmentId,
        therapistId: therapist.id,
        therapistName: therapist.name,
        therapistImageUrl: therapist.imageUrl,
        therapistSpecialization: therapist.specialization,
        patientName: patientName,
        appointmentDate: date,
        appointmentTime: timeSlot,
        paymentMethod: '',
        paymentStatus: 'pending',
        transactionId: appointmentId ?? '',
        amount: therapist.hourlyRate,
        bookingStatus: 'pending_admin_approval',
      );

      state = state.copyWith(
        isSubmittingBooking: false,
        currentBooking: booking,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isSubmittingBooking: false,
        error: e.toString().replaceAll('Exception:', '').trim(),
      );
      return false;
    }
  }

  /// Loads an admin-approved appointment for payment (from sessions list).
  void loadBookingForPayment({
    required SessionModel session,
    String therapistImageUrl = '',
    double hourlyRate = 50.0,
    String therapistSpecialization = 'Consultation',
  }) {
    final authState = _ref.read(authProvider);
    final patientName = authState.user?.name ?? 'Valued Client';
    final localDate = DateTime(
      session.date.year,
      session.date.month,
      session.date.day,
    );
    final timeLabel = DateFormat('h:mm a').format(session.date);

    final booking = BookingPaymentModel(
      appointmentId: session.id,
      therapistId: session.therapistId,
      therapistName: session.therapistName ?? 'Therapist',
      therapistImageUrl: therapistImageUrl,
      therapistSpecialization: therapistSpecialization,
      patientName: patientName,
      appointmentDate: localDate,
      appointmentTime: timeLabel,
      paymentMethod: '',
      paymentStatus: session.paymentStatus,
      transactionId: session.id,
      amount: hourlyRate > 0 ? hourlyRate : 50.0,
      bookingStatus: 'approved',
    );

    state = PaymentState(currentBooking: booking);
  }

  /// Refresh booking from server after admin approval (e.g. from confirmation screen).
  Future<bool> syncApprovedBookingFromServer() async {
    final current = state.currentBooking;
    if (current?.appointmentId == null || current!.appointmentId!.isEmpty) {
      return false;
    }

    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get(ApiConstants.myAppointments);
      final body = response.data;
      final data = body is Map ? body['data'] : body;
      final List<dynamic> raw =
          data is List ? data : (data is Map ? (data['appointments'] as List? ?? []) : []);

      final match = raw.cast<Map>().firstWhere(
            (e) => e['id']?.toString() == current.appointmentId,
            orElse: () => <String, dynamic>{},
          );

      if (match.isEmpty) return false;

      final session = SessionModel.fromJson(Map<String, dynamic>.from(match));
      if (!session.isApproved || session.isPaid) return false;

      loadBookingForPayment(
        session: session,
        hourlyRate: session.therapistHourlyRate ?? current.amount,
        therapistSpecialization:
            session.therapistSpecialization ?? current.therapistSpecialization,
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> checkTherapistAvailability({
    required String therapistId,
    required DateTime date,
    required String timeSlot,
    int duration = 50,
  }) async {
    state = state.copyWith(
      isCheckingAvailability: true,
      error: null,
      availabilityMessage: null,
      availabilityReasonCode: null,
      suggestedSlots: const [],
      isAvailable: false,
    );

    try {
      final apiClient = _ref.read(apiClientProvider);
      final datePart = SlotTimeUtils.formatDatePart(date);
      final timePart = SlotTimeUtils.toBackendTime(timeSlot);
      final dayName = SlotTimeUtils.weekdayName(date.weekday);
      final timezoneOffsetMinutes = DateTime(
        date.year,
        date.month,
        date.day,
      ).timeZoneOffset.inMinutes;

      final response =
          await apiClient.post('/appointments/check-availability', data: {
        'therapistId': therapistId,
        'appointmentDate': datePart,
        'appointmentTime': timePart,
        'appointmentDay': dayName,
        'timezoneOffsetMinutes': timezoneOffsetMinutes,
        'duration': duration,
      });

      final payload = response.data['data'] ?? {};
      final available = payload['available'] == true;
      final reasonCode = payload['reasonCode']?.toString();
      final suggestionsRaw = (payload['suggestedSlots'] as List? ?? const [])
          .map((item) => item.toString())
          .toList();
      final suggestedSlots =
          suggestionsRaw.map((s) => SlotTimeUtils.toBackendTime(s)).toList();
      final message = (payload['message'] as String?) ??
          (available
              ? 'Therapist is available for this time slot.'
              : 'This therapist is not available at the selected time. Please choose another slot.');

      state = state.copyWith(
        isCheckingAvailability: false,
        isAvailable: available,
        availabilityMessage: message,
        availabilityReasonCode: reasonCode,
        suggestedSlots: suggestedSlots,
      );
      return available;
    } catch (e) {
      state = state.copyWith(
        isCheckingAvailability: false,
        isAvailable: false,
        availabilityMessage:
            'This therapist is not available at the selected time. Please choose another slot.',
        availabilityReasonCode: null,
        suggestedSlots: const [],
        error: e.toString(),
      );
      return false;
    }
  }

  void selectPaymentMethod(String method) {
    if (state.currentBooking != null) {
      state = state.copyWith(
        currentBooking: state.currentBooking!.copyWith(
          paymentMethod: method,
        ),
      );
    }
  }

  void clearAvailabilityFeedback() {
    state = state.copyWith(
      availabilityMessage: null,
      availabilityReasonCode: null,
      suggestedSlots: const [],
      isAvailable: false,
      error: null,
    );
  }

  /// Helper to parse timeSlot (e.g. "10:00 AM", "02:30 PM")
  /// and combine with DateTime date.
  DateTime combineDateAndTime(DateTime date, String timeSlot) {
    try {
      final backendTime = SlotTimeUtils.toBackendTime(timeSlot);
      final timeParts = backendTime.split(':');
      final hour = int.parse(timeParts[0]);
      final minute = int.parse(timeParts[1]);
      return DateTime(date.year, date.month, date.day, hour, minute);
    } catch (e) {
      return date;
    }
  }

  Future<bool> executeCardPayment({
    required String cardHolder,
    required String cardNumber,
  }) async {
    if (state.currentBooking == null) return false;

    state = state.copyWith(isProcessing: true, error: null);

    final booking = state.currentBooking!;
    final appointmentId = booking.appointmentId;

    // Pay for admin-approved appointment via backend (not mock-only).
    if (appointmentId != null &&
        appointmentId.isNotEmpty &&
        booking.bookingStatus == 'approved') {
      try {
        final apiClient = _ref.read(apiClientProvider);
        final response = await apiClient.post(
          '/payments',
          data: {
            'appointmentId': appointmentId,
            'amount': booking.amount,
            'paymentMethod': 'card',
            'transactionId': 'card-${DateTime.now().millisecondsSinceEpoch}',
          },
        );
        final payload = response.data['data'] ?? response.data;
        final txId = payload['transactionId']?.toString() ??
            payload['id']?.toString() ??
            'card-paid';

        state = state.copyWith(
          isProcessing: false,
          lastTransactionId: txId,
          currentBooking: booking.copyWith(
            paymentStatus: 'paid',
            bookingStatus: 'scheduled',
            transactionId: txId,
            paymentMethod: 'card',
          ),
        );
        try {
          await _ref.read(sessionProvider.notifier).fetchSessions();
        } catch (_) {}
        return true;
      } catch (e) {
        state = state.copyWith(
          isProcessing: false,
          error: e.toString().replaceAll('Exception:', '').trim(),
          currentBooking: booking.copyWith(paymentStatus: 'failed'),
        );
        return false;
      }
    }

    final result = await _paymentService.processPayment(
      cardHolder: cardHolder,
      cardNumber: cardNumber,
      paymentMethod: booking.paymentMethod,
      amount: booking.amount,
    );

    if (result.success) {
      state = state.copyWith(
        isProcessing: false,
        lastTransactionId: result.transactionId,
        currentBooking: booking.copyWith(
          paymentStatus: 'paid',
          bookingStatus: 'scheduled',
          transactionId: result.transactionId,
        ),
      );
      return true;
    }

    state = state.copyWith(
      isProcessing: false,
      error: result.errorMessage,
      currentBooking: booking.copyWith(paymentStatus: 'failed'),
    );
    return false;
  }

  Future<bool> executeInstantPayment(String method) async {
    if (state.currentBooking == null) return false;

    state = state.copyWith(isProcessing: true, error: null, isVerified: false);

    // Mock flow for Telebirr / PayPal / etc.
    if (method != 'chapa') {
      await Future.delayed(const Duration(milliseconds: 800));
      final transactionId = 'TXN${DateTime.now().millisecondsSinceEpoch}';
      state = state.copyWith(
        isProcessing: false,
        lastTransactionId: transactionId,
        currentBooking: state.currentBooking!.copyWith(
          paymentStatus: 'paid',
          bookingStatus: 'scheduled',
          paymentMethod: method,
          transactionId: transactionId,
        ),
      );
      return true;
    }

    // Real Chapa Payment Flow
    try {
      final apiClient = _ref.read(apiClientProvider);

      final bookingDate = combineDateAndTime(
        state.currentBooking!.appointmentDate,
        state.currentBooking!.appointmentTime,
      );

      final booking = state.currentBooking!;
      final initPayload = <String, dynamic>{
        'therapistId': booking.therapistId,
        'date': bookingDate.toIso8601String(),
        'duration': 50,
        'notes': 'Booked via Chapa Payment Gateway integration',
        'type': 'consultation',
      };
      if (booking.appointmentId != null && booking.appointmentId!.isNotEmpty) {
        initPayload['appointmentId'] = booking.appointmentId;
      }

      final response =
          await apiClient.post('/payments/chapa/initialize', data: initPayload);

      final resData = response.data['data'];
      final checkoutUrl = resData['checkout_url'] as String;
      final txRef = resData['tx_ref'] as String;

      state = state.copyWith(
        txRef: txRef,
        chapaCheckoutUrl: checkoutUrl,
        currentBooking: state.currentBooking!.copyWith(
          paymentMethod: 'chapa',
        ),
      );

      // Launch secure web browser checkout (direct call with try-catch fallbacks to bypass Android 11+ package visibility)
      final uri = Uri.parse(checkoutUrl);
      bool launched = false;
      try {
        launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      } catch (_) {
        try {
          launched = await launchUrl(uri, mode: LaunchMode.platformDefault);
        } catch (_) {
          launched = false;
        }
      }

      if (launched) {
        state = state.copyWith(isProcessing: false);
        return true;
      } else {
        throw 'Unable to launch browser checkout link automatically. Please try again.';
      }
    } catch (e) {
      state = state.copyWith(
        isProcessing: false,
        error: e.toString().replaceAll('Exception:', '').trim(),
      );
      return false;
    }
  }

  Future<bool> verifyChapaPayment() async {
    final txRef = state.txRef;
    if (txRef == null || state.currentBooking == null) return false;

    state = state.copyWith(isProcessing: true, error: null);

    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get('/payments/chapa/verify/$txRef');

      final resData = response.data['data'];
      final transactionId = resData['transactionId'] as String? ?? txRef;

      state = state.copyWith(
        isProcessing: false,
        isVerified: true,
        lastTransactionId: transactionId,
        currentBooking: state.currentBooking!.copyWith(
          paymentStatus: 'paid',
          bookingStatus: 'scheduled',
          transactionId: transactionId,
        ),
      );
      try {
        await _ref.read(sessionProvider.notifier).fetchSessions();
      } catch (_) {}
      return true;
    } catch (e) {
      state = state.copyWith(
        isProcessing: false,
        error:
            'We couldn\'t verify your payment yet. Please complete checkout on Chapa\'s website first.',
      );
      return false;
    }
  }
}

final paymentProvider =
    StateNotifierProvider<PaymentNotifier, PaymentState>((ref) {
  return PaymentNotifier(ref);
});
