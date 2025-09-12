import * as functions from 'firebase-functions';
import * as firebaseAdmin from 'firebase-admin';

// Initialize Firebase Admin
firebaseAdmin.initializeApp();

// Create a simple Express app for the API
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: ['https://ensei-platform-onh1g1z1d-izecubes-projects-b81ca540.vercel.app', 'https://admin-dashboard-d83i9lh7f-izecubes-projects-b81ca540.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Ensei Platform API is working!' });
});

// Middleware to verify Firebase Auth token
const verifyFirebaseToken = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Authentication endpoints
app.post('/v1/auth/login', async (req, res): Promise<void> => {
  try {
    // This endpoint is now handled by Firebase Auth on the frontend
    // We just need to verify the token and return user info
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

    const user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      firstName: decodedToken.name?.split(' ')[0] || decodedToken.email?.split('@')[0] || 'User',
      lastName: decodedToken.name?.split(' ').slice(1).join(' ') || 'User',
      avatar: decodedToken.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${decodedToken.email}`,
      joinedAt: new Date(decodedToken.iat * 1000).toISOString()
    };

    res.json({
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/v1/auth/register', async (req, res): Promise<void> => {
  try {
    // Registration is handled by Firebase Auth on the frontend
    // This endpoint just verifies the token for new users
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

    const user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      firstName: decodedToken.name?.split(' ')[0] || decodedToken.email?.split('@')[0] || 'User',
      lastName: decodedToken.name?.split(' ').slice(1).join(' ') || 'User',
      avatar: decodedToken.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${decodedToken.email}`,
      joinedAt: new Date(decodedToken.iat * 1000).toISOString()
    };

    res.json({
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/v1/auth/me', verifyFirebaseToken, async (req: any, res) => {
  try {
    const decodedToken = req.user;

    const user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      firstName: decodedToken.name?.split(' ')[0] || decodedToken.email?.split('@')[0] || 'User',
      lastName: decodedToken.name?.split(' ').slice(1).join(' ') || 'User',
      avatar: decodedToken.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${decodedToken.email}`,
      joinedAt: new Date(decodedToken.iat * 1000).toISOString()
    };

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/v1/auth/logout', async (req, res) => {
  try {
    // Firebase Auth handles logout on the frontend
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Missions endpoints
app.get('/v1/missions', async (req, res) => {
  try {
    // For now, return empty array since we don't have a database yet
    // In production, this would query a database
    res.json([]);
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/missions/:id', async (req, res) => {
  try {
    const missionId = req.params.id;
    console.log('Fetching mission:', missionId);
    // For now, return 404 since we don't have a database yet
    res.status(404).json({ error: 'Mission not found', missionId });
  } catch (error) {
    console.error('Error fetching mission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/missions/my', verifyFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    console.log('Fetching missions for user:', userId);
    // For now, return empty array since we don't have a database yet
    res.json([]);
  } catch (error) {
    console.error('Error fetching user missions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/v1/missions', verifyFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const missionData = req.body;
    
    // For now, return a mock response since we don't have a database yet
    const newMission = {
      id: Date.now().toString(),
      ...missionData,
      created_by: userId,
      created_at: new Date().toISOString(),
      status: 'draft'
    };
    
    res.status(201).json(newMission);
  } catch (error) {
    console.error('Error creating mission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/v1/missions/:id/participate', verifyFirebaseToken, async (req: any, res) => {
  try {
    const missionId = req.params.id;
    const userId = req.user.uid;
    const participationData = req.body;
    
    // For now, return a mock response since we don't have a database yet
    const participation = {
      id: Date.now().toString(),
      mission_id: missionId,
      user_id: userId,
      ...participationData,
      status: 'pending',
      submitted_at: new Date().toISOString()
    };
    
    res.status(201).json(participation);
  } catch (error) {
    console.error('Error participating in mission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Wallet endpoints
app.get('/v1/wallet/balance', verifyFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    console.log('Fetching wallet balance for user:', userId);
    // For now, return mock wallet data
    res.json({
      honors: 0,
      usd: 0,
      transactions: []
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/wallet/rewards', verifyFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    console.log('Fetching rewards for user:', userId);
    // For now, return empty rewards array
    res.json([]);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/v1/wallet/claim/:rewardId', verifyFirebaseToken, async (req: any, res) => {
  try {
    const rewardId = req.params.rewardId;
    const userId = req.user.uid;
    
    console.log('Claiming reward:', rewardId, 'for user:', userId);
    // For now, return a mock response
    res.json({
      success: true,
      message: 'Reward claimed successfully',
      reward_id: rewardId
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);

// Export individual functions for better performance
export const auth = functions.https.onCall(async (data: any, context: any) => {
  return { success: true, message: 'Auth function working' };
});

export const missions = functions.https.onCall(async (data: any, context: any) => {
  return { success: true, message: 'Missions function working' };
});

export const adminApi = functions.https.onCall(async (data: any, context: any) => {
  return { success: true, message: 'Admin API function working' };
});