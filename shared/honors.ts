/**
 * Authoritative task → honor mapping for fixed missions
 * This is the single source of truth for task prices across the entire system
 */

export const FIXED_TASK_HONORS = {
    like: 50,
    retweet: 100,
    comment: 150,
    quote: 200,
    follow: 250,
} as const;

export type FixedTaskType = keyof typeof FIXED_TASK_HONORS;

/**
 * Get the honor value for a fixed mission task type
 * @param taskType - The task type (like, retweet, comment, quote, follow)
 * @returns The honor value in display units, or 0 if invalid
 */
export function getFixedTaskHonors(taskType: string): number {
    const normalizedType = taskType.toLowerCase() as FixedTaskType;
    return FIXED_TASK_HONORS[normalizedType] || 0;
}

/**
 * Validate that a task type is supported for fixed missions
 * @param taskType - The task type to validate
 * @returns True if the task type is supported
 */
export function isValidFixedTaskType(taskType: string): taskType is FixedTaskType {
    return taskType.toLowerCase() in FIXED_TASK_HONORS;
}

/**
 * Get all supported fixed task types
 * @returns Array of all supported task types
 */
export function getAllFixedTaskTypes(): FixedTaskType[] {
    return Object.keys(FIXED_TASK_HONORS) as FixedTaskType[];
}

/**
 * Calculate total honors for a set of fixed mission tasks
 * @param taskTypes - Array of task types
 * @returns Total honor value
 */
export function calculateFixedMissionHonors(taskTypes: string[]): number {
    return taskTypes.reduce((total, taskType) => {
        return total + getFixedTaskHonors(taskType);
    }, 0);
}

