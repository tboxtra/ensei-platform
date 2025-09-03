// Custom platform fixed mission pricing logic
// Honors calculation based on time and platform fees

// Constants from shared types
const HONORS_PER_USD = 450;
const PLATFORM_FEE_RATE = 1.0; // 100%
const PREMIUM_COST_MULTIPLIER = 5;

/**
 * Calculate honors for custom fixed missions based on time
 * @param avgTimeMinutes - Average time to complete the task in minutes
 * @param premium - Whether this is a premium mission
 * @returns Total honors per user including platform fees
 */
export function honorsForCustomFixed(avgTimeMinutes: number, premium: boolean): number {
    // Base calculation: $8/hour rate
    const usd = (avgTimeMinutes / 60) * 8;

    // Convert to base honors
    const baseHonors = Math.round(usd * HONORS_PER_USD);

    // Apply platform fee (100%)
    const withFee = Math.round(baseHonors * (1 + PLATFORM_FEE_RATE));

    // Apply premium multiplier if applicable
    return premium ? withFee * PREMIUM_COST_MULTIPLIER : withFee;
}

/**
 * Calculate USD cost for custom fixed missions
 * @param avgTimeMinutes - Average time to complete the task in minutes
 * @param premium - Whether this is a premium mission
 * @returns Total USD cost per user
 */
export function usdForCustomFixed(avgTimeMinutes: number, premium: boolean): number {
    const usd = (avgTimeMinutes / 60) * 8;
    const withFee = usd * (1 + PLATFORM_FEE_RATE);
    return premium ? withFee * PREMIUM_COST_MULTIPLIER : withFee;
}

/**
 * Get time-based pricing breakdown for custom missions
 * @param avgTimeMinutes - Average time to complete the task in minutes
 * @returns Pricing breakdown object
 */
export function getCustomFixedPricing(avgTimeMinutes: number) {
    const baseUsd = (avgTimeMinutes / 60) * 8;
    const platformFee = baseUsd * PLATFORM_FEE_RATE;
    const totalUsd = baseUsd + platformFee;

    return {
        baseUsd: Math.round(baseUsd * 100) / 100,
        platformFee: Math.round(platformFee * 100) / 100,
        totalUsd: Math.round(totalUsd * 100) / 100,
        baseHonors: Math.round(baseUsd * HONORS_PER_USD),
        totalHonors: Math.round(totalUsd * HONORS_PER_USD)
    };
}

