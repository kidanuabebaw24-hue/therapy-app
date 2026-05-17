import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

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
