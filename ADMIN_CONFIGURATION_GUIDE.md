# 🔧 Ensei Platform Admin Configuration Guide

## 🎯 **Quick Start**

### **1. Access Admin Dashboard**
- **URL**: https://ensei-6c8e0.web.app/admin
- **Demo Admin**: `admin@ensei.com` / `admin123`
- **Demo Moderator**: `moderator@ensei.com` / `mod123`

### **2. Admin Roles & Permissions**

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Admin** | All permissions (`*`) | Platform owner, full control |
| **Moderator** | `review:read`, `review:write`, `missions:read`, `users:read` | Content moderation, user support |
| **Viewer** | Read-only access | Analytics, reporting |

## ⚙️ **System Configuration**

### **A. General Settings**
```json
{
  "platform": {
    "name": "Ensei Platform",
    "version": "1.0.0",
    "environment": "production",
    "maintenanceMode": false
  }
}
```

### **B. Pricing Configuration**
```json
{
  "pricing": {
    "honorsPerUsd": 450,        // 1 USD = 450 Honors
    "premiumMultiplier": 5,     // 5x cost for premium users
    "platformFeeRate": 0.05,    // 5% platform fee
    "userPoolFactor": 1.2       // 20% bonus for user pool
  }
}
```

### **C. System Limits**
```json
{
  "limits": {
    "maxMissionsPerUser": 20,           // Max missions a user can create
    "maxSubmissionsPerMission": 500,    // Max participants per mission
    "maxReviewersPerSubmission": 3,     // Max reviewers per submission
    "reviewTimeoutHours": 48            // Time to review submissions
  }
}
```

### **D. Security Settings**
```json
{
  "security": {
    "sessionTimeout": 28800,            // 8 hours in seconds
    "require2FA": false,                // Enable 2FA for admins
    "apiRateLimit": 1000,               // Requests per hour
    "passwordMinLength": 8,             // Minimum password length
    "enableAuditLog": true              // Log admin actions
  }
}
```

## 🎛️ **Admin Dashboard Features**

### **1. Dashboard Overview**
- **Real-time metrics**: Active users, missions, submissions
- **Revenue tracking**: Honors earned, USD converted
- **Platform health**: API status, error rates
- **Quick actions**: Create mission, review submissions

### **2. User Management**
- **User list**: View all registered users
- **User details**: Profile, activity, earnings
- **Role management**: Assign admin/moderator roles
- **User actions**: Suspend, ban, or promote users

### **3. Mission Management**
- **Mission list**: All created missions
- **Mission details**: Participants, submissions, rewards
- **Mission actions**: Approve, reject, or modify missions
- **Analytics**: Performance metrics per mission

### **4. Review System**
- **Submission queue**: Pending reviews
- **Review interface**: Approve/reject with comments
- **Review history**: Track all review actions
- **Quality metrics**: Reviewer performance

### **5. System Settings**
- **Platform configuration**: Name, branding, features
- **Pricing management**: Honors rates, multipliers
- **Feature flags**: Enable/disable features
- **Maintenance mode**: Platform downtime control

### **6. Analytics**
- **User growth**: Registration trends
- **Mission performance**: Popular platforms, success rates
- **Revenue analytics**: Earnings, conversions
- **Platform usage**: Most used features

## 🔒 **Security Configuration**

### **Admin Account Security**
1. **Change default passwords** immediately
2. **Enable 2FA** for all admin accounts
3. **Use strong passwords** (12+ characters)
4. **Regular password rotation** (every 90 days)

### **API Security**
1. **Rate limiting**: Prevent abuse
2. **CORS configuration**: Restrict origins
3. **Input validation**: Sanitize all inputs
4. **Audit logging**: Track all admin actions

### **Data Protection**
1. **User data encryption**: Sensitive information
2. **Backup strategy**: Regular data backups
3. **Access controls**: Role-based permissions
4. **Compliance**: GDPR/CCPA requirements

## 🚀 **Recommended Configuration**

### **For Production Launch**
```json
{
  "pricing": {
    "honorsPerUsd": 450,
    "premiumMultiplier": 5,
    "platformFeeRate": 0.08
  },
  "limits": {
    "maxMissionsPerUser": 10,
    "maxSubmissionsPerMission": 200,
    "reviewTimeoutHours": 24
  },
  "security": {
    "require2FA": true,
    "sessionTimeout": 14400,
    "apiRateLimit": 500
  }
}
```

### **For Development/Testing**
```json
{
  "pricing": {
    "honorsPerUsd": 100,
    "premiumMultiplier": 2,
    "platformFeeRate": 0.01
  },
  "limits": {
    "maxMissionsPerUser": 50,
    "maxSubmissionsPerMission": 1000,
    "reviewTimeoutHours": 72
  },
  "security": {
    "require2FA": false,
    "sessionTimeout": 86400,
    "apiRateLimit": 10000
  }
}
```

## 📋 **Configuration Checklist**

### **Initial Setup**
- [ ] Access admin dashboard
- [ ] Change default admin passwords
- [ ] Configure platform name and branding
- [ ] Set up pricing structure
- [ ] Configure system limits
- [ ] Enable security features

### **User Management**
- [ ] Create additional admin accounts
- [ ] Set up moderator roles
- [ ] Configure user permissions
- [ ] Test user registration flow
- [ ] Verify email notifications

### **Mission System**
- [ ] Test mission creation
- [ ] Verify platform integrations
- [ ] Test submission flow
- [ ] Configure review process
- [ ] Set up reward distribution

### **Analytics & Monitoring**
- [ ] Enable analytics tracking
- [ ] Set up error monitoring
- [ ] Configure performance metrics
- [ ] Set up alert notifications
- [ ] Test reporting features

## 🆘 **Troubleshooting**

### **Common Issues**

**Admin Login Fails**
- Check credentials: `admin@ensei.com` / `admin123`
- Clear browser cache and cookies
- Try incognito/private mode

**Settings Not Saving**
- Check browser console for errors
- Verify API connectivity
- Check admin permissions

**API Errors**
- Check Firebase Functions logs
- Verify environment variables
- Test API endpoints directly

### **Support Commands**
```bash
# Check API health
curl https://us-central1-ensei-6c8e0.cloudfunctions.net/api/health

# View Firebase logs
npx firebase-tools functions:log

# Test admin login
curl -X POST https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ensei.com","password":"admin123"}'
```

## 📞 **Need Help?**

- **Documentation**: Check `COMPLETE_DEPLOYMENT_GUIDE.md`
- **API Reference**: See `docs/api/` directory
- **Firebase Console**: https://console.firebase.google.com/project/ensei-6c8e0
- **Admin Dashboard**: https://ensei-6c8e0.web.app/admin

---

**Your Ensei Platform admin system is ready for configuration!** 🎉


