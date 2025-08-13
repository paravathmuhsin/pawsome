# Firebase Environment Variables Setup

## Required Environment Variables

Create a `.env` file in your project root with these variables:

### Firebase Configuration
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=pawsome-new.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pawsome-new
VITE_FIREBASE_STORAGE_BUCKET=pawsome-new.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### FCM Configuration
```env
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

### App Configuration
```env
VITE_APP_URL=https://pawsome-new.web.app
```

## Firebase Console Steps:

### 1. Update Authorized Domains
- Go to: https://console.firebase.google.com/project/pawsome-new/authentication/settings
- Scroll to "Authorized domains"
- Click "Add domain"
- Add: `pawsome-new.web.app`
- Add: `localhost` (for local development)

### 2. Get VAPID Key (for push notifications)
- Go to: https://console.firebase.google.com/project/pawsome-new/settings/cloudmessaging
- Under "Web configuration", generate or copy your VAPID key
- Add it as `VITE_FIREBASE_VAPID_KEY` in your .env file

### 3. Update Storage CORS Settings
- Go to: https://console.firebase.google.com/project/pawsome-new/storage
- In Rules tab, ensure your domain is allowed

## Deployment Commands:

```bash
# Build the project
npm run build

# Deploy to Firebase hosting
firebase deploy --only hosting

# Deploy everything (hosting + functions + firestore)
firebase deploy
```

## Your Live URL:
**https://pawsome-new.web.app**
