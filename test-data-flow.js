/**
 * Data Flow Test Script
 * 
 * This script helps verify that activities from Discover & Earn page
 * are properly logged to Firebase and show up in My Missions page.
 * 
 * Run this in the browser console on the Discover & Earn page to test.
 */

// Test function to verify data flow
async function testDataFlow() {
    console.log('🔍 Testing Data Flow: Discover & Earn → Firebase → My Missions');

    try {
        // 1. Check if user is authenticated
        const user = firebase.auth().currentUser;
        if (!user) {
            console.error('❌ User not authenticated');
            return;
        }
        console.log('✅ User authenticated:', user.uid);

        // 2. Check if we can access the mission_participations collection
        const db = firebase.firestore();
        const participationsRef = db.collection('mission_participations');

        // 3. Get user's participations
        const userParticipations = await participationsRef
            .where('user_id', '==', user.uid)
            .get();

        console.log('📊 User participations found:', userParticipations.size);

        // 4. Display participation details
        userParticipations.forEach(doc => {
            const data = doc.data();
            console.log('📋 Participation:', {
                id: doc.id,
                mission_id: data.mission_id,
                user_name: data.user_name,
                tasks_completed: data.tasks_completed?.length || 0,
                total_honors: data.total_honors_earned || 0
            });

            // 5. Show task completions
            if (data.tasks_completed && data.tasks_completed.length > 0) {
                console.log('✅ Task completions:');
                data.tasks_completed.forEach((task, index) => {
                    console.log(`  ${index + 1}. ${task.task_id} - ${task.status} (${task.completed_at})`);
                    if (task.verification_data?.url) {
                        console.log(`     URL: ${task.verification_data.url}`);
                    }
                });
            }
        });

        // 6. Test data conversion (simulate what My Missions page does)
        console.log('🔄 Testing data conversion...');
        const convertedData = [];

        userParticipations.forEach(doc => {
            const data = doc.data();
            const tasksCompleted = data.tasks_completed || [];

            tasksCompleted.forEach(task => {
                convertedData.push({
                    id: `${doc.id}_${task.task_id}`,
                    missionId: data.mission_id,
                    taskId: task.task_id,
                    userId: user.uid,
                    userName: data.user_name,
                    status: task.status === 'completed' ? 'verified' : 'pending',
                    completedAt: new Date(task.completed_at),
                    url: task.verification_data?.url || null
                });
            });
        });

        console.log('📤 Converted data for My Missions page:', convertedData);

        // 7. Summary
        console.log('📈 Summary:');
        console.log(`  - Total participations: ${userParticipations.size}`);
        console.log(`  - Total task completions: ${convertedData.length}`);
        console.log(`  - Verified completions: ${convertedData.filter(t => t.status === 'verified').length}`);
        console.log(`  - Pending completions: ${convertedData.filter(t => t.status === 'pending').length}`);

        console.log('✅ Data flow test completed successfully!');

    } catch (error) {
        console.error('❌ Data flow test failed:', error);
    }
}

// Test function to simulate a task completion
async function simulateTaskCompletion(missionId, taskId) {
    console.log('🧪 Simulating task completion...');

    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.error('❌ User not authenticated');
            return;
        }

        const db = firebase.firestore();
        const participationsRef = db.collection('mission_participations');

        // Check if user is already participating
        const existingParticipation = await participationsRef
            .where('mission_id', '==', missionId)
            .where('user_id', '==', user.uid)
            .get();

        let participationId;
        let participationData;

        if (existingParticipation.empty) {
            // Create new participation
            const newParticipation = {
                mission_id: missionId,
                user_id: user.uid,
                user_name: user.displayName || 'Test User',
                user_email: user.email,
                user_social_handle: 'testuser',
                platform: 'twitter',
                status: 'active',
                joined_at: new Date().toISOString(),
                tasks_completed: [],
                total_honors_earned: 0
            };

            const participationRef = await participationsRef.add(newParticipation);
            participationId = participationRef.id;
            participationData = newParticipation;
        } else {
            const doc = existingParticipation.docs[0];
            participationId = doc.id;
            participationData = doc.data();
        }

        // Add task completion
        const taskCompletion = {
            task_id: taskId,
            action_id: 'direct',
            completed_at: new Date().toISOString(),
            verification_data: {
                url: null,
                userAgent: navigator.userAgent,
                sessionId: Date.now().toString()
            },
            api_result: null,
            status: 'completed'
        };

        const tasksCompleted = participationData.tasks_completed || [];
        tasksCompleted.push(taskCompletion);

        // Update participation
        await participationsRef.doc(participationId).update({
            tasks_completed: tasksCompleted,
            updated_at: new Date().toISOString()
        });

        console.log('✅ Task completion simulated successfully!');
        console.log('📋 Task details:', {
            missionId,
            taskId,
            participationId,
            completedAt: taskCompletion.completed_at
        });

    } catch (error) {
        console.error('❌ Task completion simulation failed:', error);
    }
}

// Export functions for use in console
window.testDataFlow = testDataFlow;
window.simulateTaskCompletion = simulateTaskCompletion;

console.log('🚀 Data Flow Test Script Loaded!');
console.log('📝 Available functions:');
console.log('  - testDataFlow() - Test complete data flow');
console.log('  - simulateTaskCompletion(missionId, taskId) - Simulate a task completion');
console.log('');
console.log('💡 Usage:');
console.log('  1. Run testDataFlow() to see current data');
console.log('  2. Run simulateTaskCompletion("mission123", "like") to test completion');
console.log('  3. Check My Missions page to see the completion appear');
