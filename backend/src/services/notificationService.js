import { prisma } from '../config/db.js';
import { logger } from '../config/logger.js';

let ioInstance = null;

export function setIO(io) {
  ioInstance = io;
}

export function getIO() {
  return ioInstance;
}

export async function createNotification(userId, type, title, message, metadata = null) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata,
      },
    });

    logger.info('Notification created', { 
      notificationId: notification.id, 
      userId, 
      type 
    });

    // Emit via Socket.IO if available
    if (ioInstance) {
      ioInstance.to(`user:${userId}`).emit('notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (error) {
    logger.error('Error creating notification', { 
      error: error.message, 
      userId, 
      type 
    });
    throw error;
  }
}

export async function listNotifications(userId, { unreadOnly = false, limit = 50, offset = 0 } = {}) {
  const where = { userId };
  if (unreadOnly) {
    where.read = false;
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  return notifications;
}

export async function getUnreadCount(userId) {
  const count = await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });

  return count;
}

export async function markAsRead(userId, notificationId) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  return updated;
}

export async function markAllAsRead(userId) {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: { read: true },
  });

  return result;
}
