import Fastify from 'fastify';
import cors from '@fastify/cors';
import { calculateMissionPricing, validateDegenMission, TASK_CATALOG, getDegenPresets } from './index';

const fastify = Fastify({
  logger: true
});

// Register CORS
fastify.register(cors, {
  origin: true,
  credentials: true
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Calculate mission pricing
fastify.post('/calculate-pricing', async (request, reply) => {
  try {
    const result = calculateMissionPricing(request.body as any);
    return result;
  } catch (error) {
    reply.code(400);
    return { error: (error as Error).message };
  }
});

// Validate degen mission
fastify.post('/validate-degen', async (request, reply) => {
  try {
    const { durationHours, winnersCap } = request.body as any;
    const result = validateDegenMission(durationHours, winnersCap);
    return result;
  } catch (error) {
    reply.code(400);
    return { error: (error as Error).message };
  }
});

// Get task catalog
fastify.get('/task-catalog', async (request, reply) => {
  return TASK_CATALOG;
});

// Get degen presets
fastify.get('/degen-presets', async (request, reply) => {
  return getDegenPresets();
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3003;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port: Number(port), host });
    console.log(`Mission Engine server running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
