import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const HONORS_PER_REVIEW = 20;

export const submitReview = functions.https.onCall(async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid) throw new functions.https.HttpsError("unauthenticated", "Login required");

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
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
        throw new functions.https.HttpsError("not-found", "User profile not found");
    }
    const userData = userSnap.data() as any;
    const twitterUsername = userData.twitter_handle || userData.twitterUsername;

    if (!twitterUsername) {
        throw new functions.https.HttpsError("invalid-argument", "Twitter handle not found in profile. Please update your profile first.");
    }

    // Enhanced link validation - matches Discover & Earn behavior
    const link = commentLink?.trim();
    const handle = twitterUsername?.replace(/^@/, ''); // Remove @ if present
    const domainOk = /(^https?:\/\/)?(twitter\.com|x\.com)\//i.test(link);
    const handleOk = handle && new RegExp(`/(?:${handle})(/|$)`, 'i').test(link);

    if (!domainOk) {
        throw new functions.https.HttpsError("invalid-argument", "Link must be from twitter.com or x.com");
    }
    if (!handleOk) {
        throw new functions.https.HttpsError("invalid-argument", `Link must match your Twitter username (@${handle})`);
    }

    const partRef = db.collection("mission_participations").doc(participationId);
    const userStatsRef = db.doc(`users/${uid}/stats/summary`);

    // Use deterministic review key: participationId:taskId:submitterUid:reviewerUid
    const reviewKey = `${participationId}:${taskId}:${submitterId}:${uid}`;
    const reviewRef = db.collection("reviews").doc(reviewKey);

    return db.runTransaction(async (tx) => {
        // Check if already reviewed using the deterministic key
        const reviewSnap = await tx.get(reviewRef);
        if (reviewSnap.exists) {
            throw new functions.https.HttpsError("already-exists", "You already reviewed this submission");
        }

        const partSnap = await tx.get(partRef);
        if (!partSnap.exists) throw new functions.https.HttpsError("not-found", "Participation not found");

        // write review using deterministic key
        tx.set(reviewRef, {
            mission_id: missionId,
            participation_id: participationId,
            task_id: taskId,
            submitter_id: submitterId,
            reviewer_id: uid,
            rating,
            comment_link: commentLink,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // mark reviewed_by.uid = true (keep existing logic for backward compatibility)
        tx.set(partRef, {
            reviewed_by: { [uid]: true },
            reviews: { [reviewKey]: true }
        }, { merge: true });

        // increment stats
        tx.set(userStatsRef, {
            reviewsDone: admin.firestore.FieldValue.increment(1),
            totalEarned: admin.firestore.FieldValue.increment(HONORS_PER_REVIEW),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        return { ok: true, credits: HONORS_PER_REVIEW };
    });
});
