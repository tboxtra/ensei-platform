#!/usr/bin/env node

// Ensei Platform Integration Test Script
// This script tests the complete integration between frontend and Firebase backend

const https = require('https');
const http = require('http');

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

// Configuration
const config = {
  // Replace with your actual Firebase project ID
  projectId: process.env.FIREBASE_PROJECT_ID || 'your-firebase-project-id',
  apiBaseUrl: process.env.API_BASE_URL || `https://us-central1-${process.env.FIREBASE_PROJECT_ID || 'your-firebase-project-id'}.cloudfunctions.net/api`,
  webAppUrl: process.env.WEB_APP_URL || `https://${process.env.FIREBASE_PROJECT_ID || 'your-firebase-project-id'}.web.app`,
  adminUrl: process.env.ADMIN_URL || `https://${process.env.FIREBASE_PROJECT_ID || 'your-firebase-project-id'}.web.app/admin`
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  tests: []
};

// Utility functions
function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, status, details = '') {
  results.total++;
  if (status === 'PASS') {
    results.passed++;
    log(`✅ ${testName}`, 'green');
  } else {
    results.failed++;
    log(`❌ ${testName}`, 'red');
  }
  if (details) {
    log(`   ${details}`, 'yellow');
  }
  results.tests.push({ name: testName, status, details });
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 10000
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  try {
    const response = await makeRequest(`${config.apiBaseUrl}/health`);
    if (response.status === 200 && response.data.status === 'ok') {
      logTest('Health Check', 'PASS', `Status: ${response.data.status}`);
      return true;
    } else {
      logTest('Health Check', 'FAIL', `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logTest('Health Check', 'FAIL', error.message);
    return false;
  }
}

async function testAuthentication() {
  try {
    // Test login
    const loginResponse = await makeRequest(`${config.apiBaseUrl}/api/v1/auth/login`, {
      method: 'POST',
      body: {
        email: 'admin@ensei.com',
        password: 'admin123'
      }
    });

    if (loginResponse.status === 200 && loginResponse.data.accessToken) {
      logTest('Authentication Login', 'PASS', 'Admin login successful');
      
      // Test protected endpoint
      const meResponse = await makeRequest(`${config.apiBaseUrl}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.accessToken}`
        }
      });

      if (meResponse.status === 200 && meResponse.data.email) {
        logTest('Authentication Me', 'PASS', `User: ${meResponse.data.email}`);
        return loginResponse.data.accessToken;
      } else {
        logTest('Authentication Me', 'FAIL', `Status: ${meResponse.status}`);
        return null;
      }
    } else {
      logTest('Authentication Login', 'FAIL', `Status: ${loginResponse.status}`);
      return null;
    }
  } catch (error) {
    logTest('Authentication', 'FAIL', error.message);
    return null;
  }
}

async function testMissionAPIs(token) {
  try {
    // Test mission creation
    const createResponse = await makeRequest(`${config.apiBaseUrl}/api/v1/missions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        platform: 'twitter',
        type: 'engage',
        model: 'fixed',
        tasks: ['like', 'retweet'],
        cap: 100,
        isPremium: false,
        tweetLink: 'https://twitter.com/user/status/123',
        instructions: 'Like and retweet this tweet'
      }
    });

    if (createResponse.status === 201 || createResponse.status === 200) {
      logTest('Mission Creation', 'PASS', 'Mission created successfully');
      
      // Test mission listing
      const listResponse = await makeRequest(`${config.apiBaseUrl}/api/v1/missions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (listResponse.status === 200) {
        logTest('Mission Listing', 'PASS', `Found ${Array.isArray(listResponse.data) ? listResponse.data.length : 0} missions`);
        return true;
      } else {
        logTest('Mission Listing', 'FAIL', `Status: ${listResponse.status}`);
        return false;
      }
    } else {
      logTest('Mission Creation', 'FAIL', `Status: ${createResponse.status}`);
      return false;
    }
  } catch (error) {
    logTest('Mission APIs', 'FAIL', error.message);
    return false;
  }
}

async function testAdminAPIs(token) {
  try {
    // Test admin submissions
    const submissionsResponse = await makeRequest(`${config.apiBaseUrl}/api/v1/admin/submissions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (submissionsResponse.status === 200) {
      logTest('Admin Submissions', 'PASS', 'Admin submissions accessible');
      
      // Test admin missions
      const missionsResponse = await makeRequest(`${config.apiBaseUrl}/api/v1/admin/missions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (missionsResponse.status === 200) {
        logTest('Admin Missions', 'PASS', 'Admin missions accessible');
        return true;
      } else {
        logTest('Admin Missions', 'FAIL', `Status: ${missionsResponse.status}`);
        return false;
      }
    } else {
      logTest('Admin Submissions', 'FAIL', `Status: ${submissionsResponse.status}`);
      return false;
    }
  } catch (error) {
    logTest('Admin APIs', 'FAIL', error.message);
    return false;
  }
}

async function testMetaAPIs() {
  try {
    // Test task catalog
    const taskCatalogResponse = await makeRequest(`${config.apiBaseUrl}/api/v1/meta/task-catalog`);
    
    if (taskCatalogResponse.status === 200 && taskCatalogResponse.data) {
      logTest('Task Catalog', 'PASS', 'Task catalog accessible');
      
      // Test degen presets
      const presetsResponse = await makeRequest(`${config.apiBaseUrl}/api/v1/presets`);
      
      if (presetsResponse.status === 200 && Array.isArray(presetsResponse.data)) {
        logTest('Degen Presets', 'PASS', `Found ${presetsResponse.data.length} presets`);
        return true;
      } else {
        logTest('Degen Presets', 'FAIL', `Status: ${presetsResponse.status}`);
        return false;
      }
    } else {
      logTest('Task Catalog', 'FAIL', `Status: ${taskCatalogResponse.status}`);
      return false;
    }
  } catch (error) {
    logTest('Meta APIs', 'FAIL', error.message);
    return false;
  }
}

async function testFrontendAccess() {
  try {
    // Test web app
    const webResponse = await makeRequest(config.webAppUrl);
    if (webResponse.status === 200) {
      logTest('Web App Access', 'PASS', 'Web app is accessible');
    } else {
      logTest('Web App Access', 'FAIL', `Status: ${webResponse.status}`);
    }

    // Test admin dashboard
    const adminResponse = await makeRequest(config.adminUrl);
    if (adminResponse.status === 200) {
      logTest('Admin Dashboard Access', 'PASS', 'Admin dashboard is accessible');
    } else {
      logTest('Admin Dashboard Access', 'FAIL', `Status: ${adminResponse.status}`);
    }

    return true;
  } catch (error) {
    logTest('Frontend Access', 'FAIL', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  log(`${colors.bold}${colors.cyan}🧪 Ensei Platform Integration Tests${colors.reset}`);
  log(`${colors.blue}===========================================${colors.reset}`);
  log(`API Base URL: ${config.apiBaseUrl}`);
  log(`Web App URL: ${config.webAppUrl}`);
  log(`Admin URL: ${config.adminUrl}`);
  log('');

  // Run tests
  await testHealthCheck();
  await testMetaAPIs();
  await testFrontendAccess();
  
  const token = await testAuthentication();
  if (token) {
    await testMissionAPIs(token);
    await testAdminAPIs(token);
  }

  // Print results
  log('');
  log(`${colors.bold}${colors.blue}📊 Test Results${colors.reset}`);
  log(`${colors.blue}===============${colors.reset}`);
  log(`Total Tests: ${results.total}`);
  log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`);
  
  if (results.failed > 0) {
    log('');
    log(`${colors.red}❌ Failed Tests:${colors.reset}`);
    results.tests
      .filter(test => test.status === 'FAIL')
      .forEach(test => {
        log(`  • ${test.name}: ${test.details}`, 'red');
      });
  }

  log('');
  if (results.failed === 0) {
    log(`${colors.green}🎉 All tests passed! Your Ensei Platform is fully integrated and working!${colors.reset}`);
  } else {
    log(`${colors.yellow}⚠️  Some tests failed. Please check the configuration and try again.${colors.reset}`);
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    log(`❌ Test runner error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, config };
