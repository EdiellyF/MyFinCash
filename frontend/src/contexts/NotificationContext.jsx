import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  // Load initial unread count
  useEffect(() => {
    if (user) {
      loadUnreadCount();
      loadNotifications();
    }
  }, [user]);

  // Setup Socket.IO connection for notifications
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Notification socket connected');
    });

    socket.on('notification', (notification) => {
      console.log('Real-time notification received:', notification);
      
      // Show toast notification
      if (notification.type === 'goal_reached') {
        toast.success(notification.title, {
          description: notification.message,
          duration: 5000,
        });
      } else if (notification.type === 'budget_exceeded') {
        toast.error(notification.title, {
          description: notification.message,
          duration: 5000,
        });
      } else {
        toast(notification.title, {
          description: notification.message,
          duration: 5000,
        });
      }

      // Update unread count
      setUnreadCount(prev => prev + 1);

      // Add to notifications list
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
    };
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
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

  const value = {
    unreadCount,
    notifications,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };

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
