/**
 * Rate Limiting and Throttling System
 * Industry Standard: Multi-tier rate limiting with Redis backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { config } from '../config/environment';

// Rate limit store interface
interface RateLimitStore {
    get: (key: string) => Promise<RateLimitData | null>;
    set: (key: string, data: RateLimitData, ttl: number) => Promise<void>;
    increment: (key: string, ttl: number) => Promise<number>;
}

interface RateLimitData {
    count: number;
    resetTime: number;
    blocked: boolean;
}

// In-memory store for development (replace with Redis in production)
class MemoryRateLimitStore implements RateLimitStore {
    private store = new Map<string, RateLimitData>();

    async get(key: string): Promise<RateLimitData | null> {
        const data = this.store.get(key);
        if (!data) return null;

        // Check if expired
        if (Date.now() > data.resetTime) {
            this.store.delete(key);
            return null;
        }

        return data;
    }

    async set(key: string, data: RateLimitData, ttl: number): Promise<void> {
        this.store.set(key, data);
        // Auto-cleanup after TTL
        setTimeout(() => this.store.delete(key), ttl * 1000);
    }

    async increment(key: string, ttl: number): Promise<number> {
        const existing = await this.get(key);
        const now = Date.now();
        const resetTime = now + ttl * 1000;

        if (!existing) {
            const newData: RateLimitData = {
                count: 1,
                resetTime,
                blocked: false,
            };
            await this.set(key, newData, ttl);
            return 1;
        }

        const updatedData: RateLimitData = {
            ...existing,
            count: existing.count + 1,
        };

        await this.set(key, updatedData, ttl);
        return updatedData.count;
    }
}

// Redis store for production
class RedisRateLimitStore implements RateLimitStore {
    private redis: any; // Redis client

    constructor(redisUrl: string) {
        // Initialize Redis client
        // this.redis = new Redis(redisUrl);
    }

    async get(key: string): Promise<RateLimitData | null> {
        try {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    }

    async set(key: string, data: RateLimitData, ttl: number): Promise<void> {
        try {
            await this.redis.setex(key, ttl, JSON.stringify(data));
        } catch (error) {
            console.error('Redis set error:', error);
        }
    }

    async increment(key: string, ttl: number): Promise<number> {
        try {
            const count = await this.redis.incr(key);
            if (count === 1) {
                await this.redis.expire(key, ttl);
            }
            return count;
        } catch (error) {
            console.error('Redis increment error:', error);
            return 0;
        }
    }
}

// Rate limit configuration
interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    message: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: (req: NextRequest) => string;
}

// Default rate limit configurations
const rateLimitConfigs: Record<string, RateLimitConfig> = {
    // General API rate limiting
    api: {
        windowMs: config.rateLimit.windowMs,
        maxRequests: config.rateLimit.maxRequests,
        message: 'Too many requests, please try again later.',
        keyGenerator: (req) => `api:${req.ip}`,
    },

    // Task completion rate limiting
    taskCompletion: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: config.rateLimit.taskCompletion,
        message: 'Too many task completions, please try again later.',
        keyGenerator: (req) => {
            const userId = req.headers.get('x-user-id') || 'anonymous';
            return `task:${userId}`;
        },
    },

    // Review submission rate limiting
    reviewSubmission: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: config.rateLimit.reviewSubmission,
        message: 'Too many review submissions, please try again later.',
        keyGenerator: (req) => {
            const userId = req.headers.get('x-user-id') || 'anonymous';
            return `review:${userId}`;
        },
    },

    // Link validation rate limiting
    linkValidation: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 20,
        message: 'Too many link validations, please try again later.',
        keyGenerator: (req) => {
            const userId = req.headers.get('x-user-id') || 'anonymous';
            return `link:${userId}`;
        },
    },
};

// Rate limiting middleware factory
export const createRateLimit = (configName: string) => {
    const config = rateLimitConfigs[configName];
    if (!config) {
        throw new Error(`Rate limit config '${configName}' not found`);
    }

    // Use Redis in production, memory store in development
    const store: RateLimitStore = process.env.NODE_ENV === 'production' && process.env.REDIS_URL
        ? new RedisRateLimitStore(process.env.REDIS_URL)
        : new MemoryRateLimitStore();

    return async (req: NextRequest): Promise<NextResponse | null> => {
        try {
            const key = config.keyGenerator ? config.keyGenerator(req) : `default:${req.ip}`;
            const windowMs = config.windowMs;
            const maxRequests = config.maxRequests;

            // Get current rate limit data
            const data = await store.get(key);
            const now = Date.now();

            if (!data) {
                // First request in window
                await store.set(key, {
                    count: 1,
                    resetTime: now + windowMs,
                    blocked: false,
                }, Math.ceil(windowMs / 1000));

                return null; // Allow request
            }

            // Check if window has expired
            if (now > data.resetTime) {
                // Reset window
                await store.set(key, {
                    count: 1,
                    resetTime: now + windowMs,
                    blocked: false,
                }, Math.ceil(windowMs / 1000));

                return null; // Allow request
            }

            // Check if limit exceeded
            if (data.count >= maxRequests) {
                // Block request
                await store.set(key, {
                    ...data,
                    blocked: true,
                }, Math.ceil((data.resetTime - now) / 1000));

                return NextResponse.json(
                    {
                        error: {
                            code: 'RATE_LIMIT_EXCEEDED',
                            message: config.message,
                            retryAfter: Math.ceil((data.resetTime - now) / 1000),
                        },
                    },
                    { status: 429 }
                );
            }

            // Increment counter
            const newCount = await store.increment(key, Math.ceil((data.resetTime - now) / 1000));

            // Add rate limit headers
            const response = NextResponse.next();
            response.headers.set('X-RateLimit-Limit', maxRequests.toString());
            response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - newCount).toString());
            response.headers.set('X-RateLimit-Reset', new Date(data.resetTime).toISOString());

            return response;

        } catch (error) {
            console.error('Rate limiting error:', error);
            // Fail open - allow request if rate limiting fails
            return null;
        }
    };
};

// Rate limiting middleware for Next.js
export const rateLimitMiddleware = async (req: NextRequest): Promise<NextResponse | null> => {
    const pathname = req.nextUrl.pathname;

    // Apply different rate limits based on endpoint
    if (pathname.startsWith('/api/tasks/complete')) {
        return createRateLimit('taskCompletion')(req);
    } else if (pathname.startsWith('/api/reviews/submit')) {
        return createRateLimit('reviewSubmission')(req);
    } else if (pathname.startsWith('/api/validate/link')) {
        return createRateLimit('linkValidation')(req);
    } else if (pathname.startsWith('/api/')) {
        return createRateLimit('api')(req);
    }

    return null; // No rate limiting for non-API routes
};

// Rate limit status checker
export const getRateLimitStatus = async (key: string, configName: string) => {
    const config = rateLimitConfigs[configName];
    if (!config) return null;

    const store = process.env.NODE_ENV === 'production' && process.env.REDIS_URL
        ? new RedisRateLimitStore(process.env.REDIS_URL)
        : new MemoryRateLimitStore();

    const data = await store.get(key);
    if (!data) return null;

    return {
        count: data.count,
        limit: config.maxRequests,
        remaining: Math.max(0, config.maxRequests - data.count),
        resetTime: data.resetTime,
        blocked: data.blocked,
    };
};

// Rate limit bypass for admin users
export const isAdminUser = (req: NextRequest): boolean => {
    const adminToken = req.headers.get('x-admin-token');
    return adminToken === process.env.ADMIN_BYPASS_TOKEN;
};

// Export rate limit configurations
export { rateLimitConfigs };
export type { RateLimitConfig, RateLimitData };

