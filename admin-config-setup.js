#!/usr/bin/env node

/**
 * Ensei Platform Admin Configuration Setup
 * This script helps you configure your admin system
 */

const https = require('https');

// Configuration
const config = {
    projectId: 'ensei-6c8e0',
    apiBaseUrl: 'https://us-central1-ensei-6c8e0.cloudfunctions.net/api',
    webAppUrl: 'https://ensei-6c8e0.web.app'
};

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
    console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}${message}${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

// Test API endpoint
async function testEndpoint(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, config.apiBaseUrl);

        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

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

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Main configuration function
async function configureAdmin() {
    logHeader('🔧 Ensei Platform Admin Configuration Setup');

    log('🎯 Configuration Overview:', 'blue');
    log(`   Project ID: ${config.projectId}`, 'white');
    log(`   API URL: ${config.apiBaseUrl}`, 'white');
    log(`   Web App: ${config.webAppUrl}`, 'white');

    logHeader('📋 Admin Credentials');

    log('✅ Demo Admin Accounts Available:', 'green');
    log('   Super Admin:', 'yellow');
    log('     Email: admin@ensei.com', 'white');
    log('     Password: admin123', 'white');
    log('     Permissions: All (*)', 'white');
    log('');
    log('   Moderator:', 'yellow');
    log('     Email: moderator@ensei.com', 'white');
    log('     Password: mod123', 'white');
    log('     Permissions: review:read, review:write, missions:read, users:read', 'white');

    logHeader('🔍 Testing API Endpoints');

    try {
        // Test health endpoint
        log('Testing health endpoint...', 'blue');
        const healthResult = await testEndpoint('/health');
        if (healthResult.success) {
            log('✅ Health check: OK', 'green');
        } else {
            log('❌ Health check: Failed', 'red');
        }

        // Test missions endpoint
        log('Testing missions endpoint...', 'blue');
        const missionsResult = await testEndpoint('/v1/missions');
        if (missionsResult.success) {
            log('✅ Missions API: OK', 'green');
            log(`   Found ${missionsResult.data.length} missions`, 'white');
        } else {
            log('❌ Missions API: Failed', 'red');
        }

    } catch (error) {
        log(`❌ API Test Error: ${error.message}`, 'red');
    }

    logHeader('⚙️ Admin Dashboard Configuration');

    log('🎛️ Available Admin Features:', 'blue');
    log('   📊 Dashboard Overview', 'white');
    log('   👥 User Management', 'white');
    log('   🎯 Mission Management', 'white');
    log('   📝 Review System', 'white');
    log('   ⚙️ System Settings', 'white');
    log('   📈 Analytics', 'white');
    log('   🔒 Security Settings', 'white');

    logHeader('🚀 Next Steps');

    log('1. Access Admin Dashboard:', 'yellow');
    log(`   ${config.webAppUrl}/admin`, 'white');
    log('');
    log('2. Login with demo credentials:', 'yellow');
    log('   admin@ensei.com / admin123', 'white');
    log('');
    log('3. Configure System Settings:', 'yellow');
    log('   - Go to Settings tab', 'white');
    log('   - Adjust pricing and limits', 'white');
    log('   - Enable/disable features', 'white');
    log('');
    log('4. Create Your First Mission:', 'yellow');
    log('   - Test mission creation flow', 'white');
    log('   - Verify platform integrations', 'white');
    log('');
    log('5. Set Up Real Admin Account:', 'yellow');
    log('   - Use Firebase Console', 'white');
    log('   - Create user with your email', 'white');
    log('   - Update role in Firestore', 'white');

    logHeader('🔧 System Configuration Recommendations');

    log('💰 Pricing Settings:', 'blue');
    log('   Honors per USD: 450 (current)', 'white');
    log('   Premium Multiplier: 5x (current)', 'white');
    log('   Platform Fee: 5-10% recommended', 'white');
    log('');
    log('📊 System Limits:', 'blue');
    log('   Max Missions per User: 10-20', 'white');
    log('   Max Submissions per Mission: 100-500', 'white');
    log('   Review Timeout: 24-48 hours', 'white');
    log('');
    log('🔒 Security Settings:', 'blue');
    log('   Enable 2FA for admin accounts', 'white');
    log('   Set session timeout: 8 hours', 'white');
    log('   Enable API rate limiting', 'white');

    logHeader('✅ Configuration Complete');

    log('Your admin system is ready! 🎉', 'green');
    log('Visit the admin dashboard to start configuring your platform.', 'white');
}

// Run the configuration
configureAdmin().catch(console.error);


