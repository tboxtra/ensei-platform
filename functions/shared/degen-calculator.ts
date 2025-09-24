/**
 * Degen mission payout calculator
 * Handles winner selection and honors distribution for degen missions
 */

export interface DegenWinner {
    userId: string;
    taskId: string;
    payout: number;
}

export interface DegenPayoutResult {
    totalWinners: number;
    totalPayout: number;
    winners: DegenWinner[];
}

/**
 * Calculate degen mission payouts based on winners and mission data
 */
export function calculateDegenPayouts(
    missionId: string,
    winners: Array<{ userId: string; taskId: string }>,
    missionData: any
): DegenPayoutResult {
    const totalPayout = missionData.rewards?.honors || 0;
    const totalWinners = winners.length;
    
    if (totalWinners === 0) {
        return {
            totalWinners: 0,
            totalPayout: 0,
            winners: []
        };
    }

    // For degen missions, split the total payout equally among winners
    const payoutPerWinner = Math.floor(totalPayout / totalWinners);
    const remainder = totalPayout % totalWinners;

    const degenWinners: DegenWinner[] = winners.map((winner, index) => {
        // Distribute remainder to first few winners
        const payout = payoutPerWinner + (index < remainder ? 1 : 0);
        
        return {
            userId: winner.userId,
            taskId: winner.taskId,
            payout
        };
    });

    return {
        totalWinners,
        totalPayout,
        winners: degenWinners
    };
}

/**
 * Validate degen payout calculation
 */
export function validateDegenPayouts(result: DegenPayoutResult): boolean {
    if (result.totalWinners === 0) {
        return result.totalPayout === 0 && result.winners.length === 0;
    }

    // Check that total payout matches sum of individual payouts
    const calculatedTotal = result.winners.reduce((sum, winner) => sum + winner.payout, 0);
    
    if (calculatedTotal !== result.totalPayout) {
        console.error(`Degen payout validation failed: calculated=${calculatedTotal}, expected=${result.totalPayout}`);
        return false;
    }

    // Check that we have the right number of winners
    if (result.winners.length !== result.totalWinners) {
        console.error(`Degen winner count validation failed: winners=${result.winners.length}, expected=${result.totalWinners}`);
        return false;
    }

    return true;
}

