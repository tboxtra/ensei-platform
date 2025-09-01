import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PLATFORM_TASKS } from '@ensei/shared-types';
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
// Simplified pricing calculation (temporary until mission-engine is fixed)
function calculateMissionPricing(request: any): any {
    const { model, platform, type, target, tasks, cap, durationHours, winnersCap } = request;

    // Validate tasks against platform tasks
    const platformTasks = PLATFORM_TASKS[platform as keyof typeof PLATFORM_TASKS];
    if (!platformTasks) {
        throw new Error(`Invalid platform: ${platform}`);
    }

    const missionTypeTasks = platformTasks[type as keyof typeof platformTasks];
    if (!missionTypeTasks) {
        throw new Error(`Invalid mission type: ${type} for platform: ${platform}`);
    }

    const validTaskKeys = missionTypeTasks.map(task => task.key);
    const invalidTasks = tasks.filter((task: string) => !validTaskKeys.includes(task));
    if (invalidTasks.length > 0) {
        throw new Error(`Invalid tasks for ${platform} ${type}: ${invalidTasks.join(', ')}`);
    }

    if (model === 'fixed') {
        const baseCost = cap * 2; // $2 per user
        const totalCost = target === 'premium' ? baseCost * 5 : baseCost;
        return {
            model: 'fixed',
            totalCostUsd: totalCost,
            totalCostHonors: totalCost * 450,
            perUserHonors: 100,
            breakdown: {
                tasksHonors: tasks.length * 50,
                platformFee: cap * 1,
                premiumMultiplier: target === 'premium' ? 5 : undefined
            }
        };
    } else {
        const baseCost = durationHours * 10; // $10 per hour
        const totalCost = target === 'premium' ? baseCost * 5 : baseCost;
        const userPoolHonors = Math.floor(totalCost * 450 * 0.5);
        const perWinnerHonors = Math.floor(userPoolHonors / winnersCap);

        return {
            model: 'degen',
            totalCostUsd: totalCost,
            totalCostHonors: totalCost * 450,
            userPoolHonors,
            perWinnerHonors,
            breakdown: {
                tasksHonors: tasks.length * 50,
                platformFee: durationHours * 5,
                premiumMultiplier: target === 'premium' ? 5 : undefined
            }
        };
    }
}

function validateDegenMission(durationHours: number, winnersCap: number): { isValid: boolean; error?: string } {
    const validDurations = [1, 2, 4, 8, 12, 24, 36, 48, 72, 96, 120, 168, 240];
    if (!validDurations.includes(durationHours)) {
        return { isValid: false, error: 'Invalid duration' };
    }

    const maxWinners = Math.min(10, Math.floor(durationHours / 8));
    if (winnersCap < 1 || winnersCap > maxWinners) {
        return { isValid: false, error: `Winners cap must be between 1 and ${maxWinners}` };
    }

    return { isValid: true };
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
                const pricing = calculateMissionPricing({
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
                const validation = validateDegenMission(validatedData.durationHours, validatedData.winnersCap);
                if (!validation.isValid) {
                    throw new Error(validation.error);
                }

                // Calculate pricing using mission engine
                const pricing = calculateMissionPricing({
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

    // GET /v1/meta/task-catalog - Get task catalog
    fastify.get('/v1/meta/task-catalog', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const TASK_CATALOG = {
                twitter: {
                    engage: [
                        { key: 'like', name: 'Like Post', honors: 50 },
                        { key: 'retweet', name: 'Retweet', honors: 100 },
                        { key: 'comment', name: 'Comment', honors: 150 },
                        { key: 'quote', name: 'Quote Tweet', honors: 200 }
                    ],
                    content: [
                        { key: 'meme', name: 'Create Meme', honors: 300 },
                        { key: 'thread', name: 'Create Thread', honors: 500 },
                        { key: 'article', name: 'Write Article', honors: 400 },
                        { key: 'videoreview', name: 'Video Review', honors: 600 }
                    ],
                    ambassador: [
                        { key: 'pfp', name: 'Change PFP', honors: 250 },
                        { key: 'name_bio_keywords', name: 'Add Keywords to Bio', honors: 200 },
                        { key: 'pinned_tweet', name: 'Pin Tweet', honors: 300 },
                        { key: 'poll', name: 'Create Poll', honors: 150 },
                        { key: 'spaces', name: 'Host Spaces', honors: 800 },
                        { key: 'community_raid', name: 'Community Raid', honors: 400 }
                    ]
                },
                instagram: {
                    engage: [
                        { key: 'like', name: 'Like Post', honors: 50 },
                        { key: 'comment', name: 'Comment', honors: 150 },
                        { key: 'follow', name: 'Follow Account', honors: 250 },
                        { key: 'story_repost', name: 'Repost Story', honors: 200 }
                    ],
                    content: [
                        { key: 'feed_post', name: 'Feed Post', honors: 300 },
                        { key: 'reel', name: 'Create Reel', honors: 500 },
                        { key: 'carousel', name: 'Carousel Post', honors: 400 },
                        { key: 'meme', name: 'Create Meme', honors: 250 }
                    ],
                    ambassador: [
                        { key: 'pfp', name: 'Change PFP', honors: 250 },
                        { key: 'hashtag_in_bio', name: 'Add Hashtag to Bio', honors: 200 },
                        { key: 'story_highlight', name: 'Story Highlight', honors: 300 }
                    ]
                },
                tiktok: {
                    engage: [
                        { key: 'like', name: 'Like Video', honors: 50 },
                        { key: 'comment', name: 'Comment', honors: 150 },
                        { key: 'repost_duet', name: 'Repost/Duet', honors: 300 },
                        { key: 'follow', name: 'Follow Account', honors: 250 }
                    ],
                    content: [
                        { key: 'skit', name: 'Create Skit', honors: 400 },
                        { key: 'challenge', name: 'Challenge Video', honors: 500 },
                        { key: 'product_review', name: 'Product Review', honors: 600 },
                        { key: 'status_style', name: 'Status Style Video', honors: 350 }
                    ],
                    ambassador: [
                        { key: 'pfp', name: 'Change PFP', honors: 250 },
                        { key: 'hashtag_in_bio', name: 'Add Hashtag to Bio', honors: 200 },
                        { key: 'pinned_branded_video', name: 'Pin Branded Video', honors: 400 }
                    ]
                },
                facebook: {
                    engage: [
                        { key: 'like', name: 'Like Post', honors: 50 },
                        { key: 'comment', name: 'Comment', honors: 150 },
                        { key: 'follow', name: 'Follow Page', honors: 250 },
                        { key: 'share_post', name: 'Share Post', honors: 200 }
                    ],
                    content: [
                        { key: 'group_post', name: 'Group Post', honors: 300 },
                        { key: 'video', name: 'Create Video', honors: 400 },
                        { key: 'meme_flyer', name: 'Meme/Flyer', honors: 250 }
                    ],
                    ambassador: [
                        { key: 'pfp', name: 'Change PFP', honors: 250 },
                        { key: 'bio_keyword', name: 'Add Keyword to Bio', honors: 200 },
                        { key: 'pinned_post', name: 'Pin Post', honors: 300 }
                    ]
                },
                whatsapp: {
                    engage: [
                        { key: 'status_50_views', name: 'Status ≥50 Views', honors: 300 }
                    ],
                    content: [
                        { key: 'flyer_clip_status', name: 'Flyer/Clip Status', honors: 400 },
                        { key: 'broadcast_message', name: 'Broadcast Message', honors: 500 }
                    ],
                    ambassador: [
                        { key: 'pfp', name: 'Change PFP', honors: 250 },
                        { key: 'keyword_in_about', name: 'Add Keyword to About', honors: 200 }
                    ]
                },
                snapchat: {
                    engage: [
                        { key: 'story_100_views', name: 'Story ≥100 Views', honors: 400 },
                        { key: 'snap_repost', name: 'Repost Snap', honors: 300 }
                    ],
                    content: [
                        { key: 'meme_flyer_snap', name: 'Meme/Flyer Snap', honors: 350 },
                        { key: 'branded_snap_video', name: 'Branded Snap Video', honors: 500 }
                    ],
                    ambassador: [
                        { key: 'pfp_avatar', name: 'Change PFP/Avatar', honors: 250 },
                        { key: 'hashtag_in_profile', name: 'Add Hashtag to Profile', honors: 200 },
                        { key: 'branded_lens', name: 'Use Branded Lens', honors: 400 }
                    ]
                },
                telegram: {
                    engage: [
                        { key: 'join_channel', name: 'Join Channel', honors: 100 },
                        { key: 'react_to_post', name: 'React to Post', honors: 50 },
                        { key: 'reply_in_group', name: 'Reply in Group', honors: 150 },
                        { key: 'share_invite', name: 'Share Invite', honors: 200 }
                    ],
                    content: [
                        { key: 'channel_post', name: 'Channel Post', honors: 300 },
                        { key: 'short_video_in_channel', name: 'Short Video in Channel', honors: 400 },
                        { key: 'guide_thread', name: 'Guide Thread', honors: 500 }
                    ],
                    ambassador: [
                        { key: 'pfp', name: 'Change PFP', honors: 250 },
                        { key: 'mention_in_bio', name: 'Add Mention to Bio', honors: 200 },
                        { key: 'pin_invite_link', name: 'Pin Invite Link', honors: 300 }
                    ]
                }
            };
            return TASK_CATALOG;
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

    // GET /v1/rewards/claimable - Get claimable rewards
    fastify.get('/v1/rewards/claimable', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Stub: return claimable rewards
            const claimableRewards = [
                {
                    id: 'reward_1',
                    missionId: 'mission_1',
                    missionTitle: 'Twitter Engagement Campaign',
                    platform: 'twitter',
                    type: 'engage',
                    reward: 150,
                    submittedAt: '2024-01-15T10:00:00Z',
                    approvedAt: '2024-01-15T12:00:00Z',
                    status: 'claimable'
                },
                {
                    id: 'reward_2',
                    missionId: 'mission_2',
                    missionTitle: 'Instagram Content Creation',
                    platform: 'instagram',
                    type: 'content',
                    reward: 300,
                    submittedAt: '2024-01-14T15:30:00Z',
                    approvedAt: '2024-01-15T09:00:00Z',
                    status: 'claimable'
                }
            ];
            return claimableRewards; // Return array directly, not wrapped in object
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // POST /v1/rewards/:id/claim - Claim a reward
    fastify.post('/v1/rewards/:id/claim', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            }
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            // Stub: claim reward logic
            return {
                id,
                status: 'claimed',
                claimedAt: new Date().toISOString()
            };
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // POST /v1/rewards/claim-all - Claim all rewards
    fastify.post('/v1/rewards/claim-all', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Stub: claim all rewards logic
            return {
                claimedCount: 2,
                totalAmount: 450,
                claimedAt: new Date().toISOString()
            };
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // GET /v1/wallet/balance - Get wallet balance
    fastify.get('/v1/wallet/balance', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Stub: return wallet balance
            const balance = {
                honors: 1250,
                usd: 2.78,
                pendingHonors: 450,
                pendingUsd: 1.00
            };
            return balance;
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // GET /v1/wallet/transactions - Get transactions
    fastify.get('/v1/wallet/transactions', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Stub: return transactions
            const transactions = [
                {
                    id: 'tx_1',
                    type: 'earned',
                    amount: 150,
                    description: 'Twitter engagement mission reward',
                    date: '2024-01-15T12:00:00Z',
                    status: 'completed'
                },
                {
                    id: 'tx_2',
                    type: 'earned',
                    amount: 300,
                    description: 'Instagram content creation reward',
                    date: '2024-01-14T15:30:00Z',
                    status: 'completed'
                },
                {
                    id: 'tx_3',
                    type: 'withdrawn',
                    amount: 500,
                    description: 'Withdrawal to TON wallet',
                    date: '2024-01-13T10:00:00Z',
                    status: 'completed'
                }
            ];
            return transactions; // Return array directly, not wrapped in object
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // POST /v1/wallet/withdraw - Withdraw funds
    fastify.post('/v1/wallet/withdraw', {
        schema: {
            body: {
                type: 'object',
                required: ['amount'],
                properties: {
                    amount: { type: 'number' }
                }
            }
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as { amount: number };
            // Stub: withdrawal logic
            return {
                id: 'withdrawal_1',
                amount: body.amount,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
        } catch (error) {
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
}
