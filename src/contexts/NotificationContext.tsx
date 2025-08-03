import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  requestNotificationPermission, 
  getUserNotifications,
  markNotificationAsRead,
  setNotificationRefreshCallback,
  type NotificationData 
} from '../services/notificationService';

interface NotificationContextType {
  notifications: NotificationData[];
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
  unreadCount: number;
  checkPermission: () => Promise<boolean>;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
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
      // Don't update local state here - let the global refresh handle it
      // This ensures consistency between database and UI
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Enhanced refresh function that also updates the context
  const refreshNotifications = useCallback(async () => {
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

  // Set up global refresh callback
  useEffect(() => {
    if (currentUser) {
      setNotificationRefreshCallback(refreshNotifications);
    } else {
      setNotificationRefreshCallback(null);
    }

    // Cleanup on unmount
    return () => {
      setNotificationRefreshCallback(null);
    };
  }, [currentUser, refreshNotifications]);

  // Check permission and fetch notifications on mount
  useEffect(() => {
    const initializeNotifications = async () => {
      if (currentUser) {
        await checkPermission();
        await fetchNotifications();
      } else {
        // Clear notifications when user logs out
        setNotifications([]);
        setError(null);
        setPermissionGranted(false);
      }
    };

    initializeNotifications();
  }, [currentUser, checkPermission, fetchNotifications]);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    loading,
    error,
    permissionGranted,
    unreadCount,
    checkPermission,
    fetchNotifications,
    markAsRead,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext };
export type { NotificationContextType };
