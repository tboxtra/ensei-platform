# Service Account Setup for Firebase Admin Scripts

## Quick Setup (5 minutes)

### Step 1: Download Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/project/ensei-6c8e0/settings/serviceaccounts/adminsdk)
2. Click "Generate new private key"
3. Download the JSON file
4. Save it as: `/Users/mac/Desktop/Ensei Alexis/ensei-platform/service-account-key.json`

### Step 2: Run the Script
```bash
cd "/Users/mac/Desktop/Ensei Alexis/ensei-platform"
node scripts/create-user-stats-with-auth.js
```

### Step 3: Verify
1. Check Firebase Console → Firestore → `users/mDPgwAwb1pYqmxmsPsYW1b4qlup2/stats/summary`
2. Refresh your app
3. QuickStats should now show real numbers instead of zeros

## Alternative: Manual Creation via Firebase Console

If you prefer not to use scripts:

1. Go to [Firebase Console](https://console.firebase.google.com/project/ensei-6c8e0/firestore)
2. Navigate to `users` → `mDPgwAwb1pYqmxmsPsYW1b4qlup2`
3. Create subcollection `stats`
4. Create document `summary` with these fields:
   ```json
   {
     "missionsCreated": 1,
     "missionsCompleted": 1,
     "tasksDone": 3,
     "totalEarned": 150,
     "updatedAt": "2024-01-15T10:30:00Z"
   }
   ```

## Security Note
- The service account key gives full admin access to your Firebase project
- Keep it secure and don't commit it to version control
- Consider deleting it after use if you don't need it regularly
