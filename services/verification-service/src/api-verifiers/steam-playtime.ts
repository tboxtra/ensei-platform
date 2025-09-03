// Steam Playtime Verifier (Placeholder)
// Verifies Steam game playtime

import type { ApiVerifier, VerificationResult } from './index';

export const steamPlaytimeVerifier: ApiVerifier = {
    key: 'steam_playtime',
    name: 'Steam Playtime',
    description: 'Verifies Steam game playtime (placeholder implementation)',

    async verify(data: any): Promise<VerificationResult> {
        try {
            const { gameId, minPlaytime = 0, steamProfileUrl } = data;

            if (!gameId && !steamProfileUrl) {
                return {
                    isValid: false,
                    score: 0,
                    error: 'Either gameId or steamProfileUrl is required'
                };
            }

            // For demo purposes, simulate verification
            // In production, this would integrate with Steam Web API
            const simulatedResult = {
                isValid: true,
                score: 90,
                metadata: {
                    gameId: gameId || 'unknown',
                    playtime: Math.floor(Math.random() * 100) + 10, // 10-110 minutes
                    lastPlayed: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
                    gameName: 'Sample Game',
                    steamProfileUrl: steamProfileUrl || 'https://steamcommunity.com/id/sample',
                    error: undefined as string | undefined
                }
            };

            // Check if minimum playtime requirement is met
            if (minPlaytime > 0 && simulatedResult.metadata.playtime < minPlaytime) {
                simulatedResult.isValid = false;
                simulatedResult.score = Math.max(0, simulatedResult.score - 40);
                simulatedResult.metadata.error = `Insufficient playtime: ${simulatedResult.metadata.playtime}m < ${minPlaytime}m`;
            }

            return simulatedResult;

        } catch (error) {
            return {
                isValid: false,
                score: 0,
                error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
};
