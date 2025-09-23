#!/bin/bash

# Run Backfill Script with Firebase Authentication
# This script runs the backfill with proper Firebase authentication

echo "🚀 Running User Stats Backfill..."

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

# Run the backfill script with Firebase authentication
echo "📊 Running backfill script..."
node scripts/backfill-user-stats.js

if [ $? -eq 0 ]; then
    echo "✅ Backfill completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Test QuickStats in the UI"
    echo "   2. Check admin audit page for data accuracy"
    echo "   3. Monitor system health"
else
    echo "❌ Backfill failed. Check the error messages above."
    exit 1
fi
