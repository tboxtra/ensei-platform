#!/usr/bin/env node

/**
 * Calculate Real User Statistics
 * 
 * This script calculates actual user statistics based on real data:
 * - Missions Created: count of missions where ownerId == currentUser.uid and deletedAt == null
 * - Missions Completed: missions the user participated in and has completed all required tasks
 * - Tasks Done: total number of verified task actions by the user
 * - Total Earned: sum of task.honors for verified actions
 */

const admin = require('firebase-admin');

// Configuration
const PROJECT_ID = 'ensei-6c8e0';
const USER_ID = 'mDPgwAwb1pYqmxmsPsYW1b4qlup2'; // From your screenshot

// Service Account Key Path - UPDATE THIS PATH
const SERVICE_ACCOUNT_PATH = '/Users/mac/Desktop/Ensei Alexis/ensei-platform/service-account-key.json';

async function calculateRealUserStats() {
  console.log('🚀 Calculating real user statistics...\n');
  
  try {
    // Check if service account file exists
    const fs = require('fs');
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      console.error('❌ Service account key file not found!');
      console.log('\n📋 To fix this:');
      console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
      console.log('2. Click "Generate new private key"');
      console.log('3. Save the JSON file as:', SERVICE_ACCOUNT_PATH);
      console.log('4. Run this script again');
      process.exit(1);
    }

    // Initialize Firebase Admin with explicit credentials
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: PROJECT_ID
      });
    }

    const db = admin.firestore();
    console.log(`✅ Connected to Firebase project: ${PROJECT_ID}`);

    // 1. Calculate Missions Created
    console.log('📊 Calculating missions created...');
    const missionsCreatedSnapshot = await db.collection('missions')
      .where('created_by', '==', USER_ID)
      .where('deleted_at', '==', null)
      .get();
    
    const missionsCreated = missionsCreatedSnapshot.docs.length;
    console.log(`   Found ${missionsCreated} missions created by user`);

    // 2. Calculate Tasks Done and Total Earned from mission_participations
    console.log('📊 Calculating tasks done and total earned...');
    const participationsSnapshot = await db.collection('mission_participations')
      .where('user_id', '==', USER_ID)
      .get();
    
    let tasksDone = 0;
    let totalEarned = 0;
    let missionsCompleted = 0;
    const missionTaskCounts = new Map(); // missionId -> {required: number, completed: number}
    
    for (const participationDoc of participationsSnapshot.docs) {
      const participation = participationDoc.data();
      const missionId = participation.mission_id;
      const tasksCompleted = participation.tasks_completed || [];
      
      // Count verified tasks for this participation
      let verifiedTasks = 0;
      for (const task of tasksCompleted) {
        if (task.status === 'verified') {
          tasksDone++;
          verifiedTasks++;
          
          // Get mission to find task honors
          const missionDoc = await db.collection('missions').doc(missionId).get();
          if (missionDoc.exists) {
            const mission = missionDoc.data();
            const tasks = mission.tasks || [];
            const taskData = tasks.find(t => t.id === task.task_id);
            if (taskData && taskData.honors) {
              totalEarned += taskData.honors;
            }
          }
        }
      }
      
      // Track mission completion progress
      if (!missionTaskCounts.has(missionId)) {
        // Get mission to find required task count
        const missionDoc = await db.collection('missions').doc(missionId).get();
        if (missionDoc.exists) {
          const mission = missionDoc.data();
          const tasks = mission.tasks || [];
          missionTaskCounts.set(missionId, {
            required: tasks.length,
            completed: 0
          });
        }
      }
      
      const missionProgress = missionTaskCounts.get(missionId);
      if (missionProgress) {
        missionProgress.completed = Math.max(missionProgress.completed, verifiedTasks);
      }
    }
    
    // 3. Calculate Missions Completed (missions where user completed all required tasks)
    for (const [missionId, progress] of missionTaskCounts) {
      if (progress.completed >= progress.required && progress.required > 0) {
        missionsCompleted++;
      }
    }
    
    console.log(`   Found ${tasksDone} verified tasks completed`);
    console.log(`   Found ${missionsCompleted} missions completed`);
    console.log(`   Total earned: ${totalEarned} honors`);
    
    // 4. Update user stats document
    console.log('\n📝 Updating user stats document...');
    const statsRef = db.doc(`users/${USER_ID}/stats/summary`);
    
    const realStats = {
      missionsCreated: missionsCreated,
      missionsCompleted: missionsCompleted,
      tasksDone: tasksDone,
      totalEarned: totalEarned,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await statsRef.set(realStats);
    
    console.log('\n📊 Real User Stats Updated:');
    console.log(`   Missions Created: ${missionsCreated}`);
    console.log(`   Missions Completed: ${missionsCompleted}`);
    console.log(`   Tasks Done: ${tasksDone}`);
    console.log(`   Total Earned: ${totalEarned} honors`);
    
    console.log('\n✅ Real user statistics calculation completed!');
    console.log('🔄 Refresh your app to see the real QuickStats numbers');
    
  } catch (error) {
    console.error('❌ Error calculating real user stats:', error);
    process.exit(1);
  }
}

// Run the script
calculateRealUserStats()
  .then(() => {
    console.log('🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
