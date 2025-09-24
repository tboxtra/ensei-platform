# Per-Task Honors Calculation - Implementation Guide

## 🎯 **The Problem with Current Calculation**

The current script awards honors **per completed mission** (when all required tasks are done), but it should award honors **per verified task** (as soon as each task is verified).

### **Current Logic (Incorrect)**
```
Mission with 5 tasks (50 + 100 + 75 + 200 + 25 = 450 total honors):
- User completes 4/5 tasks → 0 honors (mission not completed)
- User completes 5/5 tasks → 450 honors (mission completed)
```

### **Correct Logic (Per-Task)**
```
Same mission with 5 tasks:
- User completes task 1 (50 honors) → +50 honors
- User completes task 2 (100 honors) → +100 honors  
- User completes task 3 (75 honors) → +75 honors
- User completes task 4 (200 honors) → +200 honors
- User completes task 5 (25 honors) → +25 honors
- Total: 450 honors (same total, but earned progressively)
```

## 🔧 **Key Changes Made**

### **1. Status Filter Change**
```javascript
// OLD: task.status === 'completed'
// NEW: task.status === 'verified'
```

### **2. Honors Calculation Change**
```javascript
// OLD: Award mission total when all tasks completed
if (allRequiredDone) {
    totalEarned += missionReward.totalHonors;
}

// NEW: Award per-task honors immediately
const perTaskHonors = typeof task.honors_awarded === 'number' 
    ? task.honors_awarded 
    : Number(honorByType.get(task.task_type) || 0);
totalEarned += perTaskHonors;
```

### **3. Deduplication**
```javascript
const key = `${missionId}:${task.task_id}`;
if (seen.has(key)) continue; // Prevent duplicates
seen.add(key);
```

## 📊 **Expected Results Comparison**

### **Your User (mDPgwAwb1pYqmxmsPsYW1b4qlup2)**

| Metric | Old Calculation | New Calculation | Difference |
|--------|----------------|-----------------|------------|
| **Missions Created** | 0 | 0 | Same |
| **Missions Completed** | 5 | 5 | Same |
| **Tasks Done** | 31 | 31 | Same |
| **Total Earned** | 975,000 | **~31,000-50,000** | **Much Lower** |

### **Why Total Earned Will Be Lower**

The old calculation was awarding **mission totals** (150,000-300,000 per mission), but the new calculation awards **per-task honors** (typically 50-200 per task).

**Example Mission Breakdown:**
- Mission aqd3XNkzSgGAXVXgGqbz: 300,000 total → ~5 tasks × 60,000 each
- Mission VTtcsRwekzysLHo8tSu7: 225,000 total → ~5 tasks × 45,000 each
- Mission 8bJCB5kApPzvENOQ2TjL: 150,000 total → ~5 tasks × 30,000 each

## 🚀 **How to Test the New Calculation**

### **Step 1: Download Service Account Key**
1. Go to [Firebase Console → Service Accounts](https://console.firebase.google.com/project/ensei-6c8e0/settings/serviceaccounts/adminsdk)
2. Click "Generate new private key"
3. Save as `service-account-key.json` in project root

### **Step 2: Run New Script**
```bash
cd "/Users/mac/Desktop/Ensei Alexis/ensei-platform"

# Test single user first
node scripts/calculate-real-user-stats-per-task.js mDPgwAwb1pYqmxmsPsYW1b4qlup2 --dry

# If results look correct, run for all users
node scripts/calculate-real-user-stats-per-task.js --all
```

### **Step 3: Verify Results**
- Check that `Total Earned` is much lower (per-task vs per-mission)
- Verify that `Tasks Done` and `Missions Completed` remain the same
- Confirm that honors are awarded progressively per task

## 🔄 **Migration Strategy**

### **Option 1: Replace Old Script (Recommended)**
```bash
# Backup old script
mv scripts/calculate-real-user-stats-final.js scripts/calculate-real-user-stats-final-backup.js

# Use new script as primary
mv scripts/calculate-real-user-stats-per-task.js scripts/calculate-real-user-stats-final.js
```

### **Option 2: Keep Both Scripts**
- Use `calculate-real-user-stats-per-task.js` for new calculations
- Keep `calculate-real-user-stats-final.js` for reference

## 📋 **Validation Checklist**

- [ ] **Per-task honors**: Each verified task awards its individual honor value
- [ ] **No duplicates**: Same task_id can't be counted twice
- [ ] **Status filtering**: Only `verified` tasks count (not `pending`, `rejected`, `revoked`)
- [ ] **Mission completion**: Still requires all required tasks to be verified
- [ ] **Honors source**: Prefers `task.honors_awarded` snapshot, falls back to mission task definition
- [ ] **Total consistency**: Sum of per-task honors should match expected mission totals

## 🎯 **Expected User Experience**

### **Before (Per-Mission)**
- User completes 4/5 tasks → 0 honors earned
- User completes 5/5 tasks → 450 honors earned
- **Frustrating**: No reward until mission is 100% complete

### **After (Per-Task)**
- User completes task 1 → 50 honors earned
- User completes task 2 → 100 honors earned
- User completes task 3 → 75 honors earned
- User completes task 4 → 200 honors earned
- User completes task 5 → 25 honors earned
- **Motivating**: Immediate reward for each completed task

This change makes the honors system more user-friendly and aligns with the per-task rewards shown on the mission creation screen.

