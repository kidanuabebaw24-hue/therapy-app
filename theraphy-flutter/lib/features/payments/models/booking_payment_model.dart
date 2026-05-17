class BookingPaymentModel {
  final String therapistId;
  final String therapistName;
  final String therapistImageUrl;
  final String therapistSpecialization;
  final String patientName;
  final DateTime appointmentDate;
  final String appointmentTime;
  final String paymentMethod;
  final String paymentStatus; // pending | paid | failed
  final String transactionId;
  final double amount;
  final String bookingStatus; // scheduled | completed | cancelled

  const BookingPaymentModel({
    required this.therapistId,
    required this.therapistName,
    required this.therapistImageUrl,
    required this.therapistSpecialization,
    required this.patientName,
    required this.appointmentDate,
    required this.appointmentTime,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.transactionId,
    required this.amount,
    required this.bookingStatus,
  });

  BookingPaymentModel copyWith({
    String? paymentMethod,
    String? paymentStatus,
    String? transactionId,
    String? bookingStatus,
  }) {
    return BookingPaymentModel(
      therapistId: therapistId,
      therapistName: therapistName,
      therapistImageUrl: therapistImageUrl,
      therapistSpecialization: therapistSpecialization,
      patientName: patientName,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      transactionId: transactionId ?? this.transactionId,
      amount: amount,
      bookingStatus: bookingStatus ?? this.bookingStatus,
    );
  }
}
