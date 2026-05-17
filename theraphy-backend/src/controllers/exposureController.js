import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const createExposurePlan = async (req, res) => {
  try {
    const { clientId, phobiaType, exposureLevel, mediaType, mediaUrl, notes, levels } = req.body;
    const therapistProfile = req.user.therapistProfile;
    const patientProfile = req.user.patientProfile;

    let targetPatientId = clientId;
    let targetTherapistId = therapistProfile ? therapistProfile.id : null;

    if (!therapistProfile) {
      if (!patientProfile) {
        return sendError(res, 'Profile not found', 404);
      }
      targetPatientId = patientProfile.id;
    }

    if (levels && Array.isArray(levels)) {
      const data = levels.map((l) => ({
        patientId: targetPatientId,
        therapistId: targetTherapistId,
        phobiaType: phobiaType || 'Public Speaking',
        exposureLevel: l.exposureLevel || l.level || 1,
        mediaType: l.mediaType || mediaType || 'text',
        mediaUrl: l.mediaUrl || mediaUrl || '',
        notes: l.notes || l.description || '',
        status: 'planned',
      }));

      await prisma.exposureTherapy.createMany({ data });
      
      const created = await prisma.exposureTherapy.findMany({
        where: {
          patientId: targetPatientId,
          phobiaType: phobiaType || 'Public Speaking',
        },
        orderBy: { exposureLevel: 'asc' },
      });
      return sendSuccess(res, created, 'Exposure plans created', 201);
    } else {
      const exposurePlan = await prisma.exposureTherapy.create({
        data: {
          patientId: targetPatientId,
          therapistId: targetTherapistId,
          phobiaType,
          exposureLevel,
          mediaType,
          mediaUrl,
          notes,
          status: 'planned',
        },
      });
      return sendSuccess(res, exposurePlan, 'Exposure plan created', 201);
    }
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const updateExposureSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { anxietyBefore, anxietyAfter, clientNotes, status } = req.body;

    const exposure = await prisma.exposureTherapy.update({
      where: { id },
      data: {
        anxietyBefore,
        anxietyAfter,
        clientNotes,
        status: status || undefined,
      },
    });

    return sendSuccess(res, exposure, 'Exposure session updated');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getExposureSessions = async (req, res) => {
  try {
    const patientProfile = req.user.patientProfile;
    const therapistProfile = req.user.therapistProfile;

    let where = {};
    if (patientProfile) {
      where.patientId = patientProfile.id;
    } else if (therapistProfile) {
      where.therapistId = therapistProfile.id;
    }

    const sessions = await prisma.exposureTherapy.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        therapist: { include: { user: { select: { name: true, email: true } } } },
        appointment: { select: { date: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, sessions, 'Exposure sessions retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
