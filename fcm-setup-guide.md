# 🔔 Firebase Cloud Messaging (FCM) Setup Guide
## Project: pawsome-new

## Step 1: Enable Cloud Messaging in Firebase Console

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/project/pawsome-new/settings/cloudmessaging

2. **Enable Cloud Messaging:**
   - If not already enabled, click "Enable" 
   - The service should be automatically available

## Step 2: Generate Web Push Certificates (VAPID Keys)

1. **In the Firebase Console, go to Cloud Messaging settings:**
   - https://console.firebase.google.com/project/pawsome-new/settings/cloudmessaging

2. **Under "Web configuration" section:**
   - Click "Generate key pair" (if no keys exist)
   - Or copy the existing VAPID key

3. **Copy the VAPID Key:**
   - It will look like: `BHd3VDw-xyz123...` (Base64 string)
   - Save this for your environment variables

## Step 3: Update Environment Variables

Create/update your `.env` file with:

```env
# Existing Firebase config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=pawsome-new.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pawsome-new
VITE_FIREBASE_STORAGE_BUCKET=pawsome-new.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Add FCM VAPID Key
VITE_FIREBASE_VAPID_KEY=your-vapid-key-from-step-2

# App URL
VITE_APP_URL=https://pawsome-new.web.app
```

## Step 4: Verify Service Worker

Your service worker should be at `/public/firebase-messaging-sw.js`. Let's check it exists and is properly configured.

## Step 5: Deploy Cloud Functions (Optional but Recommended)

Your app has FCM Cloud Functions for sending notifications. To enable them:

1. **Upgrade to Blaze Plan** (pay-as-you-go):
   - Go to: https://console.firebase.google.com/project/pawsome-new/usage/details
   - Click "Modify plan" → "Blaze"

2. **Deploy Functions:**
   ```bash
   firebase deploy --only functions --project=pawsome-new
   ```

## Step 6: Test FCM Notifications

1. **Test from Firebase Console:**
   - Go to: https://console.firebase.google.com/project/pawsome-new/messaging
   - Click "Send your first message"
   - Enter title, text, and target your domain

2. **Test from your app:**
   - Use the notification settings in your app
   - Check browser permissions for notifications

## FCM Features in Your App:

✅ **Service Worker** - Handles background notifications
✅ **Token Management** - Stores FCM tokens per user  
✅ **Cloud Functions** - Automated notification sending
✅ **Notification Settings** - User preference management
✅ **Foreground Notifications** - In-app notification display

## Troubleshooting:

- **Notifications not working?** Check browser permissions
- **Service worker errors?** Verify `/firebase-messaging-sw.js` exists
- **Cloud functions failing?** Ensure Blaze plan is enabled
- **VAPID key errors?** Verify the key is correctly set in environment variables

## Security Notes:

- VAPID keys are public and safe to expose in client code
- FCM tokens are user-specific and automatically managed
- Service workers must be served from your domain root

Ready to enable FCM? Follow the steps above! 🚀
