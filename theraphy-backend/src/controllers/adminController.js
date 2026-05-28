import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { createNotification } from '../utils/notificationHelper.js';

export const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTherapists,
      totalClients,
      totalSessions,
      totalPayments,
      totalAssessments,
      pendingEmergencies,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.therapist.count(),
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.payment.count(),
      prisma.assessment.count(),
      prisma.emergencyLog.count({ where: { handled: false } }),
    ]);

    const revenue = await prisma.payment.aggregate({
      where: { status: 'paid' },
      _sum: { amount: true },
    });

    return sendSuccess(res, {
      totalUsers,
      totalTherapists,
      totalClients,
      totalSessions,
      totalPayments,
      totalAssessments,
      pendingEmergencies,
      totalRevenue: revenue._sum.amount || 0,
    }, 'System stats retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let where = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, users, 'Users retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const verifyTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    const therapist = await prisma.therapist.update({
      where: { id },
      data: { isVerified: true },
    });
    return sendSuccess(res, therapist, 'Therapist verified');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    let whereClause = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
        therapist: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { date: 'desc' },
    });
    return sendSuccess(res, appointments, 'Appointments retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        therapist: { include: { user: { select: { name: true } } } },
        patient: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    if (!appointment) return sendError(res, 'Appointment not found', 404);
    if (!['pending_admin_approval', 'pending'].includes(appointment.status)) {
      return sendError(res, 'Appointment is not in pending admin approval status', 400);
    }

    // Check therapist availability in-memory across active appointments
    const activeAppointments = await prisma.appointment.findMany({
      where: {
        therapistId: appointment.therapistId,
        id: { not: id },
        status: { in: ['approved', 'pending_admin_approval', 'scheduled'] },
      }
    });

    const start = new Date(appointment.date).getTime();
    const end = start + appointment.duration * 60000;
    const hasOverlap = activeAppointments.some(other => {
      const otherStart = new Date(other.date).getTime();
      const otherEnd = otherStart + other.duration * 60000;
      return (start < otherEnd && end > otherStart);
    });

    if (hasOverlap) {
      return sendError(res, 'Therapist is not available at the requested time slot', 400);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'approved' },
    });

    // Notify client
    await createNotification(
      appointment.patient.user.id,
      'Appointment Approved',
      'Your appointment has been approved.',
      'booking_approved'
    );

    return sendSuccess(res, updated, 'Booking approved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { id: true } } } },
      },
    });

    if (!appointment) return sendError(res, 'Appointment not found', 404);
    if (!['pending_admin_approval', 'pending'].includes(appointment.status)) {
      return sendError(res, 'Appointment is not in pending admin approval status', 400);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'rejected' },
    });

    // Notify client
    await createNotification(
      appointment.patient.user.id,
      'Appointment Request Rejected',
      'Your appointment request was rejected.',
      'booking_rejected'
    );

    return sendSuccess(res, updated, 'Booking rejected');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
