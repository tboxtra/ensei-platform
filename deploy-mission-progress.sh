#!/bin/bash

# Mission Progress System Deployment Script
# This script helps deploy the mission progress summary system

echo "🚀 Mission Progress System Deployment"
echo "======================================"

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not authenticated. Please run:"
    echo "   firebase login"
    echo "   firebase use ensei-6c8e0"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Authenticated with Firebase"

# Set project
echo "🎯 Setting project to ensei-6c8e0..."
firebase use ensei-6c8e0

# Install dependencies
echo "📦 Installing function dependencies..."
cd functions && npm install && cd ..

# Deploy
echo "🚀 Deploying mission progress system..."
echo "   - Cloud Function: syncMissionProgress"
echo "   - Firestore Rules"
echo "   - Composite Indexes"
echo ""

firebase deploy --only functions:syncMissionProgress,firestore:rules,firestore:indexes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 Post-deploy checks:"
echo "1. Check function logs: firebase functions:log --only syncMissionProgress --limit 50"
echo "2. Verify indexes in Firebase Console → Firestore → Indexes"
echo "3. Test by completing a task and watching logs"
echo ""
echo "📊 The mission progress summary system is now live!"

