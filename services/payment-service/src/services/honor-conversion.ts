import { HONORS_PER_USD, USD_PER_HONOR } from '@ensei/shared-types';

/**
 * Convert Honors to USD
 * @param honors Amount in Honors
 * @returns USD amount
 */
export function honorsToUsd(honors: number): number {
  return honors * USD_PER_HONOR;
}

/**
 * Convert USD to Honors
 * @param usd Amount in USD
 * @returns Honors amount
 */
export function usdToHonors(usd: number): number {
  return Math.round(usd * HONORS_PER_USD);
}

/**
 * Format Honors as USD string
 * @param honors Amount in Honors
 * @returns Formatted USD string
 */
export function formatHonorsAsUsd(honors: number): string {
  return `$${honorsToUsd(honors).toFixed(2)}`;
}

/**
 * Format USD as Honors string
 * @param usd Amount in USD
 * @returns Formatted Honors string
 */
export function formatUsdAsHonors(usd: number): string {
  return `${usdToHonors(usd).toLocaleString()} Honors`;
}
