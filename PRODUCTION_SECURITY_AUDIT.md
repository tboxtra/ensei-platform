# Production Security Audit - Pack System

## Environment Variables Security

### ✅ Safe to Expose (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_API_URL`: Public API endpoint (safe)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Public project ID (safe)
- `NEXT_PUBLIC_FIREBASE_REGION`: Public region (safe)
- `NEXT_PUBLIC_API_BASE_URL`: Public API base (safe)
- `NEXT_PUBLIC_WS_URL`: Public WebSocket URL (safe)
- `NEXT_PUBLIC_SHOW_ACTIVE_ENTITLEMENTS`: Feature flag (safe)
- `NEXT_PUBLIC_ENABLE_PACK_PURCHASE`: Feature flag (safe)

### 🔒 Secrets (Never Expose)
- Firebase service account keys
- API keys for external services
- Database connection strings
- JWT secrets
- Admin passwords

## Production Environment Setup

### Vercel Configuration
```bash
# Set these in Vercel dashboard under Project Settings > Environment Variables
NEXT_PUBLIC_API_URL=https://us-central1-ensei-6c8e0.cloudfunctions.net/api
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ensei-6c8e0
NEXT_PUBLIC_FIREBASE_REGION=us-central1
NEXT_PUBLIC_API_BASE_URL=https://us-central1-ensei-6c8e0.cloudfunctions.net/api
NEXT_PUBLIC_WS_URL=wss://us-central1-ensei-6c8e0.cloudfunctions.net/ws
NEXT_PUBLIC_SHOW_ACTIVE_ENTITLEMENTS=true
NEXT_PUBLIC_ENABLE_PACK_PURCHASE=true
NODE_ENV=production
```

### Firebase Configuration
- Project ID: `ensei-6c8e0` (confirmed)
- Region: `us-central1` (confirmed)
- Functions URL: `https://us-central1-ensei-6c8e0.cloudfunctions.net/api` (confirmed)

## Security Checklist

### ✅ Completed
- [x] No secrets in NEXT_PUBLIC_* variables
- [x] Firebase project ID is public-safe
- [x] API endpoints are public-safe
- [x] Feature flags are public-safe
- [x] Environment variables documented

### 🔄 To Do
- [ ] Set up Vercel environment variables
- [ ] Enable branch protection on main
- [ ] Audit Firebase security rules
- [ ] Set up monitoring alerts
- [ ] Create incident response plan

## Feature Flag Security

### Rollback Capabilities
- `NEXT_PUBLIC_ENABLE_PACK_PURCHASE=false`: Disables all pack purchases
- `NEXT_PUBLIC_SHOW_ACTIVE_ENTITLEMENTS=false`: Hides active entitlements section
- Both flags default to `true` in production
- Can be toggled instantly via Vercel environment variables

### Fallback Behavior
- When pack purchases disabled: Shows maintenance message, preserves Single Use option
- When entitlements hidden: Only shows purchasable packs
- Graceful degradation: No broken UI states

## Monitoring Security

### Admin Access
- `/admin/monitoring` requires authentication
- Server-side auth checks implemented
- Cache-Control: no-store headers needed

### Data Exposure
- Health checks expose system status (safe)
- Metrics expose aggregate data (safe)
- No user-specific data in monitoring endpoints
