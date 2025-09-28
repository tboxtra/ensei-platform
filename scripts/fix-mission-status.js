#!/usr/bin/env node

/**
 * Script to fix missions missing the 'status' field in Firestore
 * This ensures all missions have a proper status field set to 'active'
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        // Add your project ID here if needed
        // projectId: 'your-project-id'
    });
}

const db = admin.firestore();

async function fixMissionStatus() {
    console.log('🔍 Checking for missions missing status field...');

    try {
        // Get all missions
        const missionsSnapshot = await db.collection('missions').get();

        if (missionsSnapshot.empty) {
            console.log('✅ No missions found in database');
            return;
        }

        console.log(`📊 Found ${missionsSnapshot.size} missions total`);

        let fixedCount = 0;
        let alreadyFixedCount = 0;

        const batch = db.batch();
        let batchCount = 0;

        missionsSnapshot.forEach((doc) => {
            const missionData = doc.data();

            // Check if mission is missing status field or has invalid status
            if (!missionData.status || missionData.status === '') {
                console.log(`🔧 Fixing mission: ${doc.id} - ${missionData.title || 'Untitled'}`);

                batch.update(doc.ref, {
                    status: 'active',
                    updated_at: new Date()
                });

                fixedCount++;
                batchCount++;
            } else {
                alreadyFixedCount++;
            }

            // Firestore batch limit is 500 operations
            if (batchCount >= 500) {
                console.log('💾 Committing batch of 500 operations...');
                batch.commit();
                batchCount = 0;
            }
        });

        // Commit any remaining operations
        if (batchCount > 0) {
            console.log(`💾 Committing final batch of ${batchCount} operations...`);
            await batch.commit();
        }

        console.log('\n📈 Summary:');
        console.log(`✅ Fixed missions: ${fixedCount}`);
        console.log(`✅ Already had status: ${alreadyFixedCount}`);
        console.log(`📊 Total missions: ${missionsSnapshot.size}`);

        if (fixedCount > 0) {
            console.log('\n🎉 Mission status fix completed successfully!');
            console.log('💡 New missions should now appear on the Discover & Earn page.');
        } else {
            console.log('\n✨ All missions already have proper status fields!');
        }

    } catch (error) {
        console.error('❌ Error fixing mission status:', error);
        process.exit(1);
    }
}

// Run the fix
fixMissionStatus()
    .then(() => {
        console.log('\n🏁 Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
