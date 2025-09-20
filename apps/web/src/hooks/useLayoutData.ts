'use client';

import { useCombinedUserData } from './useUserDataQuery';
import { useApi } from './useApi';

/**
 * Industry Standard: Centralized layout data hook
 * Provides consistent user data and stats across all layout components
 */
export const useLayoutData = () => {
    const { data: userData, isLoading, error, refetch } = useCombinedUserData();
    const { getMissions, loading: missionsLoading } = useApi();

    // Calculate quick stats from React Query data
    const quickStats = {
        missionsCreated: userData?.stats.missionsCreated || 0,
        missionsCompleted: userData?.stats.missionsCompleted || 0,
        totalEarned: userData?.stats.totalEarned || 0,
        totalSubmissions: userData?.stats.totalSubmissions || 0,
        approvedSubmissions: userData?.stats.approvedSubmissions || 0,
        userRating: userData?.stats.userRating || 0,
        totalReviews: userData?.stats.totalReviews || 0
    };

    // User profile data
    const user = userData?.profile || null;

    return {
        user,
        quickStats,
        isLoading: isLoading || missionsLoading,
        error,
        refetch,
        // Additional data for layout
        isAuthenticated: !!user,
        userDisplayName: user?.name || user?.firstName || 'User',
        userAvatar: user?.avatar || null,
        userEmail: user?.email || null
    };
};
