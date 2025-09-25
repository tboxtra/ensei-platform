import { useQuery } from "@tanstack/react-query";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getFirebaseApp } from "@/lib/firebase";
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
        retry: false,
        staleTime: 15_000,
        queryFn: async () => {
            if (!uid) return null;

            try {
                const app = getFirebaseApp();
                const fns = getFunctions(app, 'us-central1');
                const call = httpsCallable(fns, 'getReviewQueue');
                const res = await call({});
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