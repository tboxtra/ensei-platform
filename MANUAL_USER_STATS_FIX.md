# Manual User Stats Fix

## Quick Fix for QuickStats Zeros

Since the automated script needs authentication, here's how to manually create the user stats document:

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/ensei-6c8e0/firestore)
2. Navigate to Firestore Database
3. Go to the `users` collection

### Step 2: Create User Stats Document
1. Find your user document: `mDPgwAwb1pYqmxmsPsYW1b4qlup2` (from your screenshot)
2. Click on the user document
3. Create a new subcollection called `stats`
4. In the `stats` subcollection, create a document with ID `summary`
5. Add these fields to the `summary` document:

```json
{
  "missionsCreated": 1,
  "missionsCompleted": 1,
  "tasksDone": 3,
  "totalEarned": 150,
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Step 3: Verify
1. Save the document
2. Refresh your app
3. Check that QuickStats now shows real numbers instead of zeros

## Alternative: Run the Script (if you have Firebase CLI access)

```bash
cd "/Users/mac/Desktop/Ensei Alexis/ensei-platform"
node scripts/create-test-user-stats.js
```

## Expected Result
After creating the document, your QuickStats should show:
- Missions Created: 1
- Missions Completed: 1  
- Tasks Done: 3
- Total Earned: 150

Instead of all zeros.
