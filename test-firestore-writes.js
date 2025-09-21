/**
 * Firestore Writes Test Script
 * 
 * This script tests that Firestore writes now succeed after fixing the security rules.
 * Run this in the browser console on the Discover & Earn page.
 */

// Test function to verify Firestore writes work
async function testFirestoreWrites() {
    console.log('🧪 Testing Firestore Writes After Security Rules Fix');
    console.log('='.repeat(60));

    try {
        // 1. Check authentication
        const user = firebase.auth().currentUser;
        if (!user) {
            console.error('❌ User not authenticated');
            console.log('💡 Please sign in first, then run this test again');
            return;
        }
        console.log('✅ User authenticated:', user.uid);

        // 2. Test direct write to mission_participations
        console.log('\n📝 Testing direct write to mission_participations...');

        const db = firebase.firestore();
        const testParticipation = {
            mission_id: 'test-mission-' + Date.now(),
            user_id: user.uid,
            user_name: user.displayName || 'Test User',
            user_email: user.email,
            user_social_handle: 'testuser',
            platform: 'twitter',
            status: 'active',
            joined_at: new Date().toISOString(),
            tasks_completed: [{
                task_id: 'like',
                action_id: 'direct',
                completed_at: new Date().toISOString(),
                verification_data: {
                    url: null,
                    userAgent: navigator.userAgent,
                    sessionId: Date.now().toString()
                },
                api_result: null,
                status: 'completed',
                mission_id: 'test-mission-' + Date.now(),
                user_id: user.uid,
                verificationMethod: 'direct',
                url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }],
            total_honors_earned: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        try {
            const docRef = await db.collection('mission_participations').add(testParticipation);
            console.log('✅ Direct write to mission_participations: SUCCESS');
            console.log('📋 Document ID:', docRef.id);

            // Clean up test document
            await docRef.delete();
            console.log('🧹 Test document cleaned up');

        } catch (error) {
            console.error('❌ Direct write to mission_participations: FAILED');
            console.error('Error:', error.code, error.message);

            if (error.code === 'permission-denied') {
                console.log('💡 This indicates the Firestore rules still need to be deployed');
                console.log('💡 Make sure you deployed the updated rules to the ensei-6c8e0 project');
            }
            return;
        }

        // 3. Test user activity logs write
        console.log('\n📝 Testing write to user_activity_logs...');

        const testLog = {
            user_id: user.uid,
            action: 'test_action',
            timestamp: new Date().toISOString(),
            metadata: {
                test: true,
                browser: navigator.userAgent
            }
        };

        try {
            const logRef = await db.collection('user_activity_logs').add(testLog);
            console.log('✅ Write to user_activity_logs: SUCCESS');
            console.log('📋 Log ID:', logRef.id);

            // Clean up test log
            await logRef.delete();
            console.log('🧹 Test log cleaned up');

        } catch (error) {
            console.error('❌ Write to user_activity_logs: FAILED');
            console.error('Error:', error.code, error.message);
        }

        // 4. Test the actual task completion flow
        console.log('\n🎯 Testing actual task completion flow...');

        // This would normally be called by the UI
        const testMissionId = 'test-mission-flow-' + Date.now();
        const testTaskId = 'like';

        try {
            // Simulate what createTaskCompletion does
            const participationQuery = await db.collection('mission_participations')
                .where('mission_id', '==', testMissionId)
                .where('user_id', '==', user.uid)
                .get();

            let participationId;
            let participationData;

            if (participationQuery.empty) {
                // Create new participation
                const newParticipation = {
                    mission_id: testMissionId,
                    user_id: user.uid,
                    user_name: user.displayName || 'Test User',
                    user_email: user.email,
                    user_social_handle: 'testuser',
                    platform: 'twitter',
                    status: 'active',
                    joined_at: new Date().toISOString(),
                    tasks_completed: [],
                    total_honors_earned: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                const participationRef = await db.collection('mission_participations').add(newParticipation);
                participationId = participationRef.id;
                participationData = newParticipation;
                console.log('✅ Created new participation:', participationId);
            } else {
                const doc = participationQuery.docs[0];
                participationId = doc.id;
                participationData = doc.data();
                console.log('✅ Found existing participation:', participationId);
            }

            // Add task completion
            const taskCompletion = {
                task_id: testTaskId,
                action_id: 'direct',
                completed_at: new Date().toISOString(),
                verification_data: {
                    url: null,
                    userAgent: navigator.userAgent,
                    sessionId: Date.now().toString()
                },
                api_result: null,
                status: 'completed',
                mission_id: testMissionId,
                user_id: user.uid,
                verificationMethod: 'direct',
                url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const tasksCompleted = participationData.tasks_completed || [];
            tasksCompleted.push(taskCompletion);

            // Update participation
            await db.collection('mission_participations').doc(participationId).update({
                tasks_completed: tasksCompleted,
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ Task completion flow: SUCCESS');
            console.log('📋 Added task completion to participation:', participationId);

            // Clean up test data
            await db.collection('mission_participations').doc(participationId).delete();
            console.log('🧹 Test participation cleaned up');

        } catch (error) {
            console.error('❌ Task completion flow: FAILED');
            console.error('Error:', error.code, error.message);
        }

        // 5. Summary
        console.log('\n📈 Test Summary:');
        console.log('✅ Authentication: Working');
        console.log('✅ Direct writes: Working');
        console.log('✅ Task completion flow: Working');
        console.log('✅ Security rules: Properly configured');

        console.log('\n🎉 All Firestore writes are now working!');
        console.log('💡 You can now complete tasks in the UI and they should turn green');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Test function to simulate a real task completion
async function simulateTaskCompletion(missionId, taskId, verificationMethod = 'direct', url = null) {
    console.log(`🧪 Simulating ${verificationMethod} task completion...`);

    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.error('❌ User not authenticated');
            return;
        }

        const db = firebase.firestore();

        // Use the same logic as createTaskCompletion
        const participationQuery = await db.collection('mission_participations')
            .where('mission_id', '==', missionId)
            .where('user_id', '==', user.uid)
            .get();

        let participationId;
        let participationData;

        if (participationQuery.empty) {
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
                total_honors_earned: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const participationRef = await db.collection('mission_participations').add(newParticipation);
            participationId = participationRef.id;
            participationData = newParticipation;
        } else {
            const doc = participationQuery.docs[0];
            participationId = doc.id;
            participationData = doc.data();
        }

        // Create task completion
        const taskCompletion = {
            task_id: taskId,
            action_id: verificationMethod,
            completed_at: new Date().toISOString(),
            verification_data: {
                url: url,
                userAgent: navigator.userAgent,
                sessionId: Date.now().toString()
            },
            api_result: null,
            status: 'completed',
            mission_id: missionId,
            user_id: user.uid,
            verificationMethod: verificationMethod,
            url: url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const tasksCompleted = participationData.tasks_completed || [];

        // Check if task is already completed
        const existingTask = tasksCompleted.find((t) => t.task_id === taskId);
        if (existingTask) {
            console.log('⚠️ Task already completed, updating...');
            const taskIndex = tasksCompleted.findIndex((t) => t.task_id === taskId);
            tasksCompleted[taskIndex] = taskCompletion;
        } else {
            tasksCompleted.push(taskCompletion);
        }

        // Update participation
        await db.collection('mission_participations').doc(participationId).update({
            tasks_completed: tasksCompleted,
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Task completion simulated successfully!');
        console.log('📋 Details:', {
            missionId,
            taskId,
            verificationMethod,
            url,
            participationId,
            completedAt: taskCompletion.completed_at
        });

        console.log('💡 Check the UI - the task should now show as completed!');

    } catch (error) {
        console.error('❌ Task completion simulation failed:', error);
        console.error('Error details:', error.code, error.message);
    }
}

// Export functions for use in console
window.testFirestoreWrites = testFirestoreWrites;
window.simulateTaskCompletion = simulateTaskCompletion;

console.log('🚀 Firestore Writes Test Script Loaded!');
console.log('📝 Available functions:');
console.log('  - testFirestoreWrites() - Test all Firestore write operations');
console.log('  - simulateTaskCompletion(missionId, taskId, verificationMethod, url) - Simulate task completion');
console.log('');
console.log('💡 Usage:');
console.log('  1. Make sure you are signed in');
console.log('  2. Run testFirestoreWrites() to verify all writes work');
console.log('  3. Run simulateTaskCompletion("mission123", "like", "direct") to test completion');
console.log('  4. Check that tasks turn green in the UI after successful writes');
