import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  requestNotificationPermission, 
  getUserNotifications,
  markNotificationAsRead,
  type NotificationData 
} from '../services/notificationService';

export const useNotifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Check and request notification permission
  const checkPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    return granted;
  }, []);

  // Fetch user notifications
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      const userNotifications = await getUserNotifications(currentUser.uid);
      setNotifications(userNotifications);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Check permission and fetch notifications on mount
  useEffect(() => {
    const initializeNotifications = async () => {
      if (currentUser) {
        await checkPermission();
        await fetchNotifications();
      }
    };

    initializeNotifications();
  }, [currentUser, checkPermission, fetchNotifications]);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    error,
    permissionGranted,
    unreadCount,
    checkPermission,
    fetchNotifications,
    markAsRead,
    refreshNotifications: fetchNotifications
  };
};
