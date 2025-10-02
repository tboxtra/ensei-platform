#!/usr/bin/env node

/**
 * COMPREHENSIVE DEBUGGING SCRIPT
 * 
 * This script systematically tests all aspects of the mission data flow
 * to identify why issues are still persisting:
 * - No deadline on Discover & Earn
 * - Invalid date on Admin Dashboard  
 * - Incorrect total cost
 */

const https = require('https');
const fs = require('fs');

// Configuration
const CONFIG = {
    // Update these with your actual URLs
    API_BASE_URL: 'https://your-functions-url', // Replace with actual URL
    ADMIN_TOKEN: 'your-admin-token', // Replace with actual admin token

    // Test mission IDs (replace with actual mission IDs from your system)
    TEST_MISSION_IDS: [
        'mission-id-1', // Replace with actual mission ID
        'mission-id-2', // Replace with actual mission ID
        'mission-id-3', // Replace with actual mission ID
    ]
};

// Utility functions
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, headers: res.headers, parseError: e.message });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    console.log(`🔍 ${title}`);
    console.log('='.repeat(60));
}

function logSubSection(title) {
    console.log('\n' + '-'.repeat(40));
    console.log(`📋 ${title}`);
    console.log('-'.repeat(40));
}

function logError(error, context) {
    console.log(`❌ ERROR in ${context}:`, error);
}

function logSuccess(message, data = null) {
    console.log(`✅ ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

function logWarning(message, data = null) {
    console.log(`⚠️  ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

// Debug functions
async function testSystemConfig() {
    logSection('TESTING SYSTEM CONFIG');

    try {
        const response = await makeRequest(`${CONFIG.API_BASE_URL}/v1/admin/system-config`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            logSuccess('System config retrieved successfully');
            console.log('System Config:', JSON.stringify(response.data, null, 2));

            // Check critical config values
            const config = response.data;
            if (!config.pricing?.honorsPerUsd) {
                logWarning('Missing honorsPerUsd in system config');
            }
            if (!config.pricing?.taskPrices) {
                logWarning('Missing taskPrices in system config');
            }
        } else {
            logError(`Failed to get system config: ${response.status}`, 'System Config');
            console.log('Response:', response.data);
        }
    } catch (error) {
        logError(error, 'System Config');
    }
}

async function testRawMissionData(missionId) {
    logSubSection(`TESTING RAW MISSION DATA: ${missionId}`);

    try {
        const response = await makeRequest(`${CONFIG.API_BASE_URL}/v1/debug/mission/${missionId}`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            logSuccess(`Raw mission data retrieved for ${missionId}`);

            const mission = response.data;

            // Check timestamp fields
            console.log('\n📅 TIMESTAMP ANALYSIS:');
            console.log('created_at type:', typeof mission.created_at);
            console.log('created_at value:', mission.created_at);
            console.log('updated_at type:', typeof mission.updated_at);
            console.log('updated_at value:', mission.updated_at);
            console.log('deadline type:', typeof mission.deadline);
            console.log('deadline value:', mission.deadline);
            console.log('expires_at type:', typeof mission.expires_at);
            console.log('expires_at value:', mission.expires_at);

            // Check rewards fields
            console.log('\n💰 REWARDS ANALYSIS:');
            console.log('rewards object:', mission.rewards);
            console.log('selectedDegenPreset:', mission.selectedDegenPreset);
            console.log('costUSD:', mission.costUSD);
            console.log('rewardPerUser:', mission.rewardPerUser);
            console.log('cap:', mission.cap);

            // Check model-specific fields
            console.log('\n🎯 MODEL ANALYSIS:');
            console.log('model:', mission.model);
            console.log('duration:', mission.duration);
            console.log('duration_hours:', mission.duration_hours);
            console.log('durationHours:', mission.durationHours);
            console.log('winnersPerMission:', mission.winnersPerMission);
            console.log('winnersCap:', mission.winnersCap);
            console.log('maxWinners:', mission.maxWinners);

            // Identify issues
            const issues = [];

            if (typeof mission.created_at === 'string') {
                issues.push('created_at is a string instead of Firestore Timestamp');
            }

            if (!mission.rewards || (mission.rewards.usd === 0 && mission.rewards.honors === 0)) {
                issues.push('Missing or zero rewards object');
            }

            if (mission.model === 'degen' && !mission.deadline) {
                issues.push('Degen mission missing deadline');
            }

            if (mission.model === 'fixed' && !mission.expires_at) {
                issues.push('Fixed mission missing expires_at');
            }

            if (issues.length > 0) {
                logWarning(`Issues found in mission ${missionId}:`, issues);
            } else {
                logSuccess(`No issues found in mission ${missionId}`);
            }

        } else {
            logError(`Failed to get raw mission data: ${response.status}`, `Raw Mission ${missionId}`);
            console.log('Response:', response.data);
        }
    } catch (error) {
        logError(error, `Raw Mission ${missionId}`);
    }
}

async function testPublicAPI(missionId) {
    logSubSection(`TESTING PUBLIC API: ${missionId}`);

    try {
        const response = await makeRequest(`${CONFIG.API_BASE_URL}/v1/missions/${missionId}`);

        if (response.status === 200) {
            logSuccess(`Public API data retrieved for ${missionId}`);

            const mission = response.data;

            // Check serialized fields
            console.log('\n📅 SERIALIZED TIMESTAMP ANALYSIS:');
            console.log('createdAt:', mission.createdAt);
            console.log('updatedAt:', mission.updatedAt);
            console.log('deadline:', mission.deadline);
            console.log('expiresAt:', mission.expiresAt);
            console.log('startAt:', mission.startAt);
            console.log('endAt:', mission.endAt);

            // Check rewards
            console.log('\n💰 SERIALIZED REWARDS ANALYSIS:');
            console.log('rewards:', mission.rewards);
            console.log('totalCostUsd:', mission.totalCostUsd);
            console.log('totalCostHonors:', mission.totalCostHonors);

            // Check other fields
            console.log('\n🎯 SERIALIZED MODEL ANALYSIS:');
            console.log('submissionsLimit:', mission.submissionsLimit);
            console.log('winnersPerMission:', mission.winnersPerMission);

            // Identify issues
            const issues = [];

            if (mission.createdAt === 'Invalid Date' || mission.createdAt === null) {
                issues.push('Invalid createdAt in public API');
            }

            if (mission.totalCostUsd === 0 && mission.model === 'degen') {
                issues.push('Zero totalCostUsd for degen mission in public API');
            }

            if (mission.model === 'degen' && (!mission.deadline || mission.deadline === 'Invalid Date')) {
                issues.push('Invalid or missing deadline for degen mission in public API');
            }

            if (issues.length > 0) {
                logWarning(`Issues found in public API for mission ${missionId}:`, issues);
            } else {
                logSuccess(`No issues found in public API for mission ${missionId}`);
            }

        } else {
            logError(`Failed to get public API data: ${response.status}`, `Public API ${missionId}`);
            console.log('Response:', response.data);
        }
    } catch (error) {
        logError(error, `Public API ${missionId}`);
    }
}

async function testAdminAPI(missionId) {
    logSubSection(`TESTING ADMIN API: ${missionId}`);

    try {
        const response = await makeRequest(`${CONFIG.API_BASE_URL}/v1/admin/missions`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            logSuccess(`Admin API data retrieved`);

            const missions = response.data;
            const mission = missions.find(m => m.id === missionId);

            if (mission) {
                console.log('\n📅 ADMIN API TIMESTAMP ANALYSIS:');
                console.log('createdAt:', mission.createdAt);
                console.log('deadline:', mission.deadline);
                console.log('expiresAt:', mission.expiresAt);

                console.log('\n💰 ADMIN API REWARDS ANALYSIS:');
                console.log('totalCostUsd:', mission.totalCostUsd);
                console.log('totalCostHonors:', mission.totalCostHonors);
                console.log('perUserHonors:', mission.perUserHonors);
                console.log('perWinnerHonors:', mission.perWinnerHonors);

                console.log('\n🎯 ADMIN API MODEL ANALYSIS:');
                console.log('submissionsLimit:', mission.submissionsLimit);
                console.log('winnersPerMission:', mission.winnersPerMission);
                console.log('winnersCount:', mission.winnersCount);

                // Identify issues
                const issues = [];

                if (mission.createdAt === 'Invalid Date' || mission.createdAt === null) {
                    issues.push('Invalid createdAt in admin API');
                }

                if (mission.totalCostUsd === 0) {
                    issues.push('Zero totalCostUsd in admin API');
                }

                if (mission.model === 'degen' && (!mission.deadline || mission.deadline === 'Invalid Date')) {
                    issues.push('Invalid or missing deadline for degen mission in admin API');
                }

                if (issues.length > 0) {
                    logWarning(`Issues found in admin API for mission ${missionId}:`, issues);
                } else {
                    logSuccess(`No issues found in admin API for mission ${missionId}`);
                }
            } else {
                logWarning(`Mission ${missionId} not found in admin API response`);
            }

        } else {
            logError(`Failed to get admin API data: ${response.status}`, `Admin API ${missionId}`);
            console.log('Response:', response.data);
        }
    } catch (error) {
        logError(error, `Admin API ${missionId}`);
    }
}

async function testBackfillEndpoint() {
    logSection('TESTING BACKFILL ENDPOINT');

    try {
        const response = await makeRequest(`${CONFIG.API_BASE_URL}/v1/admin/backfill-timestamps`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.ADMIN_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            logSuccess('Backfill endpoint executed successfully');
            console.log('Backfill Result:', JSON.stringify(response.data, null, 2));
        } else {
            logError(`Backfill endpoint failed: ${response.status}`, 'Backfill');
            console.log('Response:', response.data);
        }
    } catch (error) {
        logError(error, 'Backfill');
    }
}

async function testPublicMissionsList() {
    logSection('TESTING PUBLIC MISSIONS LIST');

    try {
        const response = await makeRequest(`${CONFIG.API_BASE_URL}/v1/missions?limit=5`);

        if (response.status === 200) {
            logSuccess('Public missions list retrieved');

            const missions = response.data;
            console.log(`Found ${missions.length} missions`);

            missions.forEach((mission, index) => {
                console.log(`\n📋 Mission ${index + 1}:`);
                console.log('ID:', mission.id);
                console.log('Model:', mission.model);
                console.log('CreatedAt:', mission.createdAt);
                console.log('Deadline:', mission.deadline);
                console.log('TotalCostUsd:', mission.totalCostUsd);
                console.log('TotalCostHonors:', mission.totalCostHonors);

                // Check for issues
                const issues = [];
                if (mission.createdAt === 'Invalid Date' || mission.createdAt === null) {
                    issues.push('Invalid createdAt');
                }
                if (mission.model === 'degen' && (!mission.deadline || mission.deadline === 'Invalid Date')) {
                    issues.push('Invalid or missing deadline');
                }
                if (mission.totalCostUsd === 0) {
                    issues.push('Zero totalCostUsd');
                }

                if (issues.length > 0) {
                    logWarning(`Issues in mission ${mission.id}:`, issues);
                }
            });

        } else {
            logError(`Failed to get public missions list: ${response.status}`, 'Public Missions List');
            console.log('Response:', response.data);
        }
    } catch (error) {
        logError(error, 'Public Missions List');
    }
}

// Main debugging function
async function runComprehensiveDebug() {
    console.log('🚀 STARTING COMPREHENSIVE DEBUGGING PROCEDURE');
    console.log('This will systematically test all aspects of the mission data flow');
    console.log('to identify why issues are still persisting.');

    // Step 1: Test system configuration
    await testSystemConfig();

    // Step 2: Test raw mission data for each test mission
    for (const missionId of CONFIG.TEST_MISSION_IDS) {
        await testRawMissionData(missionId);
    }

    // Step 3: Test public API for each test mission
    for (const missionId of CONFIG.TEST_MISSION_IDS) {
        await testPublicAPI(missionId);
    }

    // Step 4: Test admin API for each test mission
    for (const missionId of CONFIG.TEST_MISSION_IDS) {
        await testAdminAPI(missionId);
    }

    // Step 5: Test public missions list
    await testPublicMissionsList();

    // Step 6: Test backfill endpoint
    await testBackfillEndpoint();

    console.log('\n' + '='.repeat(60));
    console.log('🏁 COMPREHENSIVE DEBUGGING COMPLETED');
    console.log('='.repeat(60));
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Review all the logged data above');
    console.log('2. Identify patterns in the issues');
    console.log('3. Check if the backfill fixed any issues');
    console.log('4. Re-run specific tests if needed');
    console.log('5. Update the configuration with correct URLs and tokens');
}

// Run the debugging procedure
if (require.main === module) {
    runComprehensiveDebug().catch(console.error);
}

module.exports = {
    runComprehensiveDebug,
    testSystemConfig,
    testRawMissionData,
    testPublicAPI,
    testAdminAPI,
    testBackfillEndpoint,
    testPublicMissionsList
};


