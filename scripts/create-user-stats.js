#!/usr/bin/env node

/**
 * Create User Stats Documents
 * 
 * Creates user stats documents for existing users to fix QuickStats showing zeros
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'ensei-6c8e0'
    });
}

const db = admin.firestore();

async function createUserStats() {
  console.log('🚀 Creating user stats documents...\n');
  
  try {
    // Get all users
    const usersSnapshot = await db.collection('users').limit(20).get();
    console.log(`📊 Found ${usersSnapshot.docs.length} users`);
    
    let created = 0;
    let updated = 0;
    
    // Process users in batches to avoid overwhelming Firestore
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 10;
    
    for (const userDoc of usersSnapshot.docs) {
      const uid = userDoc.id;
      const userData = userDoc.data();
      
      console.log(`👤 Processing user: ${uid}`);
      
      // Check if stats document already exists
      const statsRef = db.doc(`users/${uid}/stats/summary`);
      const statsDoc = await statsRef.get();
      
      if (statsDoc.exists) {
        console.log(`   ✅ Stats already exist for ${uid}`);
        updated++;
        continue;
      }
      
      // Create initial stats document
      const initialStats = {
        missionsCreated: 0,
        missionsCompleted: 0,
        tasksDone: 0,
        totalEarned: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      batch.set(statsRef, initialStats);
      batchCount++;
      created++;
      
      // Commit batch when it reaches the size limit
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`   📦 Committed batch of ${batchCount} stats documents`);
        batchCount = 0;
      }
    }
    
    // Commit any remaining documents in the batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`   📦 Committed final batch of ${batchCount} stats documents`);
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`   Created: ${created} new stats documents`);
    console.log(`   Updated: ${updated} existing stats documents`);
    console.log(`   Total: ${created + updated} users processed`);
    
    console.log('\n✅ User stats creation completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test QuickStats in the UI');
    console.log('   2. Verify real-time updates work');
    console.log('   3. Check that Cloud Functions update these stats');
    
  } catch (error) {
    console.error('❌ Error creating user stats:', error);
    process.exit(1);
  }
}

// Run the script
createUserStats()
    .then(() => {
        console.log('🎉 Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
