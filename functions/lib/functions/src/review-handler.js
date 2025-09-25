"use strict";
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
exports.submitReview = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const HONORS_PER_REVIEW = 20;
exports.submitReview = functions.region('us-central1').https.onCall(async (data, context) => {
    const reviewerUid = context.auth?.uid;
    if (!reviewerUid)
        throw new functions.https.HttpsError("unauthenticated", "Sign in required");
    const { missionId, participationId, submitterId, taskId, rating, commentLink } = data || {};
    if (!missionId || !participationId || !submitterId || !taskId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required ids");
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
        throw new functions.https.HttpsError("invalid-argument", "Rating must be 1–5");
    }
    if (typeof commentLink !== "string" || (!commentLink.includes("twitter.com") && !commentLink.includes("x.com"))) {
        throw new functions.https.HttpsError("invalid-argument", "Link must be from Twitter or X");
    }
    // Fetch user's Twitter handle for validation
    const userRef = db.collection("users").doc(reviewerUid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
        throw new functions.https.HttpsError("not-found", "User profile not found");
    }
    const userData = userSnap.data();
    const twitterUsername = userData.twitter_handle || userData.twitterUsername;
    if (!twitterUsername) {
        throw new functions.https.HttpsError("invalid-argument", "Twitter handle not found in profile. Please update your profile first.");
    }
    // Enhanced link validation - matches client-side parsing
    const X_LINK_RX = /^(?:https?:\/\/)?(?:www\.)?(?:mobile\.)?(?:x\.com|twitter\.com)\/([A-Za-z0-9_]{1,15})\/status\/(\d+)/i;
    function parseTweetUrl(url) {
        const m = (url ?? '').trim().match(X_LINK_RX);
        if (!m)
            return null;
        return { handle: m[1].toLowerCase(), tweetId: m[2] };
    }
    const parsed = parseTweetUrl(commentLink);
    if (!parsed) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid X/Twitter link.");
    }
    const reviewerHandle = (twitterUsername ?? '').replace(/^@/, '').toLowerCase();
    if (!reviewerHandle) {
        throw new functions.https.HttpsError("failed-precondition", "No Twitter handle on profile.");
    }
    // Enforce handle match
    if (parsed.handle !== reviewerHandle) {
        throw new functions.https.HttpsError("failed-precondition", `Handle mismatch. Profile: @${reviewerHandle}, Link: @${parsed.handle}.`);
    }
    // Build deterministic keys
    const submissionKey = `${participationId}:${taskId}:${submitterId}`;
    const reviewKey = `${submissionKey}:${reviewerUid}`;
    // References for the transaction
    const reviewRef = db.doc(`reviews/${reviewKey}`);
    const aggRef = db.doc(`submission_reviews/${submissionKey}`);
    const submitterRef = db.doc(`users/${submitterId}`);
    const reviewerStatsRef = db.doc(`users/${reviewerUid}/stats/summary`);
    return db.runTransaction(async (tx) => {
        // 1) Block duplicates: if this reviewer already reviewed, bail
        const existing = await tx.get(reviewRef);
        if (existing.exists) {
            throw new functions.https.HttpsError("already-exists", "You already reviewed this submission");
        }
        // 2) Load/create the submission aggregate
        const aggSnap = await tx.get(aggRef);
        const agg = aggSnap.exists ? aggSnap.data() : {
            reviewersCount: 0,
            ratingSum: 0,
            reviewerUids: {},
            closed: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        // If already closed, block
        if (agg.closed || agg.reviewersCount >= 3) {
            throw new functions.https.HttpsError("failed-precondition", "This submission has enough reviews");
        }
        // 3) Write the individual review
        tx.set(reviewRef, {
            submissionKey,
            reviewerUid,
            submitterId,
            participationId,
            taskId,
            missionId,
            rating,
            commentLink,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // 4) Update the submission aggregate
        const reviewersCount = agg.reviewersCount + 1;
        const ratingSum = agg.ratingSum + rating;
        const closed = reviewersCount >= 3;
        tx.set(aggRef, {
            reviewersCount,
            ratingSum,
            closed,
            reviewerUids: { ...(agg.reviewerUids || {}), [reviewerUid]: true },
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // 5) If this submission just closed (i.e., reached 3), push its final average to submitter profile
        if (closed) {
            const submissionAvg = ratingSum / reviewersCount;
            // Persist the final avg on the submission aggregate too (handy for audit/reads)
            tx.set(aggRef, { submissionAvg }, { merge: true });
            // Profile-wide: "average of submission averages"
            tx.set(submitterRef, {
                submissionRatings: {
                    count: admin.firestore.FieldValue.increment(1),
                    sum: admin.firestore.FieldValue.increment(submissionAvg),
                }
            }, { merge: true });
        }
        // 6) Update reviewer's stats (existing logic for backward compatibility)
        tx.set(reviewerStatsRef, {
            reviewsDone: admin.firestore.FieldValue.increment(1),
            totalEarned: admin.firestore.FieldValue.increment(HONORS_PER_REVIEW),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return { ok: true, credits: HONORS_PER_REVIEW };
    });
});
