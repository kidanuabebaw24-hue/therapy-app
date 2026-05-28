-- Add new appointment status values for payment + admin approval workflow
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'pending_payment';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'pending_admin_approval';
