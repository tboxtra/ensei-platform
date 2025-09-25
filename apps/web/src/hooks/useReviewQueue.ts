'use client';
import '@/lib/firebase'; // ensures init even if tree-shaken elsewhere
import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { fns, auth } from "@/lib/firebase";
import { useAuthUser } from "@/hooks/useAuthUser";

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
    // Unique key to detect repeats
    submissionKey: string;
};

export function useReviewQueue(refreshKey = 0, excludeKeys: string[] = []) {
    const { user } = useAuthUser();
    const uid = user?.uid;

    return useQuery({
        queryKey: ["review-queue", uid, refreshKey, excludeKeys.join("|")],
        enabled: !!uid,
        retry: 1,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
        queryFn: async () => {
            if (!uid) return null;

            try {
                // Wait until auth "ready": if currentUser is still undefined, retry shortly
                if (auth.currentUser === undefined) {
                    await new Promise(r => setTimeout(r, 50)); // one tiny tick
                }

                const callable = httpsCallable(fns, 'getReviewQueue');
                const res = await callable({ excludeKeys });
                const raw = (res.data as any)?.item ?? null;
                if (!raw) return null;

                // 🔧 normalize server shapes (supports both `submissionLink` and `submissionUrl`)
                const sUrl = raw.submissionUrl ?? raw.submissionLink ?? null;

                return {
                    participationId: raw.participationId,
                    missionId: raw.missionId,
                    submitterId: raw.submitterUid,        // keep this name for submitReview
                    taskId: raw.taskId,

                    // Mission
                    missionUrl: raw.missionUrl ?? null,
                    missionTweetId: raw.missionTweetId ?? null,
                    missionHandle: raw.missionHandle ?? null,

                    // Submission
                    submissionUrl: sUrl,
                    submissionLink: sUrl,                    // page expects this
                    submissionTweetId: raw.submissionTweetId ?? null,
                    submissionHandle: raw.submissionHandle ?? null,

                    // Unique key
                    submissionKey: `${raw.participationId}:${raw.taskId}:${raw.submitterUid}`,
                };
            } catch (error) {
                console.error('Failed to fetch review queue:', error);
                return null;
            }
        }
    });
}