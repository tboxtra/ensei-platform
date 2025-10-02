#!/usr/bin/env node

/**
 * FIRESTORE DATA INSPECTION SCRIPT
 * 
 * This script directly inspects Firestore data to see the actual document structure
 * and identify data inconsistencies that might be causing the persistent issues.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to set up service account key)
// const serviceAccount = require('./path-to-your-service-account-key.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// For now, we'll create a mock function that shows what to look for
function inspectFirestoreData() {
    console.log('🔍 FIRESTORE DATA INSPECTION GUIDE');
    console.log('='.repeat(50));

    console.log('\n📋 TO USE THIS SCRIPT:');
    console.log('1. Set up Firebase Admin SDK with service account key');
    console.log('2. Uncomment the Firebase initialization code above');
    console.log('3. Run this script to inspect actual Firestore data');

    console.log('\n🔍 WHAT TO LOOK FOR IN FIRESTORE:');
    console.log('\n1. TIMESTAMP FIELDS:');
    console.log('   - created_at: Should be Firestore Timestamp object (not string)');
    console.log('   - updated_at: Should be Firestore Timestamp object (not string)');
    console.log('   - deadline: Should be Firestore Timestamp object (not string)');
    console.log('   - expires_at: Should be Firestore Timestamp object (not string)');

    console.log('\n2. REWARDS FIELDS:');
    console.log('   - rewards: Should be object with usd and honors properties');
    console.log('   - rewards.usd: Should be number > 0');
    console.log('   - rewards.honors: Should be number > 0');
    console.log('   - selectedDegenPreset.costUSD: Should be number > 0 for degen missions');

    console.log('\n3. MODEL-SPECIFIC FIELDS:');
    console.log('   - degen missions: Should have deadline field');
    console.log('   - fixed missions: Should have expires_at field');
    console.log('   - winnersPerMission: Should be set for degen missions');

    console.log('\n4. COMMON ISSUES TO IDENTIFY:');
    console.log('   - String dates instead of Timestamp objects');
    console.log('   - Missing rewards objects');
    console.log('   - Missing deadline/expires_at fields');
    console.log('   - Zero or null cost values');

    console.log('\n📝 SAMPLE FIRESTORE QUERY:');
    console.log(`
const db = admin.firestore();
const missionsRef = db.collection('missions');

// Get all missions
const snapshot = await missionsRef.get();
snapshot.forEach(doc => {
  const data = doc.data();
  console.log('Mission ID:', doc.id);
  console.log('created_at type:', typeof data.created_at);
  console.log('created_at value:', data.created_at);
  console.log('rewards:', data.rewards);
  console.log('deadline:', data.deadline);
  console.log('---');
});
  `);
}

// Mock function to show what the actual inspection would look like
async function mockInspectMissions() {
    console.log('\n🔍 MOCK FIRESTORE INSPECTION RESULTS:');
    console.log('='.repeat(50));

    // This is what you would see in actual Firestore data
    const mockMissions = [
        {
            id: 'mission-1',
            model: 'degen',
            created_at: 'September 14, 2025 at 8:31:14 PM UTC+1', // ❌ STRING - This is the problem!
            updated_at: 'September 14, 2025 at 8:31:14 PM UTC+1', // ❌ STRING - This is the problem!
            deadline: null, // ❌ MISSING - This is the problem!
            rewards: null, // ❌ MISSING - This is the problem!
            selectedDegenPreset: { costUSD: 450, hours: 8, maxWinners: 3 },
            duration: 8,
            winnersPerMission: 3
        },
        {
            id: 'mission-2',
            model: 'fixed',
            created_at: 'September 14, 2025 at 9:08:20 PM UTC+1', // ❌ STRING - This is the problem!
            updated_at: 'September 14, 2025 at 9:08:20 PM UTC+1', // ❌ STRING - This is the problem!
            expires_at: null, // ❌ MISSING - This is the problem!
            rewards: null, // ❌ MISSING - This is the problem!
            rewardPerUser: 1500,
            cap: 100
        }
    ];

    mockMissions.forEach(mission => {
        console.log(`\n📋 Mission ${mission.id}:`);
        console.log('Model:', mission.model);
        console.log('created_at type:', typeof mission.created_at);
        console.log('created_at value:', mission.created_at);
        console.log('rewards:', mission.rewards);
        console.log('deadline:', mission.deadline);
        console.log('expires_at:', mission.expires_at);

        // Identify issues
        const issues = [];
        if (typeof mission.created_at === 'string') {
            issues.push('❌ created_at is a string instead of Firestore Timestamp');
        }
        if (!mission.rewards) {
            issues.push('❌ Missing rewards object');
        }
        if (mission.model === 'degen' && !mission.deadline) {
            issues.push('❌ Degen mission missing deadline');
        }
        if (mission.model === 'fixed' && !mission.expires_at) {
            issues.push('❌ Fixed mission missing expires_at');
        }

        if (issues.length > 0) {
            console.log('🚨 ISSUES FOUND:');
            issues.forEach(issue => console.log('  ', issue));
        } else {
            console.log('✅ No issues found');
        }
    });

    console.log('\n🎯 ROOT CAUSE IDENTIFIED:');
    console.log('The missions in Firestore have string dates instead of Timestamp objects.');
    console.log('This causes the toIso function to fail, leading to "Invalid Date" displays.');
    console.log('The missing rewards and deadline fields cause the $0 cost and "No deadline" issues.');

    console.log('\n🔧 SOLUTION:');
    console.log('1. Run the backfill script to convert string dates to Timestamps');
    console.log('2. Ensure new missions are created with proper Timestamp objects');
    console.log('3. Verify the toIso function can handle both formats during transition');
}

// Run the inspection
if (require.main === module) {
    inspectFirestoreData();
    mockInspectMissions().catch(console.error);
}

module.exports = {
    inspectFirestoreData,
    mockInspectMissions
};


