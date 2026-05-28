import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { createNotification } from '../utils/notificationHelper.js';

// ─── Helper: find the admin user id ──────────────────────────────────────────
const getAdminUserId = async () => {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  return admin?.id ?? null;
};

// ─── POST /api/booking ────────────────────────────────────────────────────────
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

    if (existingRequest)
      return sendError(res, 'You already have a pending request for this therapist', 400);

    const bookingRequest = await prisma.bookingRequest.create({
      data: {
        patientId: patientProfile.id,
        therapistId,
        message,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
      },
      include: {
        therapist: { include: { user: { select: { name: true } } } },
      },
    });

    // Notify admin
    const adminId = await getAdminUserId();
    if (adminId) {
      await createNotification(
        adminId,
        'New Appointment Request',
        `New appointment request from ${req.user.name}.`,
        'booking_request',
      );
    }

    return sendSuccess(res, bookingRequest, 'Booking request sent', 201);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

// ─── GET /api/booking  (all) ──────────────────────────────────────────────────
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

// ─── GET /api/booking/pending ─────────────────────────────────────────────────
export const getPendingBookingRequests = async (req, res) => {
  try {
    const requests = await prisma.bookingRequest.findMany({
      where: { status: 'pending' },
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        therapist: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, requests, 'Pending booking requests retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

// ─── GET /api/booking/my ──────────────────────────────────────────────────────
export const getMyBookingRequests = async (req, res) => {
  try {
    const patientProfile = req.user.patientProfile;
    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    const requests = await prisma.bookingRequest.findMany({
      where: { patientId: patientProfile.id },
      include: {
        therapist: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, requests, 'Your booking requests retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

// ─── PATCH /api/booking/:id/approve ──────────────────────────────────────────
export const approveBookingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const request = await prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { id: true, name: true } } } },
        therapist: { include: { user: { select: { name: true } } } },
      },
    });

    if (!request) return sendError(res, 'Request not found', 404);
    if (request.status !== 'pending')
      return sendError(res, 'Request is no longer pending', 400);

    // Deactivate previous assignments
    await prisma.therapistAssignment.updateMany({
      where: { patientId: request.patientId, status: 'active' },
      data: { status: 'inactive' },
    });

    // Create new assignment (upsert to avoid duplicate key)
    await prisma.therapistAssignment.upsert({
      where: {
        patientId_therapistId: {
          patientId: request.patientId,
          therapistId: request.therapistId,
        },
      },
      update: { status: 'active' },
      create: {
        patientId: request.patientId,
        therapistId: request.therapistId,
        status: 'active',
      },
    });

    const updated = await prisma.bookingRequest.update({
      where: { id },
      data: {
        status: 'approved',
        adminNotes,
        reviewedById: req.user.id,
        reviewedAt: new Date(),
      },
    });

    // Notify client
    const clientUserId = request.patient.user.id;
    await createNotification(
      clientUserId,
      'Appointment Approved',
      'Your appointment has been approved.',
      'booking_approved',
    );

    return sendSuccess(res, updated, 'Booking approved and therapist assigned');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

// ─── PATCH /api/booking/:id/reject ───────────────────────────────────────────
export const rejectBookingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const request = await prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { id: true } } } },
      },
    });

    if (!request) return sendError(res, 'Request not found', 404);
    if (request.status !== 'pending')
      return sendError(res, 'Request is no longer pending', 400);

    const updated = await prisma.bookingRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason,
        reviewedById: req.user.id,
        reviewedAt: new Date(),
      },
    });

    // Notify client
    const clientUserId = request.patient.user.id;
    await createNotification(
      clientUserId,
      'Appointment Request Rejected',
      'Your appointment request was rejected.',
      'booking_rejected',
    );

    return sendSuccess(res, updated, 'Booking request rejected');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
