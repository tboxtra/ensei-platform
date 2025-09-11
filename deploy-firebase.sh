#!/bin/bash

# Ensei Platform Firebase Deployment Script
# This script deploys your backend to Firebase Functions

set -e

echo "🔥 Ensei Platform Firebase Deployment"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if .firebaserc exists
if [ ! -f ".firebaserc" ]; then
    echo -e "${YELLOW}⚠️  .firebaserc not found. Please configure your Firebase project:${NC}"
    echo "1. Run: firebase init"
    echo "2. Select your Firebase project"
    echo "3. Or update .firebaserc with your project ID"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
cd functions
npm install
cd ..

# Build functions
echo -e "${BLUE}🔨 Building functions...${NC}"
cd functions
npm run build
cd ..

# Set environment variables (if not already set)
echo -e "${BLUE}⚙️  Setting environment variables...${NC}"

# Check if environment variables are set
if ! firebase functions:config:get &> /dev/null; then
    echo -e "${YELLOW}⚠️  Setting default environment variables...${NC}"
    
    # Generate secure secrets
    JWT_SECRET=$(openssl rand -base64 64)
    JWT_REFRESH_SECRET=$(openssl rand -base64 64)
    ADMIN_PASSWORD=$(openssl rand -base64 32)
    
    firebase functions:config:set \
        jwt.secret="$JWT_SECRET" \
        jwt.refresh_secret="$JWT_REFRESH_SECRET" \
        admin.email="admin@ensei.com" \
        admin.password="$ADMIN_PASSWORD"
    
    echo -e "${GREEN}✅ Environment variables set${NC}"
    echo -e "${YELLOW}📝 Admin credentials:${NC}"
    echo "Email: admin@ensei.com"
    echo "Password: $ADMIN_PASSWORD"
    echo ""
    echo -e "${YELLOW}⚠️  Save these credentials securely!${NC}"
else
    echo -e "${GREEN}✅ Environment variables already configured${NC}"
fi

# Deploy Firestore rules
echo -e "${BLUE}🗄️  Deploying Firestore rules...${NC}"
firebase deploy --only firestore:rules

# Deploy Firestore indexes
echo -e "${BLUE}📊 Deploying Firestore indexes...${NC}"
firebase deploy --only firestore:indexes

# Deploy Functions
echo -e "${BLUE}🚀 Deploying Firebase Functions...${NC}"
firebase deploy --only functions

# Deploy Hosting (if configured)
if [ -f "public/index.html" ]; then
    echo -e "${BLUE}🌐 Deploying Firebase Hosting...${NC}"
    firebase deploy --only hosting
fi

# Get project info
PROJECT_ID=$(firebase use --project | grep -o '\[.*\]' | tr -d '[]')
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Your Firebase URLs:${NC}"
echo "Project ID: $PROJECT_ID"
echo "API Base URL: https://us-central1-$PROJECT_ID.cloudfunctions.net/api"
echo "Health Check: https://us-central1-$PROJECT_ID.cloudfunctions.net/api/health"
echo "Auth API: https://us-central1-$PROJECT_ID.cloudfunctions.net/api/api/v1/auth"
echo "Mission API: https://us-central1-$PROJECT_ID.cloudfunctions.net/api/api/v1/missions"
echo "Admin API: https://us-central1-$PROJECT_ID.cloudfunctions.net/api/api/v1/admin"
echo ""

if [ -f "public/index.html" ]; then
    echo "Frontend: https://$PROJECT_ID.web.app"
    echo "Admin Dashboard: https://$PROJECT_ID.web.app/admin"
    echo ""
fi

# Test deployment
echo -e "${BLUE}🧪 Testing deployment...${NC}"
API_URL="https://us-central1-$PROJECT_ID.cloudfunctions.net/api"

# Test health check
if curl -s -f "$API_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
fi

# Test auth endpoint
if curl -s -f "$API_URL/api/v1/auth/login" > /dev/null; then
    echo -e "${GREEN}✅ Auth endpoint accessible${NC}"
else
    echo -e "${RED}❌ Auth endpoint not accessible${NC}"
fi

echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Test your API endpoints"
echo "2. Configure your frontend to use the Firebase URLs"
echo "3. Set up monitoring and alerts"
echo "4. Configure custom domain (optional)"
echo "5. Set up CI/CD pipeline"
echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo "View logs: firebase functions:log"
echo "Deploy updates: firebase deploy --only functions"
echo "Delete function: firebase functions:delete api"
echo "View project: firebase open"
echo ""

echo -e "${GREEN}🚀 Your Ensei Platform is now live on Firebase!${NC}"
