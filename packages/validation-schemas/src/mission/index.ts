// ============================================================================
// MISSION CREATION SCHEMAS
// ============================================================================

export {
    CreateFixedMissionSchema,
    getValidTasks as getValidTasksForFixed,
    validateTasks as validateTasksForFixed
} from './createFixedMission.schema';

export type {
    CreateFixedMissionRequest,
    CreateFixedMissionInput,
    CreateFixedMissionOutput,
} from './createFixedMission.schema';

export {
    CreateDegenMissionSchema,
    getValidTasks as getValidTasksForDegen,
    validateTasks as validateTasksForDegen,
    getMaxWinnersForDuration,
    validateWinnersCap
} from './createDegenMission.schema';

export type {
    CreateDegenMissionRequest,
    CreateDegenMissionInput,
    CreateDegenMissionOutput,
} from './createDegenMission.schema';

// ============================================================================
// SUBMISSION SCHEMAS
// ============================================================================

export {
    CreateSubmissionSchema,
    UpdateSubmissionSchema,
    ProofContentSchema,
    ProofTypeSchema,
    SubmissionStatusSchema,
    validateProofContent,
    validateSubmission,
    getProofType
} from './submission.schema';

export type {
    CreateSubmissionRequest,
    UpdateSubmissionRequest,
    ProofContent,
    ProofType,
    SubmissionStatus,
    Proof,
} from './submission.schema';

// ============================================================================
// REVIEW SCHEMAS
// ============================================================================

export {
    ReviewDecisionSchema,
    BulkReviewSchema,
    ReviewHistorySchema,
    ReviewStatsSchema,
    validateReviewDecision,
    validateBulkReview,
    getRejectionReasonDescription,
    calculateReviewStats
} from './review.schema';

export type {
    ReviewAction,
    RejectionReason,
    ReviewDecision,
    BulkReview,
    ReviewHistory,
    ReviewStats,
} from './review.schema';

// ============================================================================
// BASE SCHEMAS (re-exported for convenience)
// ============================================================================

export {
    PlatformSchema,
    MissionTypeSchema,
    TargetProfileSchema
} from './createFixedMission.schema';

// ============================================================================
// UNION SCHEMAS
// ============================================================================

import { z } from 'zod';
import { CreateFixedMissionSchema } from './createFixedMission.schema';
import { CreateDegenMissionSchema } from './createDegenMission.schema';

// Union schema for mission creation - simplified approach
export const CreateMissionSchema = z.union([
    CreateFixedMissionSchema,
    CreateDegenMissionSchema
]);

export type CreateMissionRequest = z.infer<typeof CreateMissionSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

import type { Platform, MissionType } from '@ensei/shared-types';

/**
 * Get valid tasks for any platform and mission type
 */
export function getValidTasks(platform: Platform, type: MissionType): string[] {
    // This function is re-exported from both schemas, but they're identical
    // We'll use the fixed mission version as the canonical one
    const { getValidTasks: getValidTasksForFixed } = require('./createFixedMission.schema');
    return getValidTasksForFixed(platform, type);
}

/**
 * Validate tasks for any platform and mission type
 */
export function validateTasks(platform: Platform, type: MissionType, tasks: string[]): boolean {
    const { validateTasks: validateTasksForFixed } = require('./createFixedMission.schema');
    return validateTasksForFixed(platform, type, tasks);
}

/**
 * Check if a mission type is valid for a platform
 */
export function isValidMissionType(platform: Platform, type: MissionType): boolean {
    const validTasks = getValidTasks(platform, type);
    return validTasks.length > 0;
}

/**
 * Get all valid mission types for a platform
 */
export function getValidMissionTypes(platform: Platform): MissionType[] {
    const types: MissionType[] = ['engage', 'content', 'ambassador'];
    return types.filter(type => isValidMissionType(platform, type));
}
