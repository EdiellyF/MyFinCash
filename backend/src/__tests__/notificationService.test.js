import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prisma } from '../config/db.js';
import {
  createNotification,
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  setIO,
  getIO,
} from '../services/notificationService.js';

vi.mock('../config/db.js', () => {
  const create = vi.fn();
  const findMany = vi.fn();
  const count = vi.fn();
  const findFirst = vi.fn();
  const update = vi.fn();
  const updateMany = vi.fn();
  return {
    prisma: {
      notification: {
        create,
        findMany,
        count,
        findFirst,
        update,
        updateMany,
      },
    },
  };
});

describe('notificationService', () => {
  let mockIO;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIO = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };
    setIO(mockIO);
  });

  afterEach(() => {
    setIO(null);
  });

  describe('createNotification', () => {
    it('creates notification in database and emits via Socket.IO', async () => {
      const userId = 'user-1';
      const notificationData = {
        id: 'notif-1',
        userId,
        type: 'goal_reached',
        title: 'Meta Atingida',
        message: 'Parabéns!',
        metadata: { goalId: 'goal-1' },
        createdAt: new Date(),
      };

      prisma.notification.create.mockResolvedValue(notificationData);

      const result = await createNotification(
        userId,
        'goal_reached',
        'Meta Atingida',
        'Parabéns!',
        { goalId: 'goal-1' }
      );

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId,
          type: 'goal_reached',
          title: 'Meta Atingida',
          message: 'Parabéns!',
          metadata: { goalId: 'goal-1' },
        },
      });

      expect(mockIO.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockIO.emit).toHaveBeenCalledWith('notification', {
        id: notificationData.id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        metadata: notificationData.metadata,
        createdAt: notificationData.createdAt,
      });

      expect(result).toEqual(notificationData);
    });

    it('works when Socket.IO is not available', async () => {
      setIO(null);

      const notificationData = {
        id: 'notif-1',
        userId: 'user-1',
        type: 'goal_reached',
        title: 'Meta Atingida',
        message: 'Parabéns!',
        metadata: null,
        createdAt: new Date(),
      };

      prisma.notification.create.mockResolvedValue(notificationData);

      const result = await createNotification(
        'user-1',
        'goal_reached',
        'Meta Atingida',
        'Parabéns!'
      );

      expect(prisma.notification.create).toHaveBeenCalled();
      expect(result).toEqual(notificationData);
    });
  });

  describe('listNotifications', () => {
    it('returns all notifications for user', async () => {
      const notifications = [
        { id: '1', userId: 'user-1', title: 'Test 1' },
        { id: '2', userId: 'user-1', title: 'Test 2' },
      ];

      prisma.notification.findMany.mockResolvedValue(notifications);

      const result = await listNotifications('user-1');

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });

      expect(result).toEqual(notifications);
    });

    it('filters unread notifications when requested', async () => {
      const notifications = [{ id: '1', userId: 'user-1', title: 'Test 1' }];

      prisma.notification.findMany.mockResolvedValue(notifications);

      const result = await listNotifications('user-1', { unreadOnly: true });

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', read: false },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });

      expect(result).toEqual(notifications);
    });

    it('applies pagination parameters', async () => {
      prisma.notification.findMany.mockResolvedValue([]);

      await listNotifications('user-1', { limit: 20, offset: 10 });

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 10,
      });
    });
  });

  describe('getUnreadCount', () => {
    it('returns count of unread notifications', async () => {
      prisma.notification.count.mockResolvedValue(5);

      const result = await getUnreadCount('user-1');

      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', read: false },
      });

      expect(result).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read', async () => {
      const notification = {
        id: 'notif-1',
        userId: 'user-1',
        read: false,
      };

      prisma.notification.findFirst.mockResolvedValue(notification);
      prisma.notification.update.mockResolvedValue({ ...notification, read: true });

      const result = await markAsRead('user-1', 'notif-1');

      expect(prisma.notification.findFirst).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: 'user-1' },
      });

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { read: true },
      });

      expect(result.read).toBe(true);
    });

    it('throws error when notification not found', async () => {
      prisma.notification.findFirst.mockResolvedValue(null);

      await expect(markAsRead('user-1', 'notif-1')).rejects.toThrow(
        'Notification not found'
      );
    });
  });

  describe('markAllAsRead', () => {
    it('marks all unread notifications as read', async () => {
      const result = { count: 5 };
      prisma.notification.updateMany.mockResolvedValue(result);

      const response = await markAllAsRead('user-1');

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', read: false },
        data: { read: true },
      });

      expect(response).toEqual(result);
    });
  });

  describe('getIO and setIO', () => {
    it('sets and gets IO instance', () => {
      const io = { test: true };
      setIO(io);
      expect(getIO()).toBe(io);
    });

    it('returns null when IO not set', () => {
      setIO(null);
      expect(getIO()).toBeNull();
    });
  });
});
