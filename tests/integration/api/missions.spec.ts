import request from 'supertest';
import Fastify from 'fastify';
import { missionRoutes } from '../../../services/api-gateway/src/routes/missions';

describe('Mission API Integration Tests', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = Fastify();
        await app.register(missionRoutes);
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /v1/missions', () => {
        it('should create a fixed mission with correct pricing', async () => {
            const missionData = {
                model: 'fixed',
                platform: 'twitter',
                type: 'engage',
                target: 'all',
                cap: 100,
                tasks: ['like', 'retweet']
            };

            const response = await request(app.server)
                .post('/v1/missions')
                .send(missionData)
                .expect(200);

            expect(response.body).toMatchObject({
                id: expect.any(String),
                model: 'fixed',
                total_cost_usd: expect.any(Number),
                total_cost_honors: expect.any(Number),
                per_user_honors: expect.any(Number)
            });
        });

        it('should create a degen mission with correct pricing', async () => {
            const missionData = {
                model: 'degen',
                platform: 'twitter',
                type: 'engage',
                target: 'all',
                durationHours: 8,
                winnersCap: 3,
                tasks: ['like', 'retweet']
            };

            const response = await request(app.server)
                .post('/v1/missions')
                .send(missionData)
                .expect(200);

            expect(response.body).toMatchObject({
                id: expect.any(String),
                model: 'degen',
                total_cost_usd: 150, // 8h preset cost
                user_pool_honors: 33750, // 150 * 450 * 0.5
                per_winner_honors: 11250 // 33750 / 3
            });
        });

        it('should apply 5x multiplier for premium missions', async () => {
            const missionData = {
                model: 'degen',
                platform: 'twitter',
                type: 'engage',
                target: 'premium',
                durationHours: 8,
                winnersCap: 3,
                tasks: ['like', 'retweet']
            };

            const response = await request(app.server)
                .post('/v1/missions')
                .send(missionData)
                .expect(200);

            expect(response.body).toMatchObject({
                id: expect.any(String),
                model: 'degen',
                total_cost_usd: 750, // 150 * 5
                user_pool_honors: 168750, // 750 * 450 * 0.5
                per_winner_honors: 56250 // 168750 / 3
            });
        });

        it('should reject invalid winner cap for degen missions', async () => {
            const missionData = {
                model: 'degen',
                platform: 'twitter',
                type: 'engage',
                target: 'all',
                durationHours: 1, // Max 1 winner
                winnersCap: 5, // Invalid: exceeds max
                tasks: ['like']
            };

            const response = await request(app.server)
                .post('/v1/missions')
                .send(missionData)
                .expect(400);

            expect(response.body.error).toContain('Winners cap must be between 1 and 1');
        });

        it('should reject invalid duration for degen missions', async () => {
            const missionData = {
                model: 'degen',
                platform: 'twitter',
                type: 'engage',
                target: 'all',
                durationHours: 999, // Invalid duration
                winnersCap: 3,
                tasks: ['like']
            };

            const response = await request(app.server)
                .post('/v1/missions')
                .send(missionData)
                .expect(400);

            expect(response.body.error).toContain('Invalid duration');
        });

        it('should reject fixed missions with cap less than 60', async () => {
            const missionData = {
                model: 'fixed',
                platform: 'twitter',
                type: 'engage',
                target: 'all',
                cap: 50, // Less than minimum
                tasks: ['like']
            };

            const response = await request(app.server)
                .post('/v1/missions')
                .send(missionData)
                .expect(400);

            expect(response.body.error).toContain('cap');
        });

        it('should reject missions with empty tasks for fixed model', async () => {
            const missionData = {
                model: 'fixed',
                platform: 'twitter',
                type: 'engage',
                target: 'all',
                cap: 100,
                tasks: [] // Empty tasks not allowed for fixed
            };

            const response = await request(app.server)
                .post('/v1/missions')
                .send(missionData)
                .expect(400);

            expect(response.body.error).toContain('tasks');
        });
    });

    describe('GET /v1/missions', () => {
        it('should return list of missions', async () => {
            const response = await request(app.server)
                .get('/v1/missions')
                .expect(200);

            expect(response.body).toHaveProperty('missions');
            expect(Array.isArray(response.body.missions)).toBe(true);
        });
    });

    describe('POST /v1/missions/:id/submit', () => {
        it('should create submission for valid mission', async () => {
            // First create a mission
            const missionData = {
                model: 'fixed',
                platform: 'twitter',
                type: 'engage',
                target: 'all',
                cap: 100,
                tasks: ['like']
            };

            const missionResponse = await request(app.server)
                .post('/v1/missions')
                .send(missionData)
                .expect(200);

            const missionId = missionResponse.body.id;

            // Submit proof
            const submissionData = {
                userId: 'user123',
                proofs: [
                    {
                        type: 'screenshot',
                        content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
                    }
                ]
            };

            const response = await request(app.server)
                .post(`/v1/missions/${missionId}/submit`)
                .send(submissionData)
                .expect(200);

            expect(response.body).toMatchObject({
                id: expect.any(String),
                status: 'pending',
                created_at: expect.any(String)
            });
        });

        it('should reject submission for non-existent mission', async () => {
            const submissionData = {
                userId: 'user123',
                proofs: []
            };

            await request(app.server)
                .post('/v1/missions/nonexistent/submit')
                .send(submissionData)
                .expect(404);
        });
    });

    describe('POST /v1/submissions/:id/review', () => {
        it('should approve submission', async () => {
            // Create mission and submission first
            const missionData = {
                model: 'fixed',
                platform: 'twitter',
                type: 'engage',
                target: 'all',
                cap: 100,
                tasks: ['like']
            };

            const missionResponse = await request(app.server)
                .post('/v1/missions')
                .send(missionData)
                .expect(200);

            const submissionData = {
                userId: 'user123',
                proofs: []
            };

            const submissionResponse = await request(app.server)
                .post(`/v1/missions/${missionResponse.body.id}/submit`)
                .send(submissionData)
                .expect(200);

            // Review submission
            const reviewData = {
                action: 'approve',
                reviewerId: 'moderator1',
                reason: 'Valid proof provided'
            };

            const response = await request(app.server)
                .post(`/v1/submissions/${submissionResponse.body.id}/review`)
                .send(reviewData)
                .expect(200);

            expect(response.body).toMatchObject({
                id: submissionResponse.body.id,
                status: 'approve',
                reviewed_at: expect.any(String)
            });
        });

        it('should reject submission', async () => {
            // Create mission and submission first
            const missionData = {
                model: 'fixed',
                platform: 'twitter',
                type: 'engage',
                target: 'all',
                cap: 100,
                tasks: ['like']
            };

            const missionResponse = await request(app.server)
                .post('/v1/missions')
                .send(missionData)
                .expect(200);

            const submissionData = {
                userId: 'user123',
                proofs: []
            };

            const submissionResponse = await request(app.server)
                .post(`/v1/missions/${missionResponse.body.id}/submit`)
                .send(submissionData)
                .expect(200);

            // Review submission
            const reviewData = {
                action: 'reject',
                reviewerId: 'moderator1',
                reason: 'Invalid proof provided'
            };

            const response = await request(app.server)
                .post(`/v1/submissions/${submissionResponse.body.id}/review`)
                .send(reviewData)
                .expect(200);

            expect(response.body).toMatchObject({
                id: submissionResponse.body.id,
                status: 'reject',
                reviewed_at: expect.any(String)
            });
        });
    });

    describe('GET /v1/meta/degen-presets', () => {
        it('should return degen presets', async () => {
            const response = await request(app.server)
                .get('/v1/meta/degen-presets')
                .expect(200);

            expect(response.body).toHaveProperty('presets');
            expect(Array.isArray(response.body.presets)).toBe(true);
            expect(response.body.presets.length).toBeGreaterThan(0);

            // Check structure of first preset
            const firstPreset = response.body.presets[0];
            expect(firstPreset).toHaveProperty('hours');
            expect(firstPreset).toHaveProperty('costUSD');
            expect(firstPreset).toHaveProperty('maxWinners');
            expect(firstPreset).toHaveProperty('label');
        });
    });
});
