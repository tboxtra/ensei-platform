/**
 * Unified Task Completion Hooks
 * Industry Standard: React Query hooks for task completion operations
 * Single source of truth for all task completion state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dateFromAny } from '../features/missions/utils/dates';
import {
    createTaskCompletion,
    updateTaskCompletion,
    getUserMissionTaskCompletions,
    getMissionTaskCompletions,
    getAllUserTaskCompletions,
    verifyTaskCompletion,
    flagTaskCompletion,
    unflagTaskCompletion,
    getMissionCompletionStats,
    getUserCompletionStats,
    validateTwitterUrl
} from '../lib/task-completion';
import { handleError, handleFirebaseError } from '../lib/error-handling';
import { useAuthStore } from '../store/authStore';
import { useApi } from './useApi';
import type {
    TaskCompletionInput,
    TaskCompletionUpdate,
    TaskCompletion,
    TaskCompletionStatus,
    TaskStatus
} from '../types/task-completion';

// Query keys for consistent caching - All user-scoped queries must be keyed by authUser.uid
export const taskCompletionKeys = {
    all: ['taskCompletions'] as const,
    userMission: (missionId: string, uid: string) =>
        [...taskCompletionKeys.all, 'userMission', missionId, uid] as const,
    mission: (missionId: string) =>
        [...taskCompletionKeys.all, 'mission', missionId] as const,
    user: (uid: string) =>
        [...taskCompletionKeys.all, 'user', uid] as const,
    userCompletions: (uid: string) =>
        [...taskCompletionKeys.all, 'userCompletions', uid] as const,
    stats: (missionId: string) =>
        [...taskCompletionKeys.all, 'stats', missionId] as const,
    userStats: (uid: string) =>
        [...taskCompletionKeys.all, 'userStats', uid] as const,
};

/**
 * Helper function to get color classes for task status
 */
export function toneFor(status: TaskStatus): string {
    switch (status) {
        case 'verified':
            return 'bg-green-500/20 text-green-400 border border-green-500/30';
        case 'pendingVerify':
        case 'intentDone':
            return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
        case 'flagged':
            return 'bg-red-500/20 text-red-400 border border-red-500/30';
        default: // 'idle'
            return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    }
}

/**
 * Hook to get task completions for a specific mission and user
 * Real-time updates with proper query keying
 */
export function useUserMissionTaskCompletions(missionId: string, userId?: string) {
    const { user: authUser } = useAuthStore();
    const uid = userId || authUser?.uid;

    return useQuery({
        queryKey: taskCompletionKeys.userMission(missionId, uid!),
        queryFn: () => getUserMissionTaskCompletions(missionId, uid!),
        enabled: !!missionId && !!uid,
        staleTime: 0, // Always refetch for real-time updates
        gcTime: 1000 * 60 * 30, // 30 minutes
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook to get task completions for a specific mission (all users)
 * Supports legacy mission IDs for backward compatibility
 * Only runs for mission owners or admins to prevent permission errors
 */
export function useMissionTaskCompletions(
    missionDocId: string,
    legacyIds: string[] = [],
    currentUserId?: string,
    missionOwnerUid?: string
) {
    // Check if current user has permission to read all completions
    const isMissionOwner = currentUserId && missionOwnerUid && currentUserId === missionOwnerUid;
    const hasPermission = isMissionOwner; // Add admin check if needed

    return useQuery({
        queryKey: taskCompletionKeys.mission(missionDocId),
        queryFn: () => getMissionTaskCompletions(missionDocId, legacyIds, currentUserId, missionOwnerUid),
        enabled: !!missionDocId && !!currentUserId && hasPermission,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        retry: false, // Don't retry permission errors
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
export function useUserCompletionStats(userId?: string) {
    const { user: authUser } = useAuthStore();
    const uid = userId || authUser?.uid;

    return useQuery({
        queryKey: taskCompletionKeys.userStats(uid!),
        queryFn: () => getUserCompletionStats(uid!),
        enabled: !!uid,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

/**
 * Hook to get all task completions for a user across all missions
 * Used by Discover page to show completion status
 */
export function useAllUserCompletions(userId?: string) {
    const { user: authUser } = useAuthStore();
    const uid = userId || authUser?.uid;

    return useQuery({
        queryKey: taskCompletionKeys.userCompletions(uid!),
        queryFn: () => getAllUserTaskCompletions(uid!),
        enabled: !!uid,
        staleTime: 0, // Always refetch for real-time updates
        gcTime: 1000 * 60 * 30, // 30 minutes
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook to create a new task completion
 */
export function useCreateTaskCompletion() {
    const queryClient = useQueryClient();
    const { user: authUser } = useAuthStore();

    return useMutation({
        mutationFn: createTaskCompletion,
        onSuccess: (data) => {
            const uid = authUser?.uid;
            if (!uid) return;

            // Invalidate related queries using stable uid
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.userMission(data.missionId, uid)
            });
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.mission(data.missionId)
            });
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.user(uid)
            });
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.userCompletions(uid)
            });
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.stats(data.missionId)
            });
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.userStats(uid)
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
 * Hook to submit task link for link-mode tasks
 */
export function useSubmitTaskLink() {
    const queryClient = useQueryClient();
    const { user: authUser } = useAuthStore();
    const { getUserProfile } = useApi();

    return useMutation({
        mutationFn: async ({ taskId, url, missionId }: { taskId: string; url: string; missionId: string }) => {
            if (!authUser) {
                throw new Error('User not authenticated');
            }

            // Get user's actual Twitter username from profile
            const userProfile = await getUserProfile();
            const twitterUsername = userProfile?.twitter_handle || userProfile?.twitter || '';

            if (!twitterUsername) {
                throw new Error('Twitter username not found in profile. Please update your profile with your Twitter handle.');
            }

            // Server-side validation of the URL
            const validationResult = await validateTwitterUrl(url, twitterUsername);
            if (!validationResult.isValid) {
                throw new Error(validationResult.error || 'Invalid Twitter URL');
            }

            // Create task completion with the submitted link
            const taskCompletionInput: TaskCompletionInput = {
                missionId,
                taskId,
                userId: authUser.uid,
                userName: authUser.displayName || authUser.email || 'User',
                userEmail: authUser.email || undefined,
                userSocialHandle: twitterUsername,
                metadata: {
                    taskType: taskId,
                    platform: 'twitter',
                    twitterHandle: twitterUsername,
                    tweetUrl: url,
                    userAgent: navigator.userAgent,
                    sessionId: Date.now().toString(),
                    verificationMethod: 'link',
                    urlValidation: validationResult
                }
            };

            return await createTaskCompletion(taskCompletionInput);
        },
        onSuccess: (data, variables) => {
            const uid = authUser?.uid;
            if (!uid) return;

            // Invalidate and refetch task completions
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.userMission(variables.missionId, uid)
            });
            queryClient.invalidateQueries({
                queryKey: taskCompletionKeys.userCompletions(uid)
            });
        },
        onError: (error) => {
            handleFirebaseError(error, 'submitTaskLink');
        }
    });
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
        flaggedAt: dateFromAny(latestCompletion.flaggedAt) || undefined,
        completedAt: dateFromAny(latestCompletion.completedAt) || undefined,
        verifiedAt: dateFromAny(latestCompletion.verifiedAt) || undefined
    };
}