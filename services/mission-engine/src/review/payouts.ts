// Reviewer payout calculations for decentralized review system

/**
 * Calculate reviewer payout for fixed missions
 * Each reviewer earns 150 honors per completed review
 * @param perUserHonors - Honors per user for the mission
 * @returns Honors to pay to each reviewer
 */
export function reviewerPayoutFixed(perUserHonors: number): number {
    return 150; // Fixed reward per review
}

/**
 * Calculate reviewer payout for degen missions per reviewer
 * Each reviewer earns 150 honors per completed review
 * @param winnerHonors - Honors awarded to the winner
 * @returns Honors to pay to each reviewer
 */
export function reviewerPayoutDegenPerReviewer(winnerHonors: number): number {
    return 150; // Fixed reward per review
}

/**
 * Calculate total reviewer payouts for a degen mission
 * @param winnerHonors - Honors awarded to each winner
 * @param winnersCount - Number of winners
 * @returns Total honors to distribute among all reviewers
 */
export function totalReviewerPayoutsDegen(winnerHonors: number, winnersCount: number): number {
    return 150 * 5; // 5 reviewers × 150 honors each
}

/**
 * Calculate individual reviewer payouts for a degen mission
 * @param winnerHonors - Honors awarded to each winner
 * @param winnersCount - Number of winners
 * @returns Array of honors to pay to each of the 5 reviewers
 */
export function individualReviewerPayoutsDegen(winnerHonors: number, winnersCount: number): number[] {
    return Array(5).fill(150); // Each reviewer gets 150 honors
}

/**
 * Calculate total platform fee share going to reviewers
 * @param totalMissionHonors - Total honors for the mission
 * @param missionModel - 'fixed' or 'degen'
 * @param winnersCount - Number of winners (for degen missions)
 * @returns Total honors going to reviewers
 */
export function totalReviewerShare(
    totalMissionHonors: number,
    missionModel: 'fixed' | 'degen',
    winnersCount: number = 1
): number {
    // Each mission requires 5 reviews, each reviewer gets 150 honors
    return 150 * 5; // 750 honors total for reviewers
}
