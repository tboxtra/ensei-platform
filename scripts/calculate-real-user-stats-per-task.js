const admin = require('firebase-admin');
const { FieldValue } = admin.firestore;

const path = require('path');

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
    console.error('Please ensure GOOGLE_APPLICATION_CREDENTIALS is set or service-account-key.json is in the project root.');
    process.exit(1);
}

const BATCH_SIZE = 500; // Firestore batch write limit
const USER_FETCH_LIMIT = 100; // How many users to fetch at once for --all mode
const WRITE_RATE_LIMIT_MS = 100; // Delay between user writes to avoid hitting limits (10 users/sec)

// Import authoritative task honors mapping
const FIXED_TASK_HONORS = {
    like: 50,
    retweet: 100,
    comment: 150,
    quote: 200,
    follow: 250,
};

/**
 * Get the honor value for a fixed mission task type
 */
function getFixedTaskHonors(taskType) {
    const normalizedType = taskType.toLowerCase();
    return FIXED_TASK_HONORS[normalizedType] || 0;
}

/**
 * Check if a mission is a degen mission
 */
function isDegenMission(missionData) {
    return missionData.type === 'degen';
}

// Helper functions
function safeNumber(value) {
    return typeof value === 'number' && !isNaN(value) ? value : 0;
}

function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

function safeString(value) {
    return typeof value === 'string' ? value : '';
}

async function calculateUserStats(userId, dryRun = false) {
    console.log(`\n🔎 Calculating per-task stats for user: ${userId}${dryRun ? ' (dry run)' : ''}`);

    let missionsCreated = 0;
    let tasksDone = 0;
    let totalEarned = 0; // Store in display units (Honors)
    let missionsCompleted = 0;
    const userVerifiedByMission = new Map(); // missionId => Set<taskId>
    const seen = new Set(); // Prevent duplicate counting

    // 1. Get missions created by this user (exclude soft-deleted)
    console.log('📊 Checking missions created...');
    const missionsSnap = await db
        .collection('missions')
        .where('created_by', '==', userId)
        .get();

    // Filter out soft-deleted missions (deleted === true)
    missionsCreated = missionsSnap.docs.filter(doc => {
        const data = doc.data();
        return data.deleted !== true; // Include undefined and false
    }).length;

    console.log(`   Found ${missionsCreated} missions created by user (${missionsSnap.size} total, ${missionsSnap.size - missionsCreated} soft-deleted).`);

    // 2. Get participations and count verified tasks + fixed-price honors
    console.log('📊 Checking task completions...');
    const participationsSnap = await db
        .collection('mission_participations')
        .where('user_id', '==', userId)
        .get();

    console.log(`   Found ${participationsSnap.docs.length} total participations for user`);

    for (const doc of participationsSnap.docs) {
        const part = doc.data();
        const missionId = part.mission_id;

        if (!missionId) continue;

        // Load mission to get required task IDs
        let missionData = {};
        try {
            const missionDoc = await db.collection('missions').doc(missionId).get();
            if (missionDoc.exists) {
                missionData = missionDoc.data() || {};
            }
        } catch (error) {
            console.log(`   Mission ${missionId}: Error loading mission - ${error.message}`);
            continue;
        }

        const requiredTaskIds = safeArray(missionData.tasks);
        let completedRequired = 0;
        const seenThisMission = new Set();

        // Check if this is a degen mission
        const isDegen = isDegenMission(missionData);

        if (isDegen) {
            console.log(`   Mission ${missionId}: DEGEN mission - skipping until winners chosen`);
            // Skip degen missions entirely until winners are chosen
            continue;
        }

        // Process each completed task (fixed missions only)
        const tasksCompleted = safeArray(part.tasks_completed);
        for (const task of tasksCompleted) {
            if (task.status !== 'completed') continue;

            const taskId = (task.task_id || '').toLowerCase();
            if (!taskId || seenThisMission.has(taskId)) continue; // Prevent duplicates within mission
            seenThisMission.add(taskId);

            const key = `${missionId}:${taskId}`;
            if (seen.has(key)) continue; // Prevent duplicates across missions
            seen.add(key);

            // Get fixed price for this task type using authoritative map
            const price = getFixedTaskHonors(taskId);
            if (price > 0) {
                totalEarned += price; // Add in display units (Honors)
                tasksDone += 1;
                console.log(`   Task ${taskId}: +${price} Honors`);

                // Track completion of required tasks for mission completion
                if (requiredTaskIds.includes(taskId)) {
                    completedRequired += 1;
                }
            } else {
                // Log unknown task IDs for schema drift detection
                console.warn(`   Unknown task type: ${taskId} (0 Honors awarded)`, { userId, missionId, taskId });
            }
        }

        // Mission completed if ALL required tasks done
        if (requiredTaskIds.length > 0 && completedRequired === requiredTaskIds.length) {
            missionsCompleted += 1;
            console.log(`   Mission ${missionId}: COMPLETED (${completedRequired}/${requiredTaskIds.length} required tasks)`);
        }
    }

    console.log(`   Found ${tasksDone} verified tasks`);
    console.log(`   Total earned: ${totalEarned} Honors`);

    // Enhanced validation (so this can't regress)
    const minExpectedHonors = tasksDone * 50; // Minimum for fixed missions only
    if (totalEarned < minExpectedHonors) {
        console.warn(`Invariant failed: expected totalEarned ≥ ${minExpectedHonors}, got ${totalEarned}`, { userId });
    }

    if (missionsCompleted > missionsCreated) {
        console.warn(`missionsCompleted (${missionsCompleted}) exceeds missionsCreated (${missionsCreated})`, { userId });
    }

    // Additional validation: ensure we're not double-counting
    if (tasksDone > 0 && totalEarned === 0) {
        console.warn(`No honors earned despite ${tasksDone} completed tasks`, { userId });
    }

    const summaryDocRef = db.doc(`users/${userId}/stats/summary`);
    const payload = {
        missionsCreated,
        missionsCompleted,
        tasksDone,
        totalEarned, // Already in display units (Honors)
        updatedAt: FieldValue.serverTimestamp(),
    };

    console.log('\n📊 Computed stats:');
    console.table([payload]);

    if (!dryRun) {
        await summaryDocRef.set(payload, { merge: true });
        console.log(`✅ Wrote stats to users/${userId}/stats/summary`);
    } else {
        console.log('\n🧪 Dry run: not writing to Firestore.');
    }

    return payload;
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry');
    const allUsers = args.includes('--all');
    const targetUserId = allUsers ? null : args[0];

    if (!allUsers && !targetUserId) {
        console.error('❌ Missing UID or --all flag. Usage:');
        console.error('  node scripts/calculate-real-user-stats-per-task.js <UID> [--dry]');
        console.error('  node scripts/calculate-real-user-stats-per-task.js --all [--dry]');
        process.exit(1);
    }

    if (allUsers) {
        console.log('\n🚀 Calculating per-task stats for ALL users...');
        let lastDoc = null;
        let usersProcessed = 0;
        let totalErrors = 0;

        while (true) {
            let query = db.collection('users').orderBy(admin.firestore.FieldPath.documentId()).limit(USER_FETCH_LIMIT);
            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }

            const usersSnap = await query.get();
            if (usersSnap.empty) break;

            for (const doc of usersSnap.docs) {
                const uid = doc.id;
                try {
                    await calculateUserStats(uid, dryRun);
                    usersProcessed++;
                    await new Promise(resolve => setTimeout(resolve, WRITE_RATE_LIMIT_MS)); // Rate limit
                } catch (error) {
                    console.error(`❌ Error processing user ${uid}:`, error.message);
                    totalErrors++;
                }
            }
            lastDoc = usersSnap.docs[usersSnap.docs.length - 1];
            console.log(`\nProcessed ${usersProcessed} users so far...`);
        }
        console.log(`\n✨ Done processing all users. Total processed: ${usersProcessed}, Errors: ${totalErrors}`);
    } else {
        await calculateUserStats(targetUserId, dryRun);
    }

    console.log('\n✨ Script finished.\n');
    process.exit(0);
}

main().catch(err => {
    console.error('\n❌ Script failed:', err?.message || err);
    process.exit(1);
});
