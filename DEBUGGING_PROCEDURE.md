# 🔍 COMPREHENSIVE DEBUGGING PROCEDURE

This document provides a systematic approach to debug why the issues are still persisting:
- No deadline on Discover & Earn
- Invalid date on Admin Dashboard  
- Incorrect total cost

## 🎯 ROOT CAUSE HYPOTHESIS

Based on the persistent nature of these issues, the most likely root causes are:

1. **String dates in Firestore**: Missions still have string dates instead of Firestore Timestamp objects
2. **Missing rewards objects**: Mission documents lack the `rewards` object
3. **Backend not deployed**: The fixes might not be deployed to the production environment
4. **Frontend calling wrong endpoints**: Admin UI might be calling public API instead of admin API
5. **Caching issues**: Browser or CDN caching old responses

## 📋 STEP-BY-STEP DEBUGGING PROCEDURE

### Step 1: Verify Backend Deployment
```bash
# Check if the latest code is deployed
cd "/Users/mac/Desktop/Ensei Alexis/ensei-platform"
git log --oneline -5

# Check if the functions are deployed
firebase functions:log --limit 10
```

### Step 2: Test API Endpoints Directly
```bash
# Test the backfill endpoint
curl -X POST https://your-functions-url/v1/admin/backfill-timestamps \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Test system config
curl -X GET https://your-functions-url/v1/admin/system-config \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Test public missions list
curl -X GET https://your-functions-url/v1/missions?limit=5

# Test admin missions list
curl -X GET https://your-functions-url/v1/admin/missions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Step 3: Run Comprehensive Debugging Script
```bash
# Update the configuration in debug-comprehensive.js
# Replace CONFIG.API_BASE_URL and CONFIG.ADMIN_TOKEN with actual values
# Replace CONFIG.TEST_MISSION_IDS with actual mission IDs

# Run the debugging script
node debug-comprehensive.js
```

### Step 4: Check Firestore Data Directly
```bash
# Run the Firestore inspection script
node debug-firestore.js

# Or manually check in Firebase Console:
# 1. Go to Firebase Console
# 2. Navigate to Firestore Database
# 3. Check missions collection
# 4. Look for:
#    - created_at field type (should be Timestamp, not string)
#    - rewards object (should exist with usd and honors)
#    - deadline field (should exist for degen missions)
#    - expires_at field (should exist for fixed missions)
```

### Step 5: Check Frontend Data Flow
```bash
# Run the frontend debugging guide
node debug-frontend.js

# Then in browser:
# 1. Open DevTools (F12)
# 2. Go to Console tab
# 3. Look for error messages
# 4. Go to Network tab
# 5. Refresh the page
# 6. Check API request responses
```

### Step 6: Verify Admin Authentication
```bash
# Check if admin user has proper claims
# In Firebase Console:
# 1. Go to Authentication
# 2. Find your admin user
# 3. Check Custom Claims
# 4. Should have: { "admin": true }

# Or test with the setAdminClaim function
# Call the setAdminClaim function with your UID
```

## 🔍 SPECIFIC ISSUES TO CHECK

### Issue 1: "Invalid Date" in Admin Dashboard
**Check:**
- [ ] Is `mission.createdAt` a valid ISO string?
- [ ] Is the `formatDate` function working correctly?
- [ ] Is the API returning proper date formats?
- [ ] Are there any JavaScript errors in the console?

**Debug Code:**
```javascript
// Add to MissionCard.tsx
console.log('🔍 Mission createdAt:', mission.createdAt);
console.log('🔍 Mission createdAt type:', typeof mission.createdAt);
console.log('🔍 Date object:', new Date(mission.createdAt));
```

### Issue 2: "No deadline" on Discover & Earn
**Check:**
- [ ] Is `mission.deadline` or `mission.endAt` set?
- [ ] Is the `formatDeadline` function working?
- [ ] Is the API returning deadline data?
- [ ] Are degen missions being created with deadlines?

**Debug Code:**
```javascript
// Add to CompactMissionCard.tsx
console.log('🔍 Mission deadline:', mission.deadline);
console.log('🔍 Mission endAt:', mission.endAt);
console.log('🔍 Mission startAt:', mission.startAt);
console.log('🔍 Mission model:', mission.model);
```

### Issue 3: "$0 total cost" in Admin Dashboard
**Check:**
- [ ] Is `mission.totalCostUsd` set?
- [ ] Is the rewards calculation working?
- [ ] Is the API returning rewards data?
- [ ] Are missions being created with rewards?

**Debug Code:**
```javascript
// Add to MissionCard.tsx
console.log('🔍 Mission totalCostUsd:', mission.totalCostUsd);
console.log('🔍 Mission rewards:', mission.rewards);
console.log('🔍 Mission perUserHonors:', mission.perUserHonors);
console.log('🔍 Mission perWinnerHonors:', mission.perWinnerHonors);
```

## 🚨 EMERGENCY DEBUGGING STEPS

If the issues persist after all fixes:

### 1. Check if Backend is Actually Deployed
```bash
# Check Firebase Functions logs
firebase functions:log --limit 50

# Look for:
# - "✅ Persisted mission rewards" messages
# - "🔧 Calculated deadline for degen mission" messages
# - Any error messages
```

### 2. Check if Frontend is Calling Correct Endpoints
```javascript
// Add to admin API client
console.log('🔍 API Base URL:', this.baseURL);
console.log('🔍 Request URL:', `${this.baseURL}${endpoint}`);
console.log('🔍 Authorization header:', config.headers.Authorization);
```

### 3. Check if Data is Being Cached
```bash
# Clear browser cache
# Or test in incognito mode
# Or add cache-busting parameters
```

### 4. Check if Environment Variables are Correct
```bash
# Check if NEXT_PUBLIC_API_BASE is set correctly
# Check if admin token is being stored correctly
```

## 📊 EXPECTED RESULTS AFTER FIXES

### Admin Dashboard Should Show:
- ✅ Valid dates (not "Invalid Date")
- ✅ Correct total costs (not $0)
- ✅ Proper rewards (not 0 Honors)
- ✅ Correct deadlines for degen missions

### Discover & Earn Should Show:
- ✅ Valid deadlines for degen missions (not "No deadline")
- ✅ Correct cost calculations
- ✅ Valid dates throughout

### New Missions Should Have:
- ✅ Firestore Timestamp objects (not strings)
- ✅ Proper rewards objects
- ✅ Calculated deadlines for degen missions
- ✅ 48-hour expiration for fixed missions

## 🔧 QUICK FIXES TO TRY

### 1. Run Backfill Script
```bash
# Call the backfill endpoint to fix existing data
curl -X POST https://your-functions-url/v1/admin/backfill-timestamps \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Clear Browser Cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Test in incognito mode

### 3. Check Network Requests
- Open DevTools → Network tab
- Refresh the page
- Check if API requests are successful
- Verify response data structure

### 4. Test with New Mission
- Create a new mission
- Check if it has proper data structure
- Verify it displays correctly

## 📞 IF ALL ELSE FAILS

1. **Check Firebase Functions logs** for any deployment errors
2. **Verify the code was actually deployed** to production
3. **Check if there are multiple environments** (staging vs production)
4. **Verify the admin user has proper permissions**
5. **Check if there are any firewall or network issues**
6. **Consider rolling back to a known working state**

## 🎯 SUCCESS CRITERIA

The debugging is successful when:
- [ ] Admin dashboard shows valid dates
- [ ] Admin dashboard shows correct total costs
- [ ] Discover & Earn shows proper deadlines
- [ ] New missions are created with proper data structure
- [ ] All API endpoints return expected data
- [ ] No JavaScript errors in browser console
- [ ] No failed network requests


