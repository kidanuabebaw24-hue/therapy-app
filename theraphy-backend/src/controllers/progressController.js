import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const addSessionProgress = async (req, res) => {
  try {
    const { sessionId, moodScore, anxietyScore, therapistNotes, progressLevel, recommendations } = req.body;
    
    const appointment = await prisma.appointment.findUnique({
      where: { id: sessionId, therapistId: req.user.therapistProfile?.id, status: 'completed' },
    });
    
    if (!appointment) return sendError(res, 'Appointment not found or not completed', 404);
    
    const progress = await prisma.therapyProgress.create({
      data: {
        patientId: appointment.patientId,
        appointmentId: sessionId,
        moodScore,
        anxietyScore,
        therapistNotes,
        progressLevel,
        recommendations,
      },
    });
    
    return sendSuccess(res, progress, 'Progress recorded', 201);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getClientProgressTimeline = async (req, res) => {
  try {
    const patientProfile = req.user.patientProfile;
    const therapistProfile = req.user.therapistProfile;

    let where = {};
    if (patientProfile) {
      where.patientId = patientProfile.id;
    } else if (therapistProfile) {
      const { clientId } = req.query;
      if (clientId) where.patientId = clientId;
    }

    const progress = await prisma.therapyProgress.findMany({
      where,
      include: { appointment: true },
      orderBy: { createdAt: 'asc' },
    });

    return sendSuccess(res, progress, 'Progress timeline retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
