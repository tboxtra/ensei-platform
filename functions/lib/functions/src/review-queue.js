"use strict";
// Review Queue Callable Function
// Fetches reviewable items server-side to bypass Firestore permission issues
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewQueue = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length)
    admin.initializeApp();
const db = admin.firestore();
// Robust URL parsing for twitter.com and x.com
function parseTweetUrl(url) {
    if (!url)
        return null;
    try {
        const u = new URL(url);
        const host = u.hostname.replace(/^www\./i, '').toLowerCase();
        if (host !== 'twitter.com' && host !== 'x.com')
            return null;
        // /{handle}/status/{tweetId}
        const [, handle, statusLiteral, tweetId] = u.pathname.split('/');
        if (!handle || statusLiteral !== 'status' || !tweetId)
            return null;
        return { handle, tweetId };
    }
    catch {
        return null;
    }
}
exports.getReviewQueue = functions.region('us-central1').https.onCall(async (_data, context) => {
    const reviewerUid = context.auth?.uid;
    if (!reviewerUid) {
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
    }
    // 1) Query participations broadly (don't over-filter in Firestore)
    const partsSnap = await db
        .collection('mission_participations')
        .orderBy('created_at', 'desc')
        .limit(100)
        .get();
    // 2) Debug counters
    const dbg = {
        totalParts: partsSnap.size,
        totalTasks: 0,
        completedTasks: 0,
        linkTasks: 0,
        urlOK: 0,
        notSelf: 0,
        notReviewed: 0,
        reviewerUid,
    };
    const items = [];
    for (const doc of partsSnap.docs) {
        const p = doc.data();
        const tasks = Array.isArray(p.tasks_completed) ? p.tasks_completed : [];
        dbg.totalTasks += tasks.length;
        for (const t of tasks) {
            // Only review completed tasks
            if (t?.status !== 'completed')
                continue;
            dbg.completedTasks++;
            // Only review LINK tasks
            if (t?.verificationMethod !== 'link')
                continue;
            dbg.linkTasks++;
            // Exclude self at TASK level
            if (t?.user_id === reviewerUid)
                continue;
            dbg.notSelf++;
            // URL must be valid x/twitter OR urlValidation.isValid === true
            const parsed = parseTweetUrl(t?.url);
            const urlOK = parsed || t?.urlValidation?.isValid === true;
            if (!urlOK)
                continue;
            dbg.urlOK++;
            // Check if already reviewed
            const reviewKey = `${doc.id}:${t.task_id}:${t.user_id}:${reviewerUid}`;
            const receiptRef = db.collection('reviews').doc(reviewKey);
            const receipt = await receiptRef.get();
            if (receipt.exists)
                continue;
            dbg.notReviewed++;
            // ✅ candidate found
            items.push({
                participationId: doc.id,
                missionId: p.mission_id,
                submitterUid: t.user_id,
                taskId: t.task_id,
                // Submission (user's link)
                submissionUrl: t.url,
                submissionTweetId: parsed?.tweetId ?? t?.urlValidation?.tweetId ?? null,
                submissionHandle: parsed?.handle ?? t?.urlValidation?.extractedHandle ?? null,
                // Mission (original) - we'll need to fetch this from the mission document
                missionUrl: null, // Will be populated by fetching mission data
                missionTweetId: null,
                missionHandle: null,
                createdAt: p.created_at ?? p.updated_at ?? null,
            });
            // Return one-at-a-time
            if (items.length)
                break;
        }
        if (items.length)
            break;
    }
    // Debug output
    console.log('[getReviewQueue]', dbg);
    return { item: items[0] ?? null };
});
