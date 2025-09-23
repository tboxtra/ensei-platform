#!/usr/bin/env node

/**
 * Backfill User Stats Script
 * 
 * Computes and creates user stats documents for existing users
 * based on their mission participations and verifications
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'ensei-6c8e0'
  });
}

const db = admin.firestore();

async function backfillUserStats(dryRun = true) {
  console.log(`🚀 Starting user stats backfill (${dryRun ? 'DRY RUN' : 'LIVE RUN'})...`);
  
  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Found ${usersSnapshot.docs.length} users to process`);
    
    let processed = 0;
    let created = 0;
    let updated = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const uid = userDoc.id;
      const userData = userDoc.data();
      
      console.log(`\n👤 Processing user: ${userData.displayName || userData.email || uid}`);
      
      // Compute stats from source data
      const stats = await computeUserStats(uid);
      
      // Get existing stats
      const existingStatsDoc = await db.doc(`users/${uid}/stats`).get();
      const existingStats = existingStatsDoc.exists ? existingStatsDoc.data() : null;
      
      console.log(`   📈 Computed stats:`, stats);
      if (existingStats) {
        console.log(`   💾 Existing stats:`, existingStats);
        
        // Check for differences
        const differences = {
          missionsCreated: stats.missionsCreated - (existingStats.missionsCreated || 0),
          missionsCompleted: stats.missionsCompleted - (existingStats.missionsCompleted || 0),
          tasksDone: stats.tasksDone - (existingStats.tasksDone || 0),
          totalEarned: stats.totalEarned - (existingStats.totalEarned || 0)
        };
        
        const hasDrift = Object.values(differences).some(diff => Math.abs(diff) > 0);
        if (hasDrift) {
          console.log(`   ⚠️  Drift detected:`, differences);
        } else {
          console.log(`   ✅ Stats are accurate`);
        }
      }
      
      if (!dryRun) {
        if (existingStats) {
          await db.doc(`users/${uid}/stats`).set({
            ...stats,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
          updated++;
        } else {
          await db.doc(`users/${uid}/stats`).set({
            ...stats,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          created++;
        }
      }
      
      processed++;
    }
    
    console.log(`\n✅ Backfill completed!`);
    console.log(`   📊 Processed: ${processed} users`);
    if (!dryRun) {
      console.log(`   🆕 Created: ${created} stats documents`);
      console.log(`   🔄 Updated: ${updated} stats documents`);
    } else {
      console.log(`   🔍 This was a dry run - no changes made`);
    }
    
  } catch (error) {
    console.error('❌ Error during backfill:', error);
    process.exit(1);
  }
}

async function computeUserStats(uid) {
  // Missions Created
  const missionsSnapshot = await db.collection('missions')
    .where('created_by', '==', uid)
    .get();
  
  const missionsCreated = missionsSnapshot.docs.filter(doc => 
    !doc.data().deletedAt
  ).length;
  
  // Tasks Done (from verifications)
  const verificationsSnapshot = await db.collection('verifications')
    .where('uid', '==', uid)
    .where('status', '==', 'VERIFIED')
    .get();
  
  const tasksDone = verificationsSnapshot.docs.length;
  
  // Missions Completed (from mission progress)
  const progressSnapshot = await db.collection(`users/${uid}/missionProgress`).get();
  const missionsCompleted = progressSnapshot.docs.filter(doc => 
    doc.data().completed === true
  ).length;
  
  // Total Earned (simplified - would need to check degen winners)
  // For now, we'll use a placeholder that would need to be computed
  // based on fixed mission honors + degen winner payouts
  const totalEarned = 0; // TODO: Implement proper honors calculation
  
  return {
    missionsCreated,
    missionsCompleted,
    tasksDone,
    totalEarned
  };
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

if (args.includes('--help')) {
  console.log(`
Usage: node backfill-user-stats.js [options]

Options:
  --execute    Actually perform the backfill (default is dry run)
  --help       Show this help message

Examples:
  node backfill-user-stats.js              # Dry run
  node backfill-user-stats.js --execute    # Live run
  `);
  process.exit(0);
}

// Run the backfill
backfillUserStats(dryRun)
  .then(() => {
    console.log('🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
