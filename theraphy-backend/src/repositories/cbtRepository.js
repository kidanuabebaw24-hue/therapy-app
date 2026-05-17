import prisma from '../config/prisma.js';

export class CBTRepository {
  static async findAllExercises() {
    return prisma.cBTExercise.findMany({
      where: { isActive: true },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  static async findMandatoryExercises() {
    return prisma.cBTExercise.findMany({
      where: {
        isActive: true,
        isMandatory: true,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  static async findExerciseById(id) {
    return prisma.cBTExercise.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  static async saveResponse(data) {
    return prisma.cBTResponse.create({
      data,
    });
  }

  static async updateProgress(patientId, exerciseId, data) {
    return prisma.cBTProgress.upsert({
      where: {
        // Need to add a unique constraint in schema if we want to use upsert with patientId and exerciseId
        // For now, let's just find and update or create
        id: (await prisma.cBTProgress.findFirst({
          where: { patientId, exerciseId }
        }))?.id || 'new-id',
      },
      update: data,
      create: {
        patientId,
        exerciseId,
        ...data,
      },
    });
  }
}
