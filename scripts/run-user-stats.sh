#!/bin/bash

echo "🔐 Setting up Firebase authentication..."

# Set the service account key path (you'll need to download this from Firebase Console)
export GOOGLE_APPLICATION_CREDENTIALS=""

# Alternative: use Firebase CLI authentication
echo "📝 Note: You need to either:"
echo "   1. Set GOOGLE_APPLICATION_CREDENTIALS to a service account key file, or"
echo "   2. Run 'firebase login' first, then run this script"

echo ""
echo "🚀 Running user stats creation script..."

# Check if Firebase CLI is authenticated
if firebase projects:list > /dev/null 2>&1; then
    echo "✅ Firebase CLI is authenticated"
    node scripts/create-user-stats-simple.js
else
    echo "❌ Firebase CLI not authenticated. Please run:"
    echo "   firebase login"
    echo "   Then run this script again"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo "✅ User stats creation completed successfully"
else
    echo "❌ User stats creation failed"
    exit 1
fi
