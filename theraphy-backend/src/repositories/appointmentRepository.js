import prisma from '../config/prisma.js';

export class AppointmentRepository {
  static async create(data) {
    return prisma.appointment.create({
      data,
    });
  }

  static async findById(id) {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: { user: true },
        },
        therapist: {
          include: { user: true },
        },
      },
    });
  }

  static async findByPatient(patientId) {
    return prisma.appointment.findMany({
      where: { patientId },
      include: {
        therapist: {
          include: { user: true },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  static async findByTherapist(therapistId) {
    return prisma.appointment.findMany({
      where: { therapistId },
      include: {
        patient: {
          include: { user: true },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  static async update(id, data) {
    return prisma.appointment.update({
      where: { id },
      data,
    });
  }

  static async delete(id) {
    return prisma.appointment.delete({
      where: { id },
    });
  }
}
