/**
 * Exchange rate: 1 USD = 450 Honors
 */
export declare const HONORS_PER_USD: 450;
/**
 * Exchange rate: 1 Honor = 1/450 USD
 */
export declare const USD_PER_HONOR: number;
/**
 * Premium missions cost 5x more than regular missions
 */
export declare const PREMIUM_COST_MULTIPLIER: 5;
/**
 * For Degen missions, 50% of creator cost goes to user pool
 */
export declare const USER_POOL_FACTOR: 0.5;
/**
 * Platform fee rate (100% fee)
 */
export declare const PLATFORM_FEE_RATE: 1;
export interface DegenDurationPreset {
    readonly hours: number;
    readonly costUSD: number;
    readonly maxWinners: number;
    readonly label: string;
}
/**
 * Authoritative table of Degen mission duration presets
 * Each preset defines the cost in USD and maximum number of winners
 */
export declare const DEGEN_PRESETS: readonly DegenDurationPreset[];
export interface AudiencePreset {
    readonly name: string;
    readonly hours: number;
    readonly description: string;
}
/**
 * Audience size presets mapped to Degen durations
 */
export declare const AUDIENCE_PRESETS: readonly AudiencePreset[];
/**
 * Get Degen preset by hours
 */
export declare function getDegenPresetByHours(hours: number): DegenDurationPreset | undefined;
/**
 * Get Degen preset by label
 */
export declare function getDegenPresetByLabel(label: string): DegenDurationPreset | undefined;
/**
 * Get audience preset by name
 */
export declare function getAudiencePresetByName(name: string): AudiencePreset | undefined;
/**
 * Convert USD to Honors
 */
export declare function usdToHonors(usd: number): number;
/**
 * Convert Honors to USD
 */
export declare function honorsToUsd(honors: number): number;
/**
 * Calculate Degen mission costs
 */
export declare function calculateDegenCosts(baseCostUSD: number, premium: boolean, winnersCap: number, taskCount?: number): {
    totalCostUSD: number;
    userPoolHonors: number;
    perWinnerHonors: number;
};
/**
 * Calculate Fixed mission costs
 */
export declare function calculateFixedCosts(baseHonors: number, premium: boolean, cap: number): {
    perUserHonors: number;
    totalHonors: number;
    totalUSD: number;
};
/**
 * Validate that all presets are properly ordered
 */
export declare function validateDegenPresets(): boolean;
/**
 * Validate that audience presets map to valid Degen durations
 */
export declare function validateAudiencePresets(): boolean;
