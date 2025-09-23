// scripts/calculate-real-user-stats-fixed.js
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/service-account-key.json \
//   node scripts/calculate-real-user-stats-fixed.js <UID> [--dry]
//
// This version includes common field name variations and defensive checks

const admin = require('firebase-admin');
const { Timestamp, FieldValue } = admin.firestore;

(async () => {
  try {
    const UID = process.argv[2];
    const DRY = process.argv.includes('--dry');

    if (!UID) {
      console.error('❌ Missing UID. Run: node scripts/calculate-real-user-stats-fixed.js <UID> [--dry]');
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

    // Helper function to safely convert to string
    const key = (x) => String(x ?? '');

    // 1) missionsCreated - try multiple ownership field names
    console.log('📊 Checking missions created...');
    const ownershipFields = ['ownerId', 'created_by', 'owner_id', 'createdBy'];
    let missionsCreated = 0;
    const missionIdsOwned = [];

    for (const field of ownershipFields) {
      const missionsSnap = await db
        .collection('missions')
        .where(field, '==', UID)
        .get();

      if (missionsSnap.docs.length > 0) {
        console.log(`   Found ${missionsSnap.docs.length} missions with ${field} = ${UID}`);
        missionsSnap.forEach(doc => {
          const d = doc.data() || {};
          // Check for soft deletion - try multiple field names
          const isDeleted = d.deleted === true || d.deleted_at !== null || d.isDeleted === true;
          if (!isDeleted) {
            missionsCreated += 1;
            missionIdsOwned.push(doc.id);
          }
        });
        break; // Use the first field that returns results
      }
    }

    // 2) task completions by this user - try multiple field variations
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
      
      // Check if task is verified - try multiple field variations
      const isVerified = d.verified === true || 
                        d.status === 'verified' || 
                        d.status === 'approved' ||
                        d.status === 'completed';
      
      if (isVerified) {
        tasksDone += 1;
        
        // Try multiple field names for honors/points
        const earned = Number(d.honors ?? d.points ?? d.reward ?? d.earned ?? 0);
        totalEarned += earned;
        
        if (d.mission_id && d.task_id) {
          if (!userVerifiedByMission.has(d.mission_id)) {
            userVerifiedByMission.set(d.mission_id, new Set());
          }
          userVerifiedByMission.get(d.mission_id).add(key(d.task_id));
        }
      }
    });

    console.log(`   Found ${tasksDone} verified tasks`);
    console.log(`   Total earned: ${totalEarned}`);

    // 3) missionsCompleted - check if user completed all required tasks
    console.log('📊 Checking mission completions...');
    let missionsCompleted = 0;

    const missionIdsToCheck = Array.from(userVerifiedByMission.keys());
    console.log(`   Checking ${missionIdsToCheck.length} missions for completion`);

    for (const missionId of missionIdsToCheck) {
      try {
        // Try to get required tasks - check both subcollection and embedded tasks
        let requiredTaskIds = [];
        
        // First try: missions/{id}/tasks subcollection
        const requiredTasksSnap = await db
          .collection('missions')
          .doc(missionId)
          .collection('tasks')
          .where('required', '==', true)
          .get();

        if (!requiredTasksSnap.empty) {
          requiredTaskIds = requiredTasksSnap.docs.map(t => key(t.id));
        } else {
          // Second try: all tasks in subcollection
          const allTasksSnap = await db
            .collection('missions')
            .doc(missionId)
            .collection('tasks')
            .get();
          
          if (!allTasksSnap.empty) {
            requiredTaskIds = allTasksSnap.docs.map(t => key(t.id));
          } else {
            // Third try: embedded tasks array in mission document
            const missionDoc = await db.collection('missions').doc(missionId).get();
            if (missionDoc.exists) {
              const missionData = missionDoc.data();
              const embeddedTasks = missionData.tasks || missionData.taskList || [];
              requiredTaskIds = embeddedTasks
                .filter(t => t.required !== false) // Include if not explicitly marked as not required
                .map(t => key(t.id || t.taskId || t.task_id));
            }
          }
        }

        if (requiredTaskIds.length === 0) {
          console.log(`   Mission ${missionId}: No tasks found, skipping`);
          continue;
        }

        const userCompletedSet = userVerifiedByMission.get(missionId) || new Set();
        const allRequiredDone = requiredTaskIds.every(tid => userCompletedSet.has(tid));
        
        if (allRequiredDone) {
          missionsCompleted += 1;
          console.log(`   Mission ${missionId}: COMPLETED (${requiredTaskIds.length} tasks)`);
        } else {
          console.log(`   Mission ${missionId}: Not completed (${userCompletedSet.size}/${requiredTaskIds.length} tasks)`);
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
