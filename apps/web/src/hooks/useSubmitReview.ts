import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthUser } from "./useAuthUser";
import { parseTweetUrl } from "@/shared/constants/x";

type Payload = {
    missionId: string;
    participationId: string;
    submitterId: string;
    taskId: string;
    rating: number;
    commentLink: string;
};

// Using shared parser from @/shared/constants/x

export function useSubmitReview() {
    const qc = useQueryClient();
    const { user } = useAuthUser();

    return useMutation({
        mutationFn: async (payload: Payload) => {
            // Client-side validation
            const parsed = parseTweetUrl(payload.commentLink);
            if (!parsed) {
                throw new Error('Please paste a full X/Twitter status link, e.g. https://x.com/<handle>/status/<id>');
            }

            const profileHandle = (user?.twitter_handle ?? '').trim().replace(/^@/, '').toLowerCase();
            if (!profileHandle) {
                throw new Error('Add your Twitter handle to your profile to submit a review.');
            }

            if (parsed.handle !== profileHandle) {
                throw new Error(`Handle mismatch. Your profile is @${profileHandle}, but the link is @${parsed.handle}.`);
            }

            // Proceed with server call
            const call = httpsCallable(functions, "submitReview");
            const res = await call(payload);
            return res.data as { ok: boolean; credits: number };
        },
        onSuccess: async () => {
            // Refresh the queue to get the next item
            const uid = user?.uid;
            if (uid) {
                await qc.invalidateQueries({ queryKey: ["review-queue", uid] });
            }
            qc.invalidateQueries({ queryKey: ["quick-stats"] });
        }
    });
}
