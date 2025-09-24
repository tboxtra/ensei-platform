/**
 * Authoritative task honors mapping
 * Centralized source of truth for task pricing
 */

export const FIXED_TASK_HONORS = {
    like: 50,
    retweet: 100,
    comment: 150,
    quote: 200,
    follow: 250,
} as const;

/**
 * Get the honor value for a fixed mission task type
 */
export function getFixedTaskHonors(taskType: string): number {
    const normalizedType = taskType.toLowerCase();
    return FIXED_TASK_HONORS[normalizedType as keyof typeof FIXED_TASK_HONORS] || 0;
}

/**
 * Check if a task type is valid
 */
export function isValidTaskType(taskType: string): boolean {
    const normalizedType = taskType.toLowerCase();
    return normalizedType in FIXED_TASK_HONORS;
}

/**
 * Get all valid task types
 */
export function getValidTaskTypes(): string[] {
    return Object.keys(FIXED_TASK_HONORS);
}
