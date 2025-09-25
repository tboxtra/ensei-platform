import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthUser } from "./useAuthUser";

type Payload = {
    missionId: string;
    participationId: string;
    submitterId: string;
    taskId: string;
    rating: number;
    commentLink: string;
};

// URL parsing for X/Twitter links
const X_URL = /^(?:https?:\/\/)?(?:x\.com|twitter\.com)\/([A-Za-z0-9_]{1,15})\/status\/(\d+)/i;

function parseTweetUrl(url: string) {
    const m = url.trim().match(X_URL);
    if (!m) return null;
    return { handle: m[1].toLowerCase(), tweetId: m[2] };
}

export function useSubmitReview() {
    const qc = useQueryClient();
    const { user } = useAuthUser();

    return useMutation({
        mutationFn: async (payload: Payload) => {
            // Client-side validation
            const parsed = parseTweetUrl(payload.commentLink);
            if (!parsed) {
                throw new Error('Please paste a valid X/Twitter link to your comment.');
            }

            const reviewerHandle = user?.profile?.twitterHandle?.toLowerCase()?.replace(/^@/, '') ?? '';
            if (!reviewerHandle) {
                throw new Error('Please add your Twitter handle in your profile before submitting.');
            }

            if (parsed.handle !== reviewerHandle) {
                throw new Error(`Link handle mismatch. Your profile handle is @${reviewerHandle}, but the link is @${parsed.handle}.`);
            }

            // Proceed with server call
            const call = httpsCallable(functions, "submitReview");
            const res = await call(payload);
            return res.data as { ok: boolean; credits: number };
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["review-queue"] });
            qc.invalidateQueries({ queryKey: ["quick-stats"] });
        }
    });
}
