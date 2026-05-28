import '../../../core/network/api_constants.dart';
import '../../../core/network/network_providers.dart';
import '../../../core/utils/slot_time_utils.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class DaySlotsResult {
  final List<String> slots;
  final String? startTime;
  final String? endTime;
  final String appointmentDay;

  const DaySlotsResult({
    required this.slots,
    this.startTime,
    this.endTime,
    required this.appointmentDay,
  });

  String? get workingHoursLabel {
    if (startTime == null || endTime == null) return null;
    return '$startTime - $endTime';
  }
}

final therapistSlotsServiceProvider = Provider<TherapistSlotsService>((ref) {
  return TherapistSlotsService(ref);
});

class TherapistSlotsService {
  final Ref _ref;

  TherapistSlotsService(this._ref);

  Future<DaySlotsResult> fetchSlots({
    required String therapistId,
    required DateTime date,
    int duration = 50,
  }) async {
    final apiClient = _ref.read(apiClientProvider);
    final appointmentDate = SlotTimeUtils.formatDatePart(date);
    final appointmentDay = SlotTimeUtils.weekdayName(date.weekday);
    final timezoneOffsetMinutes = DateTime(
      date.year,
      date.month,
      date.day,
    ).timeZoneOffset.inMinutes;

    final response = await apiClient.get(
      ApiConstants.availableAppointmentSlots,
      queryParameters: {
        'therapistId': therapistId,
        'appointmentDate': appointmentDate,
        'appointmentDay': appointmentDay,
        'timezoneOffsetMinutes': timezoneOffsetMinutes,
        'duration': duration,
      },
    );

    final payload = response.data['data'] as Map<String, dynamic>? ?? {};
    final rawSlots = (payload['slots'] as List? ?? const [])
        .map((item) => item.toString())
        .toList();
    final workingHours = payload['workingHours'] as Map<String, dynamic>?;

    return DaySlotsResult(
      slots: rawSlots,
      startTime: workingHours?['startTime']?.toString(),
      endTime: workingHours?['endTime']?.toString(),
      appointmentDay: payload['appointmentDay']?.toString() ?? appointmentDay,
    );
  }
}
