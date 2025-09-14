# 🚀 Ensei Platform - Quick Deployment Card

## ⚡ **One-Command Deployment**

```bash
# 1. Deploy Backend to Firebase
./deploy-firebase.sh

# 2. Deploy Frontend to Firebase Hosting
./deploy-frontend.sh YOUR_FIREBASE_PROJECT_ID

# 3. Test Everything
node test-integration.js
```

## 🔥 **Firebase Setup (First Time Only)**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init
# Select: Functions, Firestore, Hosting
# Choose your Firebase project
# Use TypeScript: Yes
# Install dependencies: Yes
```

## 📋 **Pre-Deployment Checklist**

- [ ] Firebase CLI installed (`firebase --version`)
- [ ] Logged in to Firebase (`firebase login`)
- [ ] Firebase project created
- [ ] Project initialized (`firebase init`)
- [ ] Dependencies installed (`yarn install`)

## 🎯 **Your Live URLs**

After deployment, your platform will be at:

- **Web App**: `https://YOUR_PROJECT_ID.web.app`
- **Admin Dashboard**: `https://YOUR_PROJECT_ID.web.app/admin`
- **API**: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api`

## 🔧 **Essential Commands**

```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# View logs
firebase functions:log

# Open Firebase Console
firebase open
```

## 🧪 **Testing Commands**

```bash
# Test health check
curl https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/health

# Test authentication
curl -X POST https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ensei.com","password":"admin123"}'

# Run integration tests
node test-integration.js
```

## 🚨 **Troubleshooting**

**Firebase CLI not found:**
```bash
npm install -g firebase-tools
```

**Permission denied:**
```bash
firebase login --reauth
```

**Deployment failed:**
```bash
cd functions && npm install
firebase deploy --only functions
```

**Frontend not loading:**
```bash
cd apps/web && yarn build
firebase deploy --only hosting
```

## 📊 **Admin Credentials**

Default admin credentials (change after first login):
- **Email**: `admin@ensei.com`
- **Password**: Generated during deployment (check terminal output)

## 🔒 **Security Notes**

- Change admin password after first login
- JWT secrets are auto-generated
- Firestore security rules are deployed
- CORS is configured for your domains

## 📞 **Need Help?**

- **Full Guide**: See `COMPLETE_DEPLOYMENT_GUIDE.md`
- **Firebase Docs**: https://firebase.google.com/docs
- **GitHub Repo**: https://github.com/tboxtra/ensei-platform

---

**Your Ensei Platform is ready to deploy!** 🎉🚀
