import * as functions from 'firebase-functions';
import * as firebaseAdmin from 'firebase-admin';
// User data integrity utilities
import {
  updateUserProfileSafely,
  createMissionWithUidReferences,
  verifyDataIntegrityAfterDisplayNameChange
} from './utils/user-data-integrity';
import { runMigration } from './migration/uid-migration';

// Initialize Firebase Admin
firebaseAdmin.initializeApp();

// Get Firestore instance
const db = firebaseAdmin.firestore();

// Get Storage instance
const bucket = firebaseAdmin.storage().bucket();

// Create a simple Express app for the API
import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors({
  origin: [
    'https://ensei-platform.vercel.app',
    'https://ensei-platform-onh1g1z1d-izecubes-projects-b81ca540.vercel.app',
    'https://ensei-platform-8mimjbhxx-izecubes-projects-b81ca540.vercel.app',
    'https://admin-dashboard-d83i9lh7f-izecubes-projects-b81ca540.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mov|avi/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and videos are allowed.'));
    }
  }
});

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

// Social Media API Integration Functions
const handleTwitterAction = async (action: string, tweetId: string, userId: string) => {
  // TODO: Implement Twitter API integration
  // This would connect to Twitter API v2 to perform actions like like, retweet, follow
  console.log(`Twitter action: ${action} on tweet ${tweetId} by user ${userId}`);
  return { success: true, action, tweetId };
};

const handleInstagramAction = async (action: string, postId: string, userId: string) => {
  // TODO: Implement Instagram API integration
  console.log(`Instagram action: ${action} on post ${postId} by user ${userId}`);
  return { success: true, action, postId };
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
    const missionsSnapshot = await db.collection('missions')
      .where('status', '==', 'active')
      .orderBy('created_at', 'desc')
      .limit(50)
      .get();

    // Filter out paused missions
    const missions = missionsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((mission: any) => !mission.isPaused); // Hide paused missions from users

    res.json(missions);
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/missions/:id', async (req, res) => {
  try {
    const missionId = req.params.id;
    console.log('Fetching mission:', missionId);

    const missionDoc = await db.collection('missions').doc(missionId).get();

    if (!missionDoc.exists) {
      res.status(404).json({ error: 'Mission not found', missionId });
      return;
    }

    const mission: any = {
      id: missionDoc.id,
      ...missionDoc.data()
    };

    // Check if mission is paused
    if (mission.isPaused) {
      res.status(404).json({ error: 'Mission not found', missionId });
      return;
    }

    res.json(mission);
  } catch (error) {
    console.error('Error fetching mission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/missions/my', verifyFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    console.log('Fetching missions for user:', userId);

    // Get missions created by user
    const createdMissionsSnapshot = await db.collection('missions')
      .where('created_by', '==', userId)
      .orderBy('created_at', 'desc')
      .get();

    // Get missions user is participating in
    const participationsSnapshot = await db.collection('mission_participations')
      .where('user_id', '==', userId)
      .get();

    const createdMissions = createdMissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'created'
    }));

    const participationMissions = await Promise.all(
      participationsSnapshot.docs.map(async (participationDoc) => {
        const participation = participationDoc.data();
        const missionDoc = await db.collection('missions').doc(participation.mission_id).get();
        if (missionDoc.exists) {
          return {
            id: missionDoc.id,
            ...missionDoc.data(),
            type: 'participating',
            participation_id: participationDoc.id,
            participation_status: participation.status
          };
        }
        return null;
      })
    );

    const allMissions = [...createdMissions, ...participationMissions.filter(Boolean)];
    res.json(allMissions);
  } catch (error) {
    console.error('Error fetching user missions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/v1/missions', verifyFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const missionData = req.body;

    // Validate required fields
    if (!missionData.platform) {
      res.status(400).json({ error: 'Platform is required' });
      return;
    }

    if (!missionData.type) {
      res.status(400).json({ error: 'Mission type is required' });
      return;
    }

    if (!missionData.tweetLink && !missionData.contentLink) {
      res.status(400).json({ error: 'Content link is required' });
      return;
    }

    if (!missionData.instructions || !missionData.instructions.trim()) {
      res.status(400).json({ error: 'Mission instructions are required' });
      return;
    }

    // Validate URL format
    const contentLink = missionData.tweetLink || missionData.contentLink;
    try {
      new URL(contentLink);
    } catch (urlError) {
      res.status(400).json({ error: 'Invalid URL format for content link' });
      return;
    }

    // Validate platform-specific URL patterns and content structure
    const url = new URL(contentLink);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname;
    let isValidUrl = false;
    let validationError = '';

    // Debug logging
    console.log('=== BACKEND URL VALIDATION DEBUG ===');
    console.log('Platform:', missionData.platform);
    console.log('Content Link:', contentLink);
    console.log('Hostname:', hostname);
    console.log('Pathname:', pathname);
    console.log('URL Object:', url);

    switch (missionData.platform) {
      case 'twitter':
        if (hostname.includes('x.com') || hostname.includes('twitter.com')) {
          // Check for specific tweet pattern
          if (pathname.match(/\/\w+\/status\/\d+/) || pathname.match(/\/\w+\/statuses\/\d+/)) {
            isValidUrl = true;
          } else {
            validationError = 'Twitter URL should be a specific tweet (e.g., /username/status/123)';
          }
        } else {
          validationError = 'Invalid Twitter domain';
        }
        break;
      case 'instagram':
        if (hostname.includes('instagram.com')) {
          // Check for specific post/reel pattern
          if (pathname.match(/\/p\/\w+/) || pathname.match(/\/reel\/\w+/)) {
            isValidUrl = true;
          } else {
            validationError = 'Instagram URL should be a specific post or reel (e.g., /p/ABC123 or /reel/XYZ789)';
          }
        } else {
          validationError = 'Invalid Instagram domain';
        }
        break;
      case 'tiktok':
        if (hostname.includes('tiktok.com')) {
          // Check for specific video pattern
          if (pathname.match(/\/@\w+\/video\/\d+/)) {
            isValidUrl = true;
          } else {
            validationError = 'TikTok URL should be a specific video (e.g., /@username/video/123456789)';
          }
        } else {
          validationError = 'Invalid TikTok domain';
        }
        break;
      case 'facebook':
        if (hostname.includes('facebook.com')) {
          // Check for specific post pattern
          if (pathname.match(/\/posts\/\d+/) || pathname.match(/\/groups\/\d+\/permalink\/\d+/)) {
            isValidUrl = true;
          } else {
            validationError = 'Facebook URL should be a specific post or group post';
          }
        } else {
          validationError = 'Invalid Facebook domain';
        }
        break;
      case 'whatsapp':
        if (hostname.includes('wa.me') || hostname.includes('whatsapp.com')) {
          isValidUrl = true;
        } else {
          validationError = 'Invalid WhatsApp domain';
        }
        break;
      case 'snapchat':
        if (hostname.includes('snapchat.com')) {
          isValidUrl = true;
        } else {
          validationError = 'Invalid Snapchat domain';
        }
        break;
      case 'telegram':
        if (hostname.includes('t.me') || hostname.includes('telegram.org')) {
          // Check for specific channel/group pattern
          if (pathname.match(/\/\w+/) && pathname !== '/') {
            isValidUrl = true;
          } else {
            validationError = 'Telegram URL should be a specific channel or group (e.g., /channel_name)';
          }
        } else {
          validationError = 'Invalid Telegram domain';
        }
        break;
      case 'custom':
        isValidUrl = true; // Accept any valid URL for custom platforms
        break;
      default:
        validationError = 'Unsupported platform';
    }

    console.log('Is Valid URL:', isValidUrl);
    console.log('Validation Error:', validationError);
    console.log('=====================================');

    if (!isValidUrl) {
      console.log('VALIDATION FAILED:', validationError);
      res.status(400).json({
        error: `URL Validation Failed: ${validationError}`
      });
      return;
    }

    // Validate tasks for non-custom platforms
    if (missionData.platform !== 'custom' && (!missionData.tasks || missionData.tasks.length === 0)) {
      res.status(400).json({ error: 'At least one task must be selected' });
      return;
    }

    // Use the safe mission creation function that ensures UID-based references
    const result = await createMissionWithUidReferences(userId, missionData);

    if (!result.success) {
      console.error('Mission creation failed:', result.error);
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(201).json(result.mission);
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

    // Check if mission exists
    const missionDoc = await db.collection('missions').doc(missionId).get();
    if (!missionDoc.exists) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }

    // Check if user already participated
    const existingParticipation = await db.collection('mission_participations')
      .where('mission_id', '==', missionId)
      .where('user_id', '==', userId)
      .get();

    if (!existingParticipation.empty) {
      res.status(400).json({ error: 'User already participating in this mission' });
      return;
    }

    const participation = {
      mission_id: missionId,
      user_id: userId,
      ...participationData,
      status: 'active',
      joined_at: new Date().toISOString(),
      submitted_at: null
    };

    const participationRef = await db.collection('mission_participations').add(participation);

    // Update mission participants count
    await db.collection('missions').doc(missionId).update({
      participants_count: firebaseAdmin.firestore.FieldValue.increment(1),
      updated_at: new Date().toISOString()
    });

    const createdParticipation = {
      id: participationRef.id,
      ...participation
    };

    res.status(201).json(createdParticipation);
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

    // Get or create user wallet
    const walletDoc = await db.collection('wallets').doc(userId).get();

    if (!walletDoc.exists) {
      // Create new wallet for user
      const newWallet = {
        honors: 0,
        usd: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await db.collection('wallets').doc(userId).set(newWallet);

      res.json({
        ...newWallet,
        transactions: []
      });
      return;
    }

    const wallet = walletDoc.data();

    // Get recent transactions
    const transactionsSnapshot = await db.collection('transactions')
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .limit(20)
      .get();

    const transactions = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      ...wallet,
      transactions
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

    // Get user's rewards
    const rewardsSnapshot = await db.collection('rewards')
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .get();

    const rewards = rewardsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(rewards);
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

    // Get the reward
    const rewardDoc = await db.collection('rewards').doc(rewardId).get();
    if (!rewardDoc.exists) {
      res.status(404).json({ error: 'Reward not found' });
      return;
    }

    const reward = rewardDoc.data();

    if (!reward) {
      res.status(404).json({ error: 'Reward data not found' });
      return;
    }

    // Check if reward belongs to user
    if (reward.user_id !== userId) {
      res.status(403).json({ error: 'Unauthorized to claim this reward' });
      return;
    }

    // Check if already claimed
    if (reward.status === 'claimed') {
      res.status(400).json({ error: 'Reward already claimed' });
      return;
    }

    // Update reward status
    await db.collection('rewards').doc(rewardId).update({
      status: 'claimed',
      claimed_at: new Date().toISOString()
    });

    // Update user wallet
    await db.collection('wallets').doc(userId).update({
      honors: firebaseAdmin.firestore.FieldValue.increment(reward.honors || 0),
      usd: firebaseAdmin.firestore.FieldValue.increment(reward.usd || 0),
      updated_at: new Date().toISOString()
    });

    // Create transaction record
    await db.collection('transactions').add({
      user_id: userId,
      type: 'reward_claim',
      amount: reward.honors || 0,
      currency: 'honors',
      description: `Claimed reward: ${reward.title || 'Mission reward'}`,
      reward_id: rewardId,
      created_at: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Reward claimed successfully',
      reward_id: rewardId,
      honors_added: reward.honors || 0,
      usd_added: reward.usd || 0
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User profile endpoints
app.get('/v1/user/profile', verifyFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user.uid;

    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      // Create new user profile
      const newUser = {
        uid: userId,
        email: req.user.email,
        name: req.user.name || '',
        avatar: req.user.picture || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stats: {
          missions_created: 0,
          missions_completed: 0,
          total_honors_earned: 0,
          total_usd_earned: 0
        }
      };

      await db.collection('users').doc(userId).set(newUser);
      res.json(newUser);
      return;
    }

    const user = userDoc.data();
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/v1/user/profile', verifyFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const updateData = req.body;

    console.log('Profile update request:', {
      userId,
      updateData,
      body: req.body
    });

    // Use the safe profile update function that ensures data integrity
    const result = await updateUserProfileSafely(userId, {
      ...updateData,
      email: req.user.email, // Always use email from Firebase Auth
      displayName: updateData.displayName || updateData.name || req.user.displayName || '',
      avatar: updateData.avatar || req.user.picture || ''
    });

    if (!result.success) {
      console.error('Profile update failed:', result.error);
      res.status(400).json({ error: result.error });
      return;
    }

    console.log('Profile update completed:', {
      userId,
      savedUser: result.updatedUser,
      twitter: result.updatedUser?.twitter,
      twitter_handle: result.updatedUser?.twitter_handle
    });

    res.json(result.updatedUser);
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Data integrity verification endpoint
app.post('/v1/user/verify-data-integrity', verifyFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { oldDisplayName, newDisplayName } = req.body;

    console.log('Data integrity verification request:', {
      userId,
      oldDisplayName,
      newDisplayName
    });

    const result = await verifyDataIntegrityAfterDisplayNameChange(
      userId,
      oldDisplayName || '',
      newDisplayName || ''
    );

    if (!result.success) {
      console.error('Data integrity verification failed:', result.issues);
      res.status(400).json({
        error: 'Data integrity verification failed',
        issues: result.issues
      });
      return;
    }

    console.log('Data integrity verification completed:', {
      userId,
      verified: result.verified,
      dataCounts: result.dataCounts,
      issues: result.issues
    });

    res.json({
      verified: result.verified,
      issues: result.issues,
      dataCounts: result.dataCounts
    });
  } catch (error) {
    console.error('Error verifying data integrity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload endpoint (for mission proofs)
app.post('/v1/upload', verifyFirebaseToken, upload.single('file'), async (req: any, res) => {
  try {
    const userId = req.user.uid;

    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const file = req.file;
    const fileName = `${userId}/${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    // Upload file to Firebase Storage
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    stream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    });

    stream.on('finish', async () => {
      try {
        // Make file publicly accessible
        await fileUpload.makePublic();

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        res.json({
          success: true,
          file_url: publicUrl,
          file_name: file.originalname,
          file_size: file.size,
          content_type: file.mimetype
        });
      } catch (error) {
        console.error('Error making file public:', error);
        res.status(500).json({ error: 'Failed to make file public' });
      }
    });

    stream.end(file.buffer);
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mission submission endpoint
app.post('/v1/missions/:id/submit', verifyFirebaseToken, async (req: any, res) => {
  try {
    const missionId = req.params.id;
    const userId = req.user.uid;
    const submissionData = req.body;

    // Check if user is participating in this mission
    const participationSnapshot = await db.collection('mission_participations')
      .where('mission_id', '==', missionId)
      .where('user_id', '==', userId)
      .get();

    if (participationSnapshot.empty) {
      res.status(400).json({ error: 'User not participating in this mission' });
      return;
    }

    const participation = participationSnapshot.docs[0];

    // Update participation with submission
    await db.collection('mission_participations').doc(participation.id).update({
      ...submissionData,
      status: 'submitted',
      submitted_at: new Date().toISOString()
    });

    // Update mission submissions count
    await db.collection('missions').doc(missionId).update({
      submissions_count: firebaseAdmin.firestore.FieldValue.increment(1),
      updated_at: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Mission submission successful',
      participation_id: participation.id
    });
  } catch (error) {
    console.error('Error submitting mission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin endpoint to seed sample data
app.post('/admin/seed-data', async (req, res) => {
  try {
    // Import and run seed function
    const { seedSampleData } = await import('./seed-data');
    await seedSampleData();

    res.json({
      success: true,
      message: 'Sample data seeded successfully'
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ error: 'Failed to seed data' });
  }
});

// Seed data endpoint (for development)
app.post('/v1/seed/missions', async (req, res) => {
  try {
    const sampleMissions = [
      {
        title: "AI Model Training Dataset Collection",
        description: "Help us collect and annotate training data for our new AI model. This mission involves gathering images, text, and other data types to improve machine learning accuracy.",
        category: "AI/ML",
        difficulty: "intermediate",
        total_cost_honors: 500,
        model: "GPT-4",
        duration_hours: 24,
        participants: 0,
        cap: 50,
        status: "active",
        requirements: [
          "Basic understanding of data annotation",
          "Access to computer with internet",
          "Attention to detail"
        ],
        deliverables: [
          "Annotated dataset of 1000+ items",
          "Quality report",
          "Documentation of annotation process"
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        participants_count: 0,
        submissions_count: 0
      },
      {
        title: "Blockchain Smart Contract Audit",
        description: "Conduct a comprehensive security audit of our DeFi smart contract. Identify vulnerabilities and provide recommendations for improvements.",
        category: "Blockchain",
        difficulty: "expert",
        total_cost_honors: 2000,
        model: "Claude-3",
        duration_hours: 72,
        participants: 0,
        cap: 5,
        status: "active",
        requirements: [
          "Expert knowledge of Solidity",
          "Experience with smart contract security",
          "Certified auditor preferred"
        ],
        deliverables: [
          "Detailed security audit report",
          "Vulnerability assessment",
          "Recommendations for fixes"
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        participants_count: 0,
        submissions_count: 0
      },
      {
        title: "Mobile App UI/UX Design",
        description: "Design a modern, user-friendly interface for our new mobile application. Focus on accessibility and user experience.",
        category: "Design",
        difficulty: "intermediate",
        total_cost_honors: 800,
        model: "DALL-E-3",
        duration_hours: 48,
        participants: 0,
        cap: 10,
        status: "active",
        requirements: [
          "Proficiency in Figma or similar tools",
          "Portfolio of mobile app designs",
          "Understanding of iOS/Android guidelines"
        ],
        deliverables: [
          "Complete UI/UX design system",
          "Interactive prototypes",
          "Design documentation"
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        participants_count: 0,
        submissions_count: 0
      },
      {
        title: "Content Writing for Tech Blog",
        description: "Write engaging, informative articles about AI, blockchain, and emerging technologies for our company blog.",
        category: "Writing",
        difficulty: "beginner",
        total_cost_honors: 300,
        model: "GPT-4",
        duration_hours: 16,
        participants: 0,
        cap: 20,
        status: "active",
        requirements: [
          "Strong writing skills",
          "Knowledge of tech topics",
          "SEO writing experience preferred"
        ],
        deliverables: [
          "5 high-quality blog posts (1000+ words each)",
          "SEO-optimized content",
          "Engaging social media snippets"
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        participants_count: 0,
        submissions_count: 0
      },
      {
        title: "Data Analysis and Visualization",
        description: "Analyze our user engagement data and create compelling visualizations to help us understand user behavior patterns.",
        category: "Analytics",
        difficulty: "intermediate",
        total_cost_honors: 600,
        model: "GPT-4",
        duration_hours: 32,
        participants: 0,
        cap: 8,
        status: "active",
        requirements: [
          "Proficiency in Python/R",
          "Experience with data visualization tools",
          "Statistical analysis skills"
        ],
        deliverables: [
          "Comprehensive data analysis report",
          "Interactive dashboards",
          "Actionable insights and recommendations"
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        participants_count: 0,
        submissions_count: 0
      }
    ];

    const batch = db.batch();
    const missionRefs = [];

    for (const mission of sampleMissions) {
      const missionRef = db.collection('missions').doc();
      batch.set(missionRef, mission);
      missionRefs.push({ id: missionRef.id, ...mission });
    }

    await batch.commit();

    res.json({
      message: 'Successfully seeded missions',
      count: sampleMissions.length,
      missions: missionRefs
    });
  } catch (error) {
    console.error('Error seeding missions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload endpoints
app.post('/v1/upload', verifyFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { fileName, fileType, base64Data } = req.body;

    if (!fileName || !fileType || !base64Data) {
      res.status(400).json({ error: 'Missing required fields: fileName, fileType, base64Data' });
      return;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `uploads/${userId}/${timestamp}_${sanitizedFileName}`;

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Upload to Firebase Storage
    const file = bucket.file(filePath);
    await file.save(fileBuffer, {
      metadata: {
        contentType: fileType,
        metadata: {
          uploadedBy: userId,
          originalName: fileName,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly accessible
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    res.json({
      success: true,
      fileUrl: publicUrl,
      fileName: sanitizedFileName,
      filePath,
      uploadedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mission submission with file upload
app.post('/v1/missions/:id/submit', verifyFirebaseToken, async (req: any, res) => {
  try {
    const missionId = req.params.id;
    const userId = req.user.uid;
    const { submissionData, files } = req.body;

    // Check if mission exists
    const missionDoc = await db.collection('missions').doc(missionId).get();
    if (!missionDoc.exists) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }

    // Check if user is participating in this mission
    const participationQuery = await db.collection('mission_participations')
      .where('mission_id', '==', missionId)
      .where('user_id', '==', userId)
      .get();

    if (participationQuery.empty) {
      res.status(400).json({ error: 'User is not participating in this mission' });
      return;
    }

    const participation = participationQuery.docs[0];
    const participationData = participation.data();

    if (participationData.status === 'submitted') {
      res.status(400).json({ error: 'Submission already exists for this mission' });
      return;
    }

    // Handle file uploads if any
    let uploadedFiles = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const { fileName, fileType, base64Data } = file;

        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `submissions/${missionId}/${userId}/${timestamp}_${sanitizedFileName}`;

        const fileBuffer = Buffer.from(base64Data, 'base64');
        const storageFile = bucket.file(filePath);

        await storageFile.save(fileBuffer, {
          metadata: {
            contentType: fileType,
            metadata: {
              missionId,
              submittedBy: userId,
              originalName: fileName,
              submittedAt: new Date().toISOString()
            }
          }
        });

        await storageFile.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

        uploadedFiles.push({
          fileName: sanitizedFileName,
          originalName: fileName,
          fileUrl: publicUrl,
          filePath,
          fileType
        });
      }
    }

    // Create submission record
    const submission = {
      mission_id: missionId,
      user_id: userId,
      submission_data: submissionData,
      files: uploadedFiles,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      feedback: null
    };

    const submissionRef = await db.collection('mission_submissions').add(submission);

    // Update participation status
    await participation.ref.update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      submission_id: submissionRef.id
    });

    // Update mission submissions count
    await db.collection('missions').doc(missionId).update({
      submissions_count: firebaseAdmin.firestore.FieldValue.increment(1),
      updated_at: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      submission: {
        id: submissionRef.id,
        ...submission
      }
    });
  } catch (error) {
    console.error('Error submitting mission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get mission submissions (for mission creators)
app.get('/v1/missions/:id/submissions', verifyFirebaseToken, async (req: any, res) => {
  try {
    const missionId = req.params.id;
    const userId = req.user.uid;

    // Check if user is the mission creator
    const missionDoc = await db.collection('missions').doc(missionId).get();
    if (!missionDoc.exists) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }

    const mission = missionDoc.data();
    if (!mission || mission.created_by !== userId) {
      res.status(403).json({ error: 'Access denied. Only mission creator can view submissions.' });
      return;
    }

    // Get submissions
    const submissionsSnapshot = await db.collection('mission_submissions')
      .where('mission_id', '==', missionId)
      .orderBy('submitted_at', 'desc')
      .get();

    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching mission submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin API endpoints
app.get('/v1/admin/missions', async (req, res) => {
  try {
    // Get all missions for admin view
    const missionsSnapshot = await db.collection('missions')
      .orderBy('created_at', 'desc')
      .get();

    // Get all users to map creator IDs to names
    const listUsersResult = await firebaseAdmin.auth().listUsers();
    const usersMap = new Map();
    listUsersResult.users.forEach(user => {
      usersMap.set(user.uid, {
        name: user.displayName || 'Unknown',
        email: user.email
      });
    });

    const missions = missionsSnapshot.docs.map(doc => {
      const data = doc.data();
      const creator = usersMap.get(data.created_by);
      return {
        id: doc.id,
        title: data.title,
        platform: data.platform,
        type: data.type,
        model: data.model,
        status: data.status,
        creatorId: data.created_by,
        creatorName: creator?.name || 'Unknown',
        creatorEmail: creator?.email || '',
        createdAt: data.created_at,
        submissionsCount: data.submissions_count || 0,
        approvedCount: data.approved_count || 0,
        totalCostUsd: data.rewards?.usd || 0,
        perUserHonors: data.rewards?.honors || 0,
        perWinnerHonors: data.rewards?.honors || 0,
        winnersCap: data.winnersCap,
        cap: data.cap,
        durationHours: data.durationHours,
        maxParticipants: data.max_participants,
        participantsCount: data.participants_count || 0,
        isPremium: data.isPremium || false,
        category: data.category,
        difficulty: data.difficulty,
        instructions: data.instructions,
        requirements: data.requirements,
        deliverables: data.deliverables,
        tweetLink: data.tweetLink,
        deadline: data.deadline,
        tasks: data.tasks,
        totalCostHonors: data.total_cost_honors,
        isPaused: data.isPaused || false,
        ...data // Include all other fields
      };
    });

    res.json(missions);
  } catch (error) {
    console.error('Error fetching admin missions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pause/Unpause mission
app.patch('/v1/admin/missions/:missionId/pause', async (req, res) => {
  try {
    const { missionId } = req.params;
    const { isPaused } = req.body;

    await db.collection('missions').doc(missionId).update({
      isPaused: isPaused,
      updated_at: new Date().toISOString()
    });

    res.json({ success: true, message: `Mission ${isPaused ? 'paused' : 'unpaused'} successfully` });
  } catch (error) {
    console.error('Error updating mission pause status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel/Delete mission permanently
app.delete('/v1/admin/missions/:missionId', async (req, res) => {
  try {
    const { missionId } = req.params;

    // Delete the mission
    await db.collection('missions').doc(missionId).delete();

    // Also delete any associated submissions
    const submissionsSnapshot = await db.collection('mission_submissions')
      .where('mission_id', '==', missionId)
      .get();

    const batch = db.batch();
    submissionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({ success: true, message: 'Mission deleted permanently' });
  } catch (error) {
    console.error('Error deleting mission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get mission submissions and reviews
app.get('/v1/admin/missions/:missionId/submissions', async (req, res) => {
  try {
    const { missionId } = req.params;

    // Get mission details
    const missionDoc = await db.collection('missions').doc(missionId).get();
    if (!missionDoc.exists) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    // Get submissions for this mission
    const submissionsSnapshot = await db.collection('mission_submissions')
      .where('mission_id', '==', missionId)
      .orderBy('submitted_at', 'desc')
      .get();

    // Get all users to map user IDs to names
    const listUsersResult = await firebaseAdmin.auth().listUsers();
    const usersMap = new Map();
    listUsersResult.users.forEach(user => {
      usersMap.set(user.uid, {
        name: user.displayName || 'Unknown',
        email: user.email
      });
    });

    const submissions = submissionsSnapshot.docs.map(doc => {
      const data = doc.data();
      const user = usersMap.get(data.user_id);
      return {
        id: doc.id,
        missionId: data.mission_id,
        userId: data.user_id,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || '',
        status: data.status || 'pending',
        submittedAt: data.submitted_at,
        proofs: data.proofs || [],
        rating: data.rating || 0,
        ratingCount: data.rating_count || 0,
        reviews: data.reviews || [],
        ...data
      };
    });

    return res.json({
      mission: {
        id: missionDoc.id,
        ...missionDoc.data()
      },
      submissions
    });
  } catch (error) {
    console.error('Error fetching mission submissions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/admin/users', async (req, res) => {
  try {
    // Get all users from Firebase Auth
    const listUsersResult = await firebaseAdmin.auth().listUsers();

    // Also get users from Firestore collection if they exist
    const usersSnapshot = await db.collection('users').get();
    const firestoreUsers = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Combine Firebase Auth users with Firestore user data
    const users = listUsersResult.users.map((authUser: any) => {
      const firestoreUser = firestoreUsers.find((u: any) => u.id === authUser.uid);
      return {
        id: authUser.uid,
        email: authUser.email,
        name: authUser.displayName || 'Unknown',
        role: firestoreUser?.role || 'user',
        status: authUser.disabled ? 'suspended' : 'active',
        createdAt: new Date(authUser.metadata.creationTime).toISOString(),
        lastLogin: authUser.metadata.lastSignInTime ? new Date(authUser.metadata.lastSignInTime).toISOString() : null,
        totalSubmissions: firestoreUser?.totalSubmissions || 0,
        approvedSubmissions: firestoreUser?.approvedSubmissions || 0,
        totalEarned: firestoreUser?.totalEarned || 0,
        reputation: firestoreUser?.reputation || 0,
        missionsCreated: firestoreUser?.missionsCreated || 0,
        missionsCompleted: firestoreUser?.missionsCompleted || 0,
        ...firestoreUser // Include any additional Firestore data
      };
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/submissions', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Get submissions for review
    let query = db.collection('mission_submissions')
      .orderBy('submitted_at', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    const submissionsSnapshot = await query
      .limit(parseInt(limit as string))
      .get();

    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      data: submissions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: submissions.length,
        totalPages: Math.ceil(submissions.length / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/admin/analytics/overview', async (req, res) => {
  try {
    // Get analytics overview for admin
    const missionsSnapshot = await db.collection('missions').get();
    const submissionsSnapshot = await db.collection('mission_submissions').get();

    // Get total users from Firebase Auth
    const listUsersResult = await firebaseAdmin.auth().listUsers();
    const totalUsers = listUsersResult.users.length;

    const totalMissions = missionsSnapshot.size;
    const totalSubmissions = submissionsSnapshot.size;

    // Calculate active missions
    const activeMissions = missionsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.status === 'active';
    }).length;

    // Calculate total revenue from missions
    let totalRevenue = 0;
    missionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.rewards?.usd) {
        totalRevenue += data.rewards.usd;
      }
    });

    // Calculate platform fee (25% of total revenue)
    const platformFee = totalRevenue * 0.25;

    // Calculate average completion rate (mock for now)
    const averageCompletionRate = totalSubmissions > 0 ? 75 : 0;

    res.json({
      totalRevenue,
      totalMissions,
      totalUsers,
      totalSubmissions,
      activeMissions,
      averageCompletionRate,
      platformFee,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/admin/analytics/revenue', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Generate mock revenue data based on period
    const revenueData = [];
    const now = new Date();

    if (period === '7d') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        revenueData.push({
          date: date.toISOString().split('T')[0],
          revenue: Math.random() * 1000 + 500
        });
      }
    } else if (period === '30d') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        revenueData.push({
          date: date.toISOString().split('T')[0],
          revenue: Math.random() * 2000 + 1000
        });
      }
    } else if (period === '90d') {
      for (let i = 89; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        revenueData.push({
          date: date.toISOString().split('T')[0],
          revenue: Math.random() * 3000 + 1500
        });
      }
    }

    res.json({
      daily: revenueData,
      monthly: revenueData.filter((_, index) => index % 7 === 0) // Sample monthly data
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/admin/analytics/user-growth', async (req, res) => {
  try {
    // const { period = '30d' } = req.query;

    // Generate mock user growth data
    const growthData = [];
    const now = new Date();
    let totalUsers = 0;

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const newUsers = Math.floor(Math.random() * 10) + 1;
      totalUsers += newUsers;

      growthData.push({
        date: date.toISOString().split('T')[0],
        users: totalUsers,
        newUsers
      });
    }

    res.json(growthData);
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/admin/analytics/platform-performance', async (req, res) => {
  try {
    // Get platform performance data from missions
    const missionsSnapshot = await db.collection('missions').get();

    const platformStats: Record<string, any> = {};

    missionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const platform = data.platform;

      if (!platformStats[platform]) {
        platformStats[platform] = {
          platform,
          missions: 0,
          submissions: 0,
          revenue: 0,
          completionRate: 0
        };
      }

      platformStats[platform].missions += 1;
      platformStats[platform].submissions += data.submissions_count || 0;
      platformStats[platform].revenue += data.rewards?.usd || 0;
    });

    // Calculate completion rates (mock for now)
    Object.values(platformStats).forEach((stat: any) => {
      stat.completionRate = Math.random() * 30 + 60; // 60-90% completion rate
    });

    res.json(Object.values(platformStats));
  } catch (error) {
    console.error('Error fetching platform performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/admin/analytics/mission-performance', async (req, res) => {
  try {
    // const { period = '30d' } = req.query;

    // Get mission performance data
    const missionsSnapshot = await db.collection('missions')
      .orderBy('created_at', 'desc')
      .limit(20)
      .get();

    const missionPerformance = missionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        missionId: doc.id,
        title: data.title,
        platform: data.platform,
        submissions: data.submissions_count || 0,
        approved: Math.floor((data.submissions_count || 0) * 0.8), // Mock approval rate
        revenue: data.rewards?.usd || 0,
        completionRate: Math.random() * 30 + 60 // 60-90% completion rate
      };
    });

    res.json(missionPerformance);
  } catch (error) {
    console.error('Error fetching mission performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/admin/system-config', async (req, res) => {
  try {
    // Get system configuration
    const configDoc = await db.collection('system_config').doc('main').get();

    if (!configDoc.exists) {
      // Return default config if none exists
      const defaultConfig = {
        platform: {
          name: 'Ensei Platform',
          version: '1.0.0',
          environment: 'production',
          maintenanceMode: false
        },
        pricing: {
          honorsPerUsd: 450,
          premiumMultiplier: 5,
          platformFeeRate: 0.25,
          userPoolFactor: 1.2
        },
        limits: {
          maxMissionsPerUser: 20,
          maxSubmissionsPerMission: 500,
          maxReviewersPerSubmission: 3,
          reviewTimeoutHours: 48
        },
        notifications: {
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: false
        }
      };

      res.json(defaultConfig);
      return;
    }

    res.json(configDoc.data());
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/v1/admin/system-config', async (req, res) => {
  try {
    // Update system configuration
    const configData = req.body;

    await db.collection('system_config').doc('main').set(configData, { merge: true });

    res.json({ success: true, message: 'System configuration updated' });
  } catch (error) {
    console.error('Error updating system config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Task submission endpoints
app.post('/v1/missions/:id/tasks/:taskId/complete', verifyFirebaseToken, async (req: any, res) => {
  try {
    const missionId = req.params.id;
    const taskId = req.params.taskId;
    const userId = req.user.uid;
    const { actionId, verificationData, platform, missionType } = req.body;

    // Get mission details
    const missionDoc = await db.collection('missions').doc(missionId).get();
    if (!missionDoc.exists) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    const mission = missionDoc.data();
    if (!mission) {
      return res.status(404).json({ error: 'Mission data not found' });
    }

    // Server-side URL validation for link-based tasks
    if (verificationData && verificationData.url && actionId === 'link') {
      const url = verificationData.url;
      const userSocialHandle = req.body.userSocialHandle;

      // Validate Twitter URL format
      const twitterUrlRegex = /^https?:\/\/(twitter\.com|x\.com)\/([^\/\?]+)\/status\/(\d+)/i;
      const match = url.match(twitterUrlRegex);

      if (!match) {
        return res.status(400).json({
          error: 'Invalid Twitter URL format. Must be a valid Twitter/X post URL.'
        });
      }

      const [, , extractedHandle] = match;

      // Validate that the URL belongs to the user
      if (userSocialHandle) {
        const normalizedUserHandle = userSocialHandle.toLowerCase().replace('@', '');
        const normalizedExtractedHandle = extractedHandle.toLowerCase();

        if (normalizedExtractedHandle !== normalizedUserHandle) {
          return res.status(400).json({
            error: `URL must be from your own Twitter account (@${userSocialHandle}). Found: @${extractedHandle}`
          });
        }
      }
    }

    // Check if user is already participating
    const participationQuery = await db.collection('mission_participations')
      .where('mission_id', '==', missionId)
      .where('user_id', '==', userId)
      .get();

    let participationId;
    if (participationQuery.empty) {
      // Create new participation
      const participation = {
        mission_id: missionId,
        user_id: userId,
        status: 'active',
        joined_at: new Date().toISOString(),
        tasks_completed: [],
        total_honors_earned: 0
      };
      const participationRef = await db.collection('mission_participations').add(participation);
      participationId = participationRef.id;

      // Update mission participants count
      await db.collection('missions').doc(missionId).update({
        participants_count: firebaseAdmin.firestore.FieldValue.increment(1),
        updated_at: new Date().toISOString()
      });
    } else {
      participationId = participationQuery.docs[0].id;
    }

    // Handle task completion based on action type
    let taskResult = null;
    if (actionId.includes('auto_')) {
      // Handle automatic actions (like, retweet, follow)
      const action = actionId.replace('auto_', '');
      if (platform === 'twitter') {
        const tweetId = extractTweetIdFromUrl(mission.tweetLink || mission.contentLink);
        if (tweetId) {
          taskResult = await handleTwitterAction(action, tweetId, userId);
        }
      } else if (platform === 'instagram') {
        const postId = extractPostIdFromUrl(mission.contentLink);
        if (postId) {
          taskResult = await handleInstagramAction(action, postId, userId);
        }
      }
    }

    // Create task completion record
    const taskCompletion = {
      task_id: taskId,
      action_id: actionId,
      completed_at: new Date().toISOString(),
      verification_data: verificationData,
      api_result: taskResult,
      status: 'completed'
    };

    // Update participation with completed task
    const participationDoc = await db.collection('mission_participations').doc(participationId).get();
    const currentData = participationDoc.data();
    const tasksCompleted = currentData?.tasks_completed || [];

    // Check if task is already completed
    const existingTask = tasksCompleted.find((t: any) => t.task_id === taskId);
    if (existingTask) {
      return res.status(400).json({ error: 'Task already completed' });
    }

    tasksCompleted.push(taskCompletion);

    // Calculate honors earned for this task
    const taskHonors = calculateTaskHonors(platform, missionType, taskId);
    const totalHonors = (currentData?.total_honors_earned || 0) + taskHonors;

    await db.collection('mission_participations').doc(participationId).update({
      tasks_completed: tasksCompleted,
      total_honors_earned: totalHonors,
      updated_at: new Date().toISOString()
    });

    return res.json({
      success: true,
      task_completion: taskCompletion,
      honors_earned: taskHonors,
      total_honors: totalHonors
    });

  } catch (error) {
    console.error('Error completing task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
const extractTweetIdFromUrl = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/twitter\.com\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
};

const extractPostIdFromUrl = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/instagram\.com\/p\/([^\/]+)/);
  return match ? match[1] : null;
};

const calculateTaskHonors = (platform: string, missionType: string, taskId: string): number => {
  // This should match the TASK_PRICES from the frontend
  const taskPrices: { [key: string]: { [key: string]: { [key: string]: number } } } = {
    twitter: {
      engage: {
        like: 50,
        retweet: 100,
        comment: 150,
        quote: 200,
        follow: 250
      },
      content: {
        meme: 300,
        thread: 500,
        article: 400,
        videoreview: 600
      },
      ambassador: {
        pfp: 250,
        name_bio_keywords: 200,
        pinned_tweet: 300,
        poll: 150,
        spaces: 800,
        community_raid: 400
      }
    },
    instagram: {
      engage: {
        like: 50,
        comment: 150,
        follow: 250,
        story_repost: 200
      },
      content: {
        feed_post: 300,
        reel: 500,
        carousel: 400,
        meme: 250
      },
      ambassador: {
        pfp: 250,
        hashtag_in_bio: 200,
        story_highlight: 300
      }
    }
  };

  return taskPrices[platform]?.[missionType]?.[taskId] || 0;
};

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);

// Export migration function (admin only)
export const migrateToUidBasedKeys = functions.https.onCall(async (data, context) => {
  // Only allow admin users to run migration
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admin users can run migration');
  }

  try {
    await runMigration();
    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    console.error('Migration failed:', error);
    throw new functions.https.HttpsError('internal', 'Migration failed', error);
  }
});

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

// Custom email verification function
export const sendCustomVerificationEmail = functions.https.onCall(async (data: any, context: any) => {
  try {
    const { email } = data;

    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'Email is required');
    }

    // Generate a custom verification link
    const actionCodeSettings = {
      url: 'https://ensei-platform.vercel.app/auth/verify-email/action',
      handleCodeInApp: true,
    };

    // Generate the verification link
    const actionLink = await firebaseAdmin.auth().generateEmailVerificationLink(email, actionCodeSettings);

    // Create a shorter, more mobile-friendly link
    const shortLink = actionLink.replace('https://ensei-6c8e0.firebaseapp.com/__/auth/action', 'https://ensei-platform.vercel.app/auth/verify-email/action');

    // Note: Custom email template would be used here in production
    // For now, we're using Firebase's built-in email verification

    // For now, we'll use Firebase's built-in email verification
    // In production, you could integrate with SendGrid, Mailgun, or similar services
    return {
      success: true,
      message: 'Verification email sent successfully',
      shortLink: shortLink // For debugging purposes
    };

  } catch (error) {
    console.error('Error sending custom verification email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send verification email');
  }
});

/**
 * Sync mission progress summary when task completions are updated
 * This creates/updates a lightweight summary document for efficient queries
 */
// Mission aggregates maintenance
export const updateMissionAggregates = functions.firestore
  .document('missions/{missionId}/completions/{completionId}')
  .onWrite(async (change, context) => {
    try {
      const { missionId } = context.params;
      const before = change.before.exists ? change.before.data() : null;
      const after = change.after.exists ? change.after.data() : null;

      // Only process verified completions
      if (after && after.status !== 'verified') return null;
      if (before && before.status !== 'verified') return null;

      const taskId = after?.taskId || before?.taskId;
      if (!taskId) return null;

      const missionRef = db.collection('missions').doc(missionId);
      const aggRef = missionRef.collection('aggregates').doc('counters');

      // Get mission data for winners cap
      const missionDoc = await missionRef.get();
      if (!missionDoc.exists) return null;

      const missionData = missionDoc.data();
      if (!missionData) {
        console.log(`Mission ${missionId} has no data, skipping aggregate update`);
        return null;
      }
      const winnersPerTask = missionData.winnersPerTask || null;
      const taskCount = Array.isArray(missionData.tasks) ? missionData.tasks.length : 0;

      // Calculate delta
      const delta = (after && !before) ? 1 : (!after && before) ? -1 : 0;

      await db.runTransaction(async (tx) => {
        const aggDoc = await tx.get(aggRef);
        const agg = aggDoc.exists ? aggDoc.data() : {
          taskCounts: {},
          totalCompletions: 0,
          winnersPerTask,
          taskCount
        };

        if (!agg) {
          console.error('Failed to get aggregate data');
          return;
        }

        // Race condition protection: check if we're at cap before incrementing
        if (delta > 0 && missionData.type === 'fixed' && winnersPerTask) {
          const currentCount = agg.taskCounts[taskId] || 0;
          if (currentCount >= winnersPerTask) {
            console.log(`Task ${taskId} already at cap (${currentCount}/${winnersPerTask}), skipping increment`);
            return; // Skip this update - task is already full
          }
        }

        // Update task count with bounds checking
        const prevCount = agg.taskCounts[taskId] || 0;
        const newCount = Math.max(0, prevCount + delta);
        agg.taskCounts[taskId] = newCount;
        agg.totalCompletions = Math.max(0, agg.totalCompletions + delta);
        agg.winnersPerTask = winnersPerTask;
        agg.taskCount = taskCount;
        agg.updatedAt = firebaseAdmin.firestore.FieldValue.serverTimestamp();

        // Log the mutation for monitoring
        console.log(`Aggregate mutation: mission=${missionId}, task=${taskId}, prev=${prevCount}, next=${newCount}, delta=${delta}, cause=verification`);

        // Alert if count exceeds cap (should be impossible with race protection)
        if (newCount > winnersPerTask && winnersPerTask) {
          console.error(`🚨 ALERT: Task ${taskId} count (${newCount}) exceeds cap (${winnersPerTask})!`);
        }

        // Alert if aggregates drift detected
        if (Math.abs(newCount - (agg.taskCounts[taskId] || 0)) > 1) {
          console.warn(`⚠️  Potential drift detected for task ${taskId}: expected=${agg.taskCounts[taskId] || 0}, actual=${newCount}`);
        }

        tx.set(aggRef, agg, { merge: true });
      });

      console.log(`Updated aggregates for mission ${missionId}, task ${taskId}, delta: ${delta}`);
      return null;
    } catch (error) {
      console.error('Error updating mission aggregates:', error);
      return null;
    }
  });

/**
 * Update user stats when a verification is created or transitions to verified
 */
export const onVerificationWrite = functions.firestore
  .document('verifications/{verificationId}')
  .onWrite(async (change, context) => {
    try {
      const after = change.after.exists ? change.after.data() : null;
      const before = change.before.exists ? change.before.data() : null;

      // Only act when moving into a VERIFIED state the first time
      const becameVerified = after?.status === 'VERIFIED' && before?.status !== 'VERIFIED';
      if (!becameVerified) return;

      const { uid, missionId, taskId, missionType, honorsPerTask, tasksRequired } = after as {
        uid: string;
        missionId: string;
        taskId: string;
        missionType: 'fixed' | 'degen';
        honorsPerTask: number;
        tasksRequired?: number;
      };

      if (!uid || !missionId || !taskId) {
        console.log('Missing required fields in verification:', { uid, missionId, taskId });
        return;
      }

      const userStatsRef = db.doc(`users/${uid}/stats`);
      const progressRef = db.doc(`users/${uid}/missionProgress/${missionId}`);
      const userTaskMarker = db.doc(`users/${uid}/missionProgress/${missionId}/tasks/${taskId}`);

      await db.runTransaction(async tx => {
        // 1) Update tasksDone count
        const statsSnap = await tx.get(userStatsRef);
        const stats = statsSnap.exists ? statsSnap.data() : {};
        const nextStats = {
          missionsCreated: stats.missionsCreated ?? 0,
          missionsCompleted: stats.missionsCompleted ?? 0,
          tasksDone: (stats.tasksDone ?? 0) + 1,
          totalEarned: stats.totalEarned ?? 0,
          updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        };

        // 2) Check if this is a new task completion for this user
        const userTaskSnap = await tx.get(userTaskMarker);
        if (!userTaskSnap.exists) {
          // Mark this task as completed for this user
          tx.set(userTaskMarker, { 
            verified: true, 
            at: firebaseAdmin.firestore.FieldValue.serverTimestamp() 
          });

          // Update mission progress
          const progSnap = await tx.get(progressRef);
          const prog = progSnap.exists ? progSnap.data() : { 
            tasksVerified: 0, 
            tasksRequired: 0, 
            completed: false 
          };

          const newTasksVerified = (prog.tasksVerified ?? 0) + 1;
          const req = prog.tasksRequired || tasksRequired || 1; // fallback to 1 if not provided
          const completed = newTasksVerified >= req;

          tx.set(progressRef, {
            tasksVerified: newTasksVerified,
            tasksRequired: req,
            completed,
            updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });

          // If mission just completed, increment missionsCompleted
          if (completed && !prog.completed) {
            nextStats.missionsCompleted = (nextStats.missionsCompleted ?? 0) + 1;
          }
        }

        // 3) Honors logic
        if (missionType === 'fixed') {
          nextStats.totalEarned = (nextStats.totalEarned ?? 0) + (honorsPerTask || 0);
        }
        // degen: no honors here; winners script will add

        tx.set(userStatsRef, nextStats, { merge: true });
      });

      console.log(`Updated user stats for ${uid}: tasksDone++, missionType=${missionType}`);
    } catch (error) {
      console.error('Error updating user stats on verification:', error);
    }
  });

/**
 * Update user stats when degen winners are chosen
 */
export const onDegenWinnersChosen = functions.firestore
  .document('missions/{missionId}/tasks/{taskId}')
  .onUpdate(async (change, context) => {
    try {
      const after = change.after.data();
      const before = change.before.data();
      
      if (!after || before?.winnersHash === after.winnersHash) return; // idempotency

      if (after.type !== 'degen' || !Array.isArray(after.winners)) return;

      const { winners, honorsPerTask, missionId } = after as {
        winners: string[];
        honorsPerTask: number;
        missionId: string;
      };

      const taskId = context.params.taskId;

      await Promise.all(winners.map(async (uid) => {
        const statsRef = db.doc(`users/${uid}/stats`);
        const winMarker = db.doc(`users/${uid}/missionProgress/${missionId}/wins/${taskId}`);
        
        await db.runTransaction(async tx => {
          // Check if already paid (idempotency)
          const winSnap = await tx.get(winMarker);
          if (winSnap.exists) {
            console.log(`User ${uid} already won task ${taskId}, skipping payment`);
            return;
          }

          // Update totalEarned
          const statsSnap = await tx.get(statsRef);
          const curr = statsSnap.exists ? statsSnap.data() : {};
          tx.set(statsRef, {
            totalEarned: (curr.totalEarned ?? 0) + (honorsPerTask || 0),
            updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });

          // Mark win to avoid double-paying
          tx.set(winMarker, { 
            won: true, 
            at: firebaseAdmin.firestore.FieldValue.serverTimestamp() 
          });
        });
      }));

      console.log(`Updated degen winners for mission ${missionId}, task ${taskId}: ${winners.length} winners`);
    } catch (error) {
      console.error('Error updating degen winners:', error);
    }
  });

/**
 * Update user stats when a mission is created
 */
export const onMissionCreate = functions.firestore
  .document('missions/{missionId}')
  .onCreate(async (snap, context) => {
    try {
      const missionData = snap.data();
      const { created_by, deletedAt } = missionData;
      
      if (!created_by || deletedAt) return; // skip if no owner or soft-deleted

      const statsRef = db.doc(`users/${created_by}/stats`);
      await statsRef.set({
        missionsCreated: firebaseAdmin.firestore.FieldValue.increment(1),
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      console.log(`Updated missionsCreated for user ${created_by}`);
    } catch (error) {
      console.error('Error updating missionsCreated:', error);
    }
  });

export const syncMissionProgress = functions.firestore
  .document('mission_participations/{participationId}')
  .onWrite(async (change, context) => {
    try {
      const before = change.before.exists ? change.before.data() : null;
      const after = change.after.exists ? change.after.data() : null;

      // Only process if this is a task completion (has taskId)
      if (!after || !after.taskId) {
        return null;
      }

      const userId = after.user_id || after.userId;
      const missionId = after.mission_id || after.missionId;

      if (!userId || !missionId) {
        console.log('Missing userId or missionId, skipping sync');
        return null;
      }

      // Only sync when status changes to verified
      const wasVerified = before && (before.status === 'verified' || before.status === 'completed');
      const isVerified = after.status === 'verified' || after.status === 'completed';

      if (!isVerified || wasVerified) {
        console.log('Status not verified or already was verified, skipping sync');
        return null;
      }

      console.log(`Syncing mission progress for user ${userId}, mission ${missionId}`);

      // Normalize task ID
      const norm = (v?: string) => String(v ?? '').trim().toLowerCase();
      norm(after.taskId); // Normalize for consistency

      // Get mission details to determine total tasks
      const missionRef = db.collection('missions').doc(missionId);
      const missionDoc = await missionRef.get();

      if (!missionDoc.exists) {
        console.log(`Mission ${missionId} not found, skipping sync`);
        return null;
      }

      const missionData = missionDoc.data();
      if (!missionData) {
        console.log(`Mission ${missionId} has no data, skipping sync`);
        return null;
      }

      const totalTasks = Array.isArray(missionData.tasks) ? missionData.tasks.length
        : Array.isArray(missionData.requirements) ? missionData.requirements.length
          : 0;

      // Get all verified completions for this user+mission
      const completionsQuery = db.collection('mission_participations')
        .where('user_id', '==', userId)
        .where('mission_id', '==', missionId)
        .where('status', 'in', ['verified', 'completed']);

      const completionsSnapshot = await completionsQuery.get();

      // Build set of verified task IDs
      const verifiedTaskIds = new Set<string>();
      completionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const tid = norm(data.taskId || data.task_id);
        if (tid) verifiedTaskIds.add(tid);
      });

      const verifiedCount = verifiedTaskIds.size;
      const missionCompleted = totalTasks > 0 && verifiedCount === totalTasks;

      // Update or create mission progress summary
      const progressRef = db.collection('mission_progress').doc(`${missionId}_${userId}`);
      const progressDoc = await progressRef.get();

      const progressData = {
        userId,
        missionId,
        verifiedTaskIds: Array.from(verifiedTaskIds),
        verifiedCount,
        totalTasks,
        missionCompleted,
        completedAt: missionCompleted && (!progressDoc.exists || !progressDoc.data()?.missionCompleted)
          ? firebaseAdmin.firestore.FieldValue.serverTimestamp()
          : progressDoc.exists ? progressDoc.data()?.completedAt : null,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
      };

      await progressRef.set(progressData, { merge: true });

      console.log(`Mission progress synced: ${verifiedCount}/${totalTasks} tasks completed for user ${userId}`);

      return null;
    } catch (error) {
      console.error('Error syncing mission progress:', error);
      return null;
    }
  });