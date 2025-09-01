import {
    ReviewDecisionSchema,
    BulkReviewSchema,
    ReviewHistorySchema,
    ReviewStatsSchema,
    ReviewActionSchema,
    RejectionReasonSchema,
    validateReviewDecision,
    validateBulkReview,
    getRejectionReasonDescription,
    calculateReviewStats
} from '../mission/review.schema';

describe('Review Schema', () => {
    describe('ReviewDecisionSchema', () => {
        it('should validate an approval decision', () => {
            const validDecision = {
                action: 'approve' as const,
                submissionId: '123e4567-e89b-12d3-a456-426614174000',
                reviewerId: '123e4567-e89b-12d3-a456-426614174001',
                notes: 'Great work on this submission',
                awardedHonors: 500
            };

            const result = ReviewDecisionSchema.safeParse(validDecision);
            expect(result.success).toBe(true);
        });

        it('should validate a rejection decision', () => {
            const validDecision = {
                action: 'reject' as const,
                submissionId: '123e4567-e89b-12d3-a456-426614174000',
                reviewerId: '123e4567-e89b-12d3-a456-426614174001',
                rejectionReason: 'incomplete_proofs' as const,
                rejectionDetails: 'Please provide more complete proof of task completion',
                notes: 'Submission needs improvement'
            };

            const result = ReviewDecisionSchema.safeParse(validDecision);
            expect(result.success).toBe(true);
        });

        it('should validate a dispute decision', () => {
            const validDecision = {
                action: 'dispute' as const,
                submissionId: '123e4567-e89b-12d3-a456-426614174000',
                reviewerId: '123e4567-e89b-12d3-a456-426614174001',
                notes: 'This submission requires further review'
            };

            const result = ReviewDecisionSchema.safeParse(validDecision);
            expect(result.success).toBe(true);
        });

        it('should validate a request changes decision', () => {
            const validDecision = {
                action: 'request_changes' as const,
                submissionId: '123e4567-e89b-12d3-a456-426614174000',
                reviewerId: '123e4567-e89b-12d3-a456-426614174001',
                notes: 'Please provide additional proof'
            };

            const result = ReviewDecisionSchema.safeParse(validDecision);
            expect(result.success).toBe(true);
        });

        it('should require submissionId', () => {
            const decision = {
                action: 'approve' as const,
                reviewerId: '123e4567-e89b-12d3-a456-426614174001'
            };

            const result = ReviewDecisionSchema.safeParse(decision);
            expect(result.success).toBe(false);
            if (!result.success) {
                const submissionIdError = result.error.issues.find(issue => issue.path.includes('submissionId'));
                expect(submissionIdError).toBeDefined();
            }
        });

        it('should require reviewerId', () => {
            const decision = {
                action: 'approve' as const,
                submissionId: '123e4567-e89b-12d3-a456-426614174000'
            };

            const result = ReviewDecisionSchema.safeParse(decision);
            expect(result.success).toBe(false);
            if (!result.success) {
                const reviewerIdError = result.error.issues.find(issue => issue.path.includes('reviewerId'));
                expect(reviewerIdError).toBeDefined();
            }
        });

        it('should validate UUIDs', () => {
            const decision = {
                action: 'approve' as const,
                submissionId: 'invalid-uuid',
                reviewerId: 'invalid-uuid'
            };

            const result = ReviewDecisionSchema.safeParse(decision);
            expect(result.success).toBe(false);
            if (!result.success) {
                const submissionIdError = result.error.issues.find(issue => issue.path.includes('submissionId'));
                const reviewerIdError = result.error.issues.find(issue => issue.path.includes('reviewerId'));
                expect(submissionIdError?.message).toContain('Invalid submission ID format');
                expect(reviewerIdError?.message).toContain('Invalid reviewer ID format');
            }
        });

        it('should validate awardedHonors is positive', () => {
            const decision = {
                action: 'approve' as const,
                submissionId: '123e4567-e89b-12d3-a456-426614174000',
                reviewerId: '123e4567-e89b-12d3-a456-426614174001',
                awardedHonors: -100
            };

            const result = ReviewDecisionSchema.safeParse(decision);
            expect(result.success).toBe(false);
            if (!result.success) {
                const honorsError = result.error.issues.find(issue => issue.path.includes('awardedHonors'));
                expect(honorsError?.message).toContain('positive');
            }
        });
    });

    describe('BulkReviewSchema', () => {
        it('should validate a bulk review with multiple submissions', () => {
            const validBulkReview = {
                submissions: [
                    {
                        submissionId: '123e4567-e89b-12d3-a456-426614174000',
                        action: 'approve' as const,
                        notes: 'Great work',
                        awardedHonors: 500
                    },
                    {
                        submissionId: '123e4567-e89b-12d3-a456-426614174001',
                        action: 'reject' as const,
                        rejectionReason: 'incomplete_proofs' as const,
                        rejectionDetails: 'Missing required proof'
                    }
                ],
                reviewerId: '123e4567-e89b-12d3-a456-426614174002',
                bulkNotes: 'Bulk review completed'
            };

            const result = BulkReviewSchema.safeParse(validBulkReview);
            expect(result.success).toBe(true);
        });

        it('should require at least one submission', () => {
            const bulkReview = {
                submissions: [],
                reviewerId: '123e4567-e89b-12d3-a456-426614174002'
            };

            const result = BulkReviewSchema.safeParse(bulkReview);
            expect(result.success).toBe(false);
            if (!result.success) {
                const submissionsError = result.error.issues.find(issue => issue.path.includes('submissions'));
                expect(submissionsError?.message).toContain('At least one submission must be reviewed');
            }
        });

        it('should require reviewerId', () => {
            const bulkReview = {
                submissions: [
                    {
                        submissionId: '123e4567-e89b-12d3-a456-426614174000',
                        action: 'approve' as const
                    }
                ]
            };

            const result = BulkReviewSchema.safeParse(bulkReview);
            expect(result.success).toBe(false);
            if (!result.success) {
                const reviewerIdError = result.error.issues.find(issue => issue.path.includes('reviewerId'));
                expect(reviewerIdError).toBeDefined();
            }
        });
    });

    describe('ReviewHistorySchema', () => {
        it('should validate a review history', () => {
            const validHistory = {
                submissionId: '123e4567-e89b-12d3-a456-426614174000',
                reviews: [
                    {
                        action: 'reject' as const,
                        reviewerId: '123e4567-e89b-12d3-a456-426614174001',
                        reviewedAt: new Date(),
                        notes: 'Initial rejection',
                        rejectionReason: 'incomplete_proofs' as const
                    },
                    {
                        action: 'approve' as const,
                        reviewerId: '123e4567-e89b-12d3-a456-426614174002',
                        reviewedAt: new Date(),
                        notes: 'Approved after resubmission'
                    }
                ],
                currentStatus: 'approved' as const,
                finalDecision: 'approve' as const,
                finalReviewerId: '123e4567-e89b-12d3-a456-426614174002',
                finalReviewedAt: new Date()
            };

            const result = ReviewHistorySchema.safeParse(validHistory);
            expect(result.success).toBe(true);
        });

        it('should require at least one review', () => {
            const history = {
                submissionId: '123e4567-e89b-12d3-a456-426614174000',
                reviews: [],
                currentStatus: 'pending' as const
            };

            const result = ReviewHistorySchema.safeParse(history);
            expect(result.success).toBe(false);
            if (!result.success) {
                const reviewsError = result.error.issues.find(issue => issue.path.includes('reviews'));
                expect(reviewsError?.message).toContain('At least one review must be present');
            }
        });
    });

    describe('ReviewStatsSchema', () => {
        it('should validate review statistics', () => {
            const validStats = {
                reviewerId: '123e4567-e89b-12d3-a456-426614174000',
                period: {
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-01-31')
                },
                stats: {
                    totalReviewed: 100,
                    approved: 80,
                    rejected: 15,
                    disputed: 5,
                    averageReviewTime: 5.5,
                    accuracyScore: 95.5
                },
                rejectionBreakdown: {
                    incomplete_proofs: 8,
                    invalid_proofs: 4,
                    wrong_platform: 2,
                    poor_quality: 1
                }
            };

            const result = ReviewStatsSchema.safeParse(validStats);
            expect(result.success).toBe(true);
        });

        it('should require valid period dates', () => {
            const stats = {
                reviewerId: '123e4567-e89b-12d3-a456-426614174000',
                period: {
                    startDate: 'invalid-date',
                    endDate: 'invalid-date'
                },
                stats: {
                    totalReviewed: 100,
                    approved: 80,
                    rejected: 15,
                    disputed: 5
                }
            };

            const result = ReviewStatsSchema.safeParse(stats);
            expect(result.success).toBe(false);
        });
    });

    describe('ReviewActionSchema', () => {
        it('should accept all valid review actions', () => {
            const validActions = ['approve', 'reject', 'dispute', 'request_changes'] as const;

            validActions.forEach(action => {
                const result = ReviewActionSchema.safeParse(action);
                expect(result.success).toBe(true);
            });
        });

        it('should reject invalid review actions', () => {
            const result = ReviewActionSchema.safeParse('invalid');
            expect(result.success).toBe(false);
        });
    });

    describe('RejectionReasonSchema', () => {
        it('should accept all valid rejection reasons', () => {
            const validReasons = [
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
            ] as const;

            validReasons.forEach(reason => {
                const result = RejectionReasonSchema.safeParse(reason);
                expect(result.success).toBe(true);
            });
        });

        it('should reject invalid rejection reasons', () => {
            const result = RejectionReasonSchema.safeParse('invalid');
            expect(result.success).toBe(false);
        });
    });

    describe('Helper Functions', () => {
        describe('validateReviewDecision', () => {
            it('should validate correct review decision', () => {
                const decision = {
                    action: 'approve' as const,
                    submissionId: '123e4567-e89b-12d3-a456-426614174000',
                    reviewerId: '123e4567-e89b-12d3-a456-426614174001'
                };

                const isValid = validateReviewDecision(decision);
                expect(isValid).toBe(true);
            });

            it('should reject review decision without required fields', () => {
                const decision = {
                    action: 'approve' as const,
                    submissionId: 'invalid-uuid',
                    reviewerId: '123e4567-e89b-12d3-a456-426614174001'
                };

                const isValid = validateReviewDecision(decision);
                expect(isValid).toBe(false);
            });

            it('should require rejection reason for rejections', () => {
                const decision = {
                    action: 'reject' as const,
                    submissionId: '123e4567-e89b-12d3-a456-426614174000',
                    reviewerId: '123e4567-e89b-12d3-a456-426614174001'
                    // Missing rejectionReason
                };

                const isValid = validateReviewDecision(decision);
                expect(isValid).toBe(false);
            });
        });

        describe('validateBulkReview', () => {
            it('should validate correct bulk review', () => {
                const bulkReview = {
                    submissions: [
                        {
                            submissionId: '123e4567-e89b-12d3-a456-426614174000',
                            action: 'approve' as const
                        }
                    ],
                    reviewerId: '123e4567-e89b-12d3-a456-426614174001'
                };

                const isValid = validateBulkReview(bulkReview);
                expect(isValid).toBe(true);
            });

            it('should reject bulk review with invalid submissions', () => {
                const bulkReview = {
                    submissions: [
                        {
                            submissionId: 'invalid-uuid',
                            action: 'approve' as const
                        }
                    ],
                    reviewerId: '123e4567-e89b-12d3-a456-426614174001'
                };

                const isValid = validateBulkReview(bulkReview);
                expect(isValid).toBe(false);
            });

            it('should require rejection reason for rejections in bulk review', () => {
                const bulkReview = {
                    submissions: [
                        {
                            submissionId: '123e4567-e89b-12d3-a456-426614174000',
                            action: 'reject' as const
                            // Missing rejectionReason
                        }
                    ],
                    reviewerId: '123e4567-e89b-12d3-a456-426614174001'
                };

                const isValid = validateBulkReview(bulkReview);
                expect(isValid).toBe(false);
            });
        });

        describe('getRejectionReasonDescription', () => {
            it('should return descriptions for all rejection reasons', () => {
                const reasons = [
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
                ] as const;

                reasons.forEach(reason => {
                    const description = getRejectionReasonDescription(reason);
                    expect(description).toBeDefined();
                    expect(description.length).toBeGreaterThan(0);
                });
            });

            it('should return specific descriptions for known reasons', () => {
                expect(getRejectionReasonDescription('incomplete_proofs'))
                    .toContain('incomplete or missing required elements');

                expect(getRejectionReasonDescription('invalid_proofs'))
                    .toContain('do not match the required task');

                expect(getRejectionReasonDescription('wrong_platform'))
                    .toContain('wrong platform');
            });

            it('should return fallback for unknown reasons', () => {
                const description = getRejectionReasonDescription('unknown' as any);
                expect(description).toBe('Unknown rejection reason');
            });
        });

        describe('calculateReviewStats', () => {
            it('should calculate correct statistics', () => {
                const reviews = [
                    { action: 'approve' as const, submissionId: '1', reviewerId: '1' },
                    { action: 'approve' as const, submissionId: '2', reviewerId: '1' },
                    { action: 'reject' as const, submissionId: '3', reviewerId: '1' },
                    { action: 'dispute' as const, submissionId: '4', reviewerId: '1' }
                ];

                const stats = calculateReviewStats(reviews);
                expect(stats.total).toBe(4);
                expect(stats.approved).toBe(2);
                expect(stats.rejected).toBe(1);
                expect(stats.disputed).toBe(1);
            });

            it('should handle empty reviews array', () => {
                const stats = calculateReviewStats([]);
                expect(stats.total).toBe(0);
                expect(stats.approved).toBe(0);
                expect(stats.rejected).toBe(0);
                expect(stats.disputed).toBe(0);
                expect(stats.averageTime).toBe(0);
            });

            it('should calculate average review time', () => {
                const reviews = [
                    { action: 'approve' as const, submissionId: '1', reviewerId: '1' },
                    { action: 'reject' as const, submissionId: '2', reviewerId: '1' }
                ];

                const stats = calculateReviewStats(reviews);
                expect(stats.averageTime).toBe(0); // Currently returns 0 as implementation is placeholder
            });
        });
    });

    describe('Error Messages', () => {
        it('should provide helpful error messages for missing required fields', () => {
            const decision = {
                action: 'approve' as const
                // Missing submissionId and reviewerId
            };

            const result = ReviewDecisionSchema.safeParse(decision);
            expect(result.success).toBe(false);
            if (!result.success) {
                const submissionIdError = result.error.issues.find(issue => issue.path.includes('submissionId'));
                const reviewerIdError = result.error.issues.find(issue => issue.path.includes('reviewerId'));
                expect(submissionIdError).toBeDefined();
                expect(reviewerIdError).toBeDefined();
            }
        });

        it('should provide helpful error messages for invalid UUIDs', () => {
            const decision = {
                action: 'approve' as const,
                submissionId: 'invalid-uuid',
                reviewerId: 'invalid-uuid'
            };

            const result = ReviewDecisionSchema.safeParse(decision);
            expect(result.success).toBe(false);
            if (!result.success) {
                const submissionIdError = result.error.issues.find(issue => issue.path.includes('submissionId'));
                const reviewerIdError = result.error.issues.find(issue => issue.path.includes('reviewerId'));
                expect(submissionIdError?.message).toContain('Invalid submission ID format');
                expect(reviewerIdError?.message).toContain('Invalid reviewer ID format');
            }
        });

        it('should provide helpful error messages for invalid awarded honors', () => {
            const decision = {
                action: 'approve' as const,
                submissionId: '123e4567-e89b-12d3-a456-426614174000',
                reviewerId: '123e4567-e89b-12d3-a456-426614174001',
                awardedHonors: -50
            };

            const result = ReviewDecisionSchema.safeParse(decision);
            expect(result.success).toBe(false);
            if (!result.success) {
                const honorsError = result.error.issues.find(issue => issue.path.includes('awardedHonors'));
                expect(honorsError?.message).toContain('positive');
            }
        });
    });
});
