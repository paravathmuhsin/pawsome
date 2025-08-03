// Import Firebase scripts for service workers
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Static Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDYbrnPQan84ZmKJPZ5gZ2mbw-ccr3f9Q",
  authDomain: "pawsome-40415.firebaseapp.com", 
  projectId: "pawsome-40415",
  storageBucket: "pawsome-40415.firebasestorage.app",
  messagingSenderId: "938394526676",
  appId: "1:938394526676:web:3efd64e20e92429ada6c41"
};

// Initialize Firebase immediately
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification here
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'pawsome-notification',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  // Handle the click action
  event.waitUntil(
    clients.openWindow('/')
  );
});
