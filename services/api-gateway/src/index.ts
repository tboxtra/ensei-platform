import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { missionRoutes } from './routes/missions';
import { walletRoutes } from './routes/wallet';
import { rewardsRoutes } from './routes/rewards';
import { reviewRoutes } from './routes/review';
import { authRoutes } from './auth';

const fastify = Fastify({
    logger: true
});

// Start server
const start = async () => {
    try {
        // Register plugins
        await fastify.register(cors, {
            origin: true
        });

        await fastify.register(helmet);

        await fastify.register(rateLimit, {
            max: 100,
            timeWindow: '1 minute'
        });

        // Rate limit for mission creation and submission (more restrictive)
        await fastify.register(rateLimit, {
            max: 100,
            timeWindow: '1 minute',
            skipOnError: true,
            keyGenerator: (request: any) => {
                return request.ip;
            }
        });

        // Register routes
        await fastify.register(authRoutes);
        await fastify.register(missionRoutes);
        await fastify.register(walletRoutes);
        await fastify.register(rewardsRoutes);
        await fastify.register(reviewRoutes);

        // Health check
        fastify.get('/health', async (request, reply) => {
            return { status: 'ok', timestamp: new Date().toISOString() };
        });

        // Test route
        fastify.get('/test', async (request, reply) => {
            return { message: 'Routes are working' };
        });

        const port = process.env.PORT ? Number(process.env.PORT) : 3002;
        const host = process.env.HOST || '0.0.0.0';
        await fastify.listen({ port, host });
        console.log(`API Gateway running on port ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
