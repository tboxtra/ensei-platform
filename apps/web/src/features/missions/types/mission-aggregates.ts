/**
 * Mission Aggregates Types
 * 
 * Public aggregate data for mission progress that can be read by all users
 * Updated by Cloud Functions to maintain real-time counts
 */

export interface MissionAggregates {
    // per task id -> number of verified completions
    taskCounts: Record<string, number>;
    // total verified completions across tasks (optional)
    totalCompletions: number;
    // total winners capacity per task (mirror from mission)
    winnersPerTask: number | null;
    // number of tasks per mission
    taskCount: number;
    // last updated timestamp
    updatedAt: Date;
}

export interface MissionType {
    id: string;
    type: 'fixed' | 'degen';
    startAt: Date;
    endAt: Date | null;
    maxDurationHours?: number;    // fixed: 48 enforced
    winnersPerTask: number | null; // fixed: finite (e.g., 200). degen: null (unlimited)
    tasks: Array<{ id: string; label: 'Like' | 'Retweet' | 'Comment' | 'Quote' | 'Follow' }>;
    created_by: string;
}

export type MissionStatus = 'in-progress' | 'almost-ending' | 'completed';

export interface StatusChipProps {
    label: string;
    className: string;
    blinking?: boolean;
}
