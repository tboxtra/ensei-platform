import {
    CreateSubmissionSchema,
    UpdateSubmissionSchema,
    ProofContentSchema,
    ProofTypeSchema,
    SubmissionStatusSchema,
    validateProofContent,
    validateSubmission,
    getProofType
} from '../mission/submission.schema';

describe('Submission Schema', () => {
    describe('CreateSubmissionSchema', () => {
        it('should validate a complete submission request', () => {
            const validSubmission = {
                missionId: '123e4567-e89b-12d3-a456-426614174000',
                proofs: [
                    {
                        type: 'image' as const,
                        content: 'https://example.com/image.jpg',
                        taskId: '123e4567-e89b-12d3-a456-426614174001'
                    }
                ]
            };

            const result = CreateSubmissionSchema.safeParse(validSubmission);
            expect(result.success).toBe(true);
        });

        it('should validate with optional fields', () => {
            const validSubmission = {
                missionId: '123e4567-e89b-12d3-a456-426614174000',
                proofs: [
                    {
                        type: 'text' as const,
                        content: 'I completed the task successfully',
                        metadata: {
                            wordCount: 5,
                            language: 'en'
                        }
                    }
                ],
                notes: 'Additional context for the submission',
                userId: '123e4567-e89b-12d3-a456-426614174002',
                status: 'pending' as const,
                earnedHonors: 500
            };

            const result = CreateSubmissionSchema.safeParse(validSubmission);
            expect(result.success).toBe(true);
        });

        it('should require missionId', () => {
            const submission = {
                proofs: [
                    {
                        type: 'image' as const,
                        content: 'https://example.com/image.jpg'
                    }
                ]
            };

            const result = CreateSubmissionSchema.safeParse(submission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const missionIdError = result.error.issues.find(issue => issue.path.includes('missionId'));
                expect(missionIdError).toBeDefined();
            }
        });

        it('should require valid UUID for missionId', () => {
            const submission = {
                missionId: 'invalid-uuid',
                proofs: [
                    {
                        type: 'image' as const,
                        content: 'https://example.com/image.jpg'
                    }
                ]
            };

            const result = CreateSubmissionSchema.safeParse(submission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const missionIdError = result.error.issues.find(issue => issue.path.includes('missionId'));
                expect(missionIdError?.message).toContain('Invalid mission ID format');
            }
        });

        it('should require at least one proof', () => {
            const submission = {
                missionId: '123e4567-e89b-12d3-a456-426614174000',
                proofs: []
            };

            const result = CreateSubmissionSchema.safeParse(submission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const proofsError = result.error.issues.find(issue => issue.path.includes('proofs'));
                expect(proofsError?.message).toContain('At least one proof is required');
            }
        });

        it('should validate multiple proofs', () => {
            const submission = {
                missionId: '123e4567-e89b-12d3-a456-426614174000',
                proofs: [
                    {
                        type: 'image' as const,
                        content: 'https://example.com/image1.jpg'
                    },
                    {
                        type: 'text' as const,
                        content: 'Additional proof text'
                    },
                    {
                        type: 'url' as const,
                        content: 'https://example.com/proof'
                    }
                ]
            };

            const result = CreateSubmissionSchema.safeParse(submission);
            expect(result.success).toBe(true);
        });
    });

    describe('ProofContentSchema', () => {
        it('should validate image proof', () => {
            const proof = {
                type: 'image' as const,
                content: 'https://example.com/image.jpg',
                metadata: {
                    size: 1024,
                    format: 'jpg',
                    dimensions: {
                        width: 800,
                        height: 600
                    }
                }
            };

            const result = ProofContentSchema.safeParse(proof);
            expect(result.success).toBe(true);
        });

        it('should validate video proof', () => {
            const proof = {
                type: 'video' as const,
                content: 'https://example.com/video.mp4',
                metadata: {
                    size: 5000,
                    format: 'mp4',
                    duration: 30
                }
            };

            const result = ProofContentSchema.safeParse(proof);
            expect(result.success).toBe(true);
        });

        it('should validate text proof', () => {
            const proof = {
                type: 'text' as const,
                content: 'I completed the task as requested',
                metadata: {
                    wordCount: 7,
                    language: 'en'
                }
            };

            const result = ProofContentSchema.safeParse(proof);
            expect(result.success).toBe(true);
        });

        it('should validate URL proof', () => {
            const proof = {
                type: 'url' as const,
                content: 'https://example.com/proof',
                metadata: {
                    title: 'Proof Page',
                    description: 'Evidence of task completion'
                }
            };

            const result = ProofContentSchema.safeParse(proof);
            expect(result.success).toBe(true);
        });

        it('should validate screenshot proof', () => {
            const proof = {
                type: 'screenshot' as const,
                content: 'https://example.com/screenshot.png',
                metadata: {
                    size: 2048,
                    format: 'png',
                    dimensions: {
                        width: 1920,
                        height: 1080
                    },
                    platform: 'twitter'
                }
            };

            const result = ProofContentSchema.safeParse(proof);
            expect(result.success).toBe(true);
        });

        it('should require proof content', () => {
            const proof = {
                type: 'image' as const,
                content: ''
            };

            const result = ProofContentSchema.safeParse(proof);
            expect(result.success).toBe(false);
            if (!result.success) {
                const contentError = result.error.issues.find(issue => issue.path.includes('content'));
                expect(contentError?.message).toContain('Proof content is required');
            }
        });

        it('should validate taskId as UUID', () => {
            const proof = {
                type: 'image' as const,
                content: 'https://example.com/image.jpg',
                taskId: 'invalid-uuid'
            };

            const result = ProofContentSchema.safeParse(proof);
            expect(result.success).toBe(false);
            if (!result.success) {
                const taskIdError = result.error.issues.find(issue => issue.path.includes('taskId'));
                expect(taskIdError?.message).toContain('Invalid task ID format');
            }
        });

        it('should validate verification score range', () => {
            const proof = {
                type: 'image' as const,
                content: 'https://example.com/image.jpg',
                verificationScore: 150 // Should be 0-100
            };

            const result = ProofContentSchema.safeParse(proof);
            expect(result.success).toBe(false);
            if (!result.success) {
                const scoreError = result.error.issues.find(issue => issue.path.includes('verificationScore'));
                expect(scoreError).toBeDefined();
            }
        });
    });

    describe('UpdateSubmissionSchema', () => {
        it('should validate a complete update request', () => {
            const validUpdate = {
                status: 'approved' as const,
                reviewerId: '123e4567-e89b-12d3-a456-426614174003',
                notes: 'Great work on this submission'
            };

            const result = UpdateSubmissionSchema.safeParse(validUpdate);
            expect(result.success).toBe(true);
        });

        it('should validate rejection with reason', () => {
            const validUpdate = {
                status: 'rejected' as const,
                rejectionReason: 'incomplete_proofs',
                reviewerId: '123e4567-e89b-12d3-a456-426614174003',
                notes: 'Please provide more complete proof'
            };

            const result = UpdateSubmissionSchema.safeParse(validUpdate);
            expect(result.success).toBe(true);
        });

        it('should require reviewerId', () => {
            const update = {
                status: 'approved' as const
            };

            const result = UpdateSubmissionSchema.safeParse(update);
            expect(result.success).toBe(false);
            if (!result.success) {
                const reviewerIdError = result.error.issues.find(issue => issue.path.includes('reviewerId'));
                expect(reviewerIdError).toBeDefined();
            }
        });

        it('should validate reviewerId as UUID', () => {
            const update = {
                status: 'approved' as const,
                reviewerId: 'invalid-uuid'
            };

            const result = UpdateSubmissionSchema.safeParse(update);
            expect(result.success).toBe(false);
            if (!result.success) {
                const reviewerIdError = result.error.issues.find(issue => issue.path.includes('reviewerId'));
                expect(reviewerIdError?.message).toContain('Invalid reviewer ID format');
            }
        });
    });

    describe('ProofTypeSchema', () => {
        it('should accept all valid proof types', () => {
            const validTypes = ['image', 'video', 'text', 'url', 'screenshot'] as const;

            validTypes.forEach(type => {
                const result = ProofTypeSchema.safeParse(type);
                expect(result.success).toBe(true);
            });
        });

        it('should reject invalid proof types', () => {
            const result = ProofTypeSchema.safeParse('invalid');
            expect(result.success).toBe(false);
        });
    });

    describe('SubmissionStatusSchema', () => {
        it('should accept all valid statuses', () => {
            const validStatuses = ['pending', 'approved', 'rejected', 'disputed'] as const;

            validStatuses.forEach(status => {
                const result = SubmissionStatusSchema.safeParse(status);
                expect(result.success).toBe(true);
            });
        });

        it('should reject invalid statuses', () => {
            const result = SubmissionStatusSchema.safeParse('invalid');
            expect(result.success).toBe(false);
        });
    });

    describe('Helper Functions', () => {
        describe('validateProofContent', () => {
            it('should validate correct proof content', () => {
                const proof = {
                    type: 'image' as const,
                    content: 'https://example.com/image.jpg'
                };

                const isValid = validateProofContent(proof);
                expect(isValid).toBe(true);
            });

            it('should reject invalid proof content', () => {
                const proof = {
                    type: 'image' as const,
                    content: '' // Empty content is invalid
                };

                const isValid = validateProofContent(proof);
                expect(isValid).toBe(false);
            });
        });

        describe('validateSubmission', () => {
            it('should validate correct submission', () => {
                const submission = {
                    missionId: '123e4567-e89b-12d3-a456-426614174000',
                    proofs: [
                        {
                            type: 'image' as const,
                            content: 'https://example.com/image.jpg'
                        }
                    ]
                };

                const isValid = validateSubmission(submission);
                expect(isValid).toBe(true);
            });

            it('should reject invalid submission', () => {
                const submission = {
                    missionId: 'invalid-uuid',
                    proofs: []
                };

                const isValid = validateSubmission(submission);
                expect(isValid).toBe(false);
            });
        });

        describe('getProofType', () => {
            it('should detect image URLs', () => {
                const imageUrls = [
                    'https://example.com/image.jpg',
                    'https://example.com/photo.png',
                    'https://example.com/pic.gif',
                    'https://example.com/img.webp'
                ];

                imageUrls.forEach(url => {
                    const type = getProofType(url);
                    expect(type).toBe('image');
                });
            });

            it('should detect video URLs', () => {
                const videoUrls = [
                    'https://example.com/video.mp4',
                    'https://example.com/movie.avi',
                    'https://example.com/clip.mov',
                    'https://example.com/film.webm'
                ];

                videoUrls.forEach(url => {
                    const type = getProofType(url);
                    expect(type).toBe('video');
                });
            });

            it('should detect URL content', () => {
                const urlContent = [
                    'https://example.com/page',
                    'http://example.com/site',
                    'https://twitter.com/user/status/123'
                ];

                urlContent.forEach(url => {
                    const type = getProofType(url);
                    expect(type).toBe('url');
                });
            });

            it('should default to text for other content', () => {
                const textContent = [
                    'I completed the task',
                    'Task completed successfully',
                    'Proof of completion'
                ];

                textContent.forEach(text => {
                    const type = getProofType(text);
                    expect(type).toBe('text');
                });
            });
        });
    });

    describe('Error Messages', () => {
        it('should provide helpful error messages for missing missionId', () => {
            const submission = {
                proofs: [
                    {
                        type: 'image' as const,
                        content: 'https://example.com/image.jpg'
                    }
                ]
            };

            const result = CreateSubmissionSchema.safeParse(submission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const missionIdError = result.error.issues.find(issue => issue.path.includes('missionId'));
                expect(missionIdError).toBeDefined();
            }
        });

        it('should provide helpful error messages for empty proofs', () => {
            const submission = {
                missionId: '123e4567-e89b-12d3-a456-426614174000',
                proofs: []
            };

            const result = CreateSubmissionSchema.safeParse(submission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const proofsError = result.error.issues.find(issue => issue.path.includes('proofs'));
                expect(proofsError?.message).toContain('At least one proof is required');
            }
        });

        it('should provide helpful error messages for invalid UUIDs', () => {
            const submission = {
                missionId: 'invalid-uuid',
                proofs: [
                    {
                        type: 'image' as const,
                        content: 'https://example.com/image.jpg'
                    }
                ]
            };

            const result = CreateSubmissionSchema.safeParse(submission);
            expect(result.success).toBe(false);
            if (!result.success) {
                const missionIdError = result.error.issues.find(issue => issue.path.includes('missionId'));
                expect(missionIdError?.message).toContain('Invalid mission ID format');
            }
        });
    });
});
