// ============================================================================
// PRICING CONSTANTS
// ============================================================================

/**
 * Exchange rate: 1 USD = 450 Honors
 */
export const HONORS_PER_USD = 450 as const;

/**
 * Exchange rate: 1 Honor = 1/450 USD
 */
export const USD_PER_HONOR = 1 / HONORS_PER_USD;

/**
 * Premium missions cost 5x more than regular missions
 */
export const PREMIUM_COST_MULTIPLIER = 5 as const;

/**
 * For Degen missions, 50% of creator cost goes to user pool
 */
export const USER_POOL_FACTOR = 0.5 as const;

/**
 * Platform fee rate (100% fee)
 */
export const PLATFORM_FEE_RATE = 1.0 as const;

// ============================================================================
// DEGEN DURATION PRESETS
// ============================================================================

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
export const DEGEN_PRESETS: readonly DegenDurationPreset[] = [
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
] as const;

// ============================================================================
// AUDIENCE PRESETS
// ============================================================================

export interface AudiencePreset {
  readonly name: string;
  readonly hours: number;
  readonly description: string;
}

/**
 * Audience size presets mapped to Degen durations
 */
export const AUDIENCE_PRESETS: readonly AudiencePreset[] = [
  { name: 'Starter', hours: 1, description: 'Quick test mission' },
  { name: 'Small', hours: 12, description: 'Small community engagement' },
  { name: 'Medium', hours: 36, description: 'Moderate reach campaign' },
  { name: 'Large', hours: 96, description: 'Wide audience campaign' },
  { name: 'Complete', hours: 240, description: 'Maximum reach campaign' }
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get Degen preset by hours
 */
export function getDegenPresetByHours(hours: number): DegenDurationPreset | undefined {
  return DEGEN_PRESETS.find(preset => preset.hours === hours);
}

/**
 * Get Degen preset by label
 */
export function getDegenPresetByLabel(label: string): DegenDurationPreset | undefined {
  return DEGEN_PRESETS.find(preset => preset.label === label);
}

/**
 * Get audience preset by name
 */
export function getAudiencePresetByName(name: string): AudiencePreset | undefined {
  return AUDIENCE_PRESETS.find(preset => preset.name === name);
}

/**
 * Convert USD to Honors
 */
export function usdToHonors(usd: number): number {
  return Math.round(usd * HONORS_PER_USD);
}

/**
 * Convert Honors to USD
 */
export function honorsToUsd(honors: number): number {
  return honors * USD_PER_HONOR;
}

/**
 * Calculate Degen mission costs
 */
export function calculateDegenCosts(
  baseCostUSD: number,
  premium: boolean,
  winnersCap: number,
  taskCount: number = 1
): {
  totalCostUSD: number;
  userPoolHonors: number;
  perWinnerHonors: number;
} {
  // Base cost increases by duration amount for each additional task
  const adjustedCostUSD = baseCostUSD + (baseCostUSD * (taskCount - 1));
  const totalCostUSD = premium ? adjustedCostUSD * PREMIUM_COST_MULTIPLIER : adjustedCostUSD;

  // 50% of total cost goes to user pool
  const userPoolUSD = totalCostUSD * USER_POOL_FACTOR;
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
export function calculateFixedCosts(
  baseHonors: number,
  premium: boolean,
  cap: number
): {
  perUserHonors: number;
  totalHonors: number;
  totalUSD: number;
} {
  // Apply platform fee (100%)
  const withPlatformFee = baseHonors * (1 + PLATFORM_FEE_RATE);

  // Apply premium multiplier if applicable
  const perUserHonors = premium
    ? Math.ceil(withPlatformFee * PREMIUM_COST_MULTIPLIER)
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
export function validateDegenPresets(): boolean {
  for (let i = 1; i < DEGEN_PRESETS.length; i++) {
    const prev = DEGEN_PRESETS[i - 1];
    const curr = DEGEN_PRESETS[i];

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
export function validateAudiencePresets(): boolean {
  return AUDIENCE_PRESETS.every(preset => {
    return DEGEN_PRESETS.some(degen => degen.hours === preset.hours);
  });
}
