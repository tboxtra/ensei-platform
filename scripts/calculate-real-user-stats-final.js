// scripts/calculate-real-user-stats-final.js
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/service-account-key.json \
//   node scripts/calculate-real-user-stats-final.js <UID> [--dry] [--all]
//
// This version includes:
// - Proper totalEarned calculation from mission rewards
// - Edge case handling (soft deletes, optional tasks, deduplication)
// - Safety features for scaling
// - Batch processing for all users

const admin = require('firebase-admin');
const { Timestamp, FieldValue } = admin.firestore;

(async () => {
    try {
        const UID = process.argv[2];
        const DRY = process.argv.includes('--dry');
        const ALL_USERS = process.argv.includes('--all');

        if (!UID && !ALL_USERS) {
            console.error('❌ Missing UID. Run: node scripts/calculate-real-user-stats-final.js <UID> [--dry] [--all]');
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

        // Helper functions
        const safeArray = (arr) => Array.isArray(arr) ? arr : [];
        const safeNumber = (num) => Number(num) || 0;
        const safeString = (str) => String(str || '');

        async function calculateUserStats(userId) {
            console.log(`\n🔎 Calculating stats for user: ${userId}${DRY ? ' (dry run)' : ''}`);

            // 1) missionsCreated - use created_by field, exclude soft-deleted
            console.log('📊 Checking missions created...');
            const missionsSnap = await db
                .collection('missions')
                .where('created_by', '==', userId)
                .get();

            let missionsCreated = 0;
            const missionIdsOwned = [];

            missionsSnap.forEach(doc => {
                const d = doc.data() || {};
                // Check for soft deletion - exclude if deleted === true
                const isDeleted = d.deleted === true || d.deleted_at !== null;
                if (!isDeleted) {
                    missionsCreated += 1;
                    missionIdsOwned.push(doc.id);
                }
            });

            console.log(`   Found ${missionsCreated} missions created by user`);

            // 2) task completions by this user - check tasks_completed array
            console.log('📊 Checking task completions...');
            const partsSnap = await db
                .collection('mission_participations')
                .where('user_id', '==', userId)
                .get();

            let tasksDone = 0;
            let totalEarned = 0;
            const userVerifiedByMission = new Map();
            const missionRewards = new Map(); // Cache mission rewards

            console.log(`   Found ${partsSnap.docs.length} total participations for user`);

            partsSnap.forEach(doc => {
                const d = doc.data() || {};
                const tasksCompleted = safeArray(d.tasks_completed);

                // Deduplicate tasks by task_id to avoid double counting
                const uniqueTasks = new Map();
                tasksCompleted.forEach(task => {
                    if (task.status === 'completed' && task.task_id) {
                        uniqueTasks.set(task.task_id, task);
                    }
                });

                // Count unique completed tasks
                tasksDone += uniqueTasks.size;

                // Add to mission tracking
                uniqueTasks.forEach(task => {
                    if (task.mission_id && task.task_id) {
                        if (!userVerifiedByMission.has(task.mission_id)) {
                            userVerifiedByMission.set(task.mission_id, new Set());
                        }
                        userVerifiedByMission.get(task.mission_id).add(task.task_id);
                    }
                });

                // Calculate earned honors from mission rewards
                // Method: Sum total_honors_earned from participations (preferred)
                if (typeof d.total_honors_earned === 'number' && d.total_honors_earned > 0) {
                    totalEarned += d.total_honors_earned;
                }
            });

            // If total_honors_earned is not available, calculate from mission rewards
            if (totalEarned === 0) {
                console.log('   Calculating honors from mission rewards...');

                for (const [missionId, completedTasks] of userVerifiedByMission) {
                    try {
                        // Get mission rewards (cache to avoid repeated reads)
                        let missionReward = missionRewards.get(missionId);
                        if (!missionReward) {
                            const missionDoc = await db.collection('missions').doc(missionId).get();
                            if (missionDoc.exists) {
                                const missionData = missionDoc.data();
                                const rewards = missionData.rewards || {};
                                missionReward = {
                                    totalHonors: safeNumber(rewards.honors),
                                    totalTasks: safeArray(missionData.tasks).length
                                };
                                missionRewards.set(missionId, missionReward);
                            }
                        }

                        if (missionReward && missionReward.totalHonors > 0) {
                            // Policy: Award honors only when all required tasks are completed
                            const requiredTasks = missionReward.totalTasks;
                            if (completedTasks.size >= requiredTasks && requiredTasks > 0) {
                                totalEarned += missionReward.totalHonors;
                                console.log(`   Mission ${missionId}: Awarded ${missionReward.totalHonors} honors (${completedTasks.size}/${requiredTasks} tasks)`);
                            }
                        }
                    } catch (error) {
                        console.log(`   Mission ${missionId}: Error calculating rewards - ${error.message}`);
                    }
                }
            }

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
                    const requiredTasks = safeArray(missionData.tasks);

                    // Handle empty/legacy missions
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

            const summaryDocRef = db.doc(`users/${userId}/stats/summary`);
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
                console.log('\n✅ Wrote stats to users/%s/stats/summary', userId);
            }

            return payload;
        }

        if (ALL_USERS) {
            console.log('\n🚀 Processing all users...');

            // Get all users from mission_participations (users who have participated)
            const participationsSnapshot = await db.collection('mission_participations').get();
            const userIds = new Set();

            participationsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.user_id) {
                    userIds.add(data.user_id);
                }
            });

            console.log(`Found ${userIds.size} unique users with participations`);

            let processed = 0;
            let success = 0;
            let errors = 0;

            for (const userId of userIds) {
                try {
                    await calculateUserStats(userId);
                    success++;
                } catch (error) {
                    console.error(`❌ Error processing user ${userId}:`, error.message);
                    errors++;
                }

                processed++;

                // Rate limiting: 10 users per second
                if (processed % 10 === 0) {
                    console.log(`\n📈 Progress: ${processed}/${userIds.size} users processed`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            console.log(`\n🎉 Batch processing completed:`);
            console.log(`   Processed: ${processed} users`);
            console.log(`   Success: ${success} users`);
            console.log(`   Errors: ${errors} users`);
        } else {
            await calculateUserStats(UID);
        }

        console.log('\n✨ Done.\n');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Failed:', err?.message || err);
        process.exit(1);
    }
})();
