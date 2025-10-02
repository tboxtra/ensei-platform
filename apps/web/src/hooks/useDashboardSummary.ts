'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthUser } from './useAuthUser';
import { useApi } from './useApi';

export interface DashboardSummary {
    missionsCreated: number;
    missionsCompleted: number;
    tasksDone: number;
    honorsEarned: number;
    usdSpent: number;
    usdBalance: number;
    lastUpdated: string;
}

interface UseDashboardSummaryReturn {
    summary: DashboardSummary | null;
    isLoading: boolean;
    error: any;
    refetch: () => void;
    authReady: boolean;
}

/**
 * Dashboard Summary Hook - Single Source of Truth
 * 
 * Fetches authoritative dashboard metrics from the server to avoid
 * race conditions and client-side filtering inconsistencies.
 * 
 * Metrics computed server-side:
 * - Missions Created: missions where ownerId === currentUserId and status ∈ {'draft','active','completed','paused'} (exclude hard-deleted)
 * - Missions Completed: owner's missions where status === 'completed'
 * - Tasks Done: number of approved submissions the current user (as a participant) completed
 * - Total Earned: sum of honors earned by the current user from verified submissions
 * - USD Spent: sum of USD spent by the user on missions
 * - USD Balance: current user balance
 */
export function useDashboardSummary(): UseDashboardSummaryReturn {
    const { user: authUser, ready } = useAuthUser();
    const api = useApi();

    const enabled = ready && !!authUser?.uid;

    const query = useQuery<DashboardSummary>({
        enabled,
        queryKey: ['dashboard', 'summary', authUser?.uid],
        queryFn: async (): Promise<DashboardSummary> => {
            if (!authUser?.uid) {
                throw new Error('User not authenticated');
            }

            try {
                // Acquire token (same strategy as useApi)
                const token =
                    (typeof window !== 'undefined' && localStorage.getItem('firebaseToken')) ||
                    (await (async () => {
                        try {
                            const { getFirebaseAuth } = await import('../lib/firebase');
                            const a = getFirebaseAuth();
                            const u = a.currentUser;
                            return u ? await u.getIdToken(false) : null;
                        } catch {
                            return null;
                        }
                    })());

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/v1/dashboard/summary`, {
                    headers: {
                        ...(token && { 'Authorization': `Bearer ${token}` }),
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`Dashboard summary failed: ${response.status}`);
                }

                const data = await response.json();
                console.log('📊 Dashboard summary fetched:', data);
                return data;
            } catch (error) {
                console.error('Failed to fetch dashboard summary:', error);
                throw error;
            }
        },
        retry: false,
        refetchOnMount: 'always',
        staleTime: 30 * 1000, // 30 seconds for real-time feel
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true,
        // Keep previous data during refetch to prevent flicker
        placeholderData: (prev) => prev,
    });

    return {
        summary: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        authReady: ready,
    };
}
