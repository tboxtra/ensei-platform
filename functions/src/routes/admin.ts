import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify admin token
const verifyAdminToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin' && decoded.role !== 'moderator') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Apply admin middleware to all routes
router.use(verifyAdminToken);

// Mock data
const mockSubmissions = [
  {
    id: 'submission_1',
    missionId: 'mission_1',
    missionTitle: 'Twitter Engagement Campaign',
    userId: 'user_1',
    username: 'participant1',
    status: 'pending',
    submittedAt: '2025-09-10T14:01:11.027Z',
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
    submittedAt: '2025-09-10T14:01:11.027Z',
    proofs: [
      { type: 'screenshot', content: 'https://example.com/proof2.jpg' }
    ],
    perWinnerHonors: 200,
    ratingAvg: 3.8,
    ratingCount: 2
  }
];

const mockMissions = [
  {
    id: 'mission_1',
    title: 'Twitter Engagement Campaign',
    platform: 'twitter',
    type: 'engage',
    model: 'fixed',
    status: 'active',
    totalCostUsd: 142.22,
    totalCostHonors: 64000,
    createdAt: '2025-09-10T14:01:11.027Z'
  },
  {
    id: 'mission_2',
    title: 'Instagram Content Creation',
    platform: 'instagram',
    type: 'content',
    model: 'degen',
    status: 'active',
    totalCostUsd: 2000,
    totalCostHonors: 900000,
    createdAt: '2025-09-10T14:01:11.027Z'
  }
];

const mockUsers = [
  {
    id: 'user_1',
    username: 'participant1',
    email: 'user1@example.com',
    role: 'user',
    joinedAt: '2025-09-01T10:00:00.000Z',
    totalMissions: 5,
    totalEarnings: 500
  },
  {
    id: 'user_2',
    username: 'participant2',
    email: 'user2@example.com',
    role: 'user',
    joinedAt: '2025-09-02T10:00:00.000Z',
    totalMissions: 3,
    totalEarnings: 300
  }
];

// Get submissions
router.get('/submissions', (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  let filteredSubmissions = mockSubmissions;
  if (status) {
    filteredSubmissions = mockSubmissions.filter(s => s.status === status);
  }

  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  res.json({
    submissions: paginatedSubmissions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: filteredSubmissions.length,
      pages: Math.ceil(filteredSubmissions.length / Number(limit))
    }
  });
});

// Get missions
router.get('/missions', (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  let filteredMissions = mockMissions;
  if (status) {
    filteredMissions = mockMissions.filter(m => m.status === status);
  }

  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedMissions = filteredMissions.slice(startIndex, endIndex);

  res.json({
    missions: paginatedMissions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: filteredMissions.length,
      pages: Math.ceil(filteredMissions.length / Number(limit))
    }
  });
});

// Get users
router.get('/users', (req, res) => {
  const { role, page = 1, limit = 10 } = req.query;
  
  let filteredUsers = mockUsers;
  if (role) {
    filteredUsers = mockUsers.filter(u => u.role === role);
  }

  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  res.json({
    users: paginatedUsers,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: filteredUsers.length,
      pages: Math.ceil(filteredUsers.length / Number(limit))
    }
  });
});

// Review submission
router.post('/submissions/:id/review', (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    const submission = mockSubmissions.find(s => s.id === id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    submission.status = status;
    if (feedback) {
      submission.feedback = feedback;
    }

    res.json({ 
      success: true, 
      submission,
      message: 'Submission reviewed successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to review submission' });
  }
});

// Analytics endpoints
router.get('/analytics/overview', (req, res) => {
  res.json({
    totalUsers: mockUsers.length,
    totalMissions: mockMissions.length,
    totalSubmissions: mockSubmissions.length,
    pendingSubmissions: mockSubmissions.filter(s => s.status === 'pending').length,
    totalRevenue: mockMissions.reduce((sum, m) => sum + m.totalCostUsd, 0),
    activeMissions: mockMissions.filter(m => m.status === 'active').length
  });
});

router.get('/analytics/revenue', (req, res) => {
  const { period = '30d' } = req.query;
  
  // Mock revenue data
  const revenueData = {
    '7d': { total: 5000, daily: [100, 200, 300, 400, 500, 600, 700] },
    '30d': { total: 25000, daily: Array.from({ length: 30 }, (_, i) => Math.random() * 1000) },
    '90d': { total: 75000, daily: Array.from({ length: 90 }, (_, i) => Math.random() * 1000) }
  };

  res.json(revenueData[period as keyof typeof revenueData] || revenueData['30d']);
});

router.get('/analytics/users', (req, res) => {
  const { period = '30d' } = req.query;
  
  // Mock user analytics
  const userData = {
    '7d': { newUsers: 15, activeUsers: 45, totalUsers: 100 },
    '30d': { newUsers: 60, activeUsers: 180, totalUsers: 400 },
    '90d': { newUsers: 180, activeUsers: 540, totalUsers: 1200 }
  };

  res.json(userData[period as keyof typeof userData] || userData['30d']);
});

export { router as adminRoutes };
