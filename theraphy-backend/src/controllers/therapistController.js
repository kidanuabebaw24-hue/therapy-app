import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const getAvailableTherapists = async (req, res) => {
  try {
    const { specialization, minExperience } = req.query;
    
    let where = { isVerified: true };
    
    if (specialization && specialization !== 'all') {
      where.specialization = specialization;
    }
    
    if (minExperience) {
      where.yearsOfExperience = { gte: parseInt(minExperience) };
    }
    
    const therapists = await prisma.therapist.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { yearsOfExperience: 'desc' },
    });
    
    // Add stats
    const therapistsWithStats = await Promise.all(
      therapists.map(async (t) => {
        const totalSessions = await prisma.appointment.count({
          where: { therapistId: t.id, status: 'completed' },
        });
        
        const activeClients = await prisma.therapistAssignment.count({
          where: { therapistId: t.id, status: 'active' },
        });
        
        return {
          ...t,
          totalSessions,
          activeClients,
        };
      })
    );
    
    return sendSuccess(res, therapistsWithStats, 'Therapists retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getTherapistDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const therapist = await prisma.therapist.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    });
    
    if (!therapist) return sendError(res, 'Therapist not found', 404);
    
    const totalSessions = await prisma.appointment.count({
      where: { therapistId: therapist.id, status: 'completed' },
    });
    
    const activeClients = await prisma.therapistAssignment.count({
      where: { therapistId: therapist.id, status: 'active' },
    });
    
    return sendSuccess(res, {
      ...therapist,
      totalSessions,
      activeClients,
    }, 'Therapist details retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getSpecializations = async (req, res) => {
  try {
    const specializations = await prisma.therapist.findMany({
      where: { isVerified: true },
      distinct: ['specialization'],
      select: { specialization: true },
    });
    
    return sendSuccess(res, specializations.map(s => s.specialization).filter(s => s), 'Specializations retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
