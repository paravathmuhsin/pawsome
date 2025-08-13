# Firestore Database Migration Guide
## From: pawsome-40415 → To: pawsome-new

## ⚠️ BILLING REQUIRED

**Important:** Cloud Storage and Firestore export/import require billing to be enabled on your Google Cloud projects. You'll need to:

1. **Enable billing** for both `pawsome-40415` and `pawsome-new` projects
2. Go to: https://console.cloud.google.com/billing
3. Link a billing account to your projects

## Method 1: Using Google Cloud CLI (Recommended - Requires Billing)

### Step 1: Install Google Cloud CLI
```bash
# For macOS using Homebrew
brew install --cask google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

### Step 2: Authenticate and Set Up
```bash
# Authenticate with Google Cloud
gcloud auth login

# Set default project to source project
gcloud config set project pawsome-40415

# Enable required APIs for both projects
gcloud services enable firestore.googleapis.com --project=pawsome-40415
gcloud services enable firestore.googleapis.com --project=pawsome-new
```

### Step 3: Create Cloud Storage Bucket for Export
```bash
# Create a bucket for the export (must be globally unique)
gsutil mb gs://pawsome-firestore-backup-$(date +%Y%m%d)

# Set the bucket name (replace with your actual bucket name)
BACKUP_BUCKET="pawsome-firestore-backup-$(date +%Y%m%d)"
```

### Step 4: Export from pawsome-40415
```bash
# Export all collections from source project
gcloud firestore export gs://$BACKUP_BUCKET/firestore-export \
  --project=pawsome-40415
```

### Step 5: Import to pawsome-new
```bash
# Import to destination project
gcloud firestore import gs://$BACKUP_BUCKET/firestore-export \
  --project=pawsome-new
```

### Step 6: Clean Up
```bash
# Remove the backup bucket after successful import
gsutil rm -r gs://$BACKUP_BUCKET
```

## Method 2: Using Firebase Admin SDK (Alternative)

If you prefer a programmatic approach, you can create a Node.js script:

### Step 1: Create Migration Script
Create `migrate-firestore.js`:

```javascript
const admin = require('firebase-admin');

// Initialize source Firebase app
const sourceApp = admin.initializeApp({
  credential: admin.credential.cert('./pawsome-40415-service-account.json'),
  projectId: 'pawsome-40415'
}, 'source');

// Initialize destination Firebase app
const destApp = admin.initializeApp({
  credential: admin.credential.cert('./pawsome-new-service-account.json'),
  projectId: 'pawsome-new'
}, 'dest');

const sourceDb = admin.firestore(sourceApp);
const destDb = admin.firestore(destApp);

async function migrateCollection(collectionName) {
  console.log(`Migrating collection: ${collectionName}`);
  
  const snapshot = await sourceDb.collection(collectionName).get();
  const batch = destDb.batch();
  
  snapshot.docs.forEach(doc => {
    const destRef = destDb.collection(collectionName).doc(doc.id);
    batch.set(destRef, doc.data());
  });
  
  await batch.commit();
  console.log(`✅ Migrated ${snapshot.size} documents from ${collectionName}`);
}

async function migrate() {
  const collections = [
    'users',
    'posts', 
    'events',
    'eventResponses',
    'comments',
    'polls',
    'pollVotes',
    'adoptions',
    'adoptionPosts',
    'notifications',
    'fcmNotifications'
  ];
  
  for (const collection of collections) {
    try {
      await migrateCollection(collection);
    } catch (error) {
      console.error(`Error migrating ${collection}:`, error);
    }
  }
  
  console.log('🎉 Migration completed!');
}

migrate().catch(console.error);
```

### Step 2: Get Service Account Keys
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key for both projects
3. Download and save as `pawsome-40415-service-account.json` and `pawsome-new-service-account.json`

### Step 3: Run Migration
```bash
npm install firebase-admin
node migrate-firestore.js
```

## Method 3: Manual Export/Import via Firebase Console (Limited)

1. **Firebase Console Export:**
   - Go to: https://console.firebase.google.com/project/pawsome-40415/firestore
   - This method is limited and not recommended for large datasets

2. **Import via Firebase CLI:**
   - Limited functionality for imports

## Recommended Approach

**Use Method 1 (Google Cloud CLI)** as it's the most reliable and handles large datasets efficiently.

## Important Notes

1. **Indexes:** You'll need to redeploy your Firestore indexes:
   ```bash
   firebase deploy --only firestore:indexes --project=pawsome-new
   ```

2. **Security Rules:** Deploy your security rules:
   ```bash
   firebase deploy --only firestore:rules --project=pawsome-new
   ```

3. **Storage Files:** If you have files in Firebase Storage, you'll need a separate migration for those.

4. **Test First:** Consider doing a test migration with a subset of data first.

## Verification

After migration, verify your data:
```bash
# Check document counts in both projects
gcloud firestore databases describe --project=pawsome-40415
gcloud firestore databases describe --project=pawsome-new
```
