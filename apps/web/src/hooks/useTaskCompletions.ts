/**
 * Custom hooks for task completion management
 * Following standard practices for server state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMissionTaskCompletions, 
  completeTask, 
  flagTaskCompletion, 
  verifyTaskCompletion,
  type TaskCompletion 
} from '@/lib/task-verification';

// Query keys for consistent caching
export const taskCompletionKeys = {
  all: ['taskCompletions'] as const,
  mission: (missionId: string) => [...taskCompletionKeys.all, 'mission', missionId] as const,
  user: (userId: string) => [...taskCompletionKeys.all, 'user', userId] as const,
  missionUser: (missionId: string, userId: string) => [...taskCompletionKeys.all, 'mission', missionId, 'user', userId] as const,
};

/**
 * Hook to fetch task completions for a mission
 * Standard practice: Automatic caching, background refetching, error handling
 */
export function useMissionTaskCompletions(missionId: string) {
  return useQuery({
    queryKey: taskCompletionKeys.mission(missionId),
    queryFn: () => getMissionTaskCompletions(missionId),
    enabled: !!missionId,
    staleTime: 2 * 60 * 1000, // 2 minutes for task completions
  });
}

/**
 * Hook to fetch user's task completions for a specific mission
 * Standard practice: Filtered data with user context
 */
export function useUserMissionTaskCompletions(missionId: string, userId: string) {
  const { data: allCompletions, ...rest } = useMissionTaskCompletions(missionId);
  
  const userCompletions = allCompletions?.filter(c => c.userId === userId) || [];
  
  return {
    data: userCompletions,
    ...rest,
  };
}

/**
 * Hook to complete a task with optimistic updates
 * Standard practice: Optimistic updates, cache invalidation, error handling
 */
export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      missionId,
      taskId,
      userId,
      userName,
      userEmail,
      userSocialHandle,
      metadata,
    }: {
      missionId: string;
      taskId: string;
      userId: string;
      userName: string;
      userEmail?: string;
      userSocialHandle?: string;
      metadata?: any;
    }) => {
      return completeTask(missionId, taskId, userId, userName, userEmail, userSocialHandle, metadata);
    },
    
    // Optimistic update - update UI immediately
    onMutate: async ({ missionId, taskId, userId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskCompletionKeys.mission(missionId) });

      // Snapshot previous value
      const previousCompletions = queryClient.getQueryData(taskCompletionKeys.mission(missionId));

      // Optimistically update cache
      queryClient.setQueryData(taskCompletionKeys.mission(missionId), (old: TaskCompletion[] = []) => {
        const optimisticCompletion: TaskCompletion = {
          id: `temp-${Date.now()}`,
          missionId,
          taskId,
          userId,
          userName: 'Loading...',
          status: 'verified',
          completedAt: new Date(),
          verifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: { taskType: taskId, platform: 'twitter' },
        };
        return [...old, optimisticCompletion];
      });

      return { previousCompletions };
    },

    // On error, rollback optimistic update
    onError: (err, variables, context) => {
      if (context?.previousCompletions) {
        queryClient.setQueryData(
          taskCompletionKeys.mission(variables.missionId), 
          context.previousCompletions
        );
      }
    },

    // On success, invalidate and refetch
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: taskCompletionKeys.mission(variables.missionId) });
    },
  });
}

/**
 * Hook to flag a task completion
 * Standard practice: Cache invalidation after mutation
 */
export function useFlagTaskCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      completionId,
      reason,
      reviewerId,
      reviewerName,
    }: {
      completionId: string;
      reason: string;
      reviewerId: string;
      reviewerName: string;
    }) => {
      return flagTaskCompletion(completionId, reason, reviewerId, reviewerName);
    },
    
    onSuccess: (data, variables) => {
      // Invalidate all mission queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: taskCompletionKeys.all });
    },
  });
}

/**
 * Hook to verify a flagged task completion
 * Standard practice: Cache invalidation after mutation
 */
export function useVerifyTaskCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      completionId,
      reviewerId,
      reviewerName,
    }: {
      completionId: string;
      reviewerId: string;
      reviewerName: string;
    }) => {
      return verifyTaskCompletion(completionId, reviewerId, reviewerName);
    },
    
    onSuccess: (data, variables) => {
      // Invalidate all mission queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: taskCompletionKeys.all });
    },
  });
}

/**
 * Hook to check if a specific task is completed by user
 * Standard practice: Derived state from cached data
 */
export function useIsTaskCompleted(missionId: string, taskId: string, userId: string) {
  const { data: userCompletions } = useUserMissionTaskCompletions(missionId, userId);
  
  return userCompletions?.some(c => c.taskId === taskId && c.status === 'verified') || false;
}
