/**
 * Environment Configuration Management
 * Industry Standard: Centralized configuration with type safety and validation
 */

import { z } from 'zod';

// Environment schema validation
const environmentSchema = z.object({
    // Core environment
    NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    NEXT_PUBLIC_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),

    // Firebase configuration
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),

    // API configuration
    NEXT_PUBLIC_API_BASE_URL: z.string().url().default('https://api.ensei.com'),
    NEXT_PUBLIC_API_VERSION: z.string().default('v1'),
    API_SECRET_KEY: z.string().min(1),

    // Database configuration
    DATABASE_URL: z.string().url().optional(),
    REDIS_URL: z.string().url().optional(),

    // Third-party services
    TWITTER_API_KEY: z.string().optional(),
    TWITTER_API_SECRET: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),

    // Feature flags
    NEXT_PUBLIC_FEATURE_FLAG_TASK_VERIFICATION: z.string().transform(val => val === 'true').default('true'),
    NEXT_PUBLIC_FEATURE_FLAG_REVIEW_SYSTEM: z.string().transform(val => val === 'true').default('true'),
    NEXT_PUBLIC_FEATURE_FLAG_LINK_VALIDATION: z.string().transform(val => val === 'true').default('true'),
    NEXT_PUBLIC_FEATURE_FLAG_INLINE_VERIFICATION: z.string().transform(val => val === 'true').default('true'),

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
    RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
    RATE_LIMIT_TASK_COMPLETION: z.string().transform(Number).default('10'),
    RATE_LIMIT_REVIEW_SUBMISSION: z.string().transform(Number).default('5'),

    // Caching
    CACHE_TTL_USER_PROFILE: z.string().transform(Number).default('3600'),
    CACHE_TTL_MISSION_DATA: z.string().transform(Number).default('1800'),
    CACHE_TTL_LINK_VALIDATION: z.string().transform(Number).default('300'),

    // Security
    JWT_SECRET: z.string().min(32),
    ENCRYPTION_KEY: z.string().min(32),
    CORS_ORIGIN: z.string().url().default('http://localhost:3000'),

    // Monitoring
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default('true'),
    ENABLE_ERROR_TRACKING: z.string().transform(val => val === 'true').default('true'),
});

// Parse and validate environment variables
const parseEnvironment = () => {
    try {
        return environmentSchema.parse(process.env);
    } catch (error) {
        console.error('❌ Environment validation failed:', error);
        throw new Error('Invalid environment configuration');
    }
};

// Export validated environment configuration
export const env = parseEnvironment();

// Environment-specific configurations
export const config = {
    // Environment info
    isDevelopment: env.NODE_ENV === 'development',
    isStaging: env.NODE_ENV === 'staging',
    isProduction: env.NODE_ENV === 'production',

    // Firebase config
    firebase: {
        projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
    },

    // API config
    api: {
        baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
        version: env.NEXT_PUBLIC_API_VERSION,
        secretKey: env.API_SECRET_KEY,
    },

    // Feature flags
    features: {
        taskVerification: env.NEXT_PUBLIC_FEATURE_FLAG_TASK_VERIFICATION,
        reviewSystem: env.NEXT_PUBLIC_FEATURE_FLAG_REVIEW_SYSTEM,
        linkValidation: env.NEXT_PUBLIC_FEATURE_FLAG_LINK_VALIDATION,
        inlineVerification: env.NEXT_PUBLIC_FEATURE_FLAG_INLINE_VERIFICATION,
    },

    // Rate limiting
    rateLimit: {
        windowMs: env.RATE_LIMIT_WINDOW_MS,
        maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
        taskCompletion: env.RATE_LIMIT_TASK_COMPLETION,
        reviewSubmission: env.RATE_LIMIT_REVIEW_SUBMISSION,
    },

    // Caching
    cache: {
        userProfile: env.CACHE_TTL_USER_PROFILE,
        missionData: env.CACHE_TTL_MISSION_DATA,
        linkValidation: env.CACHE_TTL_LINK_VALIDATION,
    },

    // Security
    security: {
        jwtSecret: env.JWT_SECRET,
        encryptionKey: env.ENCRYPTION_KEY,
        corsOrigin: env.CORS_ORIGIN,
    },

    // Monitoring
    monitoring: {
        logLevel: env.LOG_LEVEL,
        performanceMonitoring: env.ENABLE_PERFORMANCE_MONITORING,
        errorTracking: env.ENABLE_ERROR_TRACKING,
    },
} as const;

// Type exports
export type Environment = z.infer<typeof environmentSchema>;
export type Config = typeof config;

// Environment validation helper
export const validateEnvironment = (): boolean => {
    try {
        parseEnvironment();
        return true;
    } catch {
        return false;
    }
};

// Feature flag helpers
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
    return config.features[feature];
};

// Environment helpers
export const getApiUrl = (endpoint: string): string => {
    return `${config.api.baseUrl}/${config.api.version}/${endpoint}`;
};

export const getCacheKey = (prefix: string, identifier: string): string => {
    return `${prefix}:${identifier}`;
};

