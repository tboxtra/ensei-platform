/**
 * Unified Task Completion System
 * Industry Standard: Consolidated task completion logic
 * Single source of truth for all task completion operations
 */

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirebaseError } from './error-handling';
import type {
    TaskCompletion,
    TaskCompletionInput,
    TaskCompletionUpdate,
    TaskCompletionStatus,
    TaskCompletionFilters,
    TaskCompletionSort,
    TaskCompletionQueryResult,
    TaskCompletionPagination
} from '../types/task-completion';

const TASK_COMPLETIONS_COLLECTION = 'mission_participations';

/**
 * Validate Twitter URL and ensure it belongs to the user
 */
export async function validateTwitterUrl(url: string, userTwitterHandle: string): Promise<{
    isValid: boolean;
    error?: string;
    extractedHandle?: string;
    tweetId?: string;
}> {
    try {
        // Check if URL is a valid Twitter/X URL
        const twitterUrlRegex = /^https?:\/\/(twitter\.com|x\.com)\/([^\/\?]+)\/status\/(\d+)/i;
        const match = url.match(twitterUrlRegex);

        if (!match) {
            return {
                isValid: false,
                error: 'URL must be a valid Twitter/X post URL (e.g., https://twitter.com/username/status/1234567890)'
            };
        }

        const [, domain, extractedHandle, tweetId] = match;

        // Normalize handles for comparison
        const normalizedUserHandle = userTwitterHandle.toLowerCase().replace('@', '');
        const normalizedExtractedHandle = extractedHandle.toLowerCase();

        if (normalizedExtractedHandle !== normalizedUserHandle) {
            return {
                isValid: false,
                error: `URL must be from your own Twitter account (@${userTwitterHandle}). Found: @${extractedHandle}`,
                extractedHandle
            };
        }

        // Additional validation: Check if it's a reply, quote, or comment
        // For now, we'll accept any post from the user's account
        // In the future, we could add more specific validation for replies/quotes

        return {
            isValid: true,
            extractedHandle,
            tweetId
        };
    } catch (error) {
        return {
            isValid: false,
            error: 'Failed to validate Twitter URL'
        };
    }
}

/**
 * Create a new task completion
 * Writes to mission_participations collection (old system)
 */
export async function createTaskCompletion(input: TaskCompletionInput): Promise<TaskCompletion> {
    try {
        // Check if user is already participating in this mission
        const participationQuery = await getDocs(
            query(
                collection(db, TASK_COMPLETIONS_COLLECTION),
                where('mission_id', '==', input.missionId),
                where('user_id', '==', input.userId)
            )
        );

        let participationId;
        let participationData;

        if (participationQuery.empty) {
            // Create new participation with required fields
            const newParticipation = {
                mission_id: input.missionId,
                user_id: input.userId,
                user_name: input.userName,
                user_email: input.userEmail || null,
                user_social_handle: input.userSocialHandle || null,
                platform: input.metadata?.platform || 'twitter',
                status: 'active',
                joined_at: new Date().toISOString(),
                tasks_completed: [],
                total_honors_earned: 0,
                // Required fields for standardized structure
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const participationRef = await addDoc(collection(db, TASK_COMPLETIONS_COLLECTION), newParticipation);
            participationId = participationRef.id;
            participationData = newParticipation;
        } else {
            // Use existing participation
            const doc = participationQuery.docs[0];
            participationId = doc.id;
            participationData = doc.data();
        }

        // Create task completion with required fields
        const taskCompletion = {
            task_id: input.taskId,
            action_id: input.metadata?.verificationMethod || 'direct',
            completed_at: new Date().toISOString(),
            verification_data: {
                url: input.metadata?.tweetUrl || null,
                userAgent: input.metadata?.userAgent || null,
                ipAddress: input.metadata?.ipAddress || null,
                sessionId: input.metadata?.sessionId || null,
                urlValidation: input.metadata?.urlValidation || null
            },
            api_result: null,
            status: 'completed',
            // Required fields for standardized structure
            mission_id: input.missionId,
            user_id: input.userId,
            verificationMethod: input.metadata?.verificationMethod || 'direct',
            url: input.metadata?.tweetUrl || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Update participation with new task completion
        const tasksCompleted = participationData.tasks_completed || [];

        // Check if task is already completed
        const existingTask = tasksCompleted.find((t: any) => t.task_id === input.taskId);
        if (existingTask) {
            throw new Error('Task already completed');
        }

        tasksCompleted.push(taskCompletion);

        // Update the participation document
        await updateDoc(doc(db, TASK_COMPLETIONS_COLLECTION, participationId), {
            tasks_completed: tasksCompleted,
            updated_at: serverTimestamp()
        });

        // Return in the new format for compatibility
        const completionDate = new Date(taskCompletion.completed_at);
        return {
            id: `${participationId}_${input.taskId}`,
            missionId: input.missionId,
            taskId: input.taskId,
            userId: input.userId,
            userName: input.userName,
            userEmail: input.userEmail,
            userSocialHandle: input.userSocialHandle,
            status: 'verified', // All completions are verified in the old system
            completedAt: Timestamp.fromDate(completionDate),
            verifiedAt: Timestamp.fromDate(completionDate),
            flaggedAt: undefined,
            flaggedReason: undefined,
            url: taskCompletion.verification_data.url,
            platform: participationData.platform || 'twitter',
            twitterHandle: input.userSocialHandle,
            reviewerId: undefined,
            metadata: input.metadata,
            createdAt: Timestamp.fromDate(completionDate),
            updatedAt: Timestamp.fromDate(completionDate)
        } as TaskCompletion;
    } catch (error) {
        throw handleFirebaseError(error, 'createTaskCompletion');
    }
}

/**
 * Update task completion status
 */
export async function updateTaskCompletion(
    completionId: string,
    update: TaskCompletionUpdate
): Promise<void> {
    try {
        const docRef = doc(db, TASK_COMPLETIONS_COLLECTION, completionId);

        const updateData = {
            ...update,
            updatedAt: serverTimestamp()
        };

        await updateDoc(docRef, updateData);
    } catch (error) {
        throw handleFirebaseError(error, 'updateTaskCompletion');
    }
}

/**
 * Get task completions for a specific mission and user
 * Reads from mission_participations collection (old system)
 */
export async function getUserMissionTaskCompletions(
    missionId: string,
    userId: string
): Promise<TaskCompletion[]> {
    try {
        // Query mission_participations collection
        const q = query(
            collection(db, TASK_COMPLETIONS_COLLECTION),
            where('mission_id', '==', missionId),
            where('user_id', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const completions: TaskCompletion[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const tasksCompleted = data.tasks_completed || [];

            // Convert each task completion to the new format
            tasksCompleted.forEach((task: any) => {
                const taskDate = task.completed_at ? new Date(task.completed_at) : new Date();
                completions.push({
                    id: `${doc.id}_${task.task_id}`, // Create unique ID
                    missionId: missionId,
                    taskId: task.task_id,
                    userId: userId,
                    userName: data.user_name || 'Unknown User',
                    userEmail: data.user_email || null,
                    userSocialHandle: data.user_social_handle || null,
                    status: task.status === 'completed' ? 'verified' : 'pending',
                    completedAt: Timestamp.fromDate(taskDate),
                    verifiedAt: task.status === 'completed' ? Timestamp.fromDate(taskDate) : undefined,
                    flaggedAt: undefined,
                    flaggedReason: undefined,
                    url: task.verification_data?.url || null,
                    platform: data.platform || 'twitter',
                    twitterHandle: data.user_social_handle || null,
                    reviewerId: undefined,
                    metadata: {
                        taskType: task.task_id,
                        platform: data.platform || 'twitter',
                        twitterHandle: data.user_social_handle || null,
                        tweetUrl: task.verification_data?.url || null,
                        userAgent: task.verification_data?.userAgent || null,
                        ipAddress: task.verification_data?.ipAddress || null,
                        sessionId: task.verification_data?.sessionId || null,
                        verificationMethod: 'api',
                        urlValidation: task.verification_data?.urlValidation || null,
                        actionId: task.action_id,
                        apiResult: task.api_result
                    },
                    createdAt: Timestamp.fromDate(taskDate),
                    updatedAt: Timestamp.fromDate(taskDate)
                } as TaskCompletion);
            });
        });

        return completions;
    } catch (error) {
        throw handleFirebaseError(error, 'getUserMissionTaskCompletions');
    }
}

/**
 * Get task completions for a specific mission (all users)
 * Reads from mission_participations collection (old system)
 */
export async function getMissionTaskCompletions(missionId: string): Promise<TaskCompletion[]> {
    try {
        // Query mission_participations collection
        const q = query(
            collection(db, TASK_COMPLETIONS_COLLECTION),
            where('mission_id', '==', missionId),
            orderBy('created_at', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const completions: TaskCompletion[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const tasksCompleted = data.tasks_completed || [];

            // Convert each task completion to the new format
            tasksCompleted.forEach((task: any) => {
                const taskDate = task.completed_at ? new Date(task.completed_at) : new Date();
                completions.push({
                    id: `${doc.id}_${task.task_id}`, // Create unique ID
                    missionId: missionId,
                    taskId: task.task_id,
                    userId: data.user_id,
                    userName: data.user_name || 'Unknown User',
                    userEmail: data.user_email || null,
                    userSocialHandle: data.user_social_handle || null,
                    status: task.status === 'completed' ? 'verified' : 'pending',
                    completedAt: Timestamp.fromDate(taskDate),
                    verifiedAt: task.status === 'completed' ? Timestamp.fromDate(taskDate) : undefined,
                    flaggedAt: undefined,
                    flaggedReason: undefined,
                    url: task.verification_data?.url || null,
                    platform: data.platform || 'twitter',
                    twitterHandle: data.user_social_handle || null,
                    reviewerId: undefined,
                    metadata: {
                        taskType: task.task_id,
                        platform: data.platform || 'twitter',
                        twitterHandle: data.user_social_handle || null,
                        tweetUrl: task.verification_data?.url || null,
                        userAgent: task.verification_data?.userAgent || null,
                        ipAddress: task.verification_data?.ipAddress || null,
                        sessionId: task.verification_data?.sessionId || null,
                        verificationMethod: 'api',
                        urlValidation: task.verification_data?.urlValidation || null,
                        actionId: task.action_id,
                        apiResult: task.api_result
                    },
                    createdAt: Timestamp.fromDate(taskDate),
                    updatedAt: Timestamp.fromDate(taskDate)
                } as TaskCompletion);
            });
        });

        return completions;
    } catch (error) {
        throw handleFirebaseError(error, 'getMissionTaskCompletions');
    }
}

/**
 * Get all task completions for a user across all missions
 * Used by Discover page to show completion status
 * Reads from mission_participations collection (old system)
 */
export async function getAllUserTaskCompletions(userId: string): Promise<TaskCompletion[]> {
    try {
        // Query mission_participations collection
        const q = query(
            collection(db, TASK_COMPLETIONS_COLLECTION),
            where('user_id', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const completions: TaskCompletion[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const tasksCompleted = data.tasks_completed || [];

            // Convert each task completion to the new format
            tasksCompleted.forEach((task: any) => {
                const taskDate = task.completed_at ? new Date(task.completed_at) : new Date();
                completions.push({
                    id: `${doc.id}_${task.task_id}`, // Create unique ID
                    missionId: data.mission_id,
                    taskId: task.task_id,
                    userId: userId,
                    userName: data.user_name || 'Unknown User',
                    userEmail: data.user_email || null,
                    userSocialHandle: data.user_social_handle || null,
                    status: task.status === 'completed' ? 'verified' : 'pending',
                    completedAt: Timestamp.fromDate(taskDate),
                    verifiedAt: task.status === 'completed' ? Timestamp.fromDate(taskDate) : undefined,
                    flaggedAt: undefined,
                    flaggedReason: undefined,
                    url: task.verification_data?.url || null,
                    platform: data.platform || 'twitter',
                    twitterHandle: data.user_social_handle || null,
                    reviewerId: undefined,
                    metadata: {
                        taskType: task.task_id,
                        platform: data.platform || 'twitter',
                        twitterHandle: data.user_social_handle || null,
                        tweetUrl: task.verification_data?.url || null,
                        userAgent: task.verification_data?.userAgent || null,
                        ipAddress: task.verification_data?.ipAddress || null,
                        sessionId: task.verification_data?.sessionId || null,
                        verificationMethod: 'api',
                        urlValidation: task.verification_data?.urlValidation || null,
                        actionId: task.action_id,
                        apiResult: task.api_result
                    },
                    createdAt: Timestamp.fromDate(taskDate),
                    updatedAt: Timestamp.fromDate(taskDate)
                } as TaskCompletion);
            });
        });

        return completions;
    } catch (error) {
        throw handleFirebaseError(error, 'getAllUserTaskCompletions');
    }
}

/**
 * Get task completion status for a specific task
 */
export function getTaskCompletionStatus(
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

/**
 * Verify a task completion
 */
export async function verifyTaskCompletion(
    completionId: string,
    reviewedBy: string
): Promise<void> {
    await updateTaskCompletion(completionId, {
        status: 'verified',
        reviewerId: reviewedBy,
        verifiedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
    });
}

/**
 * Flag a task completion
 */
export async function flagTaskCompletion(
    completionId: string,
    flaggedReason: string,
    reviewedBy: string
): Promise<void> {
    await updateTaskCompletion(completionId, {
        status: 'flagged',
        flaggedReason,
        reviewerId: reviewedBy,
        flaggedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
    });
}

/**
 * Unflag a task completion (revert to pending)
 */
export async function unflagTaskCompletion(
    completionId: string,
    reviewedBy: string
): Promise<void> {
    await updateTaskCompletion(completionId, {
        status: 'pending',
        flaggedReason: undefined,
        reviewerId: reviewedBy,
        flaggedAt: undefined,
        updatedAt: serverTimestamp() as Timestamp
    });
}

/**
 * Get task completion statistics for a mission
 */
export async function getMissionCompletionStats(missionId: string): Promise<{
    totalCompletions: number;
    verifiedCompletions: number;
    flaggedCompletions: number;
    pendingCompletions: number;
    completionRate: number;
}> {
    try {
        const completions = await getMissionTaskCompletions(missionId);

        const totalCompletions = completions.length;
        const verifiedCompletions = completions.filter(c => c.status === 'verified').length;
        const flaggedCompletions = completions.filter(c => c.status === 'flagged').length;
        const pendingCompletions = completions.filter(c => c.status === 'pending').length;

        const completionRate = totalCompletions > 0 ? (verifiedCompletions / totalCompletions) * 100 : 0;

        return {
            totalCompletions,
            verifiedCompletions,
            flaggedCompletions,
            pendingCompletions,
            completionRate
        };
    } catch (error) {
        throw handleFirebaseError(error, 'getMissionCompletionStats');
    }
}

/**
 * Get user completion statistics
 */
export async function getUserCompletionStats(userId: string): Promise<{
    totalCompletions: number;
    verifiedCompletions: number;
    flaggedCompletions: number;
    pendingCompletions: number;
    completionRate: number;
}> {
    try {
        const q = query(
            collection(db, TASK_COMPLETIONS_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const completions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as TaskCompletion[];

        const totalCompletions = completions.length;
        const verifiedCompletions = completions.filter(c => c.status === 'verified').length;
        const flaggedCompletions = completions.filter(c => c.status === 'flagged').length;
        const pendingCompletions = completions.filter(c => c.status === 'pending').length;

        const completionRate = totalCompletions > 0 ? (verifiedCompletions / totalCompletions) * 100 : 0;

        return {
            totalCompletions,
            verifiedCompletions,
            flaggedCompletions,
            pendingCompletions,
            completionRate
        };
    } catch (error) {
        throw handleFirebaseError(error, 'getUserCompletionStats');
    }
}

/**
 * Check if user has completed a specific task
 */
export function hasUserCompletedTask(
    taskId: string,
    taskCompletions: TaskCompletion[]
): boolean {
    return taskCompletions.some(c => c.taskId === taskId && c.status === 'verified');
}

/**
 * Check if user has flagged a specific task
 */
export function hasUserFlaggedTask(
    taskId: string,
    taskCompletions: TaskCompletion[]
): boolean {
    return taskCompletions.some(c => c.taskId === taskId && c.status === 'flagged');
}

/**
 * Get the latest task completion for a specific task
 */
export function getLatestTaskCompletion(
    taskId: string,
    taskCompletions: TaskCompletion[]
): TaskCompletion | null {
    const taskCompletionsForTask = taskCompletions
        .filter(c => c.taskId === taskId)
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    return taskCompletionsForTask.length > 0 ? taskCompletionsForTask[0] : null;
}

/**
 * Get task completion count for a specific task
 */
export function getTaskCompletionCount(
    taskId: string,
    taskCompletions: TaskCompletion[]
): number {
    return taskCompletions.filter(c => c.taskId === taskId).length;
}

/**
 * Get unique task IDs from completions
 */
export function getUniqueTaskIds(taskCompletions: TaskCompletion[]): string[] {
    const taskIds = new Set(taskCompletions.map(c => c.taskId));
    return Array.from(taskIds);
}

/**
 * Get task completion summary
 */
export function getTaskCompletionSummary(taskCompletions: TaskCompletion[]): {
    totalTasks: number;
    completedTasks: number;
    verifiedTasks: number;
    flaggedTasks: number;
    pendingTasks: number;
    completionRate: number;
} {
    const uniqueTaskIds = getUniqueTaskIds(taskCompletions);
    const totalTasks = uniqueTaskIds.length;

    let completedTasks = 0;
    let verifiedTasks = 0;
    let flaggedTasks = 0;
    let pendingTasks = 0;

    uniqueTaskIds.forEach(taskId => {
        const latestCompletion = getLatestTaskCompletion(taskId, taskCompletions);
        if (latestCompletion) {
            completedTasks++;
            switch (latestCompletion.status) {
                case 'verified':
                    verifiedTasks++;
                    break;
                case 'flagged':
                    flaggedTasks++;
                    break;
                case 'pending':
                    pendingTasks++;
                    break;
            }
        }
    });

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
        totalTasks,
        completedTasks,
        verifiedTasks,
        flaggedTasks,
        pendingTasks,
        completionRate
    };
}
