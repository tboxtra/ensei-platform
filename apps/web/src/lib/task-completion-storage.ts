/**
 * Task Completion Storage System
 * Handles persistent storage of real user task completions
 */

import { TaskCompletion } from './task-verification';

const STORAGE_KEY = 'ensei_task_completions';

/**
 * Get all stored task completions
 */
export function getAllTaskCompletions(): TaskCompletion[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const completions = JSON.parse(stored);
    // Convert date strings back to Date objects
    return completions.map((completion: any) => ({
      ...completion,
      completedAt: new Date(completion.completedAt),
      verifiedAt: completion.verifiedAt ? new Date(completion.verifiedAt) : undefined,
      flaggedAt: completion.flaggedAt ? new Date(completion.flaggedAt) : undefined,
      reviewedAt: completion.reviewedAt ? new Date(completion.reviewedAt) : undefined,
    }));
  } catch (error) {
    console.error('Error loading task completions:', error);
    return [];
  }
}

/**
 * Save all task completions to storage
 */
function saveAllTaskCompletions(completions: TaskCompletion[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completions));
  } catch (error) {
    console.error('Error saving task completions:', error);
  }
}

/**
 * Add a new task completion
 */
export function addTaskCompletion(completion: TaskCompletion): void {
  const allCompletions = getAllTaskCompletions();
  
  // Check if this completion already exists (same user, mission, task)
  const existingIndex = allCompletions.findIndex(
    c => c.missionId === completion.missionId && 
         c.taskId === completion.taskId && 
         c.userId === completion.userId
  );
  
  if (existingIndex >= 0) {
    // Update existing completion
    allCompletions[existingIndex] = completion;
  } else {
    // Add new completion
    allCompletions.push(completion);
  }
  
  saveAllTaskCompletions(allCompletions);
}

/**
 * Get task completions for a specific mission
 */
export function getMissionTaskCompletions(missionId: string): TaskCompletion[] {
  const allCompletions = getAllTaskCompletions();
  return allCompletions.filter(completion => completion.missionId === missionId);
}

/**
 * Get task completions for a specific user
 */
export function getUserTaskCompletions(userId: string): TaskCompletion[] {
  const allCompletions = getAllTaskCompletions();
  return allCompletions.filter(completion => completion.userId === userId);
}

/**
 * Update a task completion
 */
export function updateTaskCompletion(completionId: string, updates: Partial<TaskCompletion>): void {
  const allCompletions = getAllTaskCompletions();
  const index = allCompletions.findIndex(c => c.id === completionId);
  
  if (index >= 0) {
    allCompletions[index] = { ...allCompletions[index], ...updates };
    saveAllTaskCompletions(allCompletions);
  }
}

/**
 * Delete a task completion
 */
export function deleteTaskCompletion(completionId: string): void {
  const allCompletions = getAllTaskCompletions();
  const filtered = allCompletions.filter(c => c.id !== completionId);
  saveAllTaskCompletions(filtered);
}

/**
 * Get completion statistics for a mission
 */
export function getMissionCompletionStats(missionId: string) {
  const completions = getMissionTaskCompletions(missionId);
  
  return {
    total: completions.length,
    verified: completions.filter(c => c.status === 'verified').length,
    flagged: completions.filter(c => c.status === 'flagged').length,
    pending: completions.filter(c => c.status === 'pending').length,
    rejected: completions.filter(c => c.status === 'rejected').length,
  };
}

/**
 * Get user completion statistics
 */
export function getUserCompletionStats(userId: string) {
  const completions = getUserTaskCompletions(userId);
  
  return {
    total: completions.length,
    verified: completions.filter(c => c.status === 'verified').length,
    flagged: completions.filter(c => c.status === 'flagged').length,
    pending: completions.filter(c => c.status === 'pending').length,
    rejected: completions.filter(c => c.status === 'rejected').length,
  };
}

/**
 * Clear all task completions (for testing/reset)
 */
export function clearAllTaskCompletions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export task completions (for backup/admin purposes)
 */
export function exportTaskCompletions(): string {
  const completions = getAllTaskCompletions();
  return JSON.stringify(completions, null, 2);
}

/**
 * Import task completions (for restore/admin purposes)
 */
export function importTaskCompletions(jsonData: string): boolean {
  try {
    const completions = JSON.parse(jsonData);
    if (Array.isArray(completions)) {
      saveAllTaskCompletions(completions);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing task completions:', error);
    return false;
  }
}
