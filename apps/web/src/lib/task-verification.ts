/**
 * Task Verification System for the Platform
 * Handles task completion, verification, and flagging in the actual platform
 * Now uses Firebase Firestore for proper server-side storage
 */

import { dateFromAny } from '../features/missions/utils/dates';
import {
    completeTask as firebaseCompleteTask,
    flagTaskCompletion as firebaseFlagTaskCompletion,
    verifyTaskCompletion as firebaseVerifyTaskCompletion,
    getMissionTaskCompletions as firebaseGetMissionTaskCompletions
} from './firebase-task-completions';

export interface TaskCompletion {
    id: string;
    missionId: string;
    taskId: string;
    userId: string;
    userName: string;
    userEmail?: string;
    userSocialHandle?: string; // Twitter handle, Instagram username, etc.
    status: 'pending' | 'verified' | 'flagged' | 'rejected';
    completedAt: Date;
    verifiedAt?: Date;
    flaggedAt?: Date;
    flaggedReason?: string;
    proof?: string;
    metadata: {
        taskType: string;
        platform: string;
        twitterHandle?: string;
        tweetUrl?: string;
        userAgent?: string;
        ipAddress?: string;
        sessionId?: string;
    };
    reviewedBy?: string;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface MissionTaskState {
    missionId: string;
    userId: string;
    tasks: {
        [taskId: string]: {
            status: 'not_started' | 'in_progress' | 'completed' | 'verified' | 'flagged';
            intentCompleted: boolean;
            completedAt?: Date;
            verifiedAt?: Date;
            flaggedAt?: Date;
            flaggedReason?: string;
        };
    };
}

const FLAGGING_REASONS = [
    { id: 'incomplete', label: 'User didn\'t complete the task' },
    { id: 'bot', label: 'User appears to be a bot' },
    { id: 'low_value', label: 'Low value account' },
    { id: 'spam', label: 'Spam or inappropriate content' },
    { id: 'duplicate', label: 'Duplicate submission' },
    { id: 'fake', label: 'Fake or manipulated proof' },
    { id: 'other', label: 'Other reason' }
];

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
    try {
        const completion = await firebaseCompleteTask(
            missionId,
            taskId,
            userId,
            userName,
            userEmail,
            userSocialHandle,
            metadata
        );

        // Convert Firebase Timestamps to JavaScript Dates for compatibility
        const convertedCompletion: TaskCompletion = {
            ...completion,
            completedAt: dateFromAny(completion.completedAt) || new Date(),
            verifiedAt: dateFromAny(completion.verifiedAt) || undefined,
            flaggedAt: dateFromAny(completion.flaggedAt) || undefined,
            reviewedAt: dateFromAny(completion.reviewedAt) || undefined,
            createdAt: dateFromAny(completion.createdAt) || new Date(),
            updatedAt: dateFromAny(completion.updatedAt) || new Date()
        };

        console.log('Task completed and saved to Firebase:', convertedCompletion);
        return convertedCompletion;
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
    try {
        await firebaseFlagTaskCompletion(completionId, reason, reviewerId, reviewerName);
        console.log('Task flagged in Firebase:', completionId);
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
    try {
        await firebaseVerifyTaskCompletion(completionId, reviewerId, reviewerName);
        console.log('Task verified in Firebase:', completionId);
    } catch (error) {
        console.error('Error verifying task completion:', error);
        throw error;
    }
}

/**
 * Get task completions for a mission
 */
export async function getMissionTaskCompletions(missionId: string): Promise<TaskCompletion[]> {
    try {
        const completions = await firebaseGetMissionTaskCompletions(missionId);

        // Convert Firebase Timestamps to JavaScript Dates for compatibility
        return completions.map(completion => ({
            ...completion,
            completedAt: dateFromAny(completion.completedAt) || new Date(),
            verifiedAt: dateFromAny(completion.verifiedAt) || undefined,
            flaggedAt: dateFromAny(completion.flaggedAt) || undefined,
            reviewedAt: dateFromAny(completion.reviewedAt) || undefined,
            createdAt: dateFromAny(completion.createdAt) || new Date(),
            updatedAt: dateFromAny(completion.updatedAt) || new Date()
        }));
    } catch (error) {
        console.error('Error getting mission task completions:', error);
        throw error;
    }
}

/**
 * Get user's task completion status for a mission
 */
export async function getUserMissionTaskState(
    missionId: string,
    userId: string
): Promise<MissionTaskState> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
        missionId,
        userId,
        tasks: {
            'like': {
                status: 'not_started',
                intentCompleted: false
            },
            'retweet': {
                status: 'not_started',
                intentCompleted: false
            },
            'comment': {
                status: 'not_started',
                intentCompleted: false
            },
            'quote': {
                status: 'not_started',
                intentCompleted: false
            },
            'follow': {
                status: 'not_started',
                intentCompleted: false
            }
        }
    };
}

/**
 * Update user's task state (for intent completion tracking)
 */
export async function updateUserTaskState(
    missionId: string,
    userId: string,
    taskId: string,
    updates: Partial<MissionTaskState['tasks'][string]>
): Promise<void> {
    // In a real implementation, this would update the database
    console.log('Updating task state:', { missionId, userId, taskId, updates });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Get flagging reasons
 */
export function getFlaggingReasons() {
    return FLAGGING_REASONS;
}

/**
 * Get user's display name for task completions
 * Priority: social handle > first name > full name > email
 */
export function getUserDisplayName(completion: TaskCompletion): string {
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
