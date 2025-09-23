#!/bin/bash

# Run User Stats Creation Script with Firebase Authentication
# This script runs the user stats creation with proper Firebase authentication

echo "🚀 Creating User Stats Documents..."

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "   firebase login"
    echo "   Then run this script again."
    exit 1
fi

# Set the project
firebase use ensei-6c8e0

# Run the user stats creation script
echo "📊 Running user stats creation script..."
node scripts/create-user-stats.js

if [ $? -eq 0 ]; then
    echo "✅ User stats creation completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Test QuickStats in the UI"
    echo "   2. Verify real-time updates work"
    echo "   3. Check that stats show real numbers"
else
    echo "❌ User stats creation failed. Check the error messages above."
    exit 1
fi
