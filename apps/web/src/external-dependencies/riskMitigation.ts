/**
 * External Dependencies Risk Mitigation
 * Industry Standard: Flexible URL parsing, multiple validation methods, and fallback mechanisms
 */

import { config } from '../config/environment';

// Platform configuration
interface PlatformConfig {
    name: string;
    baseUrls: string[];
    urlPatterns: RegExp[];
    usernamePatterns: RegExp[];
    apiEndpoints?: {
        validate?: string;
        userInfo?: string;
        rateLimit?: number;
    };
    fallbackMethods: string[];
}

// Validation result
interface ValidationResult {
    isValid: boolean;
    platform: string;
    extractedUsername?: string;
    confidence: number;
    method: string;
    error?: string;
    fallbackUsed?: boolean;
}

// Rate limiting for external APIs
class ExternalAPIRateLimiter {
    private limits: Map<string, { count: number; resetTime: number }> = new Map();
    private defaultLimit = 100; // requests per hour
    private defaultWindow = 3600000; // 1 hour

    async checkLimit(service: string, limit?: number, window?: number): Promise<boolean> {
        const key = service;
        const maxRequests = limit || this.defaultLimit;
        const windowMs = window || this.defaultWindow;

        const current = this.limits.get(key);
        const now = Date.now();

        if (!current || now > current.resetTime) {
            this.limits.set(key, { count: 1, resetTime: now + windowMs });
            return true;
        }

        if (current.count >= maxRequests) {
            return false;
        }

        current.count++;
        return true;
    }

    getRemainingRequests(service: string): number {
        const current = this.limits.get(service);
        if (!current) return this.defaultLimit;

        const now = Date.now();
        if (now > current.resetTime) {
            return this.defaultLimit;
        }

        return Math.max(0, this.defaultLimit - current.count);
    }
}

// Platform configurations
const platformConfigs: Map<string, PlatformConfig> = new Map([
    ['twitter', {
        name: 'Twitter/X',
        baseUrls: ['https://twitter.com', 'https://x.com', 'https://www.twitter.com', 'https://www.x.com'],
        urlPatterns: [
            /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/,
            /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+/,
        ],
        usernamePatterns: [
            /^\/([a-zA-Z0-9_]+)/,
            /^@([a-zA-Z0-9_]+)/,
        ],
        apiEndpoints: {
            validate: 'https://api.twitter.com/2/tweets',
            rateLimit: 300, // requests per 15 minutes
        },
        fallbackMethods: ['regex', 'manual'],
    }],
    ['linkedin', {
        name: 'LinkedIn',
        baseUrls: ['https://linkedin.com', 'https://www.linkedin.com'],
        urlPatterns: [
            /^https?:\/\/(www\.)?linkedin\.com\/(in|posts|feed)\/[a-zA-Z0-9_-]+/,
            /^https?:\/\/(www\.)?linkedin\.com\/company\/[a-zA-Z0-9_-]+/,
        ],
        usernamePatterns: [
            /^\/(in|posts|feed)\/([a-zA-Z0-9_-]+)/,
        ],
        apiEndpoints: {
            rateLimit: 100, // requests per hour
        },
        fallbackMethods: ['regex', 'manual'],
    }],
    ['instagram', {
        name: 'Instagram',
        baseUrls: ['https://instagram.com', 'https://www.instagram.com'],
        urlPatterns: [
            /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[a-zA-Z0-9_-]+/,
            /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+/,
        ],
        usernamePatterns: [
            /^\/([a-zA-Z0-9_.]+)/,
        ],
        fallbackMethods: ['regex', 'manual'],
    }],
    ['tiktok', {
        name: 'TikTok',
        baseUrls: ['https://tiktok.com', 'https://www.tiktok.com'],
        urlPatterns: [
            /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+\/video\/\d+/,
            /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+/,
        ],
        usernamePatterns: [
            /^\/@([a-zA-Z0-9_.]+)/,
        ],
        fallbackMethods: ['regex', 'manual'],
    }],
]);

// External dependency risk mitigator
class ExternalDependencyRiskMitigator {
    private rateLimiter: ExternalAPIRateLimiter;
    private fallbackCache: Map<string, ValidationResult> = new Map();
    private healthChecks: Map<string, { healthy: boolean; lastCheck: Date }> = new Map();

    constructor() {
        this.rateLimiter = new ExternalAPIRateLimiter();
        this.initializeHealthChecks();
    }

    private initializeHealthChecks(): void {
        // Initialize health check status for all platforms
        const entries = Array.from(platformConfigs.entries());
        for (const [platform, config] of entries) {
            this.healthChecks.set(platform, { healthy: true, lastCheck: new Date() });
        }
    }

    // Validate URL with multiple methods and fallbacks
    async validateUrl(url: string, expectedUsername?: string): Promise<ValidationResult> {
        const platform = this.detectPlatform(url);
        if (!platform) {
            return {
                isValid: false,
                platform: 'unknown',
                confidence: 0,
                method: 'detection_failed',
                error: 'Platform not recognized',
            };
        }

        const config = platformConfigs.get(platform)!;

        // Try multiple validation methods
        const methods = ['api', 'regex', 'manual'];
        let lastError: string | undefined;

        for (const method of methods) {
            try {
                const result = await this.validateWithMethod(url, platform, method, expectedUsername);
                if (result.isValid) {
                    return result;
                }
                lastError = result.error;
            } catch (error) {
                lastError = String(error);
                continue;
            }
        }

        // All methods failed, return fallback result
        return {
            isValid: false,
            platform,
            confidence: 0,
            method: 'all_methods_failed',
            error: lastError || 'All validation methods failed',
            fallbackUsed: true,
        };
    }

    // Validate with specific method
    private async validateWithMethod(
        url: string,
        platform: string,
        method: string,
        expectedUsername?: string
    ): Promise<ValidationResult> {
        const config = platformConfigs.get(platform)!;

        switch (method) {
            case 'api':
                return await this.validateWithAPI(url, platform, expectedUsername);
            case 'regex':
                return this.validateWithRegex(url, platform, expectedUsername);
            case 'manual':
                return this.validateWithManual(url, platform, expectedUsername);
            default:
                throw new Error(`Unknown validation method: ${method}`);
        }
    }

    // API validation with rate limiting and fallback
    private async validateWithAPI(url: string, platform: string, expectedUsername?: string): Promise<ValidationResult> {
        const config = platformConfigs.get(platform)!;

        if (!config.apiEndpoints?.validate) {
            throw new Error('No API endpoint configured for platform');
        }

        // Check rate limit
        const canMakeRequest = await this.rateLimiter.checkLimit(
            platform,
            config.apiEndpoints.rateLimit,
            900000 // 15 minutes
        );

        if (!canMakeRequest) {
            throw new Error('Rate limit exceeded for API validation');
        }

        // Check platform health
        const health = this.healthChecks.get(platform);
        if (!health?.healthy) {
            throw new Error('Platform API is unhealthy');
        }

        try {
            // Make API request with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(config.apiEndpoints.validate, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.TWITTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();

            // Update health status
            this.healthChecks.set(platform, { healthy: true, lastCheck: new Date() });

            return {
                isValid: true,
                platform,
                extractedUsername: this.extractUsernameFromAPIResponse(data, platform) || undefined,
                confidence: 0.9,
                method: 'api',
            };

        } catch (error) {
            // Update health status
            this.healthChecks.set(platform, { healthy: false, lastCheck: new Date() });
            throw error;
        }
    }

    // Regex validation
    private validateWithRegex(url: string, platform: string, expectedUsername?: string): ValidationResult {
        const config = platformConfigs.get(platform)!;

        // Check if URL matches platform patterns
        const matchesPattern = config.urlPatterns.some(pattern => pattern.test(url));
        if (!matchesPattern) {
            return {
                isValid: false,
                platform,
                confidence: 0,
                method: 'regex',
                error: 'URL does not match platform patterns',
            };
        }

        // Extract username
        const extractedUsername = this.extractUsernameFromUrl(url, platform);
        if (!extractedUsername) {
            return {
                isValid: false,
                platform,
                confidence: 0,
                method: 'regex',
                error: 'Could not extract username from URL',
            };
        }

        // Validate against expected username if provided
        if (expectedUsername && extractedUsername !== expectedUsername) {
            return {
                isValid: false,
                platform,
                extractedUsername,
                confidence: 0.7,
                method: 'regex',
                error: 'Username mismatch',
            };
        }

        return {
            isValid: true,
            platform,
            extractedUsername,
            confidence: 0.8,
            method: 'regex',
        };
    }

    // Manual validation (fallback)
    private validateWithManual(url: string, platform: string, expectedUsername?: string): ValidationResult {
        const config = platformConfigs.get(platform)!;

        // Basic URL structure validation
        try {
            const urlObj = new URL(url);
            const isValidDomain = config.baseUrls.some(baseUrl =>
                urlObj.hostname === new URL(baseUrl).hostname
            );

            if (!isValidDomain) {
                return {
                    isValid: false,
                    platform,
                    confidence: 0,
                    method: 'manual',
                    error: 'Invalid domain for platform',
                };
            }

            const extractedUsername = this.extractUsernameFromUrl(url, platform);

            return {
                isValid: true,
                platform,
                extractedUsername: extractedUsername || undefined,
                confidence: 0.5,
                method: 'manual',
            };

        } catch (error) {
            return {
                isValid: false,
                platform,
                confidence: 0,
                method: 'manual',
                error: 'Invalid URL format',
            };
        }
    }

    // Extract username from URL
    private extractUsernameFromUrl(url: string, platform: string): string | null {
        const config = platformConfigs.get(platform);
        if (!config) return null;

        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;

            for (const pattern of config.usernamePatterns) {
                const match = pathname.match(pattern);
                if (match) {
                    return match[1] || match[2] || match[0];
                }
            }

            return null;
        } catch {
            return null;
        }
    }

    // Extract username from API response
    private extractUsernameFromAPIResponse(data: any, platform: string): string | null {
        // This would be implemented based on the specific API response format
        // For now, return null as a placeholder
        return null;
    }

    // Detect platform from URL
    private detectPlatform(url: string): string | null {
        const entries = Array.from(platformConfigs.entries());
        for (const [platform, config] of entries) {
            if (config.urlPatterns.some(pattern => pattern.test(url))) {
                return platform;
            }
        }
        return null;
    }

    // Health check for all platforms
    async performHealthChecks(): Promise<Map<string, { healthy: boolean; lastCheck: Date; error?: string }>> {
        const results = new Map();
        const entries = Array.from(platformConfigs.entries());

        for (const [platform, config] of entries) {
            try {
                if (config.apiEndpoints?.validate) {
                    // Test API endpoint
                    const response = await fetch(config.apiEndpoints.validate, {
                        method: 'HEAD',
                        signal: AbortSignal.timeout(5000),
                    });

                    results.set(platform, {
                        healthy: response.ok,
                        lastCheck: new Date(),
                        error: response.ok ? undefined : `HTTP ${response.status}`,
                    });
                } else {
                    // No API endpoint, consider healthy
                    results.set(platform, {
                        healthy: true,
                        lastCheck: new Date(),
                    });
                }
            } catch (error) {
                results.set(platform, {
                    healthy: false,
                    lastCheck: new Date(),
                    error: String(error),
                });
            }
        }

        return results;
    }

    // Get rate limit status
    getRateLimitStatus(): Map<string, { remaining: number; resetTime: Date }> {
        const status = new Map();
        const entries = Array.from(platformConfigs.entries());

        for (const [platform, config] of entries) {
            const remaining = this.rateLimiter.getRemainingRequests(platform);
            status.set(platform, {
                remaining,
                resetTime: new Date(Date.now() + 900000), // 15 minutes from now
            });
        }

        return status;
    }

    // Get platform configuration
    getPlatformConfig(platform: string): PlatformConfig | null {
        return platformConfigs.get(platform) || null;
    }

    // Update platform configuration
    updatePlatformConfig(platform: string, config: Partial<PlatformConfig>): void {
        const existing = platformConfigs.get(platform);
        if (existing) {
            platformConfigs.set(platform, { ...existing, ...config });
        }
    }
}

// Singleton instance
export const riskMitigator = new ExternalDependencyRiskMitigator();

// Utility functions
export const validateUrl = async (url: string, expectedUsername?: string): Promise<ValidationResult> => {
    return riskMitigator.validateUrl(url, expectedUsername);
};

export const performHealthChecks = async () => {
    return riskMitigator.performHealthChecks();
};

export const getRateLimitStatus = () => {
    return riskMitigator.getRateLimitStatus();
};

export const getPlatformConfig = (platform: string) => {
    return riskMitigator.getPlatformConfig(platform);
};

// Export types and classes
export type { PlatformConfig, ValidationResult };
export { ExternalAPIRateLimiter, ExternalDependencyRiskMitigator };

