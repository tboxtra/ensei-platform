// Simple test to check what the API is actually returning
const https = require('https');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          resolve({ error: 'Invalid JSON', raw: data });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testAPI() {
  try {
    console.log('🔍 Testing API endpoints...\n');
    
    // Test the debug endpoint if it exists
    try {
      const debugResponse = await makeRequest('https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/debug/mission/vb4ycovDru4j1Plq93GS');
      console.log('📊 DEBUG ENDPOINT RESPONSE:');
      console.log(JSON.stringify(debugResponse, null, 2));
      console.log('\n');
    } catch (e) {
      console.log('❌ Debug endpoint not available or failed:', e.message);
    }
    
    // Test system config endpoint
    try {
      const configResponse = await makeRequest('https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/admin/system-config');
      console.log('⚙️ SYSTEM CONFIG RESPONSE:');
      console.log(JSON.stringify(configResponse, null, 2));
      console.log('\n');
    } catch (e) {
      console.log('❌ System config endpoint failed:', e.message);
    }
    
    // Test missions endpoint (this will fail due to auth, but we can see the error)
    try {
      const missionsResponse = await makeRequest('https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/missions');
      console.log('📋 MISSIONS ENDPOINT RESPONSE:');
      console.log(JSON.stringify(missionsResponse, null, 2));
      console.log('\n');
    } catch (e) {
      console.log('❌ Missions endpoint failed:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAPI();
