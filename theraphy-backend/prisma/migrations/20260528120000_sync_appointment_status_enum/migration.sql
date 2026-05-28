-- Ensure all AppointmentStatus values used by the app exist in production (idempotent)
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'scheduled';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'completed';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'cancelled';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'no_show';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'rejected';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'pending_payment';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'pending_admin_approval';
