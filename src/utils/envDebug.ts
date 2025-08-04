// Environment Variables Debug
console.log('🔍 Environment Variables Check:');
console.log('VITE_FIREBASE_API_KEY:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Present' : '❌ Missing');
console.log('VITE_FIREBASE_AUTH_DOMAIN:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Present' : '❌ Missing');
console.log('VITE_FIREBASE_PROJECT_ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Present' : '❌ Missing');
console.log('VITE_FIREBASE_STORAGE_BUCKET:', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅ Present' : '❌ Missing');
console.log('VITE_FIREBASE_MESSAGING_SENDER_ID:', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✅ Present' : '❌ Missing');
console.log('VITE_FIREBASE_APP_ID:', import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Present' : '❌ Missing');
console.log('VITE_FIREBASE_MEASUREMENT_ID:', import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ? '✅ Present' : '❌ Missing');
console.log('VITE_FIREBASE_VAPID_KEY:', import.meta.env.VITE_FIREBASE_VAPID_KEY ? '✅ Present' : '❌ Missing');

if (import.meta.env.VITE_FIREBASE_VAPID_KEY) {
  console.log('VAPID Key Length:', import.meta.env.VITE_FIREBASE_VAPID_KEY.length);
  console.log('VAPID Key Preview:', import.meta.env.VITE_FIREBASE_VAPID_KEY.substring(0, 10) + '...');
}
