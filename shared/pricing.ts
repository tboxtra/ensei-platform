// Shared pricing constants for mission creation
// Used by both functions and web to ensure consistency

export interface MissionPricing {
    likes: number;
    priceUsd: number;
}

export const MISSION_PRICING_MAP: Record<number, MissionPricing> = {
    100: { likes: 100, priceUsd: 10 },
    200: { likes: 200, priceUsd: 15 },
    500: { likes: 500, priceUsd: 25 }
};

export function getMissionPrice(likes: number): number {
    const pricing = MISSION_PRICING_MAP[likes];
    if (!pricing) {
        throw new Error(`No pricing found for ${likes} likes`);
    }
    return pricing.priceUsd;
}

export function getMissionLikes(priceUsd: number): number {
    const entry = Object.entries(MISSION_PRICING_MAP).find(
        ([_, pricing]) => pricing.priceUsd === priceUsd
    );
    if (!entry) {
        throw new Error(`No likes found for $${priceUsd} price`);
    }
    return parseInt(entry[0]);
}

export function isValidMissionPricing(likes: number, priceUsd: number): boolean {
    const pricing = MISSION_PRICING_MAP[likes];
    return pricing ? pricing.priceUsd === priceUsd : false;
}

