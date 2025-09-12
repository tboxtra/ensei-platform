import * as functions from 'firebase-functions';
import * as firebaseAdmin from 'firebase-admin';

// Initialize Firebase Admin
firebaseAdmin.initializeApp();

// Get Firestore instance
const db = firebaseAdmin.firestore();

// Get Storage instance
const bucket = firebaseAdmin.storage().bucket();

// Create a simple Express app for the API
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: [
    'https://ensei-platform-onh1g1z1d-izecubes-projects-b81ca540.vercel.app',
    'https://ensei-platform-8mimjbhxx-izecubes-projects-b81ca540.vercel.app',
    'https://admin-dashboard-d83i9lh7f-izecubes-projects-b81ca540.vercel.app',
    'http://localhost:3000'
  ],
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
    const missionsSnapshot = await db.collection('missions')
      .where('status', '==', 'active')
      .orderBy('created_at', 'desc')
      .limit(50)
      .get();

    const missions = missionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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

    const mission = {
      id: missionDoc.id,
      ...missionDoc.data()
    };

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

    const newMission = {
      ...missionData,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      participants_count: 0,
      submissions_count: 0
    };

    const missionRef = await db.collection('missions').add(newMission);

    const createdMission = {
      id: missionRef.id,
      ...newMission
    };

    res.status(201).json(createdMission);
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

    const updatedUser = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    await db.collection('users').doc(userId).update(updatedUser);

    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.data();

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload endpoint (for mission proofs)
app.post('/v1/upload', verifyFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user.uid;

    // For now, return a mock file URL
    // In production, this would handle actual file upload to Firebase Storage
    const mockFileUrl = `https://storage.googleapis.com/ensei-6c8e0.appspot.com/uploads/${userId}/${Date.now()}.jpg`;

    res.json({
      success: true,
      file_url: mockFileUrl,
      message: 'File upload endpoint ready (mock response)'
    });
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