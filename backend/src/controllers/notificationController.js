import { ok } from '../utils/response.js';
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../services/notificationService.js';

export async function list(req, res) {
  const { unreadOnly, limit, offset } = req.query;
  const notifications = await listNotifications(req.user.id, {
    unreadOnly: unreadOnly === 'true',
    limit: limit ? parseInt(limit) : 50,
    offset: offset ? parseInt(offset) : 0,
  });
  return ok(res, notifications);
}

export async function getUnread(req, res) {
  const count = await getUnreadCount(req.user.id);
  return ok(res, { count });
}

export async function markRead(req, res) {
  const { id } = req.params;
  const notification = await markAsRead(req.user.id, id);
  return ok(res, notification, 'Notificação marcada como lida.');
}

export async function markAllRead(req, res) {
  const result = await markAllAsRead(req.user.id);
  return ok(res, result, 'Todas as notificações foram marcadas como lidas.');
}
