# 🔥 Ensei Platform - Firebase Deployment Guide

## 🚀 **Deploy Your Backend to Firebase Functions**

This guide will help you deploy your Ensei Platform backend to Firebase Functions, providing a serverless, scalable solution.

## 📋 **Prerequisites**

1. **Firebase CLI** installed
2. **Node.js 18+** installed
3. **Firebase project** created
4. **Git** repository with your code

## 🛠️ **Setup Steps**

### **Step 1: Install Firebase CLI**

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify installation
firebase --version
```

### **Step 2: Initialize Firebase Project**

```bash
# Initialize Firebase in your project
firebase init

# Select the following features:
# ✅ Functions: Configure a Cloud Functions directory
# ✅ Firestore: Configure security rules and indexes files
# ✅ Hosting: Configure files for Firebase Hosting

# Choose your Firebase project
# Select TypeScript for Functions
# Use ESLint: Yes
# Install dependencies: Yes
```

### **Step 3: Configure Firebase Project**

```bash
# Set your Firebase project ID
firebase use your-firebase-project-id

# Or update .firebaserc with your project ID
echo '{"projects":{"default":"your-firebase-project-id"}}' > .firebaserc
```

### **Step 4: Install Dependencies**

```bash
# Install Firebase Functions dependencies
cd functions
npm install

# Install additional dependencies
npm install express cors helmet express-rate-limit jsonwebtoken bcryptjs ws uuid
npm install --save-dev @types/express @types/cors @types/jsonwebtoken @types/bcryptjs @types/ws @types/uuid
```

### **Step 5: Configure Environment Variables**

```bash
# Set Firebase Functions environment variables
firebase functions:config:set \
  jwt.secret="your-super-secret-jwt-key" \
  jwt.refresh_secret="your-super-secret-refresh-key" \
  admin.email="admin@ensei.com" \
  admin.password="your-secure-admin-password"

# Or create a .env file in functions directory
cat > functions/.env << EOF
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
ADMIN_EMAIL=admin@ensei.com
ADMIN_PASSWORD=your-secure-admin-password
NODE_ENV=production
EOF
```

## 🚀 **Deployment Commands**

### **Deploy Everything**

```bash
# Deploy all Firebase services
firebase deploy

# Deploy only Functions
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Hosting
firebase deploy --only hosting
```

### **Deploy Specific Functions**

```bash
# Deploy only the API function
firebase deploy --only functions:api

# Deploy only the WebSocket function
firebase deploy --only functions:websocket

# Deploy specific functions
firebase deploy --only functions:auth,functions:missions
```

## 🧪 **Testing Your Firebase Deployment**

### **Local Testing**

```bash
# Start Firebase emulators
firebase emulators:start

# Test functions locally
curl http://localhost:5001/your-project-id/us-central1/api/health
curl http://localhost:5001/your-project-id/us-central1/api/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ensei.com","password":"admin123"}'
```

### **Production Testing**

```bash
# Test deployed functions
curl https://us-central1-your-project-id.cloudfunctions.net/api/health
curl https://us-central1-your-project-id.cloudfunctions.net/api/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ensei.com","password":"admin123"}'
```

## 📊 **Firebase Services Used**

### **Firebase Functions**
- **API Gateway**: Main API endpoints
- **Authentication**: JWT-based auth system
- **Mission Engine**: Pricing calculations
- **Admin APIs**: Admin dashboard endpoints

### **Firestore Database**
- **Users**: User profiles and authentication
- **Missions**: Mission data and configurations
- **Submissions**: User submissions and reviews
- **Analytics**: Platform analytics and metrics

### **Firebase Hosting**
- **Static Files**: Frontend hosting
- **API Routing**: Route API calls to Functions
- **SSL/HTTPS**: Automatic SSL certificates

## 🔧 **Configuration Files**

### **firebase.json**
```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "hosting": {
    "public": "public",
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### **functions/package.json**
```json
{
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.8.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  }
}
```

## 🌐 **Your Firebase URLs**

After deployment, your services will be available at:

### **API Endpoints**
- **Main API**: `https://us-central1-your-project-id.cloudfunctions.net/api`
- **Health Check**: `https://us-central1-your-project-id.cloudfunctions.net/api/health`
- **Auth API**: `https://us-central1-your-project-id.cloudfunctions.net/api/api/v1/auth`
- **Mission API**: `https://us-central1-your-project-id.cloudfunctions.net/api/api/v1/missions`
- **Admin API**: `https://us-central1-your-project-id.cloudfunctions.net/api/api/v1/admin`

### **Hosting**
- **Frontend**: `https://your-project-id.web.app`
- **Admin Dashboard**: `https://your-project-id.web.app/admin`

## 🔒 **Security Configuration**

### **Firestore Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /missions/{missionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || request.auth.token.role == 'moderator');
    }
  }
}
```

### **Environment Variables**
```bash
# Set secure environment variables
firebase functions:config:set \
  jwt.secret="$(openssl rand -base64 64)" \
  jwt.refresh_secret="$(openssl rand -base64 64)" \
  admin.password="$(openssl rand -base64 32)"
```

## 📈 **Scaling & Performance**

### **Automatic Scaling**
- Firebase Functions automatically scale based on demand
- No server management required
- Pay only for what you use

### **Performance Optimization**
- Use Firebase CDN for static assets
- Implement caching strategies
- Optimize function cold starts
- Use Firestore indexes for queries

### **Monitoring**
- Firebase Console for function logs
- Cloud Monitoring for metrics
- Error reporting and alerts
- Performance monitoring

## 🛠️ **Management Commands**

### **Function Management**
```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only api

# Delete a function
firebase functions:delete api

# List all functions
firebase functions:list
```

### **Database Management**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Export Firestore data
gcloud firestore export gs://your-bucket/backup

# Import Firestore data
gcloud firestore import gs://your-bucket/backup
```

### **Hosting Management**
```bash
# Deploy hosting
firebase deploy --only hosting

# View hosting history
firebase hosting:releases

# Rollback hosting
firebase hosting:rollback
```

## 🚨 **Troubleshooting**

### **Common Issues**

**Function deployment fails:**
```bash
# Check function logs
firebase functions:log

# Check for syntax errors
cd functions && npm run build

# Verify dependencies
cd functions && npm install
```

**Authentication issues:**
```bash
# Check Firebase project configuration
firebase projects:list

# Verify service account permissions
firebase projects:list
```

**Database connection issues:**
```bash
# Check Firestore rules
firebase firestore:rules:get

# Verify database indexes
firebase firestore:indexes
```

### **Debug Mode**
```bash
# Run functions locally with debug info
firebase emulators:start --debug

# Test functions with verbose logging
firebase functions:log --only api --limit 50
```

## 📋 **Production Checklist**

- [ ] Firebase project created and configured
- [ ] Environment variables set securely
- [ ] Firestore security rules deployed
- [ ] Functions deployed successfully
- [ ] Hosting configured and deployed
- [ ] SSL certificates active
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented
- [ ] Performance optimization applied
- [ ] Security audit completed

## 🎉 **Deployment Complete!**

Your Ensei Platform backend is now running on Firebase! 

**Benefits of Firebase deployment:**
- ✅ **Serverless**: No server management required
- ✅ **Scalable**: Automatically scales with demand
- ✅ **Secure**: Built-in security and authentication
- ✅ **Fast**: Global CDN and edge locations
- ✅ **Cost-effective**: Pay only for what you use
- ✅ **Reliable**: 99.95% uptime SLA
- ✅ **Integrated**: Seamless integration with other Google services

**Your Firebase backend is ready to serve users worldwide!** 🌍✨

## 🆘 **Support**

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

---

**Your Ensei Platform is now powered by Firebase!** 🔥🚀
