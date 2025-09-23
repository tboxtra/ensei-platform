// scripts/calculate-real-user-stats.js
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/service-account-key.json \
//   node scripts/calculate-real-user-stats.js <UID> [--dry]
//
// What it does:
// - missionsCreated: missions owned by UID (not soft-deleted)
// - tasksDone: verified participations by UID
// - totalEarned: sum of honors from verified participations by UID
// - missionsCompleted: missions where UID completed ALL required tasks
//
// Assumed schema:
// - missions (collection)
//    - doc: { ownerId, deleted? }
//    - subcollection: tasks (required?: boolean, taskId?)
// - mission_participations (collection)
//    - doc: { user_id, mission_id, task_id, verified, honors }

const admin = require('firebase-admin');
const { Timestamp, FieldValue } = admin.firestore;

(async () => {
  try {
    const UID = process.argv[2];
    const DRY = process.argv.includes('--dry');

    if (!UID) {
      console.error('❌ Missing UID. Run: node scripts/calculate-real-user-stats.js <UID> [--dry]');
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

    // 1) missionsCreated
    const missionsSnap = await db
      .collection('missions')
      .where('ownerId', '==', UID)
      .get();

    let missionsCreated = 0;
    const missionIdsOwned = [];
    missionsSnap.forEach(doc => {
      const d = doc.data() || {};
      if (!d.deleted) {
        missionsCreated += 1;
        missionIdsOwned.push(doc.id);
      }
    });

    // 2) task completions by this user
    const partsSnap = await db
      .collection('mission_participations')
      .where('user_id', '==', UID)
      .get();

    let tasksDone = 0;
    let totalEarned = 0;
    // For missionsCompleted calc:
    // map missionId => Set of task_ids the user verified
    const userVerifiedByMission = new Map();

    partsSnap.forEach(doc => {
      const d = doc.data() || {};
      if (d.verified) {
        tasksDone += 1;
        if (typeof d.honors === 'number') totalEarned += d.honors;
        if (d.mission_id && d.task_id) {
          if (!userVerifiedByMission.has(d.mission_id)) {
            userVerifiedByMission.set(d.mission_id, new Set());
          }
          userVerifiedByMission.get(d.mission_id).add(String(d.task_id));
        }
      }
    });

    // 3) missionsCompleted = count of missions where ALL required tasks are verified by the user
    let missionsCompleted = 0;

    // For each mission we have at least one verified completion, check required tasks
    const missionIdsToCheck = Array.from(userVerifiedByMission.keys());
    // (You can also include missions the user owns/participates in, but this set is enough to judge completion)
    for (const missionId of missionIdsToCheck) {
      const requiredTasksSnap = await db
        .collection('missions')
        .doc(missionId)
        .collection('tasks')
        .where('required', '==', true)
        .get();

      // If a mission has no "required" flags, treat all tasks as required
      let requiredTaskIds = [];
      if (requiredTasksSnap.empty) {
        const allTasksSnap = await db
          .collection('missions')
          .doc(missionId)
          .collection('tasks')
          .get();
        requiredTaskIds = allTasksSnap.docs.map(t => String(t.id));
      } else {
        requiredTaskIds = requiredTasksSnap.docs.map(t => String(t.id));
      }

      // If there are no tasks at all, we won't count it as completed
      if (requiredTaskIds.length === 0) continue;

      const userCompletedSet = userVerifiedByMission.get(missionId) || new Set();
      const allRequiredDone = requiredTaskIds.every(tid => userCompletedSet.has(tid));
      if (allRequiredDone) missionsCompleted += 1;
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