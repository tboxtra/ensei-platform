#!/usr/bin/env node

/**
 * Mission Progress System Test Script
 * 
 * This script helps you test the mission progress system end-to-end.
 * Run this after completing a task in your app to verify everything is working.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy, limit } = require('firebase/firestore');

// Firebase config (replace with your actual config)
const firebaseConfig = {
    // Add your Firebase config here
    apiKey: "your-api-key",
    authDomain: "ensei-6c8e0.firebaseapp.com",
    projectId: "ensei-6c8e0",
    storageBucket: "ensei-6c8e0.appspot.com",
    messagingSenderId: "542777590186",
    appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testMissionProgress() {
    console.log('🔍 Testing Mission Progress System...\n');

    try {
        // 1. Check recent mission_participations
        console.log('1. Checking recent mission participations...');
        const participationsQuery = query(
            collection(db, 'mission_participations'),
            orderBy('updated_at', 'desc'),
            limit(5)
        );

        const participationsSnapshot = await getDocs(participationsQuery);
        console.log(`   Found ${participationsSnapshot.docs.length} recent participations`);

        if (participationsSnapshot.docs.length === 0) {
            console.log('   ⚠️  No recent participations found. Complete a task in your app first!');
            return;
        }

        // 2. Check mission_progress collection
        console.log('\n2. Checking mission_progress collection...');
        const progressQuery = query(
            collection(db, 'mission_progress'),
            orderBy('updatedAt', 'desc'),
            limit(10)
        );

        const progressSnapshot = await getDocs(progressQuery);
        console.log(`   Found ${progressSnapshot.docs.length} progress summaries`);

        if (progressSnapshot.docs.length === 0) {
            console.log('   ⚠️  No progress summaries found yet. The function may not have triggered.');
            console.log('   💡 Try completing/verifying a task in your app, then run this script again.');
            return;
        }

        // 3. Show recent progress summaries
        console.log('\n3. Recent progress summaries:');
        progressSnapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`   ${index + 1}. ${doc.id}`);
            console.log(`      User: ${data.userId}`);
            console.log(`      Mission: ${data.missionId}`);
            console.log(`      Progress: ${data.verifiedCount}/${data.totalTasks}`);
            console.log(`      Completed: ${data.missionCompleted ? '✅' : '⏳'}`);
            console.log(`      Updated: ${data.updatedAt?.toDate?.()?.toLocaleString() || 'Unknown'}`);
            console.log('');
        });

        // 4. Check for any recent participations that should have triggered the function
        console.log('4. Recent participations that should trigger progress updates:');
        participationsSnapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            const progressId = `${data.mission_id}_${data.user_id}`;
            console.log(`   ${index + 1}. ${doc.id} → should create progress doc: ${progressId}`);
            console.log(`      Status: ${data.status || 'unknown'}`);
            console.log(`      Updated: ${data.updated_at?.toDate?.()?.toLocaleString() || 'Unknown'}`);
            console.log('');
        });

        console.log('✅ Test completed!');
        console.log('\n💡 Next steps:');
        console.log('   - Complete a task in your app');
        console.log('   - Wait 5-10 seconds');
        console.log('   - Run this script again to see the progress summary');

    } catch (error) {
        console.error('❌ Error testing mission progress:', error);
        console.log('\n🔧 Troubleshooting:');
        console.log('   - Make sure you have Firebase config set up');
        console.log('   - Check that the function is deployed and active');
        console.log('   - Verify Firestore rules allow reading mission_progress');
    }
}

// Run the test
testMissionProgress().then(() => {
    console.log('\n🚀 Mission Progress System Test Complete!');
    process.exit(0);
}).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
});
