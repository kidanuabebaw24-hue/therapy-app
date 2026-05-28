import prisma from '../config/prisma.js';

/**
 * Creates a notification record for a user.
 * @param {string} userId  - The User.id (not Patient/Therapist id)
 * @param {string} title
 * @param {string} message
 * @param {string} type    - 'booking_request' | 'booking_approved' | 'booking_rejected' | 'info'
 */
export const createNotification = async (userId, title, message, type = 'info') => {
  try {
    return await prisma.notification.create({
      data: { userId, title, message, type },
    });
  } catch (err) {
    // Never let a notification failure crash the main flow
    console.error('⚠️  Failed to create notification:', err.message);
    return null;
  }
};
