# 🚀 Ensei Platform - Complete Deployment Guide

## 📋 **Overview**

This guide will walk you through deploying your Ensei Platform backend to Firebase and connecting it to your frontend applications. By the end of this guide, you'll have a fully functional, production-ready platform running on Firebase.

## 🎯 **What You'll Deploy**

- **Backend**: Firebase Functions (API Gateway, Authentication, Mission Engine, Admin APIs)
- **Database**: Firestore (Users, Missions, Submissions, Analytics)
- **Frontend**: Firebase Hosting (Web App + Admin Dashboard)
- **Real-time**: WebSocket support and live updates
- **Security**: JWT authentication, Firestore rules, CORS configuration

## 📋 **Prerequisites**

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Git installed and configured
- [ ] A Google account
- [ ] Your Ensei Platform code (already in your repository)
- [ ] Terminal/Command line access

## 🔥 **Part 1: Firebase Backend Deployment**

### **Step 1.1: Install Firebase CLI**

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

### **Step 1.2: Login to Firebase**

```bash
# Login to your Google account
firebase login

# Verify login
firebase projects:list
```

### **Step 1.3: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `ensei-platform` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"
6. Wait for project creation to complete

### **Step 1.4: Initialize Firebase in Your Project**

```bash
# Navigate to your project directory
cd /path/to/your/ensei-platform

# Initialize Firebase
firebase init

# Select the following features:
# ✅ Functions: Configure a Cloud Functions directory
# ✅ Firestore: Configure security rules and indexes files
# ✅ Hosting: Configure files for Firebase Hosting

# Choose your Firebase project from the list
# Select TypeScript for Functions
# Use ESLint: Yes
# Install dependencies: Yes
```

### **Step 1.5: Configure Firebase Project**

```bash
# Set your Firebase project as default
firebase use your-firebase-project-id

# Or update .firebaserc manually
echo '{"projects":{"default":"your-firebase-project-id"}}' > .firebaserc
```

### **Step 1.6: Install Dependencies**

```bash
# Install Firebase Functions dependencies
cd functions
npm install

# Install additional dependencies
npm install express cors helmet express-rate-limit jsonwebtoken bcryptjs ws uuid
npm install --save-dev @types/express @types/cors @types/jsonwebtoken @types/bcryptjs @types/ws @types/uuid

# Return to project root
cd ..
```

### **Step 1.7: Set Environment Variables**

```bash
# Set Firebase Functions environment variables
firebase functions:config:set \
  jwt.secret="$(openssl rand -base64 64)" \
  jwt.refresh_secret="$(openssl rand -base64 64)" \
  admin.email="admin@ensei.com" \
  admin.password="$(openssl rand -base64 32)"

# Note down the admin password for later use
echo "Admin credentials:"
echo "Email: admin@ensei.com"
echo "Password: [generated above]"
```

### **Step 1.8: Deploy Backend**

```bash
# Deploy all Firebase services
firebase deploy

# Or deploy only functions
firebase deploy --only functions

# Or deploy only Firestore rules
firebase deploy --only firestore:rules
```

### **Step 1.9: Test Backend Deployment**

```bash
# Get your API URL (replace YOUR_PROJECT_ID)
API_URL="https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api"

# Test health check
curl $API_URL/health

# Test authentication
curl -X POST $API_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ensei.com","password":"YOUR_ADMIN_PASSWORD"}'
```

## 🌐 **Part 2: Frontend Deployment**

### **Step 2.1: Prepare Frontend Environment**

```bash
# Create environment file for web app
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_API_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_REGION=us-central1
NEXT_PUBLIC_API_BASE_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api
NEXT_PUBLIC_WS_URL=wss://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ws
NODE_ENV=production
EOF

# Create environment file for admin dashboard
cat > apps/admin-dashboard/.env.local << EOF
NEXT_PUBLIC_API_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_REGION=us-central1
NODE_ENV=production
EOF
```

### **Step 2.2: Build Frontend Applications**

```bash
# Install all dependencies
yarn install --frozen-lockfile

# Build web app
cd apps/web
yarn build
cd ../..

# Build admin dashboard
cd apps/admin-dashboard
yarn build
cd ../..
```

### **Step 2.3: Configure Firebase Hosting**

```bash
# Update firebase.json for frontend hosting
cat > firebase.json << EOF
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
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
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
EOF
```

### **Step 2.4: Deploy Frontend**

```bash
# Deploy everything
firebase deploy

# Or deploy only hosting
firebase deploy --only hosting
```

### **Step 2.5: Test Frontend Deployment**

```bash
# Your frontend URLs (replace YOUR_PROJECT_ID)
WEB_APP_URL="https://YOUR_PROJECT_ID.web.app"
ADMIN_URL="https://YOUR_PROJECT_ID.web.app/admin"

# Test web app
curl $WEB_APP_URL

# Test admin dashboard
curl $ADMIN_URL
```

## 🔗 **Part 3: Complete Integration Testing**

### **Step 3.1: Run Integration Tests**

```bash
# Set your project ID
export FIREBASE_PROJECT_ID="your-firebase-project-id"

# Run comprehensive integration tests
node test-integration.js
```

### **Step 3.2: Manual Testing Checklist**

- [ ] **Web App Access**: Visit your web app URL
- [ ] **User Registration**: Create a new user account
- [ ] **User Login**: Login with created account
- [ ] **Mission Creation**: Create a test mission
- [ ] **Mission Participation**: Participate in a mission
- [ ] **Admin Dashboard**: Access admin dashboard
- [ ] **Admin Login**: Login with admin credentials
- [ ] **Submission Review**: Review submissions in admin
- [ ] **Real-time Updates**: Check for live updates

### **Step 3.3: API Endpoint Testing**

```bash
# Test all major endpoints
API_BASE="https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api"

# Health check
curl $API_BASE/health

# Authentication
curl -X POST $API_BASE/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ensei.com","password":"YOUR_PASSWORD"}'

# Missions
curl $API_BASE/api/v1/missions

# Admin submissions
curl -H "Authorization: Bearer YOUR_TOKEN" \
  $API_BASE/api/v1/admin/submissions
```

## 🎯 **Part 4: Production Configuration**

### **Step 4.1: Set Up Custom Domain (Optional)**

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning

### **Step 4.2: Configure Monitoring**

```bash
# Install monitoring dependencies
cd functions
npm install @google-cloud/monitoring

# Set up error reporting
npm install @google-cloud/error-reporting
```

### **Step 4.3: Set Up CI/CD Pipeline**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main, alexis ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'yarn'
    
    - name: Install dependencies
      run: yarn install --frozen-lockfile
    
    - name: Build web app
      run: |
        cd apps/web
        yarn build
    
    - name: Build admin dashboard
      run: |
        cd apps/admin-dashboard
        yarn build
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        channelId: live
        projectId: your-firebase-project-id
```

## 📊 **Part 5: Your Live Platform URLs**

After successful deployment, your platform will be available at:

### **Frontend Applications**
- **Web App**: `https://YOUR_PROJECT_ID.web.app`
- **Admin Dashboard**: `https://YOUR_PROJECT_ID.web.app/admin`

### **Backend APIs**
- **Main API**: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api`
- **Health Check**: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/health`
- **Auth API**: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/api/v1/auth`
- **Mission API**: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/api/v1/missions`
- **Admin API**: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/api/v1/admin`

## 🔧 **Part 6: Management Commands**

### **Deploy Updates**
```bash
# Deploy all changes
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy specific function
firebase deploy --only functions:api
```

### **Monitor & Debug**
```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only api

# View hosting releases
firebase hosting:releases

# Open Firebase Console
firebase open
```

### **Environment Management**
```bash
# View current config
firebase functions:config:get

# Set new config
firebase functions:config:set key.value="new_value"

# Delete config
firebase functions:config:unset key.value
```

## 🔒 **Part 7: Security Checklist**

### **Firebase Security**
- [ ] Firestore security rules deployed
- [ ] Authentication enabled
- [ ] CORS configured correctly
- [ ] Environment variables secured
- [ ] Admin credentials changed from default

### **Application Security**
- [ ] JWT secrets are strong and unique
- [ ] Password hashing implemented
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured
- [ ] Error handling implemented

## 📈 **Part 8: Performance Optimization**

### **Firebase Optimization**
- [ ] Functions optimized for cold starts
- [ ] Firestore indexes created
- [ ] CDN enabled for static assets
- [ ] Caching strategies implemented

### **Application Optimization**
- [ ] Frontend bundle optimized
- [ ] Images compressed
- [ ] Lazy loading implemented
- [ ] Real-time updates optimized

## 🚨 **Part 9: Troubleshooting**

### **Common Issues & Solutions**

**Firebase CLI not found:**
```bash
npm install -g firebase-tools
```

**Permission denied:**
```bash
firebase login --reauth
```

**Functions deployment failed:**
```bash
cd functions && npm install
firebase deploy --only functions
```

**Hosting deployment failed:**
```bash
cd apps/web && yarn build
firebase deploy --only hosting
```

**CORS errors:**
```bash
# Check CORS configuration in functions/src/index.ts
# Ensure your frontend URLs are in the origin list
```

**Authentication failures:**
```bash
# Check JWT secrets
firebase functions:config:get

# Verify admin credentials
curl -X POST $API_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ensei.com","password":"YOUR_PASSWORD"}'
```

## 🎉 **Part 10: Success!**

### **Your Ensei Platform is Now Live!**

Congratulations! You've successfully deployed your Ensei Platform to Firebase. Your platform now includes:

- ✅ **Complete Backend**: Serverless Firebase Functions
- ✅ **Database**: Firestore with security rules
- ✅ **Frontend**: Web app and admin dashboard
- ✅ **Authentication**: JWT-based user management
- ✅ **Real-time**: Live updates and notifications
- ✅ **Security**: Role-based access control
- ✅ **Scaling**: Automatic scaling and performance
- ✅ **Monitoring**: Built-in analytics and logging

### **Next Steps**

1. **Test Everything**: Verify all features work correctly
2. **Customize**: Add your branding and content
3. **Monitor**: Set up alerts and monitoring
4. **Scale**: Optimize for your user base
5. **Iterate**: Add new features based on feedback

### **Support Resources**

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Support](https://firebase.google.com/support)
- [GitHub Repository](https://github.com/tboxtra/ensei-platform)

---

**Your Ensei Platform is ready to serve users worldwide!** 🌍🚀

## 📝 **Quick Reference**

### **Essential Commands**
```bash
# Deploy everything
firebase deploy

# Test integration
node test-integration.js

# View logs
firebase functions:log

# Open console
firebase open
```

### **Important URLs**
- **Firebase Console**: https://console.firebase.google.com
- **Your Web App**: https://YOUR_PROJECT_ID.web.app
- **Your Admin**: https://YOUR_PROJECT_ID.web.app/admin
- **API Health**: https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/health

---

**Happy coding!** 🎉✨
