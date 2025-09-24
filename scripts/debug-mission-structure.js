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

async function debugMissionStructure(missionId) {
    console.log(`\n🔍 Debugging mission structure for: ${missionId}`);

    const missionDoc = await db.collection('missions').doc(missionId).get();
    if (!missionDoc.exists) {
        console.log('❌ Mission not found');
        return;
    }

    const missionData = missionDoc.data();
    console.log('\n📄 Mission Document:');
    console.log('Fields:', Object.keys(missionData));

    console.log('\n📊 Mission Data:');
    console.log(JSON.stringify(missionData, null, 2));

    // Check if tasks is an array or subcollection
    const tasks = missionData.tasks;
    console.log('\n🎯 Tasks Structure:');
    console.log('Type:', typeof tasks);
    console.log('Is Array:', Array.isArray(tasks));
    console.log('Value:', tasks);

    if (Array.isArray(tasks)) {
        console.log('\n📋 Tasks Array:');
        tasks.forEach((task, index) => {
            console.log(`Task ${index + 1}:`, task);
        });
    }

    // Check for tasks subcollection
    console.log('\n🔍 Checking tasks subcollection...');
    const tasksSnap = await db.collection('missions').doc(missionId).collection('tasks').get();
    console.log(`Found ${tasksSnap.size} tasks in subcollection`);

    if (!tasksSnap.empty) {
        tasksSnap.forEach(doc => {
            console.log(`Task ${doc.id}:`, doc.data());
        });
    }
}

// Test with one of the mission IDs from the debug output
const missionId = '8bJCB5kApPzvENOQ2TjL';
debugMissionStructure(missionId)
    .then(() => console.log('\n✨ Debug completed.'))
    .catch(err => {
        console.error('\n❌ Debug failed:', err?.message || err);
        process.exit(1);
    });

