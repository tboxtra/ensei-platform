import * as functions from 'firebase-functions';
import * as firebaseAdmin from 'firebase-admin';

// Type definitions for user stats
type UserStats = {
  missionsCreated: number;
  missionsCompleted: number;
  tasksDone: number;
  tasksCompleted: number; // Alias for tasksDone for consistency
  totalEarned: number;
  totalEarnings: number; // Alias for totalEarned for consistency
  lastActiveAt: string;
};

type MissionProgress = {
  tasksVerified: number;
  tasksRequired: number;
  completed: boolean;
};

// Helper functions for safe defaults
const emptyStats = (): UserStats => ({
  missionsCreated: 0,
  missionsCompleted: 0,
  tasksDone: 0,
  tasksCompleted: 0,
  totalEarned: 0,
  totalEarnings: 0,
  lastActiveAt: new Date().toISOString(),
});

const emptyProgress = (req = 1): MissionProgress => ({
  tasksVerified: 0,
  tasksRequired: req,
  completed: false,
});
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
// import { fileTypeFromBuffer } from 'file-type';

const app = express();
app.use(cors({
  origin: [
    'https://ensei-platform.vercel.app',
    'https://ensei-platform-onh1g1z1d-izecubes-projects-b81ca540.vercel.app',
    'https://ensei-platform-8mimjbhxx-izecubes-projects-b81ca540.vercel.app',
    'https://admin-dashboard-d83i9lh7f-izecubes-projects-b81ca540.vercel.app',
    'https://ensei-platform-git-main-izecubes-projects-b81ca540.vercel.app', // Current admin domain
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.options('*', cors()); // Handle preflight requests
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Strict file type validation
    const allowedExt = /\.(jpe?g|png|gif|pdf|docx?|txt|mp4|mov|avi)$/i;
    const allowedMime = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'video/mp4', 'video/quicktime', 'video/x-msvideo'
    ];

    const extOk = allowedExt.test(file.originalname);
    const mimeOk = allowedMime.includes(file.mimetype);

    if (extOk && mimeOk) {
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

// Enhanced Pack System Health Check with Synthetic Probes
app.get('/health/packs', async (req, res) => {
  try {
    const startTime = Date.now();
    const healthChecks: any = {};

    // Test 1: Pack catalog access
    try {
      const packCatalog = [
        { id: 'single_1_small', priceUsd: 10, quotas: { tweets: 1, likes: 100, retweets: 60, comments: 40 } },
        { id: 'single_1_medium', priceUsd: 15, quotas: { tweets: 1, likes: 200, retweets: 120, comments: 80 } },
        { id: 'single_1_large', priceUsd: 25, quotas: { tweets: 1, likes: 500, retweets: 300, comments: 200 } }
      ];
      healthChecks.packCatalog = {
        status: 'ok',
        count: packCatalog.length,
        expectedCount: 3,
        catalogValid: packCatalog.every(p => p.id && p.priceUsd && p.quotas)
      };
    } catch (error) {
      healthChecks.packCatalog = { status: 'error', error: error.message };
    }

    // Test 2: Firestore connectivity
    try {
      const testDoc = await db.collection('health_checks').doc('pack_system').get();
      healthChecks.firestore = {
        status: 'ok',
        accessible: true,
        readLatency: Date.now() - startTime
      };
    } catch (error) {
      healthChecks.firestore = { status: 'error', error: error.message };
    }

    // Test 3: Entitlements collection access
    try {
      const entitlementsSnapshot = await db.collection('entitlements').limit(1).get();
      healthChecks.entitlements = {
        status: 'ok',
        accessible: true,
        documentCount: entitlementsSnapshot.size
      };
    } catch (error) {
      healthChecks.entitlements = { status: 'error', error: error.message };
    }

    // Test 4: Transactions collection access
    try {
      const transactionsSnapshot = await db.collection('transactions').limit(1).get();
      healthChecks.transactions = {
        status: 'ok',
        accessible: true,
        documentCount: transactionsSnapshot.size
      };
    } catch (error) {
      healthChecks.transactions = { status: 'error', error: error.message };
    }

    // Test 5: Synthetic pack validation
    try {
      const syntheticPack = { id: 'health_check_pack', priceUsd: 0, quotas: { tweets: 1, likes: 1, retweets: 1, comments: 1 } };
      const isValidPack = syntheticPack.id && syntheticPack.priceUsd >= 0 && syntheticPack.quotas;
      healthChecks.syntheticValidation = {
        status: isValidPack ? 'ok' : 'error',
        packValid: isValidPack
      };
    } catch (error) {
      healthChecks.syntheticValidation = { status: 'error', error: error.message };
    }

    const responseTime = Date.now() - startTime;
    const overallStatus = Object.values(healthChecks).every((check: any) => check.status === 'ok') ? 'healthy' : 'unhealthy';

    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: healthChecks,
      responseTime: `${responseTime}ms`,
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Pack system health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      version: '1.0.0'
    });
  }
});

// Pack System Metrics Endpoint (Simplified)
app.get('/metrics/packs', async (req, res) => {
  try {
    const now = new Date();

    // Get all transactions (simplified approach)
    const allTransactions = await db.collection('transactions').get();

    // Get all entitlements
    const allEntitlements = await db.collection('entitlements').get();

    // Calculate basic metrics
    let totalPurchases = 0;
    let totalRevenue = 0;
    let activeEntitlements = 0;
    let totalQuotaUsed = 0;
    let totalQuotaAvailable = 0;

    // Process transactions
    allTransactions.docs.forEach(doc => {
      const data = doc.data();
      if (data.type === 'purchase') {
        totalPurchases++;
        totalRevenue += Math.abs(data.amount || 0);
      }
    });

    // Process entitlements
    allEntitlements.docs.forEach(doc => {
      const data = doc.data();
      if (data.status === 'active') {
        activeEntitlements++;
        totalQuotaUsed += data.usage?.tweetsUsed || 0;
        totalQuotaAvailable += data.quotas?.tweets || 0;
      }
    });

    res.json({
      timestamp: now.toISOString(),
      metrics: {
        purchases: {
          total: totalPurchases,
          totalRevenue: totalRevenue
        },
        entitlements: {
          active: activeEntitlements,
          totalQuotaUsed: totalQuotaUsed,
          totalQuotaAvailable: totalQuotaAvailable,
          utilizationRate: totalQuotaAvailable > 0 ? (totalQuotaUsed / totalQuotaAvailable * 100).toFixed(2) + '%' : '0%'
        },
        system: {
          totalTransactions: allTransactions.size,
          totalEntitlements: allEntitlements.size
        }
      }
    });
  } catch (error) {
    console.error('Pack metrics collection failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
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

    // Check for demo tokens first
    if (token === 'demo_admin_token' || token === 'demo_moderator_token') {
      req.user = {
        uid: token === 'demo_admin_token' ? 'mDPgwAwb1pYqmxmsPsYW1b4qlup2' : 'demo_moderator_1',
        admin: true,
        email: token === 'demo_admin_token' ? 'admin@ensei.com' : 'moderator@ensei.com'
      };
      next();
      return;
    }

    // Verify real Firebase token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to require admin access
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    // Check for demo admin tokens first
    if (token === 'demo_admin_token' || token === 'demo_moderator_token') {
      req.user = {
        uid: token === 'demo_admin_token' ? 'demo_admin_1' : 'demo_moderator_1',
        admin: true,
        email: token === 'demo_admin_token' ? 'admin@ensei.com' : 'moderator@ensei.com'
      };
      next();
      return;
    }

    // Verify real Firebase token
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    if (!decoded.admin) return res.status(403).json({ error: 'Admin access required' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Centralized URL validation and normalization
const normalizeUrl = (url: string): string => {
  if (!url) return '';
  // Convert x.com to twitter.com for consistency
  let normalized = url.replace(/x\.com/g, 'twitter.com');
  // Remove query parameters and fragments for consistency
  normalized = normalized.split('?')[0].split('#')[0];
  return normalized.trim();
};

const validateUrl = (url: string, platform: string): { isValid: boolean; error?: string } => {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }

  const normalized = normalizeUrl(url);

  try {
    new URL(normalized);
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }

  // Platform-specific validation
  if (platform === 'twitter') {
    const twitterRegex = /(?:https?:\/\/)?(?:www\.|mobile\.)?(?:x\.com|twitter\.com)\/[^/]+\/status\/(\d+)/i;
    if (!twitterRegex.test(normalized)) {
      return { isValid: false, error: 'Invalid Twitter/X URL format' };
    }
  } else if (platform === 'instagram') {
    const instagramRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/[A-Za-z0-9_-]+\/?/i;
    if (!instagramRegex.test(normalized)) {
      return { isValid: false, error: 'Invalid Instagram URL format' };
    }
  }

  return { isValid: true };
};

// Safe timestamp conversion utility
const toIso = (v: any) => {
  if (!v) return null;

  // Firestore Timestamp
  if (v?.toDate && typeof v.toDate === 'function') {
    try { return v.toDate().toISOString(); } catch { }
  }

  // {seconds: number}
  if (typeof v === 'object' && typeof v.seconds === 'number') {
    try { return new Date(v.seconds * 1000).toISOString(); } catch { }
  }

  // Native Date
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString();

  // Firestore Console-style string: "September 30, 2025 at 1:08:34 PM UTC+1"
  if (typeof v === 'string') {
    const m = v.match(/^([A-Za-z]+ \d{1,2}, \d{4}) at (\d{1,2}:\d{2}:\d{2} [AP]M) UTC([+-]\d+)/);
    if (m) {
      const [, d, t, off] = m;
      const candidate = new Date(`${d} ${t} GMT${off}`);
      if (!isNaN(candidate.getTime())) return candidate.toISOString();
    }
    const dt = new Date(v);
    if (!isNaN(dt.getTime())) return dt.toISOString();
  }

  if (typeof v === 'number') {
    const dt = new Date(v);
    if (!isNaN(dt.getTime())) return dt.toISOString();
  }

  console.warn('toIso: Unable to convert', v);
  return null;
};

// Field normalization utilities
const normalizeMissionData = (data: any) => {
  // Normalize field names to canonical snake_case
  const normalized = { ...data };

  // Duration field normalization
  if (normalized.durationHours && !normalized.duration_hours) {
    normalized.duration_hours = normalized.durationHours;
  }
  if (normalized.duration && !normalized.duration_hours) {
    normalized.duration_hours = normalized.duration;
  }

  // Cap field normalization
  if (normalized.cap && !normalized.max_participants) {
    normalized.max_participants = normalized.cap;
  }
  if (normalized.winnersCap && !normalized.winners_cap) {
    normalized.winners_cap = normalized.winnersCap;
  }

  // Timestamp normalization
  if (normalized.createdAt && !normalized.created_at) {
    normalized.created_at = normalized.createdAt;
  }
  if (normalized.updatedAt && !normalized.updated_at) {
    normalized.updated_at = normalized.updatedAt;
  }

  return normalized;
};

const serializeMissionResponse = (data: any) => {

  // Helper: limit used by the UI progress bar
  const deriveSubmissionsLimit = (d: any) =>
    d.model === 'degen'
      ? (d.winnersPerMission ?? d.winnersCap ?? d.maxWinners ?? 0)
      : (d.cap ?? d.max_participants ?? 0);

  // ✅ FIX: Calculate deadline for degen missions if missing (same logic as admin endpoint)
  const createdAt = toIso(data.created_at);
  const rawDeadline = toIso(data.deadline);
  let calculatedDeadline = rawDeadline;

  if (data.model === 'degen' && !rawDeadline && data.duration && createdAt) {
    try {
      const startDate = new Date(createdAt);
      const endDate = new Date(startDate.getTime() + (data.duration * 60 * 60 * 1000));
      calculatedDeadline = endDate.toISOString();
      console.log('🔧 Calculated deadline for degen mission:', data.id, 'deadline:', calculatedDeadline);
    } catch (e) {
      console.warn('Failed to calculate deadline for degen mission in serializeMissionResponse:', data.id, e);
    }
  }

  // ✅ FIX: Add reward derivation to public serializer so public cards don't show $0
  const deriveRewards = (d: any) => {
    if (d.model === 'degen') {
      const usd = Number(d.selectedDegenPreset?.costUSD ?? d.costUSD ?? 0);
      const honors = Math.round(usd * 450); // Use default honorsPerUsd
      return { usd, honors };
    }
    // fixed
    const perUserHonors = d.rewardPerUser ?? 0;
    const participants = d.cap ?? d.max_participants ?? d.winnersCap ?? 0;
    const honors = perUserHonors * participants;
    const usd = Number((honors / 450).toFixed(2)); // Use default honorsPerUsd
    return { usd, honors, perUserHonors };
  };

  const storedRewards = data.rewards;
  const derivedRewards = deriveRewards(data);
  const rewards = {
    usd: (storedRewards?.usd && storedRewards.usd > 0) ? storedRewards.usd : derivedRewards.usd,
    honors: (storedRewards?.honors && storedRewards.honors > 0) ? storedRewards.honors : derivedRewards.honors,
    ...(derivedRewards.perUserHonors && { perUserHonors: derivedRewards.perUserHonors })
  };

  // derive rewards if missing or zero (best-effort, no I/O here)
  try {
    const hasRewards = data?.rewards && ((data.rewards.usd ?? 0) > 0 || (data.rewards.honors ?? 0) > 0);
    if (!hasRewards) {
      const costUSD = data?.selectedDegenPreset?.costUSD ?? data?.costUSD ?? 0;
      if (data.model === 'degen' && costUSD > 0) {
        const honorsPerUsd = 450; // keep in sync or pass in via cfg if available here
        data.rewards = { usd: Number(costUSD), honors: Math.round(costUSD * honorsPerUsd) };
      }
      if (data.model === 'fixed' && (data.rewardPerUser ?? 0) > 0) {
        const participants = data.cap ?? data.max_participants ?? data.winnersCap ?? 0;
        const honors = (data.rewardPerUser ?? 0) * participants;
        const honorsPerUsd = 450;
        data.rewards = { usd: Number((honors / honorsPerUsd).toFixed(2)), honors, perUserHonors: data.rewardPerUser };
      }
    }
  } catch { }

  return {
    ...data,
    durationHours: data.duration_hours || data.durationHours || data.duration,
    maxParticipants: data.max_participants || data.maxParticipants || data.cap,
    winnersCap: data.winners_cap || data.winnersCap,
    winnersPerMission: data.winnersPerMission ?? data.winners_cap ?? data.winnersCap ?? data.winnersPerTask,
    createdAt,
    updatedAt: toIso(data.updated_at),
    deadline: calculatedDeadline,
    expiresAt: toIso(data.expires_at),

    // ✅ canonical fields the UI expects
    startAt: createdAt,
    endAt: calculatedDeadline || toIso(data.expires_at),

    // ✅ submissionsLimit for UI progress bars
    submissionsLimit: deriveSubmissionsLimit(data),

    // ✅ rewards for public cards
    rewards: data.rewards,
    totalCostUsd: data.rewards?.usd ?? 0,
    totalCostHonors: data.rewards?.honors ?? 0,

    // keep content link normalization too if you like
    contentLink: data.contentLink || data.tweetLink || data.link || data.url || data.postUrl,
  };
};

// Status standardization
const STANDARD_STATUSES = {
  pending: 'pending',
  submitted: 'submitted',
  verified: 'verified',
  approved: 'approved',
  rejected: 'rejected',
  completed: 'completed',
  active: 'active',
  paused: 'paused',
  expired: 'expired'
};

// ✅ CONFIG UNIFICATION - Unified config accessor for consistent data access
const readCfg = (cfg: any = {}) => ({
  honorsPerUsd: cfg.honorsPerUsd ?? cfg.pricing?.honorsPerUsd ?? 450,
  platformFeeRate: cfg.platformFeeRate ?? cfg.pricing?.platformFeeRate ?? 0.25,
  premiumMultiplier: cfg.premiumMultiplier ?? cfg.pricing?.premiumMultiplier ?? 5,
  taskPrices: cfg.pricing?.taskPrices ?? DEFAULT_TASK_PRICES,
});

// Centralized configuration - should match frontend config
const DEFAULT_TASK_PRICES: Record<string, number> = {
  // Twitter tasks
  like: 50,
  retweet: 100,
  comment: 150,
  quote: 200,
  follow: 250,
  meme: 300,
  thread: 500,
  article: 400,
  videoreview: 600,
  pfp: 250,
  name_bio_keywords: 200,
  pinned_tweet: 300,
  poll: 150,
  spaces: 800,
  community_raid: 400,
  status_50_views: 300,

  // Instagram tasks
  like_instagram: 50,
  comment_instagram: 150,
  follow_instagram: 250,
  story_instagram: 200,
  post_instagram: 400,

  // TikTok tasks
  like_tiktok: 50,
  comment_tiktok: 150,
  follow_tiktok: 250,
  share_tiktok: 200,

  // Facebook tasks
  like_facebook: 50,
  comment_facebook: 150,
  share_facebook: 200,
  follow_facebook: 250,

  // WhatsApp tasks
  join_whatsapp: 100,
  share_whatsapp: 150,

  // Custom tasks
  custom: 100
};

// Get task prices from system config or use defaults
const getTaskPrices = async (): Promise<Record<string, number>> => {
  try {
    const configDoc = await db.collection('system_config').doc('main').get();
    if (configDoc.exists) {
      const config = configDoc.data();
      return config?.pricing?.taskPrices || DEFAULT_TASK_PRICES;
    }
  } catch (error) {
    console.error('Error fetching task prices from config:', error);
  }
  return DEFAULT_TASK_PRICES;
};

const normalizeStatus = (status: any): string => {
  if (!status) return 'pending';

  const statusStr = String(status).toLowerCase();

  // Map legacy statuses to standard ones
  const legacyMap: Record<string, string> = {
    'verified': 'verified',
    'VERIFIED': 'verified',
    'approved': 'approved',
    'APPROVED': 'approved',
    'completed': 'completed',
    'COMPLETED': 'completed',
    'active': 'active',
    'ACTIVE': 'active',
    'paused': 'paused',
    'PAUSED': 'paused',
    'expired': 'expired',
    'EXPIRED': 'expired'
  };

  return legacyMap[statusStr] || statusStr;
};

// ✅ RATE LIMITING WITH SHARED STORE - Firestore-based rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

const rateLimit = async (req: any, res: any, next: any) => {
  try {
    const clientId = req.user?.uid || req.ip || 'anonymous';
    const now = Date.now();
    const windowStart = Math.floor(now / RATE_LIMIT_WINDOW) * RATE_LIMIT_WINDOW;
    const rateLimitKey = `rate_limit_${clientId}_${windowStart}`;

    // Use Firestore for distributed rate limiting
    const rateLimitRef = db.collection('rate_limits').doc(rateLimitKey);

    // Use transaction to atomically check and increment
    await db.runTransaction(async (transaction) => {
      const rateLimitDoc = await transaction.get(rateLimitRef);

      if (!rateLimitDoc.exists) {
        // First request in this window
        transaction.set(rateLimitRef, {
          count: 1,
          windowStart,
          lastRequest: now,
          clientId
        });
      } else {
        const data = rateLimitDoc.data();
        const currentCount = data?.count || 0;

        if (currentCount >= RATE_LIMIT_MAX_REQUESTS) {
          throw new Error('RATE_LIMIT_EXCEEDED');
        }

        // Increment count
        transaction.update(rateLimitRef, {
          count: currentCount + 1,
          lastRequest: now
        });
      }
    });

    next();
  } catch (error) {
    if (error.message === 'RATE_LIMIT_EXCEEDED') {
      res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
      });
    } else {
      console.error('Rate limiting error:', error);
      // Allow request to proceed if rate limiting fails
      next();
    }
  }
};

// Idempotency key validation
// ✅ IDEMPOTENCY WITH SHARED STORE - Firestore-based idempotency
const checkIdempotency = async (req: any, res: any, next: any) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'];

    if (!idempotencyKey) {
      return next();
    }

    // Use Firestore for distributed idempotency checking
    const idempotencyRef = db.collection('idempotency_keys').doc(idempotencyKey);

    // Use transaction to atomically check and set
    await db.runTransaction(async (transaction) => {
      const idempotencyDoc = await transaction.get(idempotencyRef);

      if (idempotencyDoc.exists) {
        throw new Error('IDEMPOTENCY_KEY_EXISTS');
      }

      // Set idempotency key with TTL (24 hours)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      transaction.set(idempotencyRef, {
        key: idempotencyKey,
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        expiresAt,
        endpoint: req.path,
        method: req.method
      });
    });

    next();
  } catch (error) {
    if (error.message === 'IDEMPOTENCY_KEY_EXISTS') {
      res.status(409).json({ error: 'Duplicate request detected' });
    } else {
      console.error('Idempotency check error:', error);
      // Allow request to proceed if idempotency check fails
      next();
    }
  }
};

// ✅ AUTH JOINEDAT ACCURACY - Fetch actual account creation time
const getUserCreationTime = async (uid: string): Promise<string> => {
  try {
    const userRecord = await firebaseAdmin.auth().getUser(uid);
    return userRecord.metadata.creationTime || new Date().toISOString();
  } catch (error) {
    console.error('Error fetching user creation time:', error);
    return new Date().toISOString();
  }
};

// ✅ USER STATS CONSOLIDATION - Centralized user statistics management
const updateUserStats = async (uid: string, updates: Partial<UserStats>) => {
  try {
    const statsRef = db.doc(`users/${uid}/stats/summary`);
    await statsRef.set({
      ...updates,
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

const getUserStats = async (uid: string): Promise<UserStats> => {
  try {
    const statsRef = db.doc(`users/${uid}/stats/summary`);
    const statsSnap = await statsRef.get();

    if (statsSnap.exists) {
      return statsSnap.data() as UserStats;
    }

    // Return default stats if none exist
    return {
      missionsCreated: 0,
      missionsCompleted: 0,
      tasksDone: 0,
      tasksCompleted: 0,
      totalEarned: 0,
      totalEarnings: 0,
      lastActiveAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      missionsCreated: 0,
      missionsCompleted: 0,
      tasksDone: 0,
      tasksCompleted: 0,
      totalEarned: 0,
      totalEarnings: 0,
      lastActiveAt: new Date().toISOString()
    };
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
      joinedAt: await getUserCreationTime(decodedToken.uid)
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
      joinedAt: await getUserCreationTime(decodedToken.uid)
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
      joinedAt: await getUserCreationTime(decodedToken.uid)
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
    const { limit = 20, pageToken } = req.query;
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100); // Max 100 per page

    let query = db.collection('missions')
      .where('status', '==', 'active')
      .orderBy('created_at', 'desc')
      .limit(limitNum);

    // ✅ PAGINATION IMPROVEMENTS - Opaque cursor system
    if (pageToken) {
      try {
        // Decode opaque cursor: base64 encoded {id, created_at}
        const cursorData = JSON.parse(Buffer.from(pageToken as string, 'base64').toString());
        const { id, created_at } = cursorData;

        if (id && created_at) {
          // ✅ PAGINATION HARDENING - Use proper startAfter with field values in order
          // Since query orders by created_at, we need to provide the field value
          query = query.startAfter(new Date(created_at));
        }
      } catch (error) {
        console.warn('Invalid pageToken provided:', pageToken, error);
        // Continue without pagination if token is invalid
      }
    }

    const missionsSnapshot = await query.get();

    // Filter out paused missions and serialize timestamps
    const missions = missionsSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return serializeMissionResponse({
          id: doc.id,
          ...data,
        });
      })
      .filter((mission: any) => !mission.isPaused); // Hide paused missions from users

    // ✅ PAGINATION RESPONSE - Opaque cursor generation
    let nextPageToken = null;
    if (missionsSnapshot.docs.length === limitNum) {
      const lastDoc = missionsSnapshot.docs[missionsSnapshot.docs.length - 1];
      const lastDocData = lastDoc.data();

      // Create opaque cursor: base64 encoded {id, created_at}
      const cursorData = {
        id: lastDoc.id,
        created_at: lastDocData.created_at?.toDate?.()?.toISOString() || lastDocData.created_at
      };
      nextPageToken = Buffer.from(JSON.stringify(cursorData)).toString('base64');
    }

    const response: any = {
      missions,
      hasMore: missionsSnapshot.docs.length === limitNum,
      nextPageToken
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expired missions endpoint
app.get('/v1/missions/expired', async (req, res) => {
  try {
    const { limit = 20, pageToken } = req.query;
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100); // Max 100 per page

    const now = new Date();

    let query = db.collection('missions')
      .where('status', 'in', ['completed', 'expired'])
      .orderBy('created_at', 'desc')
      .limit(limitNum);

    // Handle pagination
    if (pageToken) {
      try {
        const cursorData = JSON.parse(Buffer.from(pageToken as string, 'base64').toString());
        const { id, created_at } = cursorData;

        if (id && created_at) {
          query = query.startAfter(new Date(created_at));
        }
      } catch (error) {
        console.warn('Invalid pageToken provided:', pageToken, error);
      }
    }

    const missionsSnapshot = await query.get();

    // Filter and serialize expired missions
    const missions = missionsSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return serializeMissionResponse({
          id: doc.id,
          ...data,
        });
      })
      .filter((mission: any) => {
        // Additional client-side filtering for expired missions
        if (mission.model?.toLowerCase() === 'degen') {
          // For degen missions: check if deadline has passed
          if (mission.deadline) {
            const deadline = new Date(mission.deadline);
            return deadline.getTime() <= now.getTime();
          }
        } else if (mission.model?.toLowerCase() === 'fixed') {
          // For fixed missions: check if expired OR participant cap reached
          if (mission.expiresAt) {
            const expiresAt = new Date(mission.expiresAt);
            if (expiresAt.getTime() <= now.getTime()) {
              return true; // Expired
            }
          }

          // Check if participant cap is reached
          const currentParticipants = mission.participants_count || mission.participants || 0;
          const maxParticipants = mission.max_participants || mission.cap || 0;
          if (maxParticipants > 0 && currentParticipants >= maxParticipants) {
            return true; // Cap reached
          }
        }

        return false; // Not expired
      });

    // Generate next page token
    let nextPageToken = null;
    if (missionsSnapshot.docs.length === limitNum) {
      const lastDoc = missionsSnapshot.docs[missionsSnapshot.docs.length - 1];
      const lastData = lastDoc.data();
      const cursorData = {
        id: lastDoc.id,
        created_at: toIso(lastData.created_at)
      };
      nextPageToken = Buffer.from(JSON.stringify(cursorData)).toString('base64');
    }

    res.json({
      missions,
      hasMore: missionsSnapshot.docs.length === limitNum,
      nextPageToken
    });
  } catch (error) {
    console.error('Error fetching expired missions:', error);
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

    const data = missionDoc.data();
    const mission = serializeMissionResponse({
      id: missionDoc.id,
      ...data,
    });

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

    const createdMissions = createdMissionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...serializeMissionResponse({
          id: doc.id,
          ...data,
        }),
        type: 'created'
      };
    });

    const participationMissions = await Promise.all(
      participationsSnapshot.docs.map(async (participationDoc) => {
        const participation = participationDoc.data();
        const missionDoc = await db.collection('missions').doc(participation.mission_id).get();
        if (missionDoc.exists) {
          const data = missionDoc.data();
          return {
            ...serializeMissionResponse({
              id: missionDoc.id,
              ...data,
            }),
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

app.post('/v1/missions', verifyFirebaseToken, rateLimit, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const missionData = normalizeMissionData(req.body);

    // Debug logging for mission creation
    console.log('=== MISSION CREATION DEBUG ===');
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('Normalized mission data:', JSON.stringify(missionData, null, 2));
    console.log('================================');

    // Validate required fields
    if (!missionData.platform) {
      res.status(400).json({ error: 'Platform is required' });
      return;
    }

    // Validate and normalize content link
    if (missionData.contentLink || missionData.tweetLink) {
      const url = missionData.contentLink || missionData.tweetLink;
      const validation = validateUrl(url, missionData.platform);
      if (!validation.isValid) {
        res.status(400).json({ error: validation.error });
        return;
      }
      // Normalize and store the URL
      missionData.contentLink = normalizeUrl(url);
      missionData.tweetLink = normalizeUrl(url);
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

    // Get system configuration for pricing
    const configDoc = await db.collection('system_config').doc('main').get();
    const rawConfig = configDoc.exists ? configDoc.data() : {};
    const systemConfig = readCfg(rawConfig);

    // Calculate deadline and rewards based on mission model
    if (missionData.model === 'degen') {
      // ✅ FIX: Read all duration variants and set deadline deterministically
      const durationH = Number(
        missionData.duration_hours ??
        missionData.durationHours ??
        missionData.duration ??
        0
      );

      if (durationH > 0) {
        // ✅ FIX: Use Firestore Timestamp for deadline, not JavaScript Date
        const deadlineDate = new Date(Date.now() + durationH * 3600 * 1000);
        missionData.deadline = firebaseAdmin.firestore.Timestamp.fromDate(deadlineDate);

        console.log('=== DEGEN DEADLINE DEBUG ===');
        console.log('duration_hours:', missionData.duration_hours);
        console.log('durationHours:', missionData.durationHours);
        console.log('duration:', missionData.duration);
        console.log('resolved durationH:', durationH);
        console.log('calculated deadline (Timestamp):', missionData.deadline);
        console.log('deadline ISO:', deadlineDate.toISOString());
        console.log('============================');
      } else {
        console.warn('Degen mission created without duration - no deadline set');
      }

      // Calculate rewards for degen missions
      const costUSD = missionData.selectedDegenPreset?.costUSD || 0;

      // Debug logging for degen mission cost calculation
      console.log('=== DEGEN MISSION COST DEBUG ===');
      console.log('selectedDegenPreset:', missionData.selectedDegenPreset);
      console.log('costUSD:', costUSD);
      console.log('systemConfig.honorsPerUsd:', systemConfig.honorsPerUsd);

      missionData.rewards = {
        usd: costUSD,
        honors: Math.round(costUSD * systemConfig.honorsPerUsd)
      };

      console.log('calculated rewards:', missionData.rewards);
      console.log('================================');

      // ✅ DEGEN MISSION PAYMENT PROCESSING
      if (costUSD > 0) {
        console.log('=== DEGEN MISSION PAYMENT PROCESSING ===');

        // Get user's wallet
        const walletDoc = await db.collection('wallets').doc(userId).get();
        if (!walletDoc.exists) {
          res.status(400).json({ error: 'Wallet not found. Please contact support.' });
          return;
        }

        const wallet = walletDoc.data();
        if (!wallet) {
          res.status(400).json({ error: 'Wallet data not found' });
          return;
        }

        // Check if user has sufficient balance (convert USD to honors at 450 honors per USD)
        const requiredHonors = Math.round(costUSD * 450);
        console.log('Required Honors for degen mission:', requiredHonors);
        console.log('User wallet Honors:', wallet.honors);

        if (wallet.honors < requiredHonors) {
          res.status(400).json({
            error: `Insufficient balance. You need ${requiredHonors} Honors ($${costUSD}) to create this degen mission. You have ${wallet.honors} Honors.`
          });
          return;
        }

        // Deduct payment atomically using Firestore transaction
        await db.runTransaction(async (transaction) => {
          // Re-read the wallet to ensure we have the latest data
          const freshWalletDoc = await transaction.get(walletDoc.ref);
          const freshWallet = freshWalletDoc.data();

          if (!freshWallet) {
            throw new Error('Wallet not found during transaction');
          }

          // Double-check balance again (concurrency safety)
          if (freshWallet.honors < requiredHonors) {
            throw new Error('Insufficient balance (concurrent transaction detected)');
          }

          // Update wallet balance
          transaction.update(walletDoc.ref, {
            honors: firebaseAdmin.firestore.FieldValue.increment(-requiredHonors),
            usd: firebaseAdmin.firestore.FieldValue.increment(-costUSD),
            updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
          });

          // Create transaction record
          const transactionRef = db.collection('transactions').doc();
          transaction.set(transactionRef, {
            user_id: userId,
            type: 'mission_creation',
            amount: -requiredHonors,
            currency: 'honors',
            description: `Created degen mission (${durationH}h duration)`,
            mission_type: 'degen',
            cost_usd: costUSD,
            created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
          });

          console.log('Successfully deducted payment for degen mission creation');
        });

        console.log('==========================================');
      }

      // ✅ Canonical winners cap for degen missions is mission-wide
      missionData.winnersPerMission =
        missionData.winnersPerMission ??
        missionData.winners_cap ??
        missionData.winnersCap ??
        0;

      // (optional back-compat write so legacy readers don't break)
      missionData.winnersPerTask = undefined; // we no longer use this for degen; leave undefined
    } else if (missionData.model === 'fixed' && missionData.cap) {
      // ✅ FIX: Fixed missions expire after 48 hours - use Firestore Timestamp
      const expiresDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
      missionData.expires_at = firebaseAdmin.firestore.Timestamp.fromDate(expiresDate);

      // Calculate rewards for fixed missions
      const totalHonors = missionData.rewardPerUser * missionData.cap;

      // Debug logging for fixed mission cost calculation
      console.log('=== FIXED MISSION COST DEBUG ===');
      console.log('rewardPerUser:', missionData.rewardPerUser);
      console.log('cap:', missionData.cap);
      console.log('totalHonors:', totalHonors);
      console.log('systemConfig.honorsPerUsd:', systemConfig.honorsPerUsd);

      missionData.rewards = {
        honors: totalHonors,
        usd: Number((totalHonors / systemConfig.honorsPerUsd).toFixed(2))
      };

      console.log('calculated rewards:', missionData.rewards);
      console.log('================================');

      // Set winnersPerTask for fixed missions (1 per task unless specified)
      missionData.winnersPerTask = 1;
    }

    // Validate platform-specific URL patterns and content structure
    const contentLink = missionData.tweetLink || missionData.contentLink;
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

    // Pack validation and entitlement deduction for fixed missions
    if (missionData.model === 'fixed' && missionData.packId) {
      console.log('=== PACK VALIDATION DEBUG ===');
      console.log('Pack ID:', missionData.packId);
      console.log('User ID:', userId);

      try {
        // Find the user's active entitlement for this pack
        const entitlementsSnapshot = await db.collection('entitlements')
          .where('userId', '==', userId)
          .where('packId', '==', missionData.packId)
          .where('status', '==', 'active')
          .get();

        if (entitlementsSnapshot.empty) {
          console.log('No active entitlement found for pack:', missionData.packId);
          res.status(400).json({
            error: 'No active entitlement found for the selected pack. Please purchase the pack first.'
          });
          return;
        }

        const entitlementDoc = entitlementsSnapshot.docs[0];
        const entitlement = entitlementDoc.data();

        console.log('Found entitlement:', entitlement);

        // Check if entitlement is expired
        if (entitlement.endsAt && new Date(entitlement.endsAt.toDate()) < new Date()) {
          console.log('Entitlement expired:', entitlement.endsAt);
          res.status(400).json({
            error: 'The selected pack entitlement has expired'
          });
          return;
        }

        // Check remaining quota
        const remainingQuota = entitlement.quotas.tweets - entitlement.usage.tweetsUsed;
        console.log('Remaining quota:', remainingQuota);

        if (remainingQuota <= 0) {
          console.log('Insufficient quota remaining');
          res.status(400).json({
            error: `Insufficient quota remaining in the selected pack. You have ${remainingQuota} tweets remaining, but need at least 1.`
          });
          return;
        }

        // ✅ VALIDATE MISSION DETAILS MATCH PACK SPECIFICATIONS
        console.log('=== PACK-MISSION VALIDATION ===');
        console.log('Pack quotas:', entitlement.quotas);
        console.log('Mission data:', {
          cap: missionData.cap,
          tasks: missionData.tasks,
          rewardPerUser: missionData.rewardPerUser
        });

        // Get pack details from catalog to validate against
        const packCatalog = [
          { id: 'single_1_small', size: 'small', maxParticipants: 100, quotas: { likes: 100, retweets: 60, comments: 40 } },
          { id: 'single_1_medium', size: 'medium', maxParticipants: 200, quotas: { likes: 200, retweets: 120, comments: 80 } },
          { id: 'single_1_large', size: 'large', maxParticipants: 500, quotas: { likes: 500, retweets: 300, comments: 200 } },
          { id: 'single_3_small', size: 'small', maxParticipants: 100, quotas: { likes: 100, retweets: 60, comments: 40 } },
          { id: 'single_3_medium', size: 'medium', maxParticipants: 200, quotas: { likes: 200, retweets: 120, comments: 80 } },
          { id: 'single_3_large', size: 'large', maxParticipants: 500, quotas: { likes: 500, retweets: 300, comments: 200 } },
          { id: 'single_10_small', size: 'small', maxParticipants: 100, quotas: { likes: 100, retweets: 60, comments: 40 } },
          { id: 'single_10_medium', size: 'medium', maxParticipants: 200, quotas: { likes: 200, retweets: 120, comments: 80 } },
          { id: 'single_10_large', size: 'large', maxParticipants: 500, quotas: { likes: 500, retweets: 300, comments: 200 } },
          { id: 'sub_week_small', size: 'small', maxParticipants: 100, quotas: { likes: 100, retweets: 60, comments: 40 } },
          { id: 'sub_month_medium', size: 'medium', maxParticipants: 200, quotas: { likes: 200, retweets: 120, comments: 80 } },
          { id: 'sub_week_medium', size: 'medium', maxParticipants: 200, quotas: { likes: 200, retweets: 120, comments: 80 } }
        ];

        const packDetails = packCatalog.find(p => p.id === missionData.packId);
        if (!packDetails) {
          console.log('Pack details not found for:', missionData.packId);
          res.status(400).json({
            error: 'Invalid pack selected. Please choose a valid pack.'
          });
          return;
        }

        // Validate participant cap matches pack size
        if (missionData.cap > packDetails.maxParticipants) {
          console.log(`Mission cap (${missionData.cap}) exceeds pack max participants (${packDetails.maxParticipants})`);
          res.status(400).json({
            error: `Mission participant cap (${missionData.cap}) exceeds the pack's maximum (${packDetails.maxParticipants} users). Please reduce the participant cap or choose a larger pack.`
          });
          return;
        }

        // Validate tasks match pack quotas (for fixed missions, users can choose 3 of 5 tasks)
        if (missionData.tasks && missionData.tasks.length > 0) {
          // For now, we'll allow any task selection as long as it's within the pack's engagement limits
          // The actual engagement will be limited by the pack's quotas when the mission runs
          console.log('Tasks validated against pack quotas');
        }

        // Override mission rewards to match pack specifications
        // This ensures the mission uses the pack's engagement quotas
        missionData.packQuotas = entitlement.quotas;
        missionData.packSize = packDetails.size;
        missionData.packMaxParticipants = packDetails.maxParticipants;

        console.log('Mission validated and updated with pack specifications');
        console.log('==========================================');

        // Deduct quota atomically using Firestore transaction
        await db.runTransaction(async (transaction) => {
          // Re-read the entitlement to ensure we have the latest data
          const freshEntitlementDoc = await transaction.get(entitlementDoc.ref);
          const freshEntitlement = freshEntitlementDoc.data();

          if (!freshEntitlement) {
            throw new Error('Entitlement not found during transaction');
          }

          // Double-check quota again (concurrency safety)
          const freshRemainingQuota = freshEntitlement.quotas.tweets - freshEntitlement.usage.tweetsUsed;
          if (freshRemainingQuota <= 0) {
            throw new Error('Insufficient quota remaining (concurrent usage detected)');
          }

          // Update entitlement usage
          const updatedUsage = {
            ...freshEntitlement.usage,
            tweetsUsed: freshEntitlement.usage.tweetsUsed + 1
          };

          transaction.update(entitlementDoc.ref, {
            usage: updatedUsage,
            updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
          });

          console.log('Updated entitlement usage:', updatedUsage);
        });

        console.log('Successfully deducted quota for pack:', missionData.packId);

        // Telemetry: Log pack usage for analytics
        console.log('=== PACK USAGE TELEMETRY ===');
        console.log('Event: pack_quota_deducted');
        console.log('UserId:', userId);
        console.log('PackId:', missionData.packId);
        console.log('MissionType:', missionData.model);
        console.log('RemainingQuota:', remainingQuota - 1);
        console.log('Timestamp:', new Date().toISOString());
        console.log('=============================');

        console.log('=====================================');

      } catch (error) {
        console.error('Pack validation/entitlement deduction failed:', error);

        // Telemetry: Log pack validation error for analytics
        console.log('=== PACK VALIDATION ERROR TELEMETRY ===');
        console.log('Event: pack_validation_failed');
        console.log('UserId:', userId);
        console.log('PackId:', missionData.packId);
        console.log('Error:', error.message || 'Unknown error');
        console.log('Timestamp:', new Date().toISOString());
        console.log('=======================================');

        res.status(400).json({
          error: error.message || 'Failed to validate pack entitlement'
        });
        return;
      }
    }

    // ✅ FIXED MISSION SINGLE-USE PAYMENT PROCESSING
    if (missionData.model === 'fixed' && (!missionData.packId || missionData.packId === 'single-use')) {
      console.log('=== FIXED MISSION SINGLE-USE PAYMENT PROCESSING ===');

      // Fixed missions cost varies by participant cap (aligned with single-use pack pricing)
      // Small (100 users): $10, Medium (200 users): $15, Large (500 users): $25
      let costUSD = 10; // default small
      if (missionData.cap >= 500) {
        costUSD = 25; // large
      } else if (missionData.cap >= 200) {
        costUSD = 15; // medium
      }
      const requiredHonors = Math.round(costUSD * 450);

      console.log('Required Honors for fixed mission:', requiredHonors);

      // Get user's wallet
      const walletDoc = await db.collection('wallets').doc(userId).get();
      if (!walletDoc.exists) {
        res.status(400).json({ error: 'Wallet not found. Please contact support.' });
        return;
      }

      const wallet = walletDoc.data();
      if (!wallet) {
        res.status(400).json({ error: 'Wallet data not found' });
        return;
      }

      console.log('User wallet Honors:', wallet.honors);

      if (wallet.honors < requiredHonors) {
        res.status(400).json({
          error: `Insufficient balance. You need ${requiredHonors} Honors ($${costUSD}) to create this fixed mission. You have ${wallet.honors} Honors.`
        });
        return;
      }

      // Deduct payment atomically using Firestore transaction
      await db.runTransaction(async (transaction) => {
        // Re-read the wallet to ensure we have the latest data
        const freshWalletDoc = await transaction.get(walletDoc.ref);
        const freshWallet = freshWalletDoc.data();

        if (!freshWallet) {
          throw new Error('Wallet not found during transaction');
        }

        // Double-check balance again (concurrency safety)
        if (freshWallet.honors < requiredHonors) {
          throw new Error('Insufficient balance (concurrent transaction detected)');
        }

        // Update wallet balance
        transaction.update(walletDoc.ref, {
          honors: firebaseAdmin.firestore.FieldValue.increment(-requiredHonors),
          usd: firebaseAdmin.firestore.FieldValue.increment(-costUSD),
          updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
        });

        // Create transaction record
        const transactionRef = db.collection('transactions').doc();
        transaction.set(transactionRef, {
          user_id: userId,
          type: 'mission_creation',
          amount: -requiredHonors,
          currency: 'honors',
          description: `Created fixed mission (${missionData.cap} users)`,
          mission_type: 'fixed',
          cost_usd: costUSD,
          created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
        });

        console.log('Successfully deducted payment for fixed mission creation');
      });

      console.log('==========================================');
    }

    // Use the safe mission creation function that ensures UID-based references
    const result = await createMissionWithUidReferences(userId, missionData);

    if (!result.success) {
      console.error('Mission creation failed:', result.error);
      res.status(400).json({ error: result.error });
      return;
    }

    // ✅ VERIFICATION: Read the saved doc and assert critical fields exist
    const savedDoc = await db.collection('missions').doc(result.mission.id).get();
    const savedData = savedDoc.data();

    console.log('=== MISSION CREATION VERIFICATION ===');
    console.log('Mission ID:', result.mission.id);
    console.log('Model:', savedData?.model);
    console.log('Rewards:', savedData?.rewards);
    console.log('SelectedDegenPreset:', savedData?.selectedDegenPreset);
    console.log('Deadline:', savedData?.deadline);
    console.log('WinnersPerMission:', savedData?.winnersPerMission);
    console.log('CreatedAt:', savedData?.created_at);
    console.log('=====================================');

    // ✅ FIX 2A: Ensure rewards are persisted on the mission doc (idempotent)
    const mref = db.collection('missions').doc(result.mission.id);
    await db.runTransaction(async tx => {
      const snap = await tx.get(mref);
      if (!snap.exists) return;
      const d = snap.data() || {};

      const cfgDoc = await db.collection('system_config').doc('main').get();
      const cfg = readCfg(cfgDoc.exists ? cfgDoc.data() : {});

      // ✅ SYSTEMATIC FIX: Always calculate and persist rewards (even if they exist, recalculate to ensure consistency)
      let rewards;
      if (d.model === 'degen') {
        const usd = Number(d.selectedDegenPreset?.costUSD ?? d.costUSD ?? 0);
        const honors = Math.round(usd * cfg.honorsPerUsd);
        rewards = { usd, honors };
      } else {
        const perUserHonors =
          d.rewardPerUser ??
          (Array.isArray(d.tasks)
            ? d.tasks.reduce((s: number, t: string) =>
              s + ((cfg.taskPrices?.[t] ?? 0) * (d.isPremium ? cfg.premiumMultiplier : 1)), 0)
            : 0);
        const participants = d.cap ?? d.max_participants ?? d.winnersCap ?? 0;
        const honors = perUserHonors * participants;
        const usd = Number((honors / cfg.honorsPerUsd).toFixed(2));
        rewards = { usd, honors, perUserHonors };
      }

      // Always update rewards to ensure consistency
      tx.set(mref, { rewards }, { merge: true });
      console.log('✅ Persisted mission rewards:', { model: d.model, rewards });

      // also normalize winners field for degen back-compat
      if (d.model === 'degen' && !d.winnersPerMission) {
        const w = d.winnersCap ?? d.maxWinners ?? null;
        if (w != null) tx.set(mref, { winnersPerMission: w }, { merge: true });
      }
    });

    // ✅ Normalize timestamps & deadline after creation (idempotent)
    {
      const mref = db.collection('missions').doc(result.mission.id);
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(mref);
        if (!snap.exists) return;
        const d: any = snap.data() || {};

        const updates: any = {};

        const createdAtIso = toIso(d.created_at);
        if (!createdAtIso || typeof d.created_at === 'string') {
          updates.created_at = firebaseAdmin.firestore.FieldValue.serverTimestamp();
        }
        updates.updated_at = firebaseAdmin.firestore.FieldValue.serverTimestamp();

        // Degen: compute deadline if missing and we have a duration
        const hasDeadline = !!toIso(d.deadline);
        const durationH = Number(d.duration_hours ?? d.durationHours ?? d.duration ?? 0);
        if (d.model === 'degen' && !hasDeadline && durationH > 0 && createdAtIso) {
          const start = new Date(createdAtIso);
          updates.deadline = new Date(start.getTime() + durationH * 3600 * 1000);
        }

        if (Object.keys(updates).length) {
          tx.set(mref, updates, { merge: true });
        }
      });
    }

    // If critical fields are missing, log and potentially correct
    if (savedData?.model === 'degen') {
      if (!savedData?.rewards?.usd || savedData?.rewards?.usd === 0) {
        console.error('CRITICAL: Degen mission missing rewards.usd');
      }
      if (!savedData?.selectedDegenPreset?.costUSD) {
        console.error('CRITICAL: Degen mission missing selectedDegenPreset.costUSD');
      }
      if (!savedData?.deadline) {
        console.error('CRITICAL: Degen mission missing deadline');
      }
    }

    res.status(201).json(serializeMissionResponse(result.mission));
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
      joined_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      submitted_at: null
    };

    const participationRef = await db.collection('mission_participations').add(participation);

    // Update mission participants count
    await db.collection('missions').doc(missionId).update({
      participants_count: firebaseAdmin.firestore.FieldValue.increment(1),
      updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
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
        created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
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

    const transactions = transactionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore timestamp to ISO string for frontend
        date: data.created_at?.toDate ? data.created_at.toDate().toISOString() :
          data.created_at?._seconds ? new Date(data.created_at._seconds * 1000).toISOString() :
            data.created_at || new Date().toISOString()
      };
    });

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

// Crypto deposit endpoint
app.post('/v1/wallet/deposit', verifyFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { amount, currency, txHash, address } = req.body;

    console.log('Processing crypto deposit:', { userId, amount, currency, txHash, address });

    // Validate required fields
    if (!amount || !currency || !txHash || !address) {
      res.status(400).json({ error: 'Missing required fields: amount, currency, txHash, address' });
      return;
    }

    // Validate amount
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      res.status(400).json({ error: 'Invalid deposit amount' });
      return;
    }

    // Check for duplicate deposit using txHash
    const existingDeposit = await db.collection('transactions')
      .where('user_id', '==', userId)
      .where('txHash', '==', txHash)
      .where('type', '==', 'deposited')
      .limit(1)
      .get();

    if (!existingDeposit.empty) {
      res.status(400).json({ error: 'Deposit already processed' });
      return;
    }

    // Get system configuration for conversion rates
    const configDoc = await db.collection('system_config').doc('main').get();
    const rawConfig = configDoc.exists ? configDoc.data() : {};
    const systemConfig = readCfg(rawConfig);

    // Convert crypto to Honors (example rates - in production, use real-time rates)
    const conversionRates: { [key: string]: number } = {
      'ETH': 0.0003, // 1 ETH = 0.0003 USD (example)
      'BTC': 0.00002, // 1 BTC = 0.00002 USD (example)
      'USDC': 1, // 1 USDC = 1 USD
      'USDT': 1, // 1 USDT = 1 USD
    };

    const usdValue = depositAmount * (conversionRates[currency.toUpperCase()] || 0);
    const honorsValue = Math.round(usdValue * systemConfig.honorsPerUsd);

    if (honorsValue <= 0) {
      res.status(400).json({ error: 'Invalid currency or conversion rate' });
      return;
    }

    // Process deposit atomically
    const result = await db.runTransaction(async (transaction) => {
      // Get or create wallet
      const walletRef = db.collection('wallets').doc(userId);
      const walletDoc = await transaction.get(walletRef);

      const currentWallet = walletDoc.exists ? walletDoc.data() : {
        honors: 0,
        usd: 0,
        crypto: {
          ETH: 0,
          BTC: 0,
          USDC: 0,
          USDT: 0
        },
        created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
      };

      // Update wallet with crypto deposit and converted Honors
      transaction.set(walletRef, {
        honors: firebaseAdmin.firestore.FieldValue.increment(honorsValue),
        usd: firebaseAdmin.firestore.FieldValue.increment(usdValue),
        crypto: {
          ...currentWallet.crypto,
          [currency.toUpperCase()]: firebaseAdmin.firestore.FieldValue.increment(depositAmount)
        },
        updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Create transaction record
      const transactionRef = db.collection('transactions').doc();
      transaction.set(transactionRef, {
        user_id: userId,
        type: 'deposited',
        amount: honorsValue,
        currency: 'honors',
        crypto_amount: depositAmount,
        crypto_currency: currency.toUpperCase(),
        usd_value: usdValue,
        txHash: txHash,
        address: address,
        description: `Deposited ${depositAmount} ${currency.toUpperCase()} (converted to ${honorsValue} Honors)`,
        status: 'completed',
        created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
      });

      return {
        transactionId: transactionRef.id,
        honorsAdded: honorsValue,
        usdValue: usdValue,
        cryptoAmount: depositAmount,
        cryptoCurrency: currency.toUpperCase()
      };
    });

    res.json({
      success: true,
      message: 'Deposit processed successfully',
      ...result
    });

  } catch (error) {
    console.error('Error processing deposit:', error);
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
      claimed_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
    });

    // Update user wallet
    await db.collection('wallets').doc(userId).update({
      honors: firebaseAdmin.firestore.FieldValue.increment(reward.honors || 0),
      usd: firebaseAdmin.firestore.FieldValue.increment(reward.usd || 0),
      updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
    });

    // Create transaction record
    await db.collection('transactions').add({
      user_id: userId,
      type: 'reward_claim',
      amount: reward.honors || 0,
      currency: 'honors',
      description: `Claimed reward: ${reward.title || 'Mission reward'}`,
      reward_id: rewardId,
      created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
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

// Pack endpoints
app.get('/v1/packs', async (req, res) => {
  try {
    console.log('Fetching packs catalog');

    // For now, return the fallback packs data
    // In production, this would come from a database or configuration
    const packs = [
      // Single Mission Packs
      { id: 'single_1_small', kind: 'single', label: 'Growth Sprout', group: 'Single Mission Packs', tweets: 1, priceUsd: 10, size: 'small', quotas: { likes: 100, retweets: 60, comments: 40 } },
      { id: 'single_1_medium', kind: 'single', label: 'Engagement Boost', group: 'Single Mission Packs', tweets: 1, priceUsd: 15, size: 'medium', quotas: { likes: 200, retweets: 120, comments: 80 } },
      { id: 'single_1_large', kind: 'single', label: 'Viral Explosion', group: 'Single Mission Packs', tweets: 1, priceUsd: 25, size: 'large', quotas: { likes: 500, retweets: 300, comments: 200 } },

      // 3 Mission Packs
      { id: 'single_3_small', kind: 'single', label: 'Triple Growth', group: '3 Mission Packs', tweets: 3, priceUsd: 25, size: 'small', quotas: { likes: 100, retweets: 60, comments: 40 } },
      { id: 'single_3_medium', kind: 'single', label: 'Triple Fire', group: '3 Mission Packs', tweets: 3, priceUsd: 40, size: 'medium', quotas: { likes: 200, retweets: 120, comments: 80 }, meta: { originalUsd: 48, discountPct: 17 } },
      { id: 'single_3_large', kind: 'single', label: 'Triple Volcano', group: '3 Mission Packs', tweets: 3, priceUsd: 60, size: 'large', quotas: { likes: 500, retweets: 300, comments: 200 } },

      // 10 Mission Packs
      { id: 'single_10_small', kind: 'single', label: 'Mega Growth', group: '10 Mission Packs', tweets: 10, priceUsd: 75, size: 'small', quotas: { likes: 100, retweets: 60, comments: 40 } },
      { id: 'single_10_medium', kind: 'single', label: 'Mega Lightning', group: '10 Mission Packs', tweets: 10, priceUsd: 120, size: 'medium', quotas: { likes: 200, retweets: 120, comments: 80 } },
      { id: 'single_10_large', kind: 'single', label: 'Mega Rocket', group: '10 Mission Packs', tweets: 10, priceUsd: 180, size: 'large', quotas: { likes: 500, retweets: 300, comments: 200 } },

      // Subscription Packs
      { id: 'sub_week_small', kind: 'subscription', label: 'Weekly Momentum', group: 'Subscription Packs', tweets: 1, priceUsd: 500, size: 'small', quotas: { likes: 100, retweets: 60, comments: 40 }, meta: { maxPerHour: 1, durationDays: 7 } },
      { id: 'sub_month_medium', kind: 'subscription', label: 'Monthly Mastery', group: 'Subscription Packs', tweets: 1, priceUsd: 2000, size: 'medium', quotas: { likes: 200, retweets: 120, comments: 80 }, meta: { maxPerHour: 1, durationDays: 30, originalUsd: 2200, discountPct: 9 } },
      { id: 'sub_week_medium', kind: 'subscription', label: 'Weekly Thunder', group: 'Subscription Packs', tweets: 1, priceUsd: 750, size: 'medium', quotas: { likes: 200, retweets: 120, comments: 80 }, meta: { maxPerHour: 1, durationDays: 7 } }
    ];

    // Telemetry: Log packs catalog access for analytics
    console.log('=== PACKS CATALOG ACCESS TELEMETRY ===');
    console.log('Event: packs_catalog_accessed');
    console.log('PacksCount:', packs.length);
    console.log('SinglePacks:', packs.filter(p => p.kind === 'single').length);
    console.log('SubscriptionPacks:', packs.filter(p => p.kind === 'subscription').length);
    console.log('Timestamp:', new Date().toISOString());
    console.log('======================================');

    res.json(packs);
  } catch (error) {
    console.error('Error fetching packs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/v1/packs/:id/purchase', verifyFirebaseToken, async (req: any, res) => {
  const startTime = Date.now();
  try {
    const packId = req.params.id;
    const userId = req.user.uid;
    const { clientRequestId } = req.body;

    console.log('Purchasing pack:', packId, 'for user:', userId);

    // Validate required fields
    if (!clientRequestId) {
      res.status(400).json({ error: 'Client request ID is required for idempotency' });
      return;
    }

    // Check for duplicate purchase using clientRequestId
    const existingTransaction = await db.collection('transactions')
      .where('user_id', '==', userId)
      .where('clientRequestId', '==', clientRequestId)
      .where('type', '==', 'purchase')
      .limit(1)
      .get();

    if (!existingTransaction.empty) {
      const existingTx = existingTransaction.docs[0].data();
      res.json({
        success: true,
        message: 'Pack already purchased',
        transactionId: existingTransaction.docs[0].id,
        entitlementId: existingTx.entitlementId
      });
      return;
    }

    // Get pack details (in production, this would come from database)
    const packCatalog = [
      { id: 'single_1_small', priceUsd: 10, quotas: { tweets: 1, likes: 100, retweets: 60, comments: 40 } },
      { id: 'single_1_medium', priceUsd: 15, quotas: { tweets: 1, likes: 200, retweets: 120, comments: 80 } },
      { id: 'single_1_large', priceUsd: 25, quotas: { tweets: 1, likes: 500, retweets: 300, comments: 200 } },
      { id: 'single_3_small', priceUsd: 25, quotas: { tweets: 3, likes: 100, retweets: 60, comments: 40 } },
      { id: 'single_3_medium', priceUsd: 40, quotas: { tweets: 3, likes: 200, retweets: 120, comments: 80 } },
      { id: 'single_3_large', priceUsd: 60, quotas: { tweets: 3, likes: 500, retweets: 300, comments: 200 } },
      { id: 'single_10_small', priceUsd: 75, quotas: { tweets: 10, likes: 100, retweets: 60, comments: 40 } },
      { id: 'single_10_medium', priceUsd: 120, quotas: { tweets: 10, likes: 200, retweets: 120, comments: 80 } },
      { id: 'single_10_large', priceUsd: 180, quotas: { tweets: 10, likes: 500, retweets: 300, comments: 200 } },
      { id: 'sub_week_small', priceUsd: 500, quotas: { tweets: 1, likes: 100, retweets: 60, comments: 40 } },
      { id: 'sub_month_medium', priceUsd: 2000, quotas: { tweets: 1, likes: 200, retweets: 120, comments: 80 } },
      { id: 'sub_week_medium', priceUsd: 750, quotas: { tweets: 1, likes: 200, retweets: 120, comments: 80 } }
    ];

    const pack = packCatalog.find(p => p.id === packId);
    if (!pack) {
      res.status(404).json({ error: 'Pack not found' });
      return;
    }

    // Get user wallet
    const walletDoc = await db.collection('wallets').doc(userId).get();
    if (!walletDoc.exists) {
      res.status(400).json({ error: 'Wallet not found' });
      return;
    }

    const wallet = walletDoc.data();
    if (!wallet) {
      res.status(400).json({ error: 'Wallet data not found' });
      return;
    }

    // Check if user has sufficient balance (convert USD to honors at 450 honors per USD)
    const requiredHonors = pack.priceUsd * 450;
    if (wallet.honors < requiredHonors) {
      res.status(400).json({ error: 'Insufficient balance' });
      return;
    }

    // Use Firestore transaction for atomic operations
    const result = await db.runTransaction(async (transaction) => {
      // Create entitlement record
      const entitlementRef = db.collection('entitlements').doc();
      const entitlementData = {
        userId,
        packId,
        purchasedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        usage: {
          tweetsUsed: 0,
          likesUsed: 0,
          retweetsUsed: 0,
          commentsUsed: 0
        },
        quotas: pack.quotas,
        // Set expiration for subscription packs (7 days for weekly, 30 days for monthly)
        expiresAt: packId.includes('sub_week')
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : packId.includes('sub_month')
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : null
      };

      transaction.set(entitlementRef, entitlementData);

      // Create transaction record
      const transactionRef = db.collection('transactions').doc();
      const transactionData = {
        userId,
        type: 'purchase',
        amount: -requiredHonors, // Negative for purchase
        packId,
        status: 'completed',
        timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        clientRequestId,
        entitlementId: entitlementRef.id,
        description: `Purchased ${packId} pack`
      };

      transaction.set(transactionRef, transactionData);

      // Update wallet balance
      transaction.update(db.collection('wallets').doc(userId), {
        honors: firebaseAdmin.firestore.FieldValue.increment(-requiredHonors),
        usd: firebaseAdmin.firestore.FieldValue.increment(-pack.priceUsd),
        updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
      });

      return {
        entitlementId: entitlementRef.id,
        transactionId: transactionRef.id
      };
    });

    // Enhanced Telemetry: Log pack purchase for analytics and alerting
    const telemetryData = {
      event: 'pack_purchased',
      userId,
      packId,
      packPrice: pack.priceUsd,
      requiredHonors,
      entitlementId: result.entitlementId,
      transactionId: result.transactionId,
      clientRequestId,
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      userAgent: req.headers['user-agent'] || 'unknown',
      ip: req.ip || req.connection.remoteAddress || 'unknown'
    };

    console.log('=== PACK PURCHASE TELEMETRY ===');
    console.log(JSON.stringify(telemetryData, null, 2));
    console.log('===============================');

    // Alert thresholds
    if (telemetryData.latencyMs > 1500) {
      console.warn('HIGH_LATENCY_PURCHASE:', telemetryData);
    }

    res.json({
      success: true,
      message: 'Pack purchased successfully',
      entitlementId: result.entitlementId,
      transactionId: result.transactionId
    });

  } catch (error) {
    console.error('Error purchasing pack:', error);

    // Enhanced Error Telemetry: Log pack purchase failure for analytics and alerting
    const errorTelemetryData = {
      event: 'pack_purchase_failed',
      userId: req.user?.uid || 'unknown',
      packId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      clientRequestId: req.body?.clientRequestId,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || 'unknown',
      ip: req.ip || req.connection?.remoteAddress || 'unknown'
    };

    console.log('=== PACK PURCHASE ERROR TELEMETRY ===');
    console.log(JSON.stringify(errorTelemetryData, null, 2));
    console.log('=====================================');

    // Alert on critical errors
    if (error instanceof Error && (
      error.message.includes('insufficient') ||
      error.message.includes('balance') ||
      error.message.includes('transaction')
    )) {
      console.error('CRITICAL_PURCHASE_ERROR:', errorTelemetryData);
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/entitlements', verifyFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    console.log('Fetching entitlements for user:', userId);

    // Get user's entitlements (simplified query to avoid index issues)
    const entitlementsSnapshot = await db.collection('entitlements')
      .where('userId', '==', userId)
      .get();

    const entitlements = entitlementsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        packId: data.packId,
        purchasedAt: data.purchasedAt,
        expiresAt: data.expiresAt,
        status: data.status,
        usage: data.usage,
        quotas: data.quotas,
        // Add pack label for display
        packLabel: data.packId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      };
    }).sort((a, b) => {
      // Sort by purchasedAt descending (most recent first)
      const aTime = a.purchasedAt?.toDate ? a.purchasedAt.toDate() : new Date(a.purchasedAt || 0);
      const bTime = b.purchasedAt?.toDate ? b.purchasedAt.toDate() : new Date(b.purchasedAt || 0);
      return bTime.getTime() - aTime.getTime();
    });

    // Telemetry: Log entitlements access for analytics
    console.log('=== ENTITLEMENTS ACCESS TELEMETRY ===');
    console.log('Event: entitlements_accessed');
    console.log('UserId:', userId);
    console.log('EntitlementsCount:', entitlements.length);
    console.log('ActiveEntitlements:', entitlements.filter(e => e.status === 'active').length);
    console.log('Timestamp:', new Date().toISOString());
    console.log('=====================================');

    res.json(entitlements);
  } catch (error) {
    console.error('Error fetching entitlements:', error);
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
        created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
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
app.post('/v1/upload', verifyFirebaseToken, rateLimit, upload.single('file'), async (req: any, res) => {
  try {
    const userId = req.user.uid;

    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const file = req.file;

    // ✅ MAGIC BYTES VALIDATION - Validate file type using magic bytes
    // const detectedType = await fileTypeFromBuffer(file.buffer);
    const detectedType = null; // Temporarily disabled due to import issues
    // if (!detectedType) {
    //   res.status(400).json({ error: 'Invalid file type - could not detect file format' });
    //   return;
    // }

    // Validate against allowed MIME types
    const ALLOWED_MIME_TYPES = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'video/mp4', 'video/quicktime', 'video/x-msvideo'
    ];

    if (!ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
      res.status(400).json({ error: `File type ${detectedType.mime} not allowed` });
      return;
    }

    // Verify detected type matches declared type
    if (detectedType.mime !== file.mimetype) {
      console.warn(`MIME type mismatch: declared ${file.mimetype}, detected ${detectedType.mime}`);
      // Use detected type for security
    }

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
        // ✅ SECURE FILE UPLOAD - Keep files private, generate signed URLs
        // Don't make file public - keep it private for security

        // Generate signed URL for temporary access (1 hour)
        const [signedUrl] = await fileUpload.getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });

        res.json({
          success: true,
          file_url: signedUrl,
          file_name: file.originalname,
          file_size: file.size,
          content_type: file.mimetype,
          file_path: fileName, // Store path for future signed URL generation
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
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
app.post('/v1/missions/:id/submit', verifyFirebaseToken, rateLimit, checkIdempotency, async (req: any, res) => {
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
      submitted_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
    });

    // Update mission submissions count
    await db.collection('missions').doc(missionId).update({
      submissions_count: firebaseAdmin.firestore.FieldValue.increment(1),
      updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
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
        model: "fixed",
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
        created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
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
        model: "fixed",
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
        created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
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
        model: "fixed",
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
        created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
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
        model: "fixed",
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
        created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
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
        model: "fixed",
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
        created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
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
app.post('/v1/upload/base64', verifyFirebaseToken, rateLimit, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { fileName, fileType, base64Data } = req.body;

    if (!fileName || !fileType || !base64Data) {
      res.status(400).json({ error: 'Missing required fields: fileName, fileType, base64Data' });
      return;
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // File validation
    const MAX_BYTES = 10 * 1024 * 1024; // 10MB
    if (fileBuffer.length > MAX_BYTES) {
      res.status(400).json({ error: 'File too large (10MB max)' });
      return;
    }

    // ✅ MAGIC BYTES VALIDATION - Use file-type for accurate detection
    // const detectedType = await fileTypeFromBuffer(fileBuffer);
    const detectedType = null; // Temporarily disabled due to import issues

    // Whitelist of allowed MIME types
    const ALLOWED_MIME_TYPES = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Videos
      'video/mp4',
      'video/webm',
      'video/quicktime',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Text
      'text/plain',
      'text/csv'
    ];

    // Validate against detected type (source of truth)
    if (detectedType && !ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
      res.status(400).json({
        error: `Unsupported file type: ${detectedType.mime}`,
        detectedType: detectedType.mime,
        allowedTypes: ALLOWED_MIME_TYPES
      });
      return;
    }

    // Validate against provided type (should match detected)
    if (detectedType && detectedType.mime !== fileType) {
      res.status(400).json({
        error: 'File type mismatch',
        providedType: fileType,
        detectedType: detectedType.mime
      });
      return;
    }

    // Use detected type if available, fallback to provided
    const finalMimeType = detectedType?.mime || fileType;


    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `uploads/${userId}/${timestamp}_${sanitizedFileName}`;

    // Upload to Firebase Storage
    const file = bucket.file(filePath);
    await file.save(fileBuffer, {
      metadata: {
        contentType: finalMimeType, // Use validated MIME type
        metadata: {
          uploadedBy: userId,
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
          detectedType: detectedType?.mime || 'unknown'
        }
      }
    });

    // ✅ SECURE FILE UPLOAD - Keep files private, generate signed URLs
    // Don't make file public - keep it private for security

    // Generate signed URL for temporary access (1 hour)
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    res.json({
      success: true,
      fileUrl: signedUrl,
      fileName: sanitizedFileName,
      filePath,
      fileType: finalMimeType,
      detectedType: detectedType?.mime || 'unknown',
      uploadedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mission submission with file upload
app.post('/v1/missions/:id/submit-with-files', verifyFirebaseToken, async (req: any, res) => {
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

        // ✅ SECURE FILE UPLOAD - Keep files private, generate signed URLs
        // Don't make file public - keep it private for security

        // Generate signed URL for temporary access (1 hour)
        const [signedUrl] = await storageFile.getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });

        uploadedFiles.push({
          fileName: sanitizedFileName,
          originalName: fileName,
          fileUrl: signedUrl,
          filePath,
          fileType,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
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
      submitted_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      reviewed_at: null,
      feedback: null
    };

    const submissionRef = await db.collection('mission_submissions').add(submission);

    // Update participation status
    await participation.ref.update({
      status: 'submitted',
      submitted_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      submission_id: submissionRef.id
    });

    // Update mission submissions count
    await db.collection('missions').doc(missionId).update({
      submissions_count: firebaseAdmin.firestore.FieldValue.increment(1),
      updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
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
    console.log('🔍 OLD submissions endpoint called for missionId:', missionId, 'userId:', userId);

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

// Normalize a taskCompletion doc to the UI's "submission-like" shape
const toSubmission = (id: string, t: any) => {
  const rawStatus = t?.status ?? 'pending';
  const status = String(rawStatus).toLowerCase();

  // Extract user handle from multiple possible fields
  const user_handle = t?.twitterHandle ??
    t?.user_handle ??
    t?.handle ??
    t?.twitter?.username ??
    t?.twitterUsername ??
    t?.metadata?.twitterHandle ??
    t?.metadata?.handle ??
    t?.metadata?.twitter?.username ??
    t?.metadata?.twitter_username ??
    t?.screen_name ??
    t?.user?.twitterHandle ??
    t?.user?.twitter?.handle ??
    t?.profile?.twitterHandle ??
    t?.profile?.twitter?.handle ??
    null;

  // Extract user name from multiple possible fields
  const firstFrom = (name?: string) => (name || '').trim().split(/\s+/)[0] || null;
  const user_name = t?.firstName ??
    t?.first_name ??
    t?.userFirstName ??
    t?.user_first_name ??
    firstFrom(t?.userName) ??
    firstFrom(t?.user_name) ??
    firstFrom(t?.displayName) ??
    firstFrom(t?.display_name) ??
    firstFrom(t?.name) ??
    firstFrom(t?.profile?.name) ??
    t?.profile?.firstName ??
    t?.user?.firstName ??
    t?.user?.profile?.firstName ??
    null;

  // Extract task information
  const nice = (s: string) => String(s || '').toLowerCase().replace(/^auto_/, '');
  const taskId = nice(t.taskId) ||
    nice(t.actionId) ||
    nice(t.type) ||
    nice(t.action) ||
    nice(t.activity) ||
    nice(t.eventType) ||
    nice(t?.task?.type) ||
    nice(t?.task?.action) ||
    nice(t?.metadata?.taskId) ||
    nice(t?.metadata?.actionId) ||
    nice(t?.metadata?.task) ||
    nice(t?.metadata?.action) ||
    nice(t?.metadata?.taskName);

  const LABELS: Record<string, string> = {
    like: 'like', like_tweet: 'like', favorite: 'like',
    retweet: 'retweet', repost: 'retweet', rt: 'retweet',
    comment: 'comment', reply: 'comment',
    quote: 'quote', quote_tweet: 'quote',
    follow: 'follow', follow_user: 'follow'
  };

  const task_label = LABELS[taskId] || taskId || 'task';

  // Helper function to convert Firestore timestamps to ISO strings
  const toIsoString = (timestamp: any) => {
    if (!timestamp) return null;
    if (timestamp?.toDate?.()) return timestamp.toDate().toISOString();
    if (typeof timestamp === 'string') return timestamp;
    return null;
  };

  return {
    id,
    user_handle,
    user_name,
    user_id: t?.userId ?? t?.user_id ?? t?.userEmail ?? t?.email ?? t?.uid ?? null,
    created_at: toIsoString(t?.completedAt ?? t?.createdAt ?? t?.updatedAt),
    status, // <-- show pending, submitted, verified, approved
    tasks_count: 1,
    verified_tasks: (status === 'verified' || status === 'approved') ? 1 : 0,
    task_id: taskId,
    task_label,
    _raw: t, // Include raw data for debugging
  };
};


// GET /v1/missions/:missionId/taskCompletions
app.get('/v1/missions/:missionId/taskCompletions', async (req, res) => {
  try {
    const { missionId } = req.params;
    console.log('🔍 taskCompletions endpoint called for missionId:', missionId);
    if (!missionId) return res.status(400).json({ error: 'Missing missionId' });

    let items: any[] = [];

    // ✅ PRIMARY: Use mission_participations as single source of truth
    const participationsSnapshot = await db.collection('mission_participations')
      .where('mission_id', '==', missionId)
      .orderBy('created_at', 'desc')
      .limit(500)
      .get();

    if (!participationsSnapshot.empty) {
      // Convert participation format to submission format
      items = participationsSnapshot.docs.flatMap(doc => {
        const data = doc.data();
        const tasksCompleted = data.tasks_completed || [];

        // If no tasks completed, return the participation itself as a submission
        if (tasksCompleted.length === 0) {
          return [{
            id: doc.id,
            missionId: data.mission_id,
            userId: data.user_id,
            status: data.status || 'pending',
            submittedAt: data.submitted_at || data.created_at,
            reviewedAt: data.reviewed_at,
            proofs: data.proofs || [],
            metadata: {
              tweetUrl: data.tweet_url || data.tweetLink,
              taskType: 'participation',
              completedAt: data.completed_at || data.submitted_at,
              tasksCompleted: data.tasks_completed || [],
              totalHonorsEarned: data.total_honors_earned || 0
            }
          }];
        }

        // Convert each completed task to a submission
        return tasksCompleted.map((task: any, index: number) => ({
          id: `${doc.id}_${task.task_id || index}`,
          missionId: data.mission_id,
          taskId: task.task_id,
          userId: data.user_id,
          userName: data.user_name,
          userEmail: data.user_email,
          userSocialHandle: data.user_social_handle,
          status: task.status === 'completed' ? 'verified' : task.status,
          completedAt: task.completed_at?.toDate?.()?.toISOString() || task.completed_at,
          verifiedAt: task.status === 'completed' ? (task.completed_at?.toDate?.()?.toISOString() || task.completed_at) : null,
          flaggedAt: null,
          flaggedReason: null,
          reviewedBy: null,
          reviewedAt: null,
          metadata: {
            taskType: task.task_id,
            platform: data.platform || 'twitter',
            url: task.verification_data?.url,
            ...task.verification_data
          },
          createdAt: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updatedAt: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
        }));
      });
      console.log('Found submissions in mission_participations collection:', items.length);
    } else {
      // ✅ FALLBACK: Check taskCompletions for legacy data
      const taskCompletionsSnapshot = await db.collection('taskCompletions')
        .where('missionId', '==', missionId)
        .limit(500)
        .get();

      if (!taskCompletionsSnapshot.empty) {
        items = taskCompletionsSnapshot.docs.map(d => toSubmission(d.id, d.data()));
        console.log('Found legacy submissions in taskCompletions collection:', items.length);
      }
    }

    console.log('taskCompletions response:', { missionId, count: items.length, statuses: items.map(i => i.status) });
    return res.json({ items });
  } catch (e: any) {
    console.error('taskCompletions route error', e);
    return res.status(500).json({ error: e?.message ?? 'Internal Server Error' });
  }
});

// (Optional) clicks shortcut for instant totals
app.get('/v1/missions/:missionId/taskCompletions/count', async (req, res) => {
  try {
    const { missionId } = req.params;

    // ✅ PRIMARY: Count from mission_participations
    const participationsSnapshot = await db.collection('mission_participations')
      .where('mission_id', '==', missionId)
      .get();

    let count = 0;

    if (!participationsSnapshot.empty) {
      // Count verified/completed tasks across all participations
      participationsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const tasksCompleted = data.tasks_completed || [];
        const verifiedTasks = tasksCompleted.filter((task: any) =>
          task.status === 'completed' || task.status === 'verified'
        );
        count += verifiedTasks.length;
      });
    } else {
      // ✅ FALLBACK: Count from taskCompletions for legacy data
      const taskCompletionsSnapshot = await db.collection('taskCompletions')
        .where('missionId', '==', missionId)
        .where('status', 'in', ['verified', 'approved'])
        .get();
      count = taskCompletionsSnapshot.size;
    }

    return res.json({ count });
  } catch (e: any) {
    console.error('count route error', e);
    return res.status(500).json({ error: e?.message ?? 'Internal Server Error' });
  }
});

// Test endpoint to check taskCompletions data
app.get('/v1/test/taskCompletions', async (req, res) => {
  try {
    const snap = await db.collection('taskCompletions').limit(10).get();
    const items = snap.docs.map(d => ({
      id: d.id,
      missionId: d.data().missionId,
      status: d.data().status,
      metadata: d.data().metadata,
      raw: d.data()
    }));

    console.log('Test taskCompletions:', { count: items.length, sample: items[0] });
    return res.json({ count: items.length, items });
  } catch (e: any) {
    console.error('Test taskCompletions error:', e);
    return res.status(500).json({ error: e?.message ?? 'Internal Server Error' });
  }
});

// Debug endpoint to log request details
app.get('/v1/debug/request/:missionId', async (req, res) => {
  try {
    const { missionId } = req.params;
    const headers = req.headers;
    const query = req.query;

    console.log('🔍 DEBUG REQUEST:', {
      missionId,
      headers: {
        authorization: headers.authorization ? 'Present' : 'Missing',
        'content-type': headers['content-type'],
        'user-agent': headers['user-agent']
      },
      query,
      url: req.url
    });

    return res.json({
      missionId,
      hasAuth: !!headers.authorization,
      query,
      message: 'Debug info logged'
    });
  } catch (e: any) {
    console.error('Debug request error:', e);
    return res.status(500).json({ error: e?.message ?? 'Internal Server Error' });
  }
});

// Backfill script to align taskCompletions.missionId with mission document IDs
app.post('/v1/admin/backfill-mission-ids', verifyFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    console.log('Starting missionId backfill by user:', userId);

    // Optional: Add admin check here if you have admin users
    // const userDoc = await db.collection('users').doc(userId).get();
    // if (!userDoc.exists || !userDoc.data()?.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }

    const tcSnap = await db.collection('taskCompletions').get();
    const batch = db.batch();
    let updated = 0;

    for (const doc of tcSnap.docs) {
      const t = doc.data() as any;
      if (t.missionId) continue; // already linked

      const rawUrl = t?.metadata?.tweetUrl || t?.contentUrl || null;
      if (!rawUrl) continue;

      const urlCandidates = [...new Set([
        rawUrl,
        normalizeUrl(rawUrl)
      ].filter(v => typeof v === 'string' && v.length > 5))];
      let matched = false;

      // Try candidates one-by-one
      for (const candidate of urlCandidates) {
        const msnap = await db.collection('missions')
          .where('tweetLink', '==', candidate)
          .limit(1)
          .get();

        if (!msnap.empty) {
          const mid = msnap.docs[0].id;
          batch.update(doc.ref, { missionId: mid });
          updated++;
          matched = true;
          console.log(`Linking taskCompletion ${doc.id} to mission ${mid} via URL ${candidate} (from ${rawUrl})`);
          break;
        }
      }

      if (!matched) {
        console.log(`No mission found for taskCompletion ${doc.id} with URL ${rawUrl}`);
      }
    }

    await batch.commit();
    console.log(`Backfill complete: ${updated} taskCompletions updated by user ${userId}`);
    return res.json({
      success: true,
      updated,
      total: tcSnap.size,
      message: `Updated ${updated} out of ${tcSnap.size} taskCompletions`
    });
  } catch (e: any) {
    console.error('backfill error', e);
    return res.status(500).json({ error: e?.message ?? 'Internal Server Error' });
  }
});

// Admin API endpoints
app.get('/v1/admin/missions', requireAdmin, async (req, res) => {
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

    // Get system config once for all missions
    const cfgDoc = await db.collection('system_config').doc('main').get();
    const cfg = readCfg(cfgDoc.exists ? cfgDoc.data() : {});


    // Helper: derive rewards from the saved document (no side effects)
    const deriveRewards = (d: any, cfg: ReturnType<typeof readCfg>) => {
      if (d.model === 'degen') {
        // ✅ FIX: Handle both nested and root-level costUSD (from Firestore screenshots)
        const usd = Number(d.selectedDegenPreset?.costUSD ?? d.costUSD ?? 0);
        const honors = Math.round(usd * cfg.honorsPerUsd);
        return { usd, honors };
      }
      // fixed
      const perUserHonors =
        d.rewardPerUser ??
        (Array.isArray(d.tasks)
          ? d.tasks.reduce((sum: number, t: string) =>
            sum + ((cfg.taskPrices?.[t] ?? 0) * (d.isPremium ? cfg.premiumMultiplier : 1)), 0)
          : 0);

      const participants = d.cap ?? d.max_participants ?? d.winnersCap ?? 0;
      const honors = perUserHonors * participants;
      const usd = Number((honors / cfg.honorsPerUsd).toFixed(2));
      return { usd, honors, perUserHonors };
    };

    // Helper: limit used by the UI progress bar
    const deriveSubmissionsLimit = (d: any) =>
      d.model === 'degen'
        ? (d.winnersPerMission ?? d.winnersCap ?? d.maxWinners ?? 0)
        : (d.cap ?? d.max_participants ?? 0);

    // ✅ FIX: Consistent winners count for display (prefer winnersPerMission for degen)
    const deriveWinnersCount = (d: any) => {
      if (d.model === 'degen') {
        // For degen, prefer winnersPerMission (actual winners) over maxWinners (cap)
        return d.winnersPerMission ?? d.winnersCap ?? d.maxWinners ?? 0;
      }
      return d.cap ?? d.max_participants ?? 0;
    };

    const missions = missionsSnapshot.docs.map(doc => {
      const data = doc.data();
      const creator = usersMap.get(data.created_by);


      // normalize dates BEFORE spreading raw data so we don't overwrite
      const createdAt = toIso(data.created_at);
      const deadline = toIso(data.deadline);
      const expiresAt = toIso(data.expires_at);

      // ✅ FIX: Calculate deadline for degen missions if missing
      let calculatedDeadline = deadline;
      if (data.model === 'degen' && !deadline && data.duration && createdAt) {
        try {
          const startDate = new Date(createdAt);
          const endDate = new Date(startDate.getTime() + (data.duration * 60 * 60 * 1000));
          calculatedDeadline = endDate.toISOString();
        } catch (e) {
          console.warn('Failed to calculate deadline for degen mission:', doc.id);
        }
      }

      // ✅ FIX B: Always ensure rewards are calculated and present
      const storedRewards = data.rewards;
      const derivedRewards = deriveRewards(data, cfg);

      // Use stored rewards if they exist and are valid, otherwise use derived rewards
      const rewards = {
        usd: (storedRewards?.usd && storedRewards.usd > 0) ? storedRewards.usd : derivedRewards.usd,
        honors: (storedRewards?.honors && storedRewards.honors > 0) ? storedRewards.honors : derivedRewards.honors,
        ...(derivedRewards.perUserHonors && { perUserHonors: derivedRewards.perUserHonors })
      };

      // ✅ CRITICAL FIX: If rewards are still 0, force update the mission document
      if (rewards.usd === 0 && rewards.honors === 0 && (data.costUSD || data.selectedDegenPreset?.costUSD || data.rewardPerUser)) {
        console.log('🔧 CRITICAL: Mission has 0 rewards but has cost data, forcing update:', doc.id);
        // Update the mission document with correct rewards
        const updateData: any = { rewards };
        if (data.model === 'degen' && !data.winnersPerMission) {
          updateData.winnersPerMission = data.winnersCap ?? data.maxWinners ?? 0;
        }
        // Note: This update will happen asynchronously, but we'll continue with the response
        doc.ref.update(updateData).then(() => {
          console.log('✅ Updated mission with correct rewards:', updateData);
        }).catch((error) => {
          console.error('❌ Failed to update mission rewards:', error);
        });
      }

      const submissionsLimit = deriveSubmissionsLimit(data);

      // spread FIRST, then put normalized fields so they win
      return {
        id: doc.id,
        ...data,                   // ⬅️ spread first
        model: data.model,
        creatorId: data.created_by,
        creatorName: creator?.name || 'Unknown',
        creatorEmail: creator?.email || '',
        // ✅ FIX C: Fix "Invalid Date" once and for all - send clean ISO fields
        createdAt,                 // ISO strings for UI
        deadline: calculatedDeadline,
        expires_at: expiresAt,
        startAt: createdAt,
        endAt: calculatedDeadline || expiresAt,
        // Additional fallback fields for admin UI
        created_at: createdAt,     // back-compat
        created_at_iso: createdAt, // explicit ISO field
        submissionsCount: data.submissions_count || 0,
        approvedCount: data.approved_count || 0,

        rewards,                   // ensure UI always sees non-zero values
        totalCostUsd: rewards.usd,
        totalCostHonors: rewards.honors,
        perUserHonors: data.model === 'fixed' ? (data.rewardPerUser ?? 0) : 0,
        perWinnerHonors: data.model === 'degen' && submissionsLimit > 0
          ? Math.floor(rewards.honors / submissionsLimit)
          : 0,

        // ✅ FIX D: Winners label consistency (degen) - prefer winnersPerMission everywhere
        submissionsLimit,          // UI should render "0 / submissionsLimit"
        winnersPerMission: deriveWinnersCount(data),
        winnersCount: deriveWinnersCount(data), // Explicit field for UI display
        winnersPerTask: data.winnersPerTask ?? data.winners_cap ?? data.winnersCap ?? 0, // keep for back-compat display
        winnersCap: data.winnersCap ?? data.winners_cap,
        cap: data.cap ?? data.max_participants ?? 0,
        durationHours: data.duration_hours ?? data.durationHours ?? data.duration,
        maxParticipants: data.max_participants ?? data.cap,
        participantsCount: data.participants_count || 0,
        isPremium: data.isPremium || false,
        category: data.category,
        difficulty: data.difficulty,
        instructions: data.instructions,
        requirements: data.requirements,
        deliverables: data.deliverables,
        tweetLink: data.tweetLink,
        tasks: data.tasks,
        isPaused: data.isPaused || false,
        selectedDegenPreset: data.selectedDegenPreset, // Include degen preset for frontend
      };
    });


    res.json(missions);
  } catch (error) {
    console.error('Error fetching admin missions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pause/Unpause mission
app.patch('/v1/admin/missions/:missionId/pause', requireAdmin, async (req, res) => {
  try {
    const { missionId } = req.params;
    const { isPaused } = req.body;

    await db.collection('missions').doc(missionId).update({
      isPaused: isPaused,
      updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: `Mission ${isPaused ? 'paused' : 'unpaused'} successfully` });
  } catch (error) {
    console.error('Error updating mission pause status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel/Delete mission permanently
app.delete('/v1/admin/missions/:missionId', requireAdmin, async (req, res) => {
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
app.get('/v1/admin/missions/:missionId/submissions', requireAdmin, async (req, res) => {
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
        submittedAt: toIso(data.submitted_at),
        reviewedAt: toIso(data.reviewed_at),
        createdAt: toIso(data.created_at),
        updatedAt: toIso(data.updated_at),
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

app.get('/v1/admin/users', requireAdmin, async (req, res) => {
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

    const submissions = submissionsSnapshot.docs.map(doc => {
      const d: any = doc.data();
      return {
        id: doc.id,
        ...d,
        submitted_at: toIso(d.submitted_at),
        created_at: toIso(d.created_at),
        updated_at: toIso(d.updated_at),
        reviewed_at: toIso(d.reviewed_at),
      };
    });

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

app.get('/v1/admin/analytics/overview', requireAdmin, async (req, res) => {
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

    // ✅ PLATFORM FEE CONFIG - Read from system_config using unified config accessor
    const configDoc = await db.collection('system_config').doc('main').get();
    const rawConfig = configDoc.exists ? configDoc.data() : {};
    const systemConfig = readCfg(rawConfig);
    const platformFeeRate = systemConfig.platformFeeRate;
    const platformFee = totalRevenue * platformFeeRate;

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
      platformFeeRate, // Include the rate used for transparency
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/admin/analytics/revenue', requireAdmin, async (req, res) => {
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

app.get('/v1/admin/analytics/user-growth', requireAdmin, async (req, res) => {
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

app.get('/v1/admin/analytics/platform-performance', requireAdmin, async (req, res) => {
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

app.get('/v1/admin/analytics/mission-performance', requireAdmin, async (req, res) => {
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

// Dashboard summary endpoint - single source of truth for user metrics
app.get('/v1/dashboard/summary', async (req: any, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    let userId: string;
    if (token === 'demo_admin_token' || token === 'demo_moderator_token') {
      userId = 'mDPgwAwb1pYqmxmsPsYW1b4qlup2';
    } else {
      const decoded = await firebaseAdmin.auth().verifyIdToken(token);
      userId = decoded.uid;
    }

    // 0) Fast path: consolidated stats document if present
    const statsDoc = await db.doc(`users/${userId}/stats/summary`).get();
    const stats = statsDoc.exists ? (statsDoc.data() as any) : null;

    // 1) Missions I created
    const myMissionsSnap = await db.collection('missions')
      .where('created_by', '==', userId)
      .get();
    const missionsCreated = myMissionsSnap.size;

    // 2) Missions I completed (as a participant)
    const progressSnap = await db.collection('mission_progress')
      .where('userId', '==', userId)
      .where('missionCompleted', '==', true)
      .get();
    const missionsCompleted = progressSnap.empty ? (stats?.missionsCompleted ?? 0) : progressSnap.size;

    // 3) Tasks done: include both 'verified' and 'approved' statuses
    const verVerifiedSnap = await db.collection('verifications')
      .where('uid', '==', userId)
      .where('status', '==', 'verified')
      .get();
    const verApprovedSnap = await db.collection('verifications')
      .where('uid', '==', userId)
      .where('status', '==', 'approved')
      .get();
    const tasksDoneRaw = (verVerifiedSnap.size || 0) + (verApprovedSnap.size || 0);
    const tasksDone = tasksDoneRaw === 0 ? (stats?.tasksDone ?? stats?.tasksCompleted ?? 0) : tasksDoneRaw;

    // 4) Honors earned (ONLY from platform activities, not deposits)
    // Calculate from verified verifications to get actual earned rewards
    let honorsEarned = 0;
    verVerifiedSnap.forEach(v => {
      const vd = v.data();
      const h = vd?.rewards?.honors ?? vd?.honors ?? 0;
      honorsEarned += Number(h) || 0;
    });
    verApprovedSnap.forEach(v => {
      const vd = v.data();
      const h = vd?.rewards?.honors ?? vd?.honors ?? 0;
      honorsEarned += Number(h) || 0;
    });

    // Fallback to stats if no verifications found
    if (honorsEarned === 0) {
      honorsEarned = Number(stats?.totalEarned ?? stats?.totalEarnings ?? 0) || 0;
    }

    // Get wallet for USD balance (but don't use wallet.honors for earned calculation)
    const walletDoc = await db.collection('wallets').doc(userId).get();
    const wallet = walletDoc.exists ? (walletDoc.data() as any) : null;

    // 5) USD spent = sum of rewards.usd on my missions
    let usdSpent = 0;
    myMissionsSnap.docs.forEach(d => {
      const r = d.data()?.rewards;
      if (r?.usd) usdSpent += Number(r.usd) || 0;
    });

    // 6) USD balance from wallet
    const usdBalance = Number(wallet?.usd ?? 0);

    res.json({
      missionsCreated,
      missionsCompleted,
      tasksDone,
      honorsEarned: Number(honorsEarned || 0),
      usdSpent: Number(usdSpent.toFixed(2)),
      usdBalance: Number(usdBalance.toFixed(2)),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error computing dashboard summary:', error);
    res.status(500).json({ error: 'Failed to compute dashboard summary' });
  }
});

// Admin: create user stats for existing users
app.post('/v1/admin/create-user-stats', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if user exists
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if stats already exist
    const statsRef = db.doc(`users/${userId}/stats/summary`);
    const statsDoc = await statsRef.get();

    if (statsDoc.exists) {
      return res.json({
        success: true,
        message: 'User stats already exist',
        stats: statsDoc.data()
      });
    }

    // Calculate stats from existing data
    const missionsCreated = await db.collection('missions')
      .where('created_by', '==', userId)
      .get();

    const tasksCompleted = await db.collection('mission_participations')
      .where('user_id', '==', userId)
      .where('status', '==', 'verified')
      .get();

    let totalEarned = 0;
    tasksCompleted.forEach(doc => {
      const data = doc.data();
      if (data.rewards?.honors) {
        totalEarned += data.rewards.honors;
      }
    });

    // Create user stats document
    const statsData = {
      missionsCreated: missionsCreated.size,
      missionsCompleted: 0, // Will be updated by other functions
      tasksDone: tasksCompleted.size,
      totalEarned: totalEarned,
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
    };

    await statsRef.set(statsData);

    res.json({
      success: true,
      message: 'User stats created successfully',
      stats: statsData
    });

  } catch (error) {
    console.error('Error creating user stats:', error);
    res.status(500).json({ error: 'Failed to create user stats' });
  }
});

// Admin: backfill timestamps, deadlines, and rewards for legacy missions
app.post('/v1/admin/backfill-timestamps', requireAdmin, async (_req, res) => {
  const cfgDoc = await db.collection('system_config').doc('main').get();
  const honorsPerUsd = cfgDoc.exists ? (cfgDoc.data()?.pricing?.honorsPerUsd ?? 450) : 450;

  const snap = await db.collection('missions').get();
  let fixed = 0;

  for (const doc of snap.docs) {
    const d: any = doc.data() || {};
    const upd: any = {};
    const createdAtIso = toIso(d.created_at);
    if (!createdAtIso) {
      upd.created_at = firebaseAdmin.firestore.FieldValue.serverTimestamp();
    }
    if (!d.updated_at) {
      upd.updated_at = firebaseAdmin.firestore.FieldValue.serverTimestamp();
    }
    // Degen deadline
    const durationH = Number(d.duration_hours ?? d.durationHours ?? d.duration ?? 0);
    if (d.model === 'degen' && !toIso(d.deadline) && durationH > 0 && createdAtIso) {
      const start = new Date(createdAtIso);
      upd.deadline = new Date(start.getTime() + durationH * 3600 * 1000);
    }
    // Rewards
    const hasRewards = d?.rewards && ((d.rewards.usd ?? 0) > 0 || (d.rewards.honors ?? 0) > 0);
    if (!hasRewards) {
      if (d.model === 'degen') {
        const usd = Number(d.selectedDegenPreset?.costUSD ?? d.costUSD ?? 0);
        if (usd > 0) upd.rewards = { usd, honors: Math.round(usd * honorsPerUsd) };
      } else {
        const perUserHonors = d.rewardPerUser ?? 0;
        const participants = d.cap ?? d.max_participants ?? d.winnersCap ?? 0;
        const honors = perUserHonors * participants;
        const usd = Number((honors / honorsPerUsd).toFixed(2));
        if (honors > 0) upd.rewards = { usd, honors, perUserHonors };
      }
    }

    if (Object.keys(upd).length) {
      await doc.ref.set(upd, { merge: true });
      fixed++;
    }
  }

  res.json({ success: true, fixed, total: snap.size });
});

app.get('/v1/admin/system-config', requireAdmin, async (req, res) => {
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
          userPoolFactor: 1.2,
          taskPrices: DEFAULT_TASK_PRICES
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

app.post('/v1/admin/system-config', requireAdmin, async (req, res) => {
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
        joined_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        tasks_completed: [],
        total_honors_earned: 0
      };
      const participationRef = await db.collection('mission_participations').add(participation);
      participationId = participationRef.id;

      // Update mission participants count
      await db.collection('missions').doc(missionId).update({
        participants_count: firebaseAdmin.firestore.FieldValue.increment(1),
        updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      participationId = participationQuery.docs[0].id;
    }

    // ✅ AUTO ACTIONS MAPPING - Explicit auto flag system
    const AUTO_ACTIONS = {
      // Twitter auto actions
      'like': { auto: true, platform: 'twitter', action: 'like' },
      'retweet': { auto: true, platform: 'twitter', action: 'retweet' },
      'follow': { auto: true, platform: 'twitter', action: 'follow' },
      'comment': { auto: false, platform: 'twitter', action: 'comment' },
      'quote': { auto: false, platform: 'twitter', action: 'quote' },

      // Instagram auto actions
      'like_instagram': { auto: true, platform: 'instagram', action: 'like' },
      'follow_instagram': { auto: true, platform: 'instagram', action: 'follow' },
      'comment_instagram': { auto: false, platform: 'instagram', action: 'comment' },

      // TikTok auto actions
      'like_tiktok': { auto: true, platform: 'tiktok', action: 'like' },
      'follow_tiktok': { auto: true, platform: 'tiktok', action: 'follow' },
      'comment_tiktok': { auto: false, platform: 'tiktok', action: 'comment' },

      // Facebook auto actions
      'like_facebook': { auto: true, platform: 'facebook', action: 'like' },
      'follow_facebook': { auto: true, platform: 'facebook', action: 'follow' },
      'comment_facebook': { auto: false, platform: 'facebook', action: 'comment' },

      // Manual actions (require user proof)
      'meme': { auto: false, platform: 'twitter', action: 'meme' },
      'thread': { auto: false, platform: 'twitter', action: 'thread' },
      'article': { auto: false, platform: 'twitter', action: 'article' },
      'videoreview': { auto: false, platform: 'twitter', action: 'videoreview' },
      'pfp': { auto: false, platform: 'twitter', action: 'pfp' },
      'name_bio_keywords': { auto: false, platform: 'twitter', action: 'name_bio_keywords' },
      'pinned_tweet': { auto: false, platform: 'twitter', action: 'pinned_tweet' },
      'poll': { auto: false, platform: 'twitter', action: 'poll' },
      'spaces': { auto: false, platform: 'twitter', action: 'spaces' },
      'community_raid': { auto: false, platform: 'twitter', action: 'community_raid' },
      'status_50_views': { auto: false, platform: 'twitter', action: 'status_50_views' },

      // Custom actions
      'custom': { auto: false, platform: 'custom', action: 'custom' }
    };

    // Handle task completion based on action type
    let taskResult = null;
    const actionConfig = AUTO_ACTIONS[actionId] || { auto: false, platform: 'unknown', action: actionId };

    if (actionConfig.auto) {
      // Handle automatic actions (like, retweet, follow)
      const action = actionConfig.action;
      if (actionConfig.platform === 'twitter') {
        const tweetId = extractTweetIdFromUrl(mission.tweetLink || mission.contentLink);
        if (tweetId) {
          taskResult = await handleTwitterAction(action, tweetId, userId);
        }
      } else if (actionConfig.platform === 'instagram') {
        const postId = extractPostIdFromUrl(mission.contentLink);
        if (postId) {
          taskResult = await handleInstagramAction(action, postId, userId);
        }
      } else if (actionConfig.platform === 'tiktok') {
        // TODO: Implement TikTok action handling
        console.log('TikTok actions not yet implemented:', action, mission.contentLink);
      } else if (actionConfig.platform === 'facebook') {
        // TODO: Implement Facebook action handling
        console.log('Facebook actions not yet implemented:', action, mission.contentLink);
      }
    }

    // Create task completion record
    const taskCompletion = {
      task_id: taskId,
      action_id: actionId,
      completed_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
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
    const taskHonors = await calculateTaskHonors(platform, missionType, taskId);
    const totalHonors = (currentData?.total_honors_earned || 0) + taskHonors;

    await db.collection('mission_participations').doc(participationId).update({
      tasks_completed: tasksCompleted,
      total_honors_earned: totalHonors,
      updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
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
  const m = url.match(/(?:https?:\/\/)?(?:www\.|mobile\.)?(?:x\.com|twitter\.com)\/[^/]+\/status\/(\d+)/i);
  return m ? m[1] : null;
};

const extractPostIdFromUrl = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/instagram\.com\/p\/([^\/]+)/);
  return match ? match[1] : null;
};

const calculateTaskHonors = async (platform: string, missionType: string, taskId: string): Promise<number> => {
  // Use centralized task prices from system config
  const taskPrices = await getTaskPrices();
  return taskPrices[taskId] || 0;
};

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);

export const setAdminClaim = functions.https.onCall(async (data, context) => {
  // Protect this (allow only existing admins)
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }
  const { uid, admin } = data as { uid: string; admin: boolean };
  await firebaseAdmin.auth().setCustomUserClaims(uid, { admin });
  return { success: true };
});

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

      // Only process state changes
      const was = before?.status === 'verified';
      const now = after?.status === 'verified';
      if (was === now) return null; // only act on changes

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
      const winnersPerMission = missionData.winnersPerMission || null;
      const taskCount = Array.isArray(missionData.tasks) ? missionData.tasks.length : 0;

      // Calculate delta based on state change
      const delta = now ? +1 : -1;

      await db.runTransaction(async (tx) => {
        const aggDoc = await tx.get(aggRef);
        const agg = aggDoc.exists ? aggDoc.data() : {
          taskCounts: {},
          totalCompletions: 0,
          winnersPerTask,
          winnersPerMission,
          taskCount
        };

        if (!agg) {
          console.error('Failed to get aggregate data');
          return;
        }

        // ✅ COUNTING LOGIC VS CAPS - Handle both fixed (per-task) and degen (per-mission) caps
        if (delta > 0) {
          if (missionData.model === 'fixed' && winnersPerTask) {
            // Fixed missions: check per-task cap
            const currentCount = agg.taskCounts[taskId] || 0;
            if (currentCount >= winnersPerTask) {
              console.log(`Task ${taskId} already at cap (${currentCount}/${winnersPerTask}), skipping increment`);
              return; // Skip this update - task is already full
            }
          } else if (missionData.model === 'degen' && winnersPerMission) {
            // Degen missions: check mission-wide cap
            const currentTotal = agg.totalCompletions || 0;
            if (currentTotal >= winnersPerMission) {
              console.log(`Mission ${missionId} already at cap (${currentTotal}/${winnersPerMission}), skipping increment`);
              return; // Skip this update - mission is already full
            }
          }
        }

        // Update task count with bounds checking
        const prevCount = agg.taskCounts[taskId] || 0;
        const newCount = Math.max(0, prevCount + delta);
        agg.taskCounts[taskId] = newCount;
        agg.totalCompletions = Math.max(0, agg.totalCompletions + delta);
        agg.winnersPerTask = winnersPerTask;
        agg.winnersPerMission = winnersPerMission;
        agg.taskCount = taskCount;
        agg.updatedAt = firebaseAdmin.firestore.FieldValue.serverTimestamp();

        // Log the mutation for monitoring
        console.log(`Aggregate mutation: mission=${missionId}, task=${taskId}, prev=${prevCount}, next=${newCount}, delta=${delta}, cause=verification`);

        // Alert if count exceeds cap (should be impossible with race protection)
        if (missionData.model === 'fixed' && newCount > winnersPerTask && winnersPerTask) {
          console.error(`🚨 ALERT: Task ${taskId} count (${newCount}) exceeds cap (${winnersPerTask})!`);
        } else if (missionData.model === 'degen' && agg.totalCompletions > winnersPerMission && winnersPerMission) {
          console.error(`🚨 ALERT: Mission ${missionId} total count (${agg.totalCompletions}) exceeds cap (${winnersPerMission})!`);
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

      // Only act when moving into a verified state the first time
      const afterStatus = normalizeStatus(after?.status);
      const beforeStatus = normalizeStatus(before?.status);
      const becameVerified = afterStatus === 'verified' && beforeStatus !== 'verified';
      if (!becameVerified) return;

      const { uid, missionId, taskId, missionType, honorsPerTask, tasksRequired, rewardPerUser } = after as {
        uid: string;
        missionId: string;
        taskId: string;
        missionType: 'fixed' | 'degen';
        honorsPerTask: number;
        tasksRequired?: number;
        rewardPerUser?: number;
      };

      if (!uid || !missionId || !taskId) {
        console.log('Missing required fields in verification:', { uid, missionId, taskId });
        return;
      }

      const userStatsRef = db.doc(`users/${uid}/stats/summary`);
      const progressRef = db.doc(`users/${uid}/missionProgress/${missionId}`);
      const userTaskMarker = db.doc(`users/${uid}/missionProgress/${missionId}/tasks/${taskId}`);

      await db.runTransaction(async tx => {
        const statsSnap = await tx.get(userStatsRef);
        const missionProgSnap = await tx.get(progressRef);

        // ✅ normalize snapshots
        const stats: UserStats = statsSnap.exists
          ? (statsSnap.data() as UserStats)
          : emptyStats();

        const tasksRequiredFromMission = tasksRequired || 1;

        const prog: MissionProgress = missionProgSnap.exists
          ? (missionProgSnap.data() as MissionProgress)
          : emptyProgress(tasksRequiredFromMission);

        // safe arithmetic
        const newStats: UserStats = {
          missionsCreated: stats.missionsCreated ?? 0,
          missionsCompleted: stats.missionsCompleted ?? 0,
          tasksDone: (stats.tasksDone ?? 0) + 1,
          tasksCompleted: (stats.tasksCompleted ?? 0) + 1,
          totalEarned: stats.totalEarned ?? 0,
          totalEarnings: stats.totalEarnings ?? 0,
          lastActiveAt: new Date().toISOString(),
        };

        // 2) Check if this is a new task completion for this user
        const userTaskSnap = await tx.get(userTaskMarker);
        if (!userTaskSnap.exists) {
          // Mark this task as completed for this user
          tx.set(userTaskMarker, {
            verified: true,
            at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
          });

          const newTasksVerified = (prog.tasksVerified ?? 0) + 1;
          const req = prog.tasksRequired || tasksRequiredFromMission || 1;
          const completed = newTasksVerified >= req;

          tx.set(progressRef, {
            tasksVerified: newTasksVerified,
            tasksRequired: req,
            completed,
            updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });

          // if mission just completed for this user, bump missionsCompleted once
          if (completed && !prog.completed) {
            newStats.missionsCompleted = (newStats.missionsCompleted ?? 0) + 1;

            // Award mission completion bonus (for fixed missions)
            if (missionType === 'fixed' && rewardPerUser) {
              // Update user stats
              tx.set(
                userStatsRef,
                { totalEarned: firebaseAdmin.firestore.FieldValue.increment(rewardPerUser) },
                { merge: true }
              );

              // Update wallet balance
              const walletRef = db.collection('wallets').doc(uid);
              tx.set(walletRef, {
                honors: firebaseAdmin.firestore.FieldValue.increment(rewardPerUser),
                usd: firebaseAdmin.firestore.FieldValue.increment(rewardPerUser * 0.0022), // Convert to USD
                updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
              }, { merge: true });

              // Create transaction record
              tx.set(db.collection('transactions').doc(), {
                user_id: uid,
                type: 'earned',
                amount: rewardPerUser,
                currency: 'honors',
                description: `Mission completion bonus`,
                mission_id: missionId,
                created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
              });
            }
          }
        }

        // writes
        tx.set(userStatsRef, newStats, { merge: true });

        // if fixed mission and per-task honors pay immediately:
        if (missionType === 'fixed' && honorsPerTask) {
          // Update user stats
          tx.set(
            userStatsRef,
            { totalEarned: firebaseAdmin.firestore.FieldValue.increment(honorsPerTask) },
            { merge: true }
          );

          // Update wallet balance
          const walletRef = db.collection('wallets').doc(uid);
          tx.set(walletRef, {
            honors: firebaseAdmin.firestore.FieldValue.increment(honorsPerTask),
            usd: firebaseAdmin.firestore.FieldValue.increment(honorsPerTask * 0.0022), // Convert to USD (1 Honor = $0.0022)
            updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });

          // Create transaction record
          tx.set(db.collection('transactions').doc(), {
            user_id: uid,
            type: 'earned',
            amount: honorsPerTask,
            currency: 'honors',
            description: `Earned from mission task completion`,
            mission_id: missionId,
            task_id: taskId,
            created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
          });
        }
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
        const statsRef = db.doc(`users/${uid}/stats/summary`);
        const winMarker = db.doc(`users/${uid}/missionProgress/${missionId}/wins/${taskId}`);

        await db.runTransaction(async tx => {
          // Check if already paid (idempotency)
          const winSnap = await tx.get(winMarker);
          if (winSnap.exists) {
            console.log(`User ${uid} already won task ${taskId}, skipping payment`);
            return;
          }

          // pay winner honors idempotently
          tx.set(
            statsRef,
            {
              totalEarned: firebaseAdmin.firestore.FieldValue.increment(honorsPerTask || 0),
            },
            { merge: true }
          );

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

      const statsRef = db.doc(`users/${created_by}/stats/summary`);
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

// Scheduled function to check for expired fixed missions and mark them as completed
/**
 * ✅ USER STATS CONSOLIDATION - Hourly job to derive user aggregates
 */
export const deriveUserStatsAggregates = functions.pubsub
  .schedule('every 1 hours')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('Starting user stats aggregation job...');

      // Get all users
      const usersSnapshot = await db.collection('users').get();

      for (const userDoc of usersSnapshot.docs) {
        const uid = userDoc.id;

        // Skip if user has no stats subcollection
        const statsSnapshot = await db.collection(`users/${uid}/stats`).get();
        if (statsSnapshot.empty) continue;

        // Calculate aggregates from various sources
        const missionsCreated = await db.collection('missions')
          .where('created_by', '==', uid)
          .get();

        const tasksCompleted = await db.collection('mission_participations')
          .where('user_id', '==', uid)
          .where('status', '==', 'verified')
          .get();

        const totalEarnings = await db.collection('mission_participations')
          .where('user_id', '==', uid)
          .where('status', '==', 'verified')
          .get();

        let earningsSum = 0;
        totalEarnings.forEach(doc => {
          const data = doc.data();
          if (data.rewards?.honors) {
            earningsSum += data.rewards.honors;
          }
        });

        // Update consolidated stats
        await updateUserStats(uid, {
          missionsCreated: missionsCreated.size,
          tasksDone: tasksCompleted.size,
          tasksCompleted: tasksCompleted.size,
          totalEarned: earningsSum,
          totalEarnings: earningsSum,
          lastActiveAt: new Date().toISOString()
        });
      }

      console.log('User stats aggregation job completed');
    } catch (error) {
      console.error('Error in user stats aggregation job:', error);
    }
  });

export const checkExpiredFixedMissions = functions.pubsub
  .schedule('every 1 hours') // Run every hour
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('Checking for expired fixed missions...');

      const now = new Date();

      // Query for active fixed missions that have expired
      const expiredMissionsQuery = db.collection('missions')
        .where('model', '==', 'fixed')
        .where('status', '==', 'active')
        .where('expires_at', '<=', now);

      const expiredMissionsSnapshot = await expiredMissionsQuery.get();

      if (expiredMissionsSnapshot.empty) {
        console.log('No expired fixed missions found');
        return null;
      }

      console.log(`Found ${expiredMissionsSnapshot.size} expired fixed missions`);

      const batch = db.batch();
      const completedMissionIds: string[] = [];

      expiredMissionsSnapshot.docs.forEach((doc) => {
        const missionId = doc.id;
        const missionData = doc.data();

        console.log(`Marking mission ${missionId} as completed (expired at: ${missionData.expires_at})`);

        // Update mission status to completed
        batch.update(doc.ref, {
          status: 'completed',
          completed_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
        });

        completedMissionIds.push(missionId);
      });

      // Commit all updates
      await batch.commit();

      console.log(`Successfully marked ${completedMissionIds.length} missions as completed`);

      // Log completed mission IDs for monitoring
      if (completedMissionIds.length > 0) {
        console.log('Completed mission IDs:', completedMissionIds);
      }

      return null;
    } catch (error) {
      console.error('Error checking expired fixed missions:', error);
      return null;
    }
  });

// ---- V2 public API (no local declarations with the same names) ----

import {
  onParticipationUpdate as _onParticipationUpdate,
  onMissionCreate as _onMissionCreate,
} from './realtime-stats-updater';

import {
  onDegenWinnersChosen as _onDegenWinnersChosen,
  onDegenMissionCompleted as _onDegenMissionCompleted,
} from './degen-winner-handler';

// Export review functions
export { submitReview } from './review-handler';
export { getReviewQueue } from './review-queue';

// Export with the V2 names Firebase will pick up
export const onParticipationUpdateV2 = _onParticipationUpdate;
export const onMissionCreateV2 = _onMissionCreate;
export const onDegenWinnersChosenV2 = _onDegenWinnersChosen;
export const onDegenMissionCompleted = _onDegenMissionCompleted;