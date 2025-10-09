# Production Environment Setup

## 1. Vercel Environment Variables

Set these in Vercel Project → Settings → Environment Variables (Production):

### Web App Environment Variables
```
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_USE_MOCK=0
NEXT_PUBLIC_DEMO=0
NEXT_PUBLIC_FAKE_WALLET=0
NEXT_PUBLIC_SHOW_DEMO_CARDS=0
NEXT_PUBLIC_API_BASE=https://us-central1-ensei-6c8e0.cloudfunctions.net/api
NEXT_PUBLIC_API_URL=https://us-central1-ensei-6c8e0.cloudfunctions.net/api
NEXT_PUBLIC_MISSION_WIZARD=1
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CHAIN_NAME=Sepolia Testnet
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://sepolia.etherscan.io
NEXT_PUBLIC_PACK_CONTRACT_ADDRESS=0x...
```

### API Gateway Environment Variables
```
# Firebase Configuration
FIREBASE_PROJECT_ID=ensei-6c8e0
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

# Payment Configuration
PAYMENT__PACKS__ENABLED=true
PAYMENT__GATEWAY=onchain
PAYMENT__MOCK__ENABLED=0
ENTITLEMENTS__MOCK__ENABLED=0

# On-chain Configuration
ONCHAIN__CHAIN_ID=11155111
ONCHAIN__RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
ONCHAIN__CONTRACT_ADDRESS=0x...
ONCHAIN__CONFIRMATIONS=3

# Security
SECURITY__WEBHOOK_SECRET=your-webhook-secret
SECURITY__WALLET_BINDING=required

# CORS
CORS_ALLOWED_ORIGINS=https://ensei-platform.vercel.app,https://ensei-platform.vercel.app

# Disable fallback catalog
ALLOW_PACK_FALLBACK=0
```

## 2. API Configuration Updates

### Disable Pack Fallback
Update `services/api-gateway/src/routes/packs.ts`:

```typescript
// Replace this:
const packs: Pack[] = (cfg?.payment?.packs && Array.isArray(cfg.payment.packs) && cfg.payment.packs.length)
    ? cfg.payment.packs as Pack[]
    : buildCatalog();

// With this:
const packs: Pack[] = cfg?.payment?.packs as Pack[];
if (!packs || !packs.length) {
    if (process.env.ALLOW_PACK_FALLBACK === '1') {
        return buildCatalog();
    }
    return reply.status(503).send({ error: 'Packs not configured. Please contact support.' });
}
```

## 3. Web App Updates

### Update Data Fetching
Update all API calls to use `cache: 'no-store'`:

```typescript
const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_BASE}/v1/packs`,
  { cache: 'no-store', next: { revalidate: 0 } }
);
```

### Remove Demo Components
Wrap demo components with environment checks:

```typescript
const SHOW_DEMO = process.env.NEXT_PUBLIC_DEMO === '1';
if (SHOW_DEMO) return <DemoWalletCards />;
// else render live data
```

## 4. Firestore Setup

Seed `system_config/main.payment.packs` with your production pack catalog:

```json
{
  "payment": {
    "packs": {
      "enabled": true,
      "packs": [
        {
          "id": "starter-pack",
          "kind": "single",
          "label": "Starter Pack",
          "size": "small",
          "quota": { "likes": 50, "retweets": 25, "comments": 10 },
          "priceUSD": 9.99,
          "tweetsIncluded": 1
        },
        {
          "id": "premium-pack",
          "kind": "single", 
          "label": "Premium Pack",
          "size": "medium",
          "quota": { "likes": 150, "retweets": 75, "comments": 30 },
          "priceUSD": 29.99,
          "tweetsIncluded": 1
        },
        {
          "id": "enterprise-pack",
          "kind": "single",
          "label": "Enterprise Pack", 
          "size": "large",
          "quota": { "likes": 500, "retweets": 250, "comments": 100 },
          "priceUSD": 99.99,
          "tweetsIncluded": 1
        },
        {
          "id": "monthly-pro",
          "kind": "subscription",
          "label": "Monthly Pro",
          "size": "medium", 
          "quota": { "likes": 100, "retweets": 50, "comments": 20 },
          "priceUSD": 19.99,
          "tweetsIncluded": 1,
          "cadence": "hourly",
          "durationDays": 30
        }
      ]
    }
  }
}
```

## 5. Testing Checklist

- [ ] GET /v1/health returns 200
- [ ] GET /v1/packs returns production catalog (not fallback)
- [ ] GET /v1/entitlements returns real user data or empty array
- [ ] GET /v1/prices/ethusd returns current ETH price
- [ ] Wallet page shows live data (no fake balances)
- [ ] Packs tab shows real catalog from API
- [ ] Buy Pack → shows live USD↔ETH conversion
- [ ] My Packs shows real entitlements or "Connect wallet" CTA


