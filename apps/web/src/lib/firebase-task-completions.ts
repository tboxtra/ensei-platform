/**
 * Firebase-based Task Completion System
 * Standard practice for task verification and submission management
 */

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    FieldValue
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';

export interface TaskCompletion {
    id: string;
    missionId: string;
    taskId: string;
    userId: string;
    userName: string;
    userEmail?: string;
    userSocialHandle?: string; // Twitter handle, Instagram username, etc.
    status: 'pending' | 'verified' | 'flagged' | 'rejected';
    completedAt: FieldValue | Timestamp;
    verifiedAt?: FieldValue | Timestamp | null;
    flaggedAt?: FieldValue | Timestamp | null;
    flaggedReason?: string;
    proof?: string; // Screenshot URL, transaction hash, etc.
    url?: string; // For link submissions
    platform?: string; // Platform where task was completed
    twitterHandle?: string; // User's Twitter handle
    reviewerId?: string; // ID of reviewer (admin/moderator)
    metadata: {
        taskType: string;
        platform: string;
        twitterHandle?: string;
        tweetUrl?: string;
        userAgent?: string;
        ipAddress?: string;
        sessionId?: string;
        verificationMethod?: string; // 'direct' or 'link'
        urlValidation?: any; // Validation result for link submissions
    };
    reviewedBy?: string; // Legacy field, use reviewerId instead
    reviewedAt?: FieldValue | Timestamp | null; // Legacy field, use verifiedAt/flaggedAt instead
    createdAt: FieldValue | Timestamp;
    updatedAt: FieldValue | Timestamp;
}

const COLLECTION_NAME = 'taskCompletions';

/**
 * Complete a task (mark as verified by default)
 */
export async function completeTask(
    missionId: string,
    taskId: string,
    userId: string,
    userName: string,
    userEmail?: string,
    userSocialHandle?: string,
    metadata: Partial<TaskCompletion['metadata']> = {}
): Promise<TaskCompletion> {
    const db = getFirebaseFirestore();

    // Check if there's an existing flagged completion for this user/task
    const existingCompletions = await getDocs(
        query(
            collection(db, COLLECTION_NAME),
            where('missionId', '==', missionId),
            where('taskId', '==', taskId),
            where('userId', '==', userId),
            where('status', '==', 'flagged')
        )
    );

    // If there's a flagged completion, create a new one with pending status
    // This allows the user to redo the task and wait for creator verification
    const hasFlaggedCompletion = !existingCompletions.empty;
    const status = hasFlaggedCompletion ? 'pending' : 'verified';

    const completionData = {
        missionId,
        taskId,
        userId,
        userName,
        userEmail,
        userSocialHandle: userSocialHandle || null, // Convert undefined to null for Firebase
        status: status,
        completedAt: serverTimestamp(),
        verifiedAt: status === 'verified' ? serverTimestamp() : null,
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

        // Get the created document to return with ID
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docRef.id,
                ...data,
                completedAt: data.completedAt as Timestamp,
                verifiedAt: data.verifiedAt as Timestamp | null,
                createdAt: data.createdAt as Timestamp,
                updatedAt: data.updatedAt as Timestamp
            } as TaskCompletion;
        }

        throw new Error('Failed to create task completion');
    } catch (error) {
        console.error('Error completing task:', error);
        throw error;
    }
}

/**
 * Flag a task completion
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
 * Verify a flagged task completion (restore to verified)
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
            flaggedReason: null, // Clear the flagged reason
            flaggedAt: null, // Clear the flagged date
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
 * Get task completions for a specific mission
 * This function reads from both the new taskCompletions collection and the legacy mission_participations collection
 */
export async function getMissionTaskCompletions(missionId: string): Promise<TaskCompletion[]> {
    const db = getFirebaseFirestore();

    try {
        // Get completions from the new taskCompletions collection
        const q = query(
            collection(db, COLLECTION_NAME),
            where('missionId', '==', missionId),
            orderBy('completedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const completions: TaskCompletion[] = [];

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
            } as TaskCompletion);
        });

        // If no completions found in new collection, try legacy collection
        if (completions.length === 0) {

            // Get participations for this mission
            const participationQuery = query(
                collection(db, 'mission_participations'),
                where('mission_id', '==', missionId)
            );

            const participationSnapshot = await getDocs(participationQuery);

            participationSnapshot.forEach((participationDoc) => {
                const participationData = participationDoc.data();
                const tasksCompleted = participationData.tasks_completed || [];

                tasksCompleted.forEach((taskCompletion: any) => {
                    // Convert legacy format to new format
                    const convertedCompletion: TaskCompletion = {
                        id: `${participationDoc.id}-${taskCompletion.task_id}`,
                        missionId: missionId,
                        taskId: taskCompletion.task_id,
                        userId: participationData.user_id,
                        userName: participationData.user_name || 'Unknown User',
                        userEmail: participationData.user_email || null,
                        userSocialHandle: participationData.user_social_handle || null,
                        status: 'verified', // Legacy completions are considered verified
                        completedAt: new Date(taskCompletion.completed_at) as any,
                        verifiedAt: new Date(taskCompletion.completed_at) as any,
                        flaggedAt: null as any,
                        flaggedReason: null as any,
                        reviewedBy: null as any,
                        reviewedAt: null as any,
                        metadata: {
                            taskType: taskCompletion.task_id,
                            platform: 'twitter',
                            ...taskCompletion.verification_data
                        },
                        createdAt: new Date(taskCompletion.completed_at) as any,
                        updatedAt: new Date(taskCompletion.completed_at) as any
                    };

                    completions.push(convertedCompletion);
                });
            });
        }

        return completions;
    } catch (error) {
        console.error('Error getting mission task completions:', error);
        throw error;
    }
}

/**
 * Get task completions for a specific user
 */
export async function getUserTaskCompletions(userId: string): Promise<TaskCompletion[]> {
    const db = getFirebaseFirestore();

    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            orderBy('completedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const completions: TaskCompletion[] = [];

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
            } as TaskCompletion);
        });

        return completions;
    } catch (error) {
        console.error('Error getting user task completions:', error);
        throw error;
    }
}

/**
 * Get completion statistics for a mission
 */
export async function getMissionCompletionStats(missionId: string) {
    const completions = await getMissionTaskCompletions(missionId);

    return {
        total: completions.length,
        verified: completions.filter(c => c.status === 'verified').length,
        flagged: completions.filter(c => c.status === 'flagged').length,
        pending: completions.filter(c => c.status === 'pending').length,
        rejected: completions.filter(c => c.status === 'rejected').length,
    };
}

/**
 * Get user completion statistics
 */
export async function getUserCompletionStats(userId: string) {
    const completions = await getUserTaskCompletions(userId);

    return {
        total: completions.length,
        verified: completions.filter(c => c.status === 'verified').length,
        flagged: completions.filter(c => c.status === 'flagged').length,
        pending: completions.filter(c => c.status === 'pending').length,
        rejected: completions.filter(c => c.status === 'rejected').length,
    };
}

/**
 * Delete a task completion (admin only)
 */
export async function deleteTaskCompletion(completionId: string): Promise<void> {
    const db = getFirebaseFirestore();

    try {
        await deleteDoc(doc(db, COLLECTION_NAME, completionId));
    } catch (error) {
        console.error('Error deleting task completion:', error);
        throw error;
    }
}

/**
 * Get user's display name for task completions
 * Priority: social handle > first name > full name > email
 * Works with both Firebase TaskCompletion and regular TaskCompletion types
 */
export function getUserDisplayName(completion: any): string {
    // Use social handle if available
    if (completion.userSocialHandle) {
        return completion.userSocialHandle;
    }

    // Extract first name from full name
    if (completion.userName && completion.userName !== 'User') {
        const firstName = completion.userName.split(' ')[0];
        if (firstName && firstName.length > 0) {
            return firstName;
        }
    }

    // Fallback to full name
    if (completion.userName) {
        return completion.userName;
    }

    // Last resort: use email
    if (completion.userEmail) {
        return completion.userEmail.split('@')[0];
    }

    return 'Unknown User';
}
