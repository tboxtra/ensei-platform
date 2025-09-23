/**
 * User Stats Types
 * 
 * Data model for user statistics and mission progress tracking
 */

export interface UserStats {
    missionsCreated: number;
    missionsCompleted: number;
    tasksDone: number;
    totalEarned: number;        // in Honors (integer or fixed-point minor units)
    updatedAt: Date;
}

export interface UserMissionProgress {
    tasksRequired: number;
    tasksVerified: number;      // how many distinct tasks this user has completed for this mission
    completed: boolean;
    updatedAt: Date;
}

export interface UserTaskMarker {
    verified: boolean;
    at: Date;
}

export interface UserWin {
    won: boolean;
    at: Date;
}

export interface DegenWinners {
    winners: string[];          // list of uids
    honorsPerTask: number;
    missionId: string;
    winnersHash: string;        // for idempotency
}


