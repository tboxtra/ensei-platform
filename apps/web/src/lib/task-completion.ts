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

const TASK_COMPLETIONS_COLLECTION = 'taskCompletions';

/**
 * Create a new task completion
 */
export async function createTaskCompletion(input: TaskCompletionInput): Promise<TaskCompletion> {
    try {
        const now = serverTimestamp();

        const taskCompletionData = {
            ...input,
            status: 'pending' as const,
            completedAt: now,
            createdAt: now,
            updatedAt: now
        };

        const docRef = await addDoc(collection(db, TASK_COMPLETIONS_COLLECTION), taskCompletionData);

        return {
            id: docRef.id,
            ...taskCompletionData,
            completedAt: now as Timestamp,
            createdAt: now as Timestamp,
            updatedAt: now as Timestamp
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
 */
export async function getUserMissionTaskCompletions(
    missionId: string,
    userId: string
): Promise<TaskCompletion[]> {
    try {
        const q = query(
            collection(db, TASK_COMPLETIONS_COLLECTION),
            where('missionId', '==', missionId),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as TaskCompletion[];
    } catch (error) {
        throw handleFirebaseError(error, 'getUserMissionTaskCompletions');
    }
}

/**
 * Get task completions for a specific mission (all users)
 */
export async function getMissionTaskCompletions(missionId: string): Promise<TaskCompletion[]> {
    try {
        const q = query(
            collection(db, TASK_COMPLETIONS_COLLECTION),
            where('missionId', '==', missionId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as TaskCompletion[];
    } catch (error) {
        throw handleFirebaseError(error, 'getMissionTaskCompletions');
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
        reviewedBy,
        reviewedAt: serverTimestamp() as Timestamp,
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
        reviewedBy,
        reviewedAt: serverTimestamp() as Timestamp,
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
        reviewedBy,
        reviewedAt: serverTimestamp() as Timestamp,
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
