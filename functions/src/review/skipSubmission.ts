import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const skipSubmission = functions.region("us-central1").https.onCall(async (data, context) => {
    const reviewerUid = context.auth?.uid;
    if (!reviewerUid) throw new functions.https.HttpsError("unauthenticated", "Sign in required");

    const { participationId, taskId, submitterId } = data || {};
    if (!participationId || !taskId || !submitterId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing ids");
    }

    const submissionKey = `${participationId}:${taskId}:${submitterId}`;
    const docId = `${submissionKey}:${reviewerUid}`;

    await db.doc(`review_skips/${docId}`).set({
        submissionKey,
        reviewerUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // (Recommended) enable Firestore TTL on review_skips.createdAt so old skips auto-expire.
    return { ok: true };
});
