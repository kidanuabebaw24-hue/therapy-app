import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

/** GET /api/notifications/my  — returns the current user's notifications */
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return sendSuccess(res, notifications, 'Notifications retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

/** PATCH /api/notifications/:id/read  — marks one notification as read */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.updateMany({
      where: { id, userId: req.user.id },
      data: { isRead: true },
    });
    return sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};

/** PATCH /api/notifications/read-all  — marks all of the user's notifications as read */
export const markAllNotificationsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
