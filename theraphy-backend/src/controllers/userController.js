import { UserRepository } from '../repositories/userRepository.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import prisma from '../config/prisma.js';

export const getProfile = async (req, res) => {
  try {
    const user = await UserRepository.findById(req.user.id);
    return sendSuccess(res, user, 'Profile retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await UserRepository.update(req.user.id, req.body);
    return sendSuccess(res, user, 'Profile updated');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const patientProfile = req.user.patientProfile;

    if (!patientProfile) {
      return sendError(res, 'Stats only available for patients', 400);
    }

    const [sessionStats, assessmentStats, upcomingSessions] = await Promise.all([
      prisma.appointment.groupBy({
        by: ['status'],
        where: { patientId: patientProfile.id },
        _count: { _all: true },
      }),
      prisma.assessment.aggregate({
        where: { patientId: patientProfile.id },
        _count: { _all: true },
        _avg: { score: true },
      }),
      prisma.appointment.findMany({
        where: {
          patientId: patientProfile.id,
          status: 'scheduled',
          date: { gte: new Date() },
        },
        include: {
          therapist: {
            include: { user: { select: { name: true } } },
          },
        },
        orderBy: { date: 'asc' },
        take: 5,
      }),
    ]);

    const stats = {
      sessions: sessionStats.reduce((acc, curr) => {
        acc[curr.status] = curr._count._all;
        return acc;
      }, {}),
      assessments: {
        total: assessmentStats._count._all,
        avgScore: assessmentStats._avg.score || 0,
      },
      upcomingSessions,
    };

    return sendSuccess(res, stats, 'User stats retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getTherapists = async (req, res) => {
  try {
    const therapists = await prisma.therapist.findMany({
      where: { isVerified: true },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    return sendSuccess(res, therapists, 'Therapists retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getClients = async (req, res) => {
  try {
    let where = {};
    
    if (req.user.role === 'therapist') {
      const therapistProfile = req.user.therapistProfile;
      where = {
        therapistAssignments: {
          some: { therapistId: therapistProfile.id }
        }
      };
    }
    
    const clients = await prisma.patient.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    return sendSuccess(res, clients, 'Clients retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const addEmergencyContact = async (req, res) => {
  try {
    const patientProfile = req.user.patientProfile;
    if (!patientProfile) {
      return sendError(res, 'Patient profile not found', 404);
    }
    
    const { name, phone, relationship } = req.body;
    if (!name || !phone) {
      return sendError(res, 'Name and phone are required', 400);
    }
    
    const contact = await prisma.emergencyContact.create({
      data: {
        patientId: patientProfile.id,
        name,
        phone,
        relationship,
      }
    });
    
    return sendSuccess(res, contact, 'Emergency contact added', 201);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const updateEmergencyContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const patientProfile = req.user.patientProfile;
    if (!patientProfile) {
      return sendError(res, 'Patient profile not found', 404);
    }

    const contact = await prisma.emergencyContact.findUnique({
      where: { id: contactId }
    });

    if (!contact || contact.patientId !== patientProfile.id) {
      return sendError(res, 'Emergency contact not found or unauthorized', 404);
    }

    const { name, phone, relationship } = req.body;
    const updatedContact = await prisma.emergencyContact.update({
      where: { id: contactId },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        relationship: relationship || undefined,
      }
    });

    return sendSuccess(res, updatedContact, 'Emergency contact updated');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const deleteEmergencyContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const patientProfile = req.user.patientProfile;
    if (!patientProfile) {
      return sendError(res, 'Patient profile not found', 404);
    }

    const contact = await prisma.emergencyContact.findUnique({
      where: { id: contactId }
    });

    if (!contact || contact.patientId !== patientProfile.id) {
      return sendError(res, 'Emergency contact not found or unauthorized', 404);
    }

    await prisma.emergencyContact.delete({
      where: { id: contactId }
    });

    return sendSuccess(res, null, 'Emergency contact deleted');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
