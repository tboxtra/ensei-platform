import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';
import { useUserStore } from '../store/userStore';

export function useUserStats() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user } = useUserStore();
  
  const enabled = !!user?.id;

  const query = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        // Fetch missions to calculate stats
        const allMissions = await api.getMissions();
        const userId = user.id;

        // Calculate missions created
        const userMissions = Array.isArray(allMissions)
          ? allMissions.filter(mission => mission.created_by === userId)
          : [];
        const missionsCreated = userMissions.length;

        // Calculate USD spent on created missions
        const usdSpent = userMissions.reduce((total, mission: any) => {
          if (mission.rewards?.usd) return total + mission.rewards.usd;
          if (mission.total_cost_usd) return total + mission.total_cost_usd;
          if (mission.total_cost_honors) return total + (mission.total_cost_honors / 450);
          return total;
        }, 0);

        // Calculate honors earned from participated missions
        const participatedMissions = Array.isArray(allMissions)
          ? allMissions.filter(mission =>
            mission.participants &&
            Array.isArray(mission.participants) &&
            mission.participants.some((p: any) => p.user_id === userId)
          )
          : [];

        const honorsEarned = participatedMissions.reduce((total, mission: any) => {
          const participant = mission.participants?.find((p: any) => p.user_id === userId);
          return total + (participant?.honors_earned || 0);
        }, 0);

        const missionsCompleted = participatedMissions.filter((mission: any) =>
          mission.status === 'completed' || mission.status === 'ended'
        ).length;

        // Get wallet balance
        let walletBalance = { honors: 0, usd: 0 };
        try {
          walletBalance = await api.getWalletBalance();
        } catch (err) {
          console.log('Could not load wallet balance:', err);
        }

        return {
          missionsCreated,
          missionsCompleted,
          honorsEarned,
          usdSpent,
          usdBalance: walletBalance.usd || 0,
          totalHonors: walletBalance.honors || 0,
          pendingReviews: 0, // TODO: Implement pending reviews count
          reviewsDone: 0, // TODO: Implement reviews done count
        };
      } catch (error) {
        console.error('Error calculating user stats:', error);
        throw error;
      }
    },
    enabled,
    staleTime: 60_000, // 1 minute
    cacheTime: 5 * 60_000, // 5 minutes
    refetchOnWindowFocus: false,
    structuralSharing: true,
  });

  // Update store when data changes
  React.useEffect(() => {
    if (query.data) {
      useUserStore.getState().setStats(query.data);
    }
  }, [query.data]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['user-stats', user?.id] }),
  };
}

