export const HONORS_PER_USD = 450 as const;
export const usdToHonors = (usd: number) => Math.round(usd * HONORS_PER_USD);

export function getFixedMissionPriceUSD(cap: number) {
    if (cap <= 100) return 10;
    if (cap <= 200) return 15;
    return 25;
}