# Quick Stats Testing Guide

## 🧪 Testing the Real-Time Quick Stats System

### Prerequisites:
- [ ] Cloud Functions deployed (see CLOUD_FUNCTIONS_DEPLOYMENT.md)
- [ ] Backfill script run for existing users
- [ ] Firestore rules deployed

## 📊 Test 1: Verify QuickStats Display Real Data

### Steps:
1. **Login to the application**
2. **Navigate to any page with QuickStats** (should be in sidebar)
3. **Check the QuickStats card shows:**
   - Missions Created: Real number (not 0 or —)
   - Missions Completed: Real number
   - Tasks Done: Real number  
   - Total Earned: Real number with "Honors" suffix

### Expected Results:
- ✅ Numbers should be real (not placeholder values)
- ✅ Loading state shows "—" briefly, then real numbers
- ✅ Numbers update in real-time when you complete tasks

## 🔄 Test 2: Real-Time Updates

### Steps:
1. **Open the app in two browser tabs/windows**
2. **Complete a task in one tab** (like a Twitter task)
3. **Watch QuickStats in the other tab**
4. **Verify "Tasks Done" increments immediately**

### Expected Results:
- ✅ "Tasks Done" counter increases by 1
- ✅ Update happens within 1-2 seconds
- ✅ No page refresh required

## 🎯 Test 3: Mission Completion Tracking

### Steps:
1. **Find a mission with multiple tasks**
2. **Complete all required tasks**
3. **Check "Missions Completed" counter**
4. **Verify it increments when mission is fully completed**

### Expected Results:
- ✅ "Missions Completed" increases by 1
- ✅ Only counts when ALL required tasks are done
- ✅ Updates in real-time

## 💰 Test 4: Honors/Earnings Logic

### For Fixed Missions:
1. **Complete a task in a fixed mission**
2. **Check "Total Earned" counter**
3. **Verify it increases immediately**

### For Degen Missions:
1. **Complete tasks in a degen mission**
2. **Check "Total Earned" - should NOT increase yet**
3. **Wait for winners to be chosen**
4. **Verify "Total Earned" increases only after winning**

### Expected Results:
- ✅ Fixed missions: Honors added immediately on verification
- ✅ Degen missions: Honors added only when user wins
- ✅ No double-counting of honors

## 🔍 Test 5: Admin Audit Page

### Steps:
1. **Login as admin user** (email contains 'admin' or 'tobiobembe@gmail.com')
2. **Navigate to `/admin/user-stats-audit`**
3. **Check the audit table**
4. **Look for any "Drift Detected" indicators**
5. **Click on a user to see detailed comparison**

### Expected Results:
- ✅ Page loads without errors
- ✅ Shows all users with their stats
- ✅ Most users show "Accurate" status
- ✅ Any drift is clearly highlighted
- ✅ Detailed comparison shows stored vs computed values

## 🐛 Troubleshooting

### QuickStats Show "—" or 0:
- **Check**: Are Cloud Functions deployed?
- **Check**: Run backfill script for existing users
- **Check**: Browser console for errors

### Numbers Don't Update in Real-Time:
- **Check**: Firestore rules allow user to read their stats
- **Check**: Cloud Functions are triggering correctly
- **Check**: Network tab for Firestore connection

### Admin Audit Shows Drift:
- **Check**: Cloud Functions are working correctly
- **Check**: Run backfill script to fix discrepancies
- **Check**: Function logs for errors

### "Access Denied" on Admin Page:
- **Check**: User email contains 'admin' or is 'tobiobembe@gmail.com'
- **Check**: User is properly authenticated

## 📋 Test Checklist

- [ ] QuickStats display real numbers (not 0 or —)
- [ ] Real-time updates work (Tasks Done increments)
- [ ] Mission completion tracking works
- [ ] Fixed mission honors added immediately
- [ ] Degen mission honors added only when winning
- [ ] Admin audit page accessible and functional
- [ ] No drift detected in audit page
- [ ] All numbers are accurate and consistent

## 🚀 Performance Expectations

- **Initial Load**: QuickStats should load within 2-3 seconds
- **Real-time Updates**: Changes should appear within 1-2 seconds
- **Admin Audit**: Page should load within 5-10 seconds
- **No Errors**: Console should be clean of Firestore/auth errors

## 📞 Support

If tests fail:
1. Check Firebase Console for function logs
2. Run the test script: `node scripts/test-quick-stats.js`
3. Verify all deployment steps were completed
4. Check browser console for JavaScript errors
