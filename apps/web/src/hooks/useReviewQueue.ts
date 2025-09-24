import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, limit, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthUser } from "@/hooks/useAuthUser";

type Participation = {
    id: string;
    user_id: string;
    mission_id: string;
    status: 'completed' | 'active' | 'rejected';
    reviewed_by?: Record<string, boolean>;
    submitted_at?: any; // Timestamp
    latest_submission_link?: string;
    user_social_handle?: string;
    createdAt?: any;
};

const PAGE_SIZE = 25; // pull a small batch, then client-filter

export function useReviewQueue() {
    const { user } = useAuthUser();
    const uid = user?.uid;

    return useQuery({
        queryKey: ["review-queue", uid],
        enabled: !!uid,
        retry: false,
        queryFn: async () => {
            if (!uid) return null;

            // 1) Query only what Firestore can do efficiently
            //    status == 'completed' and ordered by submitted_at
            const colRef = collection(db, "mission_participations");
            const q = query(
                colRef,
                where("status", "==", "completed"),        // ✅ match your real schema
                orderBy("submitted_at", "asc"),            // ✅ needs index: status+submitted_at
                limit(PAGE_SIZE)
            );

            const snap = await getDocs(q);

            // 2) Client-side filters Firestore can't do:
            //    - exclude your own participations
            //    - exclude ones you already reviewed
            const rows = snap.docs.map(d => ({ ...(d.data() as Participation), id: d.id }));
            
            // Debug probe to identify filtering stage
            const rows0 = rows; // raw page
            const rows1 = rows0.filter(p => p.status === 'completed');
            const rows2 = rows1.filter(p => !!p.submitted_at); // has timestamp we order by
            const rows3 = rows2.filter(p => p.user_id !== uid); // exclude self
            const rows4 = rows3.filter(p => !(p.reviewed_by && p.reviewed_by[uid])); // not already reviewed

            // TEMP debug
            if (typeof window !== 'undefined') {
                (window as any).__reviewDebug = {
                    total: rows0.length,
                    completed: rows1.length,
                    hasSubmittedAt: rows2.length,
                    notSelf: rows3.length,
                    notReviewed: rows4.length,
                    sample: rows0.slice(0, 3),
                    uid: uid
                };
                console.log('[review-queue] counts', (window as any).__reviewDebug);
            }

            // 3) Return first eligible; null when none
            if (rows4.length === 0) return null;

            const participation = rows4[0];

            // Get mission details for the first eligible participation
            const missionRef = doc(db, "missions", participation.mission_id);
            const mission = (await getDoc(missionRef)).data() as any | undefined;

            return {
                participationId: participation.id,
                missionId: participation.mission_id,
                submitterId: participation.user_id,
                missionLink: mission?.original_link ?? mission?.tweet_url ?? "",
                submissionLink: participation.latest_submission_link ?? "",
                submitterHandle: participation.user_social_handle ?? "",
                createdAgo: participation.createdAt?.toDate?.() ?? null
            };
        }
    });
}
