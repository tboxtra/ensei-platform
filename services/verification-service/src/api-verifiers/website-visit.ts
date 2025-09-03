// Website Visit Verifier
// Verifies that a user has visited a specific website

import type { ApiVerifier, VerificationResult } from './index';

export const websiteVisitVerifier: ApiVerifier = {
    key: 'website_visit',
    name: 'Website Visit',
    description: 'Verifies that a user has visited a specific website',

    async verify(data: any): Promise<VerificationResult> {
        try {
            const { url, requiredElements, minTimeOnPage = 0 } = data;

            if (!url || typeof url !== 'string') {
                return {
                    isValid: false,
                    score: 0,
                    error: 'URL is required and must be a string'
                };
            }

            // Validate URL format
            try {
                new URL(url);
            } catch {
                return {
                    isValid: false,
                    score: 0,
                    error: 'Invalid URL format'
                };
            }

            // For demo purposes, simulate verification
            // In production, this would integrate with browser extensions or tracking systems
            const simulatedResult = {
                isValid: true,
                score: 85, // Simulated score
                metadata: {
                    url,
                    visitTimestamp: new Date().toISOString(),
                    timeOnPage: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
                    pageTitle: 'Sample Page Title',
                    elementsFound: requiredElements ? requiredElements.length : 0,
                    userAgent: 'Mozilla/5.0 (compatible; EnseiBot/1.0)',
                    error: undefined as string | undefined
                }
            };

            // Check if minimum time requirement is met
            if (minTimeOnPage > 0 && simulatedResult.metadata.timeOnPage < minTimeOnPage) {
                simulatedResult.isValid = false;
                simulatedResult.score = Math.max(0, simulatedResult.score - 30);
                simulatedResult.metadata.error = `Insufficient time on page: ${simulatedResult.metadata.timeOnPage}s < ${minTimeOnPage}s`;
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
