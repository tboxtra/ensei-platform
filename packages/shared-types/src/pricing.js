"use strict";
// ============================================================================
// PRICING CONSTANTS
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIENCE_PRESETS = exports.DEGEN_PRESETS = exports.PLATFORM_FEE_RATE = exports.USER_POOL_FACTOR = exports.PREMIUM_COST_MULTIPLIER = exports.USD_PER_HONOR = exports.HONORS_PER_USD = void 0;
exports.getDegenPresetByHours = getDegenPresetByHours;
exports.getDegenPresetByLabel = getDegenPresetByLabel;
exports.getAudiencePresetByName = getAudiencePresetByName;
exports.usdToHonors = usdToHonors;
exports.honorsToUsd = honorsToUsd;
exports.calculateDegenCosts = calculateDegenCosts;
exports.calculateFixedCosts = calculateFixedCosts;
exports.validateDegenPresets = validateDegenPresets;
exports.validateAudiencePresets = validateAudiencePresets;
/**
 * Exchange rate: 1 USD = 450 Honors
 */
exports.HONORS_PER_USD = 450;
/**
 * Exchange rate: 1 Honor = 1/450 USD
 */
exports.USD_PER_HONOR = 1 / exports.HONORS_PER_USD;
/**
 * Premium missions cost 5x more than regular missions
 */
exports.PREMIUM_COST_MULTIPLIER = 5;
/**
 * For Degen missions, 50% of creator cost goes to user pool
 */
exports.USER_POOL_FACTOR = 0.5;
/**
 * Platform fee rate (100% fee)
 */
exports.PLATFORM_FEE_RATE = 1.0;
/**
 * Authoritative table of Degen mission duration presets
 * Each preset defines the cost in USD and maximum number of winners
 */
exports.DEGEN_PRESETS = [
    { hours: 1, costUSD: 15, maxWinners: 1, label: '1h' },
    { hours: 3, costUSD: 30, maxWinners: 2, label: '3h' },
    { hours: 6, costUSD: 80, maxWinners: 3, label: '6h' },
    { hours: 8, costUSD: 150, maxWinners: 3, label: '8h' },
    { hours: 12, costUSD: 180, maxWinners: 5, label: '12h' },
    { hours: 18, costUSD: 300, maxWinners: 5, label: '18h' },
    { hours: 24, costUSD: 400, maxWinners: 5, label: '24h' },
    { hours: 36, costUSD: 500, maxWinners: 10, label: '36h' },
    { hours: 48, costUSD: 600, maxWinners: 10, label: '48h' },
    { hours: 72, costUSD: 800, maxWinners: 10, label: '3d' },
    { hours: 96, costUSD: 1000, maxWinners: 10, label: '4d' },
    { hours: 168, costUSD: 1500, maxWinners: 10, label: '7d' },
    { hours: 240, costUSD: 2000, maxWinners: 10, label: '10d' }
];
/**
 * Audience size presets mapped to Degen durations
 */
exports.AUDIENCE_PRESETS = [
    { name: 'Starter', hours: 1, description: 'Quick test mission' },
    { name: 'Small', hours: 12, description: 'Small community engagement' },
    { name: 'Medium', hours: 36, description: 'Moderate reach campaign' },
    { name: 'Large', hours: 96, description: 'Wide audience campaign' },
    { name: 'Complete', hours: 240, description: 'Maximum reach campaign' }
];
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Get Degen preset by hours
 */
function getDegenPresetByHours(hours) {
    return exports.DEGEN_PRESETS.find(preset => preset.hours === hours);
}
/**
 * Get Degen preset by label
 */
function getDegenPresetByLabel(label) {
    return exports.DEGEN_PRESETS.find(preset => preset.label === label);
}
/**
 * Get audience preset by name
 */
function getAudiencePresetByName(name) {
    return exports.AUDIENCE_PRESETS.find(preset => preset.name === name);
}
/**
 * Convert USD to Honors
 */
function usdToHonors(usd) {
    return Math.round(usd * exports.HONORS_PER_USD);
}
/**
 * Convert Honors to USD
 */
function honorsToUsd(honors) {
    return honors * exports.USD_PER_HONOR;
}
/**
 * Calculate Degen mission costs
 */
function calculateDegenCosts(baseCostUSD, premium, winnersCap, taskCount = 1) {
    // Base cost increases by duration amount for each additional task
    const adjustedCostUSD = baseCostUSD + (baseCostUSD * (taskCount - 1));
    const totalCostUSD = premium ? adjustedCostUSD * exports.PREMIUM_COST_MULTIPLIER : adjustedCostUSD;
    // 50% of total cost goes to user pool
    const userPoolUSD = totalCostUSD * exports.USER_POOL_FACTOR;
    const userPoolHonors = usdToHonors(userPoolUSD);
    // Per-winner honors = pool / winners
    const perWinnerHonors = Math.floor(userPoolHonors / winnersCap);
    return {
        totalCostUSD,
        userPoolHonors,
        perWinnerHonors
    };
}
/**
 * Calculate Fixed mission costs
 */
function calculateFixedCosts(baseHonors, premium, cap) {
    // Apply platform fee (100%)
    const withPlatformFee = baseHonors * (1 + exports.PLATFORM_FEE_RATE);
    // Apply premium multiplier if applicable
    const perUserHonors = premium
        ? Math.ceil(withPlatformFee * exports.PREMIUM_COST_MULTIPLIER)
        : Math.ceil(withPlatformFee);
    const totalHonors = perUserHonors * cap;
    const totalUSD = honorsToUsd(totalHonors);
    return {
        perUserHonors,
        totalHonors,
        totalUSD
    };
}
// ============================================================================
// VALIDATION
// ============================================================================
/**
 * Validate that all presets are properly ordered
 */
function validateDegenPresets() {
    for (let i = 1; i < exports.DEGEN_PRESETS.length; i++) {
        const prev = exports.DEGEN_PRESETS[i - 1];
        const curr = exports.DEGEN_PRESETS[i];
        // Hours should be strictly increasing
        if (curr.hours <= prev.hours) {
            return false;
        }
        // Cost should be strictly increasing
        if (curr.costUSD <= prev.costUSD) {
            return false;
        }
        // Max winners should be non-decreasing
        if (curr.maxWinners < prev.maxWinners) {
            return false;
        }
    }
    return true;
}
/**
 * Validate that audience presets map to valid Degen durations
 */
function validateAudiencePresets() {
    return exports.AUDIENCE_PRESETS.every(preset => {
        return exports.DEGEN_PRESETS.some(degen => degen.hours === preset.hours);
    });
}
