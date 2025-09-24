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
    reviews?: Record<string, boolean>;
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

            // Helper functions for robust data handling
            const toIso = (v: any) => {
                // supports Firestore Timestamp, JS Date, and ISO strings
                if (!v) return null;
                // Firestore Timestamp
                if (typeof v?.toDate === 'function') return v.toDate().toISOString();
                if (v instanceof Date) return v.toISOString();
                if (typeof v === 'string') return v; // assume ISO-like
                return null;
            };

            const isTwitterUrl = (u?: string) =>
                !!u && /^https?:\/\/(twitter\.com|x\.com)\//i.test(u);

            // Flatten every completed *task* inside each participation
            const allTasks = rows
                .filter(p => ['active', 'completed'].includes(String(p?.status || '').toLowerCase()))
                .flatMap(p => (Array.isArray(p?.tasks_completed) ? p.tasks_completed.map((t: any) => ({ p, t })) : []));

            // Keep only LINK-verification tasks with a usable url
            const linkTasks = allTasks.filter(({ t }) => {
                const method = String(t?.verificationMethod || '').toLowerCase();
                const okLink = isTwitterUrl(t?.url) || !!t?.urlValidation?.isValid;
                return method === 'link' && okLink;
            });

            // Exclude self by the *task* submitter user_id (not the top-level doc)
            // (your sample shows user_id living on each task map)
            const notSelf = linkTasks.filter(({ t }) => t?.user_id && t.user_id !== uid);

            // Exclude tasks already reviewed by this reviewer using deterministic key
            const notReviewed = notSelf.filter(({ p, t }) => {
                const submitter = t?.user_id;
                if (!submitter) return false;
                const reviewKey = `${p.id}:${t.task_id}:${submitter}:${uid}`;
                return !(window as any).__reviewReceipts?.has?.(reviewKey) && !p.reviews?.[reviewKey];
            });

            // Pick the oldest by completed_at (string or Timestamp supported)
            notReviewed.sort((a, b) => {
                const A = toIso(a.t?.completed_at) ?? '9999';
                const B = toIso(b.t?.completed_at) ?? '9999';
                return A.localeCompare(B);
            });

            const next = notReviewed[0];

            // TEMP debug
            if (typeof window !== 'undefined') {
                (window as any).__reviewDebug = {
                    total: rows.length,
                    withTasks: allTasks.length,
                    linkTasks: linkTasks.length,
                    notSelf: notSelf.length,
                    notReviewed: notReviewed.length,
                    sample: notReviewed.slice(0, 2).map(({ p, t }) => ({
                        pid: p.id,
                        taskId: t?.task_id,
                        submitter: t?.user_id,
                        url: t?.url,
                        completed_at: t?.completed_at,
                        urlValidation: t?.urlValidation?.isValid ?? null,
                    })),
                    uid,
                };
                console.log('[review-queue] counts', (window as any).__reviewDebug);
            }

            if (!next) return null;

            // Get mission details for the first eligible task
            const missionRef = doc(db, "missions", next.p.mission_id);
            const mission = (await getDoc(missionRef)).data() as any | undefined;

            return {
                participationId: next.p.id,
                missionId: next.p.mission_id,
                submitterId: next.t.user_id,
                taskId: next.t.task_id,
                missionLink: mission?.original_link ?? mission?.tweet_url ?? "",
                submissionLink: next.t.url,
                submitterHandle: "", // We'll need to get this from user profile
                createdAgo: new Date(toIso(next.t.completed_at) || Date.now())
            };
        }
    });
}