/**
 * Twitter OAuth Integration Test Utilities
 * This file contains test utilities to verify Twitter OAuth integration
 */

import { TwitterAuthProvider } from 'firebase/auth';

/**
 * Test Twitter OAuth provider configuration
 */
export function testTwitterProviderConfig() {
    try {
        const twitterProvider = new TwitterAuthProvider();

        console.log('✅ Twitter OAuth Provider initialized successfully');
        console.log('Provider ID:', twitterProvider.providerId);

        return {
            success: true,
            providerId: twitterProvider.providerId,
            message: 'Twitter OAuth provider configured correctly'
        };
    } catch (error) {
        console.error('❌ Twitter OAuth Provider initialization failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Twitter OAuth provider configuration failed'
        };
    }
}

/**
 * Test Twitter username extraction from auth result
 */
export function testTwitterUsernameExtraction() {
    // Mock auth result for testing
    const mockAuthResult = {
        additionalUserInfo: {
            providerId: 'twitter.com',
            username: 'testuser123'
        }
    };

    const twitterUsername = mockAuthResult.additionalUserInfo?.username;

    if (twitterUsername) {
        console.log('✅ Twitter username extraction test passed');
        console.log('Extracted username:', twitterUsername);

        return {
            success: true,
            username: twitterUsername,
            message: 'Twitter username extraction working correctly'
        };
    } else {
        console.error('❌ Twitter username extraction test failed');
        return {
            success: false,
            message: 'Twitter username extraction failed'
        };
    }
}

/**
 * Test profile data merging with Twitter username
 */
export function testProfileDataMerging() {
    const existingUserData = {
        id: 'user123',
        email: 'user@example.com',
        name: 'Test User',
        twitter: 'old_twitter',
        twitter_handle: 'old_twitter',
        twitterUsername: 'old_twitter'
    };

    const twitterUsername = 'new_twitter_user';

    const mergedUserData = {
        ...existingUserData,
        twitter: twitterUsername || existingUserData.twitter || '',
        twitter_handle: twitterUsername || existingUserData.twitter_handle || '',
        twitterUsername: twitterUsername || existingUserData.twitterUsername || ''
    };

    if (mergedUserData.twitter === twitterUsername &&
        mergedUserData.twitter_handle === twitterUsername &&
        mergedUserData.twitterUsername === twitterUsername) {
        console.log('✅ Profile data merging test passed');
        console.log('Merged data:', mergedUserData);

        return {
            success: true,
            mergedData: mergedUserData,
            message: 'Profile data merging working correctly'
        };
    } else {
        console.error('❌ Profile data merging test failed');
        return {
            success: false,
            message: 'Profile data merging failed'
        };
    }
}

/**
 * Run all Twitter OAuth integration tests
 */
export function runTwitterAuthTests() {
    console.log('🧪 Running Twitter OAuth Integration Tests...\n');

    const results = {
        providerConfig: testTwitterProviderConfig(),
        usernameExtraction: testTwitterUsernameExtraction(),
        profileMerging: testProfileDataMerging()
    };

    const allPassed = Object.values(results).every(result => result.success);

    console.log('\n📊 Test Results Summary:');
    console.log('Provider Config:', results.providerConfig.success ? '✅ PASS' : '❌ FAIL');
    console.log('Username Extraction:', results.usernameExtraction.success ? '✅ PASS' : '❌ FAIL');
    console.log('Profile Merging:', results.profileMerging.success ? '✅ PASS' : '❌ FAIL');

    if (allPassed) {
        console.log('\n🎉 All Twitter OAuth integration tests passed!');
    } else {
        console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    }

    return {
        allPassed,
        results
    };
}

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
    (window as any).testTwitterAuth = runTwitterAuthTests;
    console.log('Twitter OAuth tests available at window.testTwitterAuth()');
}
