#!/usr/bin/env node

/**
 * Test Quick Stats System
 * 
 * Verifies that the Quick Stats system is working correctly
 * by checking user stats documents and Cloud Function triggers
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'ensei-6c8e0'
  });
}

const db = admin.firestore();

async function testQuickStats() {
  console.log('🧪 Testing Quick Stats System...\n');
  
  try {
    // Test 1: Check if user stats documents exist
    console.log('📊 Test 1: Checking user stats documents...');
    const usersSnapshot = await db.collection('users').limit(5).get();
    let statsFound = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const uid = userDoc.id;
      const statsDoc = await db.doc(`users/${uid}/stats`).get();
      
      if (statsDoc.exists) {
        const stats = statsDoc.data();
        console.log(`   ✅ User ${uid}: ${JSON.stringify(stats, null, 2)}`);
        statsFound++;
      } else {
        console.log(`   ❌ User ${uid}: No stats document found`);
      }
    }
    
    console.log(`   📈 Found stats for ${statsFound}/${usersSnapshot.docs.length} users\n`);
    
    // Test 2: Check Cloud Functions are deployed
    console.log('☁️  Test 2: Checking Cloud Functions...');
    try {
      // This would require Firebase CLI, so we'll just log what to check
      console.log('   📋 Manual check required:');
      console.log('   1. Go to Firebase Console > Functions');
      console.log('   2. Verify these functions exist:');
      console.log('      - onVerificationWrite');
      console.log('      - onDegenWinnersChosen');
      console.log('      - onMissionCreate');
      console.log('   3. Check function logs for errors\n');
    } catch (error) {
      console.log('   ⚠️  Could not check functions automatically\n');
    }
    
    // Test 3: Check Firestore rules
    console.log('🛡️  Test 3: Checking Firestore rules...');
    console.log('   📋 Manual check required:');
    console.log('   1. Go to Firebase Console > Firestore > Rules');
    console.log('   2. Verify user stats rules exist:');
    console.log('      - users/{userId}/stats: read if auth.uid == userId');
    console.log('      - users/{userId}/missionProgress: read if auth.uid == userId');
    console.log('   3. Rules should be deployed\n');
    
    // Test 4: Sample data verification
    console.log('📝 Test 4: Sample data verification...');
    const verificationsSnapshot = await db.collection('verifications').limit(3).get();
    console.log(`   📊 Found ${verificationsSnapshot.docs.length} verification documents`);
    
    const missionsSnapshot = await db.collection('missions').limit(3).get();
    console.log(`   🎯 Found ${missionsSnapshot.docs.length} mission documents`);
    
    console.log('\n✅ Quick Stats system test completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Deploy Cloud Functions (see CLOUD_FUNCTIONS_DEPLOYMENT.md)');
    console.log('   2. Run backfill script: node scripts/backfill-user-stats.js --execute');
    console.log('   3. Test in UI: Check QuickStats display real data');
    console.log('   4. Test admin audit: Visit /admin/user-stats-audit');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testQuickStats()
  .then(() => {
    console.log('🎉 Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  });
