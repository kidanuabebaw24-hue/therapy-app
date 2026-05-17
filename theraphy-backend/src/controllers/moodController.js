import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const logMood = async (req, res) => {
  try {
    const patientProfile = req.user.patientProfile;
    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    const mood = await prisma.moodLog.create({
      data: {
        patientId: patientProfile.id,
        ...req.body,
      },
    });
    return sendSuccess(res, mood, 'Mood logged', 201);
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getMoodHistory = async (req, res) => {
  try {
    const patientProfile = req.user.patientProfile;
    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    const moods = await prisma.moodLog.findMany({
      where: { patientId: patientProfile.id },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, moods, 'Mood history retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

export const getSimpleMoodTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const patientProfile = req.user.patientProfile;
    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const moods = await prisma.moodLog.findMany({
      where: {
        patientId: patientProfile.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    const trendData = moods.map(mood => ({
      date: mood.createdAt.toISOString().split('T')[0],
      moodScore: mood.moodScore,
      anxietyLevel: mood.anxietyLevel || 0,
    }));

    return res.json(trendData); // Standardizing to match expected frontend output
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
