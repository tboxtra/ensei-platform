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

async function debugMissionsCreated(userId) {
    console.log(`\n🔍 Debugging missions created for user: ${userId}`);

    // Check missions with created_by
    console.log('\n📊 Checking missions with created_by...');
    const createdBySnap = await db
        .collection('missions')
        .where('created_by', '==', userId)
        .get();

    console.log(`Found ${createdBySnap.size} missions with created_by = ${userId}`);

    if (!createdBySnap.empty) {
        createdBySnap.forEach(doc => {
            const data = doc.data();
            console.log(`Mission ${doc.id}:`, {
                created_by: data.created_by,
                deleted: data.deleted,
                title: data.title,
                status: data.status
            });
        });
    }

    // Check missions with ownerId (alternative field)
    console.log('\n📊 Checking missions with ownerId...');
    const ownerIdSnap = await db
        .collection('missions')
        .where('ownerId', '==', userId)
        .get();

    console.log(`Found ${ownerIdSnap.size} missions with ownerId = ${userId}`);

    if (!ownerIdSnap.empty) {
        ownerIdSnap.forEach(doc => {
            const data = doc.data();
            console.log(`Mission ${doc.id}:`, {
                ownerId: data.ownerId,
                created_by: data.created_by,
                deleted: data.deleted,
                title: data.title,
                status: data.status
            });
        });
    }

    // Check all missions to see the field structure
    console.log('\n📊 Checking all missions structure...');
    const allMissionsSnap = await db
        .collection('missions')
        .limit(5)
        .get();

    console.log(`Found ${allMissionsSnap.size} total missions (showing first 5)`);

    if (!allMissionsSnap.empty) {
        allMissionsSnap.forEach(doc => {
            const data = doc.data();
            console.log(`Mission ${doc.id}:`, {
                created_by: data.created_by,
                ownerId: data.ownerId,
                deleted: data.deleted,
                title: data.title
            });
        });
    }
}

const userId = 'mDPgwAwb1pYqmxmsPsYW1b4qlup2';
debugMissionsCreated(userId)
    .then(() => console.log('\n✨ Debug completed.'))
    .catch(err => {
        console.error('\n❌ Debug failed:', err?.message || err);
        process.exit(1);
    });

