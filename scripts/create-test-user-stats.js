#!/usr/bin/env node

/**
 * Create Test User Stats Document
 * 
 * Creates a user stats document for testing QuickStats
 * Replace USER_ID with your actual user ID
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'ensei-6c8e0'
  });
}

const db = admin.firestore();

// Replace with your actual user ID
const USER_ID = 'mDPgwAwb1pYqmxmsPsYW1b4qlup2'; // From your screenshot

async function createTestUserStats() {
  console.log(`🚀 Creating test user stats for user: ${USER_ID}\n`);
  
  try {
    const statsRef = db.doc(`users/${USER_ID}/stats/summary`);
    
    // Check if already exists
    const existing = await statsRef.get();
    if (existing.exists) {
      console.log('✅ User stats already exist, updating...');
      await statsRef.update({
        missionsCreated: 1,
        missionsCompleted: 1,
        tasksDone: 3,
        totalEarned: 150,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Updated existing user stats');
    } else {
      console.log('📝 Creating new user stats document...');
      await statsRef.set({
        missionsCreated: 1,
        missionsCompleted: 1,
        tasksDone: 3,
        totalEarned: 150,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Created new user stats document');
    }
    
    // Verify the document
    const verify = await statsRef.get();
    if (verify.exists) {
      const data = verify.data();
      console.log('\n📊 User Stats Created:');
      console.log(`   Missions Created: ${data.missionsCreated}`);
      console.log(`   Missions Completed: ${data.missionsCompleted}`);
      console.log(`   Tasks Done: ${data.tasksDone}`);
      console.log(`   Total Earned: ${data.totalEarned}`);
    }
    
    console.log('\n✅ Test user stats creation completed!');
    console.log('🔄 Refresh your app to see the QuickStats update');
    
  } catch (error) {
    console.error('❌ Error creating test user stats:', error);
    process.exit(1);
  }
}

// Run the script
createTestUserStats()
  .then(() => {
    console.log('🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
