import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const assignTherapist = async (req, res) => {
  try {
    const { clientId, therapistId, notes } = req.body;
    
    // clientId and therapistId here are Profile IDs (Patient and Therapist)
    
    // Deactivate previous
    await prisma.therapistAssignment.updateMany({
      where: { patientId: clientId, status: 'active' },
      data: { status: 'inactive' },
    });
    
    const assignment = await prisma.therapistAssignment.create({
      data: {
        patientId: clientId,
        therapistId,
        status: 'active',
      },
    });
    
    return sendSuccess(res, assignment, 'Therapist assigned', 201);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getMyTherapist = async (req, res) => {
  try {
    const patientProfile = req.user.patientProfile;
    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    const assignment = await prisma.therapistAssignment.findFirst({
      where: { patientId: patientProfile.id, status: 'active' },
      include: { therapist: { include: { user: { select: { name: true, email: true } } } } },
    });

    if (!assignment) return sendError(res, 'No therapist assigned', 404);

    return sendSuccess(res, assignment, 'Therapist retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getMyClients = async (req, res) => {
  try {
    const therapistProfile = req.user.therapistProfile;
    if (!therapistProfile) return sendError(res, 'Profile not found', 404);

    const assignments = await prisma.therapistAssignment.findMany({
      where: { therapistId: therapistProfile.id, status: 'active' },
      include: { patient: { include: { user: { select: { name: true, email: true } } } } },
    });

    return sendSuccess(res, assignments, 'Clients retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
