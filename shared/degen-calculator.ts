/**
 * Degen mission payout calculator
 * Handles winner selection and honors distribution for degen missions
 */

import { getFixedTaskHonors } from './honors';

export interface DegenWinner {
    userId: string;
    taskId: string;
    missionId: string;
    payout: number;
}

export interface DegenMissionResult {
    missionId: string;
    totalWinners: number;
    totalPayout: number;
    winners: DegenWinner[];
}

/**
 * Calculate degen mission payouts when winners are chosen
 * @param missionId - The degen mission ID
 * @param winners - Array of winner data with userId, taskId, missionId
 * @param missionData - Mission data containing type and rewards
 * @returns DegenMissionResult with payout calculations
 */
export function calculateDegenPayouts(
    missionId: string,
    winners: Array<{ userId: string; taskId: string }>,
    missionData: any
): DegenMissionResult {
    const result: DegenMissionResult = {
        missionId,
        totalWinners: 0,
        totalPayout: 0,
        winners: []
    };

    // Only process if this is actually a degen mission
    if (missionData.type !== 'degen') {
        console.warn(`Mission ${missionId} is not a degen mission, skipping payout calculation`);
        return result;
    }

    // Process each winner
    for (const winner of winners) {
        const taskId = winner.taskId.toLowerCase();

        // Use fixed task honors for degen missions too (or custom payout if specified)
        let payout = getFixedTaskHonors(taskId);

        // If mission has custom degen payouts, use those instead
        if (missionData.degenRewards && missionData.degenRewards[taskId]) {
            payout = missionData.degenRewards[taskId];
        }

        // If mission has winner-specific payout, use that
        if (missionData.winnerPayout) {
            payout = missionData.winnerPayout;
        }

        if (payout > 0) {
            result.winners.push({
                userId: winner.userId,
                taskId,
                missionId,
                payout
            });

            result.totalPayout += payout;
            result.totalWinners += 1;
        } else {
            console.warn(`No payout defined for degen winner task: ${taskId}`, { missionId, userId: winner.userId });
        }
    }

    return result;
}

/**
 * Validate degen mission payout calculation
 * @param result - The calculated degen mission result
 * @returns True if validation passes
 */
export function validateDegenPayouts(result: DegenMissionResult): boolean {
    // Basic validation checks
    if (result.totalWinners === 0 && result.totalPayout > 0) {
        console.error('Degen payout validation failed: totalPayout > 0 but no winners', result);
        return false;
    }

    if (result.totalWinners > 0 && result.totalPayout === 0) {
        console.error('Degen payout validation failed: winners exist but totalPayout is 0', result);
        return false;
    }

    // Check individual winner payouts
    const calculatedTotal = result.winners.reduce((sum, winner) => sum + winner.payout, 0);
    if (Math.abs(calculatedTotal - result.totalPayout) > 0.01) { // Allow for floating point precision
        console.error('Degen payout validation failed: calculated total mismatch', {
            calculated: calculatedTotal,
            reported: result.totalPayout,
            result
        });
        return false;
    }

    return true;
}

/**
 * Get degen mission statistics for admin reporting
 * @param results - Array of degen mission results
 * @returns Statistics summary
 */
export function getDegenMissionStats(results: DegenMissionResult[]) {
    const stats = {
        totalMissions: results.length,
        totalWinners: 0,
        totalPayout: 0,
        averagePayoutPerWinner: 0,
        missionsByPayoutRange: {
            low: 0,    // 0-1000
            medium: 0, // 1001-5000
            high: 0    // 5000+
        }
    };

    for (const result of results) {
        stats.totalWinners += result.totalWinners;
        stats.totalPayout += result.totalPayout;

        if (result.totalPayout <= 1000) {
            stats.missionsByPayoutRange.low += 1;
        } else if (result.totalPayout <= 5000) {
            stats.missionsByPayoutRange.medium += 1;
        } else {
            stats.missionsByPayoutRange.high += 1;
        }
    }

    if (stats.totalWinners > 0) {
        stats.averagePayoutPerWinner = stats.totalPayout / stats.totalWinners;
    }

    return stats;
}
