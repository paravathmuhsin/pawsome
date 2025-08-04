// Test FCM Push Notification System
import { sendPushNotification } from '../services/fcmService';
import { auth } from '../firebase/config';

export const testFCMNotification = async (testUserId?: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser && !testUserId) {
      console.error('No user logged in and no test user ID provided');
      return;
    }

    const userId = testUserId || currentUser!.uid;
    console.log('Testing FCM notification for user:', userId);

    const success = await sendPushNotification(
      userId,
      '🧪 Test Notification',
      'This is a test push notification from Pawsome!',
      {
        type: 'like',
        postId: 'test-post-id',
        likerId: 'test-liker-id',
        likerName: 'Test User'
      }
    );

    if (success) {
      console.log('✅ Test notification sent successfully!');
    } else {
      console.error('❌ Failed to send test notification');
    }
  } catch (error) {
    console.error('Error testing FCM notification:', error);
  }
};

// Check FCM token status
export const checkFCMTokenStatus = async (): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    // Check if user has FCM token in Firestore
    const { getUserData } = await import('../services/userService');
    const userData = await getUserData(currentUser.uid);
    
    console.log('User FCM Token:', userData?.fcmToken ? 'Present ✅' : 'Missing ❌');
    console.log('FCM Token Updated At:', userData?.fcmTokenUpdatedAt);
    
    // Check notification permission
    if ('Notification' in window) {
      console.log('Browser Notification Permission:', Notification.permission);
    }
    
    // Check service worker registration
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('Service Worker Registrations:', registrations.length);
      registrations.forEach((reg, index) => {
        console.log(`SW ${index + 1}:`, reg.scope);
      });
    }
  } catch (error) {
    console.error('Error checking FCM token status:', error);
  }
};

// Debug console commands (for browser console)
if (typeof window !== 'undefined') {
  (window as { pawsomeDebug?: { testFCMNotification: typeof testFCMNotification; checkFCMTokenStatus: typeof checkFCMTokenStatus } }).pawsomeDebug = {
    testFCMNotification,
    checkFCMTokenStatus
  };
}
