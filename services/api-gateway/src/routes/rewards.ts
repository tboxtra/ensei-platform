import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// In-memory rewards storage (replace with database in production)
const rewards = new Map<string, any>();

// Initialize demo rewards data
const initializeDemoRewards = () => {
    const demoRewards = [
        {
            id: 'reward_1',
            userId: 'user_1',
            missionId: 'mission_1',
            missionTitle: 'Twitter Engagement Campaign',
            platform: 'twitter',
            amount: 100,
            status: 'claimable',
            earnedAt: new Date(Date.now() - 86400000).toISOString(),
            expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
        },
        {
            id: 'reward_2',
            userId: 'user_1',
            missionId: 'mission_2',
            missionTitle: 'Instagram Content Creation',
            platform: 'instagram',
            amount: 18000,
            status: 'claimable',
            earnedAt: new Date(Date.now() - 172800000).toISOString(),
            expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
        },
        {
            id: 'reward_3',
            userId: 'user_1',
            missionId: 'mission_3',
            missionTitle: 'TikTok Ambassador Program',
            platform: 'tiktok',
            amount: 150,
            status: 'claimed',
            earnedAt: new Date(Date.now() - 259200000).toISOString(),
            claimedAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    demoRewards.forEach(reward => {
        rewards.set(reward.id, reward);
    });
};

// Initialize demo rewards
initializeDemoRewards();

export async function rewardsRoutes(fastify: FastifyInstance) {
    // Get claimable rewards
    fastify.get('/v1/rewards/claimable', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Return demo claimable rewards
            const claimableRewards = [
                {
                    id: 'reward_1',
                    missionId: 'mission_1',
                    missionTitle: 'Twitter Engagement Campaign',
                    platform: 'twitter',
                    amount: 100,
                    status: 'claimable',
                    earnedAt: new Date(Date.now() - 86400000).toISOString(),
                    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
                },
                {
                    id: 'reward_2',
                    missionId: 'mission_2',
                    missionTitle: 'Instagram Content Creation',
                    platform: 'instagram',
                    amount: 18000,
                    status: 'claimable',
                    earnedAt: new Date(Date.now() - 172800000).toISOString(),
                    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
                }
            ];

            return claimableRewards;
        } catch (error) {
            return reply.status(500).send({
                error: 'Internal server error'
            });
        }
    });

    // Claim individual reward
    fastify.post('/v1/rewards/:rewardId/claim', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { rewardId } = request.params as { rewardId: string };

            // For demo purposes, always succeed
            // In production, this would validate the reward and update its status
            return {
                success: true,
                message: 'Reward claimed successfully',
                transactionId: `claim_${Date.now()}`
            };
        } catch (error) {
            return reply.status(500).send({
                error: 'Internal server error'
            });
        }
    });

    // Claim all rewards
    fastify.post('/v1/rewards/claim-all', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // For demo purposes, always succeed
            // In production, this would claim all available rewards for the user
            return {
                success: true,
                message: 'All rewards claimed successfully',
                transactionId: `claim_all_${Date.now()}`,
                totalClaimed: 18100
            };
        } catch (error) {
            return reply.status(500).send({
                error: 'Internal server error'
            });
        }
    });
}

