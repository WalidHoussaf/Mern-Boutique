import { createContext, useState, useContext, useEffect } from 'react';

const NotificationContext = createContext(null);

const NOTIFICATION_SOUND = new Audio('/notification-sound.mp3');
const MAX_NOTIFICATIONS = 50; 

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationSound');
    return saved ? JSON.parse(saved) === true : true;
  });

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('notificationSound', JSON.stringify(isSoundEnabled));
  }, [isSoundEnabled]);

  const playNotificationSound = () => {
    if (isSoundEnabled) {
      NOTIFICATION_SOUND.play().catch(() => {
        // Ignore errors - sound might not be supported or blocked
      });
    }
  };

  const addNotification = (message, type = 'info') => {
    if (!['success', 'error', 'warning', 'info'].includes(type)) {
      type = 'info';
    }

    setNotifications(prev => {
      const newNotifications = [{
        id: Date.now(),
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false
      }, ...prev];

      // Keep only the most recent notifications
      if (newNotifications.length > MAX_NOTIFICATIONS) {
        return newNotifications.slice(0, MAX_NOTIFICATIONS);
      }
      return newNotifications;
    });

    playNotificationSound();
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleSound = () => {
    setIsSoundEnabled(prev => !prev);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      unreadCount: notifications.filter(n => !n.read).length,
      isSoundEnabled,
      toggleSound
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 