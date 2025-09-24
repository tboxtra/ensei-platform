// scripts/calculate-real-user-stats-corrected.js
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/service-account-key.json \
//   node scripts/calculate-real-user-stats-corrected.js <UID> [--dry]
//
// This version is corrected based on the actual data structure found:
// - mission_participations has tasks_completed array with status: "completed"
// - missions use created_by (not ownerId) for ownership
// - missions have tasks array (not subcollection)
// - No honors field in participations, but total_honors_earned exists

const admin = require('firebase-admin');
const { Timestamp, FieldValue } = admin.firestore;

(async () => {
    try {
        const UID = process.argv[2];
        const DRY = process.argv.includes('--dry');

        if (!UID) {
            console.error('❌ Missing UID. Run: node scripts/calculate-real-user-stats-corrected.js <UID> [--dry]');
            process.exit(1);
        }

        // Prefer GOOGLE_APPLICATION_CREDENTIALS env. Fallback to local file.
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            try {
                const serviceAccount = require('../service-account-key.json');
                admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            } catch (e) {
                console.error(
                    '❌ No credentials. Set GOOGLE_APPLICATION_CREDENTIALS or place service-account-key.json in project root.'
                );
                process.exit(1);
            }
        } else {
            admin.initializeApp(); // uses GOOGLE_APPLICATION_CREDENTIALS
        }

        const db = admin.firestore();

        console.log(`\n🔎 Calculating real stats for user: ${UID}${DRY ? ' (dry run)' : ''}`);

        // 1) missionsCreated - use created_by field
        console.log('📊 Checking missions created...');
        const missionsSnap = await db
            .collection('missions')
            .where('created_by', '==', UID)
            .get();

        let missionsCreated = 0;
        const missionIdsOwned = [];

        missionsSnap.forEach(doc => {
            const d = doc.data() || {};
            // Check for soft deletion - no deleted field found in data, so count all
            missionsCreated += 1;
            missionIdsOwned.push(doc.id);
        });

        console.log(`   Found ${missionsCreated} missions created by user`);

        // 2) task completions by this user - check tasks_completed array
        console.log('📊 Checking task completions...');
        const partsSnap = await db
            .collection('mission_participations')
            .where('user_id', '==', UID)
            .get();

        let tasksDone = 0;
        let totalEarned = 0;
        const userVerifiedByMission = new Map();

        console.log(`   Found ${partsSnap.docs.length} total participations for user`);

        partsSnap.forEach(doc => {
            const d = doc.data() || {};
            const tasksCompleted = d.tasks_completed || [];

            // Count completed tasks
            tasksCompleted.forEach(task => {
                if (task.status === 'completed') {
                    tasksDone += 1;

                    // Add to mission tracking
                    if (task.mission_id && task.task_id) {
                        if (!userVerifiedByMission.has(task.mission_id)) {
                            userVerifiedByMission.set(task.mission_id, new Set());
                        }
                        userVerifiedByMission.get(task.mission_id).add(task.task_id);
                    }
                }
            });

            // Get total honors earned from the participation document
            if (typeof d.total_honors_earned === 'number') {
                totalEarned += d.total_honors_earned;
            }
        });

        console.log(`   Found ${tasksDone} completed tasks`);
        console.log(`   Total earned: ${totalEarned} honors`);

        // 3) missionsCompleted - check if user completed all required tasks
        console.log('📊 Checking mission completions...');
        let missionsCompleted = 0;

        const missionIdsToCheck = Array.from(userVerifiedByMission.keys());
        console.log(`   Checking ${missionIdsToCheck.length} missions for completion`);

        for (const missionId of missionIdsToCheck) {
            try {
                // Get mission to find required tasks
                const missionDoc = await db.collection('missions').doc(missionId).get();
                if (!missionDoc.exists) {
                    console.log(`   Mission ${missionId}: Not found, skipping`);
                    continue;
                }

                const missionData = missionDoc.data();
                const requiredTasks = missionData.tasks || [];

                if (requiredTasks.length === 0) {
                    console.log(`   Mission ${missionId}: No tasks found, skipping`);
                    continue;
                }

                const userCompletedSet = userVerifiedByMission.get(missionId) || new Set();
                const allRequiredDone = requiredTasks.every(taskId => userCompletedSet.has(taskId));

                if (allRequiredDone) {
                    missionsCompleted += 1;
                    console.log(`   Mission ${missionId}: COMPLETED (${requiredTasks.length} tasks)`);
                } else {
                    console.log(`   Mission ${missionId}: Not completed (${userCompletedSet.size}/${requiredTasks.length} tasks)`);
                }
            } catch (error) {
                console.log(`   Mission ${missionId}: Error checking completion - ${error.message}`);
            }
        }

        const summaryDocRef = db.doc(`users/${UID}/stats/summary`);
        const payload = {
            missionsCreated,
            missionsCompleted,
            tasksDone,
            totalEarned,
            updatedAt: FieldValue.serverTimestamp(),
        };

        console.log('\n📊 Computed stats:');
        console.table([payload]);

        if (DRY) {
            console.log('\n🧪 Dry run: not writing to Firestore.');
        } else {
            await summaryDocRef.set(payload, { merge: true });
            console.log('\n✅ Wrote stats to users/%s/stats/summary', UID);
        }

        console.log('\n✨ Done.\n');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Failed:', err?.message || err);
        process.exit(1);
    }
})();

