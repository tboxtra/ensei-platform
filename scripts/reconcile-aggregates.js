#!/usr/bin/env node

/**
 * Aggregate Reconciliation Script
 * 
 * Recomputes mission aggregates from verification data to fix drift
 * Run this periodically or when you suspect data inconsistency
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'ensei-6c8e0'
    });
}

const db = admin.firestore();

async function reconcileMissionAggregates(missionId, dryRun = true) {
    console.log(`\n🔍 Reconciling aggregates for mission: ${missionId}`);

    try {
        // Get mission data
        const missionDoc = await db.collection('missions').doc(missionId).get();
        if (!missionDoc.exists) {
            console.log(`❌ Mission ${missionId} not found`);
            return;
        }

        const missionData = missionDoc.data();
        const winnersPerTask = missionData.winnersPerTask || null;
        const taskCount = Array.isArray(missionData.tasks) ? missionData.tasks.length : 0;

        console.log(`📊 Mission type: ${missionData.type}, Winners per task: ${winnersPerTask}, Task count: ${taskCount}`);

        // Get all verified completions for this mission
        const completionsQuery = db.collection('missions').doc(missionId).collection('completions')
            .where('status', '==', 'verified');

        const completionsSnapshot = await completionsQuery.get();
        console.log(`📝 Found ${completionsSnapshot.docs.length} verified completions`);

        // Count by task
        const taskCounts = {};
        let totalCompletions = 0;

        completionsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const taskId = data.taskId;
            if (taskId) {
                taskCounts[taskId] = (taskCounts[taskId] || 0) + 1;
                totalCompletions++;
            }
        });

        console.log(`📈 Recalculated counts:`, taskCounts);
        console.log(`📈 Total completions: ${totalCompletions}`);

        // Get current aggregates
        const aggRef = db.collection('missions').doc(missionId).collection('aggregates').doc('counters');
        const aggDoc = await aggRef.get();
        const currentAgg = aggDoc.exists ? aggDoc.data() : null;

        if (currentAgg) {
            console.log(`📊 Current aggregates:`, currentAgg.taskCounts);
            console.log(`📊 Current total: ${currentAgg.totalCompletions}`);

            // Check for drift
            let hasDrift = false;
            for (const [taskId, count] of Object.entries(taskCounts)) {
                const currentCount = currentAgg.taskCounts[taskId] || 0;
                if (currentCount !== count) {
                    console.log(`⚠️  Drift detected for task ${taskId}: current=${currentCount}, actual=${count}`);
                    hasDrift = true;
                }
            }

            if (currentAgg.totalCompletions !== totalCompletions) {
                console.log(`⚠️  Total drift: current=${currentAgg.totalCompletions}, actual=${totalCompletions}`);
                hasDrift = true;
            }

            if (!hasDrift) {
                console.log(`✅ No drift detected - aggregates are correct`);
                return;
            }
        }

        // Update aggregates
        const newAgg = {
            taskCounts,
            totalCompletions,
            winnersPerTask,
            taskCount,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            reconciledAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (dryRun) {
            console.log(`🔍 DRY RUN - Would update aggregates to:`, newAgg);
        } else {
            await aggRef.set(newAgg, { merge: true });
            console.log(`✅ Updated aggregates for mission ${missionId}`);
        }

    } catch (error) {
        console.error(`❌ Error reconciling mission ${missionId}:`, error);
    }
}

async function reconcileAllMissions(dryRun = true) {
    console.log(`\n🚀 Starting aggregate reconciliation (dryRun: ${dryRun})`);

    try {
        // Get all missions
        const missionsSnapshot = await db.collection('missions').get();
        console.log(`📋 Found ${missionsSnapshot.docs.length} missions`);

        for (const missionDoc of missionsSnapshot.docs) {
            await reconcileMissionAggregates(missionDoc.id, dryRun);
        }

        console.log(`\n✅ Reconciliation complete!`);

    } catch (error) {
        console.error(`❌ Error during reconciliation:`, error);
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    const missionId = args[0];
    const dryRun = !args.includes('--execute');

    if (dryRun) {
        console.log(`🔍 Running in DRY RUN mode. Use --execute to make changes.`);
    } else {
        console.log(`⚠️  EXECUTE mode - will make actual changes!`);
    }

    if (missionId) {
        await reconcileMissionAggregates(missionId, dryRun);
    } else {
        await reconcileAllMissions(dryRun);
    }

    process.exit(0);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { reconcileMissionAggregates, reconcileAllMissions };


