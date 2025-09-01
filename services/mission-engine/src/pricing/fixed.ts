import type { TargetProfile } from '@ensei/shared-types';
import { PREMIUM_COST_MULTIPLIER } from './constants';

export interface FixedPricingInput {
    tasksHonorsSum: number;
    cap: number;
    target: TargetProfile;
}

export interface FixedPricingResult {
    rewardHonorsTotal: number;
    costHonorsTotal: number;
}

/**
 * Compute fixed mission pricing
 * @param input - Fixed mission pricing parameters
 * @returns Pricing result with reward and cost totals
 */
export function computeFixed(input: FixedPricingInput): FixedPricingResult {
    const { tasksHonorsSum, cap, target } = input;

    // Calculate total reward honors (per user * cap)
    const rewardHonorsTotal = Math.round(tasksHonorsSum * cap);

    // Calculate total cost honors (reward * 2 for platform fee)
    let costHonorsTotal = rewardHonorsTotal * 2;

    // Apply premium multiplier if target is premium
    if (target === 'premium') {
        costHonorsTotal = Math.round(costHonorsTotal * PREMIUM_COST_MULTIPLIER);
    }

    return {
        rewardHonorsTotal,
        costHonorsTotal
    };
}
