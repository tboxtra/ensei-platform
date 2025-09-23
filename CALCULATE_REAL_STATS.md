# Calculate Real User Statistics

## Quick Setup (2 minutes)

### Step 1: Download Service Account Key (if not already done)
1. Go to [Firebase Console → Service Accounts](https://console.firebase.google.com/project/ensei-6c8e0/settings/serviceaccounts/adminsdk)
2. Click "Generate new private key"
3. Download the JSON file
4. Save it as: `/Users/mac/Desktop/Ensei Alexis/ensei-platform/service-account-key.json`

### Step 2: Run the Real Stats Calculation Script
```bash
cd "/Users/mac/Desktop/Ensei Alexis/ensei-platform"
node scripts/calculate-real-user-stats.js
```

### Step 3: Verify Real Numbers
1. Refresh your app
2. Check that QuickStats now shows real numbers based on your actual data

## What the Script Calculates

### **Missions Created**
- Count of missions where `created_by == your_user_id` and `deleted_at == null`
- This shows missions you've actually created

### **Missions Completed** 
- Missions where you participated and completed ALL required tasks
- A mission is "completed" when you have verified actions for every task in that mission

### **Tasks Done**
- Total number of verified task actions across all missions
- Each verified task completion counts as 1

### **Total Earned**
- Sum of `task.honors` for all your verified task completions
- This is the actual honors you've earned from completing tasks

## Expected Results

After running the script, your QuickStats should show:
- **Real missions created** (instead of test value 1)
- **Real missions completed** (instead of test value 1) 
- **Real tasks done** (instead of test value 3)
- **Real total earned** (instead of test value 150)

## Security Note
- The service account key gives full admin access to your Firebase project
- Keep it secure and don't commit it to version control
- Consider deleting it after use if you don't need it regularly
