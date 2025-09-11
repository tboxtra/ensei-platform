import * as functions from 'firebase-functions';
import * as firebaseAdmin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Initialize Firebase Admin
firebaseAdmin.initializeApp();

// Import route handlers
import { authRoutes } from './routes/auth';
import { missionRoutes } from './routes/missions';
import { adminRoutes } from './routes/admin';
import { websocketHandler } from './routes/websocket';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/missions', missionRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'ensei-platform-firebase'
  });
});

// WebSocket handler
app.get('/ws', websocketHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);

// Export WebSocket as a separate function
export const websocket = functions.https.onRequest(websocketHandler);

// Export individual functions for better performance
export const auth = functions.https.onCall(async (data: any, context: any) => {
  // Handle authentication logic
  return { success: true };
});

export const missions = functions.https.onCall(async (data: any, context: any) => {
  // Handle mission logic
  return { success: true };
});

export const adminApi = functions.https.onCall(async (data: any, context: any) => {
  // Handle admin logic
  return { success: true };
});
