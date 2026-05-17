import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const triggerEmergency = async (req, res) => {
  try {
    const { message, severity } = req.body;
    const patientProfile = req.user.patientProfile;

    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    const log = await prisma.emergencyLog.create({
      data: {
        patientId: patientProfile.id,
        message,
        severity: severity || 'medium',
      },
    });

    return sendSuccess(res, log, 'Emergency alert sent', 201);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getEmergencyLog = async (req, res) => {
  try {
    const { handled, clientId, severity } = req.query;
    let where = {};

    if (handled !== undefined) where.handled = handled === 'true';
    if (clientId) where.patientId = clientId;
    if (severity) where.severity = severity;

    if (req.user.role === 'therapist') {
      const therapistProfile = req.user.therapistProfile;
      where.patient = {
        therapistAssignments: {
          some: { therapistId: therapistProfile.id }
        }
      };
    }

    const emergencies = await prisma.emergencyLog.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
        handler: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, emergencies, 'Emergency logs retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const handleEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const emergency = await prisma.emergencyLog.update({
      where: { id },
      data: {
        handled: true,
        handledBy: req.user.id,
        notes: notes || undefined,
      },
    });

    return sendSuccess(res, emergency, 'Emergency handled');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
