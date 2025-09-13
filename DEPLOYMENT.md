# Vercel Deployment Configuration

This project is configured to deploy both the user dashboard and admin dashboard on Vercel with proper routing.

## URL Structure

- **User Dashboard**: `https://your-domain.vercel.app/` (root)
- **Admin Dashboard**: `https://your-domain.vercel.app/admin/` (admin subpath)

## Deployment Steps

### 1. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Follow the prompts to configure your project
```

### 2. Configure Environment Variables

Set these environment variables in your Vercel dashboard:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### 3. Build Configuration

The project uses:
- **Root build**: Builds the user dashboard as the main app
- **Admin subpath**: Routes `/admin/*` to the admin dashboard
- **Monorepo structure**: Both apps are built from the same repository

## How It Works

1. **Vercel routing**: The `vercel.json` file routes requests:
   - `/admin/*` → Admin dashboard
   - `/*` → User dashboard

2. **Base path**: Admin dashboard uses `/admin` as base path in production

3. **Separate authentication**: Each dashboard has its own auth system:
   - User dashboard: `firebaseToken`
   - Admin dashboard: `admin_firebaseToken`

## Testing Locally

```bash
# Start user dashboard (port 3000)
cd apps/web
npm run dev

# Start admin dashboard (port 3001) 
cd apps/admin-dashboard
npm run dev
```

## Troubleshooting

- **Admin dashboard not loading**: Check that `/admin` routes are working
- **Authentication conflicts**: Ensure separate localStorage keys are used
- **Build errors**: Verify all dependencies are installed in both apps