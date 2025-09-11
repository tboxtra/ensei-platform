#!/bin/bash

# Ensei Platform Backend Startup Script
echo "🚀 Starting Ensei Platform Backend Services..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Start API Gateway
echo "🌐 Starting API Gateway (Port 3002)..."
cd services/api-gateway
npm run dev &
API_GATEWAY_PID=$!

# Wait a moment for API Gateway to start
sleep 3

# Start Mission Engine
echo "⚙️ Starting Mission Engine (Port 3003)..."
cd ../mission-engine
npm run dev &
MISSION_ENGINE_PID=$!

# Wait for services to start
sleep 5

# Check if services are running
echo "🔍 Checking service health..."

# Check API Gateway
if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ API Gateway is running on http://localhost:3002"
else
    echo "❌ API Gateway failed to start"
fi

# Check Mission Engine
if curl -s http://localhost:3003/health > /dev/null; then
    echo "✅ Mission Engine is running on http://localhost:3003"
else
    echo "❌ Mission Engine failed to start"
fi

echo ""
echo "🎉 Backend services are now running!"
echo ""
echo "📊 Service URLs:"
echo "   API Gateway: http://localhost:3002"
echo "   Mission Engine: http://localhost:3003"
echo "   WebSocket: ws://localhost:3002/ws"
echo "   Admin API: http://localhost:3002/v1/admin/*"
echo ""
echo "🔧 Test endpoints:"
echo "   Health Check: curl http://localhost:3002/health"
echo "   WebSocket Stats: curl http://localhost:3002/ws/stats"
echo "   Task Catalog: curl http://localhost:3003/task-catalog"
echo ""
echo "🛑 To stop services, press Ctrl+C or run: pkill -f 'tsx src/index.ts' && pkill -f 'tsx src/server.ts'"
echo ""

# Keep script running
wait
