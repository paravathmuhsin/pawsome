# 🔄 Database Migration: pawsome-40415 → pawsome-new

## Current Status: ⚠️ Billing Required for gcloud method

Since your projects don't have billing enabled, we have **two options**:

## Option 1: Enable Billing (Recommended for large datasets)

1. **Enable billing** for your projects:
   - Go to: https://console.cloud.google.com/billing
   - Link a billing account to both projects
   - **Note:** Free tier includes generous quotas for Firestore operations

2. **Use the gcloud export/import method** (from `database-migration-guide.md`)

## Option 2: Use the Manual Migration Script (Free Tier Friendly) ✅

### Step 1: Install Dependencies
```bash
npm install firebase-admin
```

### Step 2: Get Service Account Keys

1. **For pawsome-40415:**
   - Go to: https://console.firebase.google.com/project/pawsome-40415/settings/serviceaccounts/adminsdk
   - Click "Generate new private key"
   - Save as `pawsome-40415-key.json`

2. **For pawsome-new:**
   - Go to: https://console.firebase.google.com/project/pawsome-new/settings/serviceaccounts/adminsdk
   - Click "Generate new private key" 
   - Save as `pawsome-new-key.json`

### Step 3: Run Migration
```bash
# Make sure you're in the project directory
cd /Users/mmuhsin/Library/CloudStorage/OneDrive-Chewy.com,LLC/Desktop/Projects/pawsome

# Run the migration script
node migrate-firestore-manual.js
```

### Step 4: Deploy Rules and Indexes
```bash
# Deploy Firestore rules to new project
firebase deploy --only firestore:rules --project=pawsome-new

# Deploy Firestore indexes to new project  
firebase deploy --only firestore:indexes --project=pawsome-new
```

## What Gets Migrated:

✅ **Collections included:**
- users
- posts
- events
- eventResponses  
- comments
- polls
- pollVotes
- adoptions
- adoptionPosts
- notifications

⚠️ **Collections excluded:**
- fcmNotifications (temporary data, will be regenerated)

## Migration Features:

- 🔄 **Batch processing** (450 docs per batch)
- ⏱️ **Progress tracking** with timing
- 🛡️ **Error handling** (continues if one collection fails)
- 📊 **Document counting** and verification
- 🔧 **Timestamp conversion** (preserves Firestore timestamps)

## Expected Output:
```
🚀 Starting Firestore database migration...
📊 Source: pawsome-40415
📊 Destination: pawsome-new

🔄 Migrating collection: users
📋 Found 150 documents in users
✅ Migrated batch 1 (150 documents) for users
🎉 Successfully migrated 150 documents from users

... (continues for each collection)

🎉 Migration completed!
📊 Total documents migrated: 1,247
⏱️ Total time: 45 seconds
```

## After Migration:

1. ✅ **Verify data** in Firebase Console
2. ✅ **Test your application** with pawsome-new
3. ✅ **Update environment variables**
4. ✅ **Deploy your app** to Firebase hosting

## Need Help?

If you encounter any issues:
1. Check that both service account files are in the correct location
2. Verify that both Firebase projects have Firestore enabled
3. Ensure you have proper permissions on both projects

**Ready to proceed?** Download the service account keys and run the migration! 🚀
