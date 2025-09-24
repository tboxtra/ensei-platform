import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Payload = {
    missionId: string;
    participationId: string;
    submitterId: string;
    rating: number;
    commentLink: string;
};

export function useSubmitReview() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Payload) => {
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
