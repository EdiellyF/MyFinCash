import { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const ACCESS_TOKEN_KEY = 'finance_access_token';

// Paleta do design system (frontend/tailwind.config.js)
const FINCASH = {
  forest: '#1B4332',
  terracotta: '#8B3A3A',
  cream: '#F7F3E9',
};

const NOTIFICATION_TOASTS = {
  goal_reached: {
    show: (title, options) => toast.success(title, {
      ...options,
      style: {
        '--success-bg': FINCASH.cream,
        '--success-text': FINCASH.forest,
        '--success-border': FINCASH.forest,
      },
    }),
  },
  budget_exceeded: {
    show: (title, options) => toast.error(title, {
      ...options,
      style: {
        '--error-bg': FINCASH.cream,
        '--error-text': FINCASH.terracotta,
        '--error-border': FINCASH.terracotta,
      },
    }),
  },
};

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  const loadUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data?.data?.count ?? 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Load inicial: badge + lista assim que houver usuário autenticado
  useEffect(() => {
    if (!user) {
      // Evita que o próximo login herde o estado da sessão anterior.
      setUnreadCount(0);
      setNotifications([]);
      setLoading(false);
      return;
    }

    loadUnreadCount();
    loadNotifications();
  }, [user]);

  // Conexão Socket.IO dedicada para notificações (independente da tela atual)
  useEffect(() => {
    if (!user) return;
    if (!localStorage.getItem(ACCESS_TOKEN_KEY)) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      // Forma função: o socket.io reavalia a cada reconexão, evitando
      // mandar um access token já expirado (TTL de 15min).
      auth: (cb) => cb({ token: localStorage.getItem(ACCESS_TOKEN_KEY) }),
      transports: ['websocket'],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Notification socket connected');
    });

    socket.on('notification', (payload) => {
      // O evento não traz `read`; normaliza para o indicador do sino.
      const notification = { ...payload, read: false };

      const handler = NOTIFICATION_TOASTS[notification.type];
      const options = { description: notification.message, duration: 5000 };

      if (handler) {
        handler.show(notification.title, options);
      } else {
        toast(notification.title, options);
      }

      setUnreadCount(prev => prev + 1);
      setNotifications(prev => [notification, ...prev]);
    });

    socket.on('disconnect', () => {
      console.log('Notification socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Notification socket connection error:', error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      if (!notifications.some(n => n.id === notificationId && !n.read)) return;
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const value = useMemo(
    () => ({ unreadCount, notifications, loading, loadNotifications, markAsRead, markAllAsRead }),
    [unreadCount, notifications, loading]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
