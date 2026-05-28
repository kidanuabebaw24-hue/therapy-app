export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** Default Mon–Sun 09:00–17:00 for therapists without a schedule (testing + dev). */
export const DEFAULT_TEST_WORKING_HOURS = WEEKDAY_NAMES.map((day) => ({
  day,
  enabled: true,
  startTime: '09:00',
  endTime: '17:00',
}));

const normalizeDayName = (value) => {
  if (!value || typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return WEEKDAY_NAMES.find((day) => day.toLowerCase() === normalized) || null;
};

/**
 * Use therapist workingHours when present; otherwise fall back to test range.
 */
export const resolveWorkingHours = (workingHours) => {
  if (Array.isArray(workingHours) && workingHours.length > 0) {
    const normalized = workingHours.map((entry) => ({
      ...entry,
      day: normalizeDayName(entry?.day) || entry?.day,
    }));
    const hasEnabledDay = normalized.some((entry) => entry?.enabled);
    if (hasEnabledDay) {
      return { hours: normalized, usedDefault: false };
    }
  }

  return { hours: DEFAULT_TEST_WORKING_HOURS, usedDefault: true };
};

export const getScheduleForDay = (workingHours, appointmentDay) => {
  const day = normalizeDayName(appointmentDay);
  return workingHours.find(
    (entry) => normalizeDayName(entry?.day) === day && entry?.enabled,
  );
};
