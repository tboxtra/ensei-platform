# Cloud Functions Deployment Guide

## 🚀 Deploy New User Stats Functions

The following Cloud Functions need to be deployed to enable real-time Quick Stats:

### Functions to Deploy:
1. **`onVerificationWrite`** - Updates user stats when verifications are created/verified
2. **`onDegenWinnersChosen`** - Pays honors to degen mission winners
3. **`onMissionCreate`** - Increments missions created counter

### Deployment Steps:

#### Option 1: Using Firebase CLI (Recommended)
```bash
# 1. Login to Firebase (if not already logged in)
firebase login

# 2. Deploy the new functions
firebase deploy --only functions:onVerificationWrite,functions:onDegenWinnersChosen,functions:onMissionCreate --project ensei-6c8e0

# 3. Verify deployment
firebase functions:list --project ensei-6c8e0
```

#### Option 2: Deploy All Functions
```bash
# Deploy all functions (including existing ones)
firebase deploy --only functions --project ensei-6c8e0
```

#### Option 3: Using the Deployment Script
```bash
# Make script executable and run
chmod +x deploy-functions.sh
./deploy-functions.sh
```

### Verification:
After deployment, you should see these functions in the Firebase Console:
- Go to [Firebase Console](https://console.firebase.google.com/project/ensei-6c8e0/functions)
- Verify all 3 functions are listed and active
- Check function logs for any errors

### Expected Function Triggers:
- **onVerificationWrite**: Triggers on `verifications/{verificationId}` writes
- **onDegenWinnersChosen**: Triggers on `missions/{missionId}/tasks/{taskId}` updates
- **onMissionCreate**: Triggers on `missions/{missionId}` creates

## 🔧 Troubleshooting

### Common Issues:
1. **Authentication Error**: Run `firebase login` first
2. **Project Not Found**: Verify project ID `ensei-6c8e0` is correct
3. **Build Errors**: Check TypeScript compilation in `functions/` directory
4. **Permission Errors**: Ensure you have Firebase Admin permissions

### Check Function Logs:
```bash
firebase functions:log --project ensei-6c8e0
```

### Test Functions Locally (Optional):
```bash
firebase emulators:start --only functions,firestore --project ensei-6c8e0
```

## 📋 Post-Deployment Checklist:
- [ ] Functions deployed successfully
- [ ] Functions appear in Firebase Console
- [ ] No errors in function logs
- [ ] Run backfill script for existing users
- [ ] Test QuickStats in UI
- [ ] Verify admin audit page works


