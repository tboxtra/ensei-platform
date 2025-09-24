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

async function checkMissionTypes() {
    console.log('\n🔍 Checking mission types in the database...');

    // Get all missions
    const missionsSnap = await db.collection('missions').limit(20).get();
    console.log(`Found ${missionsSnap.size} missions (showing first 20)`);

    const typeCounts = {};
    const degenMissions = [];

    missionsSnap.forEach(doc => {
        const data = doc.data();
        const type = data.type || 'unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;

        if (type === 'degen') {
            degenMissions.push({
                id: doc.id,
                title: data.title,
                type: data.type,
                created_by: data.created_by
            });
        }
    });

    console.log('\n📊 Mission type distribution:');
    Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
    });

    if (degenMissions.length > 0) {
        console.log('\n🎲 Degen missions found:');
        degenMissions.forEach(mission => {
            console.log(`   ${mission.id}: ${mission.title} (created by: ${mission.created_by})`);
        });
    } else {
        console.log('\n✅ No degen missions found in the sample');
    }
}

checkMissionTypes()
    .then(() => console.log('\n✨ Check completed.'))
    .catch(err => {
        console.error('\n❌ Check failed:', err?.message || err);
        process.exit(1);
    });

