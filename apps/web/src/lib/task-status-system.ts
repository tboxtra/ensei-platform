/**
 * UNIFIED TASK STATUS MANAGEMENT SYSTEM
 * 
 * This system provides a single source of truth for all task completion states
 * and handles the complete lifecycle: completion → flagging → redo → verification
 * 
 * Architecture Principles:
 * - Single source of truth for task status
 * - Unified data flow across all components
 * - Real-time updates with proper cache management
 * - Type-safe operations with comprehensive error handling
 */

import { getFirebaseFirestore } from './firebase';
import { dateFromAny } from '../utils/dates';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    getDoc
} from 'firebase/firestore';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type TaskStatus = 'not_completed' | 'completed' | 'flagged' | 'pending' | 'verified';

export interface TaskCompletionRecord {
    id: string;
    missionId: string;
    taskId: string;
    userId: string;
    userName: string;
    userEmail?: string;
    userSocialHandle?: string;
    status: TaskStatus;
    completedAt: Timestamp;
    verifiedAt?: Timestamp;
    flaggedAt?: Timestamp;
    flaggedReason?: string;
    reviewedBy?: string;
    reviewedAt?: Timestamp;
    metadata: {
        taskType: string;
        platform: string;
        [key: string]: any;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface TaskStatusInfo {
    status: TaskStatus;
    flaggedReason?: string;
    flaggedAt?: Date;
    verifiedAt?: Date;
    completedAt?: Date;
    canRedo: boolean;
    canVerify: boolean;
    canFlag: boolean;
}

// ============================================================================
// CORE SYSTEM FUNCTIONS
// ============================================================================

const COLLECTION_NAME = 'taskCompletions';

/**
 * Complete a task - creates initial completion record
 */
export async function completeTask(
    missionId: string,
    taskId: string,
    userId: string,
    userName: string,
    userEmail?: string,
    userSocialHandle?: string,
    metadata: Record<string, any> = {}
): Promise<TaskCompletionRecord> {
    const db = getFirebaseFirestore();

    const completionData = {
        missionId,
        taskId,
        userId,
        userName,
        userEmail,
        userSocialHandle: userSocialHandle || null,
        status: 'completed' as TaskStatus,
        completedAt: serverTimestamp(),
        verifiedAt: null,
        flaggedAt: null,
        flaggedReason: null,
        reviewedBy: null,
        reviewedAt: null,
        metadata: {
            taskType: taskId,
            platform: 'twitter',
            ...metadata
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), completionData);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docRef.id,
                ...data,
                completedAt: data.completedAt as Timestamp,
                verifiedAt: data.verifiedAt as Timestamp,
                flaggedAt: data.flaggedAt as Timestamp,
                reviewedAt: data.reviewedAt as Timestamp,
                createdAt: data.createdAt as Timestamp,
                updatedAt: data.updatedAt as Timestamp
            } as TaskCompletionRecord;
        }

        throw new Error('Failed to create task completion');
    } catch (error) {
        console.error('Error completing task:', error);
        throw error;
    }
}

/**
 * Flag a task completion - marks it as flagged and requires redo
 */
export async function flagTaskCompletion(
    completionId: string,
    reason: string,
    reviewerId: string,
    reviewerName: string
): Promise<void> {
    const db = getFirebaseFirestore();

    try {
        const completionRef = doc(db, COLLECTION_NAME, completionId);
        await updateDoc(completionRef, {
            status: 'flagged',
            flaggedAt: serverTimestamp(),
            flaggedReason: reason,
            reviewedBy: reviewerId,
            reviewedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error flagging task completion:', error);
        throw error;
    }
}

/**
 * Redo a flagged task - creates new completion with pending status
 */
export async function redoTaskCompletion(
    missionId: string,
    taskId: string,
    userId: string,
    userName: string,
    userEmail?: string,
    userSocialHandle?: string,
    metadata: Record<string, any> = {}
): Promise<TaskCompletionRecord> {
    const db = getFirebaseFirestore();

    const completionData = {
        missionId,
        taskId,
        userId,
        userName,
        userEmail,
        userSocialHandle: userSocialHandle || null,
        status: 'pending' as TaskStatus,
        completedAt: serverTimestamp(),
        verifiedAt: null,
        flaggedAt: null,
        flaggedReason: null,
        reviewedBy: null,
        reviewedAt: null,
        metadata: {
            taskType: taskId,
            platform: 'twitter',
            ...metadata
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), completionData);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docRef.id,
                ...data,
                completedAt: data.completedAt as Timestamp,
                verifiedAt: data.verifiedAt as Timestamp,
                flaggedAt: data.flaggedAt as Timestamp,
                reviewedAt: data.reviewedAt as Timestamp,
                createdAt: data.createdAt as Timestamp,
                updatedAt: data.updatedAt as Timestamp
            } as TaskCompletionRecord;
        }

        throw new Error('Failed to create task redo completion');
    } catch (error) {
        console.error('Error redoing task completion:', error);
        throw error;
    }
}

/**
 * Verify a task completion - marks it as verified
 */
export async function verifyTaskCompletion(
    completionId: string,
    reviewerId: string,
    reviewerName: string
): Promise<void> {
    const db = getFirebaseFirestore();

    try {
        const completionRef = doc(db, COLLECTION_NAME, completionId);
        await updateDoc(completionRef, {
            status: 'verified',
            verifiedAt: serverTimestamp(),
            flaggedReason: null,
            flaggedAt: null,
            reviewedBy: reviewerId,
            reviewedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error verifying task completion:', error);
        throw error;
    }
}

/**
 * Get all task completions for a mission
 */
export async function getMissionTaskCompletions(missionId: string): Promise<TaskCompletionRecord[]> {
    const db = getFirebaseFirestore();

    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('missionId', '==', missionId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const completions: TaskCompletionRecord[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            completions.push({
                id: doc.id,
                ...data,
                completedAt: data.completedAt as Timestamp,
                verifiedAt: data.verifiedAt as Timestamp,
                flaggedAt: data.flaggedAt as Timestamp,
                reviewedAt: data.reviewedAt as Timestamp,
                createdAt: data.createdAt as Timestamp,
                updatedAt: data.updatedAt as Timestamp
            } as TaskCompletionRecord);
        });

        return completions;
    } catch (error) {
        console.error('Error getting mission task completions:', error);
        throw error;
    }
}

/**
 * Get task status information for a specific user and task
 */
export async function getTaskStatusInfo(
    missionId: string,
    taskId: string,
    userId: string
): Promise<TaskStatusInfo> {
    const completions = await getMissionTaskCompletions(missionId);

    // Filter for this specific user and task
    const userTaskCompletions = completions
        .filter(c => c.taskId === taskId && c.userId === userId)
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    if (userTaskCompletions.length === 0) {
        return {
            status: 'not_completed',
            canRedo: false,
            canVerify: false,
            canFlag: false
        };
    }

    const latestCompletion = userTaskCompletions[0];

    return {
        status: latestCompletion.status,
        flaggedReason: latestCompletion.flaggedReason || undefined,
        flaggedAt: dateFromAny(latestCompletion.flaggedAt) || undefined,
        verifiedAt: dateFromAny(latestCompletion.verifiedAt) || undefined,
        completedAt: dateFromAny(latestCompletion.completedAt) || undefined,
        canRedo: latestCompletion.status === 'flagged',
        canVerify: latestCompletion.status === 'pending',
        canFlag: latestCompletion.status === 'completed'
    };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a task is completed by a user
 */
export function isTaskCompleted(completions: TaskCompletionRecord[], taskId: string, userId: string): boolean {
    return completions.some(c =>
        c.taskId === taskId &&
        c.userId === userId &&
        (c.status === 'completed' || c.status === 'verified')
    );
}

/**
 * Get the latest completion for a specific user and task
 */
export function getLatestCompletion(
    completions: TaskCompletionRecord[],
    taskId: string,
    userId: string
): TaskCompletionRecord | null {
    const userTaskCompletions = completions
        .filter(c => c.taskId === taskId && c.userId === userId)
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    return userTaskCompletions.length > 0 ? userTaskCompletions[0] : null;
}
