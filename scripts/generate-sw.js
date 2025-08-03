import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the service worker template
const swTemplatePath = path.join(__dirname, '../public/firebase-messaging-sw.js');
const swTemplate = fs.readFileSync(swTemplatePath, 'utf8');

// Replace placeholders with actual environment variables
const swContent = swTemplate
  .replace('%VITE_FIREBASE_API_KEY%', process.env.VITE_FIREBASE_API_KEY || '')
  .replace('%VITE_FIREBASE_AUTH_DOMAIN%', process.env.VITE_FIREBASE_AUTH_DOMAIN || '')
  .replace('%VITE_FIREBASE_PROJECT_ID%', process.env.VITE_FIREBASE_PROJECT_ID || '')
  .replace('%VITE_FIREBASE_STORAGE_BUCKET%', process.env.VITE_FIREBASE_STORAGE_BUCKET || '')
  .replace('%VITE_FIREBASE_MESSAGING_SENDER_ID%', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '')
  .replace('%VITE_FIREBASE_APP_ID%', process.env.VITE_FIREBASE_APP_ID || '');

// Write the processed service worker to the dist directory
const distPath = path.join(__dirname, '../dist/firebase-messaging-sw.js');
fs.writeFileSync(distPath, swContent);

console.log('✅ Service worker generated with environment variables');
