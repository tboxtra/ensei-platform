import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mission pricing logic (simplified for Firebase)
const HONORS_PER_USD = 450;
const USD_PER_HONOR = 1 / HONORS_PER_USD;

const TASK_CATALOG = {
  twitter: {
    engage: { like: 20, retweet: 300, comment: 200, quote: 700 },
    content: { meme: 700, thread: 1800, article: 2400, videoreview: 3600 },
    ambassador: { pfp: 400, name_bio_keywords: 600, pinned_tweet: 800, poll: 900, spaces: 1800, community_raid: 1200 }
  },
  instagram: {
    engage: { like: 30, comment: 220, follow: 250, story_repost: 350 },
    content: { feed_post: 700, reel: 3600, carousel: 1600, meme: 700 },
    ambassador: { pfp: 400, hashtag_in_bio: 600, story_highlight: 800 }
  },
  tiktok: {
    engage: { like: 25, comment: 200, repost_duet: 350, follow: 250 },
    content: { skit: 3600, challenge: 3600, product_review: 2400, status_style: 700 },
    ambassador: { pfp: 400, hashtag_in_bio: 600, pinned_branded_video: 1200 }
  }
};

const DEGEN_PRESETS = [
  { hours: 1, costUSD: 15, maxWinners: 1, label: "1h" },
  { hours: 3, costUSD: 30, maxWinners: 2, label: "3h" },
  { hours: 6, costUSD: 80, maxWinners: 3, label: "6h" },
  { hours: 8, costUSD: 150, maxWinners: 3, label: "8h" },
  { hours: 12, costUSD: 180, maxWinners: 5, label: "12h" },
  { hours: 18, costUSD: 300, maxWinners: 5, label: "18h" },
  { hours: 24, costUSD: 400, maxWinners: 5, label: "24h" },
  { hours: 36, costUSD: 500, maxWinners: 10, label: "36h" },
  { hours: 48, costUSD: 600, maxWinners: 10, label: "48h" },
  { hours: 72, costUSD: 800, maxWinners: 10, label: "3d" },
  { hours: 96, costUSD: 1000, maxWinners: 10, label: "4d" },
  { hours: 168, costUSD: 1500, maxWinners: 10, label: "7d" },
  { hours: 240, costUSD: 2000, maxWinners: 10, label: "10d" }
];

// Middleware to verify JWT token
const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Calculate mission pricing
function calculateMissionPricing(request: any) {
  const { platform, type, model, target, tasks, cap, durationHours, winnersCap } = request;

  // Calculate tasks honors
  const platformTasks = TASK_CATALOG[platform as keyof typeof TASK_CATALOG];
  if (!platformTasks || !platformTasks[type as keyof typeof platformTasks]) {
    throw new Error(`Invalid platform or type: ${platform}/${type}`);
  }

  const taskHonors = platformTasks[type as keyof typeof platformTasks] as any;
  const tasksHonors = tasks.reduce((sum: number, task: string) => sum + (taskHonors[task] || 0), 0);

  if (model === 'fixed') {
    if (!cap || cap < 60) {
      throw new Error('Fixed missions require a cap of at least 60');
    }

    const rewardHonorsTotal = tasksHonors * cap;
    const costHonorsTotal = rewardHonorsTotal * 2; // 100% platform fee
    const totalCostUsd = costHonorsTotal * USD_PER_HONOR;

    return {
      model: 'fixed',
      totalCostUsd,
      totalCostHonors: costHonorsTotal,
      perUserHonors: tasksHonors,
      breakdown: {
        tasksHonors,
        platformFee: costHonorsTotal - rewardHonorsTotal,
        premiumMultiplier: target === 'premium' ? 5 : undefined
      }
    };
  } else if (model === 'degen') {
    if (!durationHours || !winnersCap) {
      throw new Error('Degen missions require durationHours and winnersCap');
    }

    const preset = DEGEN_PRESETS.find(p => p.hours === durationHours);
    if (!preset) {
      throw new Error(`Invalid duration: ${durationHours} hours`);
    }

    const baseCost = preset.costUSD;
    const premiumMultiplier = target === 'premium' ? 5 : 1;
    const taskMultiplier = tasks.length >= 1 ? tasks.length : 1;
    const totalCostUsd = baseCost * premiumMultiplier * taskMultiplier;
    const userPoolHonors = totalCostUsd * HONORS_PER_USD * 0.5; // 50% to user pool
    const perWinnerHonors = userPoolHonors / winnersCap;

    return {
      model: 'degen',
      totalCostUsd,
      totalCostHonors: totalCostUsd * HONORS_PER_USD,
      userPoolHonors,
      perWinnerHonors,
      breakdown: {
        tasksHonors,
        platformFee: totalCostUsd * 0.5,
        premiumMultiplier: target === 'premium' ? 5 : undefined
      }
    };
  }

  throw new Error(`Unsupported mission model: ${model}`);
}

// Get task catalog
router.get('/task-catalog', (req, res) => {
  res.json(TASK_CATALOG);
});

// Get degen presets
router.get('/degen-presets', (req, res) => {
  res.json(DEGEN_PRESETS);
});

// Calculate pricing
router.post('/calculate-pricing', (req, res) => {
  try {
    const result = calculateMissionPricing(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Validate degen mission
router.post('/validate-degen', (req, res) => {
  try {
    const { durationHours, winnersCap } = req.body;
    const preset = DEGEN_PRESETS.find(p => p.hours === durationHours);

    if (!preset) {
      return res.json({
        isValid: false,
        maxWinners: 0,
        error: `Invalid duration: ${durationHours} hours`
      });
    }

    if (winnersCap < 1 || winnersCap > preset.maxWinners) {
      return res.json({
        isValid: false,
        preset,
        maxWinners: preset.maxWinners,
        error: `Winners cap must be between 1 and ${preset.maxWinners}`
      });
    }

    res.json({
      isValid: true,
      preset,
      maxWinners: preset.maxWinners
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Create mission (requires authentication)
router.post('/', verifyToken, (req, res) => {
  try {
    const missionData = req.body;
    const userId = (req as any).user.userId;

    // Create mission logic here
    const mission = {
      id: `mission_${Date.now()}`,
      ...missionData,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    res.status(201).json(mission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mission' });
  }
});

// Get missions (requires authentication)
router.get('/', verifyToken, (req, res) => {
  try {
    const userId = (req as any).user.userId;
    
    // Mock missions data
    const missions = [
      {
        id: 'mission_1',
        title: 'Twitter Engagement Campaign',
        platform: 'twitter',
        type: 'engage',
        model: 'fixed',
        status: 'active',
        createdBy: userId,
        createdAt: new Date().toISOString()
      }
    ];

    res.json(missions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

export { router as missionRoutes };
