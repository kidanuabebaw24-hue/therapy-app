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

    final startTime = workingHours?['startTime']?.toString();
    final endTime = workingHours?['endTime']?.toString();
    final slots = rawSlots.isNotEmpty
        ? rawSlots
        : _buildFallbackTestSlots(
            startTime ?? '09:00',
            endTime ?? '17:00',
            duration,
          );

    return DaySlotsResult(
      slots: slots,
      startTime: startTime ?? '09:00',
      endTime: endTime ?? '17:00',
      appointmentDay: payload['appointmentDay']?.toString() ?? appointmentDay,
    );
  }

  /// Mirrors backend 30-minute grid when API returns an empty list.
  List<String> _buildFallbackTestSlots(
    String start,
    String end,
    int durationMinutes,
  ) {
    final startMin = _toMinutes(start);
    final endMin = _toMinutes(end);
    final latestStart = endMin - durationMinutes;
    if (latestStart < startMin) return const [];

    final slots = <String>[];
    for (var cursor = startMin; cursor <= latestStart; cursor += 30) {
      final h = (cursor ~/ 60).toString().padLeft(2, '0');
      final m = (cursor % 60).toString().padLeft(2, '0');
      slots.add('$h:$m');
    }
    return slots;
  }

  int _toMinutes(String hhmm) {
    final parts = hhmm.split(':');
    final hour = int.tryParse(parts[0]) ?? 0;
    final minute = int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0;
    return hour * 60 + minute;
  }
}
