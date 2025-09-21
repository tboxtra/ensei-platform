#!/usr/bin/env node

/**
 * Debug script to check My Missions submissions data flow
 * Run this to verify data is being stored and retrieved correctly
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, orderBy } = require('firebase/firestore');

// Firebase config (you'll need to add your actual config)
const firebaseConfig = {
    // Add your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugSubmissions() {
    console.log('🔍 Debugging My Missions Submissions Data Flow...\n');

    try {
        // 1. Check all missions
        console.log('1. Checking all missions...');
        const missionsSnapshot = await getDocs(collection(db, 'missions'));
        console.log(`   Found ${missionsSnapshot.docs.length} missions`);

        missionsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`   - Mission: ${data.title} (ID: ${doc.id}, Created by: ${data.created_by})`);
        });

        // 2. Check all mission_participations
        console.log('\n2. Checking all mission_participations...');
        const participationsSnapshot = await getDocs(collection(db, 'mission_participations'));
        console.log(`   Found ${participationsSnapshot.docs.length} participation documents`);

        participationsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const tasksCompleted = data.tasks_completed || [];
            console.log(`   - Participation: Mission ${data.mission_id}, User ${data.user_id}, Tasks: ${tasksCompleted.length}`);
            tasksCompleted.forEach(task => {
                console.log(`     * Task ${task.task_id}: ${task.status} (${task.completed_at})`);
            });
        });

        // 3. Check for specific mission (replace with actual mission ID)
        const testMissionId = 'your-mission-id-here'; // Replace with actual mission ID
        console.log(`\n3. Checking submissions for mission: ${testMissionId}`);

        const missionQuery = query(
            collection(db, 'mission_participations'),
            where('mission_id', '==', testMissionId),
            orderBy('created_at', 'desc')
        );

        const missionSnapshot = await getDocs(missionQuery);
        console.log(`   Found ${missionSnapshot.docs.length} participation documents for this mission`);

        missionSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const tasksCompleted = data.tasks_completed || [];
            console.log(`   - User ${data.user_id}: ${tasksCompleted.length} tasks completed`);
            tasksCompleted.forEach(task => {
                console.log(`     * Task ${task.task_id}: ${task.status} (${task.completed_at})`);
            });
        });

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the debug function
debugSubmissions().then(() => {
    console.log('\n✅ Debug complete!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
});
