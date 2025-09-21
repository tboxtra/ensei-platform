/**
 * User Activity Logger for Firebase
 * Logs user actions for task completion tracking and analytics
 */

import {
    collection,
    addDoc,
    serverTimestamp,
    FieldValue
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../../lib/firebase';

export interface UserActivityLog {
    id?: string;
    userId: string;
    missionId: string;
    taskId: string;
    actionType: 'intent' | 'verify' | 'link_submit' | 'redo';
    timestamp: FieldValue;
    metadata?: {
        userAgent?: string;
        sessionId?: string;
        ipAddress?: string;
        additionalData?: Record<string, any>;
    };
}

const COLLECTION_NAME = 'userActivityLogs';

/**
 * Log a user activity to Firebase
 */
export async function logUserActivity(
    userId: string,
    missionId: string,
    taskId: string,
    actionType: UserActivityLog['actionType'],
    metadata?: UserActivityLog['metadata']
): Promise<void> {
    const db = getFirebaseFirestore();

    try {
        const activityData: Omit<UserActivityLog, 'id'> = {
            userId,
            missionId,
            taskId,
            actionType,
            timestamp: serverTimestamp(),
            metadata: {
                userAgent: navigator.userAgent,
                sessionId: Date.now().toString(),
                ...metadata
            }
        };

        await addDoc(collection(db, COLLECTION_NAME), activityData);
        console.log('User activity logged to Firebase:', { userId, missionId, taskId, actionType });
    } catch (error) {
        console.error('Error logging user activity:', error);
        // Don't throw error to avoid breaking the main flow
    }
}

/**
 * Log intent action
 */
export async function logIntentAction(
    userId: string,
    missionId: string,
    taskId: string,
    additionalData?: Record<string, any>
): Promise<void> {
    return logUserActivity(userId, missionId, taskId, 'intent', {
        additionalData
    });
}

/**
 * Log verify action
 */
export async function logVerifyAction(
    userId: string,
    missionId: string,
    taskId: string,
    additionalData?: Record<string, any>
): Promise<void> {
    return logUserActivity(userId, missionId, taskId, 'verify', {
        additionalData
    });
}

/**
 * Log link submit action
 */
export async function logLinkSubmitAction(
    userId: string,
    missionId: string,
    taskId: string,
    url: string,
    additionalData?: Record<string, any>
): Promise<void> {
    return logUserActivity(userId, missionId, taskId, 'link_submit', {
        additionalData: {
            submittedUrl: url,
            ...additionalData
        }
    });
}

/**
 * Log redo action
 */
export async function logRedoAction(
    userId: string,
    missionId: string,
    taskId: string,
    additionalData?: Record<string, any>
): Promise<void> {
    return logUserActivity(userId, missionId, taskId, 'redo', {
        additionalData
    });
}
