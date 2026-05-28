/// Represents an Appointment from the PostgreSQL/Prisma backend.
/// Backend route: /api/appointments
class SessionModel {
  final String id;
  final String patientId;
  final String therapistId;
  final String? patientName;
  final String? therapistName;
  final String? therapistSpecialization;
  final double? therapistHourlyRate;
  final DateTime date;
  final int duration;
  final String type; // cbt | exposure | consultation | followup
  final String
      status; // pending_payment | pending_admin_approval | approved | rejected | scheduled | completed | cancelled | no_show
  final String paymentStatus; // pending | paid | refunded
  final String? notes;
  final DateTime createdAt;

  const SessionModel({
    required this.id,
    required this.patientId,
    required this.therapistId,
    this.patientName,
    this.therapistName,
    this.therapistSpecialization,
    this.therapistHourlyRate,
    required this.date,
    required this.duration,
    required this.type,
    required this.status,
    required this.paymentStatus,
    this.notes,
    required this.createdAt,
  });

  bool get isScheduled => status == 'scheduled';
  bool get isCompleted => status == 'completed';
  bool get isCancelled =>
      status == 'cancelled' || status == 'no_show';
  bool get isPending =>
      status == 'pending' ||
      status == 'pending_admin_approval' ||
      status == 'pending_payment';
  bool get isPendingPayment => status == 'pending_payment';
  bool get isPendingAdminApproval => status == 'pending_admin_approval';
  bool get isApproved => status == 'approved';
  bool get isRejected => status == 'rejected';
  bool get isPaid => paymentStatus == 'paid';
  bool get needsPayment => isApproved && !isPaid;

  factory SessionModel.fromJson(Map<String, dynamic> json) {
    final patientRaw = json['patient'];
    final therapistRaw = json['therapist'];

    // Safely extract nested map values
    String resolveId(dynamic raw, String fallbackKey) {
      if (raw is Map<String, dynamic>) return raw['id'] as String? ?? '';
      return json[fallbackKey] as String? ?? '';
    }

    String? resolveName(dynamic raw) {
      if (raw is! Map<String, dynamic>) return null;
      final user = raw['user'];
      if (user is Map<String, dynamic>) return user['name'] as String?;
      return raw['name'] as String?;
    }

    double? resolveHourlyRate(dynamic raw) {
      if (raw is! Map<String, dynamic>) return null;
      final rate = raw['hourlyRate'];
      if (rate is num) return rate.toDouble();
      return null;
    }

    String? resolveSpecialization(dynamic raw) {
      if (raw is! Map<String, dynamic>) return null;
      return raw['specialization'] as String?;
    }

    return SessionModel(
      id: json['id'] as String? ?? '',
      patientId: resolveId(patientRaw, 'patientId'),
      therapistId: resolveId(therapistRaw, 'therapistId'),
      patientName: resolveName(patientRaw),
      therapistName: resolveName(therapistRaw),
      therapistSpecialization: resolveSpecialization(therapistRaw),
      therapistHourlyRate: resolveHourlyRate(therapistRaw),
      date: DateTime.parse(json['date'] as String),
      duration: json['duration'] as int? ?? 60,
      type: json['type'] as String? ?? 'consultation',
      status: json['status'] as String? ?? 'scheduled',
      paymentStatus: json['paymentStatus'] as String? ?? 'pending',
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(
          json['createdAt'] as String? ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'patientId': patientId,
        'therapistId': therapistId,
        'date': date.toIso8601String(),
        'duration': duration,
        'type': type,
        'status': status,
        'paymentStatus': paymentStatus,
        'notes': notes,
        'createdAt': createdAt.toIso8601String(),
      };
}
