import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository.js';
import { CBTRepository } from '../repositories/cbtRepository.js';

export class AuthService {
  /** Expose therapist verification on user for web/mobile clients. */
  static formatUserForClient(user) {
    if (!user) return null;
    const { password, ...safe } = user;

    if (safe.role === 'therapist' && safe.therapistProfile) {
      safe.isVerified = Boolean(safe.therapistProfile.isVerified);
      safe.therapistId = safe.therapistProfile.id;
      safe.specialization = safe.therapistProfile.specialization ?? null;
    }

    return safe;
  }

  static async register(userData) {
    const { email, password } = userData;

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserRepository.create({
      ...userData,
      password: hashedPassword,
    });

    // Assign mandatory CBT exercises if client
    if (user.role === 'client') {
      const mandatoryExercises = await CBTRepository.findMandatoryExercises();
      // Logic for assigning exercises would go here or in a separate service
    }

    const token = this.generateToken(user.id);

    return { user: this.formatUserForClient(user), token };
  }

  static async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id);

    return { user: this.formatUserForClient(user), token };
  }

  static generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
  }
}
