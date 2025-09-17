'use client';

import React, { useState, useEffect, useRef } from 'react';
import { EmbeddedContent } from '@/components/ui/EmbeddedContent';
import { getTasksForMission } from '@/lib/taskTypes';
import { MissionTwitterIntents, TwitterIntents } from '@/lib/twitter-intents';
import { getUserDisplayName } from '@/lib/firebase-task-completions';
import { useAuth } from '../../contexts/UserAuthContext';
import { useUserMissionTaskCompletions, useCompleteTask, useIsTaskCompleted } from '../../hooks/useTaskCompletions';
import { Flag, AlertTriangle } from 'lucide-react';
import { XAccount } from '@/types/verification';
import { InlineVerification } from './InlineVerification';

interface VerificationMissionCardProps {
    mission: any;
    onParticipate?: (missionId: string, taskType?: string) => void;
    onViewDetails?: (missionId: string) => void;
    userXAccount?: XAccount;
    onVerificationSubmitted?: (submission: any) => void;
}

export function VerificationMissionCard({
    mission,
    onParticipate,
    onViewDetails,
    userXAccount,
    onVerificationSubmitted
}: VerificationMissionCardProps) {
    const { user, isAuthenticated } = useAuth();
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [intentCompleted, setIntentCompleted] = useState<{ [taskId: string]: boolean }>({});
    const [verificationStatus, setVerificationStatus] = useState<{ [taskId: string]: 'idle' | 'verified' | 'pending' }>({});
    const cardRef = useRef<HTMLDivElement>(null);

    // Standard practice: Use React Query hooks for server state management
    const { data: taskCompletions = [], isLoading: isLoadingCompletions } = useUserMissionTaskCompletions(
        mission.id,
        user?.id || ''
    );
    const completeTaskMutation = useCompleteTask();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                setSelectedTask(null);
            }
        };

        if (selectedTask) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedTask]);

    const getTaskTypes = () => {
        const missionType = mission.mission_type || mission.type || 'engage';
        const tasks = getTasksForMission(mission.platform, missionType);

        // Enhanced task name mapping for verification
        const taskNameMapping: { [key: string]: { display: string, id: string } } = {
            'like': { display: 'Like', id: 'like' },
            'retweet': { display: 'Retweet', id: 'retweet' },
            'comment': { display: 'Comment', id: 'comment' },
            'quote': { display: 'Quote', id: 'quote' },
            'follow': { display: 'Follow', id: 'follow' },
            'share': { display: 'Share', id: 'share' },
            'status_style': { display: 'Status Style', id: 'status_style' },
            'channel_post': { display: 'Channel Post', id: 'channel_post' },
            'flyer_clip_status': { display: 'Flyer Clip', id: 'flyer_clip_status' },
            'like_post': { display: 'Like Post', id: 'like_post' },
            'create_meme': { display: 'Create Meme', id: 'create_meme' },
            'update_profile_picture': { display: 'Update Profile Picture', id: 'update_profile_picture' },
            'write_article': { display: 'Write Article', id: 'write_article' },
            'create_story': { display: 'Create Story', id: 'create_story' },
            'share_post': { display: 'Share Post', id: 'share_post' },
            'join_group': { display: 'Join Group', id: 'join_group' },
            'send_message': { display: 'Send Message', id: 'send_message' },
            'create_channel': { display: 'Create Channel', id: 'create_channel' },
            'upload_video': { display: 'Upload Video', id: 'upload_video' },
            'create_playlist': { display: 'Create Playlist', id: 'create_playlist' },
            'subscribe_channel': { display: 'Subscribe Channel', id: 'subscribe_channel' },
            'like_video': { display: 'Like Video', id: 'like_video' },
            'comment_video': { display: 'Comment Video', id: 'comment_video' },
            'share_video': { display: 'Share Video', id: 'share_video' }
        };

        return tasks.map(task => {
            const mapping = taskNameMapping[task.id] || { display: task.id, id: task.id };
            return {
                ...task,
                displayName: mapping.display,
                taskId: mapping.id
            };
        });
    };

    const getTaskCompletionStatus = (taskId: string) => {
        const completion = taskCompletions.find(tc => tc.taskId === taskId);
        if (!completion) return { status: 'incomplete' as const, completedAt: null, flaggedReason: null, flaggedAt: null };

        return {
            status: completion.status as 'completed' | 'flagged' | 'incomplete',
            completedAt: completion.completedAt,
            flaggedReason: completion.flaggedReason,
            flaggedAt: completion.flaggedAt
        };
    };

    const handleVerificationSubmitted = (submission: any) => {
        setVerificationStatus(prev => ({
            ...prev,
            [submission.taskId]: 'verified'
        }));

        if (onVerificationSubmitted) {
            onVerificationSubmitted(submission);
        }
    };

    const getTaskButtonStyle = (taskId: string, completionStatus: any) => {
        const baseStyle = 'px-2 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.15)]';

        if (completionStatus.status === 'completed' || verificationStatus[taskId] === 'verified') {
            return `${baseStyle} bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30`;
        } else if (completionStatus.status === 'flagged') {
            return `${baseStyle} bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30`;
        } else if (verificationStatus[taskId] === 'pending') {
            return `${baseStyle} bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30`;
        } else {
            return `${baseStyle} bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30`;
        }
    };

    return (
        <div ref={cardRef} className="bg-gray-800/40 rounded-lg border border-gray-700/50 overflow-hidden">
            {/* Mission Header */}
            <div className="p-4 border-b border-gray-700/50">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-white font-medium text-lg mb-2">{mission.title}</h3>
                        <p className="text-gray-400 text-sm mb-3">{mission.description}</p>

                        {/* Mission Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Reward: {mission.reward || 0} points</span>
                            <span>Platform: {mission.platform}</span>
                            <span>Type: {mission.mission_type || mission.type || 'engage'}</span>
                        </div>
                    </div>

                    {onViewDetails && (
                        <button
                            onClick={() => onViewDetails(mission.id)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            View Details
                        </button>
                    )}
                </div>
            </div>

            {/* Content Preview */}
            {(mission.contentLink || mission.tweetLink) && (
                <div className="p-4 border-b border-gray-700/50">
                    <EmbeddedContent
                        url={mission.tweetLink || mission.contentLink}
                        className="aspect-[4/3] rounded-lg"
                    />
                </div>
            )}

            {/* Task Buttons */}
            <div className="p-4">
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {getTaskTypes().map((task, index) => {
                        const taskId = task.taskId;
                        const taskType = task.displayName;
                        const completionStatus = getTaskCompletionStatus(taskId);

                        return (
                            <div key={index} className="relative group">
                                <button
                                    onClick={() => setSelectedTask(selectedTask === taskId ? null : taskId)}
                                    className={getTaskButtonStyle(taskId, completionStatus)}
                                >
                                    <div className="flex items-center gap-1">
                                        {completionStatus.status === 'flagged' && (
                                            <Flag className="w-3 h-3" />
                                        )}
                                        {taskType}
                                    </div>
                                </button>

                                {/* Tooltip for flagged tasks */}
                                {completionStatus.status === 'flagged' && completionStatus.flaggedReason && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-900/95 text-red-100 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs">
                                        <div className="flex items-center gap-1 mb-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            <span className="font-semibold">Flagged</span>
                                        </div>
                                        <div className="text-red-200">{completionStatus.flaggedReason}</div>
                                        <div className="text-red-300 text-xs mt-1">
                                            {completionStatus.flaggedAt ?
                                                `Flagged ${new Date(completionStatus.flaggedAt).toLocaleDateString()}` :
                                                'Please redo this task correctly'
                                            }
                                        </div>
                                        {/* Arrow */}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-900/95"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Task Actions Dropdown */}
                {selectedTask && (
                    <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                        {(() => {
                            const missionType = mission.mission_type || mission.type || 'engage';
                            const tasks = getTasksForMission(mission.platform, missionType);
                            const task = tasks.find(t => t.id === selectedTask);

                            if (!task) {
                                return (
                                    <div className="text-red-400 text-sm space-y-2">
                                        <div>Task not found: {selectedTask}</div>
                                        <div>Available tasks: {tasks.map(t => t.id).join(', ')}</div>
                                        <div>Platform: {mission.platform}, Type: {missionType}</div>
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-3">
                                    <div className="mb-3 px-3 py-2 bg-gray-800/20 rounded-lg border-b border-gray-700/30">
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            {mission.instructions || 'No instructions provided for this task.'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                        {task.actions.map((action) => {
                                            // For comment and quote tasks, show only 2 buttons: intent and verify
                                            if ((selectedTask === 'comment' || selectedTask === 'quote')) {
                                                if (action.type === 'intent') {
                                                    return (
                                                        <button
                                                            key={action.id}
                                                            onClick={() => {
                                                                const intentUrl = MissionTwitterIntents.generateIntentUrl(task.id, mission);
                                                                if (intentUrl) {
                                                                    TwitterIntents.openIntent(intentUrl, action.intentAction || task.id);
                                                                    setIntentCompleted(prev => ({
                                                                        ...prev,
                                                                        [task.id]: true
                                                                    }));
                                                                }
                                                            }}
                                                            className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)]"
                                                        >
                                                            {selectedTask === 'comment' ? 'Comment on Twitter' : 'Quote on Twitter'}
                                                        </button>
                                                    );
                                                } else if (action.type === 'verify') {
                                                    return (
                                                        <InlineVerification
                                                            key={action.id}
                                                            taskId={selectedTask}
                                                            missionId={mission.id}
                                                            missionTitle={mission.title}
                                                            userXAccount={userXAccount}
                                                            onVerificationSubmitted={handleVerificationSubmitted}
                                                        />
                                                    );
                                                }
                                                return null;
                                            }

                                            // For other actions, show the normal button
                                            return (
                                                <button
                                                    key={action.id}
                                                    onClick={async () => {
                                                        try {
                                                            if (action.type === 'intent') {
                                                                const intentUrl = MissionTwitterIntents.generateIntentUrl(task.id, mission);
                                                                if (intentUrl) {
                                                                    TwitterIntents.openIntent(intentUrl, action.intentAction || task.id);
                                                                    setIntentCompleted(prev => ({
                                                                        ...prev,
                                                                        [task.id]: true
                                                                    }));
                                                                }
                                                            } else if (action.type === 'verify') {
                                                                if (!intentCompleted[task.id]) {
                                                                    return;
                                                                }
                                                                if (!isAuthenticated || !user) {
                                                                    return;
                                                                }
                                                                try {
                                                                    const result = await completeTaskMutation.mutateAsync({
                                                                        missionId: mission.id,
                                                                        taskId: task.id,
                                                                        userId: user.id,
                                                                        userName: user.name,
                                                                        userEmail: user.email,
                                                                        userSocialHandle: mission.username || null,
                                                                        metadata: {
                                                                            taskType: task.id,
                                                                            platform: 'twitter',
                                                                            twitterHandle: mission.username || null,
                                                                            tweetUrl: mission.tweetLink || mission.contentLink
                                                                        }
                                                                    });
                                                                } catch (error) {
                                                                    console.error('Error completing task:', error);
                                                                }
                                                            } else if (action.type === 'manual' && action.id === 'view_tweet') {
                                                                window.open(mission.tweetLink || mission.contentLink, '_blank');
                                                            } else if (action.type === 'manual' && action.id === 'view_post') {
                                                                window.open(mission.contentLink, '_blank');
                                                            } else if (action.type === 'manual' && action.id === 'view_profile') {
                                                                const username = extractUsernameFromLink(mission.tweetLink);
                                                                if (username) {
                                                                    window.open(`https://twitter.com/${username}`, '_blank');
                                                                }
                                                            }
                                                        } catch (error) {
                                                            console.error('Error handling action:', error);
                                                        }
                                                    }}
                                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.15)] ${action.type === 'auto'
                                                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                                            : action.type === 'verify'
                                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                                                        }`}
                                                >
                                                    {action.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper function to extract username from Twitter link
const extractUsernameFromLink = (link: string): string | null => {
    if (!link) return null;
    try {
        const url = new URL(link);
        const pathParts = url.pathname.split('/').filter(part => part);
        return pathParts[0] || null;
    } catch {
        return null;
    }
};
