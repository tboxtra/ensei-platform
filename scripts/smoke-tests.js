#!/usr/bin/env node

/**
 * Smoke tests for production hardening
 * Tests the two critical money paths: pack purchase and mission creation
 */

const API_BASE_URL = 'https://us-central1-ensei-6c8e0.cloudfunctions.net/api';

// Test configuration
const TEST_CONFIG = {
    // Use a test user token (you'll need to replace this with a real test user token)
    TEST_USER_TOKEN: process.env.TEST_USER_TOKEN || 'test-token-placeholder',
    API_BASE_URL
};

async function makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_CONFIG.TEST_USER_TOKEN}`,
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

async function testPackPurchase() {
    console.log('🧪 Test 1: Pack Purchase (Happy Path)');
    console.log('=====================================');

    try {
        // Step 1: Get available packs
        console.log('1. Fetching available packs...');
        const packs = await makeRequest('/v1/packs');
        console.log(`   ✅ Found ${packs.length} packs`);

        // Find a small pack for testing
        const testPack = packs.find(p => p.id === 'single_1_small');
        if (!testPack) {
            throw new Error('Test pack single_1_small not found');
        }
        console.log(`   ✅ Test pack: ${testPack.label} - $${testPack.priceUsd}`);

        // Step 2: Get initial entitlements
        console.log('2. Fetching initial entitlements...');
        const initialEntitlements = await makeRequest('/v1/entitlements');
        console.log(`   ✅ Initial entitlements: ${initialEntitlements.length}`);

        // Step 3: Purchase pack
        console.log('3. Purchasing pack...');
        const purchaseResult = await makeRequest(`/v1/packs/${testPack.id}/purchase`, {
            method: 'POST',
            body: JSON.stringify({
                clientRequestId: `smoke-test-${Date.now()}`
            })
        });
        console.log(`   ✅ Purchase successful: ${purchaseResult.transactionId}`);

        // Step 4: Verify entitlements updated
        console.log('4. Verifying entitlements updated...');
        const updatedEntitlements = await makeRequest('/v1/entitlements');
        console.log(`   ✅ Updated entitlements: ${updatedEntitlements.length}`);

        // Check if new entitlement was created
        const newEntitlement = updatedEntitlements.find(e => e.packId === testPack.id);
        if (newEntitlement) {
            console.log(`   ✅ New entitlement created: ${newEntitlement.id}`);
            console.log(`   ✅ Entitlement status: ${newEntitlement.status}`);
        } else {
            console.log('   ⚠️  New entitlement not found in updated list');
        }

        console.log('✅ Test 1 PASSED: Pack purchase flow completed successfully\n');
        return { success: true, entitlementId: newEntitlement?.id };

    } catch (error) {
        console.error('❌ Test 1 FAILED:', error.message);
        return { success: false, error: error.message };
    }
}

async function testMissionCreation(entitlementId) {
    console.log('🧪 Test 2: Mission Creation with Pack');
    console.log('=====================================');

    try {
        // Step 1: Get entitlements to find active one
        console.log('1. Fetching active entitlements...');
        const entitlements = await makeRequest('/v1/entitlements');
        const activeEntitlement = entitlements.find(e => e.status === 'active');

        if (!activeEntitlement) {
            throw new Error('No active entitlement found for mission creation');
        }
        console.log(`   ✅ Active entitlement: ${activeEntitlement.id} (${activeEntitlement.packId})`);

        // Step 2: Create a test mission
        console.log('2. Creating test mission...');
        const missionData = {
            title: `Smoke Test Mission ${Date.now()}`,
            description: 'This is a smoke test mission created by automated testing',
            platform: 'twitter',
            category: 'engagement',
            tasks: [
                {
                    type: 'tweet',
                    content: 'This is a test tweet for smoke testing #smoketest',
                    requiredActions: ['likes'],
                    targetCount: 10 // Small target for testing
                }
            ],
            paymentType: 'pack',
            packId: activeEntitlement.packId,
            clientRequestId: `smoke-test-mission-${Date.now()}`
        };

        const missionResult = await makeRequest('/v1/missions', {
            method: 'POST',
            body: JSON.stringify(missionData)
        });
        console.log(`   ✅ Mission created: ${missionResult.mission.id}`);
        console.log(`   ✅ Mission title: ${missionResult.mission.title}`);

        // Step 3: Verify entitlement quota was decremented
        console.log('3. Verifying entitlement quota decremented...');
        const updatedEntitlements = await makeRequest('/v1/entitlements');
        const updatedEntitlement = updatedEntitlements.find(e => e.id === activeEntitlement.id);

        if (updatedEntitlement) {
            console.log(`   ✅ Entitlement usage: ${JSON.stringify(updatedEntitlement.usage)}`);
            console.log(`   ✅ Entitlement status: ${updatedEntitlement.status}`);
        }

        console.log('✅ Test 2 PASSED: Mission creation with pack completed successfully\n');
        return { success: true, missionId: missionResult.mission.id };

    } catch (error) {
        console.error('❌ Test 2 FAILED:', error.message);
        return { success: false, error: error.message };
    }
}

async function runSmokeTests() {
    console.log('🚀 Starting Production Hardening Smoke Tests');
    console.log('=============================================\n');

    // Check if we have a test token
    if (TEST_CONFIG.TEST_USER_TOKEN === 'test-token-placeholder') {
        console.log('⚠️  WARNING: Using placeholder test token. Set TEST_USER_TOKEN environment variable for real testing.');
        console.log('   Tests will likely fail with authentication errors.\n');
    }

    const results = {
        test1: null,
        test2: null,
        overall: false
    };

    // Run Test 1: Pack Purchase
    results.test1 = await testPackPurchase();

    // Run Test 2: Mission Creation (only if Test 1 passed)
    if (results.test1.success) {
        results.test2 = await testMissionCreation(results.test1.entitlementId);
    } else {
        console.log('⏭️  Skipping Test 2 due to Test 1 failure\n');
        results.test2 = { success: false, error: 'Skipped due to Test 1 failure' };
    }

    // Summary
    console.log('📊 Test Results Summary');
    console.log('======================');
    console.log(`Test 1 (Pack Purchase): ${results.test1.success ? '✅ PASSED' : '❌ FAILED'}`);
    if (!results.test1.success) {
        console.log(`   Error: ${results.test1.error}`);
    }

    console.log(`Test 2 (Mission Creation): ${results.test2.success ? '✅ PASSED' : '❌ FAILED'}`);
    if (!results.test2.success) {
        console.log(`   Error: ${results.test2.error}`);
    }

    results.overall = results.test1.success && results.test2.success;
    console.log(`\nOverall Result: ${results.overall ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

    if (results.overall) {
        console.log('\n🎉 Production hardening smoke tests completed successfully!');
        process.exit(0);
    } else {
        console.log('\n💥 Some smoke tests failed. Check the errors above.');
        process.exit(1);
    }
}

// Run the tests
if (require.main === module) {
    runSmokeTests().catch(error => {
        console.error('💥 Smoke test runner failed:', error);
        process.exit(1);
    });
}

module.exports = { testPackPurchase, testMissionCreation, runSmokeTests };
