import prisma from '../config/prisma.js';

export class UserRepository {
  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        patientProfile: {
          include: {
            emergencyContacts: true,
          }
        },
        therapistProfile: true,
      },
    });
  }

  static async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        patientProfile: {
          include: {
            emergencyContacts: true,
          }
        },
        therapistProfile: true,
      },
    });
  }

  static async create(data) {
    const { role, age, gender, primaryPhobia, currentAnxietyLevel, ...userData } = data;
    
    return prisma.user.create({
      data: {
        ...userData,
        role: role || 'client',
        patientProfile: (role === 'client' || !role) ? {
          create: {
            age: age ? parseInt(age) : undefined,
            gender,
            primaryPhobia,
            currentAnxietyLevel,
          }
        } : undefined,
        therapistProfile: role === 'therapist' ? {
          create: {
            specialization: userData.specialization,
            licenseNumber: userData.licenseNumber,
            yearsOfExperience: userData.yearsOfExperience,
            hourlyRate: userData.hourlyRate,
            about: userData.about,
          }
        } : undefined,
      },
      include: {
        patientProfile: {
          include: {
            emergencyContacts: true,
          }
        },
        therapistProfile: true,
      },
    });
  }

  static async update(id, data) {
    const { patientProfile, therapistProfile, ...userData } = data;
    
    return prisma.user.update({
      where: { id },
      data: {
        ...userData,
        patientProfile: patientProfile ? {
          update: patientProfile
        } : undefined,
        therapistProfile: therapistProfile ? {
          update: therapistProfile
        } : undefined,
      },
      include: {
        patientProfile: {
          include: {
            emergencyContacts: true,
          }
        },
        therapistProfile: true,
      },
    });
  }
}
