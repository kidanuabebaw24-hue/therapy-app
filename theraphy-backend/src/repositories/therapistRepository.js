import prisma from '../config/prisma.js';

export class TherapistRepository {
  static async findById(id) {
    return prisma.therapist.findUnique({
      where: { id },
      include: {
        user: true,
        appointments: true,
        patientAssignments: {
          include: {
            patient: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  static async findByUserId(userId) {
    return prisma.therapist.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });
  }

  static async findAll() {
    return prisma.therapist.findMany({
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
  }

  static async update(id, data) {
    return prisma.therapist.update({
      where: { id },
      data,
    });
  }
}
