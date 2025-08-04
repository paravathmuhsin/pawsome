// VAPID Key Validator
export const validateVapidKey = (vapidKey: string): boolean => {
  // VAPID keys should be:
  // - 65+ characters long
  // - Base64url encoded
  // - Usually start with "BH" or "BA"
  
  if (!vapidKey) {
    console.error('❌ VAPID key is empty');
    return false;
  }
  
  if (vapidKey.length < 65) {
    console.error(`❌ VAPID key too short: ${vapidKey.length} characters (minimum 65)`);
    return false;
  }
  
  // Check if it's base64url format (only contains valid characters)
  const base64urlPattern = /^[A-Za-z0-9_-]+$/;
  if (!base64urlPattern.test(vapidKey)) {
    console.error('❌ VAPID key contains invalid characters (not base64url)');
    return false;
  }
  
  console.log('✅ VAPID key format is valid');
  console.log(`Length: ${vapidKey.length} characters`);
  console.log(`Starts with: ${vapidKey.substring(0, 4)}...`);
  
  return true;
};

// Check current VAPID key
const currentVapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
console.log('🔑 Checking VAPID key configuration...');
validateVapidKey(currentVapidKey);

// Make it available for debugging
if (typeof window !== 'undefined') {
  (window as { vapidValidator?: typeof validateVapidKey }).vapidValidator = validateVapidKey;
}
