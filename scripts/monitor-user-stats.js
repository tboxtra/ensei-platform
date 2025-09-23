#!/usr/bin/env node

/**
 * Monitor User Stats Script
 * 
 * Monitors the health of the user stats system
 * Checks for data drift, function errors, and system health
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'ensei-6c8e0'
    });
}

const db = admin.firestore();

async function monitorUserStats() {
    console.log('📊 Monitoring User Stats System...\n');

    try {
        const startTime = Date.now();

        // Check 1: User stats document health
        console.log('🔍 Check 1: User Stats Document Health');
        const usersSnapshot = await db.collection('users').limit(20).get();
        let statsCount = 0;
        let driftCount = 0;
        const driftUsers = [];

        for (const userDoc of usersSnapshot.docs) {
            const uid = userDoc.id;
            const statsDoc = await db.doc(`users/${uid}/stats`).get();

            if (statsDoc.exists) {
                statsCount++;
                const stats = statsDoc.data();

                // Quick drift check (simplified)
                if (stats.tasksDone < 0 || stats.missionsCreated < 0 || stats.totalEarned < 0) {
                    driftCount++;
                    driftUsers.push({ uid, stats });
                }
            }
        }

        console.log(`   📈 Users with stats: ${statsCount}/${usersSnapshot.docs.length}`);
        console.log(`   ⚠️  Potential drift: ${driftCount} users`);
        if (driftUsers.length > 0) {
            console.log('   🚨 Users with negative values:');
            driftUsers.forEach(({ uid, stats }) => {
                console.log(`      - ${uid}: ${JSON.stringify(stats)}`);
            });
        }
        console.log('');

        // Check 2: Recent verification activity
        console.log('🔍 Check 2: Recent Verification Activity');
        const recentVerifications = await db.collection('verifications')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        console.log(`   📝 Recent verifications: ${recentVerifications.docs.length}`);
        const verifiedCount = recentVerifications.docs.filter(doc =>
            doc.data().status === 'VERIFIED'
        ).length;
        console.log(`   ✅ Verified: ${verifiedCount}/${recentVerifications.docs.length}`);
        console.log('');

        // Check 3: Mission activity
        console.log('🔍 Check 3: Mission Activity');
        const recentMissions = await db.collection('missions')
            .orderBy('created_at', 'desc')
            .limit(10)
            .get();

        console.log(`   🎯 Recent missions: ${recentMissions.docs.length}`);
        const activeMissions = recentMissions.docs.filter(doc =>
            !doc.data().deletedAt
        ).length;
        console.log(`   🟢 Active missions: ${activeMissions}/${recentMissions.docs.length}`);
        console.log('');

        // Check 4: System health summary
        console.log('📊 System Health Summary');
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`   ⏱️  Check duration: ${duration}ms`);
        console.log(`   📈 Stats coverage: ${Math.round((statsCount / usersSnapshot.docs.length) * 100)}%`);
        console.log(`   🚨 Drift rate: ${Math.round((driftCount / statsCount) * 100)}%`);

        // Health status
        const healthScore = Math.max(0, 100 - (driftCount * 10) - (duration > 5000 ? 20 : 0));
        const healthStatus = healthScore >= 90 ? '🟢 Excellent' :
            healthScore >= 70 ? '🟡 Good' :
                healthScore >= 50 ? '🟠 Fair' : '🔴 Poor';

        console.log(`   🏥 Health score: ${healthScore}/100 ${healthStatus}`);

        // Recommendations
        console.log('\n💡 Recommendations:');
        if (driftCount > 0) {
            console.log('   - Run backfill script to fix data drift');
        }
        if (statsCount < usersSnapshot.docs.length * 0.8) {
            console.log('   - Run backfill script to create missing stats');
        }
        if (duration > 5000) {
            console.log('   - Consider optimizing queries or adding indexes');
        }
        if (healthScore >= 90) {
            console.log('   - System is healthy! No action needed.');
        }

        console.log('\n✅ Monitoring completed successfully!');

    } catch (error) {
        console.error('❌ Monitoring failed:', error);
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help')) {
    console.log(`
Usage: node scripts/monitor-user-stats.js [options]

Options:
  --help       Show this help message

This script monitors the health of the user stats system and provides
recommendations for maintenance and optimization.
  `);
    process.exit(0);
}

// Run monitoring
monitorUserStats()
    .then(() => {
        console.log('🎉 Monitoring script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Monitoring script failed:', error);
        process.exit(1);
    });


