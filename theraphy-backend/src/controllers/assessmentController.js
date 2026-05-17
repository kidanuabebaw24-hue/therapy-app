import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const createAssessment = async (req, res) => {
  try {
    const { type, responses, notes } = req.body;
    const patientProfile = req.user.patientProfile;
    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    if (!type || !responses || !Array.isArray(responses)) {
      return sendError(res, 'Invalid assessment data', 400);
    }

    // Calculate total score
    const totalScore = responses.reduce((sum, r) => sum + (r.score || 0), 0);

    // Determine severity
    let severity = 'low';
    if (totalScore >= 70) severity = 'critical';
    else if (totalScore >= 50) severity = 'severe';
    else if (totalScore >= 30) severity = 'moderate';
    else if (totalScore >= 15) severity = 'mild';

    const assessment = await prisma.assessment.create({
      data: {
        patientId: patientProfile.id,
        type: type.toLowerCase(),
        score: totalScore,
        severity,
        notes,
        responses: {
          create: responses.map(r => ({
            question: r.question,
            questionId: r.questionId,
            answer: r.answer,
            score: r.score,
          })),
        },
      },
      include: { responses: true },
    });

    return sendSuccess(res, assessment, 'Assessment completed', 201);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getMyAssessments = async (req, res) => {
  try {
    const patientProfile = req.user.patientProfile;
    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    const assessments = await prisma.assessment.findMany({
      where: { patientId: patientProfile.id },
      include: { responses: true },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, assessments, 'Assessments retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getAssessmentStats = async (req, res) => {
  try {
    const patientProfile = req.user.patientProfile;
    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    const assessments = await prisma.assessment.findMany({
      where: { patientId: patientProfile.id },
      orderBy: { createdAt: 'asc' },
    });

    if (assessments.length === 0) {
      return sendSuccess(res, { totalAssessments: 0 }, 'No assessments found');
    }

    const latest = assessments[assessments.length - 1];
    const first = assessments[0];
    const totalScore = assessments.reduce((sum, a) => sum + a.score, 0);

    const stats = {
      totalAssessments: assessments.length,
      latestScore: latest.score,
      latestSeverity: latest.severity,
      firstScore: first.score,
      averageScore: totalScore / assessments.length,
      severityBreakdown: assessments.reduce((acc, a) => {
        acc[a.severity] = (acc[a.severity] || 0) + 1;
        return acc;
      }, {}),
    };

    return sendSuccess(res, stats, 'Assessment stats retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
