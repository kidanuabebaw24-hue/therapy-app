import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const createBookingRequest = async (req, res) => {
  try {
    const { therapistId, message, preferredDate } = req.body;
    const patientProfile = req.user.patientProfile;

    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    const existingRequest = await prisma.bookingRequest.findFirst({
      where: {
        patientId: patientProfile.id,
        therapistId,
        status: 'pending',
      },
    });

    if (existingRequest) return sendError(res, 'You already have a pending request for this therapist', 400);

    const bookingRequest = await prisma.bookingRequest.create({
      data: {
        patientId: patientProfile.id,
        therapistId,
        message,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
      },
    });

    return sendSuccess(res, bookingRequest, 'Booking request sent', 201);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getAllBookingRequests = async (req, res) => {
  try {
    const requests = await prisma.bookingRequest.findMany({
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        therapist: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, requests, 'Booking requests retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const approveBookingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const request = await prisma.bookingRequest.findUnique({
      where: { id },
    });

    if (!request) return sendError(res, 'Request not found', 404);

    // Deactivate previous assignments
    await prisma.therapistAssignment.updateMany({
      where: { patientId: request.patientId, status: 'active' },
      data: { status: 'inactive', endDate: new Date() },
    });

    // Create new assignment
    const assignment = await prisma.therapistAssignment.create({
      data: {
        patientId: request.patientId,
        therapistId: request.therapistId,
        status: 'active',
      },
    });

    await prisma.bookingRequest.update({
      where: { id },
      data: {
        status: 'approved',
        adminNotes,
        reviewedById: req.user.id,
        reviewedAt: new Date(),
      },
    });

    return sendSuccess(res, assignment, 'Booking approved and therapist assigned');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
