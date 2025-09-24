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
            const unreviewed = snap.docs
                .map(d => ({ ...(d.data() as Participation), id: d.id }))
                .filter(p =>
                    p.user_id !== uid &&                      // exclude self
                    !(p.reviewed_by && p.reviewed_by[uid])    // exclude already reviewed
                );

            // 3) Return first eligible; null when none
            if (unreviewed.length === 0) return null;

            const participation = unreviewed[0];
            
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
