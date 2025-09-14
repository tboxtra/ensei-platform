# 🔗 Frontend to Firebase Backend Integration Guide

## 🚀 **Complete Integration Steps**

After deploying your backend to Firebase, follow these steps to connect your frontend applications.

## 📋 **Step 1: Get Your Firebase URLs**

After deploying to Firebase, you'll get these URLs:

```bash
# Your Firebase project URLs (replace YOUR_PROJECT_ID with your actual project ID)
API_BASE_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api
HEALTH_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/health
AUTH_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/api/v1/auth
MISSION_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/api/v1/missions
ADMIN_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/api/v1/admin
FRONTEND_URL=https://YOUR_PROJECT_ID.web.app
```

## 🔧 **Step 2: Update Web App Configuration**

### **2.1 Create Environment File**

Create `apps/web/.env.local`:

```bash
# Ensei Platform - Web App Environment Variables
NEXT_PUBLIC_API_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_REGION=us-central1
NEXT_PUBLIC_API_BASE_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api
NEXT_PUBLIC_WS_URL=wss://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ws
NODE_ENV=production
```

### **2.2 Update API Hook (Optional)**

The current `apps/web/src/hooks/useApi.ts` already uses `process.env.NEXT_PUBLIC_API_URL`, so it will automatically pick up your Firebase URL.

### **2.3 Test Web App Connection**

```bash
# Start web app
cd apps/web
npm run dev

# Test API connection
curl http://localhost:3000/api/health
```

## 🔧 **Step 3: Update Admin Dashboard Configuration**

### **3.1 Create Environment File**

Create `apps/admin-dashboard/.env.local`:

```bash
# Ensei Platform - Admin Dashboard Environment Variables
NEXT_PUBLIC_API_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_REGION=us-central1
NODE_ENV=production
```

### **3.2 Test Admin Dashboard Connection**

```bash
# Start admin dashboard
cd apps/admin-dashboard
npm run dev

# Test admin API connection
curl https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/api/v1/admin/submissions
```

## 🧪 **Step 4: Test Complete Integration**

### **4.1 Test Authentication Flow**

```bash
# Test login endpoint
curl -X POST https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ensei.com","password":"admin123"}'

# Expected response:
# {
#   "user": { "id": "admin_1", "email": "admin@ensei.com", ... },
#   "accessToken": "eyJhbGciOiJIUzI1NiIs...",
#   "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
# }
```

### **4.2 Test Mission APIs**

```bash
# Test mission creation
curl -X POST https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/api/v1/missions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "platform": "twitter",
    "type": "engage",
    "model": "fixed",
    "tasks": ["like", "retweet"],
    "cap": 100,
    "isPremium": false,
    "tweetLink": "https://twitter.com/user/status/123",
    "instructions": "Like and retweet this tweet"
  }'
```

### **4.3 Test Admin APIs**

```bash
# Test admin submissions
curl -X GET https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/api/v1/admin/submissions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🌐 **Step 5: Deploy Frontend to Firebase Hosting**

### **5.1 Build Frontend Apps**

```bash
# Build web app
cd apps/web
npm run build

# Build admin dashboard
cd apps/admin-dashboard
npm run build
```

### **5.2 Configure Firebase Hosting**

Update `firebase.json`:

```json
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
```

### **5.3 Deploy Frontend**

```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting
```

## 🔄 **Step 6: Set Up CI/CD Pipeline**

### **6.1 GitHub Actions Workflow**

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

### **6.2 Environment Variables in CI/CD**

Set these secrets in your GitHub repository:

- `FIREBASE_SERVICE_ACCOUNT`: Firebase service account JSON
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_TOKEN`: Firebase CLI token

## 🔒 **Step 7: Security Configuration**

### **7.1 CORS Configuration**

Your Firebase Functions already have CORS configured, but you can customize it:

```typescript
// In functions/src/index.ts
app.use(cors({
  origin: [
    'https://your-project-id.web.app',
    'https://your-custom-domain.com',
    'http://localhost:3000', // For development
    'http://localhost:3001'  // For admin development
  ],
  credentials: true
}));
```

### **7.2 Environment Variables Security**

```bash
# Set secure environment variables
firebase functions:config:set \
  jwt.secret="$(openssl rand -base64 64)" \
  jwt.refresh_secret="$(openssl rand -base64 64)" \
  admin.email="admin@ensei.com" \
  admin.password="$(openssl rand -base64 32)"
```

## 📊 **Step 8: Monitoring & Analytics**

### **8.1 Firebase Analytics**

Add Firebase Analytics to your frontend:

```bash
# Install Firebase SDK
cd apps/web
npm install firebase

# Install admin dashboard
cd apps/admin-dashboard
npm install firebase
```

### **8.2 Error Monitoring**

```bash
# Install error monitoring
npm install @sentry/nextjs @sentry/react
```

## 🧪 **Step 9: Testing Your Integration**

### **9.1 End-to-End Testing**

```bash
# Test complete user flow
1. Visit your frontend URL
2. Register a new user
3. Create a mission
4. Submit a submission
5. Review submission in admin dashboard
6. Claim rewards
```

### **9.2 API Testing Script**

Create `test-integration.js`:

```javascript
const API_BASE = 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api';

async function testIntegration() {
  console.log('🧪 Testing Ensei Platform Integration...\n');
  
  // Test health check
  try {
    const health = await fetch(`${API_BASE}/health`);
    const healthData = await health.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test authentication
  try {
    const auth = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ensei.com',
        password: 'admin123'
      })
    });
    const authData = await auth.json();
    console.log('✅ Authentication:', authData.user ? 'Success' : 'Failed');
  } catch (error) {
    console.log('❌ Authentication failed:', error.message);
  }
  
  // Test mission APIs
  try {
    const missions = await fetch(`${API_BASE}/api/v1/missions`);
    const missionsData = await missions.json();
    console.log('✅ Missions API:', missionsData.length, 'missions');
  } catch (error) {
    console.log('❌ Missions API failed:', error.message);
  }
  
  console.log('\n🎉 Integration test completed!');
}

testIntegration();
```

## 🎯 **Step 10: Production Checklist**

### **✅ Pre-Launch Checklist**

- [ ] Firebase Functions deployed successfully
- [ ] Frontend apps built and deployed
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] SSL certificates active
- [ ] Domain configured (optional)
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Analytics enabled
- [ ] Backup strategy implemented
- [ ] Performance optimized
- [ ] Security audit completed

### **✅ Post-Launch Checklist**

- [ ] All API endpoints responding
- [ ] Authentication working
- [ ] Mission creation working
- [ ] Submission system working
- [ ] Admin dashboard functional
- [ ] Payment integration working
- [ ] Real-time updates working
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested
- [ ] Performance metrics acceptable

## 🚀 **Your Platform is Now Live!**

After completing these steps, your Ensei Platform will be:

- ✅ **Fully Integrated**: Frontend connected to Firebase backend
- ✅ **Scalable**: Serverless architecture with automatic scaling
- ✅ **Secure**: JWT authentication and Firestore security rules
- ✅ **Fast**: Global CDN and edge locations
- ✅ **Monitored**: Real-time analytics and error tracking
- ✅ **Production-Ready**: CI/CD pipeline and automated deployments

## 🆘 **Troubleshooting**

### **Common Issues**

**CORS Errors:**
```bash
# Check CORS configuration in functions/src/index.ts
# Ensure your frontend URLs are in the origin list
```

**Authentication Failures:**
```bash
# Check JWT secrets are set correctly
firebase functions:config:get
```

**API Not Responding:**
```bash
# Check function logs
firebase functions:log --only api
```

**Frontend Build Errors:**
```bash
# Check environment variables
echo $NEXT_PUBLIC_API_URL
```

## 📞 **Support**

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Support](https://firebase.google.com/support)

---

**Your Ensei Platform is now fully integrated and ready for users!** 🎉🚀
