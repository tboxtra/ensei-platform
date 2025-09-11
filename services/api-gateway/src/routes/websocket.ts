import { FastifyInstance, FastifyRequest } from 'fastify';
import { websocketService, createWebSocketMessage } from '../lib/websocket';
import { authenticate } from '../middleware/auth';

export async function websocketRoutes(fastify: FastifyInstance) {
  // Register WebSocket plugin
  await fastify.register(require('@fastify/websocket'));

  // WebSocket connection endpoint
  fastify.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (connection, req: FastifyRequest) => {
      const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Extract user info from query params or headers (for demo purposes)
      const userId = req.query.userId as string;
      const role = req.query.role as string;

      // Register the client
      websocketService.registerClient(clientId, connection.socket, userId, role);

      // Send welcome message
      const welcomeMessage = createWebSocketMessage('system_update', {
        message: 'Connected to Ensei WebSocket',
        clientId,
        timestamp: new Date().toISOString()
      });
      
      connection.socket.send(JSON.stringify(welcomeMessage));

      // Handle incoming messages
      connection.socket.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          handleWebSocketMessage(clientId, data, connection.socket);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
          connection.socket.send(JSON.stringify({
            type: 'error',
            data: { message: 'Invalid message format' },
            timestamp: new Date().toISOString()
          }));
        }
      });

      // Handle connection close
      connection.socket.on('close', () => {
        websocketService.removeClient(clientId);
      });

      // Handle connection error
      connection.socket.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        websocketService.removeClient(clientId);
      });
    });
  });

  // WebSocket stats endpoint (for debugging)
  fastify.get('/ws/stats', async (request, reply) => {
    return websocketService.getStats();
  });

  // Test endpoint to send a message to all connected clients
  fastify.post('/ws/broadcast', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    const { message, type = 'notification' } = request.body as any;
    
    const wsMessage = createWebSocketMessage(type, {
      message,
      from: 'admin'
    });
    
    const sentCount = websocketService.broadcast(wsMessage);
    
    return {
      message: 'Broadcast sent',
      sentTo: sentCount,
      totalClients: websocketService.getStats().totalClients
    };
  });
}

// Handle WebSocket messages
function handleWebSocketMessage(clientId: string, data: any, socket: any) {
  const { type, payload } = data;

  switch (type) {
    case 'subscribe':
      if (payload.eventType) {
        websocketService.subscribe(clientId, payload.eventType);
        socket.send(JSON.stringify({
          type: 'subscription_confirmed',
          data: { eventType: payload.eventType },
          timestamp: new Date().toISOString()
        }));
      }
      break;

    case 'unsubscribe':
      if (payload.eventType) {
        websocketService.unsubscribe(clientId, payload.eventType);
        socket.send(JSON.stringify({
          type: 'unsubscription_confirmed',
          data: { eventType: payload.eventType },
          timestamp: new Date().toISOString()
        }));
      }
      break;

    case 'ping':
      socket.send(JSON.stringify({
        type: 'pong',
        data: { timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      }));
      break;

    default:
      socket.send(JSON.stringify({
        type: 'error',
        data: { message: `Unknown message type: ${type}` },
        timestamp: new Date().toISOString()
      }));
  }
}


