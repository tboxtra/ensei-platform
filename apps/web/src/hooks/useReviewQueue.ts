import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { useAuthUser } from "@/hooks/useAuthUser";

type QueueItem = {
  participationId: string;
  missionId: string;
  submitterUid: string;
  taskId: string;
  url: string;
  createdAt: string;
  handle: string;
};

export function useReviewQueue() {
    const { user } = useAuthUser();
    const uid = user?.uid;

    return useQuery({
        queryKey: ["review-queue", uid],
        enabled: !!uid,
        retry: false,
        queryFn: async () => {
            if (!uid) return null;

            try {
                const getReviewQueueFn = httpsCallable(functions, 'getReviewQueue');
                const result = (await getReviewQueueFn({})).data as { item: QueueItem | null };
                
                if (!result.item) return null;

                // Transform the server response to match the expected format
                return {
                    participationId: result.item.participationId,
                    missionId: result.item.missionId,
                    submitterId: result.item.submitterUid,
                    taskId: result.item.taskId,
                    missionLink: "", // Will be populated by the UI component
                    submissionLink: result.item.url,
                    submitterHandle: result.item.handle,
                    createdAgo: new Date(result.item.createdAt)
                };
            } catch (error) {
                console.error('Failed to fetch review queue:', error);
                return null;
            }
        }
    });
}