#!/usr/bin/env node

/**
 * Test Quick Stats System
 * 
 * Comprehensive test to verify the QuickStats system is working correctly
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'ensei-6c8e0'
    });
}

const db = admin.firestore();

async function testQuickStatsSystem() {
    console.log('🧪 Testing Quick Stats System...\n');

    try {
        // Test 1: Check if user stats documents exist
        console.log('📊 Test 1: Checking user stats documents...');
        const usersSnapshot = await db.collection('users').limit(5).get();
        let statsFound = 0;

        for (const userDoc of usersSnapshot.docs) {
            const uid = userDoc.id;
            const statsDoc = await db.doc(`users/${uid}/stats/summary`).get();

            if (statsDoc.exists) {
                const stats = statsDoc.data();
                console.log(`   ✅ User ${uid}: ${JSON.stringify(stats, null, 2)}`);
                statsFound++;
            } else {
                console.log(`   ❌ User ${uid}: No stats document found`);
            }
        }

        console.log(`   📈 Found stats for ${statsFound}/${usersSnapshot.docs.length} users\n`);

        // Test 2: Check mission aggregates
        console.log('🎯 Test 2: Checking mission aggregates...');
        const missionsSnapshot = await db.collection('missions').limit(3).get();
        let aggregatesFound = 0;

        for (const missionDoc of missionsSnapshot.docs) {
            const missionId = missionDoc.id;
            const aggDoc = await db.doc(`missions/${missionId}/aggregates/counters`).get();

            if (aggDoc.exists) {
                const agg = aggDoc.data();
                console.log(`   ✅ Mission ${missionId}: ${JSON.stringify(agg, null, 2)}`);
                aggregatesFound++;
            } else {
                console.log(`   ❌ Mission ${missionId}: No aggregates document found`);
            }
        }

        console.log(`   📈 Found aggregates for ${aggregatesFound}/${missionsSnapshot.docs.length} missions\n`);

        // Test 3: Check mission participations
        console.log('📝 Test 3: Checking mission participations...');
        const participationsSnapshot = await db.collection('mission_participations').limit(5).get();
        console.log(`   📊 Found ${participationsSnapshot.docs.length} participation documents`);

        // Test 4: Check verifications
        console.log('✅ Test 4: Checking verifications...');
        const verificationsSnapshot = await db.collection('verifications').limit(5).get();
        console.log(`   📊 Found ${verificationsSnapshot.docs.length} verification documents`);

        // Test 5: System health summary
        console.log('📊 System Health Summary');
        console.log(`   👥 Users: ${usersSnapshot.docs.length}`);
        console.log(`   📈 User Stats: ${statsFound}/${usersSnapshot.docs.length} (${Math.round((statsFound / usersSnapshot.docs.length) * 100)}%)`);
        console.log(`   🎯 Missions: ${missionsSnapshot.docs.length}`);
        console.log(`   📊 Mission Aggregates: ${aggregatesFound}/${missionsSnapshot.docs.length} (${Math.round((aggregatesFound / missionsSnapshot.docs.length) * 100)}%)`);
        console.log(`   📝 Participations: ${participationsSnapshot.docs.length}`);
        console.log(`   ✅ Verifications: ${verificationsSnapshot.docs.length}`);

        // Health status
        const healthScore = Math.round(((statsFound / usersSnapshot.docs.length) + (aggregatesFound / missionsSnapshot.docs.length)) * 50);
        const healthStatus = healthScore >= 90 ? '🟢 Excellent' :
            healthScore >= 70 ? '🟡 Good' :
                healthScore >= 50 ? '🟠 Fair' : '🔴 Poor';

        console.log(`   🏥 Health score: ${healthScore}/100 ${healthStatus}`);

        // Recommendations
        console.log('\n💡 Recommendations:');
        if (statsFound < usersSnapshot.docs.length * 0.8) {
            console.log('   - Run backfill script to create missing user stats');
        }
        if (aggregatesFound < missionsSnapshot.docs.length * 0.8) {
            console.log('   - Check if Cloud Functions are triggering correctly');
        }
        if (healthScore >= 90) {
            console.log('   - System is healthy! Ready for production.');
        }

        console.log('\n✅ Quick Stats system test completed!');
        console.log('\n📋 Next steps:');
        console.log('   1. Test QuickStats display in the UI');
        console.log('   2. Test real-time updates');
        console.log('   3. Check admin audit page');
        console.log('   4. Monitor system performance');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testQuickStatsSystem()
    .then(() => {
        console.log('🎉 Test script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Test script failed:', error);
        process.exit(1);
    });
