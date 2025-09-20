/**
 * API-Level Data Validation Schemas
 * Industry Standard: Comprehensive validation with Zod for type safety and security
 */

import { z } from 'zod';

// Base schemas
const uuidSchema = z.string().uuid();
const urlSchema = z.string().url();
const timestampSchema = z.string().datetime();
const positiveIntSchema = z.number().int().positive();

// User schemas
export const userSchema = z.object({
    id: uuidSchema,
    email: z.string().email(),
    name: z.string().min(1).max(100),
    twitterUsername: z.string().regex(/^[a-zA-Z0-9_]{1,15}$/).optional(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
});

export const createUserSchema = userSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const updateUserSchema = createUserSchema.partial();

// Mission schemas
export const missionTaskSchema = z.object({
    id: z.string().min(1).max(50),
    type: z.enum(['like', 'comment', 'quote', 'retweet', 'follow']),
    description: z.string().min(1).max(500),
    intentUrl: urlSchema,
    baseHonors: positiveIntSchema,
    requiresLinkSubmission: z.boolean(),
});

export const missionSchema = z.object({
    id: uuidSchema,
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(1000),
    tasks: z.array(missionTaskSchema).min(1).max(10),
    rewards_per_user: positiveIntSchema,
    total_cost_usd: z.number().positive(),
    created_by: uuidSchema,
    created_at: timestampSchema,
    updated_at: timestampSchema,
    status: z.enum(['active', 'paused', 'completed', 'cancelled']),
    participants_count: z.number().int().min(0),
});

export const createMissionSchema = missionSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    participants_count: true,
});

export const updateMissionSchema = createMissionSchema.partial();

// Task completion schemas
export const taskCompletionSchema = z.object({
    id: uuidSchema,
    userId: uuidSchema,
    missionId: uuidSchema,
    taskId: z.string().min(1).max(50),
    completionType: z.enum(['direct', 'link_submission']),
    status: z.enum(['pending', 'verified', 'flagged']),
    submittedLink: urlSchema.optional(),
    submittedAt: timestampSchema,
    verifiedAt: timestampSchema.optional(),
    flaggedAt: timestampSchema.optional(),
    flaggedBy: uuidSchema.optional(),
    flagReason: z.string().max(500).optional(),
    verifiedBy: uuidSchema.optional(),
});

export const createTaskCompletionSchema = taskCompletionSchema.omit({
    id: true,
    submittedAt: true,
    verifiedAt: true,
    flaggedAt: true,
    flaggedBy: true,
    flagReason: true,
    verifiedBy: true,
});

export const updateTaskCompletionSchema = z.object({
    status: z.enum(['verified', 'flagged']).optional(),
    flagReason: z.string().max(500).optional(),
});

// Link validation schemas
export const linkValidationSchema = z.object({
    url: urlSchema,
    expectedUsername: z.string().regex(/^[a-zA-Z0-9_]{1,15}$/),
    platform: z.enum(['twitter', 'x', 'linkedin', 'instagram', 'tiktok']),
});

export const linkValidationResultSchema = z.object({
    isValid: z.boolean(),
    extractedUsername: z.string().optional(),
    platform: z.string(),
    error: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
});

// Review schemas
export const reviewSchema = z.object({
    id: uuidSchema,
    reviewerId: uuidSchema,
    submissionId: uuidSchema,
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1).max(1000),
    commentLink: urlSchema.optional(),
    submittedAt: timestampSchema,
    honorsEarned: positiveIntSchema,
});

export const createReviewSchema = reviewSchema.omit({
    id: true,
    submittedAt: true,
    honorsEarned: true,
});

// API request/response schemas
export const apiResponseSchema = z.object({
    success: z.boolean(),
    data: z.any().optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.any().optional(),
    }).optional(),
    meta: z.object({
        timestamp: timestampSchema,
        requestId: z.string(),
        version: z.string(),
    }).optional(),
});

export const paginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const paginatedResponseSchema = z.object({
    data: z.array(z.any()),
    pagination: z.object({
        page: z.number().int().min(1),
        limit: z.number().int().min(1),
        total: z.number().int().min(0),
        totalPages: z.number().int().min(0),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
    }),
});

// Authentication schemas
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
});

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
    name: z.string().min(1).max(100),
    twitterUsername: z.string().regex(/^[a-zA-Z0-9_]{1,15}$/).optional(),
});

export const tokenSchema = z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1).optional(),
    expiresIn: z.number().int().positive(),
});

// File upload schemas
export const fileUploadSchema = z.object({
    file: z.instanceof(File),
    type: z.enum(['image', 'document', 'video']),
    maxSize: z.number().int().positive().default(5 * 1024 * 1024), // 5MB
    allowedMimeTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/gif']),
});

// Search and filter schemas
export const searchSchema = z.object({
    query: z.string().min(1).max(100),
    filters: z.object({
        status: z.array(z.string()).optional(),
        dateRange: z.object({
            start: timestampSchema,
            end: timestampSchema,
        }).optional(),
        tags: z.array(z.string()).optional(),
    }).optional(),
});

// Webhook schemas
export const webhookSchema = z.object({
    event: z.string(),
    data: z.any(),
    timestamp: timestampSchema,
    signature: z.string(),
});

// Error schemas
export const errorSchema = z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    stack: z.string().optional(),
    timestamp: timestampSchema,
    requestId: z.string().optional(),
});

// Validation middleware schemas
export const validationMiddlewareSchema = z.object({
    body: z.any().optional(),
    query: z.any().optional(),
    params: z.any().optional(),
    headers: z.any().optional(),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Mission = z.infer<typeof missionSchema>;
export type CreateMission = z.infer<typeof createMissionSchema>;
export type UpdateMission = z.infer<typeof updateMissionSchema>;
export type MissionTask = z.infer<typeof missionTaskSchema>;
export type TaskCompletion = z.infer<typeof taskCompletionSchema>;
export type CreateTaskCompletion = z.infer<typeof createTaskCompletionSchema>;
export type UpdateTaskCompletion = z.infer<typeof updateTaskCompletionSchema>;
export type LinkValidation = z.infer<typeof linkValidationSchema>;
export type LinkValidationResult = z.infer<typeof linkValidationResultSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type CreateReview = z.infer<typeof createReviewSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type PaginatedResponse = z.infer<typeof paginatedResponseSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;
export type Token = z.infer<typeof tokenSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type Search = z.infer<typeof searchSchema>;
export type Webhook = z.infer<typeof webhookSchema>;
export type Error = z.infer<typeof errorSchema>;
export type ValidationMiddleware = z.infer<typeof validationMiddlewareSchema>;

// Validation helper functions
export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
        }
        throw error;
    }
};

export const validateSchemaSafe = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } => {
    try {
        const result = schema.parse(data);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors.map(e => e.message).join(', ') };
        }
        return { success: false, error: 'Unknown validation error' };
    }
};

// Custom validation functions
export const validateTwitterUrl = (url: string): boolean => {
    const twitterUrlRegex = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/;
    return twitterUrlRegex.test(url);
};

export const validateLinkedInUrl = (url: string): boolean => {
    const linkedinUrlRegex = /^https?:\/\/(www\.)?linkedin\.com\/(in|posts|feed)\/[a-zA-Z0-9_-]+/;
    return linkedinUrlRegex.test(url);
};

export const validateInstagramUrl = (url: string): boolean => {
    const instagramUrlRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[a-zA-Z0-9_-]+/;
    return instagramUrlRegex.test(url);
};

export const validateTikTokUrl = (url: string): boolean => {
    const tiktokUrlRegex = /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+\/video\/\d+/;
    return tiktokUrlRegex.test(url);
};

// Platform-specific URL validation
export const validatePlatformUrl = (url: string, platform: string): boolean => {
    switch (platform.toLowerCase()) {
        case 'twitter':
        case 'x':
            return validateTwitterUrl(url);
        case 'linkedin':
            return validateLinkedInUrl(url);
        case 'instagram':
            return validateInstagramUrl(url);
        case 'tiktok':
            return validateTikTokUrl(url);
        default:
            return false;
    }
};

// Username extraction from URLs
export const extractUsernameFromUrl = (url: string, platform: string): string | null => {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;

        switch (platform.toLowerCase()) {
            case 'twitter':
            case 'x':
                const twitterMatch = pathname.match(/^\/([a-zA-Z0-9_]+)/);
                return twitterMatch ? twitterMatch[1] : null;
            case 'linkedin':
                const linkedinMatch = pathname.match(/^\/(in|posts|feed)\/([a-zA-Z0-9_-]+)/);
                return linkedinMatch ? linkedinMatch[2] : null;
            case 'instagram':
                const instagramMatch = pathname.match(/^\/([a-zA-Z0-9_.]+)/);
                return instagramMatch ? instagramMatch[1] : null;
            case 'tiktok':
                const tiktokMatch = pathname.match(/^\/@([a-zA-Z0-9_.]+)/);
                return tiktokMatch ? tiktokMatch[1] : null;
            default:
                return null;
        }
    } catch {
        return null;
    }
};

