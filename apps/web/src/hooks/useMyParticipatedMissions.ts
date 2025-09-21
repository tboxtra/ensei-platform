'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthUser } from './useAuthUser';
import { getAllUserTaskCompletions } from '../lib/task-completion';

/**
 * Hook to get missions that the user has participated in (completed tasks)
 * This is different from useMyMissions which shows missions the user created
 */
export function useMyParticipatedMissions() {
    const { user: authUser, ready } = useAuthUser();

    const enabled = ready && !!authUser?.uid;

    const query = useQuery({
        enabled,
        queryKey: ['missions', 'participated', authUser?.uid],
        queryFn: async () => {
            if (!authUser?.uid) {
                throw new Error('User not authenticated');
            }

            console.log('useMyParticipatedMissions: Fetching participated missions for user:', authUser.uid);

            try {
                // Get all task completions for the user
                const taskCompletions = await getAllUserTaskCompletions(authUser.uid);
                console.log('useMyParticipatedMissions: Got task completions:', taskCompletions.length);

                // Extract unique mission IDs from task completions
                const missionIds = Array.from(new Set(taskCompletions.map(completion => completion.missionId)));
                console.log('useMyParticipatedMissions: Unique mission IDs:', missionIds);

                // For now, return the mission IDs and task completions
                // In a real implementation, you might want to fetch full mission details
                return {
                    missionIds,
                    taskCompletions,
                    // Group completions by mission
                    missionsWithCompletions: missionIds.map(missionId => ({
                        missionId,
                        completions: taskCompletions.filter(completion => completion.missionId === missionId)
                    }))
                };
            } catch (error) {
                console.error('useMyParticipatedMissions: Failed to fetch participated missions:', error);
                throw error;
            }
        },
        refetchOnMount: 'always',
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    });

    return {
        data: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        authReady: ready,
    };
}
