import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { EmbeddedContent } from './EmbeddedContent';
import { MissionTwitterIntents, TwitterIntents } from '@/lib/twitter-intents';
import { useAuth, type User } from '../../contexts/UserAuthContext';
import {
    useUserMissionTaskCompletions,
    useCompleteTask,
    useRedoTaskCompletion,
    useSubmitTaskLink,
    toneFor
} from '../../hooks/useTaskCompletions';
import { Flag, AlertTriangle } from 'lucide-react';
import type { TaskStatus, VerifyMode } from '../../types/task-completion';

interface CompactMissionCardProps {
    mission: any;
    onParticipate?: (missionId: string, taskType?: string) => void;
    onViewDetails?: (missionId: string) => void;
}

export function CompactMissionCard({
    mission,
    onParticipate,
    onViewDetails
}: CompactMissionCardProps) {
    const { user, isAuthenticated } = useAuth();
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [showTaskDropdown, setShowTaskDropdown] = useState<{ [taskId: string]: boolean }>({});
    const [taskStates, setTaskStates] = useState<{ [taskId: string]: TaskStatus }>({});
    const [showLinkPanel, setShowLinkPanel] = useState<{ [taskId: string]: boolean }>({});
    const [linkInputs, setLinkInputs] = useState<{ [taskId: string]: string }>({});
    const cardRef = useRef<HTMLDivElement>(null);

    // Unified Task Status System - single source of truth
    const { data: taskCompletions = [], isLoading: isLoadingCompletions } = useUserMissionTaskCompletions(
        mission.id,
        user?.id || ''
    );
    const completeTaskMutation = useCompleteTask();
    const redoTaskMutation = useRedoTaskCompletion();
    const submitTaskLinkMutation = useSubmitTaskLink();





    useEffect(() => {
        const anyOpen =
            Object.values(showTaskDropdown).some(Boolean) ||
            Object.values(showLinkPanel).some(Boolean);

        if (!anyOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
                setShowTaskDropdown({}); // close all
                setShowLinkPanel({});    // close all sliders
                setSelectedTask(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showTaskDropdown, showLinkPanel]);

    // Helper function to determine verify mode for a task
    const getVerifyMode = useCallback((taskId: string): VerifyMode => {
        return ['comment', 'quote'].includes(taskId) ? 'link' : 'direct';
    }, []);

    // Helper function to get current task status
    const getTaskStatus = useCallback((taskId: string): TaskStatus => {
        // Check if we have a local state override
        if (taskStates[taskId]) {
            return taskStates[taskId];
        }

        // Get from task completions
        const taskCompletionsForTask = taskCompletions
            .filter(c => c.taskId === taskId)
            .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

        if (taskCompletionsForTask.length === 0) {
            return 'idle';
        }

        const latestCompletion = taskCompletionsForTask[0];
        switch (latestCompletion.status) {
            case 'verified':
                return 'verified';
            case 'flagged':
                return 'flagged';
            case 'pending':
                return 'pendingVerify';
            default:
                return 'idle';
        }
    }, [taskStates, taskCompletions]);


    const getModelColor = (model: string) => {
        switch (model?.toLowerCase()) {
            case 'fixed': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'degen': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'premium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'custom': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform?.toLowerCase()) {
            case 'twitter': return '𝕏';
            case 'instagram': return '📷';
            case 'youtube': return '📺';
            case 'tiktok': return '🎵';
            case 'linkedin': return '💼';
            case 'discord': return '💬';
            case 'facebook': return '📘';
            case 'whatsapp': return '💬';
            case 'snapchat': return '👻';
            case 'telegram': return '✈️';
            default: return '🌐';
        }
    };

    const getPlatformColor = (platform: string) => {
        switch (platform?.toLowerCase()) {
            case 'twitter': return 'bg-blue-500';
            case 'instagram': return 'bg-gradient-to-br from-purple-500 to-pink-500';
            case 'youtube': return 'bg-red-500';
            case 'tiktok': return 'bg-black';
            case 'linkedin': return 'bg-blue-600';
            case 'discord': return 'bg-indigo-500';
            case 'facebook': return 'bg-blue-600';
            case 'whatsapp': return 'bg-green-500';
            case 'snapchat': return 'bg-yellow-400';
            case 'telegram': return 'bg-blue-400';
            default: return 'bg-gradient-to-br from-blue-500 to-purple-600';
        }
    };

    const getPlatformName = (platform: string) => {
        switch (platform?.toLowerCase()) {
            case 'twitter': return 'X';
            case 'instagram': return 'Instagram';
            case 'youtube': return 'YouTube';
            case 'tiktok': return 'TikTok';
            case 'linkedin': return 'LinkedIn';
            case 'discord': return 'Discord';
            case 'facebook': return 'Facebook';
            case 'whatsapp': return 'WhatsApp';
            case 'snapchat': return 'Snapchat';
            case 'telegram': return 'Telegram';
            default: return platform?.charAt(0).toUpperCase() + platform?.slice(1) || 'Platform';
        }
    };

    const formatReward = (mission: any) => {
        // First check for direct USD cost from mission creation
        if (mission.rewards?.usd) {
            return `$${mission.rewards.usd.toFixed(2)}`;
        }
        if (mission.total_cost_usd) {
            return `$${mission.total_cost_usd.toFixed(2)}`;
        }
        if (mission.total_cost) {
            return `$${mission.total_cost.toFixed(2)}`;
        }
        if (mission.cost_usd) {
            return `$${mission.cost_usd.toFixed(2)}`;
        }
        if (mission.cost) {
            return `$${mission.cost.toFixed(2)}`;
        }

        // Convert honors to USD if available (450 honors = $1)
        if (mission.total_cost_honors) {
            const usdAmount = (mission.total_cost_honors / 450).toFixed(2);
            return `$${usdAmount}`;
        }

        // Calculate estimated cost based on tasks and participants (fallback)
        if (mission.tasks && mission.tasks.length > 0) {
            const taskPrices = {
                like: 50, retweet: 100, comment: 150, quote: 200, follow: 250,
                meme: 300, thread: 500, article: 400, videoreview: 600,
                pfp: 250, name_bio_keywords: 200, pinned_tweet: 300, poll: 150,
                spaces: 800, community_raid: 400, status_50_views: 300
            };

            const totalTaskCost = mission.tasks.reduce((sum: number, task: string) => {
                return sum + (taskPrices[task as keyof typeof taskPrices] || 0);
            }, 0);

            const participantCount = mission.cap || mission.winnersCap || mission.max_participants || 1;
            const totalCost = totalTaskCost * participantCount;
            const usdCost = (totalCost / 450).toFixed(2);

            return `$${usdCost}`;
        }

        return 'Cost TBD';
    };

    const formatDeadline = (deadline: string, missionModel?: string) => {
        if (!deadline || deadline === 'null' || deadline === 'undefined') return 'No deadline';

        try {
            const date = new Date(deadline);
            if (isNaN(date.getTime())) return 'No deadline';

            const now = new Date();
            const diffTime = date.getTime() - now.getTime();
            const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffTime < 0) return 'Expired';

            // For degen missions, show hours until >24 hours, then show days
            if (missionModel?.toLowerCase() === 'degen') {
                if (diffHours <= 1) return '1h';
                if (diffHours < 24) return `${diffHours}h`;
                if (diffDays === 1) return '1d';
                if (diffDays < 7) return `${diffDays}d`;
                if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w`;
                return `${Math.ceil(diffDays / 30)}mo`;
            }

            // For fixed missions, use the original logic
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Tomorrow';
            if (diffDays < 7) return `${diffDays}d`;
            if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w`;
            return `${Math.ceil(diffDays / 30)}mo`;
        } catch (error) {
            return 'No deadline';
        }
    };

    const hasContentLink = mission.tweetLink || mission.contentLink || mission.link || mission.tweet_link || mission.content_link;

    // Task name mapping for display and ID lookup
    // VERIFIED: All mappings checked against taskTypes.ts definitions
    const taskNameMapping: { [key: string]: { display: string, id: string } } = {
        // Twitter Engage Tasks (id: like, retweet, comment, quote, follow)
        'like': { display: 'Like', id: 'like' },
        'retweet': { display: 'Retweet', id: 'retweet' },
        'comment': { display: 'Comment', id: 'comment' },
        'quote': { display: 'Quote', id: 'quote' },
        'follow': { display: 'Follow', id: 'follow' },
        'share': { display: 'Share', id: 'share' },

        // Twitter Content Tasks (id: meme, thread, article, videoreview)
        'meme': { display: 'Meme', id: 'meme' },
        'thread': { display: 'Thread', id: 'thread' },
        'article': { display: 'Article', id: 'article' },
        'videoreview': { display: 'Video Review', id: 'videoreview' },
        'video review': { display: 'Video Review', id: 'videoreview' },

        // Twitter Ambassador Tasks (id: pfp, name_bio_keywords, pinned_tweet, poll, spaces, community_raid)
        'pfp': { display: 'Profile Pic', id: 'pfp' },
        'profile pic': { display: 'Profile Pic', id: 'pfp' },
        'name_bio_keywords': { display: 'Bio Update', id: 'name_bio_keywords' },
        'bio update': { display: 'Bio Update', id: 'name_bio_keywords' },
        'pinned_tweet': { display: 'Pin Tweet', id: 'pinned_tweet' },
        'pin tweet': { display: 'Pin Tweet', id: 'pinned_tweet' },
        'poll': { display: 'Poll', id: 'poll' },
        'spaces': { display: 'Spaces', id: 'spaces' },
        'community_raid': { display: 'Community Raid', id: 'community_raid' },
        'community raid': { display: 'Community Raid', id: 'community_raid' },

        // Instagram Tasks (id: like, comment, follow, story_repost, feed_post, reel, carousel, hashtag_in_bio, story_highlight)
        'story_repost': { display: 'Story Repost', id: 'story_repost' },
        'feed_post': { display: 'Feed Post', id: 'feed_post' },
        'reel': { display: 'Reel', id: 'reel' },
        'carousel': { display: 'Carousel', id: 'carousel' },
        'hashtag_in_bio': { display: 'Hashtag in Bio', id: 'hashtag_in_bio' },
        'story_highlight': { display: 'Story Highlight', id: 'story_highlight' },

        // Platform-specific content tasks (now have their own definitions)
        'status_style': { display: 'Status Style', id: 'status_style' },
        'channel_post': { display: 'Channel Post', id: 'channel_post' },
        'flyer_clip_status': { display: 'Flyer Clip', id: 'flyer_clip_status' },

        // Action variations (mapped to their base task IDs)
        'like_post': { display: 'Like', id: 'like' },
        'like_tweet': { display: 'Like', id: 'like' },
        'retweet_tweet': { display: 'Retweet', id: 'retweet' },
        'comment_post': { display: 'Comment', id: 'comment' },
        'comment_tweet': { display: 'Comment', id: 'comment' },
        'quote_tweet': { display: 'Quote', id: 'quote' },
        'follow_user': { display: 'Follow', id: 'follow' },
        'follow_account': { display: 'Follow', id: 'follow' },
        'create_meme': { display: 'Meme', id: 'meme' },
        'create_thread': { display: 'Thread', id: 'thread' },
        'write_article': { display: 'Article', id: 'article' },
        'create_review': { display: 'Video Review', id: 'videoreview' },
        'update_pfp': { display: 'Profile Pic', id: 'pfp' },
        'update_bio': { display: 'Bio Update', id: 'name_bio_keywords' },
        'pin_tweet': { display: 'Pin Tweet', id: 'pinned_tweet' },
        'create_poll': { display: 'Poll', id: 'poll' },
        'host_spaces': { display: 'Spaces', id: 'spaces' },
        'organize_raid': { display: 'Community Raid', id: 'community_raid' }
    };

    // Get task types from mission
    const getTaskTypes = (mission: any) => {
        if (mission.tasks && Array.isArray(mission.tasks)) {
            return mission.tasks.map((task: string) => {
                const mapping = taskNameMapping[task.toLowerCase()];
                return mapping ? mapping.display : task.charAt(0).toUpperCase() + task.slice(1);
            });
        }
        return [];
    };

    const taskTypes = useMemo(() => getTaskTypes(mission), [mission.tasks]);

    const getTaskIcon = (taskId: string) => {
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
        return icons[taskId] || '📋';
    };

    // Get task completion status with flagged information
    // Standard practice: Return the most recent completion status
    const getTaskCompletionStatus = useCallback((taskId: string) => {
        // Get all completions for this task, sorted by creation date (newest first)
        const taskCompletionsForTask = taskCompletions
            .filter(c => c.taskId === taskId)
            .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

        if (taskCompletionsForTask.length === 0) {
            return { status: 'not_completed', flaggedReason: null };
        }

        // Return the most recent completion
        const latestCompletion = taskCompletionsForTask[0];
        return {
            status: latestCompletion.status,
            flaggedReason: latestCompletion.flaggedReason || null,
            flaggedAt: latestCompletion.flaggedAt?.toDate() || null
        };
    }, [taskCompletions]);

    const extractUsernameFromLink = (link: string) => {
        if (!link) return null;
        const match = link.match(/twitter\.com\/([^\/]+)/);
        return match ? match[1] : null;
    };

    // Memoized user X account object
    const userXAccount = useMemo(() => {
        if (!user?.twitterUsername) return undefined;
        return {
            id: user.id,
            userId: user.id,
            username: user.twitterUsername,
            displayName: user.name || user.email || 'User',
            isVerified: false,
            linkedAt: new Date(),
            isImmutable: true
        };
    }, [user?.id, user?.twitterUsername, user?.name, user?.email]);

    // Memoized verification submission handler
    const handleVerificationSubmitted = useCallback((submission: any) => {
        console.log('Verification submitted:', submission);
        // Handle verification submission
        // This will be integrated with the real API in the next step
    }, []);

    // Event handlers for two-mode verification system
    const handleIntentClick = useCallback((taskId: string) => {
        const intentUrl = MissionTwitterIntents.generateIntentUrl(taskId, mission);
        if (intentUrl) {
            TwitterIntents.openIntent(intentUrl, taskId);
            setTaskStates(prev => ({ ...prev, [taskId]: 'intentDone' })); // yellow
        }
    }, [mission]);

    const handleDirectVerify = useCallback(async (taskId: string) => {
        if (!user?.id) return;

        try {
            setTaskStates(prev => ({ ...prev, [taskId]: 'pendingVerify' })); // yellow
            setShowLinkPanel(prev => ({ ...prev, [taskId]: false }));

            await completeTaskMutation.mutateAsync({
                missionId: mission.id,
                taskId: taskId,
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                userSocialHandle: user.twitterUsername,
                metadata: {
                    taskType: taskId,
                    platform: 'twitter',
                    twitterHandle: user.twitterUsername,
                    tweetUrl: mission.postUrl || mission.url,
                }
            });

            setTaskStates(prev => ({ ...prev, [taskId]: 'verified' })); // green
            setShowTaskDropdown(prev => ({ ...prev, [taskId]: false }));
        } catch (error) {
            setTaskStates(prev => ({ ...prev, [taskId]: 'intentDone' })); // roll back to yellow
            console.error('Failed to complete task:', error);
        }
    }, [user, mission.id, completeTaskMutation]);

    const handleLinkSubmit = useCallback(async (taskId: string) => {
        const link = linkInputs[taskId];
        if (!link || !user?.id) return;

        try {
            setTaskStates(prev => ({ ...prev, [taskId]: 'pendingVerify' })); // yellow

            await submitTaskLinkMutation.mutateAsync({
                taskId,
                url: link,
                missionId: mission.id
            });

            setTaskStates(prev => ({ ...prev, [taskId]: 'verified' })); // green
            setShowLinkPanel(prev => ({ ...prev, [taskId]: false }));
            setShowTaskDropdown(prev => ({ ...prev, [taskId]: false }));
            setLinkInputs(prev => ({ ...prev, [taskId]: '' }));
        } catch (error) {
            setTaskStates(prev => ({ ...prev, [taskId]: 'intentDone' })); // roll back to yellow
            console.error('Failed to submit task link:', error);
        }
    }, [linkInputs, user, mission.id, submitTaskLinkMutation]);

    const handleRedoTask = useCallback(async (taskId: string) => {
        if (!user?.id) return;

        try {
            const taskCompletion = taskCompletions.find(tc => tc.taskId === taskId);
            if (taskCompletion) {
                await redoTaskMutation.mutateAsync({
                    completionId: taskCompletion.id,
                    reviewedBy: user.id
                });
            }

            setTaskStates(prev => ({ ...prev, [taskId]: 'idle' }));
            setShowTaskDropdown(prev => ({ ...prev, [taskId]: false }));
            setShowLinkPanel(prev => ({ ...prev, [taskId]: false }));
            setLinkInputs(prev => ({ ...prev, [taskId]: '' }));
        } catch (error) {
            console.error('Failed to redo task:', error);
        }
    }, [user, taskCompletions, redoTaskMutation]);

    return (
        <div
            ref={cardRef}
            className="bg-gray-800/60 backdrop-blur-lg rounded-xl transition-all duration-300 group overflow-hidden shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.4),inset_2px_2px_6px_rgba(255,255,255,0.05)] hover:shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.08)] hover:bg-gray-800/70"
        >

            {/* Header with platform and status */}
            <div className="p-3 pb-2">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getPlatformColor(mission.platform)} shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)]`}>
                            <span className="text-white text-xs">{getPlatformIcon(mission.platform)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="font-semibold text-white text-sm capitalize">{getPlatformName(mission.platform)} {mission.type} mission</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${getModelColor(mission.model)} shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1)]`}>
                            {mission.model}
                        </span>
                    </div>
                </div>
            </div>

            {/* Embedded Content or Mission Description */}
            <div className="px-3 pb-2">
                {hasContentLink ? (
                    <div className="aspect-[4/3] overflow-hidden rounded-lg shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                        <EmbeddedContent
                            url={mission.tweetLink || mission.contentLink || mission.link || mission.tweet_link || mission.content_link}
                            platform={mission.platform}
                            className="h-full w-full"
                        />
                    </div>
                ) : (
                    <div className="bg-gray-800/30 rounded-lg p-3 aspect-[4/3] overflow-hidden shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-6">{mission.description}</p>
                    </div>
                )}
            </div>

            {/* Mission Stats */}
            <div className="px-3 pb-2">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                        <div className="text-green-400 font-semibold">{formatReward(mission)}</div>
                        <div className="text-gray-400">
                            {(() => {
                                const count = mission.max_participants || mission.cap || mission.winnersCap || mission.participants_needed || mission.target_participants || 0;
                                return `${count} winners`;
                            })()}
                        </div>
                    </div>
                    {mission.model?.toLowerCase() === 'degen' && (
                        <div className="text-yellow-400 text-sm">{formatDeadline(mission.deadline, mission.model)}</div>
                    )}
                </div>
            </div>

            {/* Task Types */}
            {taskTypes.length > 0 && (
                <div className="px-3 pb-2">
                    <div className="flex flex-wrap gap-1.5">
                        {taskTypes.map((taskType: string, index: number) => {
                            // Find the original task name to get the correct ID
                            const originalTask = mission.tasks[index];
                            const mapping = taskNameMapping[originalTask?.toLowerCase()];
                            const taskId = mapping ? mapping.id : originalTask?.toLowerCase();
                            const taskStatus = getTaskStatus(taskId);
                            const verifyMode = getVerifyMode(taskId);
                            const completionStatus = getTaskCompletionStatus(taskId);

                            return (
                                <div key={index} className="relative">
                                    <button
                                        onClick={() => {
                                            if (taskStatus === 'flagged') {
                                                handleRedoTask(taskId);
                                                return;
                                            }
                                            setShowTaskDropdown(prev => {
                                                const next: Record<string, boolean> = {};
                                                next[taskId] = !prev[taskId];
                                                return next;
                                            });
                                            setShowLinkPanel({}); // close any open link slider
                                            setSelectedTask(taskId);
                                        }}
                                        className={`px-2 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.15)] ${toneFor(taskStatus)}`}
                                        onMouseEnter={(e) => {
                                            // Only show tooltip for flagged tasks
                                            if (taskStatus === 'flagged' && completionStatus.flaggedReason) {
                                                const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                                                if (tooltip) tooltip.style.opacity = '1';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                                            if (tooltip) tooltip.style.opacity = '0';
                                        }}
                                    >
                                        <div className="flex items-center gap-1">
                                            {taskStatus === 'flagged' && (
                                                <Flag className="w-3 h-3" />
                                            )}
                                            {taskStatus === 'verified' ? `✓ ${taskType}` : taskType}
                                        </div>
                                    </button>

                                    {/* Tooltip for flagged tasks - only shows on button hover */}
                                    {taskStatus === 'flagged' && completionStatus.flaggedReason && (
                                        <div
                                            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-900/95 text-red-100 text-xs rounded-lg shadow-lg transition-opacity duration-200 pointer-events-none z-10 max-w-xs"
                                            style={{ opacity: 0 }}
                                        >
                                            <div className="flex items-center gap-1 mb-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span className="font-semibold">Flagged</span>
                                            </div>
                                            <div className="text-red-200">{completionStatus.flaggedReason}</div>
                                            <div className="text-red-300 text-xs mt-1">
                                                {completionStatus.flaggedAt ?
                                                    `Flagged ${completionStatus.flaggedAt.toLocaleDateString()}` :
                                                    'Please redo this task correctly'
                                                }
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-900/95"></div>
                                        </div>
                                    )}

                                    {/* Task Dropdown - Two-mode verification system */}
                                    {showTaskDropdown[taskId] && (
                                        <div className="absolute top-full left-0 mt-1 bg-gray-800/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-700/50 z-20 min-w-[200px]">
                                            <div className="space-y-2">
                                                {/* Intent Button */}
                                                <button
                                                    onClick={() => handleIntentClick(taskId)}
                                                    disabled={taskStatus === 'verified'}
                                                    className={`w-full px-3 py-1 rounded text-xs transition-colors duration-200 ${toneFor(taskStatus === 'verified' ? 'verified' : taskStatus)}`}
                                                >
                                                    {taskStatus === 'verified' ? 'Verified' :
                                                        taskId === 'like' ? 'Like on Twitter' :
                                                            taskId === 'retweet' ? 'Retweet on Twitter' :
                                                                taskId === 'follow' ? 'Follow on Twitter' :
                                                                    taskId === 'comment' ? 'Comment on Twitter' :
                                                                        taskId === 'quote' ? 'Quote on Twitter' : 'Open Twitter'}
                                                </button>

                                                {/* Link Panel for link-mode tasks */}
                                                {verifyMode === 'link' && showLinkPanel[taskId] && (
                                                    <div className="bg-gray-700/50 rounded p-2 space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Paste your comment/quote link…"
                                                            value={linkInputs[taskId] || ''}
                                                            onChange={(e) => setLinkInputs(prev => ({ ...prev, [taskId]: e.target.value }))}
                                                            className="w-full px-2 py-1 rounded text-xs bg-gray-800/50 text-white placeholder-gray-400 border border-gray-600/50 focus:border-blue-500/50 focus:outline-none"
                                                        />
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleLinkSubmit(taskId)}
                                                                disabled={!linkInputs[taskId] || submitTaskLinkMutation.isPending}
                                                                className="flex-1 px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50"
                                                            >
                                                                {submitTaskLinkMutation.isPending ? 'Submitting...' : 'Submit'}
                                                            </button>
                                                            <button
                                                                onClick={() => setShowLinkPanel(prev => ({ ...prev, [taskId]: false }))}
                                                                className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Verify Button */}
                                                <button
                                                    onClick={() => {
                                                        if (verifyMode === 'direct') {
                                                            handleDirectVerify(taskId);
                                                        } else {
                                                            setShowLinkPanel(prev => ({ ...prev, [taskId]: true }));
                                                        }
                                                    }}
                                                    disabled={taskStatus === 'verified' || taskStatus === 'idle' || (verifyMode === 'link' && showLinkPanel[taskId])}
                                                    className={`w-full px-3 py-1 rounded text-xs transition-colors duration-200 ${toneFor(taskStatus === 'verified' ? 'verified' : taskStatus)}`}
                                                >
                                                    {taskStatus === 'verified' ? 'Verified' :
                                                        taskId === 'like' ? 'Verify Like' :
                                                            taskId === 'retweet' ? 'Verify Retweet' :
                                                                taskId === 'follow' ? 'Verify Follow' :
                                                                    taskId === 'comment' ? 'Verify Comment' :
                                                                        taskId === 'quote' ? 'Verify Quote' : 'Verify'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* In Progress Section */}
            <div className="px-3 pb-3">
                <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-400">
                            {(() => {
                                const currentParticipants = mission.participants_count || mission.participants || 0;
                                const maxParticipants = mission.max_participants || mission.cap || mission.winnersCap || mission.participants_needed || mission.target_participants || 1;
                                const completionPercentage = (currentParticipants / maxParticipants) * 100;
                                return completionPercentage >= 80 ? 'Almost Ending' : 'In Progress';
                            })()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
