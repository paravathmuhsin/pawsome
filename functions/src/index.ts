import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// Function to send FCM push notifications
export const sendFCMNotification = functions.firestore
  .document('fcmNotifications/{notificationId}')
  .onCreate(async (snap) => {
    console.log('🚀 FCM Cloud Function triggered for document:', snap.id);
    
    try {
      const notificationData = snap.data();
      console.log('📋 Notification data:', JSON.stringify(notificationData, null, 2));
      
      if (notificationData.processed) {
        console.log('⚠️ Already processed, skipping');
        return null; // Already processed
      }

      const { userId, title, body, data } = notificationData;
      console.log('👤 Processing notification for user:', userId);

      // Get user's FCM token
      console.log('🔍 Fetching user document...');
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        console.error('❌ User not found:', userId);
        await snap.ref.update({ 
          processed: true, 
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
          error: 'User not found'
        });
        return null;
      }

      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;
      console.log('🔑 FCM Token present:', fcmToken ? 'Yes' : 'No');

      if (!fcmToken) {
        console.log('⚠️ No FCM token for user:', userId);
        // Mark as processed even if no token
        await snap.ref.update({ 
          processed: true, 
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
          error: 'No FCM token'
        });
        return null;
      }

      // Create the FCM message
      const message = {
        token: fcmToken,
        notification: {
          title: title,
          body: body,
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        webpush: {
          fcmOptions: {
            link: data.postId ? `/posts/${data.postId}` : '/',
          },
        },
      };

      console.log('📤 Sending FCM message:', JSON.stringify(message, null, 2));

      // Send the notification
      const response = await messaging.send(message);
      console.log('✅ Successfully sent message:', response);

      // Mark as processed
      await snap.ref.update({ 
        processed: true, 
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        messageId: response 
      });

      return response;
    } catch (error) {
      console.error('❌ Error sending FCM notification:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Mark as processed with error
      await snap.ref.update({ 
        processed: true, 
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        error: errorMessage 
      });
      
      return null;
    }
  });

// Clean up old processed notifications (optional)
export const cleanupOldNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const oldNotifications = await db
      .collection('fcmNotifications')
      .where('processed', '==', true)
      .where('processedAt', '<', threeDaysAgo)
      .get();

    const batch = db.batch();
    oldNotifications.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Cleaned up ${oldNotifications.size} old notifications`);
    return null;
  });
