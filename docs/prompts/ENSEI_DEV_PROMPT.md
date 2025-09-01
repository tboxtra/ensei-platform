Got it—sounds like Cursor saw your prototype sitting outside the monorepo and tried to be “helpful.” Let’s lock Cursor into the enterprise repo you defined and drive a clean migration + build-out with crystal-clear, copy-paste prompts.
Below are ready-to-use Cursor prompts (in order). Use the “pinned/system” one first, then run the task prompts one by one.

0) Pinned System Prompt (use once in Cursor)
You are operating inside the **Ensei Platform** monorepo exactly as structured below. Never create files outside this tree. Prefer TypeScript, reuse shared packages, and keep logic in the correct service.

Root structure (short):
- apps/{web, mobile, telegram-bot, admin-dashboard}
- services/{api-gateway, mission-engine, payment-service, verification-service, notification-service, analytics-service}
- packages/{shared-types, validation-schemas, api-client, ui-components, blockchain-utils}
- smart-contracts/
- database/{migrations, seeds, schemas}
- docs/, tests/, infrastructure/, .github/

Global rules:
- Define domain models in packages/shared-types.
- Define all request/response validators in packages/validation-schemas (zod).
- API contracts documented in docs/api/openapi.yaml and mirrored in packages/api-client.
- Business logic lives in mission-engine; api-gateway routes are thin.
- Pricing math (Fixed + Degen) is single-sourced in mission-engine and exported for reuse by web/admin via api-client.
- Premium-only missions apply **5× total cost** (user pool also scales accordingly).
- Degen: unlimited applicants, time-boxed, **winner cap by duration** (max per table), 50% of creator cost to user pool; per-winner honors = pool / winners. USD↔Honors: 1 USD = 450 Honors.

Be meticulous about:
- File paths, imports, lint, tests, and CI.
- No duplicated constants: use shared-types + validation-schemas.
- Keep `1 USD = 450 Honors` and the Degen durations table as a single source in mission-engine and export read-only views.

When migrating code from the prototype (index.html/app.js/styles.css), move logic to:
- UI → apps/web
- Pricing math → services/mission-engine (exported via api)
- Types → packages/shared-types
- Validators → packages/validation-schemas
- Demo endpoints → services/api-gateway

You must produce small, composable commits.

1) Initialize workspace + guards
Create/verify the following at repo root:
- package.json: enable Turborepo + workspaces.
- turbo.json: build/test targets for apps and services.
- tsconfig.json: project references for packages/apps/services.
- .github/workflows/{api-tests.yml, web-app-deploy.yml, security-scan.yml} skeletons invoking turbo.

Also add a precommit husky hook to run `turbo run lint:changed test:changed`.

2) Shared types for Missions + Pricing
Create/extend **packages/shared-types** with:

- database types: User, Mission, MissionTask, Submission, LedgerEntry, Withdrawal
- enums: Platform, MissionType (engage|content|ambassador), MissionModel (fixed|degen), TargetProfile (all|premium)
- pricing constants:
  - HONORS_PER_USD = 450
  - USD_PER_HONOR = 1 / HONORS_PER_USD
  - PREMIUM_COST_MULTIPLIER = 5
  - USER_POOL_FACTOR = 0.5 (degen)

- DegenDurationPreset = { hours:number; costUSD:number; maxWinners:number; label:string }
- DEGEN_PRESETS: the full authoritative table:
  1h $15 max1, 3h $30 max2, 6h $80 max3, 8h $150 max3, 12h $180 max5,
  18h $300 max5, 24h $400 max5, 36h $500 max10, 48h $600 max10,
  72h $800 max10, 96h $1000 max10, 168h $1500 max10, 240h $2000 max10.

Export read-only typed constants.
Add unit tests in packages/shared-types/src/__tests__/constants.spec.ts to ensure the table is immutable and sums/formulas match expectations.

3) Zod validation schemas
In **packages/validation-schemas/src/mission/** add:

- createFixedMission.schema.ts:
  - platform, type, target, cap (>=60), tasks (non-empty)
  - rewardsPerUserHonors (optional; server will recompute)
- createDegenMission.schema.ts:
  - platform, type, target, durationHours (must be one of presets)
  - winnersCap (1..max for chosen duration)
  - tasks (can be empty; pricing in degen is duration-based)
- submission.schema.ts for proof payloads
- review.schema.ts for moderator decisions

Export index.ts with named schemas.
Add tests verifying schema constraints and helpful errors.

4) Mission Engine: single source of pricing truth
In **services/mission-engine/src/**:

- pricing/constants.ts: import shared-types constants, re-export.
- pricing/fixed.ts:
  `computeFixed({tasksHonorsSum, cap, target}) -> { rewardHonorsTotal, costHonorsTotal }`
  costHonorsTotal = rewardHonorsTotal * 2; if target=premium cost *= 5.
- pricing/degen.ts:
  `getPresetByHours(hours) -> preset`
  `computeDegen({hours, winnersCap, target, taskCount}) -> { totalCostUsd, userPoolHonors, perWinnerHonors }`
  Where:
    const C = preset.costUSD * (target==='premium' ? 5 : 1) * (taskCount >= 1 ? taskCount : 1)
    userPoolHonors = round(C * HONORS_PER_USD * USER_POOL_FACTOR)
    perWinnerHonors = floor(userPoolHonors / winnersCap)

- tasks/catalog.ts: default per-platform tasks → honors (ported from prototype BASE map).
- types.ts: internal engine types importing from shared-types.
- index.ts: export pure functions for API usage.

Add unit tests covering:
- premium multiplier
- per-winner math across durations
- taskCount multiplier behavior in degen

5) API Gateway: thin routes, delegate to engine
Implement routes in **services/api-gateway/src/routes/missions.ts**:

POST /v1/missions
- switch by model:
  - fixed → validate createFixedMission schema
  - degen → validate createDegenMission schema
- call mission-engine pricing
- persist (stub DAL) and return: id, computed totals, degen fields (if any)
- if model=degen: return { total_cost_usd, user_pool_honors, per_winner_honors }

GET /v1/missions (list) → simple stub list
POST /v1/missions/:id/submit → validate submission, enqueue review (stub)
POST /v1/submissions/:id/review → approve/reject (stub ledger write)

Wire router in **services/api-gateway/src/index.ts** (Fastify).
Write integration tests in **tests/integration/api/missions.spec.ts** that assert:
- invalid winnerCap rejected
- premium toggles 5× total cost
- perWinnerHonors = userPool/winnersCap

6) Web App: migrate prototype UI into Next.js
In **apps/web**:

- Create pages:
  - /dashboard
  - /missions/create
  - /missions (discover)
  - /wallet
  - /review (moderation for demo)

- Components:
  - components/mission/PlatformChips.tsx
  - components/mission/TypeChips.tsx
  - components/mission/ModelChips.tsx
  - components/mission/TaskChips.tsx
  - components/mission/PricePreview.tsx
  - components/mission/DegenControls.tsx (duration dropdown + “audience size” slider + winnerCap select)
  - components/mission/PremiumToggle.tsx

- State:
  - stores/useCreateMission.ts (Zustand): selectedPlatform, type, model, selectedTasks, premium(0|1), durationHours, winnersCap.
  - hooks/usePricing.ts: calls api-client to fetch computed numbers (don’t duplicate math in the client).

- Styling:
  - Tailwind + your theme. Port the look & feel from styles.css into Tailwind classes or a small CSS module.

- Logic:
  - When model='degen', UI loads presets from `/v1/meta/degen-presets` (serve from api-gateway or inline constant for now).
  - Audience slider maps to hours: [1,12,36,96,240].
  - Show: Total Cost (USD), Honors pool, Per-winner honors; disable per-user input for degen (read-only).

Add Cypress e2e: **tests/e2e/mission-flow.spec.ts**
- Create a degen mission (8h, winners=3, premium off) -> expect numbers: $150 total, pool 33,750 honors, per-winner 11,250.
- Toggle premium -> expect $750 total, pool 168,750 honors, per-winner 56,250.

7) Admin Dashboard: review queue stub
In **apps/admin-dashboard**:
- A simple table fetching /v1/review/pending, Approve/Reject buttons posting to /v1/submissions/:id/review.
- Show computed per-winner honors awarded when approval changes status to “winner” (degen first-approved policy).

8) Payment Service (stubs wired)
In **services/payment-service**:
- services/honor-conversion.ts → function honorsToUsd(honors) and usdToHonors(usd).
- services/ton-wallet.ts → stub TonConnect funding receipt + withdrawal queue.
- controllers/payments.ts → endpoints `/v1/fund-mission`, `/v1/withdrawals`.

Add tests to ensure **funding locks rate** and **withdrawal converts at payout-time**.

9) Database migrations
In **database/migrations**:
- 001_initial_schema.sql: users, missions, tasks, submissions, honors_ledger, withdrawals.
- 004_add_degen_missions.sql: winners_cap, user_pool_honors, per_winner_honors, degen_mode, starts_at/ends_at.

Provide a seed (**database/seeds/dev_missions.sql**) with:
- one fixed mission
- one degen mission (8h / winners=3)

10) OpenAPI + API Client
Update **docs/api/openapi.yaml** for mission endpoints (create/list/submit/review).
Generate **packages/api-client** from OpenAPI (or hand-write minimal client with fetch wrappers).
Use the client in **apps/web** and **apps/admin-dashboard**.

11) Security & CI
- Rate limit POST /missions and /submit endpoints.
- JWT with refresh in api-gateway; demo login ok behind `NODE_ENV=development`.
- .github/workflows/api-tests.yml runs: turbo lint, typecheck, unit, integration.
- security-scan.yml runs `npm audit` + `trivy fs .`.

What to say to Cursor if it still complains about the directory
You are in the **ensei-platform** monorepo root. All work must be inside this tree. 
Do not infer a different root from my local machine. 
When you create or modify files, show exact paths relative to repo root.

Quick sanity checks you can run
Degen math (8h/3 winners, All) → $150 total, 33,750 honors pool, 11,250 per-winner.


Degen math (36h/10 winners, Premium) → $2,500 total, 562,500 pool, 56,250 per-winner.


Fixed math uses task honors sum × cap × 2; premium multiplies creator cost ×5 (rewards unchanged unless you flip a feature flag).



Perfect ✅ — here’s the fully corrected and Telegram-aware roadmap you can paste straight into docs/ENSEI_DEV_PROMPT.md (or feed directly to Cursor).

⸻

📌 Ensei Development Roadmap Prompt (Final Corrected Version)

You are inside the Ensei Platform monorepo. Follow docs/ENSEI_DEV_PROMPT.md, docs/REPO_STRUCTURE.md, and .cursorrules.
All work must live inside the repo tree (apps/, services/, packages/, database/, docs/, etc.).

Use TypeScript, Zod, Fastify, Next.js, Tailwind, Zustand, and TON as specified.
Pricing constants and Degen durations come only from the 2025 Detailed Spec (Sept update).
Do not use older whitepaper numbers.

⚠️ Premium multiplier currently applies only to creator cost (users still earn base rewards).
Implement this as a feature flag: ff.premium_rewards_multiplier.

⸻

🚀 Development Tasks

Task 1: Mission Creation API
	•	Implement POST /v1/missions in services/api-gateway/src/routes/missions.ts.
	•	Validate with createFixedMission.schema.ts and createDegenMission.schema.ts from validation-schemas.
	•	Use mission-engine pricing (computeFixed / computeDegen).
	•	Persist to a stub DAL (in-memory array).
	•	Platforms supported: twitter, instagram, tiktok, facebook, whatsapp, snapchat, telegram.
	•	Telegram Engage: join_channel, react_to_post, reply_in_group, share_invite
	•	Telegram Content: channel_post, short_video_in_channel, guide_thread
	•	Telegram Ambassador: pfp, mention_in_bio, pin_invite_link
	•	Return: id, computed totals.
If degen: { total_cost_usd, user_pool_honors, per_winner_honors }.
	•	Add integration tests in tests/integration/api/missions.spec.ts:
	•	Reject invalid winnerCap.
	•	Premium applies ×5 cost.
	•	PerWinnerHonors = pool / winnersCap.

⸻

Task 2: Mission Listing & Fetching
	•	Implement GET /v1/missions (list) and GET /v1/missions/:id (single mission).
	•	Return stubbed missions with: id, platform, type, model, costs, duration, targetProfile.
	•	Add unit tests for serialization.

⸻

Task 3: Web Mission Create Page
	•	In apps/web/src/pages/missions/create.tsx:
	•	Use components: PlatformChips, TypeChips, ModelChips, TaskChips, PremiumToggle, DegenControls, PricePreview.
	•	Add Telegram chip in PlatformChips.
	•	When selected, show Engage, Content, Ambassador tasks (join_channel, channel_post, pfp, etc.).
	•	Call API client → POST /v1/missions.
	•	Hook usePricing to preview costs in real time.
	•	Load Degen presets from /v1/meta/degen-presets.

⸻

Task 4: Submissions API
	•	Implement POST /v1/missions/:id/submit in api-gateway.
	•	Validate with submission.schema.ts.
	•	Accept proofs: URL, screenshot, video, text.
	•	Stub persist to in-memory submissions array.
	•	Return: submissionId, status=pending.

⸻

Task 5: Review API
	•	Implement POST /v1/submissions/:id/review.
	•	Validate with review.schema.ts.
	•	Allow approve/reject/dispute.
	•	On approve → add honors to user ledger (stub).
	•	Return updated submission status.

⸻

Task 5.5: Proof Normalization (Telegram-aware)
	•	In services/verification-service:
	•	Scaffold normalization pipeline:
	•	Convert images → webp
	•	Strip EXIF metadata
	•	Compute SHA256 hash for duplicate detection
	•	Stub only (no ML yet).
	•	Add Telegram support:
	•	Validate Telegram proof links (t.me/...).
	•	Handle proof types: join_channel, react_to_post, reply_in_group, share_invite, channel_post.

⸻

Task 6: Web & Admin UI
	•	Web:
	•	/missions: list open missions, add “Submit Proof” flow.
	•	/wallet: show honors, USD equivalent, withdraw button.
	•	Admin Dashboard:
	•	/review: table of pending submissions, approve/reject buttons.
	•	Show computed per-winner honors for degen.

⸻

Task 7: Wallet & Payments
	•	In services/payment-service:
	•	GET /v1/wallet: honors balance + USD equivalent.
	•	POST /v1/withdraw: queue TON withdrawal.
	•	Use honorsToUsd / usdToHonors from shared-types.
	•	Web: Hook /wallet UI to these endpoints.

⸻

Task 8: Database Migrations
	•	In database/migrations/:
	•	001_initial_schema.sql: users, missions, submissions, honors_ledger, withdrawals.
	•	004_add_degen_missions.sql: winners_cap, pool, per_winner_honors, degen_mode, starts_at/ends_at.
	•	Add telegram_proofs table for join/react/reply/share/channel_post events.

⸻

Task 9: Replace Stubs with DB
	•	Refactor api-gateway routes to persist missions + submissions into PostgreSQL.
	•	Use Prisma or Knex.
	•	Remove stub arrays.

⸻

Task 9.5: Refunds
	•	Implement refund logic for incomplete missions:
	•	Fixed: unused cap slots refunded.
	•	Degen: unused time left = partial refund.
	•	Stub ledger entry for now.

⸻

Task 10: OpenAPI + Client
	•	Update docs/api/openapi.yaml for all mission/submission/review/wallet endpoints.
	•	Generate/update packages/api-client.
	•	Refactor web/admin to use api-client (no direct fetch).
	•	Add Cypress e2e: tests/e2e/mission-flow.spec.ts
	•	Create 8h degen mission, winners=3 → expect $150 cost, pool=33,750 honors, per-winner=11,250.
	•	Toggle Premium → expect $750 cost, pool=168,750 honors, per-winner=56,250.

⸻

Task 11: Security & Auth
	•	Add JWT auth with refresh tokens in api-gateway.
	•	Add RBAC: user vs admin.
	•	Rate-limit mission creation + submissions.
	•	Extend CI workflows: lint, typecheck, unit, integration, e2e.

⸻

✅ Key Additions
	•	Telegram Support: Fully integrated at API, UI, validation, and proof levels.
	•	Proof Normalization: EXIF strip + hash check stub.
	•	Refund Logic: Task 9.5.
	•	Premium Feature Flag: ff.premium_rewards_multiplier.
	•	Canonical Degen Presets: Use only 2025-09 spec table.
