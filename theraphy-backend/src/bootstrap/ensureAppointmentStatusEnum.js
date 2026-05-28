import prisma from '../config/prisma.js';

/** Status values used by booking / admin approval flow — must exist on DB enum. */
const APPOINTMENT_STATUSES = [
  'pending_payment',
  'pending_admin_approval',
  'scheduled',
  'completed',
  'cancelled',
  'no_show',
  'pending',
  'approved',
  'rejected',
];

/**
 * Production DB may lack new enum labels if migrate deploy was skipped.
 * Runs one statement per value (autocommit) to avoid transaction-block errors.
 */
export async function ensureAppointmentStatusEnum() {
  for (const status of APPOINTMENT_STATUSES) {
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS '${status}'`,
      );
    } catch (err) {
      const msg = err?.message ?? String(err);
      if (
        msg.includes('already exists') ||
        msg.includes('duplicate') ||
        msg.includes('IF NOT EXISTS')
      ) {
        continue;
      }
      console.warn(`[enum-sync] AppointmentStatus.${status}:`, msg);
    }
  }
}
