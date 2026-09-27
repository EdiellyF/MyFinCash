import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { formatRelativeTime } from '../utils/format';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Handle case where context might not be available
  let notificationData;
  try {
    notificationData = useNotifications();
  } catch (error) {
    console.error('Notification context not available:', error);
    notificationData = {
      unreadCount: 0,
      notifications: [],
      markAsRead: () => {},
      markAllAsRead: () => {},
      loadNotifications: () => {},
    };
  }
  
  const { unreadCount = 0, notifications = [], markAsRead = () => {}, markAllAsRead = () => {}, loadNotifications = () => {} } = notificationData;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      loadNotifications();
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative rounded-sm border border-fincash-ink/10 p-2.5 text-fincash-ink transition hover:bg-fincash-ink/5 dark:border-fincash-cream/10 dark:text-fincash-cream dark:hover:bg-fincash-cream/5"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-fincash-terracotta text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-fincash-ink/10 bg-white shadow-xl dark:border-fincash-cream/10 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-fincash-ink/10 px-4 py-3 dark:border-fincash-cream/10">
            <h3 className="text-sm font-semibold text-fincash-ink dark:text-fincash-cream">
              Notificações
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-fincash-forest transition hover:text-fincash-forest/80"
              >
                <CheckCheck size={14} />
                Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell size={32} className="mb-2 text-fincash-ink/30 dark:text-fincash-cream/30" />
                <p className="text-sm text-fincash-ink/60 dark:text-fincash-cream/60">
                  Nenhuma notificação
                </p>
              </div>
            ) : (
              <div className="divide-y divide-fincash-ink/5 dark:divide-fincash-cream/5">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full px-4 py-3 text-left transition hover:bg-fincash-ink/5 dark:hover:bg-fincash-cream/5 ${
                      !notification.read ? 'bg-fincash-forest/5 dark:bg-fincash-forest/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {!notification.read ? (
                          <div className="h-2 w-2 rounded-full bg-fincash-forest" />
                        ) : (
                          <Check size={14} className="text-fincash-ink/40 dark:text-fincash-cream/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-fincash-ink dark:text-fincash-cream">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs text-fincash-ink/70 dark:text-fincash-cream/70 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[10px] text-fincash-ink/50 dark:text-fincash-cream/50">
                          {formatRelativeTime(new Date(notification.createdAt))}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
