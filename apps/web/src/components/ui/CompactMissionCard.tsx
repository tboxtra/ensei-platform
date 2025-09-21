import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { EmbeddedContent } from './EmbeddedContent';
import { getTasksForMission } from '@/lib/taskTypes';
import { MissionTwitterIntents, TwitterIntents } from '@/lib/twitter-intents';
import { getUserDisplayName } from '@/lib/firebase-task-completions';
import { useAuth, type User } from '../../contexts/UserAuthContext';
import {
    useUserMissionTaskCompletions,
    useCompleteTask,
    useRedoTaskCompletion
} from '../../hooks/useTaskCompletions';
// Removed getTaskStatusInfo import - using React Query hooks instead
import { Flag, AlertTriangle } from 'lucide-react';
import { InlineVerification } from '../verification/InlineVerification';
// Inline intent generation functions
const generateLikeIntent = (missionPostUrl: string) => {
    if (!missionPostUrl) return { url: 'https://twitter.com' };
    if (missionPostUrl.includes('twitter.com') || missionPostUrl.includes('x.com')) {
        return { url: missionPostUrl };
    }
    return { url: 'https://twitter.com' };
};

const generateCommentIntent = (missionPostUrl: string) => {
    const baseUrl = 'https://twitter.com/intent/tweet';
    const params = new URLSearchParams();
    params.append('url', missionPostUrl);
    return { url: `${baseUrl}?${params.toString()}` };
};

const generateQuoteIntent = (missionPostUrl: string, quoteText: string) => {
    const baseUrl = 'https://twitter.com/intent/tweet';
    const params = new URLSearchParams();
    params.append('url', missionPostUrl);
    if (quoteText) params.append('text', quoteText);
    return { url: `${baseUrl}?${params.toString()}` };
};

// Task verification state machine types
type VerificationState = 'idle' | 'intent-clicked' | 'awaiting-proof' | 'verifying' | 'verified' | 'error';

interface TaskUIState {
    state: VerificationState;
    proofUrl?: string;
}

interface UIMissionTask {
    id: string;
    kind: 'like' | 'retweet' | 'follow' | 'comment' | 'quote' | string;
    intentUrl?: string;
    requiresLink?: boolean;
    ui?: TaskUIState;
}

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
    const [intentCompleted, setIntentCompleted] = useState<{ [taskId: string]: boolean }>({});
    const [taskUIStates, setTaskUIStates] = useState<{ [taskId: string]: TaskUIState }>({});
    const [proofInputs, setProofInputs] = useState<{ [taskId: string]: string }>({});
    const cardRef = useRef<HTMLDivElement>(null);

    // Unified Task Status System - single source of truth
    const { data: taskCompletions = [], isLoading: isLoadingCompletions } = useUserMissionTaskCompletions(
        mission.id,
        user?.id || ''
    );
    const completeTaskMutation = useCompleteTask();
    const redoTaskMutation = useRedoTaskCompletion();

    // Helper functions for task UI state management
    const getTaskUIState = useCallback((taskId: string): TaskUIState => {
        return taskUIStates[taskId] || { state: 'idle' };
    }, [taskUIStates]);

    const setTaskUIState = useCallback((taskId: string, updates: Partial<TaskUIState>) => {
        setTaskUIStates(prev => ({
            ...prev,
            [taskId]: { ...prev[taskId], state: 'idle', ...updates }
        }));
    }, []);

    const getTaskRequiresLink = useCallback((taskId: string): boolean => {
        return taskId === 'comment' || taskId === 'quote';
    }, []);

    const validateProofUrl = useCallback((url: string): boolean => {
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://');
        } catch {
            return false;
        }
    }, []);

    // Intent button handler
    const handleIntentClick = useCallback(async (taskId: string) => {
        if (!user?.id) return;

        try {
            // Generate intent URL based on task type
            let intentUrl = '';
            if (taskId === 'like') {
                const intent = generateLikeIntent(mission.postUrl || mission.url);
                intentUrl = intent.url;
            } else if (taskId === 'comment') {
                const intent = generateCommentIntent(mission.postUrl || mission.url);
                intentUrl = intent.url;
            } else if (taskId === 'quote') {
                const intent = generateQuoteIntent(mission.postUrl || mission.url, '');
                intentUrl = intent.url;
            }

            if (intentUrl) {
                // Open intent in new tab
                window.open(intentUrl, '_blank', 'noopener,noreferrer');

                // Update UI state
                setTaskUIState(taskId, { state: 'intent-clicked' });
                setIntentCompleted(prev => ({ ...prev, [taskId]: true }));
            }
        } catch (error) {
            console.error('Error opening intent:', error);
            setTaskUIState(taskId, { state: 'error' });
        }
    }, [user, mission, setTaskUIState]);

    // Verify button handler
    const handleVerifyClick = useCallback(async (taskId: string) => {
        if (!user?.id) return;

        const uiState = getTaskUIState(taskId);
        const requiresLink = getTaskRequiresLink(taskId);

        try {
            if (requiresLink && !uiState.proofUrl) {
                // Switch to awaiting-proof state for link-required tasks
                setTaskUIState(taskId, { state: 'awaiting-proof' });
                return;
            }

            // Set verifying state
            setTaskUIState(taskId, { state: 'verifying' });

            // Call existing verify API
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
                    tweetUrl: mission.postUrl || mission.url
                }
            });

            // Success - set verified state
            setTaskUIState(taskId, { state: 'verified' });
        } catch (error) {
            console.error('Error verifying task:', error);
            setTaskUIState(taskId, { state: 'error' });
        }
    }, [user, mission, getTaskUIState, setTaskUIState, getTaskRequiresLink, completeTaskMutation]);

    // Proof submission handler
    const handleProofSubmit = useCallback((taskId: string) => {
        const proofUrl = proofInputs[taskId];

        if (!proofUrl || !validateProofUrl(proofUrl)) {
            return; // Invalid URL
        }

        // Set proof URL and continue to verification
        setTaskUIState(taskId, {
            state: 'verifying',
            proofUrl: proofUrl
        });

        // Clear input
        setProofInputs(prev => ({ ...prev, [taskId]: '' }));

        // Auto-trigger verification
        setTimeout(() => handleVerifyClick(taskId), 100);
    }, [proofInputs, validateProofUrl, setTaskUIState, handleVerifyClick]);





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
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

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
                            const completionStatus = getTaskCompletionStatus(taskId);

                            // Determine button styling based on status
                            const getButtonStyling = () => {
                                switch (completionStatus.status) {
                                    case 'flagged':
                                        return 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30';
                                    case 'verified':
                                        return 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30';
                                    case 'pending':
                                        return 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30';
                                    default:
                                        return 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30';
                                }
                            };

                            const uiState = getTaskUIState(taskId);
                            const isVerified = completionStatus.status === 'verified' || uiState.state === 'verified';
                            const isIntentClicked = uiState.state === 'intent-clicked' || uiState.state === 'awaiting-proof' || uiState.state === 'verifying';

                            return (
                                <div key={index} className="relative">
                                    <button
                                        onClick={() => setSelectedTask(selectedTask === taskId ? null : taskId)}
                                        className={`px-2 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.15)] ${isVerified ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                isIntentClicked ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                    completionStatus.status === 'flagged' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            }`}
                                        onMouseEnter={(e) => {
                                            // Only show tooltip for flagged tasks
                                            if (completionStatus.status === 'flagged' && completionStatus.flaggedReason) {
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
                                            {completionStatus.status === 'flagged' && (
                                                <Flag className="w-3 h-3" />
                                            )}
                                            {isVerified ? `✓ ${taskType}` : taskType}
                                        </div>
                                    </button>

                                    {/* Tooltip for flagged tasks - only shows on button hover */}
                                    {completionStatus.status === 'flagged' && completionStatus.flaggedReason && (
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
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Task Actions Dropdown */}
            {selectedTask && (
                <div className="px-3 pb-2">
                    <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                        {(() => {
                            // Try different field names for mission type
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
                                <div className="space-y-2">
                                    <div className="mb-3 px-3 py-2 bg-gray-800/20 rounded-lg border-b border-gray-700/30">
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            {mission.instructions || 'No instructions provided for this task.'}
                                        </p>
                                    </div>


                                    {/* Two-button flow: Intent + Verify */}
                                    {(() => {
                                        const uiState = getTaskUIState(task.id);
                                        const requiresLink = getTaskRequiresLink(task.id);
                                        const completionStatus = getTaskCompletionStatus(task.id);
                                        const isVerified = completionStatus.status === 'verified' || uiState.state === 'verified';
                                        const isVerifying = uiState.state === 'verifying';
                                        const isIntentClicked = uiState.state === 'intent-clicked';
                                        const isAwaitingProof = uiState.state === 'awaiting-proof';

                                        return (
                                            <div className="flex gap-2 items-center">
                                                {/* Intent Button */}
                                                <button
                                                    onClick={() => handleIntentClick(task.id)}
                                                    disabled={isVerified || isVerifying}
                                                    className={`px-3 py-1 rounded text-xs transition-colors duration-200 ${isVerified ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                            isIntentClicked ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                                'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {isIntentClicked ? 'Intent Done' : `Open ${task.id === 'like' ? 'Twitter' : task.id === 'comment' ? 'Twitter' : task.id === 'quote' ? 'Twitter' : 'Twitter'}`}
                                                </button>

                                                {/* Inline Proof Input (only for link-required tasks) */}
                                                {isAwaitingProof && requiresLink && (
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="text"
                                                            placeholder={`Paste your ${task.id} link`}
                                                            value={proofInputs[task.id] || ''}
                                                            onChange={(e) => setProofInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                                                            className="px-2 py-1 rounded text-xs bg-gray-800/40 text-white placeholder-gray-400 border border-gray-700/50 focus:border-blue-500/50 focus:outline-none w-64"
                                                        />
                                                        <button
                                                            onClick={() => handleProofSubmit(task.id)}
                                                            disabled={!proofInputs[task.id] || !validateProofUrl(proofInputs[task.id])}
                                                            className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Submit
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Verify Button */}
                                                <button
                                                    onClick={() => handleVerifyClick(task.id)}
                                                    disabled={!isIntentClicked || isVerified || isVerifying}
                                                    className={`px-3 py-1 rounded text-xs transition-colors duration-200 ${isVerified ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                            isVerifying ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' :
                                                                isIntentClicked ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' :
                                                                    'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {isVerifying ? 'Verifying...' :
                                                        isVerified ? 'Verified' :
                                                            `Verify ${task.id.charAt(0).toUpperCase() + task.id.slice(1)}`}
                                                </button>
                                            </div>
                                        );
                                    })()}

                                    {/* Legacy action buttons (fallback) */}
                                    <div className="flex gap-2 flex-wrap">
                                        {task.actions.map((action) => (
                                            <button
                                                key={action.id}
                                                onClick={async () => {
                                                    try {
                                                        if (action.type === 'intent') {
                                                            // Handle Twitter intent actions
                                                            const intentUrl = MissionTwitterIntents.generateIntentUrl(task.id, mission);

                                                            if (!intentUrl) {
                                                                // Silent fail - user can see button state
                                                                return;
                                                            }

                                                            // Open Twitter intent in a new window
                                                            TwitterIntents.openIntent(intentUrl, action.intentAction || task.id);

                                                            // Mark intent as completed
                                                            setIntentCompleted(prev => ({
                                                                ...prev,
                                                                [task.id]: true
                                                            }));

                                                            // No notification popup - user can see the button state change

                                                        } else if (action.type === 'verify') {
                                                            // Handle verification actions using unified system
                                                            // Check if intent was completed first
                                                            if (!intentCompleted[task.id]) {
                                                                return; // Silent fail - user can see button state
                                                            }

                                                            // Check if user is authenticated
                                                            if (!isAuthenticated || !user) {
                                                                return; // Silent fail - user should be logged in
                                                            }

                                                            // Get current task status from local state
                                                            const completionStatus = getTaskCompletionStatus(task.id);

                                                            try {
                                                                if (completionStatus.status === 'flagged') {
                                                                    // Redo flagged task - find the completion ID first
                                                                    const latestCompletion = taskCompletions
                                                                        .filter(c => c.taskId === task.id)
                                                                        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0];

                                                                    if (latestCompletion) {
                                                                        await redoTaskMutation.mutateAsync({
                                                                            completionId: latestCompletion.id,
                                                                            reviewedBy: user.id
                                                                        });
                                                                    }
                                                                } else {
                                                                    // Complete new task
                                                                    await completeTaskMutation.mutateAsync({
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
                                                                }
                                                            } catch (error) {
                                                                console.error('Error completing task:', error);
                                                                // Silent error - React Query will handle retry
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
                                                        } else {
                                                            // Handle auto actions
                                                            console.log('Action clicked:', action);
                                                        }
                                                    } catch (error) {
                                                        console.error('Error handling action:', error);
                                                        // Silent error - React Query will handle retry
                                                    }
                                                }}
                                                disabled={completeTaskMutation.isPending}
                                                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed ${(() => {
                                                    const taskStatus = getTaskCompletionStatus(task.id);

                                                    // If task is flagged, show red styling
                                                    if (taskStatus.status === 'flagged') {
                                                        return 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 animate-pulse';
                                                    }

                                                    // If task is verified, show green styling
                                                    if (taskStatus.status === 'verified') {
                                                        return 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30';
                                                    }

                                                    // If task is pending, show yellow styling
                                                    if (taskStatus.status === 'pending') {
                                                        return 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30';
                                                    }

                                                    // Default styling based on action type
                                                    if (action.type === 'intent') {
                                                        return intentCompleted[task.id]
                                                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30'
                                                            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30';
                                                    }

                                                    if (action.type === 'auto') {
                                                        return 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30';
                                                    }

                                                    if (action.type === 'verify') {
                                                        return completeTaskMutation.isPending
                                                            ? 'bg-gray-500/20 text-gray-400 cursor-wait'
                                                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30';
                                                    }

                                                    return 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30';
                                                })()}`}
                                            >
                                                {(() => {
                                                    const taskStatus = getTaskCompletionStatus(task.id);

                                                    if (action.type === 'verify' && completeTaskMutation.isPending) {
                                                        return (
                                                            <span className="flex items-center gap-1">
                                                                <span className="animate-spin">⏳</span>
                                                                Verifying...
                                                            </span>
                                                        );
                                                    }

                                                    // Show special text for flagged tasks
                                                    if (taskStatus.status === 'flagged') {
                                                        return (
                                                            <span className="flex items-center gap-1">
                                                                <Flag className="w-3 h-3" />
                                                                Redo Task
                                                            </span>
                                                        );
                                                    }

                                                    // Show special text for verified tasks
                                                    if (taskStatus.status === 'verified') {
                                                        return (
                                                            <span className="flex items-center gap-1">
                                                                ✓ {action.label}
                                                            </span>
                                                        );
                                                    }

                                                    // Show special text for pending tasks
                                                    if (taskStatus.status === 'pending') {
                                                        return (
                                                            <span className="flex items-center gap-1">
                                                                ⏳ {action.label}
                                                            </span>
                                                        );
                                                    }

                                                    return action.label;
                                                })()}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Inline Verification for Comment and Quote Tasks */}
                                    {(task.id === 'comment' || task.id === 'quote') && (
                                        <div className="mt-3 pt-3 border-t border-gray-700/30">
                                            <InlineVerification
                                                taskId={task.id}
                                                missionId={mission.id}
                                                missionTitle={mission.title || mission.description}
                                                userXAccount={userXAccount}
                                                onVerificationSubmitted={handleVerificationSubmitted}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
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
