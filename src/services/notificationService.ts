import { 
  doc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  serverTimestamp,
  type Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getUserData, type GeoLocation } from './userService';
import { isWithinRadius, extractLocationFromPost } from '../utils/geolocation';

// Global notification refresh callback (to be set by NotificationContext)
let globalNotificationRefreshCallback: (() => Promise<void>) | null = null;

export const setNotificationRefreshCallback = (callback: (() => Promise<void>) | null) => {
  globalNotificationRefreshCallback = callback;
};

// Helper function to trigger global notification refresh
const triggerGlobalRefresh = async () => {
  if (globalNotificationRefreshCallback) {
    try {
      await globalNotificationRefreshCallback();
    } catch (error) {
      console.error('Error triggering global notification refresh:', error);
    }
  }
};

export interface NotificationData {
  id?: string;
  userId: string;
  title: string;
  body: string;
  type: 'adoption' | 'event';
  postId: string;
  postLocation?: GeoLocation;
  distance?: number; // Distance in km from user's location
  createdAt: Timestamp;
  read: boolean;
  delivered: boolean;
}

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Show browser notification
export const showBrowserNotification = (title: string, body: string): void => {
  if (Notification.permission !== 'granted') {
    return;
  }

  try {
    const notification = new Notification(title, {
      body,
      tag: 'pawsome-notification',
      requireInteraction: false,
      silent: false,
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Store notification in Firestore
export const storeNotification = async (notificationData: Omit<NotificationData, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      createdAt: serverTimestamp()
    });
    
    // Trigger global refresh after storing notification
    await triggerGlobalRefresh();
    
    return docRef.id;
  } catch (error) {
    console.error('Error storing notification:', error);
    throw error;
  }
};

// Get user notifications
export const getUserNotifications = async (userId: string, limitCount = 20): Promise<NotificationData[]> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    
    // Use a simpler query to avoid requiring composite index
    // We'll filter by userId and sort in memory
    const q = query(
      notificationsRef,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NotificationData));
    
    // Sort by createdAt descending in memory and limit
    return notifications
      .sort((a, b) => {
        const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
        const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
        return timeB - timeA; // Descending order (newest first)
      })
      .slice(0, limitCount);
      
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// Check if user should receive notification for a post
export const shouldNotifyUser = async (
  userId: string, 
  post: { location?: { latitude?: number; longitude?: number; lat?: number; lng?: number } },
  postType: 'adoption' | 'event'
): Promise<{ shouldNotify: boolean; distance?: number }> => {
  try {
    const userData = await getUserData(userId);
    
    if (!userData || !userData.location || !userData.notificationSettings) {
      return { shouldNotify: false };
    }

    const { notificationSettings } = userData;
    
    // Check if notifications are enabled for this type
    if (!notificationSettings.pushNotificationsEnabled ||
        (postType === 'adoption' && !notificationSettings.adoptionNotifications) ||
        (postType === 'event' && !notificationSettings.eventNotifications)) {
      return { shouldNotify: false };
    }

    // Check if post has location
    const postLocation = extractLocationFromPost(post);
    if (!postLocation) {
      return { shouldNotify: false };
    }

    // Check if within radius
    const radius = notificationSettings.notificationRadius || 50;
    const withinRadius = isWithinRadius(userData.location, postLocation, radius);
    
    if (withinRadius) {
      const distance = Math.round(
        Math.sqrt(
          Math.pow(userData.location.latitude - postLocation.latitude, 2) +
          Math.pow(userData.location.longitude - postLocation.longitude, 2)
        ) * 111 // Approximate km per degree
      );
      
      return { shouldNotify: true, distance };
    }

    return { shouldNotify: false };
  } catch (error) {
    console.error('Error checking notification eligibility:', error);
    return { shouldNotify: false };
  }
};

// Send notification to eligible users
export const notifyEligibleUsers = async (
  post: { 
    id: string;
    title?: string;
    petName?: string;
    eventName?: string;
    description?: string;
    location?: { latitude?: number; longitude?: number; lat?: number; lng?: number };
    createdBy: string;
  },
  postType: 'adoption' | 'event'
): Promise<void> => {
  try {
    // Get all users with notification settings
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('notificationSettings.pushNotificationsEnabled', '==', true));
    const querySnapshot = await getDocs(q);

    const notificationPromises = querySnapshot.docs.map(async (userDoc) => {
      const userId = userDoc.id;
      
      // Don't notify the creator of the post
      if (userId === post.createdBy) {
        return;
      }

      const { shouldNotify, distance } = await shouldNotifyUser(userId, post, postType);
      
      if (shouldNotify) {
        const title = postType === 'adoption' 
          ? `🐾 New Pet Available for Adoption`
          : `📅 New Event Near You`;
          
        const body = postType === 'adoption'
          ? `${post.petName || 'A pet'} is available for adoption${distance ? ` ${distance}km away` : ' near you'}`
          : `${post.eventName || 'An event'} has been posted${distance ? ` ${distance}km away` : ' near you'}`;

        // Store notification in database
        await storeNotification({
          userId,
          title,
          body,
          type: postType,
          postId: post.id,
          postLocation: extractLocationFromPost(post) || undefined,
          distance,
          read: false,
          delivered: false
        });

        // Show browser notification
        showBrowserNotification(title, body);
      }
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error notifying users:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
    
    // Trigger global refresh after marking as read
    await triggerGlobalRefresh();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Test function to create a sample notification (for development/testing)
export const createTestNotification = async (userId: string): Promise<string> => {
  try {
    // First check and request permission
    const hasPermission = await requestNotificationPermission();
    
    if (!hasPermission) {
      throw new Error('Notification permission not granted');
    }
    
    // Show browser notification immediately
    showBrowserNotification(
      '🧪 Test Notification',
      'This is a test notification to verify the system is working correctly.'
    );
    
    // Store in database
    const notificationId = await storeNotification({
      userId,
      title: '🧪 Test Notification',
      body: 'This is a test notification to verify the system is working correctly.',
      type: 'adoption',
      postId: 'test-post-id',
      distance: 25,
      read: false,
      delivered: true
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error creating test notification:', error);
    throw error;
  }
};
