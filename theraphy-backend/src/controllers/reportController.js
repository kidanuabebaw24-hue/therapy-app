import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const generateProgressReport = async (req, res) => {
  try {
    const { clientId, startDate, endDate } = req.body;
    const patientId = clientId; // Assuming clientId passed is patientId

    const [sessions, assessments, progressEntries] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          patientId,
          date: { gte: new Date(startDate), lte: new Date(endDate) },
          status: 'completed',
        },
      }),
      prisma.assessment.findMany({
        where: {
          patientId,
          createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.moodLog.findMany({
        where: {
          patientId,
          createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
        },
      }),
    ]);

    const avgMood = progressEntries.length > 0
      ? progressEntries.reduce((sum, e) => sum + (e.moodScore || 0), 0) / progressEntries.length
      : 0;

    const avgAnxiety = progressEntries.length > 0
      ? progressEntries.reduce((sum, e) => sum + (e.anxietyLevel || 0), 0) / progressEntries.length
      : 0;

    let improvementPercentage = 0;
    if (assessments.length >= 2) {
      const first = assessments[0];
      const latest = assessments[assessments.length - 1];
      if (first.score > 0) {
        improvementPercentage = ((first.score - latest.score) / first.score) * 100;
      }
    }

    const report = await prisma.progressReport.create({
      data: {
        patientId,
        therapistId: req.user.therapistProfile?.id || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        sessionsCompleted: sessions.length,
        averageMoodScore: avgMood,
        averageAnxietyScore: avgAnxiety,
        improvementPercentage,
        generatedBy: req.user.role,
        // Findings and recommendations would be generated here by logic
        keyFindings: `Completed ${sessions.length} sessions. Average mood: ${avgMood.toFixed(1)}.`,
      },
    });

    return sendSuccess(res, report, 'Report generated', 201);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getClientReports = async (req, res) => {
  try {
    const patientProfile = req.user.patientProfile;
    const therapistProfile = req.user.therapistProfile;

    let where = {};
    if (patientProfile) {
      where.patientId = patientProfile.id;
    } else if (therapistProfile) {
      const { clientId } = req.query;
      if (clientId) where.patientId = clientId;
      else {
        where.therapistId = therapistProfile.id;
      }
    }

    const reports = await prisma.progressReport.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true } } } },
        therapist: { include: { user: { select: { name: true } } } },
      },
      orderBy: { endDate: 'desc' },
    });

    return sendSuccess(res, reports, 'Reports retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
