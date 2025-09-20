'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';

// Query keys for consistent caching
export const userDataKeys = {
    all: ['userData'] as const,
    profile: () => [...userDataKeys.all, 'profile'] as const,
    ratings: () => [...userDataKeys.all, 'ratings'] as const,
    combined: () => [...userDataKeys.all, 'combined'] as const,
};

// Combined user data interface
export interface CombinedUserData {
    profile: any;
    ratings: any | null;
    stats: {
        missionsCreated: number;
        missionsCompleted: number;
        totalEarned: number;
        totalSubmissions: number;
        approvedSubmissions: number;
        reputation: number;
        userRating: number;
        totalReviews: number;
    };
}

/**
 * Industry Standard: React Query hook for user profile data
 * Features:
 * - Automatic background refetching
 * - Stale-while-revalidate caching
 * - Optimistic updates
 * - Built-in loading and error states
 */
export const useUserProfile = () => {
    const { getUserProfile } = useApi();

    return useQuery({
        queryKey: userDataKeys.profile(),
        queryFn: async () => {
            const data = await getUserProfile();
            console.log('🔍 React Query: Fetched user profile from Firebase:', data);
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Industry Standard: React Query hook for user ratings data
 */
export const useUserRatings = () => {
    const { getUserRatings } = useApi();

    return useQuery({
        queryKey: userDataKeys.ratings(),
        queryFn: async () => {
            const data = await getUserRatings();
            console.log('🔍 React Query: Fetched user ratings from Firebase:', data);
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * Industry Standard: Combined user data hook
 * Merges profile and ratings data with proper statistics calculation
 */
export const useCombinedUserData = (): {
    data: CombinedUserData | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
} => {
    const profileQuery = useUserProfile();
    const ratingsQuery = useUserRatings();

    const isLoading = profileQuery.isLoading || ratingsQuery.isLoading;
    const error = profileQuery.error || ratingsQuery.error;

    // Combine data when at least profile data is available
    const combinedData: CombinedUserData | undefined =
        profileQuery.data
            ? {
                profile: profileQuery.data,
                ratings: ratingsQuery.data || null,
                stats: {
                    // Industry Standard: Unified camelCase schema
                    missionsCreated: profileQuery.data.stats?.missionsCreated || 0,
                    missionsCompleted: profileQuery.data.stats?.missionsCompleted || 0,
                    totalEarned: profileQuery.data.stats?.totalHonorsEarned || 0,
                    totalSubmissions: ratingsQuery.data?.totalSubmissions || 0,
                    approvedSubmissions: profileQuery.data.approvedSubmissions || 0,
                    reputation: profileQuery.data.reputation || 0,
                    userRating: ratingsQuery.data?.totalRating || 0,
                    totalReviews: ratingsQuery.data?.totalReviews || 0,
                }
            }
            : undefined;

    // Debug logging for statistics calculation
    if (combinedData) {
        console.log('🔍 React Query: Combined user data calculated:', {
            profileStats: profileQuery.data.stats,
            ratingsData: ratingsQuery.data,
            calculatedStats: combinedData.stats
        });
    }

    const refetch = () => {
        profileQuery.refetch();
        ratingsQuery.refetch();
    };

    return {
        data: combinedData,
        isLoading,
        error: error as Error | null,
        refetch,
    };
};

/**
 * Industry Standard: Mutation for updating user profile
 * Features optimistic updates and automatic cache invalidation
 */
export const useUpdateUserProfile = () => {
    const { updateProfile } = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProfile,
        onMutate: async (newData) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: userDataKeys.profile() });

            // Snapshot previous value
            const previousData = queryClient.getQueryData(userDataKeys.profile());

            // Optimistically update cache
            queryClient.setQueryData(userDataKeys.profile(), (old: any) => ({
                ...old,
                ...newData,
                updated_at: new Date().toISOString(),
            }));

            return { previousData };
        },
        onError: (err, newData, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(userDataKeys.profile(), context.previousData);
            }
        },
        onSettled: () => {
            // Industry Standard: Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: userDataKeys.profile() });
            queryClient.invalidateQueries({ queryKey: userDataKeys.ratings() });
            queryClient.invalidateQueries({ queryKey: userDataKeys.combined() });
        },
    });
};

/**
 * Industry Standard: Mission creation mutation with proper cache invalidation
 * Ensures user stats update immediately after mission creation
 */
export const useCreateMission = () => {
    const { createMission } = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createMission,
        onSuccess: () => {
            // Industry Standard: Invalidate user data cache after mission creation
            queryClient.invalidateQueries({ queryKey: userDataKeys.profile() });
            queryClient.invalidateQueries({ queryKey: userDataKeys.combined() });
            console.log('🎯 Mission created - cache invalidated for user stats update');
        },
        onError: (error) => {
            console.error('Mission creation failed:', error);
        },
    });
};

/**
 * Industry Standard: Task completion mutation with proper cache invalidation
 * Ensures user stats update immediately after task completion
 */
export const useCompleteTask = () => {
    const { completeTask } = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            missionId: string;
            taskId: string;
            actionId: string;
            verificationData?: any;
            platform?: string;
            missionType?: string;
        }) => {
            return completeTask(
                params.missionId,
                params.taskId,
                params.actionId,
                params.verificationData,
                params.platform,
                params.missionType
            );
        },
        onSuccess: () => {
            // Industry Standard: Invalidate user data cache after task completion
            queryClient.invalidateQueries({ queryKey: userDataKeys.profile() });
            queryClient.invalidateQueries({ queryKey: userDataKeys.combined() });
            console.log('🎯 Task completed - cache invalidated for user stats update');
        },
        onError: (error) => {
            console.error('Task completion failed:', error);
        },
    });
};
