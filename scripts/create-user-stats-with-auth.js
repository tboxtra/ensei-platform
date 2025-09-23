#!/usr/bin/env node

/**
 * Create User Stats with Explicit Authentication
 * 
 * This script creates user stats documents using explicit service account credentials
 * You need to download a service account key from Firebase Console first
 */

const admin = require('firebase-admin');

// Configuration
const PROJECT_ID = 'ensei-6c8e0';
const USER_ID = 'mDPgwAwb1pYqmxmsPsYW1b4qlup2'; // From your screenshot

// Service Account Key Path - UPDATE THIS PATH
const SERVICE_ACCOUNT_PATH = '/Users/mac/Desktop/Ensei Alexis/ensei-platform/service-account-key.json';

async function createUserStatsWithAuth() {
    console.log('🚀 Creating user stats with explicit authentication...\n');

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

        // Create user stats document
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

        console.log('\n✅ User stats creation completed!');
        console.log('🔄 Refresh your app to see the QuickStats update');

    } catch (error) {
        console.error('❌ Error creating user stats:', error);
        process.exit(1);
    }
}

// Run the script
createUserStatsWithAuth()
    .then(() => {
        console.log('🎉 Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
