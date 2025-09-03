import { z } from 'zod';

// Proof type schema
export const ProofTypeSchema = z.enum(['image', 'video', 'text', 'url', 'screenshot']);

// Proof content schema with validation
export const ProofContentSchema = z.object({
    type: ProofTypeSchema,
    content: z.string().min(1, 'Proof content is required'),
    metadata: z.record(z.any()).optional(),
    taskId: z.string().uuid('Invalid task ID format').optional(),
    verificationScore: z.number().min(0).max(100).optional(),
    verifiedAt: z.date().optional(),
    aiVerificationResult: z.object({
        score: z.number().min(0).max(100),
        confidence: z.number().min(0).max(100),
        isValid: z.boolean(),
        feedback: z.string().optional(),
        flaggedReasons: z.array(z.string()).optional(),
        processedAt: z.date()
    }).optional()
});

// Submission status schema
export const SubmissionStatusSchema = z.enum(['pending', 'approved', 'rejected', 'disputed']);

// Create Submission Schema
export const CreateSubmissionSchema = z.object({
    // Required fields
    missionId: z.string().uuid('Invalid mission ID format'),
    proofs: z.array(ProofContentSchema).min(1, 'At least one proof is required'),

    // Optional fields
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
    submittedAt: z.date().default(() => new Date()),

    // User context (optional, may be set by server)
    userId: z.string().uuid('Invalid user ID format').optional(),

    // Review context (set by moderators)
    status: SubmissionStatusSchema.default('pending'),
    reviewedAt: z.date().optional(),
    reviewerId: z.string().uuid('Invalid reviewer ID format').optional(),
    rejectionReason: z.string().max(500, 'Rejection reason cannot exceed 500 characters').optional(),

    // Rewards (calculated by server)
    earnedHonors: z.number().positive('Earned honors must be positive').optional(),
    paidAt: z.date().optional()
}).refine((data) => {
    // If mission requires social-post proof, ensure first proof is a URL
    // This will be validated on the server side when we have mission context
    return true;
}, {
    message: 'Social post URL is required for this mission type',
    path: ['proofs']
});

// Update Submission Schema (for status changes)
export const UpdateSubmissionSchema = z.object({
    status: SubmissionStatusSchema,
    rejectionReason: z.string().max(500, 'Rejection reason cannot exceed 500 characters').optional(),
    reviewerId: z.string().uuid('Invalid reviewer ID format'),
    reviewedAt: z.date().default(() => new Date()),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional()
});

// Proof validation schemas for different types
export const ImageProofSchema = z.object({
    type: z.literal('image'),
    content: z.string().url('Image URL must be valid'),
    metadata: z.object({
        size: z.number().positive('Image size must be positive').optional(),
        format: z.string().optional(),
        dimensions: z.object({
            width: z.number().positive(),
            height: z.number().positive()
        }).optional(),
        uploadedAt: z.date().optional()
    }).optional()
});

export const VideoProofSchema = z.object({
    type: z.literal('video'),
    content: z.string().url('Video URL must be valid'),
    metadata: z.object({
        size: z.number().positive('Video size must be positive').optional(),
        format: z.string().optional(),
        duration: z.number().positive('Video duration must be positive').optional(),
        uploadedAt: z.date().optional()
    }).optional()
});

export const TextProofSchema = z.object({
    type: z.literal('text'),
    content: z.string().min(1, 'Text content is required').max(10000, 'Text content cannot exceed 10,000 characters'),
    metadata: z.object({
        wordCount: z.number().positive().optional(),
        language: z.string().optional(),
        submittedAt: z.date().optional()
    }).optional()
});

export const UrlProofSchema = z.object({
    type: z.literal('url'),
    content: z.string().url('URL must be valid'),
    metadata: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        thumbnail: z.string().url().optional(),
        accessedAt: z.date().optional()
    }).optional()
});

export const ScreenshotProofSchema = z.object({
    type: z.literal('screenshot'),
    content: z.string().url('Screenshot URL must be valid'),
    metadata: z.object({
        size: z.number().positive('Screenshot size must be positive').optional(),
        format: z.string().optional(),
        dimensions: z.object({
            width: z.number().positive(),
            height: z.number().positive()
        }).optional(),
        capturedAt: z.date().optional(),
        platform: z.string().optional()
    }).optional()
});

// Union schema for all proof types
export const ProofSchema = z.discriminatedUnion('type', [
    ImageProofSchema,
    VideoProofSchema,
    TextProofSchema,
    UrlProofSchema,
    ScreenshotProofSchema
]);

// Type exports
export type CreateSubmissionRequest = z.infer<typeof CreateSubmissionSchema>;
export type UpdateSubmissionRequest = z.infer<typeof UpdateSubmissionSchema>;
export type ProofContent = z.infer<typeof ProofContentSchema>;
export type ProofType = z.infer<typeof ProofTypeSchema>;
export type SubmissionStatus = z.infer<typeof SubmissionStatusSchema>;
export type Proof = z.infer<typeof ProofSchema>;

// Helper function to validate proof content
export function validateProofContent(proof: ProofContent): boolean {
    try {
        ProofContentSchema.parse(proof);
        return true;
    } catch {
        return false;
    }
}

// Helper function to validate submission
export function validateSubmission(submission: CreateSubmissionRequest): boolean {
    try {
        CreateSubmissionSchema.parse(submission);
        return true;
    } catch {
        return false;
    }
}

// Helper function to get proof type from content
export function getProofType(content: string): ProofType {
    if (content.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return 'image';
    if (content.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)) return 'video';
    if (content.match(/^https?:\/\//)) return 'url';
    return 'text';
}
