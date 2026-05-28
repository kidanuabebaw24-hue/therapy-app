import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/booking_payment_model.dart';
import '../services/mock_payment_service.dart';
import '../../../../models/therapist_model.dart';
import '../../auth/presentation/providers/auth_provider.dart';
import '../../../../core/network/network_providers.dart';
import '../../../../core/utils/slot_time_utils.dart';

class PaymentState {
  final BookingPaymentModel? currentBooking;
  final bool isProcessing;
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

  void initiateBooking({
    required TherapistModel therapist,
    required DateTime date,
    required String timeSlot,
  }) {
    final authState = _ref.read(authProvider);
    final patientName = authState.user?.name ?? 'Valued Client';

    final amount = therapist.hourlyRate;

    final booking = BookingPaymentModel(
      therapistId: therapist.id,
      therapistName: therapist.name,
      therapistImageUrl: therapist.imageUrl,
      therapistSpecialization: therapist.specialization,
      patientName: patientName,
      appointmentDate: date,
      appointmentTime: timeSlot,
      paymentMethod: '',
      paymentStatus: 'pending',
      transactionId: '',
      amount: amount,
      bookingStatus: 'pending_payment',
    );

    state = PaymentState(currentBooking: booking);
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

    final result = await _paymentService.processPayment(
      cardHolder: cardHolder,
      cardNumber: cardNumber,
      paymentMethod: state.currentBooking!.paymentMethod,
      amount: state.currentBooking!.amount,
    );

    if (result.success) {
      state = state.copyWith(
        isProcessing: false,
        lastTransactionId: result.transactionId,
        currentBooking: state.currentBooking!.copyWith(
          paymentStatus: 'paid',
          bookingStatus: 'pending_admin_approval',
          transactionId: result.transactionId,
        ),
      );
      return true;
    } else {
      state = state.copyWith(
        isProcessing: false,
        error: result.errorMessage,
        currentBooking: state.currentBooking!.copyWith(
          paymentStatus: 'failed',
        ),
      );
      return false;
    }
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
          bookingStatus: 'pending_admin_approval',
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

      final response =
          await apiClient.post('/payments/chapa/initialize', data: {
        'therapistId': state.currentBooking!.therapistId,
        'date': bookingDate.toIso8601String(),
        'duration': 50,
        'notes': 'Booked via Chapa Payment Gateway integration',
        'type': 'consultation',
      });

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
          bookingStatus: 'pending_admin_approval',
          transactionId: transactionId,
        ),
      );
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
