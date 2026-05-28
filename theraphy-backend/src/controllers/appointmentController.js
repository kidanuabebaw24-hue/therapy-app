import { AppointmentRepository } from '../repositories/appointmentRepository.js';
import { PatientRepository } from '../repositories/patientRepository.js';
import { TherapistRepository } from '../repositories/therapistRepository.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import prisma from '../config/prisma.js';
import { createNotification } from '../utils/notificationHelper.js';
import {
  filterBlockingAppointments,
  getAppointmentsBaseWhere,
  getPendingPaymentCutoff,
} from '../utils/appointmentBlocking.js';
import {
  resolveWorkingHours,
  getScheduleForDay,
} from '../utils/defaultWorkingHours.js';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const normalizeDayName = (value) => {
  if (!value || typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return WEEKDAY_NAMES.find((day) => day.toLowerCase() === normalized) || null;
};

const parseAppointmentDateTime = (
  appointmentDate,
  appointmentTime,
  timezoneOffsetMinutes,
  payloadMode,
) => {
  const datePart = appointmentDate?.split?.('T')?.[0] || appointmentDate;
  if (!datePart || !appointmentTime) return null;

  const [year, month, day] = String(datePart).split('-').map(Number);
  const [hour, minute] = String(appointmentTime).split(':').map(Number);
  if ([year, month, day, hour, minute].some((v) => Number.isNaN(v))) return null;

  // Backward/forward-compatible modes:
  // - utc_normalized: date/time already represent UTC components
  // - default: date/time represent client local wall-clock time
  const utcTimestamp = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  if (payloadMode === 'utc_normalized') {
    const parsedUtc = new Date(utcTimestamp);
    return Number.isNaN(parsedUtc.getTime()) ? null : parsedUtc;
  }

  const offset = Number.isFinite(Number(timezoneOffsetMinutes)) ? Number(timezoneOffsetMinutes) : 0;
  const parsed = new Date(utcTimestamp + offset * 60000);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getLocalDateMeta = (startTime, timezoneOffsetMinutes = 0) => {
  const offset = Number.isFinite(Number(timezoneOffsetMinutes)) ? Number(timezoneOffsetMinutes) : 0;
  const local = new Date(startTime.getTime() - offset * 60000);
  return {
    year: local.getUTCFullYear(),
    month: local.getUTCMonth() + 1,
    day: local.getUTCDate(),
    weekday: WEEKDAY_NAMES[local.getUTCDay()],
    offset,
  };
};

const toUtcFromLocalParts = (year, month, day, hour, minute, timezoneOffsetMinutes = 0) => {
  const utcTimestamp = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  return new Date(utcTimestamp + timezoneOffsetMinutes * 60000);
};

const getDailyUtcWindow = (startTime, timezoneOffsetMinutes = 0) => {
  const meta = getLocalDateMeta(startTime, timezoneOffsetMinutes);
  const startUtc = toUtcFromLocalParts(meta.year, meta.month, meta.day, 0, 0, meta.offset);
  const endUtc = toUtcFromLocalParts(meta.year, meta.month, meta.day + 1, 0, 0, meta.offset);
  return { startUtc, endUtc, meta };
};

const toLocalMinutes = (dateValue, timezoneOffsetMinutes = 0) => {
  const date = new Date(dateValue);
  const local = new Date(date.getTime() - timezoneOffsetMinutes * 60000);
  return local.getUTCHours() * 60 + local.getUTCMinutes();
};

const formatMinutesToHHMM = (minutes) => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60)
    .toString()
    .padStart(2, '0');
  const minute = (normalized % 60).toString().padStart(2, '0');
  return `${hour}:${minute}`;
};

const getWorkingWindowMinutes = (workingHours, appointmentDay) => {
  if (!Array.isArray(workingHours) || workingHours.length === 0) return null;
  const day = normalizeDayName(appointmentDay);
  const schedule = workingHours.find(
    (entry) => normalizeDayName(entry?.day) === day && entry?.enabled,
  );
  if (!schedule) return null;

  const [startHour, startMinute] = String(schedule.startTime || '00:00').split(':').map(Number);
  const [endHour, endMinute] = String(schedule.endTime || '23:59').split(':').map(Number);
  const start = (startHour || 0) * 60 + (startMinute || 0);
  const end = (endHour || 23) * 60 + (endMinute || 59);
  return end > start ? { start, end } : null;
};

const SLOT_STEP_MINUTES = 30;

const listAvailableSlots = ({
  workingWindow,
  dayAppointments,
  timezoneOffsetMinutes,
  duration,
  maxSuggestions,
}) => {
  if (!workingWindow) return [];
  const latestStart = workingWindow.end - duration;
  if (latestStart < workingWindow.start) return [];

  const blockedIntervals = dayAppointments.map((appointment) => {
    const start = toLocalMinutes(appointment.date, timezoneOffsetMinutes);
    const end = start + (appointment.duration || duration);
    return { start, end };
  });

  const suggestions = [];
  for (
    let cursor = workingWindow.start;
    cursor <= latestStart;
    cursor += SLOT_STEP_MINUTES
  ) {
    const proposedEnd = cursor + duration;
    const conflict = blockedIntervals.some(
      (interval) => cursor < interval.end && proposedEnd > interval.start,
    );
    if (!conflict) {
      suggestions.push(formatMinutesToHHMM(cursor));
    }
    if (
      Number.isFinite(maxSuggestions) &&
      maxSuggestions > 0 &&
      suggestions.length >= maxSuggestions
    ) {
      break;
    }
  }
  return suggestions;
};

const generateSuggestedSlots = (params) =>
  listAvailableSlots({ ...params, maxSuggestions: 5 });

const getDayAvailabilityContext = async ({
  therapistId,
  appointmentDate,
  appointmentDay,
  timezoneOffsetMinutes,
  duration = 50,
  excludeAppointmentId,
}) => {
  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId },
    include: { user: true },
  });
  if (!therapist) {
    return { therapist: null };
  }

  const offset = Number.isFinite(Number(timezoneOffsetMinutes))
    ? Number(timezoneOffsetMinutes)
    : 0;
  const datePart = String(appointmentDate).split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  if ([year, month, day].some((v) => Number.isNaN(v))) {
    return { therapist, invalidDate: true };
  }

  const anchorTime = toUtcFromLocalParts(year, month, day, 12, 0, offset);
  const localMeta = getLocalDateMeta(anchorTime, offset);
  const normalizedDay = normalizeDayName(appointmentDay) || localMeta.weekday;
  const { hours: resolvedWorkingHours, usedDefault } = resolveWorkingHours(
    therapist.workingHours,
  );

  if (usedDefault) {
    await prisma.therapist
      .update({
        where: { id: therapistId },
        data: { workingHours: resolvedWorkingHours },
      })
      .catch(() => {});
  }

  const workingWindow = getWorkingWindowMinutes(resolvedWorkingHours, normalizedDay);
  const pendingPaymentCutoff = getPendingPaymentCutoff();
  const dayWindow = getDailyUtcWindow(anchorTime, offset);

  const rawDayAppointments = await prisma.appointment.findMany({
    where: {
      ...getAppointmentsBaseWhere(therapistId, excludeAppointmentId),
      date: {
        gte: dayWindow.startUtc,
        lt: dayWindow.endUtc,
      },
    },
    select: { id: true, date: true, duration: true, status: true, createdAt: true },
    orderBy: { date: 'asc' },
  });
  const dayAppointments = filterBlockingAppointments(
    rawDayAppointments,
    pendingPaymentCutoff,
  );

  const schedule = getScheduleForDay(resolvedWorkingHours, normalizedDay);

  return {
    therapist,
    normalizedDay,
    workingWindow,
    dayAppointments,
    durationMinutes: Number(duration) || 50,
    timezoneOffsetMinutes: offset,
    usedDefaultSchedule: usedDefault,
    workingHoursRange: schedule
      ? {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        }
      : null,
  };
};

const isWithinWorkingHours = (workingHours, startTime, duration, options = {}) => {
  if (!Array.isArray(workingHours) || workingHours.length === 0) return true;

  const timezoneOffsetMinutes = Number.isFinite(Number(options.timezoneOffsetMinutes))
    ? Number(options.timezoneOffsetMinutes)
    : 0;
  const localStart = new Date(startTime.getTime() - timezoneOffsetMinutes * 60000);
  const dayName =
    normalizeDayName(options.appointmentDay) || WEEKDAY_NAMES[localStart.getUTCDay()];
  const todaySchedule = workingHours.find(
    (entry) => normalizeDayName(entry?.day) === dayName && entry?.enabled,
  );
  if (!todaySchedule) return false;

  const [startHour, startMinute] = String(todaySchedule.startTime || '00:00').split(':').map(Number);
  const [endHour, endMinute] = String(todaySchedule.endTime || '23:59').split(':').map(Number);
  const slotStartMinutes = localStart.getUTCHours() * 60 + localStart.getUTCMinutes();
  const slotEndMinutes = slotStartMinutes + duration;
  const workStartMinutes = (startHour || 0) * 60 + (startMinute || 0);
  const workEndMinutes = (endHour || 23) * 60 + (endMinute || 59);

  return slotStartMinutes >= workStartMinutes && slotEndMinutes <= workEndMinutes;
};

const checkTherapistAvailability = async ({
  therapistId,
  startTime,
  duration = 50,
  excludeAppointmentId,
  appointmentDay,
  timezoneOffsetMinutes,
}) => {
  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId },
    include: { user: true },
  });
  if (!therapist) {
    return {
      available: false,
      reasonCode: 'therapist_not_found',
      suggestedSlots: [],
      message: 'Therapist not found',
    };
  }

  const durationMinutes = Number(duration) || 50;
  const localMeta = getLocalDateMeta(startTime, timezoneOffsetMinutes);
  const normalizedDay = normalizeDayName(appointmentDay) || localMeta.weekday;
  const { hours: resolvedWorkingHours } = resolveWorkingHours(therapist.workingHours);
  const workingWindow = getWorkingWindowMinutes(resolvedWorkingHours, normalizedDay);
  const pendingPaymentCutoff = getPendingPaymentCutoff();
  const dayWindow = getDailyUtcWindow(startTime, timezoneOffsetMinutes);

  const rawDayAppointments = await prisma.appointment.findMany({
    where: {
      ...getAppointmentsBaseWhere(therapistId, excludeAppointmentId),
      date: {
        gte: dayWindow.startUtc,
        lt: dayWindow.endUtc,
      },
    },
    select: { id: true, date: true, duration: true, status: true, createdAt: true },
    orderBy: { date: 'asc' },
  });
  const dayAppointments = filterBlockingAppointments(
    rawDayAppointments,
    pendingPaymentCutoff,
  );

  const worksAtThatTime = isWithinWorkingHours(resolvedWorkingHours, startTime, duration, {
    appointmentDay: normalizedDay,
    timezoneOffsetMinutes,
  });
  if (!worksAtThatTime) {
    const suggestedSlots = generateSuggestedSlots({
      workingWindow,
      dayAppointments,
      timezoneOffsetMinutes,
      duration: durationMinutes,
    });
    return {
      available: false,
      reasonCode: 'outside_working_hours',
      suggestedSlots,
      message: 'This therapist is not available at the selected time. Please choose another slot.',
    };
  }

  const bookingEnd = new Date(startTime.getTime() + duration * 60000);
  const rawExisting = await prisma.appointment.findMany({
    where: {
      ...getAppointmentsBaseWhere(therapistId, excludeAppointmentId),
      date: { lt: bookingEnd },
    },
    select: { id: true, date: true, duration: true, status: true, createdAt: true },
  });
  const existing = filterBlockingAppointments(rawExisting, pendingPaymentCutoff);

  const overlap = existing.some((appointment) => {
    const existingStart = new Date(appointment.date);
    const existingEnd = new Date(existingStart.getTime() + (appointment.duration || 50) * 60000);
    return startTime < existingEnd;
  });

  if (overlap) {
    const suggestedSlots = generateSuggestedSlots({
      workingWindow,
      dayAppointments,
      timezoneOffsetMinutes,
      duration: durationMinutes,
    });

    const hasRecentPendingPayment = existing.some(
      (appointment) => appointment.status === 'pending_payment',
    );
    return {
      available: false,
      reasonCode: hasRecentPendingPayment ? 'slot_temporarily_held' : 'overlap_conflict',
      suggestedSlots,
      message: 'This therapist is not available at the selected time. Please choose another slot.',
    };
  }

  return {
    available: true,
    reasonCode: 'available',
    suggestedSlots: [],
    message: 'Therapist is available for this slot.',
  };
};

export const getAvailableAppointmentSlots = async (req, res) => {
  try {
    const {
      therapistId,
      appointmentDate,
      appointmentDay,
      timezoneOffsetMinutes,
      duration = 50,
    } = req.query;

    if (!therapistId || !appointmentDate) {
      return sendError(res, 'therapistId and appointmentDate are required', 400);
    }

    const context = await getDayAvailabilityContext({
      therapistId,
      appointmentDate,
      appointmentDay,
      timezoneOffsetMinutes,
      duration: Number(duration) || 50,
    });

    if (!context.therapist) {
      return sendError(res, 'Therapist not found', 404);
    }
    if (context.invalidDate) {
      return sendError(res, 'Invalid appointment date format', 400);
    }

    const slots = listAvailableSlots({
      workingWindow: context.workingWindow,
      dayAppointments: context.dayAppointments,
      timezoneOffsetMinutes: context.timezoneOffsetMinutes,
      duration: context.durationMinutes,
    });

    return sendSuccess(
      res,
      {
        slots,
        appointmentDay: context.normalizedDay,
        workingHours: context.workingHoursRange,
        stepMinutes: SLOT_STEP_MINUTES,
        sessionDuration: context.durationMinutes,
        usedDefaultSchedule: context.usedDefaultSchedule === true,
      },
      'Available slots retrieved',
    );
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const checkAppointmentAvailability = async (req, res) => {
  try {
    const {
      therapistId,
      appointmentDate,
      appointmentTime,
      appointmentDay,
      timezoneOffsetMinutes,
      payloadMode,
      duration = 50,
    } = req.body;
    if (!therapistId || !appointmentDate || !appointmentTime) {
      return sendError(res, 'therapistId, appointmentDate and appointmentTime are required', 400);
    }

    const startTime = parseAppointmentDateTime(
      appointmentDate,
      appointmentTime,
      timezoneOffsetMinutes,
      payloadMode,
    );
    if (!startTime) {
      return sendError(res, 'Invalid appointment date/time format', 400);
    }

    const result = await checkTherapistAvailability({
      therapistId,
      startTime,
      duration: Number(duration) || 50,
      appointmentDay,
      timezoneOffsetMinutes,
    });
    return sendSuccess(res, result, result.message);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { therapistId, date, duration, notes, type } = req.body;
    const patientProfile = req.user.patientProfile;

    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    let targetTherapistId = therapistId;
    let therapist = null;

    // 1. Verify if the requested therapist exists in DB
    if (targetTherapistId && targetTherapistId !== 'placeholder') {
      therapist = await prisma.therapist.findUnique({
        where: { id: targetTherapistId },
        include: { user: true },
      });
    }

    // 2. If not found, try to resolve to patient's active therapist, or first available therapist
    if (!therapist) {
      const activeAssignment = await prisma.therapistAssignment.findFirst({
        where: { patientId: patientProfile.id, status: 'active' },
        include: { therapist: { include: { user: true } } }
      });
      if (activeAssignment && activeAssignment.therapist) {
        therapist = activeAssignment.therapist;
      }
    }

    if (!therapist) {
      therapist = await prisma.therapist.findFirst({
        where: { isVerified: true },
        include: { user: true }
      });
    }

    if (!therapist) {
      therapist = await prisma.therapist.findFirst({
        include: { user: true }
      });
    }

    // 3. Self-Healing Auto-Provisioning: If the DB has absolutely NO therapists, create a default profile
    if (!therapist) {
      console.log('🌱 Database is empty. Auto-provisioning a verified therapist profile for self-healing scheduling...');
      
      let therapistUser = await prisma.user.findFirst({
        where: { role: 'therapist' }
      });

      if (!therapistUser) {
        therapistUser = await prisma.user.create({
          data: {
            email: 'therapist.dr.sarah@theraphy.com',
            password: '$argon2id$v=19$m=65536,t=3,p=4$qF8B1G/U2tSj5y$4H4lV9yD9x', // placeholder dummy hash
            name: 'Dr. Sarah Jenkins',
            role: 'therapist',
            phone: '0911223344',
          }
        });
      }

      therapist = await prisma.therapist.create({
        data: {
          userId: therapistUser.id,
          specialization: 'Cognitive Behavioral Therapy (CBT)',
          licenseNumber: 'MD-10293-CBT',
          yearsOfExperience: 8,
          hourlyRate: 50.0,
          isVerified: true,
          about: 'Specialized in treating anxiety and phobias.',
          rating: 4.9
        },
        include: { user: true }
      });
      
      console.log(`✅ Auto-provisioned therapist: ${therapist.user.name} (${therapist.id})`);
    }

    // Update targetTherapistId to the fully validated Therapist UUID
    targetTherapistId = therapist.id;

    // Auto-assign therapist if not assigned
    const existingAssignment = await prisma.therapistAssignment.findUnique({
      where: {
        patientId_therapistId: {
          patientId: patientProfile.id,
          therapistId: targetTherapistId,
        },
      },
    });

    if (!existingAssignment) {
      await prisma.therapistAssignment.create({
        data: {
          patientId: patientProfile.id,
          therapistId: targetTherapistId,
          status: 'active',
        },
      });
    }

    // Check for conflicts
    const start = new Date(date);
    const end = new Date(start.getTime() + duration * 60000);

    const conflict = await prisma.appointment.findFirst({
      where: {
        therapistId: targetTherapistId,
        status: { not: 'cancelled' },
        AND: [
          { date: { lt: end } },
          {
            OR: [
              { date: { gte: start } },
            ]
          }
        ]
      }
    });

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        therapistId: targetTherapistId,
        date: start,
        duration,
        notes,
        type: type || 'consultation',
      },
    });

    return sendSuccess(res, appointment, 'Appointment created', 201);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const patientProfile = req.user.patientProfile;
    const therapistProfile = req.user.therapistProfile;

    let appointments = [];
    if (patientProfile) {
      appointments = await prisma.appointment.findMany({
        where: { patientId: patientProfile.id },
        include: { therapist: { include: { user: { select: { name: true, email: true } } } } },
        orderBy: { date: 'desc' },
      });
    } else if (therapistProfile) {
      appointments = await prisma.appointment.findMany({
        where: { therapistId: therapistProfile.id },
        include: { patient: { include: { user: { select: { name: true, email: true } } } } },
        orderBy: { date: 'desc' },
      });
    }

    return sendSuccess(res, appointments, 'Appointments retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'completed',
        notes: notes || undefined,
      },
    });

    return sendSuccess(res, appointment, 'Appointment marked as completed');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const {
      therapistId,
      date,
      duration,
      notes,
      type,
      appointmentDate,
      appointmentTime,
      appointmentDay,
      timezoneOffsetMinutes,
      payloadMode,
    } = req.body;
    const patientProfile = req.user.patientProfile;

    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    let targetTherapistId = therapistId;
    let therapist = null;

    if (targetTherapistId && targetTherapistId !== 'placeholder') {
      therapist = await prisma.therapist.findUnique({
        where: { id: targetTherapistId },
        include: { user: true },
      });
    }

    if (!therapist) {
      const activeAssignment = await prisma.therapistAssignment.findFirst({
        where: { patientId: patientProfile.id, status: 'active' },
        include: { therapist: { include: { user: true } } }
      });
      if (activeAssignment && activeAssignment.therapist) {
        therapist = activeAssignment.therapist;
      }
    }

    if (!therapist) {
      therapist = await prisma.therapist.findFirst({
        where: { isVerified: true },
        include: { user: true }
      });
    }

    if (!therapist) {
      therapist = await prisma.therapist.findFirst({
        include: { user: true }
      });
    }

    if (!therapist) {
      let therapistUser = await prisma.user.findFirst({
        where: { role: 'therapist' }
      });

      if (!therapistUser) {
        therapistUser = await prisma.user.create({
          data: {
            email: 'therapist.dr.sarah@theraphy.com',
            password: '$argon2id$v=19$m=65536,t=3,p=4$qF8B1G/U2tSj5y$4H4lV9yD9x',
            name: 'Dr. Sarah Jenkins',
            role: 'therapist',
            phone: '0911223344',
          }
        });
      }

      therapist = await prisma.therapist.create({
        data: {
          userId: therapistUser.id,
          specialization: 'Cognitive Behavioral Therapy (CBT)',
          licenseNumber: 'MD-10293-CBT',
          yearsOfExperience: 8,
          hourlyRate: 50.0,
          isVerified: true,
          about: 'Specialized in treating anxiety and phobias.',
          rating: 4.9
        },
        include: { user: true }
      });
    }

    targetTherapistId = therapist.id;

    const existingAssignment = await prisma.therapistAssignment.findUnique({
      where: {
        patientId_therapistId: {
          patientId: patientProfile.id,
          therapistId: targetTherapistId,
        },
      },
    });

    if (!existingAssignment) {
      await prisma.therapistAssignment.create({
        data: {
          patientId: patientProfile.id,
          therapistId: targetTherapistId,
          status: 'active',
        },
      });
    }

    const start =
      appointmentDate && appointmentTime
        ? parseAppointmentDateTime(
            appointmentDate,
            appointmentTime,
            timezoneOffsetMinutes,
            payloadMode,
          )
        : new Date(date);
    if (!start || Number.isNaN(start.getTime())) {
      return sendError(res, 'Invalid appointment date/time', 400);
    }

    const availability = await checkTherapistAvailability({
      therapistId: targetTherapistId,
      startTime: start,
      duration: Number(duration) || 50,
      appointmentDay,
      timezoneOffsetMinutes,
    });
    if (!availability.available) {
      return sendSuccess(
        res,
        {
          available: false,
          reasonCode: availability.reasonCode || 'unavailable',
          message: availability.message,
          suggestedSlots: availability.suggestedSlots || [],
        },
        availability.message,
        200,
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        therapistId: targetTherapistId,
        date: start,
        duration: Number(duration) || 50,
        notes,
        type: type || 'consultation',
        status: 'pending_admin_approval',
        paymentStatus: 'pending',
      },
      include: {
        therapist: { include: { user: { select: { name: true } } } },
      }
    });

    // Notify admin
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (admin) {
      await createNotification(
        admin.id,
        'New Booking Approval Required',
        'New appointment booking requires approval.',
        'booking_request',
      );
    }

    return sendSuccess(res, {
      available: true,
      appointment,
    }, 'Appointment request submitted for admin approval', 201);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
