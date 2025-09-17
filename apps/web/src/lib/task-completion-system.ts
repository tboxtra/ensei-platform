/**
 * Reusable Task Completion System
 * Provides consistent task completion logic and styling across the platform
 */

export interface TaskCompletionSystemState {
  taskId: string;
  status: 'not_started' | 'intent_completed' | 'verified' | 'flagged';
  completedAt?: Date;
  verifiedAt?: Date;
  flaggedReason?: string;
  flaggedAt?: Date;
}

export interface TaskActionState {
  actionId: string;
  completed: boolean;
  completedAt?: Date;
}

export interface TaskCompletionSystemProps {
  missionId: string;
  taskId: string;
  userId: string;
  taskCompletions: TaskCompletionSystemState[];
  intentCompleted: { [taskId: string]: boolean };
  onTaskComplete?: (taskId: string, actionId: string, verificationData?: any) => void;
  onIntentComplete?: (taskId: string) => void;
}

/**
 * Get button styling based on task completion state
 * Matches the main platform's TaskSubmissionModal styling
 */
export function getTaskButtonStyle(
  taskId: string,
  taskCompletions: TaskCompletionSystemState[],
  intentCompleted: { [taskId: string]: boolean },
  actionType: 'intent' | 'verify' | 'auto' | 'manual' = 'intent'
): string {
  const baseStyle = 'px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.15)]';
  
  // Check if task is completed/verified
  const taskCompletion = taskCompletions.find(tc => tc.taskId === taskId);
  const isTaskCompleted = taskCompletion?.status === 'verified';
  const isTaskFlagged = taskCompletion?.status === 'flagged';
  
  // If task is completed, ALL buttons should be green
  if (isTaskCompleted) {
    return `${baseStyle} bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30`;
  }
  
  // If task is flagged, show red
  if (isTaskFlagged) {
    return `${baseStyle} bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30`;
  }
  
  // Default styling based on action type
  if (actionType === 'intent') {
    // Show yellow if intent completed, blue if not
    if (intentCompleted[taskId]) {
      return `${baseStyle} bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30`;
    }
    return `${baseStyle} bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30`;
  }
  
  if (actionType === 'verify') {
    // Show green if task completed, gray if not
    if (isTaskCompleted) {
      return `${baseStyle} bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30`;
    }
    return `${baseStyle} bg-gray-500/20 text-gray-400 hover:bg-gray-500/30`;
  }
  
  if (actionType === 'auto') {
    return `${baseStyle} bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30`;
  }
  
  return `${baseStyle} bg-gray-500/20 text-gray-400 hover:bg-gray-500/30`;
}

/**
 * Get main task button styling (for the task pills)
 */
export function getMainTaskButtonStyle(
  taskId: string,
  taskCompletions: TaskCompletionSystemState[]
): string {
  const baseStyle = 'px-2 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.15)]';
  
  const taskCompletion = taskCompletions.find(tc => tc.taskId === taskId);
  
  if (taskCompletion?.status === 'verified') {
    return `${baseStyle} bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30`;
  } else if (taskCompletion?.status === 'flagged') {
    return `${baseStyle} bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30`;
  } else if (taskCompletion?.status === 'intent_completed') {
    return `${baseStyle} bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30`;
  } else {
    return `${baseStyle} bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30`;
  }
}

/**
 * Get input field styling to match button height and design
 */
export function getInputFieldStyle(): string {
  return 'w-full px-2 py-1 rounded-lg text-xs font-medium bg-gray-800/40 text-white placeholder-gray-400 border border-gray-700/50 focus:border-blue-500/50 focus:outline-none transition-all duration-200 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed';
}

/**
 * Handle task completion logic
 */
export async function handleTaskCompletion(
  taskId: string,
  actionId: string,
  system: TaskCompletionSystemProps,
  verificationData?: any
): Promise<void> {
  try {
    // Mark intent as completed if it's an intent action
    if (actionId.includes('intent') || actionId.includes('auto')) {
      system.onIntentComplete?.(taskId);
    }
    
    // Handle verification completion
    if (actionId.includes('verify')) {
      // Create task completion record
      const completion: TaskCompletionState = {
        taskId,
        status: 'verified',
        completedAt: new Date(),
        verifiedAt: new Date()
      };
      
      // Call completion callback
      system.onTaskComplete?.(taskId, actionId, verificationData);
    }
  } catch (error) {
    console.error('Error handling task completion:', error);
    throw error;
  }
}

/**
 * Check if task is completed
 */
export function isTaskCompleted(
  taskId: string,
  taskCompletions: TaskCompletionSystemState[]
): boolean {
  const completion = taskCompletions.find(tc => tc.taskId === taskId);
  return completion?.status === 'verified';
}

/**
 * Check if task is flagged
 */
export function isTaskFlagged(
  taskId: string,
  taskCompletions: TaskCompletionSystemState[]
): boolean {
  const completion = taskCompletions.find(tc => tc.taskId === taskId);
  return completion?.status === 'flagged';
}

/**
 * Get task completion status
 */
export function getTaskCompletionStatus(
  taskId: string,
  taskCompletions: TaskCompletionSystemState[]
): TaskCompletionSystemState['status'] {
  const completion = taskCompletions.find(tc => tc.taskId === taskId);
  return completion?.status || 'not_started';
}
