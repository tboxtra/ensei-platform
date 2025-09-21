'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthUser } from './useAuthUser';
import { useApi } from './useApi';
import { getCurrentToken } from '../lib/auth/token';

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

            console.log('useMyMissions: Fetching missions for user:', authUser.uid);

            try {
                // Get fresh token for API call
                const token = await getCurrentToken();
                if (!token) {
                    throw new Error('No authentication token available');
                }

                // Get all missions and filter by created_by
                const allMissions = await api.getMissions();
                console.log('useMyMissions: Got all missions:', allMissions?.length || 0);

                const userMissions = Array.isArray(allMissions)
                    ? allMissions.filter(mission => mission.created_by === authUser.uid)
                    : [];

                console.log('useMyMissions: Filtered user missions:', userMissions.length);
                return userMissions;
            } catch (error) {
                console.error('useMyMissions: Failed to fetch missions:', error);
                throw error;
            }
        },
        refetchOnMount: 'always', // Always refetch on mount
        staleTime: 0, // Always consider data stale
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1, // Fail fast; don't spin forever
    });

    return {
        data: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        authReady: ready,
    };
}
