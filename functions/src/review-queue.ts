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
    // Submission (user's link)
    submissionUrl: string;
    submissionTweetId?: string | null;
    submissionHandle?: string | null;
    // Mission (original)
    missionUrl?: string | null;
    missionTweetId?: string | null;
    missionHandle?: string | null;
    createdAt?: any;
};

// Robust URL parsing for twitter.com and x.com
const X_LINK_RX = /^(?:https?:\/\/)?(?:www\.)?(?:mobile\.)?(?:x\.com|twitter\.com)\/([A-Za-z0-9_]{1,15})\/status\/(\d+)/i;

function parseTweetUrl(url: string | null | undefined) {
    const m = (url ?? '').trim().match(X_LINK_RX);
    if (!m) return null;
    return { handle: m[1].toLowerCase(), tweetId: m[2] };
}

function parseHandle(url?: string | null) {
    const m = (url ?? '').match(X_LINK_RX);
    return m ? m[1].toLowerCase() : null;
}

function parseTweetId(url?: string | null) {
    const m = (url ?? '').match(X_LINK_RX);
    return m ? m[2] : null;
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

                // ✅ candidate found - now fetch mission data
                let missionUrl = null;
                let missionTweetId = null;
                let missionHandle = null;

                try {
                    // Fetch mission to show "Original Mission"
                    const missionSnap = await db.collection('missions').doc(p.mission_id).get();
                    const m = missionSnap.exists ? missionSnap.data() as any : null;

                    // Use the same field resolution pattern as the client components
                    missionUrl = m?.tweetLink || m?.contentLink || m?.link || m?.tweet_link || m?.content_link || null;

                    // Debug logging for mission URL resolution
                    console.log(`[getReviewQueue] Mission ${p.mission_id} URL resolution:`, {
                        tweetLink: m?.tweetLink,
                        contentLink: m?.contentLink,
                        link: m?.link,
                        tweet_link: m?.tweet_link,
                        content_link: m?.content_link,
                        resolvedUrl: missionUrl
                    });

                    // Parse handle/tweet id if present
                    const parsedMission = missionUrl ? parseTweetUrl(missionUrl) : null;
                    if (parsedMission) {
                        missionHandle = parsedMission.handle;
                        missionTweetId = parsedMission.tweetId;
                    }
                } catch (error) {
                    console.warn('[getReviewQueue] Failed to fetch mission data:', error);
                }

                items.push({
                    participationId: doc.id,
                    missionId: p.mission_id,
                    submitterUid: t.user_id,
                    taskId: t.task_id,
                    // Submission (user's link)
                    submissionUrl: t.url,
                    submissionTweetId: parsed?.tweetId ?? t?.urlValidation?.tweetId ?? null,
                    submissionHandle: parsed?.handle ?? t?.urlValidation?.extractedHandle ?? null,
                    // Mission (original)
                    missionUrl,
                    missionTweetId,
                    missionHandle,
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
