// Review Queue Callable Function
// Fetches reviewable items server-side to bypass Firestore permission issues

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();

type QueueItem = {
  participationId: string;
  missionId: string;
  submitterUid: string;
  taskId: string;                      // like|retweet|comment|quote|follow
  url: string;
  createdAt: string;                   // ISO for UI
  handle: string;                      // extractedHandle (for display)
};

export const getReviewQueue = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'Sign in required');

  const db = admin.firestore();
  
  // Pull a small window, then filter server-side.
  const snap = await db
    .collection('mission_participations')
    .where('status', 'in', ['active', 'completed'])
    .orderBy('created_at', 'desc')
    .limit(50)
    .get();

  // Look up existing review receipts (deterministic key)
  const makeKey = (pId: string, tId: string, submitter: string) =>
    `${pId}:${tId}:${submitter}:${uid}`;

  const items: QueueItem[] = [];

  for (const doc of snap.docs) {
    const p = doc.data() as any;
    const participationId = doc.id;

    // Never review yourself
    if (p.user_id === uid) continue;

    const tasks: any[] = Array.isArray(p.tasks_completed) ? p.tasks_completed : [];
    for (const t of tasks) {
      if (t?.verificationMethod !== 'link') continue;
      if (!t?.url || typeof t.url !== 'string') continue;

      // Accept twitter.com and x.com
      const u = t.url as string;
      try {
        const urlObj = new URL(u);
        const hostOk = /(^|\.)twitter\.com$|(^|\.)x\.com$/.test(urlObj.hostname);
        if (!hostOk) continue;
      } catch {
        // Invalid URL, skip
        continue;
      }

      const handle = t?.urlValidation?.extractedHandle;
      const isValid = t?.urlValidation?.isValid === true;
      if (!handle || !isValid) continue;

      const key = makeKey(participationId, t.task_id, p.user_id);
      const reviewed = await db.collection('reviews').doc(key).get();
      if (reviewed.exists) continue;

      items.push({
        participationId,
        missionId: p.mission_id,
        submitterUid: p.user_id,
        taskId: t.task_id,
        url: u,
        createdAt: (t.created_at?.toDate?.() ?? new Date(t.created_at ?? Date.now())).toISOString(),
        handle
      });

      // Return just one to keep UX "one-at-a-time"
      if (items.length === 1) return { item: items[0] };
    }
  }

  return { item: null };
});
