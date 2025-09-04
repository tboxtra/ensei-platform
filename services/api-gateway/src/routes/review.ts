import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Review assignment and vote schemas
const createReviewVoteSchema = z.object({
    assignmentId: z.string().uuid(),
    rating: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5)
    ]),
    commentLink: z.string().url().min(1), // reviewer's comment URL on submitter's post
});

// In-memory storage for demo
const reviewAssignments = new Map();
const reviewVotes = new Map();

// Initialize demo data
function initializeDemoReviewData() {
    // Create sample review assignments
    const assignments = [
        {
            id: 'assignment_1',
            missionId: 'mission_1',
            submissionId: 'submission_1',
            reviewerUserId: 'reviewer_1',
            status: 'pending',
            createdAt: new Date().toISOString(),
            mission: {
                id: 'mission_1',
                title: 'Twitter Engagement Campaign',
                platform: 'twitter',
                type: 'engage',
            },
            submission: {
                id: 'submission_1',
                userId: 'user_123',
                proofs: ['https://twitter.com/user/status/123456789'],
                submittedAt: new Date(Date.now() - 3600000).toISOString(),
            }
        },
        {
            id: 'assignment_2',
            missionId: 'mission_2',
            submissionId: 'submission_2',
            reviewerUserId: 'reviewer_1',
            status: 'pending',
            createdAt: new Date().toISOString(),
            mission: {
                id: 'mission_2',
                title: 'Instagram Content Creation',
                platform: 'instagram',
                type: 'content',
            },
            submission: {
                id: 'submission_2',
                userId: 'user_456',
                proofs: ['https://instagram.com/p/ABC123/'],
                submittedAt: new Date(Date.now() - 7200000).toISOString(),
            }
        }
    ];

    assignments.forEach(assignment => {
        reviewAssignments.set(assignment.id, assignment);
    });
}

export async function reviewRoutes(fastify: FastifyInstance) {
    // Initialize demo data
    initializeDemoReviewData();

    // GET /v1/review/queue - Get pending review assignments for the authenticated reviewer
    fastify.get('/v1/review/queue', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // For demo purposes, return assignments for a fixed reviewer
            const reviewerId = 'reviewer_1'; // Would come from auth token in production

            const pendingAssignments = Array.from(reviewAssignments.values())
                .filter(assignment =>
                    assignment.reviewerUserId === reviewerId &&
                    assignment.status === 'pending'
                );

            return pendingAssignments;
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // POST /v1/review/vote - Submit a review vote
    fastify.post('/v1/review/vote', {
        schema: {
            body: {
                type: 'object',
                required: ['assignmentId', 'rating', 'commentLink'],
                properties: {
                    assignmentId: { type: 'string', format: 'uuid' },
                    rating: { type: 'number', enum: [1, 2, 3, 4, 5] },
                    commentLink: { type: 'string' }
                }
            }
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as z.infer<typeof createReviewVoteSchema>;
            const { assignmentId, rating, commentLink } = body;

            // Verify assignment exists and is pending
            const assignment = reviewAssignments.get(assignmentId);
            if (!assignment) {
                return reply.status(404).send({ error: 'Review assignment not found' });
            }

            if (assignment.status !== 'pending') {
                return reply.status(400).send({ error: 'Assignment is not pending review' });
            }

            // Create the vote
            const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const vote = {
                id: voteId,
                assignmentId,
                reviewerUserId: assignment.reviewerUserId,
                rating,
                commentLink,
                createdAt: new Date().toISOString()
            };

            reviewVotes.set(voteId, vote);

            // Update assignment status
            assignment.status = 'completed';
            reviewAssignments.set(assignmentId, assignment);

            // Check if this submission has received 5 votes
            const submissionVotes = Array.from(reviewVotes.values())
                .filter(v => {
                    const votedAssignment = reviewAssignments.get(v.assignmentId);
                    return votedAssignment?.submissionId === assignment.submissionId;
                });

            if (submissionVotes.length >= 5) {
                // Calculate average rating
                const avgRating = submissionVotes.reduce((sum, v) => sum + v.rating, 0) / submissionVotes.length;

                // Accept/reject based on threshold (2.5)
                const submissionStatus = avgRating >= 2.5 ? 'accepted' : 'rejected';

                console.log(`Submission ${assignment.submissionId} ${submissionStatus} with average rating ${avgRating.toFixed(2)}`);

                // Here you would update the submission status in the database
                // and trigger reviewer payouts
            }

            return {
                id: voteId,
                status: 'submitted',
                submittedAt: new Date().toISOString(),
                message: 'Review vote submitted successfully'
            };
        } catch (error) {
            console.error('Error submitting review vote:', error);
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // GET /v1/review/stats - Get reviewer statistics
    fastify.get('/v1/review/stats', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const reviewerId = 'reviewer_1'; // Would come from auth token in production

            const reviewerVotes = Array.from(reviewVotes.values())
                .filter(vote => vote.reviewerUserId === reviewerId);

            const completedAssignments = Array.from(reviewAssignments.values())
                .filter(assignment =>
                    assignment.reviewerUserId === reviewerId &&
                    assignment.status === 'completed'
                );

            const stats = {
                totalReviews: reviewerVotes.length,
                pendingReviews: Array.from(reviewAssignments.values())
                    .filter(assignment =>
                        assignment.reviewerUserId === reviewerId &&
                        assignment.status === 'pending'
                    ).length,
                completedThisWeek: completedAssignments.filter(assignment => {
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return new Date(assignment.createdAt) > weekAgo;
                }).length,
                averageRating: reviewerVotes.length > 0
                    ? reviewerVotes.reduce((sum, vote) => sum + vote.rating, 0) / reviewerVotes.length
                    : 0,
                earnings: {
                    totalHonors: reviewerVotes.length * 10, // 10 honors per review (demo)
                    thisWeek: completedAssignments.filter(assignment => {
                        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        return new Date(assignment.createdAt) > weekAgo;
                    }).length * 10
                }
            };

            return stats;
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // GET /v1/review/history - Get review history
    fastify.get('/v1/review/history', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const reviewerId = 'reviewer_1'; // Would come from auth token in production

            const reviewHistory = Array.from(reviewVotes.values())
                .filter(vote => vote.reviewerUserId === reviewerId)
                .map(vote => {
                    const assignment = reviewAssignments.get(vote.assignmentId);
                    return {
                        id: vote.id,
                        rating: vote.rating,
                        commentLink: vote.commentLink,
                        submittedAt: vote.createdAt,
                        mission: assignment?.mission,
                        submission: assignment?.submission
                    };
                })
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

            return reviewHistory;
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
}


