/**
 * Admin report for task type schema drift detection
 * Logs unknown task IDs and provides insights into task usage patterns
 */

const path = require('path');
const admin = require('firebase-admin');
const { FieldValue } = admin.firestore;

function initAdmin(projectId = 'ensei-6c8e0') {
    // Prefer GOOGLE_APPLICATION_CREDENTIALS if set
    const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (admin.apps.length) return;

    if (gac) {
        admin.initializeApp({
            credential: admin.credential.cert(require(gac)),
            projectId,
        });
    } else {
        // Fallback to local file if you really need it (kept out of git!)
        const fallback = path.join(__dirname, '../service-account-key.json');
        admin.initializeApp({
            credential: admin.credential.cert(require(fallback)),
            projectId,
        });
    }
}

// Initialize Firebase Admin SDK
let db;
try {
    initAdmin();
    db = admin.firestore();
    console.log('✅ Firebase Admin SDK initialized.');
} catch (e) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', e.message);
    process.exit(1);
}

const FIXED_TASK_HONORS = {
    like: 50,
    retweet: 100,
    comment: 150,
    quote: 200,
    follow: 250,
};

function getFixedTaskHonors(taskType) {
    const normalizedType = taskType.toLowerCase();
    return FIXED_TASK_HONORS[normalizedType] || 0;
}

async function generateTaskReport() {
    console.log('\n📊 Generating admin task report...\n');

    const taskTypeStats = {};
    const unknownTaskTypes = new Set();
    const missionTypeStats = {};

    // Get all mission participations
    const participationsSnap = await db.collection('mission_participations').limit(100).get();
    console.log(`Analyzing ${participationsSnap.size} participations...`);

    for (const doc of participationsSnap.docs) {
        const part = doc.data();
        const missionId = part.mission_id;

        if (!missionId) continue;

        // Get mission type
        try {
            const missionDoc = await db.collection('missions').doc(missionId).get();
            if (missionDoc.exists) {
                const missionData = missionDoc.data();
                const missionType = missionData.type || 'unknown';
                missionTypeStats[missionType] = (missionTypeStats[missionType] || 0) + 1;
            }
        } catch (error) {
            console.log(`   Error loading mission ${missionId}: ${error.message}`);
        }

        // Analyze task completions
        const tasksCompleted = part.tasks_completed || [];
        for (const task of tasksCompleted) {
            if (task.status !== 'completed') continue;

            const taskId = (task.task_id || '').toLowerCase();
            if (!taskId) continue;

            const price = getFixedTaskHonors(taskId);
            if (price > 0) {
                taskTypeStats[taskId] = (taskTypeStats[taskId] || 0) + 1;
            } else {
                unknownTaskTypes.add(taskId);
            }
        }
    }

    // Report results
    console.log('\n📈 Task Type Usage Statistics:');
    Object.entries(taskTypeStats)
        .sort(([, a], [, b]) => b - a)
        .forEach(([taskType, count]) => {
            const price = getFixedTaskHonors(taskType);
            console.log(`   ${taskType}: ${count} completions (${price} Honors each)`);
        });

    console.log('\n🎯 Mission Type Distribution:');
    Object.entries(missionTypeStats)
        .sort(([, a], [, b]) => b - a)
        .forEach(([type, count]) => {
            console.log(`   ${type}: ${count} participations`);
        });

    if (unknownTaskTypes.size > 0) {
        console.log('\n⚠️  Unknown Task Types Detected:');
        Array.from(unknownTaskTypes).sort().forEach(taskType => {
            console.log(`   ${taskType} (0 Honors awarded)`);
        });
        console.log('\n🔧 Recommendation: Add these task types to FIXED_TASK_HONORS or investigate schema changes.');
    } else {
        console.log('\n✅ No unknown task types detected. Schema is consistent.');
    }

    // Schema hardening recommendations
    console.log('\n💡 Schema Hardening Recommendations:');
    console.log('   1. Add explicit task_type field to tasks_completed array items');
    console.log('   2. Add explicit type field to missions (fixed/degen)');
    console.log('   3. Consider adding task validation in Cloud Functions');
    console.log('   4. Monitor this report regularly for schema drift');

    console.log('\n✨ Admin task report completed.');
}

generateTaskReport()
    .then(() => console.log('\n🎉 Report generation completed successfully'))
    .catch(err => {
        console.error('\n❌ Report generation failed:', err?.message || err);
        process.exit(1);
    });
