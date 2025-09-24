import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, limit, query, where, orderBy, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthUser } from "@/hooks/useAuthUser";

type TaskEntry = {
    task_id: string;
    status: 'completed' | 'pending' | string;
    verificationMethod?: 'link' | 'direct' | string;
    url?: string | null;
    urlValidation?: { isValid?: boolean } | null;
    user_id?: string; // submitter
    completed_at?: Timestamp | string | null;
};

type Participation = {
    id: string;
    mission_id: string;
    user_id?: string;
    status: 'active' | 'completed' | string;
    tasks_completed?: TaskEntry[];
    created_at?: any;
};

const isTwitterUrl = (u?: string | null) =>
    !!u && /(https?:\/\/)?(twitter\.com|x\.com)\//i.test(u);

const toMillis = (v: any) =>
    v?.toMillis ? v.toMillis() : (typeof v === 'string' ? Date.parse(v) : 0);

export function useReviewQueue() {
    const { user } = useAuthUser();
    const uid = user?.uid;

    return useQuery({
        queryKey: ["review-queue", uid],
        enabled: !!uid,
        retry: false,
        queryFn: async () => {
            if (!uid) return null;

            // 1) Get a reasonable slice; do NOT predicate on fields that aren't in your docs
            // Try with orderBy; fall back to no-orderBy if it fails (mixed field types)
            let snap;
            try {
                snap = await getDocs(
                    query(
                        collection(db, 'mission_participations'),
                        where('status', 'in', ['active', 'completed']),
                        orderBy('created_at', 'desc'),
                        limit(50)
                    )
                );
            } catch {
                // fallback when mixed / missing created_at
                snap = await getDocs(
                    query(
                        collection(db, 'mission_participations'),
                        where('status', 'in', ['active', 'completed']),
                        limit(50)
                    )
                );
            }
            const rows: Participation[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

            // Debug probe to identify filtering stage
            const rows0 = rows; // raw participations
            const rows1 = rows0.filter(p => ['active', 'completed'].includes(p.status));
            const rows2 = rows1.filter(p => p.tasks_completed && p.tasks_completed.length > 0);

            // 2) Flatten reviewable task entries
            const tasks = rows2.flatMap(p =>
                (p.tasks_completed || []).map(t => ({ p, t }))
            );

            // 3) Filter to link-based, completed, valid X/Twitter URLs
            const linkTasks = tasks.filter(({ t }) =>
                t.status === 'completed' &&
                t.verificationMethod === 'link' &&
                isTwitterUrl(t.url) &&
                (t.urlValidation?.isValid ?? true)
            );

            // 4) Exclude the current user's own tasks
            const notSelf = linkTasks.filter(({ t }) => (t.user_id ?? '') !== uid);

            // 5) Exclude already reviewed (uses deterministic review key)
            //    Key: participationId:taskId:submitterUid
            const results: {
                participationId: string;
                mission_id: string;
                submitterUid: string;
                taskId: string;
                url: string;
                completedAtMs: number;
                reviewKey: string;
            }[] = [];

            for (const { p, t } of notSelf) {
                const submitter = t.user_id ?? 'unknown';
                const reviewKey = `${p.id}:${t.task_id}:${submitter}`;

                // you can store review receipts at reviews/{reviewKey}
                const rDoc = await getDoc(doc(db, 'reviews', reviewKey));
                if (rDoc.exists()) continue;

                results.push({
                    participationId: p.id,
                    mission_id: p.mission_id,
                    submitterUid: submitter,
                    taskId: t.task_id!,
                    url: t.url!,
                    completedAtMs: toMillis(t.completed_at),
                    reviewKey,
                });
            }

            // sort oldest first
            results.sort((a, b) => a.completedAtMs - b.completedAtMs);

            // TEMP debug
            if (typeof window !== 'undefined') {
                (window as any).__reviewDebug = {
                    total: rows0.length,
                    withValidStatus: rows1.length,
                    withTasks: rows2.length,
                    totalTasks: tasks.length,
                    linkTasks: linkTasks.length,
                    notSelf: notSelf.length,
                    notReviewed: results.length,
                    sample: rows0.slice(0, 3),
                    uid: uid
                };
                console.log('[review-queue] counts', (window as any).__reviewDebug);
            }

            // return the next one
            if (results.length === 0) return null;

            const result = results[0];

            // Get mission details for the first eligible task
            const missionRef = doc(db, "missions", result.mission_id);
            const mission = (await getDoc(missionRef)).data() as any | undefined;

            return {
                participationId: result.participationId,
                missionId: result.mission_id,
                submitterId: result.submitterUid,
                taskId: result.taskId,
                missionLink: mission?.original_link ?? mission?.tweet_url ?? "",
                submissionLink: result.url,
                submitterHandle: "", // We'll need to get this from user profile
                createdAgo: new Date(result.completedAtMs)
            };
        }
    });
}