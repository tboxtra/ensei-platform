/**
 * Mission Status Logic
 * 
 * Handles status calculation for fixed vs degen missions
 * with proper winners cap logic and time-based status
 */

import type { MissionType, MissionAggregates, MissionStatus, StatusChipProps } from '../types/mission-aggregates';

const pct = (num: number, den: number) => den > 0 ? num / den : 0;

/**
 * Calculate status for fixed missions (with winners caps)
 */
export function statusForFixed(now: Date, mission: MissionType, agg: MissionAggregates): MissionStatus {
    const elapsed = now.getTime() - mission.startAt.getTime();
    const duration = (mission.endAt ?? mission.startAt).getTime() - mission.startAt.getTime();
    const timePct = pct(elapsed, duration);

    // Almost ending if time >= 90% OR winners per task >= 90%
    const winnersPcts = mission.tasks.map(t => pct(agg.taskCounts[t.id] ?? 0, mission.winnersPerTask!));
    const winners90 = winnersPcts.some(p => p >= 0.9);

    // Check if all tasks hit cap
    if (Object.values(agg.taskCounts).length && mission.tasks.every(t => (agg.taskCounts[t.id] ?? 0) >= mission.winnersPerTask!)) {
        return 'completed'; // all tasks hit cap
    }

    if (timePct >= 1) return 'completed'; // time exhausted
    if (timePct >= 0.9 || winners90) return 'almost-ending';
    return 'in-progress';
}

/**
 * Calculate status for degen missions (unlimited winners)
 */
export function statusForDegen(now: Date, mission: MissionType): MissionStatus {
    const elapsed = now.getTime() - mission.startAt.getTime();
    const duration = (mission.endAt ?? mission.startAt).getTime() - mission.startAt.getTime();
    const timePct = pct(elapsed, duration);

    if (timePct >= 1) return 'completed'; // timer reached zero
    if (timePct >= 0.9) return 'almost-ending';
    return 'in-progress';
}

/**
 * Get mission status based on type
 */
export function getMissionStatus(now: Date, mission: MissionType, agg: MissionAggregates): MissionStatus {
    if (mission.type === 'fixed') {
        return statusForFixed(now, mission, agg);
    } else {
        return statusForDegen(now, mission);
    }
}

/**
 * Get status chip properties for UI rendering
 */
export function getStatusChipProps(status: MissionStatus): StatusChipProps {
    switch (status) {
        case 'in-progress':
            return {
                label: 'In Progress',
                className: 'chip--green chip--blinking',
                blinking: true
            };
        case 'almost-ending':
            return {
                label: 'Almost ending',
                className: 'chip--amber chip--blinking',
                blinking: true
            };
        case 'completed':
            return {
                label: 'Completed',
                className: 'chip--green',
                blinking: false
            };
    }
}

/**
 * Check if a specific task is full (for fixed missions)
 */
export function isTaskFull(taskId: string, mission: MissionType, agg: MissionAggregates): boolean {
    if (mission.type !== 'fixed' || !mission.winnersPerTask) return false;
    return (agg.taskCounts[taskId] ?? 0) >= mission.winnersPerTask;
}

/**
 * Get progress percentage for a specific task
 */
export function getTaskProgress(taskId: string, mission: MissionType, agg: MissionAggregates): number {
    if (mission.type !== 'fixed' || !mission.winnersPerTask) return 0;
    return pct(agg.taskCounts[taskId] ?? 0, mission.winnersPerTask);
}

/**
 * Get overall mission progress percentage
 */
export function getMissionProgress(mission: MissionType, agg: MissionAggregates): number {
    if (mission.type !== 'fixed' || !mission.winnersPerTask) return 0;

    const totalPossible = mission.tasks.length * mission.winnersPerTask;
    const totalCompleted = mission.tasks.reduce((sum, task) => sum + (agg.taskCounts[task.id] ?? 0), 0);

    return pct(totalCompleted, totalPossible);
}


