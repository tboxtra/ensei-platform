import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, limit, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthUser } from "@/hooks/useAuthUser";

export function useReviewQueue() {
    const { user } = useAuthUser();
    const uid = user?.uid;

    return useQuery({
        queryKey: ["review-queue", uid],
        enabled: !!uid,
        retry: false,
        queryFn: async () => {
            if (!uid) return null;

            const q = query(
                collection(db, "mission_participations"),
                where("status", "==", "completed"),
                limit(10)
            );
            const snap = await getDocs(q);

            // pick first candidate not reviewed_by[uid]
            for (const s of snap.docs) {
                const d = s.data() as any;
                if (!(d.reviewed_by && d.reviewed_by[uid])) {
                    const missionRef = doc(db, "missions", d.mission_id);
                    const mission = (await getDoc(missionRef)).data() as any | undefined;

                    return {
                        participationId: s.id,
                        missionId: d.mission_id,
                        submitterId: d.user_id,
                        missionLink: mission?.original_link ?? mission?.tweet_url ?? "",
                        submissionLink: d.latest_submission_link ?? "",
                        submitterHandle: d.user_social_handle ?? "",
                        createdAgo: d.createdAt?.toDate?.() ?? null
                    };
                }
            }
            return null; // no pending reviews
        }
    });
}
