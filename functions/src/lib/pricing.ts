export const HONORS_PER_USD = 450 as const;

export function getFixedMissionPriceUSD(cap: number): number {
    if (cap <= 100) return 10;
    if (cap <= 200) return 15;
    return 25; // 500
}

export function usdToHonors(usd: number) {
    return Math.round(usd * HONORS_PER_USD);
}
