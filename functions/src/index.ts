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