import { 
  getToken, 
  onMessage, 
  deleteToken,
  type Messaging,
  type MessagePayload 
} from 'firebase/messaging';
import { 
  doc, 
  updateDoc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, initializeMessaging } from '../firebase/config';

// FCM VAPID key (you'll need to generate this in Firebase Console)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let messagingInstance: Messaging | null = null;

// Initialize FCM
export const initializeFCM = async (): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    // Register service worker
    await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    
    // Initialize messaging
    messagingInstance = await initializeMessaging();
    
    if (!messagingInstance) {
      console.warn('Firebase messaging not supported');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error initializing FCM:', error);
    return false;
  }
};

// Request FCM permission and get token
export const requestFCMPermission = async (userId: string): Promise<string | null> => {
  try {
    if (!messagingInstance) {
      console.warn('FCM not initialized');
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Get FCM token
    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
    });

    if (token) {
      console.log('FCM Token:', token);
      
      // Save token to user document
      await saveFCMTokenToUser(userId, token);
      
      return token;
    } else {
      console.warn('No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Save FCM token to user document
const saveFCMTokenToUser = async (userId: string, token: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      fcmToken: token,
      fcmTokenUpdatedAt: serverTimestamp()
    });
    console.log('FCM token saved to user document');
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: MessagePayload) => void): (() => void) | null => {
  if (!messagingInstance) {
    console.warn('FCM not initialized');
    return null;
  }

  return onMessage(messagingInstance, (payload) => {
    console.log('Foreground message received:', payload);
    
    // Show browser notification for foreground messages
    if (payload.notification) {
      const { title, body, icon } = payload.notification;
      
      if (Notification.permission === 'granted') {
        const notification = new Notification(title || 'New Notification', {
          body: body || '',
          icon: icon || '/favicon.ico',
          tag: 'pawsome-fcm-notification',
          data: payload.data
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
          // Handle notification click
          callback(payload);
        };

        // Auto close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    }
    
    callback(payload);
  });
};

// Delete FCM token (for logout)
export const deleteFCMToken = async (userId: string): Promise<void> => {
  try {
    if (!messagingInstance) {
      return;
    }

    await deleteToken(messagingInstance);
    
    // Remove token from user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      fcmToken: null,
      fcmTokenUpdatedAt: serverTimestamp()
    });
    
    console.log('FCM token deleted');
  } catch (error) {
    console.error('Error deleting FCM token:', error);
  }
};

// Store notification in Firestore (for FCM integration)
export const storeFCMNotification = async (notificationData: {
  userId: string;
  title: string;
  body: string;
  type: 'adoption' | 'event';
  postId: string;
  data?: Record<string, string>;
}): Promise<string> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false,
      delivered: false,
      fcm: true // Mark as FCM notification
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error storing FCM notification:', error);
    throw error;
  }
};

// Check if FCM is supported
export const isFCMSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'Notification' in window;
};
