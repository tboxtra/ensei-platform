# Ensei Platform - Comprehensive Audit & Fixes

## Overview
This document outlines critical inconsistencies and fixes needed across the Ensei Platform codebase. Each issue is categorized, explained, and includes specific implementation steps.

## Status: ✅ PHASE 1 & 2 COMPLETE

---

## 1. Data Model & Field Naming Issues

### 1.1 Timestamps Mix Types
**Issue:** Some writes use `new Date().toISOString()`, others use Firestore `serverTimestamp()`. Readers sometimes do `.toDate()` and sometimes assume strings.

**Status:** ✅ FIXED
- Created `toIso()` utility for safe timestamp conversion
- Standardized all writes to use `serverTimestamp()`
- Applied consistent timestamp handling across all endpoints

### 1.2 Field Name Drift
**Issue:** Multiple naming conventions: `duration`, `duration_hours`, `durationHours`; `cap` vs `winnersCap` vs `max_participants`; `created_at/updated_at` vs camelCase.

**Status:** ✅ FIXED
- Created `normalizeMissionData()` function to standardize field names on write
- Created `serializeMissionResponse()` function to return consistent camelCase on read
- Applied to all mission endpoints for consistent API responses

### 1.3 Status Enums Not Aligned
**Issue:** Mixed case: 'VERIFIED' (upper) in verifications, 'verified' (lower) in taskCompletions, 'completed' sometimes means verified.

**Status:** ✅ FIXED
- Created `normalizeStatus()` function to standardize all statuses to lowercase
- Added legacy status mapping for backward compatibility
- Applied to mission creation and all status updates

### 1.4 Collections Overlap
**Issue:** Three submission sources: `mission_submissions`, `mission_participations`, `taskCompletions`. Different code reads different ones.

**Status:** ✅ FIXED
- Unified submission system using `mission_participations` as single source of truth
- Updated taskCompletions endpoint to prioritize `mission_participations`
- Added fallback support for legacy `taskCompletions` data
- Consistent data flow across all submission endpoints

### 1.5 Aggregates Expect Missing Fields
**Issue:** `updateMissionAggregates` reads `missionData.winnersPerTask`, but missions don't set it.

**Status:** ✅ FIXED
- Added `winnersPerTask` calculation on mission creation
- Fixed missions: 1 per task unless specified
- Degen missions: global cap across all tasks

---

## 2. Rewards, Pricing & Fees Issues

### 2.1 Frontend vs Backend Task Price Tables
**Issue:** Frontend `TASK_PRICES` includes items not in backend `calculateTaskHonors`.

**Status:** ✅ FIXED
- Centralized `TASK_PRICES` configuration in backend `index.ts`
- Updated `calculateTaskHonors()` to use centralized pricing
- Updated all frontend components to use same pricing table
- Added support for Instagram, TikTok, Facebook, WhatsApp, and Custom tasks

### 2.2 Premium Multiplier & Honors/USD Mismatch
**Issue:** Frontend hardcodes values, backend defaults vary.

**Status:** ✅ FIXED
- Standardized `platformFeeRate` to 0.25 across all configurations
- Updated system config defaults to use consistent values
- Frontend and backend now use same pricing constants

### 2.3 Total Cost Computation Inconsistencies
**Issue:** Some code uses `rewards.usd`, others compute from honors.

**Status:** ✅ FIXED
- Calculate and persist both `rewards.honors` and `rewards.usd` on mission creation
- Admin/UI reads from persisted values

---

## 3. Dates & Deadlines Issues

### 3.1 Missing/Incorrect Deadlines
**Issue:** Degen missions store duration but not deadline; mixed fields cause "Invalid Date".

**Status:** ✅ FIXED
- Calculate and store deadline for all missions on creation
- Use consistent timestamp handling

### 3.2 Scheduled Job Mixes Date vs Timestamp
**Issue:** `checkExpiredFixedMissions` compares `expires_at` to JS Date, writes `completed_at` as Date.

**Status:** ✅ FIXED
- Updated `checkExpiredFixedMissions` to use `serverTimestamp()` for writes
- Fixed `completed_at` and `updated_at` to use server timestamps
- Maintained proper date comparison logic for expiration checks

---

## 4. API Contracts & Validation Issues

### 4.1 Duplicate URL Validation Logic
**Issue:** `validateUrl()` helper and inline switch repeat checks.

**Status:** ✅ FIXED
- Created centralized URL validation and normalization
- Applied consistently across endpoints

### 4.2 Auto Actions Naming
**Issue:** Completion logic looks for `actionId` starting with `auto_`, but frontend tasks don't follow convention.

**Status:** ✅ FIXED
- Created explicit AUTO_ACTIONS mapping with `auto: true/false` flags
- Replaced string-based auto_ prefix detection with structured config
- Added support for Twitter, Instagram, TikTok, Facebook platforms
- Clear distinction between auto and manual actions

### 4.3 Pagination Token Type Leak
**Issue:** `/v1/missions` uses `pageToken` as document ID; invalid IDs fail silently.

**Status:** ✅ FIXED
- Implemented opaque cursor system using base64 encoded `{id, created_at}`
- Replaced direct document ID tokens with secure cursor format
- Added proper error handling for invalid tokens
- Enhanced security by preventing data leakage through pagination

---

## 5. Security & Operations Issues

### 5.1 Rate Limit & Idempotency In-Memory
**Issue:** In Cloud Functions, limits/keys won't hold under scale or cold starts.

**Status:** ✅ FIXED
- Migrated from in-memory Map to Firestore-based rate limiting
- Distributed rate limiting across Cloud Function instances
- Atomic transaction-based request counting
- Persistent rate limiting that survives cold starts

### 5.2 Public File Uploads by Default
**Issue:** `makePublic()` on storage is risky.

**Status:** ✅ FIXED
- Removed makePublic() calls - files now private by default
- Implemented signed URL generation for temporary access
- 1-hour expiration for signed URLs
- Enhanced security by keeping files private

### 5.3 Base64 Upload Type Check Loose
**Issue:** Regex patterns aren't precise, could pass unintended types.

**Status:** ✅ FIXED
- Implemented file-type package for accurate MIME type detection
- Added comprehensive whitelist of allowed MIME types
- Validates against detected type as source of truth
- Prevents MIME spoofing attacks
- Enhanced error messages with detected vs provided types

### 5.4 Auth "joinedAt" from iat
**Issue:** Using token issue time, not account creation.

**Status:** ✅ FIXED
- Replaced token.iat (issued at time) with actual account creation time
- Created getUserCreationTime() function using Firebase Admin Auth
- Fetches userRecord.metadata.creationTime for accurate join dates
- Applied to all user authentication endpoints
- Proper error handling with fallback to current time

---

## 6. Admin & Analytics Issues

### 6.1 Platform Fee Hardcoded vs Config
**Issue:** Admin analytics calculates `platformFee = totalRevenue * 0.25` while config sets 0.10.

**Status:** 🔄 TODO
**Fix:** Read `platformFeeRate` from `system_config` for analytics.

### 6.2 User Stats Split Across Places
**Issue:** Stats in multiple locations with different naming conventions.

**Status:** 🔄 TODO
**Fix:** Define single canonical stats doc, create hourly job to derive aggregates.

---

## 7. Degen-Specific Flow Issues

### 7.1 Winners Lifecycle Not Fully Wired
**Issue:** Triggers expect task docs that aren't created on mission creation.

**Status:** 🔄 TODO
**Fix:** Create task docs on degen mission creation or refactor triggers.

### 7.2 Counting Logic vs Caps
**Issue:** Aggregates increment per-task but degen winners are global "top N".

**Status:** 🔄 TODO
**Fix:** Clarify whether caps are per-task or per-mission, implement consistently.

---

## Implementation Priority

### Phase 1: Critical Data Integrity (High Priority)
1. ✅ Timestamp standardization
2. ✅ Deadline calculation
3. ✅ Rewards calculation
4. ✅ Field name normalization
5. ✅ Status enum standardization

### Phase 2: Security & Performance (Medium Priority)
1. ✅ Rate limiting with shared store
2. ✅ File upload security
3. ✅ Pagination improvements
4. ✅ URL validation consolidation
5. ✅ Base64 upload validation
6. ✅ Auth joinedAt accuracy

### Phase 3: Admin & Analytics (Lower Priority)
1. 🔄 Platform fee configuration
2. 🔄 User stats consolidation
3. 🔄 Degen flow completion

---

## Quick Remediation Plan

1. **Config-first:** Move prices, multipliers, fee rate to `system_config`
2. **Schema normalizer:** Normalize incoming fields on write, serialize consistently on read
3. **Unify submissions:** Migrate to `taskCompletions` as source of truth
4. **Deadlines & rewards:** Compute and persist centrally on mission creation
5. **Security:** Replace in-memory systems with shared store
6. **Statuses:** Standardize lowercase and map legacy on read
7. **Admin:** Make analytics consume `system_config.platformFeeRate`

---

## Progress Tracking

- ✅ Completed: 15/25 issues
- 🔄 In Progress: 0/25 issues  
- ⏳ Pending: 10/25 issues

**Last Updated:** December 2024
**Next Review:** After Phase 3 completion

### Phase 1 Complete ✅
- ✅ Timestamp standardization
- ✅ Field name normalization  
- ✅ Status enum standardization
- ✅ WinnersPerTask calculation
- ✅ Task pricing centralization
- ✅ Platform fee standardization
- ✅ Deadline calculation
- ✅ Scheduled job timestamp fixes

### Phase 2 Complete ✅
- ✅ Collections overlap resolution
- ✅ Auto actions naming
- ✅ Pagination improvements
- ✅ Rate limiting with shared store
- ✅ File upload security
- ✅ Base64 upload validation
- ✅ Auth joinedAt accuracy

### Phase 3 Pending ⏳
- ⏳ Platform fee configuration
- ⏳ User stats consolidation
- ⏳ Degen flow completion
- ⏳ Winners lifecycle wiring
- ⏳ Counting logic vs caps
