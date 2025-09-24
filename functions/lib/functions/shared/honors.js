"use strict";
/**
 * Authoritative task honors mapping
 * Centralized source of truth for task pricing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIXED_TASK_HONORS = void 0;
exports.getFixedTaskHonors = getFixedTaskHonors;
exports.isValidTaskType = isValidTaskType;
exports.getValidTaskTypes = getValidTaskTypes;
exports.FIXED_TASK_HONORS = {
    like: 50,
    retweet: 100,
    comment: 150,
    quote: 200,
    follow: 250,
};
/**
 * Get the honor value for a fixed mission task type
 */
function getFixedTaskHonors(taskType) {
    const normalizedType = taskType.toLowerCase();
    return exports.FIXED_TASK_HONORS[normalizedType] || 0;
}
/**
 * Check if a task type is valid
 */
function isValidTaskType(taskType) {
    const normalizedType = taskType.toLowerCase();
    return normalizedType in exports.FIXED_TASK_HONORS;
}
/**
 * Get all valid task types
 */
function getValidTaskTypes() {
    return Object.keys(exports.FIXED_TASK_HONORS);
}
