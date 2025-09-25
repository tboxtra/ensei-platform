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
};

export const getReviewQueue = functions.region('us-central1').https.onCall(
    async (_data, context): Promise<{ item: QueueItem | null }> => {
        const reviewerUid = context.auth?.uid;
        if (!reviewerUid) {
            throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
        }

        // 1) Fetch a recent window of participations (server-side, Admin SDK)
        //    We DO NOT require submitted_at; we order by created_at as a fallback.
        const snap = await db
            .collection('mission_participations')
            .where('status', 'in', ['active', 'completed'])
            .orderBy('created_at', 'desc')
            .limit(100)
            .get();

        const participations = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        // 2) Flatten tasks and apply task-level filters
        const allTasks = participations.flatMap(p =>
            Array.isArray(p.tasks_completed) ? p.tasks_completed.map((t: any) => ({ p, t })) : []
        );

        const linkTasks = allTasks.filter(({ t }) =>
            t?.verificationMethod === 'link' &&
            typeof t?.url === 'string' &&
            /(^https?:\/\/)?(x\.com|twitter\.com)\//i.test(t.url) &&
            (t?.urlValidation?.isValid === true) // be strict here
        );

        // 3) Exclude self (use the **task** submitter)
        const notSelf = linkTasks.filter(({ t }) => t?.user_id && t.user_id !== reviewerUid);

        // 4) Exclude already-reviewed via deterministic review key
        //    reviews/{participationId}:{taskId}:{submitterUid}:{reviewerUid}
        const results: QueueItem[] = [];
        for (const { p, t } of notSelf) {
            const partId = p.id;
            const taskId = String(t.task_id);
            const submitter = String(t.user_id);
            const reviewKey = `${partId}:${taskId}:${submitter}:${reviewerUid}`;
            const reviewRef = db.collection('reviews').doc(reviewKey);
            const exists = (await reviewRef.get()).exists;
            if (!exists) {
                results.push({
                    participationId: partId,
                    taskId,
                    submitterUid: submitter,
                    missionId: String(p.mission_id ?? ''),
                    url: String(t.url),
                    urlHandle: t?.urlValidation?.extractedHandle ?? null,
                    urlTweetId: t?.urlValidation?.tweetId ?? null,
                });
            }
        }

        // 5) Debug counters to logs for quick triage
        console.log('getReviewQueue counts', {
            totalParts: participations.length,
            totalTasks: allTasks.length,
            linkTasks: linkTasks.length,
            notSelf: notSelf.length,
            notReviewed: results.length,
            reviewerUid,
        });

        return { item: results[0] ?? null };
    }
);
