import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PLATFORM_TASKS } from '@ensei/shared-types';
import { missionEngineClient } from '../lib/serviceClients';
// Temporary types until validation schemas are properly built
interface CreateFixedMissionRequest {
    model: 'fixed';
    platform: string;
    type: string;
    isPremium: boolean;
    cap: number;
    tasks: string[];
    tweetLink: string;
    instructions: string;
}

interface CreateDegenMissionRequest {
    model: 'degen';
    platform: string;
    type: string;
    isPremium: boolean;
    durationHours: number;
    winnersCap: number;
    tasks: string[];
    tweetLink: string;
    instructions: string;
}

interface ReviewDecision {
    action: 'approve' | 'reject';
    reviewerId: string;
    reason?: string;
}
// Use Mission Engine service for pricing calculation
async function calculateMissionPricing(request: any): Promise<any> {
    try {
        return await missionEngineClient.calculatePricing(request);
    } catch (error) {
        throw new Error(`Mission pricing calculation failed: ${(error as Error).message}`);
    }
}

async function validateDegenMission(durationHours: number, winnersCap: number): Promise<{ isValid: boolean; error?: string }> {
    try {
        const result = await missionEngineClient.validateDegenMission(durationHours, winnersCap);
        return {
            isValid: result.isValid,
            error: result.error
        };
    } catch (error) {
        return {
            isValid: false,
            error: `Degen mission validation failed: ${(error as Error).message}`
        };
    }
}

// Stub DAL (Data Access Layer) for missions
const missionsDB = new Map<string, any>();
const submissionsDB = new Map<string, any>();
let missionIdCounter = 1;
let submissionIdCounter = 1;

// Stub mission creation
function createMission(missionData: any) {
    const id = `mission_${missionIdCounter++}`;
    const mission = {
        id,
        ...missionData,
        created_at: new Date().toISOString(),
        status: 'active'
    };
    missionsDB.set(id, mission);
    return mission;
}

// Stub mission listing
function listMissions() {
    return Array.from(missionsDB.values());
}

// Stub submission creation
function createSubmission(submissionData: any) {
    const id = `submission_${submissionIdCounter++}`;
    const submission = {
        id,
        ...submissionData,
        created_at: new Date().toISOString(),
        status: 'pending'
    };
    submissionsDB.set(id, submission);
    return submission;
}

// Stub submission review
function reviewSubmission(submissionId: string, reviewData: ReviewDecision) {
    const submission = submissionsDB.get(submissionId);
    if (!submission) {
        throw new Error('Submission not found');
    }

    submission.status = reviewData.action;
    submission.reviewed_at = new Date().toISOString();
    submission.reviewer_id = reviewData.reviewerId;
    submission.reason = reviewData.reason;

    // Stub ledger write
    if (reviewData.action === 'approve') {
        console.log(`Ledger: Credit user ${submission.user_id} with honors`);
    }

    return submission;
}

export async function missionRoutes(fastify: FastifyInstance) {
    // Test route
    fastify.get('/v1/test', async (request: FastifyRequest, reply: FastifyReply) => {
        return { message: 'Mission routes are working' };
    });

    // POST /v1/missions - Create mission (requires authentication)
    fastify.post('/v1/missions', {
        // preHandler: [authenticate], // Temporarily disabled for testing
        schema: {
            body: {
                type: 'object',
                required: ['model', 'platform', 'type', 'tasks'],
                properties: {
                    model: { type: 'string', enum: ['fixed', 'degen'] },
                    platform: { type: 'string' },
                    type: { type: 'string' },
                    target: { type: 'string' },
                    isPremium: { type: 'boolean' },
                    tasks: { type: 'array', items: { type: 'string' } },
                    cap: { type: 'number' },
                    durationHours: { type: 'number' },
                    winnersCap: { type: 'number' },
                    tweetLink: { type: 'string' },
                    instructions: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        model: { type: 'string', enum: ['fixed', 'degen'] },
                        total_cost_usd: { type: 'number' },
                        total_cost_honors: { type: 'number' },
                        // Fixed mission fields
                        per_user_honors: { type: 'number' },
                        // Degen mission fields
                        user_pool_honors: { type: 'number' },
                        per_winner_honors: { type: 'number' }
                    }
                }
            }
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as CreateFixedMissionRequest | CreateDegenMissionRequest;

            // Validate based on model
            if (body.model === 'fixed') {
                const validatedData = body as CreateFixedMissionRequest;

                // Calculate pricing using mission engine
                const pricing = await calculateMissionPricing({
                    platform: validatedData.platform,
                    type: validatedData.type,
                    model: 'fixed',
                    target: validatedData.isPremium ? 'premium' : 'all',
                    tasks: validatedData.tasks,
                    cap: validatedData.cap
                });

                // Persist mission
                const mission = createMission({
                    ...validatedData,
                    pricing
                });

                return {
                    id: mission.id,
                    model: 'fixed',
                    total_cost_usd: pricing.totalCostUsd,
                    total_cost_honors: pricing.totalCostHonors,
                    per_user_honors: pricing.perUserHonors
                };

            } else if (body.model === 'degen') {
                const validatedData = body as CreateDegenMissionRequest;

                // Validate degen mission constraints
                const validation = await validateDegenMission(validatedData.durationHours, validatedData.winnersCap);
                if (!validation.isValid) {
                    throw new Error(validation.error);
                }

                // Calculate pricing using mission engine
                const pricing = await calculateMissionPricing({
                    platform: validatedData.platform,
                    type: validatedData.type,
                    model: 'degen',
                    target: validatedData.isPremium ? 'premium' : 'all',
                    tasks: validatedData.tasks,
                    durationHours: validatedData.durationHours,
                    winnersCap: validatedData.winnersCap
                });

                // Persist mission
                const mission = createMission({
                    ...validatedData,
                    pricing
                });

                return {
                    id: mission.id,
                    model: 'degen',
                    total_cost_usd: pricing.totalCostUsd,
                    total_cost_honors: pricing.totalCostHonors,
                    user_pool_honors: pricing.userPoolHonors,
                    per_winner_honors: pricing.perWinnerHonors
                };
            }

            throw new Error('Invalid mission model');

        } catch (error) {
            if (error instanceof Error) {
                return reply.status(400).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // GET /v1/missions - List missions
    fastify.get('/v1/missions', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const missions = listMissions();
            return { missions };
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // GET /v1/missions/:id (single mission) → fetch by ID
    fastify.get('/v1/missions/:id', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            }
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const mission = missionsDB.get(id);

            if (!mission) {
                return reply.status(404).send({ error: 'Mission not found' });
            }

            return mission;
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // POST /v1/missions/:id/submit - Submit proof
    fastify.post('/v1/missions/:id/submit', {
        // preHandler: [authenticate], // Temporarily disabled for testing
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                required: ['proofs'],
                properties: {
                    proofs: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                type: { type: 'string', enum: ['image', 'video', 'text', 'url'] },
                                content: { type: 'string' }
                            },
                            required: ['type', 'content']
                        }
                    }
                }
            }
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as any;

            // Validate submission
            const validatedData = body as any;

            // Check if mission exists
            const mission = missionsDB.get(id);
            if (!mission) {
                return reply.status(404).send({ error: 'Mission not found' });
            }

            // Create submission
            const submission = createSubmission({
                mission_id: id,
                user_id: validatedData.userId,
                proofs: validatedData.proofs
            });

            // Enqueue for review (stub)
            console.log(`Submission ${submission.id} enqueued for review`);

            return {
                id: submission.id,
                status: submission.status,
                created_at: submission.created_at
            };

        } catch (error) {
            if (error instanceof Error) {
                return reply.status(400).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // POST /v1/submissions/:id/review - Review submission
    fastify.post('/v1/submissions/:id/review', {
        // preHandler: [authenticate, requireRole(['admin', 'moderator'])], // Temporarily disabled for testing
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                required: ['action', 'reviewerId'],
                properties: {
                    action: { type: 'string', enum: ['approve', 'reject'] },
                    reviewerId: { type: 'string' },
                    reason: { type: 'string' }
                }
            }
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as ReviewDecision;

            // Validate review decision
            const validatedData = body as ReviewDecision;

            // Review submission
            const submission = reviewSubmission(id, validatedData);

            return {
                id: submission.id,
                status: submission.status,
                reviewed_at: submission.reviewed_at
            };

        } catch (error) {
            if (error instanceof Error) {
                return reply.status(400).send({ error: error.message });
            }
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // GET /v1/meta/degen-presets - Get degen presets for UI
    fastify.get('/v1/meta/degen-presets', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Import from mission engine
            const DEGEN_PRESETS = [
                { hours: 1, costUSD: 15, maxWinners: 1, label: '1h - $15' },
                { hours: 2, costUSD: 30, maxWinners: 1, label: '2h - $30' },
                { hours: 4, costUSD: 60, maxWinners: 1, label: '4h - $60' },
                { hours: 8, costUSD: 150, maxWinners: 3, label: '8h - $150' },
                { hours: 12, costUSD: 300, maxWinners: 5, label: '12h - $300' },
                { hours: 24, costUSD: 600, maxWinners: 10, label: '24h - $600' },
                { hours: 36, costUSD: 900, maxWinners: 10, label: '36h - $900' },
                { hours: 48, costUSD: 1200, maxWinners: 10, label: '48h - $1200' },
                { hours: 72, costUSD: 1800, maxWinners: 10, label: '72h - $1800' },
                { hours: 96, costUSD: 2400, maxWinners: 10, label: '96h - $2400' },
                { hours: 120, costUSD: 3000, maxWinners: 10, label: '120h - $3000' },
                { hours: 168, costUSD: 4200, maxWinners: 10, label: '168h - $4200' },
                { hours: 240, costUSD: 6000, maxWinners: 10, label: '240h - $6000' }
            ];
            return { presets: DEGEN_PRESETS };
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // GET /v1/meta/task-catalog - Get task catalog from Mission Engine
    fastify.get('/v1/meta/task-catalog', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const taskCatalog = await missionEngineClient.getTaskCatalog();
            return taskCatalog;
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // GET /v1/missions/my - Get user's missions
    fastify.get('/v1/missions/my', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Stub: return user's missions (filtered by user_id)
            const userMissions = Array.from(missionsDB.values()).filter(mission =>
                mission.user_id === 'demo_user' // Stub user ID
            );
            return userMissions; // Return array directly, not wrapped in object
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // GET /v1/submissions - Get all submissions
    fastify.get('/v1/submissions', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const submissions = Array.from(submissionsDB.values());
            return submissions; // Return array directly, not wrapped in object
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // Rewards endpoints are handled in rewardsRoutes; duplicates removed here

    // GET /v1/presets - Get degen duration presets from Mission Engine
    fastify.get('/v1/presets', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const presets = await missionEngineClient.getDegenPresets();
            return presets;
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // GET /v1/tasks - Get platform tasks catalog
    fastify.get('/v1/tasks', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Add custom platform to the platform tasks
            const platformTasksWithCustom = {
                ...PLATFORM_TASKS,
                custom: {
                    engage: [
                        { key: 'social_engagement', name: 'Social Engagement', description: 'Engage with social content' }
                    ],
                    content: [
                        { key: 'content_creation', name: 'Content Creation', description: 'Create custom content' }
                    ],
                    ambassador: [
                        { key: 'brand_promotion', name: 'Brand Promotion', description: 'Promote brand/product' }
                    ]
                }
            };

            return platformTasksWithCustom;
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
}
