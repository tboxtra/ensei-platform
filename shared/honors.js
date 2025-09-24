"use strict";
/**
 * Authoritative task → honor mapping for fixed missions
 * This is the single source of truth for task prices across the entire system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIXED_TASK_HONORS = void 0;
exports.getFixedTaskHonors = getFixedTaskHonors;
exports.isValidFixedTaskType = isValidFixedTaskType;
exports.getAllFixedTaskTypes = getAllFixedTaskTypes;
exports.calculateFixedMissionHonors = calculateFixedMissionHonors;
exports.FIXED_TASK_HONORS = {
    like: 50,
    retweet: 100,
    comment: 150,
    quote: 200,
    follow: 250,
};
/**
 * Get the honor value for a fixed mission task type
 * @param taskType - The task type (like, retweet, comment, quote, follow)
 * @returns The honor value in display units, or 0 if invalid
 */
function getFixedTaskHonors(taskType) {
    const normalizedType = taskType.toLowerCase();
    return exports.FIXED_TASK_HONORS[normalizedType] || 0;
}
/**
 * Validate that a task type is supported for fixed missions
 * @param taskType - The task type to validate
 * @returns True if the task type is supported
 */
function isValidFixedTaskType(taskType) {
    return taskType.toLowerCase() in exports.FIXED_TASK_HONORS;
}
/**
 * Get all supported fixed task types
 * @returns Array of all supported task types
 */
function getAllFixedTaskTypes() {
    return Object.keys(exports.FIXED_TASK_HONORS);
}
/**
 * Calculate total honors for a set of fixed mission tasks
 * @param taskTypes - Array of task types
 * @returns Total honor value
 */
function calculateFixedMissionHonors(taskTypes) {
    return taskTypes.reduce((total, taskType) => {
        return total + getFixedTaskHonors(taskType);
    }, 0);
}
