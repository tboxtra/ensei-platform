/**
 * Unified Task Completion Hooks
 * Industry Standard: React Query hooks for task completion operations
 * Single source of truth for all task completion state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createTaskCompletion,
    updateTaskCompletion,
    getUserMissionTaskCompletions,
    getMissionTaskCompletions,
    verifyTaskCompletion,
    flagTaskCompletion,
    unflagTaskCompletion,
    getMissionCompletionStats,
    getUserCompletionStats
} from '../lib/task-completion';
import { handleError, handleFirebaseError } from '../lib/error-handling';
import type {
    TaskCompletionInput,
    TaskCompletionUpdate,
    TaskCompletion,
    TaskCompletionStatus
} from '../types/task-completion';

// Query keys for consistent caching
export const taskCompletionKeys = {
    all: ['taskCompletions'] as const,
    userMission: (missionId: string, userId: string) =>
        [...taskCompletionKeys.all, 'userMission', missionId, userId] as const,
    mission: (missionId: string) =>
        [...taskCompletionKeys.all, 'mission', missionId] as const,
    user: (userId: string) =>
        [...taskCompletionKeys.all, 'user', userId] as const,
    stats: (missionId: string) =>
        [...taskCompletionKeys.all, 'stats', missionId] as const,
    userStats: (userId: string) =>
        [...taskCompletionKeys.all, 'userStats', userId] as const,
};

/**
 * Hook to get task completions for a specific mission and user
 */
export function useUserMissionTaskCompletions(missionId: string, userId: string) {
    return useQuery({
        queryKey: taskCompletionKeys.userMission(missionId, userId),
        queryFn: () => getUserMissionTaskCompletions(missionId, userId),
        enabled: !!missionId && !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

/**
 * Hook to get task completions for a specific mission (all users)
 */
export function useMissionTaskCompletions(missionId: string) {
    return useQuery({
        queryKey: taskCompletionKeys.mission(missionId),
        queryFn: () => getMissionTaskCompletions(missionId),
        enabled: !!missionId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

/**
 * Hook to get mission completion statistics
 */
export function useMissionCompletionStats(missionId: string) {
    return useQuery({
        queryKey: taskCompletionKeys.stats(missionId),
        queryFn: () => getMissionCompletionStats(missionId),
        enabled: !!missionId,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

/**
 * Hook to get user completion statistics
 */
export function useUserCompletionStats(userId: string) {
    return useQuery({
        queryKey: taskCompletionKeys.userStats(userId),
        queryFn: () => getUserCompletionStats(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

/**
 * Hook to create a new task completion
 */
export function useCreateTaskCompletion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTaskCompletion,
        onSuccess: (data) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.userMission(data.missionId, data.userId)
            });
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.mission(data.missionId)
            });
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.user(data.userId)
            });
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.stats(data.missionId)
            });
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.userStats(data.userId)
            });
        },
        onError: (error) => {
            handleFirebaseError(error, 'createTaskCompletion');
        }
    });
}

/**
 * Hook to update a task completion
 */
export function useUpdateTaskCompletion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ completionId, update }: { completionId: string; update: TaskCompletionUpdate }) =>
            updateTaskCompletion(completionId, update),
        onSuccess: (_, variables) => {
            // Invalidate all related queries
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.all
            });
        },
        onError: (error) => {
            handleFirebaseError(error, 'updateTaskCompletion');
        }
    });
}

/**
 * Hook to verify a task completion
 */
export function useVerifyTaskCompletion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ completionId, reviewedBy }: { completionId: string; reviewedBy: string }) =>
            verifyTaskCompletion(completionId, reviewedBy),
        onSuccess: (_, variables) => {
            // Invalidate all related queries
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.all
            });
        },
        onError: (error) => {
            handleFirebaseError(error, 'verifyTaskCompletion');
        }
    });
}

/**
 * Hook to flag a task completion
 */
export function useFlagTaskCompletion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            completionId,
            flaggedReason,
            reviewedBy
        }: {
            completionId: string;
            flaggedReason: string;
            reviewedBy: string;
        }) => flagTaskCompletion(completionId, flaggedReason, reviewedBy),
        onSuccess: (_, variables) => {
            // Invalidate all related queries
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.all
            });
        },
        onError: (error) => {
            handleFirebaseError(error, 'flagTaskCompletion');
        }
    });
}

/**
 * Hook to unflag a task completion
 */
export function useUnflagTaskCompletion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ completionId, reviewedBy }: { completionId: string; reviewedBy: string }) =>
            unflagTaskCompletion(completionId, reviewedBy),
        onSuccess: (_, variables) => {
            // Invalidate all related queries
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.all
            });
        },
        onError: (error) => {
            handleFirebaseError(error, 'unflagTaskCompletion');
        }
    });
}

/**
 * Hook to complete a task (create completion)
 */
export function useCompleteTask() {
    const createTaskCompletionMutation = useCreateTaskCompletion();

    return useMutation({
        mutationFn: (input: TaskCompletionInput) => createTaskCompletionMutation.mutateAsync(input),
        onSuccess: (data) => {
            // Additional success handling if needed
            console.log('Task completed successfully:', data);
        },
        onError: (error) => {
            handleFirebaseError(error, 'completeTask');
        }
    });
}

/**
 * Hook to redo a task completion (unflag and allow retry)
 */
export function useRedoTaskCompletion() {
    const unflagMutation = useUnflagTaskCompletion();

    return useMutation({
        mutationFn: ({ completionId, reviewedBy }: { completionId: string; reviewedBy: string }) =>
            unflagMutation.mutateAsync({ completionId, reviewedBy }),
        onSuccess: (_, variables) => {
            console.log('Task completion unflagged, user can retry');
        },
        onError: (error) => {
            handleFirebaseError(error, 'redoTaskCompletion');
        }
    });
}

/**
 * Hook to get task completion status for a specific task
 */
export function useTaskCompletionStatus(
    taskId: string,
    missionId: string,
    userId: string
): { data: TaskCompletionStatus | null; isLoading: boolean; error: Error | null } {
    const { data: taskCompletions, isLoading, error } = useUserMissionTaskCompletions(missionId, userId);

    const status = taskCompletions ?
        getTaskCompletionStatus(taskId, taskCompletions) :
        null;

    return {
        data: status,
        isLoading,
        error: error as Error | null
    };
}

/**
 * Helper function to get task completion status
 */
function getTaskCompletionStatus(
    taskId: string,
    taskCompletions: TaskCompletion[]
): TaskCompletionStatus {
    // Get all completions for this task, sorted by creation date (newest first)
    const taskCompletionsForTask = taskCompletions
        .filter(c => c.taskId === taskId)
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    if (taskCompletionsForTask.length === 0) {
        return { status: 'not_completed' };
    }

    // Return the most recent completion
    const latestCompletion = taskCompletionsForTask[0];
    return {
        status: latestCompletion.status,
        flaggedReason: latestCompletion.flaggedReason || undefined,
        flaggedAt: latestCompletion.flaggedAt?.toDate() || undefined,
        completedAt: latestCompletion.completedAt?.toDate() || undefined,
        verifiedAt: latestCompletion.verifiedAt?.toDate() || undefined
    };
}