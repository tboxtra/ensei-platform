#!/bin/bash

# Deploy Cloud Functions Script
# This script deploys the new user stats Cloud Functions

echo "🚀 Deploying Cloud Functions..."

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

# Deploy only the new functions
echo "📦 Deploying new user stats functions..."

firebase deploy --only functions:onVerificationWrite,functions:onDegenWinnersChosen,functions:onMissionCreate --project ensei-6c8e0

if [ $? -eq 0 ]; then
    echo "✅ Cloud Functions deployed successfully!"
    echo ""
    echo "🔧 Deployed functions:"
    echo "   - onVerificationWrite: Updates user stats on verification"
    echo "   - onDegenWinnersChosen: Pays honors to degen winners"
    echo "   - onMissionCreate: Increments missions created counter"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Run backfill script: node scripts/backfill-user-stats.js --execute"
    echo "   2. Test QuickStats in the UI"
    echo "   3. Check admin audit page for data accuracy"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi


