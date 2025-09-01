import { z } from 'zod';

// Review action schema
export const ReviewActionSchema = z.enum(['approve', 'reject', 'dispute', 'request_changes']);

// Review reason schema for rejections
export const RejectionReasonSchema = z.enum([
    'incomplete_proofs',
    'invalid_proofs',
    'wrong_platform',
    'wrong_task',
    'poor_quality',
    'spam',
    'inappropriate_content',
    'duplicate_submission',
    'expired_mission',
    'other'
]);

// Review decision schema
export const ReviewDecisionSchema = z.object({
    action: ReviewActionSchema,
    submissionId: z.string().uuid('Invalid submission ID format'),
    reviewerId: z.string().uuid('Invalid reviewer ID format'),
    reviewedAt: z.date().default(() => new Date()),

    // Required for rejections
    rejectionReason: RejectionReasonSchema.optional(),
    rejectionDetails: z.string().max(1000, 'Rejection details cannot exceed 1000 characters').optional(),

    // Optional fields
    notes: z.string().max(2000, 'Review notes cannot exceed 2000 characters').optional(),
    verificationScore: z.number().min(0).max(100).optional(),
    aiVerificationResult: z.object({
        score: z.number().min(0).max(100),
        confidence: z.number().min(0).max(100),
        isValid: z.boolean(),
        feedback: z.string().optional(),
        flaggedReasons: z.array(z.string()).optional(),
        processedAt: z.date()
    }).optional(),

    // Rewards (for approvals)
    awardedHonors: z.number().positive('Awarded honors must be positive').optional(),

    // Dispute resolution
    disputeResolution: z.object({
        originalDecision: ReviewActionSchema,
        resolution: z.enum(['upheld', 'overturned', 'modified']),
        resolutionNotes: z.string().max(1000, 'Resolution notes cannot exceed 1000 characters'),
        resolvedBy: z.string().uuid('Invalid resolver ID format'),
        resolvedAt: z.date()
    }).optional()
});

// Bulk review schema for multiple submissions
export const BulkReviewSchema = z.object({
    submissions: z.array(z.object({
        submissionId: z.string().uuid('Invalid submission ID format'),
        action: ReviewActionSchema,
        rejectionReason: RejectionReasonSchema.optional(),
        rejectionDetails: z.string().max(1000, 'Rejection details cannot exceed 1000 characters').optional(),
        notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
        awardedHonors: z.number().positive('Awarded honors must be positive').optional()
    })).min(1, 'At least one submission must be reviewed'),

    reviewerId: z.string().uuid('Invalid reviewer ID format'),
    reviewedAt: z.date().default(() => new Date()),
    bulkNotes: z.string().max(2000, 'Bulk review notes cannot exceed 2000 characters').optional()
});

// Review history schema
export const ReviewHistorySchema = z.object({
    submissionId: z.string().uuid('Invalid submission ID format'),
    reviews: z.array(z.object({
        action: ReviewActionSchema,
        reviewerId: z.string().uuid('Invalid reviewer ID format'),
        reviewedAt: z.date(),
        notes: z.string().max(2000, 'Review notes cannot exceed 2000 characters').optional(),
        rejectionReason: RejectionReasonSchema.optional(),
        rejectionDetails: z.string().max(1000, 'Rejection details cannot exceed 1000 characters').optional()
    })).min(1, 'At least one review must be present'),

    currentStatus: z.enum(['pending', 'approved', 'rejected', 'disputed']),
    finalDecision: ReviewActionSchema.optional(),
    finalReviewerId: z.string().uuid('Invalid reviewer ID format').optional(),
    finalReviewedAt: z.date().optional()
});

// Review statistics schema
export const ReviewStatsSchema = z.object({
    reviewerId: z.string().uuid('Invalid reviewer ID format'),
    period: z.object({
        startDate: z.date(),
        endDate: z.date()
    }),
    stats: z.object({
        totalReviewed: z.number().int().min(0),
        approved: z.number().int().min(0),
        rejected: z.number().int().min(0),
        disputed: z.number().int().min(0),
        averageReviewTime: z.number().positive().optional(), // in minutes
        accuracyScore: z.number().min(0).max(100).optional()
    }),
    rejectionBreakdown: z.record(RejectionReasonSchema, z.number().int().min(0)).optional()
});

// Type exports
export type ReviewAction = z.infer<typeof ReviewActionSchema>;
export type RejectionReason = z.infer<typeof RejectionReasonSchema>;
export type ReviewDecision = z.infer<typeof ReviewDecisionSchema>;
export type BulkReview = z.infer<typeof BulkReviewSchema>;
export type ReviewHistory = z.infer<typeof ReviewHistorySchema>;
export type ReviewStats = z.infer<typeof ReviewStatsSchema>;

// Helper function to validate review decision
export function validateReviewDecision(decision: ReviewDecision): boolean {
    try {
        ReviewDecisionSchema.parse(decision);

        // Additional validation: rejection reason required for rejections
        if (decision.action === 'reject' && !decision.rejectionReason) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

// Helper function to validate bulk review
export function validateBulkReview(bulkReview: BulkReview): boolean {
    try {
        BulkReviewSchema.parse(bulkReview);

        // Additional validation: rejection reason required for rejections
        for (const submission of bulkReview.submissions) {
            if (submission.action === 'reject' && !submission.rejectionReason) {
                return false;
            }
        }

        return true;
    } catch {
        return false;
    }
}

// Helper function to get rejection reason description
export function getRejectionReasonDescription(reason: RejectionReason): string {
    const descriptions = {
        incomplete_proofs: 'Submitted proofs are incomplete or missing required elements',
        invalid_proofs: 'Submitted proofs do not match the required task',
        wrong_platform: 'Proofs were submitted from the wrong platform',
        wrong_task: 'Proofs do not correspond to the assigned task',
        poor_quality: 'Proofs are of insufficient quality or unclear',
        spam: 'Submission appears to be spam or automated',
        inappropriate_content: 'Content violates platform guidelines',
        duplicate_submission: 'Similar submission already exists',
        expired_mission: 'Mission has expired and is no longer accepting submissions',
        other: 'Other reason not covered by standard categories'
    };

    return descriptions[reason] || 'Unknown rejection reason';
}

// Helper function to calculate review statistics
export function calculateReviewStats(reviews: ReviewDecision[]): {
    total: number;
    approved: number;
    rejected: number;
    disputed: number;
    averageTime: number;
} {
    const stats = {
        total: reviews.length,
        approved: reviews.filter(r => r.action === 'approve').length,
        rejected: reviews.filter(r => r.action === 'reject').length,
        disputed: reviews.filter(r => r.action === 'dispute').length,
        averageTime: 0
    };

    // Calculate average review time if we have timestamps
    if (reviews.length > 0) {
        const totalTime = reviews.reduce((sum, review) => {
            // This would need to be calculated based on submission timestamp
            // For now, return 0
            return sum + 0;
        }, 0);
        stats.averageTime = totalTime / reviews.length;
    }

    return stats;
}
