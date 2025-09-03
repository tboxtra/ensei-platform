Ensei – Unified Spec Update (Custom Platform + Proof Standard + Decentralized Reviews)

Drop this into docs/PRODUCT_TECH_UPDATE.md and reference it in .cursorrules and docs/ENSEI_DEV_PROMPT.md. Then run the tasks in the Implementation Plan section.

0) Scope of this Update
	•	Add Custom as a platform (not a mission type).
	•	Enforce platform-wide proof standard: user must post on a social platform about the completed mission and submit the post URL as proof, except when an API-verifiable proof exists.
	•	Introduce decentralized reviewer system:
	•	5 peer reviews per submission; 1–5 star scale (1=Irrelevant, 2=Weak, 3=Fair, 4=Good, 5=Excellent).
	•	Average ≥ 2.5 → Accepted, else Rejected.
	•	Cumulative average rating is tracked on the submitter (not reviewers) and shown on their profile.
	•	Rewards to reviewers:
	•	Fixed: each reviewer earns 1/10 of the mission’s per-user reward (i.e., five reviewers together earn half of the platform-fee share).
	•	Degen: reviewers share 1/4 of each winner’s reward (split equally among 5 reviewers → each gets 1/20 of a winner’s reward).
	•	Degen review randomization:
	•	Reviews open only after degen duration ends and the mission is locked.
	•	Exactly cap winners are selected from accepted submissions; selection is random, weighted by submission age (oldest get a slight bias) and uniqueness (one win per user per mission).
	•	Review tasks for degen are throttled into the reviewer queue. Access to degen reviews requires a reviewer to have completed N fixed reviews recently (configurable; default N=10).

⸻

1) Domain Additions/Changes

1.1 Platform Enum (Shared Types)

Add custom to Platform.

// packages/shared-types/src/missions.ts
export enum Platform {
  twitter = 'twitter',
  instagram = 'instagram',
  tiktok = 'tiktok',
  facebook = 'facebook',
  whatsapp = 'whatsapp',
  snapchat = 'snapchat',
  telegram = 'telegram',
  custom = 'custom', // NEW
}

1.2 Custom Platform Task Model

Custom missions can be Engage/Content/Ambassador (mission types unchanged) but tasks are flexible:
	•	customTitle: string (required)
	•	customDescription?: string
	•	avgTimeMinutes: number (required; used to compute honors)
	•	proofMode: 'social-post' | 'api' (default social-post)
	•	apiVerifierKey?: string (if proofMode='api')

// packages/shared-types/src/missions.ts
export interface CustomTaskSpec {
  customTitle: string;
  customDescription?: string;
  avgTimeMinutes: number;      // creator-provided
  proofMode?: 'social-post' | 'api';
  apiVerifierKey?: string;     // e.g., 'steam_playtime', 'spotify_listen', 'http_ping'
}

Attach to mission when platform=custom:

export interface Mission {
  // ...existing
  platform: Platform;
  // ...
  customSpec?: CustomTaskSpec;         // NEW (only if platform=custom)
  proofRequirement: ProofRequirement;  // NEW (global, see §2)
}

1.3 Global Proof Requirement

Platform-wide default is social-post proof link. API proofs are allowed if a validator exists.

export type ProofRequirement =
  | { mode: 'social-post'; networks?: Platform[] } // networks optional filter (e.g., [twitter, instagram])
  | { mode: 'api'; verifierKey: string };          // uses verification-service

1.4 Reviewer Entities

// packages/shared-types/src/database.ts
export interface ReviewAssignment {
  id: string;
  missionId: string;
  submissionId: string;
  reviewerUserId: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'expired';
}

export interface ReviewVote {
  id: string;
  assignmentId: string;
  reviewerUserId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  commentLink?: string; // URL to reviewer’s comment on the submitter's social post
  createdAt: string;
}

export interface Submission {
  // ...existing
  ratingAvg?: number;    // computed from 5 votes
  ratingCount?: number;  // always 5 when completed
  status: 'pending' | 'accepted' | 'rejected';
}


⸻

2) Platform-Wide Proof Standard

2.1 Rule
	•	Default: all submissions must contain a social post URL showing the user’s mission completion (screenshots/videos may be attached in the post).
	•	Exception: proofRequirement.mode === 'api' → use verification-service adapter and allow non-social URL or no URL (depending on verifier).

2.2 Validation

// packages/validation-schemas/src/mission/submission.schema.ts
// Add: enforce social-post URL when mission.proofRequirement.mode === 'social-post'

2.3 Verification Service (Adapters)
	•	verification-service/src/social-urls.ts: normalize and ping URLs for Twitter/X, Instagram, TikTok, Facebook, Telegram (channel post), etc.
	•	verification-service/src/api-verifiers/<key>.ts: pluggable verifiers (e.g., “visit-website” beacons, game SDK hooks, music listen webhooks).

⸻

3) Pricing Logic for Custom

3.1 Honors from Time (Fixed model)

Honor rate remains 1 USD = 450 Honors, base rate $8/hour (already established).
For Custom in Fixed, per-user honors is derived from time:

minutes = avgTimeMinutes
usd = (minutes / 60) * 8
honors_base = round(usd * 450)
honors_per_user = honors_base * (1 + PLATFORM_FEE_RATE) * (premium? PREMIUM_MULTIPLIER : 1)

Note: PLATFORM_FEE_RATE = 1.0 (100%) and PREMIUM_MULTIPLIER = 5, as already defined.

3.2 Degen (Duration-based)

For Custom in Degen, taskCount = 1 unless the creator adds explicit subtasks. The existing degen engine remains:

C = preset.costUSD * (premium? 5 : 1) * max(1, taskCount)
userPoolHonors = round(C * HONORS_PER_USD * USER_POOL_FACTOR)
perWinnerHonors = floor(userPoolHonors / winnersCap)


⸻

4) Decentralized Reviewer System

4.1 Flow
	1.	Submission enters pending.
	2.	System creates 5 ReviewAssignments (avoid same user; ensure reviewer != submitter).
	3.	Reviewers open Review Queue:
	•	For Fixed: submissions appear immediately.
	•	For Degen: submissions appear only after mission end.
	•	Degen gating: a reviewer must have fixedReviewsCompletedLast7d ≥ N (default N=10).
	4.	Reviewer:
	•	opens the submitter’s social post URL, leaves a comment,
	•	captures the comment URL,
	•	picks a rating 1–5 and submits both.
	5.	When 5 votes received:
	•	compute avg = sum/5.
	•	if avg ≥ 2.5 → accepted, else rejected.
	•	update submitter’s cumulative average across accepted submissions.

4.2 Rewards to Reviewers
	•	Fixed: Each reviewer earns (perUserHonors / 10) (i.e., 10% of submitter reward).
	•	Degen: For each winner, reviewers collectively share 1/4 of the winner’s reward (so each of 5 reviewers earns winnerHonors / 20).
Implementation: once winners selected, compute reviewer payouts for reviewed & accepted winners; add ledger entries.

4.3 Degen Winner Randomization (after duration)
	•	Lock mission.
	•	Collect accepted submissions.
	•	If count ≥ winnersCap:
	•	Weighted random selection:
	•	weight = w1 * age_factor + w2 * entropy, with mild bias to older timestamps (e.g., age_factor = clamp((now - submittedAt)/T, 0.5..1.0)).
	•	One win per user per mission (dedupe).
	•	If count < winnersCap:
	•	All accepted submissions win; any missing slots remain unfilled.
	•	If a winner is later invalidated (fraud), replace with the next randomized candidate from the remaining accepted pool, and settle differential in ledger.

⸻

5) Validation & Schemas (Zod)

5.1 Create Mission – Custom

// packages/validation-schemas/src/mission/createCustomMission.schema.ts
// extends the standard create schema with:
customSpec: z.object({
  customTitle: z.string().min(3).max(120),
  customDescription: z.string().max(1000).optional(),
  avgTimeMinutes: z.number().int().min(1).max(24*60),
  proofMode: z.enum(['social-post','api']).default('social-post'),
  apiVerifierKey: z.string().min(1).optional()
}).strict()
.refine(s => s.proofMode === 'social-post' || !!s.apiVerifierKey, {
  path: ['apiVerifierKey'],
  message: 'apiVerifierKey required when proofMode=api'
});

Add to mission create union:

// packages/validation-schemas/src/mission/index.ts
export const createMissionSchema = z.discriminatedUnion('model', [
  createFixedMissionSchema.extend({
    platform: z.literal('custom'),
    customSpec: customSpecSchema,
  }),
  createDegenMissionSchema.extend({
    platform: z.literal('custom'),
    customSpec: customSpecSchema,
  }),
  // ... existing platform cases still allowed without customSpec
]);

5.2 Submission – Social Post Proof

// packages/validation-schemas/src/mission/submission.schema.ts
export const submissionSchema = z.object({
  missionId: uuid,
  proofs: z.array(z.string().url()).min(1), // primary = social post URL
  // If mission.proofRequirement.mode === 'api', allow empty proofs but require api evidence handled by server
});

5.3 Review – Vote

// packages/validation-schemas/src/mission/review.schema.ts
export const createReviewVoteSchema = z.object({
  assignmentId: uuid,
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  commentLink: z.string().url().min(1), // reviewer’s comment URL on submitter’s post
});


⸻

6) API Changes (api-gateway)

6.1 New/Updated Routes
	•	POST /v1/missions
	•	Accept platform=custom + customSpec per schema.
	•	Compute pricing (Fixed: from time; Degen: presets).
	•	Set proofRequirement: default { mode:'social-post' }, or { mode:'api', verifierKey }.
	•	POST /v1/missions/:id/submit
	•	Validate proofs[0] as a social post URL unless mission says api.
	•	Create 5 ReviewAssignment records and enqueue.
	•	GET /v1/review/queue
	•	Returns pending assignments for the authenticated reviewer.
	•	For Degen: only show if reviewer meets fixed-review threshold.
	•	POST /v1/review/vote
	•	Body: { assignmentId, rating, commentLink }.
	•	On 5th vote → compute average; accept/reject submission; update submitter rating; trigger reviewer payouts (see §7).
	•	POST /v1/missions/:id/settle-degen
	•	(Internal/cron) After degen duration: lock, compute accepted, pick winners, payout, enqueue reviewer payouts for winners.

6.2 OpenAPI

Update docs/api/openapi.yaml accordingly and regenerate packages/api-client.

⸻

7) Mission Engine Updates

7.1 Custom (Fixed)

Add helper:

// services/mission-engine/src/custom/fixed.ts
export function honorsForCustomFixed(avgTimeMinutes: number, premium: boolean) {
  const usd = (avgTimeMinutes / 60) * 8;
  const baseHonors = Math.round(usd * HONORS_PER_USD);
  const withFee = Math.round(baseHonors * (1 + PLATFORM_FEE_RATE));
  return premium ? withFee * PREMIUM_COST_MULTIPLIER : withFee;
}

7.2 Review Payouts
	•	Fixed: reviewerPayout = perUserHonors / 10.
	•	Degen: perWinnerReviewerShare = winnerHonors / 4 (shared across 5 reviewers → each winnerHonors / 20).

Add:

// services/mission-engine/src/review/payouts.ts
export function reviewerPayoutFixed(perUserHonors: number) {
  return Math.floor(perUserHonors / 10);
}
export function reviewerPayoutDegenPerReviewer(winnerHonors: number) {
  return Math.floor(winnerHonors / 20);
}


⸻

8) Review Randomization (Degen) – Algorithm

// services/mission-engine/src/review/degen-selection.ts
// Input: acceptedSubmissions[], winnersCap
// Weight = 0.8*ageWeight + 0.2*rand; ageWeight in [0.5, 1.0]

Pseudocode:
	1.	Normalize timestamps → ageWeight = clamp((now - submittedAt)/T_window, 0.5..1.0).
	2.	Compute weight = 0.8*ageWeight + 0.2*random().
	3.	Sort by weight desc; iterate, picking first with unique userId, until winnersCap reached.

⸻

9) Database Migration

-- database/migrations/005_custom_platform_and_reviews.sql

-- customSpec columns on missions
ALTER TABLE missions
  ADD COLUMN custom_title TEXT,
  ADD COLUMN custom_description TEXT,
  ADD COLUMN custom_avg_time_minutes INT,
  ADD COLUMN proof_mode TEXT DEFAULT 'social-post',
  ADD COLUMN api_verifier_key TEXT;

-- proof requirement normalized if needed
-- submissions rating fields
ALTER TABLE submissions
  ADD COLUMN rating_avg NUMERIC,
  ADD COLUMN rating_count INT DEFAULT 0,
  ADD COLUMN status TEXT DEFAULT 'pending';

CREATE TABLE review_assignments (
  id UUID PRIMARY KEY,
  mission_id UUID NOT NULL REFERENCES missions(id),
  submission_id UUID NOT NULL REFERENCES submissions(id),
  reviewer_user_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE review_votes (
  id UUID PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES review_assignments(id),
  reviewer_user_id UUID NOT NULL REFERENCES users(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment_link TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_assignments_reviewer ON review_assignments(reviewer_user_id, status);
CREATE INDEX idx_review_votes_assignment ON review_votes(assignment_id);


⸻

10) Web & Admin UI

10.1 Web (apps/web)
	•	Create Mission:
	•	Platform chip includes Custom.
	•	If platform=custom show fields: Title, Description, Avg Time (minutes), Proof mode (social/API), API Verifier (if API).
	•	Pricing panel reflects time-based honors (Fixed) or presets (Degen).
	•	Submit Mission:
	•	Proof input URL labeled “Social post URL”. Show helper text: “Post your screenshot/video proof on Twitter/Instagram/TikTok/Facebook/Telegram and paste the post link.”
	•	Review Queue:
	•	Reviewer sees next assignment → link to submitter’s social post → upon interaction, paste comment URL, pick rating, submit.

10.2 Admin (apps/admin-dashboard)
	•	Moderation log; reviewer stats; misbehavior flags; override accept/reject if abuse is detected.

⸻

11) Tests
	•	Unit (mission-engine):
	•	honorsForCustomFixed with various minutes; premium on/off.
	•	reviewerPayoutFixed / reviewerPayoutDegenPerReviewer.
	•	Integration (api-gateway):
	•	Create custom mission (fixed & degen).
	•	Submit with social URL; enqueue 5 assignments.
	•	Complete 5 votes → accept/reject threshold logic.
	•	Degen settle: winners randomized; reviewer payout computed.
	•	E2E:
	•	Creator → Custom Fixed → User submit social proof → 5 reviewers vote → payout ledger entries.
	•	Degen gating: block degen review until reviewer finishes N fixed reviews.

⸻

12) .cursorrules Additions (delta)
	•	Ensure custom included in Platform allowlists and task selectors.
	•	Enforce social-post proof URL by default.
	•	Gate degen review queue behind fixed-review threshold.

guardrails:
  - "Custom is a PLATFORM, not a mission type."
  - "Default proof mode is social-post with URL; API proofs only if a verifier exists."
  - "Submissions get 5 peer reviews; avg >= 2.5 => accepted."
  - "Submitter’s profile shows cumulative average across accepted submissions."
  - "Degen reviews open only after mission ends; winners are randomized with age bias and uniqueness."
  - "Reviewer payouts: Fixed = perUser/10; Degen = each reviewer gets winnerHonors/100."


⸻

13) Implementation Plan (Cursor Tasks)
	1.	Shared Types

	•	Add custom to Platform.
	•	Add CustomTaskSpec, ProofRequirement, reviewer entities.
	•	Export new types.

	2.	Validation Schemas

	•	createCustomMission.schema.ts + integrate into mission create union.
	•	Update submission.schema.ts to enforce social-post URL when needed.
	•	createReviewVote.schema.ts.

	3.	Mission Engine

	•	custom/fixed.ts honors from time.
	•	review/payouts.ts, review/degen-selection.ts.

	4.	API Gateway

	•	Extend POST /missions to accept platform=custom.
	•	Enforce proof mode on POST /missions/:id/submit.
	•	Add reviewer queue routes and voting.
	•	Cron/endpoint to settle degen.

	5.	Verification Service

	•	Normalize social post URLs.
	•	Add simple API verifier stub (feature-flagged).

	6.	Web/Admin

	•	UI for Custom, proof URL input, review queue, admin logs.

	7.	DB

	•	Apply migration 005_custom_platform_and_reviews.sql.

	8.	OpenAPI + api-client

	•	Update and regenerate.

	9.	Tests

	•	Unit, integration, E2E per section 11.

⸻