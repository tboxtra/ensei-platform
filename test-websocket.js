const WebSocket = require('ws');

// Test WebSocket connection
function testWebSocket() {
    console.log('🚀 Testing Ensei WebSocket Connection...\n');
    
    const ws = new WebSocket('ws://127.0.0.1:3002/ws?userId=test-user-123&role=admin');
    
    ws.on('open', function() {
        console.log('✅ Connected to WebSocket server');
        
        // Send ping
        console.log('📤 Sending ping...');
        ws.send(JSON.stringify({
            type: 'ping',
            payload: { timestamp: new Date().toISOString() }
        }));
        
        // Subscribe to notifications
        console.log('📤 Subscribing to notifications...');
        ws.send(JSON.stringify({
            type: 'subscribe',
            payload: { eventType: 'notification' }
        }));
        
        // Test message after 2 seconds
        setTimeout(() => {
            console.log('📤 Sending test message...');
            ws.send(JSON.stringify({
                type: 'test',
                payload: { message: 'Hello from test client!' }
            }));
        }, 2000);
        
        // Close after 5 seconds
        setTimeout(() => {
            console.log('📤 Closing connection...');
            ws.close();
        }, 5000);
    });
    
    ws.on('message', function(data) {
        try {
            const message = JSON.parse(data);
            console.log('📥 Received message:', {
                type: message.type,
                data: message.data,
                timestamp: message.timestamp
            });
        } catch (error) {
            console.log('📥 Received raw data:', data.toString());
        }
    });
    
    ws.on('close', function() {
        console.log('❌ Connection closed');
        process.exit(0);
    });
    
    ws.on('error', function(error) {
        console.error('❌ WebSocket error:', error.message);
        process.exit(1);
    });
}

// Test WebSocket stats endpoint
async function testStats() {
    console.log('📊 Testing WebSocket stats endpoint...');
    
    try {
        const http = require('http');
        const options = {
            hostname: '127.0.0.1',
            port: 3002,
            path: '/ws/stats',
            method: 'GET'
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const stats = JSON.parse(data);
                    console.log('📊 WebSocket stats:', stats);
                } catch (error) {
                    console.log('📊 Raw response:', data);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Stats endpoint error:', error.message);
        });
        
        req.end();
    } catch (error) {
        console.error('❌ Stats endpoint error:', error.message);
    }
}

// Run tests
async function runTests() {
    await testStats();
    console.log('\n' + '='.repeat(50) + '\n');
    testWebSocket();
}

runTests();
