import * as functions from 'firebase-functions';
import * as firebaseAdmin from 'firebase-admin';

// Initialize Firebase Admin
firebaseAdmin.initializeApp();

// Create a simple Express app for the API
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
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
app.post('/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple demo authentication for now
  if (email && password) {
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
  } else {
    res.status(400).json({ error: 'Email and password are required' });
  }
});

app.post('/v1/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  if (firstName && lastName && email && password) {
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
  } else {
    res.status(400).json({ error: 'All fields are required' });
  }
});

app.get('/v1/auth/me', (req, res) => {
  // For demo purposes, return a default user
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
});

app.post('/v1/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
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