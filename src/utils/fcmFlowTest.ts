// Comprehensive FCM Flow Test
import { collection, addDoc, serverTimestamp, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { sendPushNotification } from '../services/fcmService';
import { getUserData } from '../services/userService';

export const testCompleteNotificationFlow = async (): Promise<void> => {
  try {
    console.log('🧪 Starting Complete FCM Flow Test...');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ No user logged in');
      return;
    }
    
    const userId = currentUser.uid;
    console.log('👤 Testing for user:', userId);
    
    // Step 1: Check if user has FCM token
    console.log('\n📋 Step 1: Checking FCM Token...');
    const userData = await getUserData(userId);
    console.log('FCM Token Present:', userData?.fcmToken ? '✅ Yes' : '❌ No');
    if (userData?.fcmToken) {
      console.log('Token Preview:', userData.fcmToken.substring(0, 20) + '...');
      console.log('Token Updated At:', userData.fcmTokenUpdatedAt);
    }
    
    // Step 2: Test direct FCM notification creation
    console.log('\n📋 Step 2: Creating FCM Notification Document...');
    const fcmNotificationData = {
      userId: userId,
      title: '🧪 Direct FCM Test',
      body: 'Testing FCM notification creation directly',
      data: {
        type: 'like',
        postId: 'test-post-123',
        likerId: 'test-user-456',
        likerName: 'Test User'
      },
      createdAt: serverTimestamp(),
      processed: false
    };
    
    const fcmNotificationsRef = collection(db, 'fcmNotifications');
    const fcmDocRef = await addDoc(fcmNotificationsRef, fcmNotificationData);
    console.log('✅ FCM Notification document created:', fcmDocRef.id);
    
    // Step 3: Check if document was created
    console.log('\n📋 Step 3: Verifying Document Creation...');
    const createdDoc = await getDoc(fcmDocRef);
    if (createdDoc.exists()) {
      console.log('✅ Document exists in Firestore');
      console.log('Document Data:', createdDoc.data());
    } else {
      console.log('❌ Document not found');
    }
    
    // Step 4: Wait and check if Cloud Function processed it
    console.log('\n📋 Step 4: Waiting for Cloud Function Processing...');
    console.log('⏳ Waiting 5 seconds...');
    
    setTimeout(async () => {
      try {
        const updatedDoc = await getDoc(fcmDocRef);
        if (updatedDoc.exists()) {
          const data = updatedDoc.data();
          console.log('Cloud Function Processed:', data.processed ? '✅ Yes' : '❌ No');
          if (data.processed) {
            console.log('Processed At:', data.processedAt);
            console.log('Message ID:', data.messageId || 'N/A');
            if (data.error) {
              console.log('❌ Error:', data.error);
            }
          }
        }
      } catch (error) {
        console.error('Error checking processed status:', error);
      }
    }, 5000);
    
    // Step 5: Test the sendPushNotification service function
    console.log('\n📋 Step 5: Testing sendPushNotification Service...');
    const serviceResult = await sendPushNotification(
      userId,
      '🧪 Service Test',
      'Testing via sendPushNotification service',
      {
        type: 'like',
        postId: 'service-test-123',
        likerId: userId,
        likerName: 'Service Test'
      }
    );
    
    console.log('Service Function Result:', serviceResult ? '✅ Success' : '❌ Failed');
    
    // Step 6: Check recent FCM notification documents
    console.log('\n📋 Step 6: Checking Recent FCM Notifications...');
    const recentNotificationsQuery = query(
      collection(db, 'fcmNotifications'),
      where('userId', '==', userId)
    );
    
    const recentNotifications = await getDocs(recentNotificationsQuery);
    console.log('Total FCM Notifications for user:', recentNotifications.size);
    
    recentNotifications.docs.forEach((docSnapshot, index) => {
      const data = docSnapshot.data();
      console.log(`Notification ${index + 1}:`, {
        id: docSnapshot.id,
        title: data.title,
        processed: data.processed,
        createdAt: data.createdAt,
        error: data.error || 'None'
      });
    });
    
    console.log('\n✅ Complete FCM Flow Test Finished!');
    console.log('Check the above results and wait 5 seconds for Cloud Function processing results.');
    
  } catch (error) {
    console.error('❌ Error in complete FCM flow test:', error);
  }
};

// Check browser notification API status
export const checkBrowserNotificationAPI = (): void => {
  console.log('🔍 Browser Notification API Status:');
  
  if (!('Notification' in window)) {
    console.log('❌ Notification API not supported');
    return;
  }
  
  console.log('✅ Notification API supported');
  console.log('Permission:', Notification.permission);
  
  if ('serviceWorker' in navigator) {
    console.log('✅ Service Worker supported');
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log('Service Worker Registrations:', registrations.length);
      registrations.forEach((reg, i) => {
        console.log(`SW ${i + 1}:`, reg.scope, reg.active ? '(Active)' : '(Inactive)');
      });
    });
  } else {
    console.log('❌ Service Worker not supported');
  }
  
  // Check if push messaging is supported
  if ('PushManager' in window) {
    console.log('✅ Push Manager supported');
  } else {
    console.log('❌ Push Manager not supported');
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  (window as { fcmFlowTest?: { testCompleteNotificationFlow: typeof testCompleteNotificationFlow; checkBrowserNotificationAPI: typeof checkBrowserNotificationAPI } }).fcmFlowTest = {
    testCompleteNotificationFlow,
    checkBrowserNotificationAPI
  };
  
  console.log('🔧 FCM Flow Test available as:');
  console.log('  window.fcmFlowTest.testCompleteNotificationFlow()');
  console.log('  window.fcmFlowTest.checkBrowserNotificationAPI()');
}
