'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthUser } from './useAuthUser';
import { useApi } from './useApi';

/**
 * MY MISSIONS HOOK - STABLE UID-BASED QUERIES
 *
 * This hook demonstrates the correct pattern for user-scoped React Query usage:
 * - Query key includes authUser.uid for stable caching
 * - Enabled only when uid is available and auth is ready
 * - Always refetches on mount to ensure fresh data
 * - Uses uncached API calls to prevent stale data
 *
 * All user-scoped queries must follow this pattern to prevent data reset issues.
 */

interface Mission {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    status: 'active' | 'completed' | 'cancelled' | 'draft';
    participants_count: number;
    submissions_count: number;
    max_participants?: number;
    cap?: number;
    total_cost_honors?: number;
    rewards?: {
        honors: number;
        usd: number;
    };
    requirements: string[];
    deliverables?: string[];
    deadline?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    // Legacy fields for backward compatibility
    platform?: string;
    type?: string;
    model?: string;
    participants?: number;
    maxParticipants?: number;
    submissions?: any[]; // Added for inline submissions
    // Additional fields for clicks calculation
    tasks_done?: number;
    verified_clicks?: number;
    verifiedCount?: number;
    verifications_count?: number;
    stats?: {
        verified_tasks_total?: number;
    };
    submissions_verified_tasks?: number;
    clicks?: number;
    tasks?: any[];
}

interface UseMyMissionsReturn {
    data: Mission[] | null;
    isLoading: boolean;
    error: any;
    refetch: () => void;
    authReady: boolean;
}

export function useMyMissions(): UseMyMissionsReturn {
    const { user: authUser, ready } = useAuthUser();
    const api = useApi();

    const enabled = ready && !!authUser?.uid;

    const query = useQuery<Mission[]>({
        enabled,
        queryKey: ['missions', 'owner', authUser?.uid], // KEYED BY UID (not displayName)
        queryFn: async (): Promise<Mission[]> => {
            if (!authUser?.uid) {
                throw new Error('User not authenticated');
            }

            try {
                // Get all missions and filter by created_by
                // TODO: Optimize with server-side filtering - expose getMissionsByOwner(uid) API endpoint
                // to reduce payload size and improve TTFB instead of client-side filtering
                const allMissions = await api.getMissions();

                const userMissions = Array.isArray(allMissions)
                    ? allMissions.filter(mission => mission.created_by === authUser.uid)
                    : [];

                return userMissions;
            } catch (error) {
                throw error;
            }
        },
        retry: false,             // avoid spinner loops
        refetchOnMount: 'always', // Always refetch on mount
        staleTime: 30 * 1000, // 30 seconds for real-time feel
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true, // Refetch when user returns to tab
        // Pause refetch when tab is hidden to avoid unnecessary work
        refetchInterval: () => (document.visibilityState === 'visible' ? 60 * 1000 : false),
        // Keep previous data during refetch to prevent card flicker (TanStack v5)
        placeholderData: (prev) => prev,
    });

    return {
        data: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        authReady: ready,
    };
}
