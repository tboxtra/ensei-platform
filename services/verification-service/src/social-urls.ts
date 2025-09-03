// Social URL verification and normalization service
// Handles Twitter, Instagram, TikTok, Facebook, Telegram, etc.

export interface SocialUrlInfo {
    platform: 'twitter' | 'instagram' | 'tiktok' | 'facebook' | 'telegram' | 'unknown';
    normalizedUrl: string;
    postId: string;
    isValid: boolean;
    error?: string;
}

export interface VerificationResult {
    isValid: boolean;
    platform: string;
    postId: string;
    error?: string;
    metadata?: {
        title?: string;
        author?: string;
        timestamp?: string;
        engagement?: {
            likes?: number;
            comments?: number;
            shares?: number;
        };
    };
}

// Platform-specific URL patterns and extractors
const PLATFORM_PATTERNS = {
    twitter: {
        patterns: [
            /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([^\/]+)\/status\/(\d+)/i,
            /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/i\/web\/status\/(\d+)/i
        ],
        extractPostId: (url: string): string | null => {
            const match = url.match(/\/status\/(\d+)/);
            return match ? match[1] : null;
        }
    },
    instagram: {
        patterns: [
            /https?:\/\/(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)/i,
            /https?:\/\/(?:www\.)?instagram\.com\/reel\/([a-zA-Z0-9_-]+)/i
        ],
        extractPostId: (url: string): string | null => {
            const match = url.match(/\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
            return match ? match[1] : null;
        }
    },
    tiktok: {
        patterns: [
            /https?:\/\/(?:www\.)?tiktok\.com\/@[^\/]+\/video\/(\d+)/i,
            /https?:\/\/(?:www\.)?vm\.tiktok\.com\/([a-zA-Z0-9]+)/i
        ],
        extractPostId: (url: string): string | null => {
            const match = url.match(/\/video\/(\d+)/);
            return match ? match[1] : null;
        }
    },
    facebook: {
        patterns: [
            /https?:\/\/(?:www\.)?facebook\.com\/[^\/]+\/posts\/(\d+)/i,
            /https?:\/\/(?:www\.)?facebook\.com\/photo\.php\?fbid=(\d+)/i
        ],
        extractPostId: (url: string): string | null => {
            const match = url.match(/\/(?:posts|photo\.php\?fbid=)\/(\d+)/);
            return match ? match[1] : null;
        }
    },
    telegram: {
        patterns: [
            /https?:\/\/t\.me\/([^\/]+)\/(\d+)/i,
            /https?:\/\/(?:www\.)?telegram\.me\/([^\/]+)\/(\d+)/i
        ],
        extractPostId: (url: string): string | null => {
            const match = url.match(/\/([^\/]+)\/(\d+)$/);
            return match ? `${match[1]}_${match[2]}` : null;
        }
    }
};

/**
 * Normalize and validate a social media URL
 */
export function normalizeSocialUrl(url: string): SocialUrlInfo {
    try {
        // Clean the URL
        const cleanUrl = url.trim().replace(/\/$/, '');

        // Detect platform and extract post ID
        for (const [platform, config] of Object.entries(PLATFORM_PATTERNS)) {
            for (const pattern of config.patterns) {
                if (pattern.test(cleanUrl)) {
                    const postId = config.extractPostId(cleanUrl);
                    if (postId) {
                        return {
                            platform: platform as any,
                            normalizedUrl: cleanUrl,
                            postId,
                            isValid: true
                        };
                    }
                }
            }
        }

        return {
            platform: 'unknown',
            normalizedUrl: cleanUrl,
            postId: '',
            isValid: false,
            error: 'URL does not match any known social media platform pattern'
        };
    } catch (error) {
        return {
            platform: 'unknown',
            normalizedUrl: url,
            postId: '',
            isValid: false,
            error: `Error processing URL: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

/**
 * Verify a social media post exists and is accessible
 */
export async function verifySocialPost(url: string): Promise<VerificationResult> {
    try {
        const urlInfo = normalizeSocialUrl(url);

        if (!urlInfo.isValid) {
            return {
                isValid: false,
                platform: urlInfo.platform,
                postId: urlInfo.postId,
                error: urlInfo.error
            };
        }

        // Basic HTTP validation (ping the URL)
        const response = await fetch(url, {
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; EnseiBot/1.0)'
            }
        });

        if (!response.ok) {
            return {
                isValid: false,
                platform: urlInfo.platform,
                postId: urlInfo.postId,
                error: `HTTP ${response.status}: ${response.statusText}`
            };
        }

        // Platform-specific validation could be added here
        // For now, we just verify the URL is accessible
        return {
            isValid: true,
            platform: urlInfo.platform,
            postId: urlInfo.postId
        };

    } catch (error) {
        return {
            isValid: false,
            platform: 'unknown',
            postId: '',
            error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

/**
 * Batch verify multiple social URLs
 */
export async function verifySocialPosts(urls: string[]): Promise<VerificationResult[]> {
    const results = await Promise.all(
        urls.map(url => verifySocialPost(url))
    );
    return results;
}

/**
 * Check if a URL is from an allowed social platform
 */
export function isAllowedPlatform(url: string, allowedPlatforms?: string[]): boolean {
    const urlInfo = normalizeSocialUrl(url);

    if (!urlInfo.isValid) {
        return false;
    }

    if (!allowedPlatforms || allowedPlatforms.length === 0) {
        return true; // All platforms allowed if none specified
    }

    return allowedPlatforms.includes(urlInfo.platform);
}

/**
 * Extract engagement metrics from social post (placeholder for future implementation)
 */
export async function extractEngagementMetrics(url: string): Promise<any> {
    // This would integrate with platform APIs in production
    // For now, return placeholder data
    return {
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50)
    };
}


