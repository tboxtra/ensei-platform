/**
 * Task Verification System for the Platform
 * Handles task completion, verification, and flagging in the actual platform
 */

import { 
  addTaskCompletion, 
  getMissionTaskCompletions as getStoredMissionCompletions,
  updateTaskCompletion,
  getAllTaskCompletions
} from './task-completion-storage';

export interface TaskCompletion {
  id: string;
  missionId: string;
  taskId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  status: 'pending' | 'verified' | 'flagged' | 'rejected';
  completedAt: Date;
  verifiedAt?: Date;
  flaggedAt?: Date;
  flaggedReason?: string;
  proof?: string;
  metadata: {
    taskType: string;
    platform: string;
    twitterHandle?: string;
    tweetUrl?: string;
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
  };
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface MissionTaskState {
  missionId: string;
  userId: string;
  tasks: {
    [taskId: string]: {
      status: 'not_started' | 'in_progress' | 'completed' | 'verified' | 'flagged';
      intentCompleted: boolean;
      completedAt?: Date;
      verifiedAt?: Date;
      flaggedAt?: Date;
      flaggedReason?: string;
    };
  };
}

const FLAGGING_REASONS = [
  { id: 'incomplete', label: 'User didn\'t complete the task' },
  { id: 'bot', label: 'User appears to be a bot' },
  { id: 'low_value', label: 'Low value account' },
  { id: 'spam', label: 'Spam or inappropriate content' },
  { id: 'duplicate', label: 'Duplicate submission' },
  { id: 'fake', label: 'Fake or manipulated proof' },
  { id: 'other', label: 'Other reason' }
];

/**
 * Complete a task (mark as verified by default)
 */
export async function completeTask(
  missionId: string,
  taskId: string,
  userId: string,
  userName: string,
  metadata: Partial<TaskCompletion['metadata']> = {}
): Promise<TaskCompletion> {
  const completion: TaskCompletion = {
    id: generateId(),
    missionId,
    taskId,
    userId,
    userName,
    status: 'verified', // Tasks are verified by default
    completedAt: new Date(),
    verifiedAt: new Date(),
    metadata: {
      taskType: taskId,
      platform: 'twitter',
      ...metadata
    }
  };

  // Save to real storage
  addTaskCompletion(completion);
  console.log('Task completed and saved:', completion);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return completion;
}

/**
 * Flag a task completion
 */
export async function flagTaskCompletion(
  completionId: string,
  reason: string,
  reviewerId: string,
  reviewerName: string
): Promise<TaskCompletion> {
  // Find the existing completion
  const allCompletions = getAllTaskCompletions();
  const existingCompletion = allCompletions.find(c => c.id === completionId);
  
  if (!existingCompletion) {
    throw new Error('Task completion not found');
  }

  // Update the completion with flagged status
  const flaggedCompletion: TaskCompletion = {
    ...existingCompletion,
    status: 'flagged',
    flaggedAt: new Date(),
    flaggedReason: reason,
    reviewedBy: reviewerId,
    reviewedAt: new Date()
  };

  // Update in storage
  updateTaskCompletion(completionId, flaggedCompletion);
  console.log('Task flagged:', flaggedCompletion);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return flaggedCompletion;
}

/**
 * Verify a flagged task completion (restore to verified)
 */
export async function verifyTaskCompletion(
  completionId: string,
  reviewerId: string,
  reviewerName: string
): Promise<TaskCompletion> {
  // Find the existing completion
  const allCompletions = getAllTaskCompletions();
  const existingCompletion = allCompletions.find(c => c.id === completionId);
  
  if (!existingCompletion) {
    throw new Error('Task completion not found');
  }

  // Update the completion with verified status and clear flagged data
  const verifiedCompletion: TaskCompletion = {
    ...existingCompletion,
    status: 'verified',
    verifiedAt: new Date(),
    flaggedReason: undefined, // Clear the flagged reason
    flaggedAt: undefined, // Clear the flagged date
    reviewedBy: reviewerId,
    reviewedAt: new Date()
  };

  // Update in storage
  updateTaskCompletion(completionId, verifiedCompletion);
  console.log('Task verified:', verifiedCompletion);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return verifiedCompletion;
}

/**
 * Get task completions for a mission
 */
export async function getMissionTaskCompletions(missionId: string): Promise<TaskCompletion[]> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Return real data from storage
  return getStoredMissionCompletions(missionId);
}

/**
 * Get user's task completion status for a mission
 */
export async function getUserMissionTaskState(
  missionId: string,
  userId: string
): Promise<MissionTaskState> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    missionId,
    userId,
    tasks: {
      'like': {
        status: 'not_started',
        intentCompleted: false
      },
      'retweet': {
        status: 'not_started',
        intentCompleted: false
      },
      'comment': {
        status: 'not_started',
        intentCompleted: false
      },
      'quote': {
        status: 'not_started',
        intentCompleted: false
      },
      'follow': {
        status: 'not_started',
        intentCompleted: false
      }
    }
  };
}

/**
 * Update user's task state (for intent completion tracking)
 */
export async function updateUserTaskState(
  missionId: string,
  userId: string,
  taskId: string,
  updates: Partial<MissionTaskState['tasks'][string]>
): Promise<void> {
  // In a real implementation, this would update the database
  console.log('Updating task state:', { missionId, userId, taskId, updates });
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Get flagging reasons
 */
export function getFlaggingReasons() {
  return FLAGGING_REASONS;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
