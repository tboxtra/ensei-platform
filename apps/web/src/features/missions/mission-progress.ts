/**
 * Mission Progress Summary Types
 * Lightweight denormalized summaries for efficient queries
 */

import { Timestamp } from 'firebase/firestore';

export interface MissionProgress {
    userId: string;
    missionId: string;
    verifiedTaskIds: string[];        // normalized, distinct task IDs
    verifiedCount: number;           // verifiedTaskIds.length
    totalTasks: number;             // mission.tasks.length
    missionCompleted: boolean;      // verifiedCount === totalTasks
    completedAt?: Timestamp | null; // first time missionCompleted flips true
    updatedAt: Timestamp;
}

export interface MissionProgressQuery {
    userId?: string;
    missionId?: string;
    missionCompleted?: boolean;
    limit?: number;
    orderBy?: 'updatedAt' | 'completedAt';
    orderDirection?: 'asc' | 'desc';
}

export interface MissionProgressStats {
    totalMissions: number;
    completedMissions: number;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
}

