/**
 * Unified Task Completion Types
 * Single source of truth for task completion interfaces
 * Industry Standard: Consolidated type definitions
 */

import { Timestamp } from 'firebase/firestore';

export interface TaskCompletion {
    id: string;
    missionId: string;
    taskId: string;
    userId: string;
    userName: string;
    userEmail?: string;
    userSocialHandle?: string; // Twitter handle, Instagram username, etc.
    status: 'pending' | 'verified' | 'flagged' | 'rejected';
    completedAt: Timestamp;
    verifiedAt?: Timestamp;
    flaggedAt?: Timestamp;
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
    reviewedAt?: Timestamp; // Legacy field, use verifiedAt/flaggedAt instead
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface TaskCompletionInput {
    missionId: string;
    taskId: string;
    userId: string;
    userName: string;
    userEmail?: string;
    userSocialHandle?: string;
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
}

export interface TaskCompletionUpdate {
    status?: 'pending' | 'verified' | 'flagged' | 'rejected';
    flaggedReason?: string;
    reviewerId?: string; // ID of reviewer (admin/moderator)
    verifiedAt?: Timestamp;
    flaggedAt?: Timestamp;
    reviewedBy?: string; // Legacy field
    reviewedAt?: Timestamp; // Legacy field
    updatedAt: Timestamp;
}

export type TaskStatus = 'idle' | 'intentDone' | 'pendingVerify' | 'verified' | 'flagged' | 'error';
export type VerifyMode = 'direct' | 'link';

export interface TaskItem {
    id: string;
    kind: 'like' | 'retweet' | 'follow' | 'comment' | 'quote';
    verifyMode: VerifyMode;
    status: TaskStatus;
    userLink?: string;
}

export interface TaskCompletionStatus {
    status: 'not_completed' | 'pending' | 'verified' | 'flagged' | 'rejected';
    flaggedReason?: string;
    flaggedAt?: Date;
    completedAt?: Date;
    verifiedAt?: Date;
}

export interface MissionTaskState {
    missionId: string;
    userId: string;
    taskId: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'verified' | 'flagged';
    completedAt?: Date;
    verifiedAt?: Date;
    flaggedAt?: Date;
    flaggedReason?: string;
}

// Task completion statistics
export interface TaskCompletionStats {
    totalCompletions: number;
    verifiedCompletions: number;
    flaggedCompletions: number;
    pendingCompletions: number;
    completionRate: number;
    lastActivity: Date;
}

// Mission completion statistics
export interface MissionCompletionStats {
    missionId: string;
    totalTasks: number;
    completedTasks: number;
    verifiedTasks: number;
    flaggedTasks: number;
    completionRate: number;
    lastActivity: Date;
}

// User completion statistics
export interface UserCompletionStats {
    userId: string;
    totalCompletions: number;
    verifiedCompletions: number;
    flaggedCompletions: number;
    pendingCompletions: number;
    completionRate: number;
    lastActivity: Date;
}

// Task completion filters
export interface TaskCompletionFilters {
    status?: 'pending' | 'verified' | 'flagged' | 'rejected';
    taskId?: string;
    userId?: string;
    missionId?: string;
    platform?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
}

// Task completion sort options
export interface TaskCompletionSort {
    field: 'createdAt' | 'updatedAt' | 'completedAt' | 'verifiedAt' | 'flaggedAt';
    direction: 'asc' | 'desc';
}

// Pagination for task completions
export interface TaskCompletionPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Task completion query result
export interface TaskCompletionQueryResult {
    data: TaskCompletion[];
    pagination: TaskCompletionPagination;
    filters: TaskCompletionFilters;
    sort: TaskCompletionSort;
}
