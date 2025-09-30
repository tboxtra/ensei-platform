const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./functions/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function debugMissionData() {
  try {
    console.log('🔍 DEBUGGING MISSION DATA...\n');
    
    // Get the specific mission
    const missionDoc = await db.collection('missions').doc('vb4ycovDru4j1Plq93GS').get();
    
    if (!missionDoc.exists) {
      console.log('❌ Mission not found');
      return;
    }
    
    const data = missionDoc.data();
    console.log('📄 RAW FIRESTORE DATA:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n');
    
    // Check system config
    const configDoc = await db.collection('system_config').doc('main').get();
    const config = configDoc.exists ? configDoc.data() : {};
    console.log('⚙️ SYSTEM CONFIG:');
    console.log(JSON.stringify(config, null, 2));
    console.log('\n');
    
    // Simulate the deriveRewards function
    const readCfg = (cfg = {}) => ({
      honorsPerUsd: cfg.honorsPerUsd ?? cfg.pricing?.honorsPerUsd ?? 450,
      platformFeeRate: cfg.platformFeeRate ?? cfg.pricing?.platformFeeRate ?? 0.25,
      premiumMultiplier: cfg.premiumMultiplier ?? cfg.pricing?.premiumMultiplier ?? 5,
      taskPrices: cfg.pricing?.taskPrices ?? {
        like: 50,
        retweet: 100,
        comment: 150,
        follow: 200
      }
    });
    
    const cfg = readCfg(config);
    console.log('🔧 PROCESSED CONFIG:');
    console.log(JSON.stringify(cfg, null, 2));
    console.log('\n');
    
    // Test deriveRewards function
    const deriveRewards = (d, cfg) => {
      if (d.model === 'degen') {
        const usd = Number(d.selectedDegenPreset?.costUSD ?? d.costUSD ?? 0);
        const honors = Math.round(usd * cfg.honorsPerUsd);
        return { usd, honors };
      }
      // fixed
      const perUserHonors =
        d.rewardPerUser ??
        (Array.isArray(d.tasks)
          ? d.tasks.reduce((sum, t) =>
            sum + ((cfg.taskPrices?.[t] ?? 0) * (d.isPremium ? cfg.premiumMultiplier : 1)), 0)
          : 0);

      const participants = d.cap ?? d.max_participants ?? d.winnersCap ?? 0;
      const honors = perUserHonors * participants;
      const usd = Number((honors / cfg.honorsPerUsd).toFixed(2));
      return { usd, honors, perUserHonors };
    };
    
    const derivedRewards = deriveRewards(data, cfg);
    console.log('💰 DERIVED REWARDS:');
    console.log(JSON.stringify(derivedRewards, null, 2));
    console.log('\n');
    
    // Test toIso function
    const toIso = (v) => {
      if (!v) return null;
      if (v?.toDate?.()) return v.toDate().toISOString();
      if (v instanceof Date) return v.toISOString();
      if (v && typeof v === 'object' && v.seconds) return new Date(v.seconds * 1000).toISOString();
      if (typeof v === 'string') {
        if (v.includes('at') && v.includes('UTC')) {
          try {
            const date = new Date(v);
            if (!isNaN(date.getTime())) return date.toISOString();
          } catch (e) {
            console.warn('toIso: Failed to parse Firestore date string:', v);
          }
        }
        const date = new Date(v);
        if (!isNaN(date.getTime())) return v;
      }
      if (typeof v === 'number') {
        const date = new Date(v);
        if (!isNaN(date.getTime())) return date.toISOString();
      }
      console.warn('toIso: Unable to convert value to ISO string:', v, typeof v);
      return null;
    };
    
    const createdAt = toIso(data.created_at);
    const deadline = toIso(data.deadline);
    console.log('📅 DATE CONVERSIONS:');
    console.log('created_at:', data.created_at, '->', createdAt);
    console.log('deadline:', data.deadline, '->', deadline);
    console.log('\n');
    
    // Simulate the final admin API response
    const finalResponse = {
      id: missionDoc.id,
      ...data,
      model: data.model,
      creatorId: data.created_by,
      creatorName: 'Unknown',
      creatorEmail: '',
      createdAt,
      deadline,
      rewards: derivedRewards,
      totalCostUsd: derivedRewards.usd,
      totalCostHonors: derivedRewards.honors,
      perUserHonors: data.model === 'fixed' ? (data.rewardPerUser ?? 0) : 0,
      perWinnerHonors: data.model === 'degen' && derivedRewards.honors > 0
        ? Math.floor(derivedRewards.honors / (data.winnersPerMission ?? data.winnersCap ?? data.maxWinners ?? 1))
        : 0,
    };
    
    console.log('🎯 FINAL ADMIN API RESPONSE:');
    console.log(JSON.stringify(finalResponse, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugMissionData();
