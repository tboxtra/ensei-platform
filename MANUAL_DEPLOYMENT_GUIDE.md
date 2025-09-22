# Manual Deployment Guide - Mission Progress System

Since Firebase CLI authentication isn't working, here's how to deploy manually through the Firebase Console.

## 🎯 What We're Deploying

1. **Cloud Function**: `syncMissionProgress` - automatically syncs mission progress summaries
2. **Firestore Rules**: Updated to allow reading mission progress summaries  
3. **Composite Indexes**: Added for efficient queries
4. **TypeScript Types & Library**: Ready for future use

## 📋 Step-by-Step Manual Deployment

### Step 1: Deploy Cloud Function

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select Project**: `ensei-6c8e0`
3. **Navigate to Functions**:
   - Click **Functions** in the left sidebar
   - If first time, click **Get started**
4. **Deploy Function**:
   - Click **Deploy** → **Upload from local**
   - Or click **Edit** and paste the function code
5. **Function Code** (copy from `functions/src/index.ts`):
   ```typescript
   export const syncMissionProgress = functions.firestore
     .document('mission_participations/{participationId}')
     .onWrite(async (change, context) => {
       // ... (full function code from the file)
     });
   ```

### Step 2: Update Firestore Rules

1. **Go to Firestore**:
   - Click **Firestore Database** in the left sidebar
   - Click **Rules** tab
2. **Replace Rules**:
   - Copy the entire content from `firestore.rules`
   - Paste it into the rules editor
   - Click **Publish**

### Step 3: Add Composite Indexes

1. **Go to Indexes**:
   - In Firestore, click **Indexes** tab
   - Click **Add Index**
2. **Add First Index**:
   - Collection: `mission_progress`
   - Fields:
     - `userId` (Ascending)
     - `missionCompleted` (Ascending)  
     - `updatedAt` (Descending)
3. **Add Second Index**:
   - Collection: `mission_progress`
   - Fields:
     - `missionId` (Ascending)
     - `missionCompleted` (Ascending)
     - `updatedAt` (Descending)

## 🧪 Testing the Deployment

### Test 1: Verify Function is Active
1. Go to **Functions** → **syncMissionProgress**
2. Check that it shows as "Active"
3. Look for any error messages

### Test 2: Complete a Task
1. Go to your app: https://ensei-platform.vercel.app/missions
2. Complete/verify a task on any mission
3. Check **Functions** → **syncMissionProgress** → **Logs**
4. You should see logs indicating the function ran

### Test 3: Check Mission Progress Collection
1. Go to **Firestore Database** → **Data**
2. Look for a new collection: `mission_progress`
3. Find a document with format: `{missionId}_{userId}`
4. Verify it contains: `verifiedTaskIds`, `verifiedCount`, `totalTasks`, `missionCompleted`

## 🎉 Expected Results

After deployment:
- ✅ **Function Active**: `syncMissionProgress` shows as active
- ✅ **Rules Updated**: Firestore rules allow reading mission progress
- ✅ **Indexes Building**: Composite indexes show as "Building" then "Ready"
- ✅ **Auto-Sync**: When users complete tasks, summaries are created automatically
- ✅ **UI Unchanged**: Progress badge continues working exactly as before

## 🔧 Troubleshooting

### Function Not Triggering?
- Check that the trigger path matches your `mission_participations` collection
- Verify the function is active and has no errors
- Check that task status actually changes to "verified"

### Permission Denied?
- Ensure Firestore rules are published
- Check that the function uses Admin SDK (it does)
- Verify the service account has proper permissions

### Index Still Building?
- This is normal after deployment
- Reads will work for unindexed queries
- Composite queries will show "needs index" until ready

## 📊 What's Now Available

Once deployed, you'll have:
- **Real-time Mission Progress**: Automatic summaries for every user+mission
- **Fast Queries**: Single document reads instead of complex aggregations  
- **Analytics Ready**: Foundation for dashboards, leaderboards, progress tracking
- **Backward Compatible**: Existing UI continues working unchanged

The mission progress summary system will automatically start working for all future task completions! 🚀
