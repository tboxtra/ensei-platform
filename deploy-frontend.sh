#!/bin/bash

# Ensei Platform Frontend Deployment Script
# This script builds and deploys your frontend to Firebase Hosting

set -e

echo "🌐 Ensei Platform Frontend Deployment"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Firebase project ID is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Please provide your Firebase project ID:${NC}"
    echo "Usage: ./deploy-frontend.sh YOUR_FIREBASE_PROJECT_ID"
    echo "Example: ./deploy-frontend.sh ensei-platform-12345"
    exit 1
fi

FIREBASE_PROJECT_ID=$1
API_BASE_URL="https://us-central1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/api"

echo -e "${BLUE}🔍 Using Firebase Project ID: ${FIREBASE_PROJECT_ID}${NC}"
echo -e "${BLUE}🔗 API Base URL: ${API_BASE_URL}${NC}"

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed. Please install it first:${NC}"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Firebase. Please run: firebase login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Create environment files
echo -e "${BLUE}⚙️  Creating environment files...${NC}"

# Web app environment
cat > apps/web/.env.local << EOF
# Ensei Platform - Web App Environment Variables
NEXT_PUBLIC_API_URL=${API_BASE_URL}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
NEXT_PUBLIC_FIREBASE_REGION=us-central1
NEXT_PUBLIC_API_BASE_URL=${API_BASE_URL}
NEXT_PUBLIC_WS_URL=wss://us-central1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/ws
NODE_ENV=production
EOF

# Admin dashboard environment
cat > apps/admin-dashboard/.env.local << EOF
# Ensei Platform - Admin Dashboard Environment Variables
NEXT_PUBLIC_API_URL=${API_BASE_URL}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
NEXT_PUBLIC_FIREBASE_REGION=us-central1
NODE_ENV=production
EOF

echo -e "${GREEN}✅ Environment files created${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
yarn install --frozen-lockfile

# Build web app
echo -e "${BLUE}🔨 Building web app...${NC}"
cd apps/web
yarn build
cd ../..

# Build admin dashboard
echo -e "${BLUE}🔨 Building admin dashboard...${NC}"
cd apps/admin-dashboard
yarn build
cd ../..

# Update Firebase configuration
echo -e "${BLUE}⚙️  Updating Firebase configuration...${NC}"

# Create a temporary firebase.json for frontend deployment
cat > firebase-frontend.json << EOF
{
  "hosting": {
    "public": "apps/web/out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "/admin/**",
        "destination": "/admin/index.html"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
EOF

# Deploy to Firebase
echo -e "${BLUE}🚀 Deploying to Firebase Hosting...${NC}"

# Use the temporary config for hosting deployment
firebase deploy --only hosting --config firebase-frontend.json --project ${FIREBASE_PROJECT_ID}

# Clean up temporary config
rm firebase-frontend.json

# Get deployment URLs
echo ""
echo -e "${GREEN}🎉 Frontend deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Your Frontend URLs:${NC}"
echo "Web App: https://${FIREBASE_PROJECT_ID}.web.app"
echo "Admin Dashboard: https://${FIREBASE_PROJECT_ID}.web.app/admin"
echo "API Base URL: ${API_BASE_URL}"
echo ""

# Test deployment
echo -e "${BLUE}🧪 Testing deployment...${NC}"

# Test web app
if curl -s -f "https://${FIREBASE_PROJECT_ID}.web.app" > /dev/null; then
    echo -e "${GREEN}✅ Web app is accessible${NC}"
else
    echo -e "${RED}❌ Web app not accessible${NC}"
fi

# Test API connection
if curl -s -f "${API_BASE_URL}/health" > /dev/null; then
    echo -e "${GREEN}✅ API is accessible${NC}"
else
    echo -e "${RED}❌ API not accessible${NC}"
fi

echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Visit your web app: https://${FIREBASE_PROJECT_ID}.web.app"
echo "2. Test the admin dashboard: https://${FIREBASE_PROJECT_ID}.web.app/admin"
echo "3. Test user registration and login"
echo "4. Create a test mission"
echo "5. Submit a test submission"
echo "6. Review submissions in admin dashboard"
echo ""

echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo "View hosting: firebase hosting:releases --project ${FIREBASE_PROJECT_ID}"
echo "View logs: firebase functions:log --project ${FIREBASE_PROJECT_ID}"
echo "Open console: firebase open --project ${FIREBASE_PROJECT_ID}"
echo ""

echo -e "${GREEN}🚀 Your Ensei Platform frontend is now live!${NC}"
echo -e "${YELLOW}🌐 Web App: https://${FIREBASE_PROJECT_ID}.web.app${NC}"
echo -e "${YELLOW}🔧 Admin Dashboard: https://${FIREBASE_PROJECT_ID}.web.app/admin${NC}"
