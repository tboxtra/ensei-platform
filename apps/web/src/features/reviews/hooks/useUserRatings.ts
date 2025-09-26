import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserRatings {
    count: number;
    sum: number;
    avg: number;
}

export function useUserRatings(userId: string | null) {
    return useQuery({
        queryKey: ["user-ratings", userId],
        enabled: !!userId,
        retry: 1,
        staleTime: 30_000, // 30 seconds
        queryFn: async (): Promise<UserRatings | null> => {
            if (!userId) return null;

            try {
                const userRef = doc(db, "users", userId);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    return null;
                }

                const userData = userSnap.data();
                const ratings = userData?.submissionRatings;

                if (!ratings || !ratings.count || !ratings.sum) {
                    return { count: 0, sum: 0, avg: 0 };
                }

                const avg = ratings.sum / ratings.count;
                return {
                    count: ratings.count,
                    sum: ratings.sum,
                    avg: Number(avg.toFixed(2))
                };
            } catch {
                return null;
            }
        }
    });
}
