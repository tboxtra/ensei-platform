import type { TargetProfile, DegenDurationPreset } from '@ensei/shared-types';
import {
    DEGEN_PRESETS,
    getDegenPresetByHours as getPresetByHoursShared,
    HONORS_PER_USD,
    USER_POOL_FACTOR,
    PREMIUM_COST_MULTIPLIER
} from './constants';

export interface DegenPricingInput {
    hours: number;
    winnersCap: number;
    target: TargetProfile;
    taskCount: number;
}

export interface DegenPricingResult {
    totalCostUsd: number;
    userPoolHonors: number;
    perWinnerHonors: number;
}

/**
 * Get degen preset by hours
 * @param hours - Duration in hours
 * @returns Degen duration preset or undefined if not found
 */
export function getPresetByHours(hours: number): DegenDurationPreset | undefined {
    return getPresetByHoursShared(hours);
}

/**
 * Compute degen mission pricing
 * @param input - Degen mission pricing parameters
 * @returns Pricing result with cost and honors breakdown
 */
export function computeDegen(input: DegenPricingInput): DegenPricingResult {
    const { hours, winnersCap, target, taskCount } = input;

    // Get the preset for the given hours
    const preset = getPresetByHours(hours);
    if (!preset) {
        throw new Error(`Invalid duration: ${hours} hours`);
    }

    // Calculate base cost with task count multiplier
    // C = preset.costUSD * (target==='premium' ? 5 : 1) * (taskCount >= 1 ? taskCount : 1)
    const baseCost = preset.costUSD;
    const premiumMultiplier = target === 'premium' ? PREMIUM_COST_MULTIPLIER : 1;
    const taskMultiplier = taskCount >= 1 ? taskCount : 1;

    const totalCostUsd = baseCost * premiumMultiplier * taskMultiplier;

    // Calculate user pool honors
    // userPoolHonors = round(C * HONORS_PER_USD * USER_POOL_FACTOR)
    const userPoolHonors = Math.round(totalCostUsd * HONORS_PER_USD * USER_POOL_FACTOR);

    // Calculate per winner honors
    // perWinnerHonors = floor(userPoolHonors / winnersCap)
    const perWinnerHonors = Math.floor(userPoolHonors / winnersCap);

    return {
        totalCostUsd,
        userPoolHonors,
        perWinnerHonors
    };
}
