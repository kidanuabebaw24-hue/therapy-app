/** Statuses that never block therapist availability. */
export const NON_BLOCKING_STATUSES = ['cancelled', 'rejected', 'completed', 'no_show'];

/** Statuses that block a slot when active (checked in application code). */
export const BLOCKING_STATUSES = [
  'pending_admin_approval',
  'approved',
  'scheduled',
  'pending',
  'pending_payment',
];

export const PENDING_PAYMENT_HOLD_MINUTES = 15;

export const isBlockingAppointment = (appointment, pendingPaymentCutoff) => {
  const status = String(appointment?.status || '');

  if (['pending_admin_approval', 'approved', 'scheduled', 'pending'].includes(status)) {
    return true;
  }

  if (status === 'pending_payment') {
    const createdAt = appointment?.createdAt ? new Date(appointment.createdAt) : null;
    return Boolean(createdAt && createdAt >= pendingPaymentCutoff);
  }

  return false;
};

export const filterBlockingAppointments = (appointments, pendingPaymentCutoff) =>
  (appointments || []).filter((appointment) =>
    isBlockingAppointment(appointment, pendingPaymentCutoff),
  );

/**
 * Prisma where clause without status filters.
 * Production DB enum may be out of sync with schema; filtering status in memory only.
 */
export const getAppointmentsBaseWhere = (therapistId, excludeAppointmentId) => ({
  therapistId,
  ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
});

export const getPendingPaymentCutoff = () =>
  new Date(Date.now() - PENDING_PAYMENT_HOLD_MINUTES * 60000);
