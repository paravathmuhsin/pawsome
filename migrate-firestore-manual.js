#!/usr/bin/env node

/**
 * Firestore Database Migration Script
 * From: pawsome-40415 → To: pawsome-new
 * 
 * This script migrates data without requiring billing (free tier friendly)
 * 
 * Prerequisites:
 * 1. npm install firebase-admin
 * 2. Get service account keys for both projects
 * 3. Save them as pawsome-40415-key.json and pawsome-new-key.json
 */

import admin from 'firebase-admin';
import fs from 'fs';

// Initialize source Firebase app
let sourceApp, destApp, sourceDb, destDb;

try {
  // Check if service account files exist
  if (!fs.existsSync('./pawsome-40415-key.json')) {
    console.error('❌ Missing: pawsome-40415-key.json');
    console.log('📥 Download from: https://console.firebase.google.com/project/pawsome-40415/settings/serviceaccounts/adminsdk');
    process.exit(1);
  }

  if (!fs.existsSync('./pawsome-new-key.json')) {
    console.error('❌ Missing: pawsome-new-key.json');
    console.log('📥 Download from: https://console.firebase.google.com/project/pawsome-new/settings/serviceaccounts/adminsdk');
    process.exit(1);
  }

  // Initialize Firebase apps
  sourceApp = admin.initializeApp({
    credential: admin.credential.cert('./pawsome-40415-key.json'),
    projectId: 'pawsome-40415'
  }, 'source');

  destApp = admin.initializeApp({
    credential: admin.credential.cert('./pawsome-new-key.json'),
    projectId: 'pawsome-new'
  }, 'dest');

  sourceDb = admin.firestore(sourceApp);
  destDb = admin.firestore(destApp);

  console.log('✅ Firebase apps initialized successfully');

} catch (error) {
  console.error('❌ Error initializing Firebase:', error.message);
  process.exit(1);
}

// Collection names to migrate
const COLLECTIONS = [
  'users',
  'posts', 
  'events',
  'eventResponses',
  'comments',
  'polls',
  'pollVotes',
  'adoptions',
  'adoptionPosts',
  'notifications'
  // Skip 'fcmNotifications' as they're temporary
];

async function migrateCollection(collectionName) {
  console.log(`\n🔄 Migrating collection: ${collectionName}`);
  
  try {
    const snapshot = await sourceDb.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`⚠️  Collection ${collectionName} is empty, skipping...`);
      return;
    }

    console.log(`📋 Found ${snapshot.size} documents in ${collectionName}`);
    
    // Process documents in batches (Firestore batch limit is 500)
    const batchSize = 450; // Leave some margin
    const docs = snapshot.docs;
    
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = destDb.batch();
      const batchDocs = docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        const destRef = destDb.collection(collectionName).doc(doc.id);
        const data = doc.data();
        
        // Convert Firestore Timestamps if any
        const convertedData = convertTimestamps(data);
        batch.set(destRef, convertedData);
      });
      
      await batch.commit();
      console.log(`✅ Migrated batch ${Math.floor(i/batchSize) + 1} (${batchDocs.length} documents) for ${collectionName}`);
    }
    
    console.log(`🎉 Successfully migrated ${docs.length} documents from ${collectionName}`);
    
  } catch (error) {
    console.error(`❌ Error migrating ${collectionName}:`, error.message);
    throw error;
  }
}

// Helper function to convert Firestore Timestamps
function convertTimestamps(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (obj instanceof admin.firestore.Timestamp) {
    return obj; // Keep as Timestamp
  }
  
  if (obj._seconds !== undefined && obj._nanoseconds !== undefined) {
    // Convert timestamp-like objects back to Firestore Timestamp
    return new admin.firestore.Timestamp(obj._seconds, obj._nanoseconds);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertTimestamps);
  }
  
  if (typeof obj === 'object') {
    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertTimestamps(value);
    }
    return converted;
  }
  
  return obj;
}

async function migrate() {
  console.log('🚀 Starting Firestore database migration...');
  console.log('📊 Source: pawsome-40415');
  console.log('📊 Destination: pawsome-new');
  console.log('🏷️  Collections to migrate:', COLLECTIONS.join(', '));
  
  const startTime = Date.now();
  let totalDocuments = 0;
  
  for (const collection of COLLECTIONS) {
    try {
      const beforeCount = await getCollectionCount(destDb, collection);
      await migrateCollection(collection);
      const afterCount = await getCollectionCount(destDb, collection);
      const migrated = afterCount - beforeCount;
      totalDocuments += migrated;
      
    } catch (error) {
      console.error(`💥 Failed to migrate ${collection}:`, error.message);
      console.log('⏭️  Continuing with next collection...');
    }
  }
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log('\n🎉 Migration completed!');
  console.log(`📊 Total documents migrated: ${totalDocuments}`);
  console.log(`⏱️  Total time: ${duration} seconds`);
  console.log('\n📋 Next steps:');
  console.log('1. Deploy Firestore rules: firebase deploy --only firestore:rules');
  console.log('2. Deploy Firestore indexes: firebase deploy --only firestore:indexes');
  console.log('3. Test your application with the new database');
  console.log('4. Update environment variables to point to pawsome-new');
}

async function getCollectionCount(db, collectionName) {
  try {
    const snapshot = await db.collection(collectionName).get();
    return snapshot.size;
  } catch (error) {
    return 0;
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Migration interrupted by user');
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled error:', error.message);
  process.exit(1);
});

// Run migration
migrate().catch(error => {
  console.error('💥 Migration failed:', error.message);
  process.exit(1);
});
