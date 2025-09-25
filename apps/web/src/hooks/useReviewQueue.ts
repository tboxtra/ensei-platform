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
  url: string;
  urlHandle?: string | null;
  urlTweetId?: string | null;
};

export function useReviewQueue() {
    const { user } = useAuthUser();
    const uid = user?.uid;

    return useQuery({
        queryKey: ["review-queue", uid],
        enabled: !!uid,
        retry: 1,
        staleTime: 15_000,
        queryFn: async () => {
            if (!uid) return null;

            try {
                // Wait until auth "ready": if currentUser is still undefined, retry shortly
                if (auth.currentUser === undefined) {
                    await new Promise(r => setTimeout(r, 50)); // one tiny tick
                }
                
                const callable = httpsCallable(fns, 'getReviewQueue');
                const res = await callable({});
                const item = (res.data as any)?.item ?? null;
                
                if (!item) return null;

                // Transform the server response to match the expected format
                return {
                    participationId: item.participationId,
                    missionId: item.missionId,
                    submitterId: item.submitterUid,
                    taskId: item.taskId,
                    missionLink: "", // Will be populated by the UI component
                    submissionLink: item.url,
                    submitterHandle: item.urlHandle || "",
                    createdAgo: new Date() // We don't have createdAt in the new format
                };
            } catch (error) {
                console.error('Failed to fetch review queue:', error);
                return null;
            }
        }
    });
}