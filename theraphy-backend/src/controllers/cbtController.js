import { CBTRepository } from '../repositories/cbtRepository.js';
import { PatientRepository } from '../repositories/patientRepository.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import prisma from '../config/prisma.js';

export const getCBTExercises = async (req, res) => {
  try {
    const exercises = await CBTRepository.findAllExercises();
    return sendSuccess(res, exercises, 'CBT exercises retrieved');
  } catch (error) {
    return sendError(res, 'Failed to fetch CBT exercises', 500, error);
  }
};

export const getCBTExerciseById = async (req, res) => {
  try {
    const exercise = await CBTRepository.findExerciseById(req.params.id);
    if (!exercise) return sendError(res, 'Exercise not found', 404);
    return sendSuccess(res, exercise, 'Exercise retrieved');
  } catch (error) {
    return sendError(res, 'Failed to fetch exercise', 500, error);
  }
};

export const getMyCBTProgress = async (req, res) => {
  try {
    const patientProfile = req.user.patientProfile;
    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    const progress = await prisma.cBTProgress.findMany({
      where: { patientId: patientProfile.id },
      include: { exercise: true },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, progress, 'CBT progress retrieved');
  } catch (error) {
    return sendError(res, 'Failed to fetch CBT progress', 500, error);
  }
};

export const createExercise = async (req, res) => {
  try {
    const { questions, ...exerciseData } = req.body;
    const exercise = await prisma.cBTExercise.create({
      data: {
        ...exerciseData,
        createdById: req.user.id,
        questions: {
          create: questions || [],
        },
      },
      include: { questions: true },
    });
    return sendSuccess(res, exercise, 'Exercise created', 201);
  } catch (error) {
    return sendError(res, 'Failed to create exercise', 500, error);
  }
};

export const submitProgress = async (req, res) => {
  try {
    const patientProfile = req.user.patientProfile;
    if (!patientProfile) return sendError(res, 'Profile not found', 404);

    const { exerciseId, completed, reflection, score, duration, responses } = req.body;

    const progress = await prisma.cBTProgress.upsert({
      where: {
        patientId_exerciseId: {
          patientId: patientProfile.id,
          exerciseId: exerciseId,
        },
      },
      update: { completed, reflection, score, duration, completedAt: completed ? new Date() : null },
      create: {
        patientId: patientProfile.id,
        exerciseId,
        completed,
        reflection,
        score,
        duration,
        completedAt: completed ? new Date() : null,
      },
    });

    // Save responses if any
    if (responses && Array.isArray(responses)) {
      await Promise.all(responses.map(resp => 
        prisma.cBTResponse.create({
          data: {
            patientId: patientProfile.id,
            questionId: resp.questionId,
            answer: resp.answer,
          }
        })
      ));
    }

    return sendSuccess(res, progress, 'Progress submitted', 201);
  } catch (error) {
    return sendError(res, 'Failed to submit progress', 500, error);
  }
};

export const getClientProgressForTracking = async (req, res) => {
  try {
    const { clientId } = req.params; // This is patientId in our case

    const patient = await prisma.patient.findUnique({
      where: { id: clientId },
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
        cbtProgress: {
          include: { exercise: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) return sendError(res, 'Patient not found', 404);

    return sendSuccess(res, {
      client: patient.user,
      cbtProgress: patient.cbtProgress,
      totalExercisesCompleted: patient.cbtProgress.filter(p => p.completed).length,
    }, 'Client progress retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
