#!/usr/bin/env node

/**
 * QUICK DIAGNOSTIC SCRIPT
 * 
 * This script provides a quick way to diagnose the most common issues
 * without needing to set up complex debugging tools.
 */

console.log('🚀 QUICK DIAGNOSTIC SCRIPT');
console.log('='.repeat(50));

console.log('\n📋 QUICK DIAGNOSTIC CHECKLIST:');
console.log('='.repeat(40));

console.log('\n1. 🔍 CHECK BROWSER CONSOLE:');
console.log('   □ Open DevTools (F12)');
console.log('   □ Go to Console tab');
console.log('   □ Look for red error messages');
console.log('   □ Check for "Invalid Date" or "NaN" values');

console.log('\n2. 🌐 CHECK NETWORK REQUESTS:');
console.log('   □ Go to Network tab in DevTools');
console.log('   □ Refresh the page');
console.log('   □ Look for failed requests (red status codes)');
console.log('   □ Check if API calls are returning data');

console.log('\n3. 📊 CHECK SPECIFIC VALUES:');
console.log('   □ Admin Dashboard: Look for "Invalid Date"');
console.log('   □ Admin Dashboard: Look for "$0" total costs');
console.log('   □ Discover & Earn: Look for "No deadline"');
console.log('   □ Check if new missions display correctly');

console.log('\n4. 🔧 QUICK FIXES TO TRY:');
console.log('   □ Hard refresh (Ctrl+Shift+R)');
console.log('   □ Clear browser cache');
console.log('   □ Test in incognito mode');
console.log('   □ Check if admin token is valid');

console.log('\n5. 📱 CHECK DIFFERENT ENVIRONMENTS:');
console.log('   □ Test on different browsers');
console.log('   □ Test on mobile vs desktop');
console.log('   □ Check if issues are device-specific');

console.log('\n🎯 MOST LIKELY ISSUES:');
console.log('='.repeat(40));

console.log('\n❌ Issue 1: "Invalid Date" in Admin Dashboard');
console.log('   Root Cause: String dates in Firestore instead of Timestamps');
console.log('   Quick Fix: Run backfill script');
console.log('   Command: curl -X POST /v1/admin/backfill-timestamps');

console.log('\n❌ Issue 2: "$0 total cost" in Admin Dashboard');
console.log('   Root Cause: Missing rewards objects in Firestore');
console.log('   Quick Fix: Run backfill script');
console.log('   Command: curl -X POST /v1/admin/backfill-timestamps');

console.log('\n❌ Issue 3: "No deadline" on Discover & Earn');
console.log('   Root Cause: Missing deadline calculation for degen missions');
console.log('   Quick Fix: Run backfill script');
console.log('   Command: curl -X POST /v1/admin/backfill-timestamps');

console.log('\n❌ Issue 4: Frontend not calling admin API');
console.log('   Root Cause: Admin UI calling public API instead of admin API');
console.log('   Quick Fix: Check admin API client configuration');
console.log('   Check: apps/web/src/lib/admin/api.ts');

console.log('\n❌ Issue 5: Backend not deployed');
console.log('   Root Cause: Latest fixes not deployed to production');
console.log('   Quick Fix: Redeploy functions');
console.log('   Command: firebase deploy --only functions');

console.log('\n🔧 EMERGENCY DEBUGGING STEPS:');
console.log('='.repeat(40));

console.log('\nStep 1: Check if backend is deployed');
console.log('   firebase functions:log --limit 10');

console.log('\nStep 2: Test API endpoints directly');
console.log('   curl -X GET /v1/missions?limit=5');
console.log('   curl -X GET /v1/admin/missions -H "Authorization: Bearer TOKEN"');

console.log('\nStep 3: Run backfill script');
console.log('   curl -X POST /v1/admin/backfill-timestamps -H "Authorization: Bearer TOKEN"');

console.log('\nStep 4: Check Firestore data');
console.log('   Go to Firebase Console → Firestore');
console.log('   Check missions collection');
console.log('   Look for string dates vs Timestamp objects');

console.log('\nStep 5: Check frontend data flow');
console.log('   Add console.log to components');
console.log('   Check what data is being received');
console.log('   Verify API responses');

console.log('\n📊 EXPECTED RESULTS:');
console.log('='.repeat(40));

console.log('\n✅ After running backfill script:');
console.log('   - All missions should have Timestamp objects');
console.log('   - All missions should have rewards objects');
console.log('   - Degen missions should have deadlines');
console.log('   - Fixed missions should have expires_at');

console.log('\n✅ After frontend fixes:');
console.log('   - Admin dashboard should show valid dates');
console.log('   - Admin dashboard should show correct costs');
console.log('   - Discover & Earn should show deadlines');
console.log('   - No JavaScript errors in console');

console.log('\n🎯 SUCCESS CRITERIA:');
console.log('='.repeat(40));

console.log('\n□ Admin dashboard shows valid dates (not "Invalid Date")');
console.log('□ Admin dashboard shows correct total costs (not "$0")');
console.log('□ Discover & Earn shows proper deadlines (not "No deadline")');
console.log('□ New missions are created with proper data structure');
console.log('□ No JavaScript errors in browser console');
console.log('□ No failed network requests');
console.log('□ All API endpoints return expected data');

console.log('\n📞 IF ISSUES PERSIST:');
console.log('='.repeat(40));

console.log('\n1. Check if the backend fixes were actually deployed');
console.log('2. Verify the backfill script was run successfully');
console.log('3. Check if there are multiple environments');
console.log('4. Verify admin user has proper permissions');
console.log('5. Check for caching issues');
console.log('6. Consider rolling back to a known working state');

console.log('\n🚀 NEXT STEPS:');
console.log('='.repeat(40));

console.log('\n1. Run the comprehensive debugging script');
console.log('2. Check the browser console and network requests');
console.log('3. Run the backfill script');
console.log('4. Test with new missions');
console.log('5. Verify all fixes are working');

console.log('\n📋 DEBUGGING FILES CREATED:');
console.log('='.repeat(40));

console.log('\n□ debug-comprehensive.js - Full API testing script');
console.log('□ debug-firestore.js - Firestore data inspection guide');
console.log('□ debug-frontend.js - Frontend debugging guide');
console.log('□ DEBUGGING_PROCEDURE.md - Complete debugging procedure');
console.log('□ quick-diagnostic.js - This quick diagnostic script');

console.log('\n🎉 READY TO DEBUG!');
console.log('Start with the quick diagnostic checklist above,');
console.log('then move to the comprehensive debugging script if needed.');
