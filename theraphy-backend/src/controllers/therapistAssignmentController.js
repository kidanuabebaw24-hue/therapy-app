import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import {
  formatAssignmentForTherapist,
  formatPatientForTherapist,
} from '../utils/formatAssignmentClient.js';

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
    if (!therapistProfile) return sendError(res, 'Therapist profile not found', 404);

    const patientInclude = {
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    };

    const [assignments, appointments] = await Promise.all([
      prisma.therapistAssignment.findMany({
        where: { therapistId: therapistProfile.id, status: 'active' },
        include: { patient: patientInclude },
        orderBy: { assignedAt: 'desc' },
      }),
      prisma.appointment.findMany({
        where: { therapistId: therapistProfile.id },
        include: { patient: patientInclude },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const clientMap = new Map();

    for (const assignment of assignments) {
      clientMap.set(
        assignment.patientId,
        formatAssignmentForTherapist(assignment),
      );
    }

    for (const appointment of appointments) {
      if (!appointment.patient || clientMap.has(appointment.patientId)) {
        continue;
      }

      clientMap.set(appointment.patientId, {
        id: `booking-${appointment.patientId}`,
        patientId: appointment.patientId,
        therapistId: therapistProfile.id,
        assignedDate: appointment.createdAt,
        assignedAt: appointment.createdAt,
        status: 'active',
        patient: formatPatientForTherapist(appointment.patient),
      });

      // Ensure chat can work — create assignment if missing
      await prisma.therapistAssignment.upsert({
        where: {
          patientId_therapistId: {
            patientId: appointment.patientId,
            therapistId: therapistProfile.id,
          },
        },
        create: {
          patientId: appointment.patientId,
          therapistId: therapistProfile.id,
          status: 'active',
        },
        update: { status: 'active' },
      });
    }

    const clients = Array.from(clientMap.values());

    return sendSuccess(res, clients, 'Clients retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
