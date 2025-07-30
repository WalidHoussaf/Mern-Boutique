import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { playSound } from '../utils/soundManager';

const NotificationContext = createContext(null);
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
  
  const [deletedIds, setDeletedIds] = useState(() => {
    const saved = localStorage.getItem('deletedNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationSound');
    return saved ? JSON.parse(saved) === true : true;
  });

  // Function to fetch notifications that can be called manually
  const fetchNotifications = async () => {
    try {
      const userInfo = localStorage.getItem('user');
      if (!userInfo) return;

      const { data } = await axios.get('/api/notifications');
      
      // Convert server notifications to local format and filter out deleted ones
      const serverNotifications = data
        .filter(notification => !deletedIds.includes(notification._id))
        .map(notification => ({
          id: notification._id,
          message: notification.message,
          type: notification.type,
          timestamp: notification.createdAt,
          read: notification.read,
          title: notification.title,
          isServerNotification: true
        }));

      // Merge with existing local notifications
      setNotifications(prev => {
        const localNotifications = prev.filter(n => !n.isServerNotification);
        const merged = [...serverNotifications, ...localNotifications];
        return merged
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, MAX_NOTIFICATIONS);
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Initial fetch on mount and when deletedIds changes
  useEffect(() => {
    fetchNotifications();
  }, [deletedIds]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('deletedNotifications', JSON.stringify(deletedIds));
  }, [deletedIds]);

  useEffect(() => {
    localStorage.setItem('notificationSound', JSON.stringify(isSoundEnabled));
  }, [isSoundEnabled]);

  const playNotificationSound = (type) => {
    if (isSoundEnabled) {
      playSound(type);
    }
  };

  const addNotification = (message, type = 'info', title = '') => {
    if (!['success', 'error', 'warning', 'info'].includes(type)) {
      type = 'info';
    }

    setNotifications(prev => {
      // Check for duplicate notifications within the last 2 seconds
      const now = Date.now();
      const recentDuplicate = prev.find(notif => 
        notif.message === message && 
        notif.type === type &&
        (now - new Date(notif.timestamp).getTime()) < 2000
      );

      // If a duplicate notification exists, don't add a new one
      if (recentDuplicate) {
        return prev;
      }

      // Generate a unique ID by combining timestamp with a random string
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newNotifications = [{
        id: uniqueId,
        message,
        type,
        title,
        timestamp: new Date().toISOString(),
        read: false,
        isServerNotification: false
      }, ...prev];

      if (newNotifications.length > MAX_NOTIFICATIONS) {
        return newNotifications.slice(0, MAX_NOTIFICATIONS);
      }
      return newNotifications;
    });

    playNotificationSound(type);
  };

  const markAsRead = async (id) => {
    try {
      if (typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) {
        await axios.patch(`/api/notifications/${id}/read`);
      }
      
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Get all unread server notifications
      const unreadServerNotifications = notifications
        .filter(n => n.isServerNotification && !n.read)
        .map(n => n.id);

      // If there are unread server notifications, mark them as read in the backend
      if (unreadServerNotifications.length > 0) {
        await Promise.all(
          unreadServerNotifications.map(id => 
            axios.patch(`/api/notifications/${id}/read`)
          )
        );
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const removeNotification = (id) => {
    if (typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) {
      setDeletedIds(prev => [...prev, id]);
    }
    
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    const serverIds = notifications
      .filter(n => n.isServerNotification)
      .map(n => n.id);
    
    if (serverIds.length > 0) {
      setDeletedIds(prev => [...prev, ...serverIds]);
    }
    
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
      toggleSound,
      refreshNotifications: fetchNotifications // Expose the refresh function
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 