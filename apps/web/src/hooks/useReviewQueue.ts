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
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
        retry: 1,
        queryFn: async () => {
            if (!uid) return null;
            if (auth.currentUser === undefined) {
                await new Promise(r => setTimeout(r, 50));
            }
            const callable = httpsCallable(fns, "getReviewQueue");
            const res = await callable({ excludeKeys });
            const raw = (res.data as any)?.item ?? null;
            if (!raw) return null;

            const sUrl = raw.submissionUrl ?? raw.submissionLink ?? null;
            return {
                participationId: raw.participationId,
                missionId: raw.missionId,
                submitterId: raw.submitterUid,
                taskId: raw.taskId,
                missionUrl: raw.missionUrl ?? null,
                missionTweetId: raw.missionTweetId ?? null,
                missionHandle: raw.missionHandle ?? null,
                submissionUrl: sUrl,
                submissionLink: sUrl,
                submissionTweetId: raw.submissionTweetId ?? null,
                submissionHandle: raw.submissionHandle ?? null,
                submissionKey: `${raw.participationId}:${raw.taskId}:${raw.submitterUid}`,
            };
        },
    });
}