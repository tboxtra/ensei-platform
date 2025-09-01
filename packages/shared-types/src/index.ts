// ============================================================================
// MISSION TYPES
// ============================================================================

export type {
  Platform,
  MissionType,
  MissionModel,
  TargetProfile,
  TaskType,
  CreateMissionRequest,
  MissionSubmission,
  Proof
} from './missions';

// ============================================================================
// DATABASE TYPES
// ============================================================================

export type {
  UserStatus,
  UserRole,
  MissionStatus,
  SubmissionStatus,
  LedgerEntryType,
  WithdrawalStatus,
  User,
  Mission,
  MissionTask,
  ProofRequirement,
  Submission,
  Proof as DatabaseProof,
  AIVerificationResult,
  LedgerEntry,
  Withdrawal,
  NotificationPreferences,
  PrivacySettings,
  UserMissionStats,
  PlatformStats
} from './database';

// ============================================================================
// PRICING CONSTANTS & FUNCTIONS
// ============================================================================

export {
  HONORS_PER_USD,
  USD_PER_HONOR,
  PREMIUM_COST_MULTIPLIER,
  USER_POOL_FACTOR,
  PLATFORM_FEE_RATE,
  DEGEN_PRESETS,
  AUDIENCE_PRESETS,
  getDegenPresetByHours,
  getDegenPresetByLabel,
  getAudiencePresetByName,
  usdToHonors,
  honorsToUsd,
  calculateDegenCosts,
  calculateFixedCosts,
  validateDegenPresets,
  validateAudiencePresets
} from './pricing';

export type {
  DegenDurationPreset,
  AudiencePreset as PricingAudiencePreset
} from './pricing';

// ============================================================================
// PLATFORM TASKS
// ============================================================================

export * from './platformTasks';


