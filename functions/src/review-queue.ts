// Review Queue Callable Function
// Fetches reviewable items server-side to bypass Firestore permission issues

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

type QueueItem = {
  participationId: string;
  taskId: string;
  submitterUid: string;
  missionId: string;
  url: string;
  urlHandle?: string | null;
  urlTweetId?: string | null;
  createdAt?: any;
};

// Robust URL parsing for twitter.com and x.com
function parseTweetUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./i, '').toLowerCase();
    if (host !== 'twitter.com' && host !== 'x.com') return null;

    // /{handle}/status/{tweetId}
    const [, handle, statusLiteral, tweetId] = u.pathname.split('/');
    if (!handle || statusLiteral !== 'status' || !tweetId) return null;

    return { handle, tweetId };
  } catch {
    return null;
  }
}

export const getReviewQueue = functions.region('us-central1').https.onCall(
  async (_data, context): Promise<{ item: QueueItem | null }> => {
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

    const items: QueueItem[] = [];

    for (const doc of partsSnap.docs) {
      const p = doc.data();
      const tasks: any[] = Array.isArray(p.tasks_completed) ? p.tasks_completed : [];
      dbg.totalTasks += tasks.length;

      for (const t of tasks) {
        // Only review completed tasks
        if (t?.status !== 'completed') continue;
        dbg.completedTasks++;

        // Only review LINK tasks
        if (t?.verificationMethod !== 'link') continue;
        dbg.linkTasks++;

        // Exclude self at TASK level
        if (t?.user_id === reviewerUid) continue;
        dbg.notSelf++;

        // URL must be valid x/twitter OR urlValidation.isValid === true
        const parsed = parseTweetUrl(t?.url);
        const urlOK = parsed || t?.urlValidation?.isValid === true;
        if (!urlOK) continue;
        dbg.urlOK++;

        // Check if already reviewed
        const reviewKey = `${doc.id}:${t.task_id}:${t.user_id}:${reviewerUid}`;
        const receiptRef = db.collection('reviews').doc(reviewKey);
        const receipt = await receiptRef.get();
        if (receipt.exists) continue;
        dbg.notReviewed++;

        // ✅ candidate found
        items.push({
          participationId: doc.id,
          missionId: p.mission_id,
          submitterUid: t.user_id,
          taskId: t.task_id,
          url: t.url,
          urlHandle: parsed?.handle ?? t?.urlValidation?.extractedHandle ?? null,
          urlTweetId: parsed?.tweetId ?? t?.urlValidation?.tweetId ?? null,
          createdAt: p.created_at ?? p.updated_at ?? null,
        });

        // Return one-at-a-time
        if (items.length) break;
      }
      if (items.length) break;
    }

    // Debug output
    console.log('[getReviewQueue]', dbg);

    return { item: items[0] ?? null };
  }
);
