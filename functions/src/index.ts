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

// Authentication endpoints
app.post('/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // For now, use simple authentication until Firebase Auth is properly configured
    // This will be replaced with Firebase Auth once it's set up
    const user = {
      id: '1',
      email: email,
      name: email.split('@')[0],
      firstName: email.split('@')[0],
      lastName: 'User',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      joinedAt: new Date().toISOString()
    };
    
    const token = 'demo-token-' + Date.now();
    
    res.json({
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/v1/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // For now, use simple authentication until Firebase Auth is properly configured
    const user = {
      id: '1',
      email: email,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      joinedAt: new Date().toISOString()
    };
    
    const token = 'demo-token-' + Date.now();
    
    res.json({
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/auth/me', async (req, res) => {
  try {
    // For demo purposes, return a default user
    // This will be replaced with Firebase Auth token verification
    const user = {
      id: '1',
      email: 'demo@ensei.com',
      name: 'Demo User',
      firstName: 'Demo',
      lastName: 'User',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      joinedAt: new Date().toISOString()
    };
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/v1/auth/logout', async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
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