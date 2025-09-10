import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { missionRoutes } from './routes/missions';
import { walletRoutes } from './routes/wallet';
import { rewardsRoutes } from './routes/rewards';
import { reviewRoutes } from './routes/review';
import { adminRoutes } from './routes/admin';
import { websocketRoutes } from './routes/websocket';
import { authRoutes } from './auth';

// Load environment variables
dotenv.config();

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
            max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
            timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')
        });

        // Register routes
        await fastify.register(authRoutes);
        await fastify.register(missionRoutes);
        await fastify.register(walletRoutes);
        await fastify.register(rewardsRoutes);
        await fastify.register(reviewRoutes);
        await fastify.register(adminRoutes);
        await fastify.register(websocketRoutes);

        // Health check
        fastify.get('/health', async (request, reply) => {
            return { status: 'ok', timestamp: new Date().toISOString() };
        });

        // Test route
        fastify.get('/test', async (request, reply) => {
            return { message: 'Routes are working' };
        });

        const port = parseInt(process.env.PORT || '3002');
        const host = process.env.HOST || '0.0.0.0';
        await fastify.listen({ port, host });
        console.log(`API Gateway running on port ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
