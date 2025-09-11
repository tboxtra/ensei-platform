import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate, requireRole, requirePermission } from '../middleware/auth';
import { notifySubmissionUpdate, notifyAdminNewSubmission } from '../lib/websocket';

// Mock data for admin endpoints (will be replaced with real database queries)
const mockMissions = [
  {
    id: 'mission_1',
    title: 'Twitter Engagement Campaign',
    platform: 'twitter',
    type: 'engage',
    model: 'fixed',
    status: 'active',
    totalCostUsd: 1000,
    submissionsCount: 45,
    cap: 100,
    createdAt: new Date().toISOString(),
    creator: { username: 'creator1', email: 'creator1@example.com' }
  },
  {
    id: 'mission_2',
    title: 'Instagram Content Creation',
    platform: 'instagram',
    type: 'content',
    model: 'degen',
    status: 'active',
    totalCostUsd: 500,
    submissionsCount: 23,
    winnersCap: 5,
    createdAt: new Date().toISOString(),
    creator: { username: 'creator2', email: 'creator2@example.com' }
  }
];

const mockSubmissions = [
  {
    id: 'submission_1',
    missionId: 'mission_1',
    missionTitle: 'Twitter Engagement Campaign',
    userId: 'user_1',
    username: 'participant1',
    status: 'pending',
    submittedAt: new Date().toISOString(),
    proofs: [
      { type: 'screenshot', content: 'https://example.com/proof1.jpg' },
      { type: 'url', content: 'https://twitter.com/user/status/123' }
    ],
    perWinnerHonors: 100,
    ratingAvg: 4.2,
    ratingCount: 3
  },
  {
    id: 'submission_2',
    missionId: 'mission_2',
    missionTitle: 'Instagram Content Creation',
    userId: 'user_2',
    username: 'participant2',
    status: 'pending',
    submittedAt: new Date().toISOString(),
    proofs: [
      { type: 'screenshot', content: 'https://example.com/proof2.jpg' }
    ],
    perWinnerHonors: 200,
    ratingAvg: 3.8,
    ratingCount: 2
  }
];

const mockUsers = [
  {
    id: 'user_1',
    username: 'participant1',
    email: 'participant1@example.com',
    role: 'user',
    status: 'active',
    missionsCompleted: 5,
    honorsEarned: 1500,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_2',
    username: 'participant2',
    email: 'participant2@example.com',
    role: 'user',
    status: 'active',
    missionsCompleted: 3,
    honorsEarned: 800,
    createdAt: new Date().toISOString()
  },
  {
    id: 'admin_1',
    username: 'admin',
    email: 'admin@ensei.com',
    role: 'admin',
    status: 'active',
    missionsCompleted: 0,
    honorsEarned: 0,
    createdAt: new Date().toISOString()
  }
];

const mockAnalytics = {
  overview: {
    totalUsers: 1250,
    totalMissions: 45,
    totalRevenue: 25000,
    pendingSubmissions: 23
  },
  revenueData: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue (USD)',
      data: [2000, 3500, 4200, 3800, 5500, 6000],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)'
    }]
  },
  userGrowthData: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'New Users',
      data: [50, 75, 120, 180],
      borderColor: 'rgb(54, 162, 235)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)'
    }]
  },
  platformPerformance: {
    labels: ['Twitter', 'Instagram', 'TikTok', 'Facebook', 'Telegram'],
    datasets: [{
      label: 'Missions',
      data: [15, 12, 8, 6, 4],
      backgroundColor: [
        'rgba(29, 161, 242, 0.8)',
        'rgba(225, 48, 108, 0.8)',
        'rgba(255, 0, 80, 0.8)',
        'rgba(24, 119, 242, 0.8)',
        'rgba(0, 136, 204, 0.8)'
      ]
    }]
  },
  missionPerformance: {
    labels: ['Mission A', 'Mission B', 'Mission C', 'Mission D'],
    datasets: [{
      label: 'Completion Rate (%)',
      data: [85, 92, 78, 88],
      backgroundColor: 'rgba(75, 192, 192, 0.8)'
    }]
  }
};

export async function adminRoutes(fastify: FastifyInstance) {
  // Admin missions endpoints
  fastify.get('/v1/admin/missions', {
    preHandler: [authenticate, requireRole(['admin', 'moderator'])]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { status, platform, model } = request.query as any;
      
      let filteredMissions = mockMissions;
      
      if (status) {
        filteredMissions = filteredMissions.filter(m => m.status === status);
      }
      if (platform) {
        filteredMissions = filteredMissions.filter(m => m.platform === platform);
      }
      if (model) {
        filteredMissions = filteredMissions.filter(m => m.model === model);
      }
      
      return filteredMissions;
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get('/v1/admin/missions/:id', {
    preHandler: [authenticate, requireRole(['admin', 'moderator'])]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const mission = mockMissions.find(m => m.id === id);
      
      if (!mission) {
        return reply.status(404).send({ error: 'Mission not found' });
      }
      
      return mission;
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Admin submissions endpoints
  fastify.get('/v1/admin/submissions', {
    preHandler: [authenticate, requireRole(['admin', 'moderator'])]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { status } = request.query as any;
      
      let filteredSubmissions = mockSubmissions;
      
      if (status) {
        filteredSubmissions = filteredSubmissions.filter(s => s.status === status);
      }
      
      return filteredSubmissions;
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  fastify.post('/v1/admin/submissions/:id/review', {
    preHandler: [authenticate, requireRole(['admin', 'moderator'])]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { action, reason } = request.body as { action: 'approve' | 'reject' | 'dispute'; reason?: string };
      
      const submission = mockSubmissions.find(s => s.id === id);
      
      if (!submission) {
        return reply.status(404).send({ error: 'Submission not found' });
      }
      
      // Update submission status
      submission.status = action === 'approve' ? 'accepted' : 'rejected';
      
      // Send WebSocket notification
      notifySubmissionUpdate(submission.id, {
        status: submission.status,
        reviewedAt: new Date().toISOString(),
        reason
      });
      
      return {
        id: submission.id,
        status: submission.status,
        reviewedAt: new Date().toISOString(),
        reason
      };
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Admin users endpoints
  fastify.get('/v1/admin/users', {
    preHandler: [authenticate, requireRole(['admin'])]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { role, status } = request.query as any;
      
      let filteredUsers = mockUsers;
      
      if (role) {
        filteredUsers = filteredUsers.filter(u => u.role === role);
      }
      if (status) {
        filteredUsers = filteredUsers.filter(u => u.status === status);
      }
      
      return filteredUsers;
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get('/v1/admin/users/:id', {
    preHandler: [authenticate, requireRole(['admin'])]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const user = mockUsers.find(u => u.id === id);
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      return user;
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  fastify.put('/v1/admin/users/:id/role', {
    preHandler: [authenticate, requireRole(['admin'])]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { role } = request.body as { role: string };
      
      const user = mockUsers.find(u => u.id === id);
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      user.role = role;
      
      return { id: user.id, role: user.role };
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Admin analytics endpoints
  fastify.get('/v1/admin/analytics/overview', {
    preHandler: [authenticate, requireRole(['admin'])]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return mockAnalytics.overview;
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get('/v1/admin/analytics/revenue', {
    preHandler: [authenticate, requireRole(['admin'])]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { period } = request.query as { period: string };
      return mockAnalytics.revenueData;
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get('/v1/admin/analytics/user-growth', {
    preHandler: [authenticate, requireRole(['admin'])]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { period } = request.query as { period: string };
      return mockAnalytics.userGrowthData;
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get('/v1/admin/analytics/platform-performance', {
    preHandler: [authenticate, requireRole(['admin'])]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return mockAnalytics.platformPerformance;
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get('/v1/admin/analytics/mission-performance', {
    preHandler: [authenticate, requireRole(['admin'])]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { period } = request.query as { period: string };
      return mockAnalytics.missionPerformance;
    } catch (error) {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
