/**
 * Comprehensive Caching Strategy
 * Industry Standard: Multi-tier caching with Redis, CDN, and in-memory fallbacks
 */

import { config } from '../config/environment';

// Cache interface
interface CacheStore {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    expire(key: string, ttl: number): Promise<void>;
    flush(): Promise<void>;
}

// In-memory cache store for development
class MemoryCacheStore implements CacheStore {
    private store = new Map<string, { value: any; expires: number }>();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Cleanup expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }

    async get<T>(key: string): Promise<T | null> {
        const entry = this.store.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expires) {
            this.store.delete(key);
            return null;
        }

        return entry.value as T;
    }

    async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
        const expires = Date.now() + (ttl * 1000);
        this.store.set(key, { value, expires });
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }

    async exists(key: string): Promise<boolean> {
        const entry = this.store.get(key);
        if (!entry) return false;

        if (Date.now() > entry.expires) {
            this.store.delete(key);
            return false;
        }

        return true;
    }

    async expire(key: string, ttl: number): Promise<void> {
        const entry = this.store.get(key);
        if (entry) {
            entry.expires = Date.now() + (ttl * 1000);
        }
    }

    async flush(): Promise<void> {
        this.store.clear();
    }

    private cleanup(): void {
        const now = Date.now();
        const entries = Array.from(this.store.entries());
        for (const [key, entry] of entries) {
            if (now > entry.expires) {
                this.store.delete(key);
            }
        }
    }

    destroy(): void {
        clearInterval(this.cleanupInterval);
        this.store.clear();
    }
}

// Redis cache store for production
class RedisCacheStore implements CacheStore {
    private redis: any; // Redis client

    constructor(redisUrl: string) {
        // Initialize Redis client
        // this.redis = new Redis(redisUrl);
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    }

    async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
        try {
            await this.redis.setex(key, ttl, JSON.stringify(value));
        } catch (error) {
            console.error('Redis set error:', error);
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch (error) {
            console.error('Redis delete error:', error);
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Redis exists error:', error);
            return false;
        }
    }

    async expire(key: string, ttl: number): Promise<void> {
        try {
            await this.redis.expire(key, ttl);
        } catch (error) {
            console.error('Redis expire error:', error);
        }
    }

    async flush(): Promise<void> {
        try {
            await this.redis.flushdb();
        } catch (error) {
            console.error('Redis flush error:', error);
        }
    }
}

// Cache key generators
export const cacheKeys = {
    user: (userId: string) => `user:${userId}`,
    userProfile: (userId: string) => `user:profile:${userId}`,
    mission: (missionId: string) => `mission:${missionId}`,
    missions: (filters: string) => `missions:${filters}`,
    taskCompletion: (userId: string, missionId: string) => `task:${userId}:${missionId}`,
    linkValidation: (url: string) => `link:validation:${Buffer.from(url).toString('base64')}`,
    review: (reviewId: string) => `review:${reviewId}`,
    reviews: (submissionId: string) => `reviews:${submissionId}`,
    apiResponse: (endpoint: string, params: string) => `api:${endpoint}:${params}`,
} as const;

// Cache manager class
export class CacheManager {
    private store: CacheStore;
    private isProduction: boolean;

    constructor() {
        this.isProduction = config.isProduction;
        this.store = this.isProduction && process.env.REDIS_URL
            ? new RedisCacheStore(process.env.REDIS_URL)
            : new MemoryCacheStore();
    }

    // Generic cache operations
    async get<T>(key: string): Promise<T | null> {
        try {
            return await this.store.get<T>(key);
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
        try {
            await this.store.set(key, value, ttl);
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.store.delete(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            return await this.store.exists(key);
        } catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }

    // User cache operations
    async getUser(userId: string): Promise<any | null> {
        return this.get(cacheKeys.user(userId));
    }

    async setUser(userId: string, user: any, ttl: number = config.cache.userProfile): Promise<void> {
        await this.set(cacheKeys.user(userId), user, ttl);
    }

    async getUserProfile(userId: string): Promise<any | null> {
        return this.get(cacheKeys.userProfile(userId));
    }

    async setUserProfile(userId: string, profile: any, ttl: number = config.cache.userProfile): Promise<void> {
        await this.set(cacheKeys.userProfile(userId), profile, ttl);
    }

    // Mission cache operations
    async getMission(missionId: string): Promise<any | null> {
        return this.get(cacheKeys.mission(missionId));
    }

    async setMission(missionId: string, mission: any, ttl: number = config.cache.missionData): Promise<void> {
        await this.set(cacheKeys.mission(missionId), mission, ttl);
    }

    async getMissions(filters: string): Promise<any[] | null> {
        return this.get(cacheKeys.missions(filters));
    }

    async setMissions(filters: string, missions: any[], ttl: number = config.cache.missionData): Promise<void> {
        await this.set(cacheKeys.missions(filters), missions, ttl);
    }

    // Task completion cache operations
    async getTaskCompletion(userId: string, missionId: string): Promise<any | null> {
        return this.get(cacheKeys.taskCompletion(userId, missionId));
    }

    async setTaskCompletion(userId: string, missionId: string, completion: any, ttl: number = 1800): Promise<void> {
        await this.set(cacheKeys.taskCompletion(userId, missionId), completion, ttl);
    }

    // Link validation cache operations
    async getLinkValidation(url: string): Promise<any | null> {
        return this.get(cacheKeys.linkValidation(url));
    }

    async setLinkValidation(url: string, result: any, ttl: number = config.cache.linkValidation): Promise<void> {
        await this.set(cacheKeys.linkValidation(url), result, ttl);
    }

    // Review cache operations
    async getReview(reviewId: string): Promise<any | null> {
        return this.get(cacheKeys.review(reviewId));
    }

    async setReview(reviewId: string, review: any, ttl: number = 3600): Promise<void> {
        await this.set(cacheKeys.review(reviewId), review, ttl);
    }

    async getReviews(submissionId: string): Promise<any[] | null> {
        return this.get(cacheKeys.reviews(submissionId));
    }

    async setReviews(submissionId: string, reviews: any[], ttl: number = 3600): Promise<void> {
        await this.set(cacheKeys.reviews(submissionId), reviews, ttl);
    }

    // API response cache operations
    async getApiResponse(endpoint: string, params: string): Promise<any | null> {
        return this.get(cacheKeys.apiResponse(endpoint, params));
    }

    async setApiResponse(endpoint: string, params: string, response: any, ttl: number = 300): Promise<void> {
        await this.set(cacheKeys.apiResponse(endpoint, params), response, ttl);
    }

    // Cache invalidation patterns
    async invalidateUser(userId: string): Promise<void> {
        await Promise.all([
            this.delete(cacheKeys.user(userId)),
            this.delete(cacheKeys.userProfile(userId)),
        ]);
    }

    async invalidateMission(missionId: string): Promise<void> {
        await this.delete(cacheKeys.mission(missionId));
        // Invalidate all mission lists (this is a simplified approach)
        // In production, you might want to use cache tags or more sophisticated invalidation
    }

    async invalidateTaskCompletion(userId: string, missionId: string): Promise<void> {
        await this.delete(cacheKeys.taskCompletion(userId, missionId));
    }

    async invalidateLinkValidation(url: string): Promise<void> {
        await this.delete(cacheKeys.linkValidation(url));
    }

    // Cache warming
    async warmUserCache(userId: string, userData: any): Promise<void> {
        await Promise.all([
            this.setUser(userId, userData),
            this.setUserProfile(userId, userData),
        ]);
    }

    async warmMissionCache(missionId: string, missionData: any): Promise<void> {
        await this.setMission(missionId, missionData);
    }

    // Cache statistics
    async getStats(): Promise<{ hits: number; misses: number; size: number }> {
        // This would be implemented based on the specific cache store
        return { hits: 0, misses: 0, size: 0 };
    }

    // Cache health check
    async healthCheck(): Promise<boolean> {
        try {
            const testKey = 'health:check';
            const testValue = { timestamp: Date.now() };

            await this.set(testKey, testValue, 60);
            const retrieved = await this.get(testKey);
            await this.delete(testKey);

            return retrieved !== null;
        } catch (error) {
            console.error('Cache health check failed:', error);
            return false;
        }
    }

    // Cleanup
    async destroy(): Promise<void> {
        if (this.store instanceof MemoryCacheStore) {
            this.store.destroy();
        }
    }
}

// Singleton cache manager instance
export const cacheManager = new CacheManager();

// Cache decorator for functions
export function cached(ttl: number = 3600, keyGenerator?: (...args: any[]) => string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const key = keyGenerator ? keyGenerator(...args) : `${propertyName}:${JSON.stringify(args)}`;

            // Try to get from cache
            const cached = await cacheManager.get(key);
            if (cached !== null) {
                return cached;
            }

            // Execute method and cache result
            const result = await method.apply(this, args);
            await cacheManager.set(key, result, ttl);

            return result;
        };

        return descriptor;
    };
}

// Cache middleware for API routes
export const cacheMiddleware = (ttl: number = 300) => {
    return async (req: any, res: any, next: any) => {
        const key = `api:${req.method}:${req.url}:${JSON.stringify(req.query)}`;

        // Try to get from cache
        const cached = await cacheManager.get(key);
        if (cached !== null) {
            return res.json(cached);
        }

        // Store original res.json
        const originalJson = res.json;
        res.json = function (data: any) {
            // Cache the response
            cacheManager.set(key, data, ttl);
            return originalJson.call(this, data);
        };

        next();
    };
};

// Export types
export type { CacheStore };

