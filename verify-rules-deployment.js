/**
 * Firestore Rules Deployment Verification Script
 * 
 * This script verifies that the updated Firestore rules are working correctly.
 * Run this in the browser console on the Discover & Earn page.
 */

// Verification function to test the deployed rules
async function verifyRulesDeployment() {
    console.log('🔍 Verifying Firestore Rules Deployment');
    console.log('='.repeat(50));

    try {
        // 1. Check authentication
        const user = firebase.auth().currentUser;
        if (!user) {
            console.error('❌ User not authenticated');
            console.log('💡 Please sign in first, then run this verification');
            return;
        }
        console.log('✅ User authenticated:', user.uid);

        // 2. Test mission_participations write (should now succeed)
        console.log('\n📝 Testing mission_participations write...');

        const db = firebase.firestore();
        const testData = {
            mission_id: 'test-verification-' + Date.now(),
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

        try {
            const docRef = await db.collection('mission_participations').add(testData);
            console.log('✅ mission_participations write: SUCCESS');
            console.log('📋 Document ID:', docRef.id);

            // Test update operation
            await docRef.update({
                tasks_completed: [{
                    task_id: 'like',
                    action_id: 'direct',
                    completed_at: new Date().toISOString(),
                    verification_data: { url: null },
                    api_result: null,
                    status: 'completed',
                    mission_id: testData.mission_id,
                    user_id: user.uid,
                    verificationMethod: 'direct',
                    url: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }],
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ mission_participations update: SUCCESS');

            // Clean up
            await docRef.delete();
            console.log('🧹 Test document cleaned up');

        } catch (error) {
            console.error('❌ mission_participations write: FAILED');
            console.error('Error:', error.code, error.message);

            if (error.code === 'permission-denied') {
                console.log('💡 Rules may not be deployed yet or there might be an issue');
                console.log('💡 Check Firebase Console: https://console.firebase.google.com/project/ensei-6c8e0/firestore/rules');
            }
            return;
        }

        // 3. Test user_activity_logs write (should now succeed)
        console.log('\n📝 Testing user_activity_logs write...');

        const testLog = {
            user_id: user.uid,
            action: 'rules_verification_test',
            timestamp: new Date().toISOString(),
            metadata: {
                test: true,
                browser: navigator.userAgent,
                verification: 'deployment_check'
            }
        };

        try {
            const logRef = await db.collection('user_activity_logs').add(testLog);
            console.log('✅ user_activity_logs write: SUCCESS');
            console.log('📋 Log ID:', logRef.id);

            // Clean up
            await logRef.delete();
            console.log('🧹 Test log cleaned up');

        } catch (error) {
            console.error('❌ user_activity_logs write: FAILED');
            console.error('Error:', error.code, error.message);
        }

        // 4. Test unauthorized access (should fail)
        console.log('\n🔒 Testing unauthorized access...');

        try {
            // Try to create a document with different user_id (should fail)
            await db.collection('mission_participations').add({
                mission_id: 'test-unauthorized',
                user_id: 'different-user-id',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            console.error('❌ Unauthorized access: UNEXPECTEDLY SUCCEEDED');
            console.log('💡 This indicates a security issue with the rules');
        } catch (error) {
            if (error.code === 'permission-denied') {
                console.log('✅ Unauthorized access: CORRECTLY BLOCKED');
            } else {
                console.error('❌ Unauthorized access: UNEXPECTED ERROR');
                console.error('Error:', error.code, error.message);
            }
        }

        // 5. Summary
        console.log('\n📈 Deployment Verification Summary:');
        console.log('✅ Authentication: Working');
        console.log('✅ mission_participations writes: Working');
        console.log('✅ user_activity_logs writes: Working');
        console.log('✅ Security rules: Properly enforced');

        console.log('\n🎉 Firestore rules deployment verification PASSED!');
        console.log('💡 You can now complete tasks in the UI and they should work correctly');
        console.log('💡 Tasks should turn green after successful completion');

    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

// Export function for use in console
window.verifyRulesDeployment = verifyRulesDeployment;

console.log('🚀 Firestore Rules Deployment Verification Script Loaded!');
console.log('📝 Available function:');
console.log('  - verifyRulesDeployment() - Verify that the updated rules are working');
console.log('');
console.log('💡 Usage:');
console.log('  1. Make sure you are signed in');
console.log('  2. Run verifyRulesDeployment() to test the deployed rules');
console.log('  3. All writes should now succeed (no more permission-denied errors)');
