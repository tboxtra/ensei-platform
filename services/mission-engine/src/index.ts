// Export pricing functions
export { computeFixed } from './pricing/fixed';
export { computeDegen, getPresetByHours } from './pricing/degen';
export * from './pricing/constants';

// Export degen presets function
import { DEGEN_PRESETS } from './pricing/constants';

export function getDegenPresets() {
    return DEGEN_PRESETS;
}

// Export task catalog functions
export {
    TASK_CATALOG,
    getTaskHonors,
    getAvailableTasks,
    calculateTasksHonors,
    validateTasks
} from './tasks/catalog';

// Export types
export * from './types';

// Re-export shared types for convenience
export type {
    Platform,
    MissionType,
    MissionModel,
    TaskType,
    TargetProfile,
    DegenDurationPreset
} from '@ensei/shared-types';

// Main pricing function that handles both fixed and degen missions
import type { MissionPricingRequest, MissionPricingResponse } from './types';
import { computeFixed } from './pricing/fixed';
import { computeDegen, getPresetByHours } from './pricing/degen';
import { calculateTasksHonors, validateTasks } from './tasks/catalog';
import { HONORS_PER_USD, USD_PER_HONOR } from './pricing/constants';

/**
 * Calculate mission pricing for both fixed and degen models
 * @param request - Mission pricing request
 * @returns Pricing response with cost breakdown
 */
export function calculateMissionPricing(request: MissionPricingRequest): MissionPricingResponse {
    const { platform, type, model, target, tasks, cap, durationHours, winnersCap } = request;

    // Validate tasks
    if (!validateTasks(platform, type, tasks)) {
        throw new Error(`Invalid tasks for platform ${platform} and type ${type}`);
    }

    // Calculate tasks honors
    const tasksHonors = calculateTasksHonors(platform, type, tasks);

    if (model === 'fixed') {
        if (!cap || cap < 60) {
            throw new Error('Fixed missions require a cap of at least 60');
        }

        const fixedResult = computeFixed({
            tasksHonorsSum: tasksHonors,
            cap,
            target
        });

        return {
            model: 'fixed',
            totalCostUsd: fixedResult.costHonorsTotal * USD_PER_HONOR,
            totalCostHonors: fixedResult.costHonorsTotal,
            perUserHonors: tasksHonors,
            breakdown: {
                tasksHonors,
                platformFee: fixedResult.costHonorsTotal - fixedResult.rewardHonorsTotal,
                premiumMultiplier: target === 'premium' ? 5 : undefined
            }
        };
    } else if (model === 'degen') {
        if (!durationHours || !winnersCap) {
            throw new Error('Degen missions require durationHours and winnersCap');
        }

        const degenResult = computeDegen({
            hours: durationHours,
            winnersCap,
            target,
            taskCount: tasks.length || 1
        });

        return {
            model: 'degen',
            totalCostUsd: degenResult.totalCostUsd,
            totalCostHonors: degenResult.totalCostUsd * HONORS_PER_USD,
            userPoolHonors: degenResult.userPoolHonors,
            perWinnerHonors: degenResult.perWinnerHonors,
            breakdown: {
                tasksHonors,
                platformFee: degenResult.totalCostUsd * 0.5, // 50% goes to platform
                premiumMultiplier: target === 'premium' ? 5 : undefined
            }
        };
    }

    throw new Error(`Unsupported mission model: ${model}`);
}

/**
 * Validate degen mission parameters
 * @param durationHours - Duration in hours
 * @param winnersCap - Number of winners
 * @returns Validation result
 */
export function validateDegenMission(durationHours: number, winnersCap: number) {
    const preset = getPresetByHours(durationHours);

    if (!preset) {
        return {
            isValid: false,
            maxWinners: 0,
            error: `Invalid duration: ${durationHours} hours`
        };
    }

    if (winnersCap < 1 || winnersCap > preset.maxWinners) {
        return {
            isValid: false,
            preset,
            maxWinners: preset.maxWinners,
            error: `Winners cap must be between 1 and ${preset.maxWinners}`
        };
    }

    return {
        isValid: true,
        preset,
        maxWinners: preset.maxWinners
    };
}
