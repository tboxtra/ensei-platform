#!/usr/bin/env node

/**
 * Test Admin Dashboard API Endpoints
 */

const https = require('https');

const config = {
    apiBaseUrl: 'https://us-central1-ensei-6c8e0.cloudfunctions.net/api'
};

function testEndpoint(endpoint) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, config.apiBaseUrl);

        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: parsed,
                        success: res.statusCode >= 200 && res.statusCode < 300
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData,
                        success: res.statusCode >= 200 && res.statusCode < 300
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function testAdminDashboard() {
    console.log('🧪 Testing Admin Dashboard API Endpoints\n');

    const endpoints = [
        '/health',
        '/v1/admin/missions',
        '/v1/admin/analytics/overview',
        '/v1/admin/system-config'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`Testing ${endpoint}...`);
            const result = await testEndpoint(endpoint);

            if (result.success) {
                console.log(`✅ ${endpoint}: OK`);

                if (endpoint === '/v1/admin/missions') {
                    console.log(`   Found ${Array.isArray(result.data) ? result.data.length : 0} missions`);
                } else if (endpoint === '/v1/admin/analytics/overview') {
                    console.log(`   Total Missions: ${result.data.totalMissions || 0}`);
                    console.log(`   Total Users: ${result.data.totalUsers || 0}`);
                }
            } else {
                console.log(`❌ ${endpoint}: Failed (${result.status})`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint}: Error - ${error.message}`);
        }
        console.log('');
    }

    console.log('🎯 Admin Dashboard API Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Visit: https://ensei-6c8e0.web.app/admin');
    console.log('2. Login with: admin@ensei.com / admin123');
    console.log('3. Check missions page for data display');
}

testAdminDashboard().catch(console.error);


