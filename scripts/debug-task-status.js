const admin = require('firebase-admin');
const { FieldValue } = admin.firestore;

// Initialize Firebase Admin SDK
let db;
try {
    const serviceAccount = require('../service-account-key.json');
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    db = admin.firestore();
    console.log('✅ Firebase Admin SDK initialized.');
} catch (e) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', e.message);
    process.exit(1);
}

async function debugTaskStatus(userId) {
    console.log(`\n🔍 Debugging task status for user: ${userId}`);

    const participationsSnap = await db
        .collection('mission_participations')
        .where('user_id', '==', userId)
        .get();

    console.log(`Found ${participationsSnap.docs.length} participations`);

    for (const doc of participationsSnap.docs) {
        const part = doc.data();
        console.log(`\n📄 Participation ${doc.id}:`);
        console.log(`   Mission ID: ${part.mission_id}`);
        console.log(`   User ID: ${part.user_id}`);
        console.log(`   Status: ${part.status}`);

        const tasksCompleted = part.tasks_completed || [];
        console.log(`   Tasks completed: ${tasksCompleted.length}`);

        tasksCompleted.forEach((task, index) => {
            console.log(`   Task ${index + 1}:`);
            console.log(`     task_id: ${task.task_id}`);
            console.log(`     task_type: ${task.task_type}`);
            console.log(`     status: "${task.status}"`);
            console.log(`     honors_awarded: ${task.honors_awarded}`);
            console.log(`     verified_at: ${task.verified_at}`);
        });
    }
}

const userId = 'mDPgwAwb1pYqmxmsPsYW1b4qlup2';
debugTaskStatus(userId)
    .then(() => console.log('\n✨ Debug completed.'))
    .catch(err => {
        console.error('\n❌ Debug failed:', err?.message || err);
        process.exit(1);
    });

