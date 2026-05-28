/// Backend uses 24h `HH:mm` (e.g. `09:00`, `13:30`) for appointment times.
class SlotTimeUtils {
  static bool is24HourSlot(String value) {
    final trimmed = value.trim();
    final upper = trimmed.toUpperCase();
    return !upper.contains('AM') && !upper.contains('PM');
  }

  /// Converts display slot to backend `HH:mm`.
  static String toBackendTime(String timeSlot) {
    final trimmed = timeSlot.trim();
    if (is24HourSlot(trimmed)) {
      final parts = trimmed.split(':');
      if (parts.length >= 2) {
        final hour = int.tryParse(parts[0]) ?? 0;
        final minute = int.tryParse(parts[1]) ?? 0;
        return '${hour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')}';
      }
      return trimmed;
    }

    final parts = trimmed.split(' ');
    final timeParts = parts[0].split(':');
    var hour = int.tryParse(timeParts[0]) ?? 0;
    final minute = int.tryParse(timeParts[1]) ?? 0;
    final isPm = parts.length > 1 && parts[1].toLowerCase() == 'pm';

    if (isPm && hour < 12) hour += 12;
    if (!isPm && hour == 12) hour = 0;

    return '${hour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')}';
  }

  static String weekdayName(int weekday) {
    const names = <int, String>{
      DateTime.monday: 'Monday',
      DateTime.tuesday: 'Tuesday',
      DateTime.wednesday: 'Wednesday',
      DateTime.thursday: 'Thursday',
      DateTime.friday: 'Friday',
      DateTime.saturday: 'Saturday',
      DateTime.sunday: 'Sunday',
    };
    return names[weekday] ?? 'Monday';
  }

  static String formatDatePart(DateTime date) {
    return '${date.year.toString().padLeft(4, '0')}-'
        '${date.month.toString().padLeft(2, '0')}-'
        '${date.day.toString().padLeft(2, '0')}';
  }
}
