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
exports.submitReview = functions.https.onCall(async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid)
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    const { missionId, participationId, submitterId, rating, commentLink } = data || {};
    if (!missionId || !participationId || !submitterId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required ids");
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
        throw new functions.https.HttpsError("invalid-argument", "Rating must be 1–5");
    }
    if (typeof commentLink !== "string" || (!commentLink.includes("twitter.com") && !commentLink.includes("x.com"))) {
        throw new functions.https.HttpsError("invalid-argument", "Link must be from Twitter or X");
    }
    // Fetch user's Twitter handle for validation
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
        throw new functions.https.HttpsError("not-found", "User profile not found");
    }
    const userData = userSnap.data();
    const twitterUsername = userData.twitter_handle || userData.twitterUsername;
    if (!twitterUsername) {
        throw new functions.https.HttpsError("invalid-argument", "Twitter handle not found in profile. Please update your profile first.");
    }
    // Validate that the link contains the user's Twitter handle
    if (!commentLink.includes(`/${twitterUsername}`)) {
        throw new functions.https.HttpsError("invalid-argument", `Link must match your Twitter username (@${twitterUsername})`);
    }
    const partRef = db.collection("mission_participations").doc(participationId);
    const userStatsRef = db.doc(`users/${uid}/stats/summary`);
    const reviewsRef = db.collection("reviews").doc();
    return db.runTransaction(async (tx) => {
        const partSnap = await tx.get(partRef);
        if (!partSnap.exists)
            throw new functions.https.HttpsError("not-found", "Participation not found");
        const part = partSnap.data();
        // prevent duplicate review
        if (part.reviewed_by && part.reviewed_by[uid]) {
            throw new functions.https.HttpsError("already-exists", "You already reviewed this submission");
        }
        // write review
        tx.set(reviewsRef, {
            mission_id: missionId,
            participation_id: participationId,
            submitter_id: submitterId,
            reviewer_id: uid,
            rating,
            comment_link: commentLink,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // mark reviewed_by.uid = true
        tx.set(partRef, { reviewed_by: { [uid]: true } }, { merge: true });
        // increment stats
        tx.set(userStatsRef, {
            reviewsDone: admin.firestore.FieldValue.increment(1),
            totalEarned: admin.firestore.FieldValue.increment(HONORS_PER_REVIEW),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return { ok: true, credits: HONORS_PER_REVIEW };
    });
});
