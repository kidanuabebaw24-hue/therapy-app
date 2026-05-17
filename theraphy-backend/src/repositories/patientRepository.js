import prisma from '../config/prisma.js';

export class PatientRepository {
  static async findById(id) {
    return prisma.patient.findUnique({
      where: { id },
      include: {
        user: true,
        appointments: true,
        moodLogs: true,
        cbtProgress: true,
        assessments: true,
      },
    });
  }

  static async findByUserId(userId) {
    return prisma.patient.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });
  }

  static async update(id, data) {
    return prisma.patient.update({
      where: { id },
      data,
    });
  }

  static async getCbtProgress(patientId) {
    return prisma.cbtProgress.findMany({
      where: { patientId },
      include: {
        exercise: true,
      },
    });
  }
}
