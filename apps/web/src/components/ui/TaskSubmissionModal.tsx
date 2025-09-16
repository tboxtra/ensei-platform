'use client';

import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { getTasksForMission, TaskType, TaskAction } from '@/lib/taskTypes';
import { MissionTwitterIntents, TwitterIntents } from '@/lib/twitter-intents';
import { getFlaggingReasons, type TaskCompletion } from '@/lib/task-verification';
import { useAuth } from '../../contexts/UserAuthContext';
import { useCompleteTask } from '../../hooks/useTaskCompletions';

interface TaskSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    mission: any;
    selectedTaskType?: string | null;
    onTaskComplete: (taskId: string, actionId: string, data?: any) => Promise<void>;
}

interface TaskState {
    [taskId: string]: {
        isExpanded: boolean;
        completed: boolean;
        verificationData?: any;
    };
}

export default function TaskSubmissionModal({
    isOpen,
    onClose,
    mission,
    selectedTaskType,
    onTaskComplete
}: TaskSubmissionModalProps) {
    const { user, isAuthenticated } = useAuth();
    const [taskStates, setTaskStates] = useState<TaskState>({});
    const [loading, setLoading] = useState<string | null>(null);
    const [verificationLinks, setVerificationLinks] = useState<{ [key: string]: string }>({});
    const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([]);
    const [intentCompleted, setIntentCompleted] = useState<{ [taskId: string]: boolean }>({});

    console.log('TaskSubmissionModal render:', {
        isOpen,
        mission: mission?.id,
        missionPlatform: mission?.platform,
        missionType: mission?.mission_type,
        modalProps: { isOpen, onClose, mission, onTaskComplete }
    });

    if (!isOpen || !mission) {
        console.log('Modal not rendering because:', { isOpen, hasMission: !!mission });
        return null;
    }

    const allTasks = getTasksForMission(mission.platform, mission.mission_type);

    // Filter to show only the selected task type
    const tasks = selectedTaskType
        ? allTasks.filter(task => task.id === selectedTaskType)
        : allTasks;

    console.log('Tasks found for mission:', {
        platform: mission.platform,
        mission_type: mission.mission_type,
        selectedTaskType,
        allTasks: allTasks.length,
        filteredTasks: tasks.length,
        tasks
    });

    const totalTasks = tasks.length;
    const completedTasks = Object.values(taskStates).filter(state => state.completed).length;


    const handleAction = async (task: TaskType, action: TaskAction) => {
        setLoading(`${task.id}-${action.id}`);

        try {
            if (action.type === 'intent') {
                // Handle Twitter intent actions
                const intentUrl = MissionTwitterIntents.generateIntentUrl(task.id, mission);

                if (!intentUrl) {
                    const errorMessage = MissionTwitterIntents.getErrorMessage(task.id, mission);
                    alert(errorMessage || 'Unable to generate Twitter action. Please check mission data.');
                    return;
                }

                // Open Twitter intent in a new window
                TwitterIntents.openIntent(intentUrl, action.intentAction || task.id);

                // Mark intent as completed
                setIntentCompleted(prev => ({
                    ...prev,
                    [task.id]: true
                }));

                // Show success message
                alert(`Opening Twitter to ${action.label.toLowerCase()}. Complete the action and return to verify.`);

            } else if (action.type === 'auto') {
                // Handle automatic actions (like, retweet, follow)
                await onTaskComplete(task.id, action.id);

                setTaskStates(prev => ({
                    ...prev,
                    [task.id]: {
                        ...prev[task.id],
                        completed: true
                    }
                }));
            } else if (action.type === 'verify') {
                // Handle verification actions
                // Check if intent was completed first
                if (!intentCompleted[task.id]) {
                    alert(`Please complete the Twitter action first by clicking "${task.actions.find(a => a.type === 'intent')?.label || 'the intent button'}"`);
                    return;
                }

                // Check if user is authenticated
                if (!isAuthenticated || !user) {
                    alert('Please log in to complete tasks');
                    return;
                }

                // Complete the task with verification
                const completion = await completeTask(
                    mission.id,
                    task.id,
                    user.id,
                    user.name,
                    user.email,
                    mission.username, // userSocialHandle
                    {
                        taskType: task.id,
                        platform: 'twitter',
                        twitterHandle: mission.username,
                        tweetUrl: mission.tweetLink || mission.contentLink
                    }
                );

                // Add to completions
                setTaskCompletions(prev => [...prev, completion]);

                // Update task state
                setTaskStates(prev => ({
                    ...prev,
                    [task.id]: {
                        ...prev[task.id],
                        completed: true,
                        verificationData: { status: 'verified' }
                    }
                }));

                // Call the original onTaskComplete callback
                await onTaskComplete(task.id, action.id, { status: 'verified' });

                alert(`✅ ${task.name} completed and verified successfully!`);
            } else if (action.type === 'manual') {
                // Handle manual actions (view tweet, view profile)
                if (action.id === 'view_tweet' || action.id === 'view_post') {
                    window.open(mission.tweetLink || mission.contentLink, '_blank');
                } else if (action.id === 'view_profile') {
                    // Extract username from tweet link or use mission data
                    const username = extractUsernameFromLink(mission.tweetLink);
                    if (username) {
                        window.open(`https://twitter.com/${username}`, '_blank');
                    }
                }
            }
        } catch (error) {
            console.error('Error handling action:', error);
            alert('Error completing action. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    const extractUsernameFromLink = (link: string) => {
        if (!link) return null;
        const match = link.match(/twitter\.com\/([^\/]+)/);
        return match ? match[1] : null;
    };

    const getActionButtonStyle = (action: TaskAction, task: TaskType) => {
        const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2";

        // If task is verified, show all buttons as verified
        if (taskCompletions.some(c => c.taskId === task.id)) {
            return `${baseStyle} bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl`;
        }

        if (action.type === 'intent') {
            // Show yellow if intent completed, blue if not
            if (intentCompleted[task.id]) {
                return `${baseStyle} bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl`;
            }
            return `${baseStyle} bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl`;
        } else if (action.type === 'auto') {
            return `${baseStyle} bg-blue-500 hover:bg-blue-600 text-white`;
        } else if (action.type === 'verify') {
            // Show green if task completed, gray if not
            if (taskStates[task.id]?.completed) {
                return `${baseStyle} bg-green-500 hover:bg-green-600 text-white`;
            }
            return `${baseStyle} bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300`;
        } else {
            return `${baseStyle} bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300`;
        }
    };

    const getTaskIcon = (task: TaskType) => {
        const icons: { [key: string]: string } = {
            like: '👍',
            retweet: '🔄',
            comment: '💬',
            quote: '💭',
            follow: '👤',
            meme: '😂',
            thread: '🧵',
            article: '📝',
            videoreview: '🎥',
            pfp: '🖼️',
            name_bio_keywords: '📋',
            pinned_tweet: '📌',
            poll: '📊',
            spaces: '🎙️',
            community_raid: '⚔️'
        };
        return icons[task.id] || '📋';
    };

    return (
        <div
            className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {selectedTaskType ? `${tasks[0]?.name || selectedTaskType}` : 'Tasks'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>


                {/* Task Actions */}
                <div className="p-6">
                    {tasks.map((task) => (
                        <div key={task.id} className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">{getTaskIcon(task)}</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{task.name}</h3>
                                    <p className="text-sm text-gray-600">{task.description}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {task.actions.map((action) => (
                                    <div key={action.id} className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleAction(task, action)}
                                                disabled={loading === `${task.id}-${action.id}`}
                                                className={getActionButtonStyle(action, task)}
                                            >
                                                {loading === `${task.id}-${action.id}` ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        {(action.type === 'manual' || action.type === 'intent') && <ExternalLink className="w-4 h-4" />}
                                                        {action.label}
                                                    </>
                                                )}
                                            </button>

                                            {action.type === 'verify' && (
                                                <input
                                                    type="url"
                                                    placeholder="Paste your link here..."
                                                    value={verificationLinks[`${task.id}-${action.id}`] || ''}
                                                    onChange={(e) => setVerificationLinks(prev => ({
                                                        ...prev,
                                                        [`${task.id}-${action.id}`]: e.target.value
                                                    }))}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            )}
                                        </div>

                                        {action.type === 'intent' && (
                                            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded-lg">
                                                💡 This will open Twitter in a new window. Complete the action and return to verify.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

