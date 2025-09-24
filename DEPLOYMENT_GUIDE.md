# Deployment Guide - Next Steps Implementation

## 🚀 **Step 1: Deploy Cloud Functions (Real-time Updates)**

### Prerequisites
- Project: `ensei-6c8e0`
- Functions runtime: Node 18
- New functions: `onParticipationUpdateV2`, `onMissionCreateV2`, `onDegenWinnersChosenV2`, `onDegenMissionCompleted`

### Commands
```bash
# From repo root
firebase login
firebase use ensei-6c8e0

cd functions
npm ci
npm run build

# Deploy only the new/updated functions
firebase deploy --only functions:onParticipationUpdateV2,functions:onMissionCreateV2,functions:onDegenWinnersChosenV2,functions:onDegenMissionCompleted --project ensei-6c8e0
```

### Post-deploy Quick Check
```bash
firebase functions:log --only onParticipationUpdateV2 --project ensei-6c8e0 --limit 50
```

**Verification Steps:**
1. Create/complete a test task → confirm a log line + user's `users/{uid}/stats/summary` increments (Tasks Done + honors)
2. Create a mission → confirm Missions Created increments when `deleted !== true`

---

## 🧪 **Step 2: Run Unit Tests Regularly (Prevent Regressions)**

### Local Testing
```bash
npm test
```

### CI/CD Integration
- ✅ GitHub Actions workflow created: `.github/workflows/tests.yml`
- ✅ Package.json script configured: `"test": "node scripts/test-honors-calculator.js"`

### Optional: Pre-push Hook
```bash
npx husky-init && npm i
# Add to .husky/pre-push:
npm test || exit 1
```

---

## 📊 **Step 3: Monitor Admin Reports (Schema Consistency)**

### Run on Demand
```bash
# Requires service account key
node scripts/admin-task-report.js
```

### Automated Monitoring
```bash
# Nightly via cron (on your runner)
# crontab -e
0 2 * * * /usr/local/bin/node /path/to/repo/scripts/admin-task-report.js >> /path/to/reports/admin-task-report.log 2>&1
```

### Cloud Logging Alert
1. Go to Google Cloud → Logging → Logs Explorer
2. Filter: `resource.type="cloud_function" severity>=WARNING ("Unknown task type" OR "Invariant failed")`
3. Create alert policy → email/Slack

---

## 🎲 **Step 4: Enable Degen Missions When Ready**

### Current Behavior
- **Fixed missions**: Immediate per-task honors using authoritative map
  - `like=50`, `retweet=100`, `comment=150`, `quote=200`, `follow=250`
- **Degen**: No payouts until winners are chosen

### When Ready to Pay Degen Winners

#### 1. Confirm Schema
- `missions/{id}.type === "degen"`
- Winners written to `missions/{id}/winners` (or `missions/{id}.winners[]`)
- Each winner entry: `{ user_id, prize_honors }` (display units)

#### 2. Trigger Flow (Already Implemented)
- `onDegenWinnersChosenV2` reads winners, writes each winner's payout to `users/{uid}/stats/summary.totalEarned += prize_honors`
- Optional audit doc: `users/{uid}/earnings/{missionId}` for transparency

#### 3. Dry-run Test
- Create one in dev project OR mark small mission as `type:"degen"`
- Add 1–2 winners with tiny prizes
- Trigger function → check logs and user stats

#### 4. Backfill (If Past Degen Winners)
- Add script: `scripts/backfill-degen-winners.js`
- Idempotent logic (skip if `users/{uid}/earnings/{missionId}` exists)

---

## ✅ **Quick Verification Checklist**

After completing the above steps:

- [ ] **Functions live**: Logs show activity; stats increment on task completion/mission creation
- [ ] **Unit tests green**: `npm test` passes locally and in CI
- [ ] **Admin report clean**: No unknown task types; invariants OK
- [ ] **Degen pilot**: Adding winners increments totalEarned correctly (no double counts)

---

## 🔧 **Handy Commands Recap**

```bash
# Deploy functions
firebase deploy --only functions:onParticipationUpdateV2,functions:onMissionCreateV2,functions:onDegenWinnersChosenV2,functions:onDegenMissionCompleted --project ensei-6c8e0

# Tail logs
firebase functions:log --project ensei-6c8e0 --limit 100

# Tests
npm test

# Reports (requires service account key)
node scripts/admin-task-report.js
```

---

## 🎯 **Implementation Status**

### ✅ **Completed**
1. **Unit Test**: `scripts/test-honors-calculator.js` - All tests pass
2. **Unknown Task Logging**: Enhanced script with schema drift detection
3. **Admin Report**: `scripts/admin-task-report.js` - Schema monitoring
4. **Degen Calculator**: `shared/degen-calculator.ts` - Ready for future enablement
5. **Real-time Updates**: Cloud Functions ready for deployment
6. **CI/CD**: GitHub Actions workflow configured
7. **TypeScript**: All compilation errors fixed

### 🚀 **Ready for Deployment**
- Cloud Functions built and ready
- Unit tests passing
- CI/CD pipeline configured
- Documentation complete

**Your QuickStats system is now production-ready with enterprise-grade hardening measures!** 🎉

