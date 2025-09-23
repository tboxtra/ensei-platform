#!/usr/bin/env node

/**
 * Peek User Data Structure
 * 
 * This script examines the actual data structure to identify field name mismatches
 * Run this to see what fields actually exist in your Firestore collections
 */

const admin = require('firebase-admin');

// Configuration
const PROJECT_ID = 'ensei-6c8e0';
const USER_ID = 'mDPgwAwb1pYqmxmsPsYW1b4qlup2';

// Service Account Key Path
const SERVICE_ACCOUNT_PATH = '/Users/mac/Desktop/Ensei Alexis/ensei-platform/service-account-key.json';

async function peekUserData() {
  console.log('🔍 Peeking at user data structure...\n');
  
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

    // Initialize Firebase Admin
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: PROJECT_ID
      });
    }

    const db = admin.firestore();
    console.log(`✅ Connected to Firebase project: ${PROJECT_ID}`);

    // 1. Check mission_participations
    console.log('\n📊 Checking mission_participations...');
    const participationsSnapshot = await db.collection('mission_participations')
      .where('user_id', '==', USER_ID)
      .limit(5)
      .get();
    
    console.log(`   Found ${participationsSnapshot.docs.length} participations`);
    
    if (participationsSnapshot.docs.length > 0) {
      console.log('\n   Sample participation document:');
      const sampleParticipation = participationsSnapshot.docs[0].data();
      console.log('   Fields:', Object.keys(sampleParticipation));
      console.log('   Data:', JSON.stringify(sampleParticipation, null, 2));
      
      // Check if we can find a mission_id to examine
      const missionId = sampleParticipation.mission_id;
      if (missionId) {
        console.log(`\n📊 Checking mission ${missionId}...`);
        
        // Check mission document
        const missionDoc = await db.collection('missions').doc(missionId).get();
        if (missionDoc.exists) {
          const missionData = missionDoc.data();
          console.log('   Mission fields:', Object.keys(missionData));
          console.log('   Mission data:', JSON.stringify(missionData, null, 2));
        } else {
          console.log('   Mission document not found');
        }
        
        // Check mission tasks
        const tasksSnapshot = await db.collection('missions').doc(missionId).collection('tasks').get();
        console.log(`   Found ${tasksSnapshot.docs.length} tasks in mission`);
        
        if (tasksSnapshot.docs.length > 0) {
          console.log('\n   Sample task document:');
          const sampleTask = tasksSnapshot.docs[0].data();
          console.log('   Task fields:', Object.keys(sampleTask));
          console.log('   Task data:', JSON.stringify(sampleTask, null, 2));
        }
      }
    } else {
      console.log('   No participations found for this user');
    }

    // 2. Check missions created by user
    console.log('\n📊 Checking missions created by user...');
    
    // Try different field names for ownership
    const ownershipFields = ['ownerId', 'created_by', 'owner_id', 'createdBy'];
    
    for (const field of ownershipFields) {
      const missionsSnapshot = await db.collection('missions')
        .where(field, '==', USER_ID)
        .limit(3)
        .get();
      
      if (missionsSnapshot.docs.length > 0) {
        console.log(`   Found ${missionsSnapshot.docs.length} missions with ${field} = ${USER_ID}`);
        const sampleMission = missionsSnapshot.docs[0].data();
        console.log('   Mission fields:', Object.keys(sampleMission));
        console.log('   Mission data:', JSON.stringify(sampleMission, null, 2));
        break;
      } else {
        console.log(`   No missions found with ${field} = ${USER_ID}`);
      }
    }

    // 3. Check all mission_participations (any user) to see structure
    console.log('\n📊 Checking all mission_participations (any user)...');
    const allParticipationsSnapshot = await db.collection('mission_participations')
      .limit(3)
      .get();
    
    console.log(`   Found ${allParticipationsSnapshot.docs.length} total participations`);
    
    if (allParticipationsSnapshot.docs.length > 0) {
      console.log('\n   Sample participation (any user):');
      const sampleParticipation = allParticipationsSnapshot.docs[0].data();
      console.log('   Fields:', Object.keys(sampleParticipation));
      console.log('   Data:', JSON.stringify(sampleParticipation, null, 2));
    }

    console.log('\n✅ Data structure analysis completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Review the field names above');
    console.log('2. Update the calculate-real-user-stats.js script with correct field names');
    console.log('3. Re-run the statistics calculation');
    
  } catch (error) {
    console.error('❌ Error peeking at user data:', error);
    process.exit(1);
  }
}

// Run the script
peekUserData()
  .then(() => {
    console.log('🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
