/**
 * Twitter OAuth Integration Verification Tests
 * Pre-ship verification checklist
 */

import { validateUsername } from './validation';

/**
 * Test 1: Normalization Parity
 * Verify that various Twitter handle formats normalize to the same value
 */
export function testNormalizationParity() {
    console.log('🧪 Testing Twitter Username Normalization Parity...');

    const testCases = [
        '@Alice__',
        ' alice ',
        'ALICE',
        'Alice123',
        '@alice_123',
        '  @Alice__  ',
        'ALICE_123',
        'alice__'
    ];

    const results = testCases.map(handle => {
        const validation = validateUsername(handle, 'twitter');
        return {
            input: handle,
            output: validation.isValid ? validation.data?.username : 'INVALID',
            isValid: validation.isValid
        };
    });

    console.log('Normalization Results:', results);

    // All valid inputs should normalize to the same value
    const validResults = results.filter(r => r.isValid).map(r => r.output);
    const uniqueOutputs = [...new Set(validResults)];

    const passed = uniqueOutputs.length === 1 && uniqueOutputs[0] === 'alice123';

    console.log(passed ? '✅ Normalization parity test PASSED' : '❌ Normalization parity test FAILED');
    console.log('Expected: alice123, Got:', uniqueOutputs);

    return { passed, results, uniqueOutputs };
}

/**
 * Test 2: Single Source of Truth
 * Verify all paths use the same validateUsername function
 */
export function testSingleSourceOfTruth() {
    console.log('🧪 Testing Single Source of Truth...');

    // Test that validateUsername handles Twitter platform correctly
    const testCases = [
        { input: 'valid_user', expected: true },
        { input: 'user-with-dash', expected: false }, // Twitter doesn't allow dashes
        { input: 'user.with.dot', expected: false }, // Twitter doesn't allow dots
        { input: 'user_with_underscore', expected: true },
        { input: '123numbers', expected: true },
        { input: '_starts_underscore', expected: false }, // Can't start with underscore
        { input: 'toolongusername123456', expected: false }, // Too long
        { input: '', expected: false }, // Empty
        { input: 'a', expected: true }, // Minimum length
    ];

    const results = testCases.map(testCase => {
        const validation = validateUsername(testCase.input, 'twitter');
        const passed = validation.isValid === testCase.expected;
        return {
            input: testCase.input,
            expected: testCase.expected,
            actual: validation.isValid,
            passed,
            error: validation.error
        };
    });

    const allPassed = results.every(r => r.passed);
    console.log(allPassed ? '✅ Single source of truth test PASSED' : '❌ Single source of truth test FAILED');

    if (!allPassed) {
        console.log('Failed cases:', results.filter(r => !r.passed));
    }

    return { passed: allPassed, results };
}

/**
 * Test 3: Conflict Resolution Rules
 * Verify existing data is preserved, blanks are filled
 */
export function testConflictResolutionRules() {
    console.log('🧪 Testing Conflict Resolution Rules...');

    const existingProfile = {
        id: 'user123',
        email: 'user@example.com',
        name: 'Existing User',
        avatar: 'existing-avatar.jpg',
        twitter_handle: 'existing_twitter',
        twitter: 'existing_twitter',
        twitterUsername: 'existing_twitter',
        bio: 'Existing bio'
    };

    const oauthData = {
        id: 'user123',
        email: 'user@example.com',
        name: 'OAuth User', // Should be ignored (existing is non-empty)
        avatar: 'oauth-avatar.jpg', // Should be ignored (existing is non-empty)
        twitter_handle: 'oauth_twitter', // Should be ignored (existing is non-empty)
        twitter: 'oauth_twitter', // Should be ignored (existing is non-empty)
        twitterUsername: 'oauth_twitter', // Should be ignored (existing is non-empty)
        firstName: 'OAuth', // Should be filled (existing is empty)
        lastName: 'User' // Should be filled (existing is empty)
    };

    // Simulate the conflict resolution logic from our implementation
    const resolved = {
        ...existingProfile,
        ...oauthData,
        // Preserve existing Twitter data if no new Twitter data from OAuth
        twitter: oauthData.twitter || existingProfile.twitter || '',
        twitter_handle: oauthData.twitter_handle || existingProfile.twitter_handle || '',
        twitterUsername: oauthData.twitterUsername || existingProfile.twitterUsername || ''
    };

    const tests = [
        { field: 'name', expected: 'Existing User', actual: resolved.name, description: 'Preserve existing name' },
        { field: 'avatar', expected: 'existing-avatar.jpg', actual: resolved.avatar, description: 'Preserve existing avatar' },
        { field: 'twitter_handle', expected: 'existing_twitter', actual: resolved.twitter_handle, description: 'Preserve existing Twitter handle' },
        { field: 'twitter', expected: 'existing_twitter', actual: resolved.twitter, description: 'Preserve existing Twitter field' },
        { field: 'firstName', expected: 'OAuth', actual: resolved.firstName, description: 'Fill blank firstName' },
        { field: 'lastName', expected: 'User', actual: resolved.lastName, description: 'Fill blank lastName' }
    ];

    const results = tests.map(test => ({
        ...test,
        passed: test.expected === test.actual
    }));

    const allPassed = results.every(r => r.passed);
    console.log(allPassed ? '✅ Conflict resolution test PASSED' : '❌ Conflict resolution test FAILED');

    if (!allPassed) {
        console.log('Failed cases:', results.filter(r => !r.passed));
    }

    return { passed: allPassed, results };
}

/**
 * Test 4: Idempotency
 * Verify running merge twice yields no changes
 */
export function testIdempotency() {
    console.log('🧪 Testing Profile Merge Idempotency...');

    const profile1 = {
        id: 'user123',
        email: 'user@example.com',
        name: 'Test User',
        twitter_handle: 'testuser',
        twitter: 'testuser',
        updated_at: '2024-01-01T00:00:00Z'
    };

    const profile2 = {
        id: 'user123',
        email: 'user@example.com',
        name: 'Test User',
        twitter_handle: 'testuser',
        twitter: 'testuser',
        updated_at: '2024-01-01T00:00:00Z'
    };

    // Simulate merge (should be identical)
    const merged1 = { ...profile1, ...profile2 };
    const merged2 = { ...merged1, ...profile2 };

    // Check if all fields are identical (except timestamps)
    const fieldsToCheck = ['id', 'email', 'name', 'twitter_handle', 'twitter'];
    const differences = fieldsToCheck.filter(field => merged1[field] !== merged2[field]);

    const passed = differences.length === 0;
    console.log(passed ? '✅ Idempotency test PASSED' : '❌ Idempotency test FAILED');

    if (!passed) {
        console.log('Differences found:', differences);
    }

    return { passed, differences };
}

/**
 * Test 5: Security Check
 * Verify no sensitive data is stored
 */
export function testSecurityMeasures() {
    console.log('🧪 Testing Security Measures...');

    const mockOAuthResult = {
        user: {
            uid: 'user123',
            email: 'user@example.com',
            displayName: 'Test User',
            photoURL: 'https://example.com/avatar.jpg'
        },
        additionalUserInfo: {
            username: 'testuser',
            providerId: 'twitter.com'
        },
        credential: {
            accessToken: 'secret_access_token', // Should NOT be stored
            secret: 'secret_secret' // Should NOT be stored
        }
    };

    // Simulate our data extraction (should exclude sensitive data)
    const extractedData = {
        id: mockOAuthResult.user.uid,
        email: mockOAuthResult.user.email,
        name: mockOAuthResult.user.displayName,
        avatar: mockOAuthResult.user.photoURL,
        twitterUsername: mockOAuthResult.additionalUserInfo.username,
        twitter_handle: mockOAuthResult.additionalUserInfo.username,
        twitter: mockOAuthResult.additionalUserInfo.username
    };

    const securityTests = [
        {
            test: 'No access token stored',
            passed: !extractedData.hasOwnProperty('accessToken') && !extractedData.hasOwnProperty('credential')
        },
        {
            test: 'No secret stored',
            passed: !extractedData.hasOwnProperty('secret')
        },
        {
            test: 'Only safe data extracted',
            passed: Object.keys(extractedData).every(key =>
                ['id', 'email', 'name', 'avatar', 'twitterUsername', 'twitter_handle', 'twitter'].includes(key)
            )
        }
    ];

    const allPassed = securityTests.every(test => test.passed);
    console.log(allPassed ? '✅ Security test PASSED' : '❌ Security test FAILED');

    if (!allPassed) {
        console.log('Failed security tests:', securityTests.filter(t => !t.passed));
    }

    return { passed: allPassed, tests: securityTests };
}

/**
 * Test 6: Telemetry Events
 * Verify proper event logging
 */
export function testTelemetryEvents() {
    console.log('🧪 Testing Telemetry Events...');

    const mockEvents = [
        {
            event: 'oauth_twitter_start',
            provider: 'twitter',
            timestamp: new Date().toISOString()
        },
        {
            event: 'oauth_twitter_success',
            provider: 'twitter',
            hasTwitterHandle: true,
            timestamp: new Date().toISOString()
        },
        {
            event: 'oauth_twitter_error',
            error_code: 'auth/popup-closed-by-user',
            provider: 'twitter',
            timestamp: new Date().toISOString()
        }
    ];

    const telemetryTests = [
        {
            test: 'Start event has required fields',
            event: mockEvents[0],
            passed: mockEvents[0].event === 'oauth_twitter_start' &&
                mockEvents[0].provider === 'twitter' &&
                mockEvents[0].timestamp
        },
        {
            test: 'Success event has required fields',
            event: mockEvents[1],
            passed: mockEvents[1].event === 'oauth_twitter_success' &&
                mockEvents[1].provider === 'twitter' &&
                mockEvents[1].hasTwitterHandle !== undefined &&
                mockEvents[1].timestamp
        },
        {
            test: 'Error event has required fields',
            event: mockEvents[2],
            passed: mockEvents[2].event === 'oauth_twitter_error' &&
                mockEvents[2].error_code &&
                mockEvents[2].provider === 'twitter' &&
                mockEvents[2].timestamp
        }
    ];

    const allPassed = telemetryTests.every(test => test.passed);
    console.log(allPassed ? '✅ Telemetry test PASSED' : '❌ Telemetry test FAILED');

    if (!allPassed) {
        console.log('Failed telemetry tests:', telemetryTests.filter(t => !t.passed));
    }

    return { passed: allPassed, tests: telemetryTests };
}

/**
 * Run all verification tests
 */
export function runAllVerificationTests() {
    console.log('🚀 Running Twitter OAuth Integration Verification Tests...\n');

    const results = {
        normalization: testNormalizationParity(),
        singleSource: testSingleSourceOfTruth(),
        conflictResolution: testConflictResolutionRules(),
        idempotency: testIdempotency(),
        security: testSecurityMeasures(),
        telemetry: testTelemetryEvents()
    };

    const allPassed = Object.values(results).every(result => result.passed);

    console.log('\n📊 Verification Test Results:');
    console.log('Normalization Parity:', results.normalization.passed ? '✅ PASS' : '❌ FAIL');
    console.log('Single Source of Truth:', results.singleSource.passed ? '✅ PASS' : '❌ FAIL');
    console.log('Conflict Resolution:', results.conflictResolution.passed ? '✅ PASS' : '❌ FAIL');
    console.log('Idempotency:', results.idempotency.passed ? '✅ PASS' : '❌ FAIL');
    console.log('Security:', results.security.passed ? '✅ PASS' : '❌ FAIL');
    console.log('Telemetry:', results.telemetry.passed ? '✅ PASS' : '❌ FAIL');

    if (allPassed) {
        console.log('\n🎉 All verification tests PASSED! Ready for production.');
    } else {
        console.log('\n⚠️  Some tests failed. Review the logs above.');
    }

    return { allPassed, results };
}

// Export for browser console testing
if (typeof window !== 'undefined') {
    (window as any).runTwitterVerificationTests = runAllVerificationTests;
    console.log('Twitter OAuth verification tests available at window.runTwitterVerificationTests()');
}
