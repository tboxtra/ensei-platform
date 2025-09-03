// HTTP Ping Verifier
// Verifies that a website is accessible and responds

import type { ApiVerifier, VerificationResult } from './index';

export const httpPingVerifier: ApiVerifier = {
    key: 'http_ping',
    name: 'HTTP Ping',
    description: 'Verifies that a website is accessible and responds',

    async verify(data: any): Promise<VerificationResult> {
        try {
            const { url, expectedStatus = 200, timeout = 5000 } = data;

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

            // Make HTTP request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch(url, {
                    method: 'HEAD',
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; EnseiBot/1.0)'
                    }
                });

                clearTimeout(timeoutId);

                const isValid = response.status === expectedStatus;
                const score = isValid ? 100 : Math.max(0, 100 - Math.abs(response.status - expectedStatus) * 10);

                return {
                    isValid,
                    score,
                    metadata: {
                        status: response.status,
                        statusText: response.statusText,
                        headers: Object.fromEntries(response.headers.entries()),
                        url: response.url
                    }
                };

            } catch (fetchError) {
                clearTimeout(timeoutId);

                if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                    return {
                        isValid: false,
                        score: 0,
                        error: 'Request timed out'
                    };
                }

                return {
                    isValid: false,
                    score: 0,
                    error: `HTTP request failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
                };
            }

        } catch (error) {
            return {
                isValid: false,
                score: 0,
                error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
};


