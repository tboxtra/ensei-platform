# Mission Progress System Testing Guide

## 🎯 **System Status: LIVE** ✅

The mission progress system is now deployed and active! Here's how to test and verify it's working correctly.

## 🔍 **Quick Verification Checklist**

### 1. **Function Status** ✅
- **Firebase Console** → **Functions** → **syncMissionProgress**
- Status should show: **ACTIVE**
- Trigger: `mission_participations/{participationId}` on write

### 2. **Firestore Rules** ✅
- **Firestore Console** → **Rules**
- Rules should be published (Publish button disabled)
- `mission_progress` collection has read/write rules

### 3. **Composite Indexes** ✅
- **Firestore Console** → **Indexes** → **Composite**
- Two new indexes should show **Ready**:
  - `mission_progress`: `userId ASC, missionCompleted ASC, updatedAt DESC`
  - `mission_progress`: `missionId ASC, missionCompleted ASC, updatedAt DESC`

## 🧪 **End-to-End Testing**

### **Step 1: Complete a Task**
1. Go to your app: https://ensei-platform.vercel.app/missions
2. Log in as any user
3. Find a mission and complete one task
4. Get the task verified (if required)

### **Step 2: Watch the Function Trigger**
1. **Firebase Console** → **Functions** → **syncMissionProgress** → **Logs**
2. Within 5-10 seconds, you should see a new log entry
3. Look for: `"Syncing mission progress for user X, mission Y"`

### **Step 3: Check Progress Summary**
1. **Firestore Console** → **Collections** → **mission_progress**
2. Look for a new document with ID: `{missionId}_{userId}`
3. Document should contain:
   ```json
   {
     "userId": "user123",
     "missionId": "mission456", 
     "verifiedTaskIds": ["task1"],
     "verifiedCount": 1,
     "totalTasks": 3,
     "missionCompleted": false,
     "updatedAt": "2025-09-22T22:30:00Z"
   }
   ```

### **Step 4: Complete More Tasks**
1. Complete the remaining tasks for the same mission
2. Watch `verifiedCount` increase
3. When `verifiedCount === totalTasks`, `missionCompleted` should become `true`
4. `completedAt` timestamp should be set

## 🛠️ **Testing Tools**

### **Test Script**
Run the test script to verify the system:
```bash
cd "/Users/mac/Desktop/Ensei Alexis/ensei-platform"
node test-mission-progress.js
```

### **Client-Side Utilities**
Use the new client utilities in your app:
```typescript
import { readMissionProgressBadge, getUserMissionProgress } from '@/lib/mission-progress-client';

// Get progress for a specific user+mission
const progress = await readMissionProgressBadge(userId, missionId);
console.log(`${progress.done}/${progress.total} tasks completed`);

// Get all progress for a user
const userProgress = await getUserMissionProgress(userId);
console.log(`User has ${userProgress.length} mission progress records`);
```

## 📊 **Expected Behavior**

### **When a Task is Verified:**
1. ✅ Function triggers within 5-10 seconds
2. ✅ Progress summary document is created/updated
3. ✅ `verifiedCount` increases
4. ✅ `verifiedTaskIds` array grows
5. ✅ `updatedAt` timestamp updates

### **When Mission is Completed:**
1. ✅ `missionCompleted` becomes `true`
2. ✅ `completedAt` timestamp is set
3. ✅ `verifiedCount` equals `totalTasks`

### **Data Consistency:**
- ✅ Only **verified** tasks count toward progress
- ✅ **Pending** tasks don't affect the counter
- ✅ **Duplicate** verified tasks for same task ID count as 1
- ✅ Task IDs are **normalized** (lowercase, trimmed)

## 🚨 **Troubleshooting**

### **Function Not Triggering?**
- Check that task status actually changed to "verified"
- Verify the function is active in Firebase Console
- Check function logs for errors
- Ensure the trigger path matches your `mission_participations` collection

### **No Progress Documents Created?**
- Verify Firestore rules allow the function to write
- Check that the function has proper permissions
- Look for errors in function logs
- Ensure the function is using Admin SDK (it is)

### **Progress Counts Wrong?**
- Check that only "verified" status tasks are counted
- Verify task IDs are being normalized correctly
- Ensure the function is reading the correct mission data
- Check for any data inconsistencies in `mission_participations`

### **Index Still Building?**
- This is normal after deployment
- Reads will work for unindexed queries
- Composite queries will show "needs index" until ready
- Usually takes 1-2 minutes to build

## 🎉 **Success Indicators**

You'll know the system is working when:
- ✅ Function logs show successful executions
- ✅ Progress documents appear in `mission_progress` collection
- ✅ Progress counts match verified task completions
- ✅ Mission completion status updates correctly
- ✅ No errors in function logs or Firestore rules

## 🚀 **Next Steps**

Once verified, you can:
1. **Use the client utilities** for fast progress queries
2. **Build analytics dashboards** using the denormalized data
3. **Create progress tracking features** in your UI
4. **Monitor mission engagement** in real-time
5. **Generate completion reports** for mission owners

The mission progress system is now live and ready for production use! 🎉

