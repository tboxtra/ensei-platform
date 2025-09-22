/**
 * Task utility functions for normalizing task IDs and statuses
 * Handles legacy/camel/snake case variations safely
 */

export const getTaskIdFromCompletion = (c: any): string | undefined =>
    c?.taskId ?? c?.task_id ?? c?.requirementId ?? c?.requirement_id ?? c?.action ?? c?.type;

export const isVerified = (c: any): boolean =>
    (c?.status ?? '').toLowerCase() === 'verified';

