import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';

export interface WebSocketMessage {
  type: 'notification' | 'mission_update' | 'submission_update' | 'user_update' | 'system_update';
  data: any;
  timestamp: string;
}

export interface WebSocketClient {
  id: string;
  socket: WebSocket;
  userId?: string;
  role?: string;
  subscriptions: string[];
}

class WebSocketService {
  private clients: Map<string, WebSocketClient> = new Map();
  private userClients: Map<string, Set<string>> = new Map(); // userId -> Set of client IDs

  // Register a new WebSocket client
  registerClient(clientId: string, socket: WebSocket, userId?: string, role?: string): void {
    const client: WebSocketClient = {
      id: clientId,
      socket,
      userId,
      role,
      subscriptions: []
    };

    this.clients.set(clientId, client);

    if (userId) {
      if (!this.userClients.has(userId)) {
        this.userClients.set(userId, new Set());
      }
      this.userClients.get(userId)!.add(clientId);
    }

    console.log(`WebSocket client ${clientId} connected. Total clients: ${this.clients.size}`);
  }

  // Remove a WebSocket client
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);

      if (client.userId) {
        const userClients = this.userClients.get(client.userId);
        if (userClients) {
          userClients.delete(clientId);
          if (userClients.size === 0) {
            this.userClients.delete(client.userId);
          }
        }
      }

      console.log(`WebSocket client ${clientId} disconnected. Total clients: ${this.clients.size}`);
    }
  }

  // Send message to a specific client
  sendToClient(clientId: string, message: WebSocketMessage): boolean {
    const client = this.clients.get(clientId);
    if (client && client.socket.readyState === WebSocket.OPEN) {
      try {
        client.socket.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error(`Failed to send message to client ${clientId}:`, error);
        return false;
      }
    }
    return false;
  }

  // Send message to all clients of a specific user
  sendToUser(userId: string, message: WebSocketMessage): number {
    const userClients = this.userClients.get(userId);
    if (!userClients) return 0;

    let sentCount = 0;
    for (const clientId of userClients) {
      if (this.sendToClient(clientId, message)) {
        sentCount++;
      }
    }
    return sentCount;
  }

  // Send message to all clients with a specific role
  sendToRole(role: string, message: WebSocketMessage): number {
    let sentCount = 0;
    for (const client of this.clients.values()) {
      if (client.role === role && this.sendToClient(client.id, message)) {
        sentCount++;
      }
    }
    return sentCount;
  }

  // Broadcast message to all connected clients
  broadcast(message: WebSocketMessage): number {
    let sentCount = 0;
    for (const client of this.clients.values()) {
      if (this.sendToClient(client.id, message)) {
        sentCount++;
      }
    }
    return sentCount;
  }

  // Subscribe client to specific events
  subscribe(clientId: string, eventType: string): void {
    const client = this.clients.get(clientId);
    if (client && !client.subscriptions.includes(eventType)) {
      client.subscriptions.push(eventType);
    }
  }

  // Unsubscribe client from specific events
  unsubscribe(clientId: string, eventType: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions = client.subscriptions.filter(sub => sub !== eventType);
    }
  }

  // Send message to clients subscribed to specific event type
  sendToSubscribers(eventType: string, message: WebSocketMessage): number {
    let sentCount = 0;
    for (const client of this.clients.values()) {
      if (client.subscriptions.includes(eventType) && this.sendToClient(client.id, message)) {
        sentCount++;
      }
    }
    return sentCount;
  }

  // Get client statistics
  getStats() {
    return {
      totalClients: this.clients.size,
      totalUsers: this.userClients.size,
      clientsByRole: Array.from(this.clients.values()).reduce((acc, client) => {
        acc[client.role || 'anonymous'] = (acc[client.role || 'anonymous'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Helper function to create WebSocket message
export function createWebSocketMessage(type: WebSocketMessage['type'], data: any): WebSocketMessage {
  return {
    type,
    data,
    timestamp: new Date().toISOString()
  };
}

// Helper function to notify about mission updates
export function notifyMissionUpdate(missionId: string, update: any) {
  const message = createWebSocketMessage('mission_update', {
    missionId,
    update
  });
  
  websocketService.broadcast(message);
}

// Helper function to notify about submission updates
export function notifySubmissionUpdate(submissionId: string, update: any) {
  const message = createWebSocketMessage('submission_update', {
    submissionId,
    update
  });
  
  websocketService.broadcast(message);
}

// Helper function to notify admins about new submissions
export function notifyAdminNewSubmission(submission: any) {
  const message = createWebSocketMessage('notification', {
    title: 'New Submission',
    message: `New submission for mission: ${submission.missionTitle}`,
    submission
  });
  
  websocketService.sendToRole('admin', message);
  websocketService.sendToRole('moderator', message);
}

// Helper function to notify user about submission status change
export function notifyUserSubmissionStatus(userId: string, submissionId: string, status: string) {
  const message = createWebSocketMessage('notification', {
    title: 'Submission Update',
    message: `Your submission has been ${status}`,
    submissionId,
    status
  });
  
  websocketService.sendToUser(userId, message);
}


