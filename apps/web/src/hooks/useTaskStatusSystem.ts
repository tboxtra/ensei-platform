/**
 * UNIFIED TASK STATUS SYSTEM - REACT QUERY HOOKS
 * 
 * This provides React Query hooks for the unified task status system
 * Following the architecture principle of unified data flow
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getMissionTaskCompletions,
    getTaskStatusInfo,
    completeTask,
    flagTaskCompletion,
    redoTaskCompletion,
    verifyTaskCompletion,
    type TaskCompletionRecord,
    type TaskStatusInfo
} from '@/lib/task-status-system';
import { useAuthStore } from '../store/authStore';

// ============================================================================
// QUERY KEYS
// ============================================================================

// All user-scoped queries must be keyed by authUser.uid
export const taskStatusKeys = {
    all: ['taskStatus'] as const,
    mission: (missionId: string) => [...taskStatusKeys.all, 'mission', missionId] as const,
    userTask: (missionId: string, taskId: string, uid: string) =>
        [...taskStatusKeys.all, 'userTask', missionId, taskId, uid] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get all task completions for a mission
 */
export function useMissionTaskCompletions(missionId: string) {
    return useQuery({
        queryKey: taskStatusKeys.mission(missionId),
        queryFn: () => getMissionTaskCompletions(missionId),
        enabled: !!missionId,
        staleTime: 30 * 1000, // 30 seconds for real-time feel
        refetchInterval: 10 * 1000, // Refetch every 10 seconds for live updates
    });
}

/**
 * Get task status info for a specific user and task
 */
export function useTaskStatusInfo(missionId: string, taskId: string, userId?: string) {
    const { user: authUser } = useAuthStore();
    const uid = userId || authUser?.uid;
    
    return useQuery({
        queryKey: taskStatusKeys.userTask(missionId, taskId, uid!),
        queryFn: () => getTaskStatusInfo(missionId, taskId, uid!),
        enabled: !!(missionId && taskId && uid),
        staleTime: 30 * 1000,
        refetchInterval: 10 * 1000,
    });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Complete a task
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
            metadata?: Record<string, any>;
        }) => {
            return completeTask(missionId, taskId, userId, userName, userEmail, userSocialHandle, metadata);
        },

        onSuccess: (data, variables) => {
            // Invalidate and refetch all related queries
            queryClient.invalidateQueries({ queryKey: taskStatusKeys.mission(variables.missionId) });
            queryClient.invalidateQueries({
                queryKey: taskStatusKeys.userTask(variables.missionId, variables.taskId, variables.userId)
            });
        },
    });
}

/**
 * Flag a task completion
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

        onSuccess: () => {
            // Invalidate all queries to ensure UI updates everywhere
            queryClient.invalidateQueries();
        },
    });
}

/**
 * Redo a flagged task
 */
export function useRedoTaskCompletion() {
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
            metadata?: Record<string, any>;
        }) => {
            return redoTaskCompletion(missionId, taskId, userId, userName, userEmail, userSocialHandle, metadata);
        },

        onSuccess: (data, variables) => {
            // Invalidate and refetch all related queries
            queryClient.invalidateQueries({ queryKey: taskStatusKeys.mission(variables.missionId) });
            queryClient.invalidateQueries({
                queryKey: taskStatusKeys.userTask(variables.missionId, variables.taskId, variables.userId)
            });
        },
    });
}

/**
 * Verify a task completion
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

        onSuccess: () => {
            // Invalidate all queries to ensure UI updates everywhere
            queryClient.invalidateQueries();
        },
    });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Get user's task completions for a specific mission
 */
export function useUserMissionTaskCompletions(missionId: string, userId?: string) {
    const { user: authUser } = useAuthStore();
    const uid = userId || authUser?.uid;
    const { data: allCompletions, ...rest } = useMissionTaskCompletions(missionId);

    const userCompletions = allCompletions?.filter(c => c.userId === uid) || [];

    return {
        data: userCompletions,
        ...rest,
    };
}

/**
 * Check if a specific task is completed by user
 */
export function useIsTaskCompleted(missionId: string, taskId: string, userId?: string) {
    const { data: taskStatusInfo } = useTaskStatusInfo(missionId, taskId, userId);

    return taskStatusInfo?.status === 'completed' || taskStatusInfo?.status === 'verified' || false;
}
