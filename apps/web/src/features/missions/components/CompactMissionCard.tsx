import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { EmbeddedContent } from '../../../components/ui/EmbeddedContent';
import { MissionTwitterIntents, TwitterIntents } from '@/lib/twitter-intents';
import { getTasksForMission } from '@/lib/taskTypes';
import { useAuth } from '../../../contexts/UserAuthContext';
import {
    useUserMissionTaskCompletions,
    useCompleteTask,
    useRedoTaskCompletion,
    useSubmitTaskLink,
    toneFor
} from '../../../hooks/useTaskCompletions';
import {
    logIntentAction,
    logVerifyAction,
    logLinkSubmitAction,
    logRedoAction
} from '../../../shared/lib/user-activity-logger';
import { Flag, AlertTriangle } from 'lucide-react';
import type { TaskStatus, VerifyMode } from '../../../types/task-completion';

interface CompactMissionCardProps {
    mission: any;
    userCompletion?: { status: 'verified' | 'pending' | 'flagged' | 'none', byTaskId: Record<string, string> };
    onParticipate?: (missionId: string, taskType?: string) => void;
    onViewDetails?: (missionId: string) => void;
}

export function CompactMissionCard({ mission, userCompletion }: CompactMissionCardProps) {
    const { user } = useAuth();
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [taskStates, setTaskStates] = useState<Record<string, TaskStatus>>({});
    const [showLinkPanel, setShowLinkPanel] = useState<Record<string, boolean>>({});
    const [linkInputs, setLinkInputs] = useState<Record<string, string>>({});
    const [linkErrors, setLinkErrors] = useState<Record<string, string>>({});
    const cardRef = useRef<HTMLDivElement>(null);

    const { data: taskCompletions = [] } = useUserMissionTaskCompletions(
        mission.id,
        user?.id || ''
    );
    const completeTaskMutation = useCompleteTask();
    const redoTaskMutation = useRedoTaskCompletion();
    const submitTaskLinkMutation = useSubmitTaskLink();

    // Close dropdowns when clicking outside
    useEffect(() => {
        if (!selectedTask && Object.values(showLinkPanel).every(v => !v)) return;
        if (typeof document === 'undefined') return;

        const handleClickOutside = (e: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
                setSelectedTask(null);
                setShowLinkPanel({});
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedTask, showLinkPanel]);

    const getVerifyMode = useCallback<(taskId: string) => VerifyMode>(
        (taskId) => (['comment', 'quote'].includes(taskId) ? 'link' : 'direct'),
        []
    );

    const canDirectVerify = (taskId: string) => {
        const mode = getVerifyMode(taskId);
        const status = getTaskStatus(taskId);
        // direct tasks: enable verify only after the user clicked intent (yellow)
        if (mode === 'direct') return status === 'intentDone' || status === 'pendingVerify';
        return false; // link-mode uses the submit panel
    };

    // Mission-created task metadata (includes per-task instructions)
    const taskMetaById = useMemo(() => {
        const list = getTasksForMission?.(mission.platform, mission.type) || [];
        const map: Record<string, any> = {};
        list.forEach((t: any) => { if (t?.id) map[t.id] = t; });
        return map;
    }, [mission]);

    // Build a map of the *latest* completion status per taskId once
    const latestStatusByTaskId = useMemo(() => {
        const map = new Map<string, { status: string; flaggedReason?: string | null; flaggedAt?: Date | null }>();
        for (const c of taskCompletions) {
            const cur = map.get(c.taskId);
            if (!cur || c.createdAt.toMillis() > (cur as any)?.createdAtMillis) {
                map.set(c.taskId, {
                    status: c.status,
                    flaggedReason: c.flaggedReason || null,
                    flaggedAt: c.flaggedAt ? c.flaggedAt.toDate() : null,
                    // @ts-ignore keep millis internally (not returned)
                    createdAtMillis: c.createdAt.toMillis()
                } as any);
            }
        }
        return map;
    }, [taskCompletions]);

    const getTaskStatus = useCallback(
        (taskId: string): TaskStatus => {
            if (taskStates[taskId]) return taskStates[taskId];
            const latest = latestStatusByTaskId.get(taskId)?.status;
            if (latest === 'verified') return 'verified';
            if (latest === 'flagged') return 'flagged';
            if (latest === 'pending') return 'pendingVerify';
            return 'idle';
        },
        [taskStates, latestStatusByTaskId]
    );

    const getCompletionMeta = useCallback(
        (taskId: string) => {
            const latest = latestStatusByTaskId.get(taskId);
            return {
                status: latest?.status ?? 'not_completed',
                flaggedReason: latest?.flaggedReason ?? null,
                flaggedAt: latest?.flaggedAt ?? null
            };
        },
        [latestStatusByTaskId]
    );

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

    const formatReward = (m: any) => {
        if (m.rewards?.usd) return `$${m.rewards.usd.toFixed(2)}`;
        if (m.total_cost_usd) return `$${m.total_cost_usd.toFixed(2)}`;
        if (m.total_cost) return `$${m.total_cost.toFixed(2)}`;
        if (m.cost_usd) return `$${m.cost_usd.toFixed(2)}`;
        if (m.cost) return `$${m.cost.toFixed(2)}`;
        if (m.total_cost_honors) return `$${(m.total_cost_honors / 450).toFixed(2)}`;

        if (m.tasks?.length) {
            const prices: Record<string, number> = {
                like: 50, retweet: 100, comment: 150, quote: 200, follow: 250,
                meme: 300, thread: 500, article: 400, videoreview: 600,
                pfp: 250, name_bio_keywords: 200, pinned_tweet: 300, poll: 150,
                spaces: 800, community_raid: 400, status_50_views: 300
            };
            const total = m.tasks.reduce((sum: number, t: string) => sum + (prices[t as keyof typeof prices] || 0), 0);
            const participants = m.cap || m.winnersCap || m.max_participants || 1;
            return `$${(total * participants / 450).toFixed(2)}`;
        }
        return 'Cost TBD';
    };

    const formatDeadline = (deadline: string, model?: string) => {
        if (!deadline || deadline === 'null' || deadline === 'undefined') return 'No deadline';
        const date = new Date(deadline);
        if (Number.isNaN(date.getTime())) return 'No deadline';

        const diffMs = date.getTime() - Date.now();
        if (diffMs < 0) return 'Expired';

        const h = Math.ceil(diffMs / 36e5);
        const d = Math.ceil(diffMs / 864e5);

        if (model?.toLowerCase() === 'degen') {
            if (h <= 1) return '1h';
            if (h < 24) return `${h}h`;
            if (d === 1) return '1d';
            if (d < 7) return `${d}d`;
            if (d < 30) return `${Math.ceil(d / 7)}w`;
            return `${Math.ceil(d / 30)}mo`;
        }
        if (d === 0) return 'Today';
        if (d === 1) return 'Tomorrow';
        if (d < 7) return `${d}d`;
        if (d < 30) return `${Math.ceil(d / 7)}w`;
        return `${Math.ceil(d / 30)}mo`;
    };

    const hasContentLink =
        mission.tweetLink || mission.contentLink || mission.link || mission.tweet_link || mission.content_link;

    const taskNameMapping: Record<string, { display: string; id: string }> = {
        like: { display: 'Like', id: 'like' },
        retweet: { display: 'Retweet', id: 'retweet' },
        comment: { display: 'Comment', id: 'comment' },
        quote: { display: 'Quote', id: 'quote' },
        follow: { display: 'Follow', id: 'follow' },
        share: { display: 'Share', id: 'share' },
        meme: { display: 'Meme', id: 'meme' },
        thread: { display: 'Thread', id: 'thread' },
        article: { display: 'Article', id: 'article' },
        videoreview: { display: 'Video Review', id: 'videoreview' },
        'video review': { display: 'Video Review', id: 'videoreview' },
        pfp: { display: 'Profile Pic', id: 'pfp' },
        'profile pic': { display: 'Profile Pic', id: 'pfp' },
        name_bio_keywords: { display: 'Bio Update', id: 'name_bio_keywords' },
        'bio update': { display: 'Bio Update', id: 'name_bio_keywords' },
        pinned_tweet: { display: 'Pin Tweet', id: 'pinned_tweet' },
        'pin tweet': { display: 'Pin Tweet', id: 'pinned_tweet' },
        poll: { display: 'Poll', id: 'poll' },
        spaces: { display: 'Spaces', id: 'spaces' },
        community_raid: { display: 'Community Raid', id: 'community_raid' },
        'community raid': { display: 'Community Raid', id: 'community_raid' },
        story_repost: { display: 'Story Repost', id: 'story_repost' },
        feed_post: { display: 'Feed Post', id: 'feed_post' },
        reel: { display: 'Reel', id: 'reel' },
        carousel: { display: 'Carousel', id: 'carousel' },
        hashtag_in_bio: { display: 'Hashtag in Bio', id: 'hashtag_in_bio' },
        story_highlight: { display: 'Story Highlight', id: 'story_highlight' },
        status_style: { display: 'Status Style', id: 'status_style' },
        channel_post: { display: 'Channel Post', id: 'channel_post' },
        flyer_clip_status: { display: 'Flyer Clip', id: 'flyer_clip_status' },
        like_post: { display: 'Like', id: 'like' },
        like_tweet: { display: 'Like', id: 'like' },
        retweet_tweet: { display: 'Retweet', id: 'retweet' },
        comment_post: { display: 'Comment', id: 'comment' },
        comment_tweet: { display: 'Comment', id: 'comment' },
        quote_tweet: { display: 'Quote', id: 'quote' },
        follow_user: { display: 'Follow', id: 'follow' },
        follow_account: { display: 'Follow', id: 'follow' },
        create_meme: { display: 'Meme', id: 'meme' },
        create_thread: { display: 'Thread', id: 'thread' },
        write_article: { display: 'Article', id: 'article' },
        create_review: { display: 'Video Review', id: 'videoreview' },
        update_pfp: { display: 'Profile Pic', id: 'pfp' },
        update_bio: { display: 'Bio Update', id: 'name_bio_keywords' },
        pin_tweet: { display: 'Pin Tweet', id: 'pinned_tweet' },
        create_poll: { display: 'Poll', id: 'poll' },
        host_spaces: { display: 'Spaces', id: 'spaces' },
        organize_raid: { display: 'Community Raid', id: 'community_raid' }
    };

    const taskTypes = useMemo(() => {
        if (!Array.isArray(mission.tasks)) return [];
        return mission.tasks.map((t: string) => {
            const m = taskNameMapping[t?.toLowerCase?.()] as any;
            return m ? m.display : (t?.charAt(0).toUpperCase() + t?.slice(1));
        });
    }, [mission.tasks]);

    // Events
    const handleIntentClick = useCallback(async (taskId: string) => {
        const intentUrl = MissionTwitterIntents.generateIntentUrl(taskId, mission);
        if (!intentUrl || !user?.id) return;

        TwitterIntents.openIntent(intentUrl, taskId);
        setTaskStates(prev => ({ ...prev, [taskId]: 'intentDone' }));

        // Log intent action to Firebase
        try {
            await logIntentAction(user.id, mission.id, taskId, {
                intentUrl,
                taskType: taskId,
                platform: mission.platform
            });
        } catch (error) {
            console.error('Failed to log intent action:', error);
        }
    }, [mission, user]);

    const handleDirectVerify = useCallback(async (taskId: string) => {
        if (!user?.id) return;
        try {
            setTaskStates(p => ({ ...p, [taskId]: 'pendingVerify' }));

            // Create task completion with verified status for direct verification
            await completeTaskMutation.mutateAsync({
                missionId: mission.id,
                taskId,
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                userSocialHandle: user.twitterUsername,
                metadata: {
                    taskType: taskId,
                    platform: 'twitter',
                    twitterHandle: user.twitterUsername,
                    tweetUrl: mission.postUrl || mission.url,
                    verificationMethod: 'direct'
                }
            });

            // Set verified state but DO NOT collapse the panel
            setTaskStates(p => ({ ...p, [taskId]: 'verified' }));

            // Log verify action to Firebase
            try {
                await logVerifyAction(user.id, mission.id, taskId, {
                    taskType: taskId,
                    platform: mission.platform,
                    verificationMethod: 'direct'
                });
            } catch (error) {
                console.error('Failed to log verify action:', error);
            }
        } catch (e) {
            setTaskStates(p => ({ ...p, [taskId]: 'intentDone' }));
            console.error('Failed to complete task:', e);
        }
    }, [user, mission.id, completeTaskMutation, mission.postUrl, mission.url]);

    const isLikelyUrl = (s: string) =>
        /^https?:\/\//i.test(s) && /twitter\.com|x\.com/i.test(s);

    // Helper function to extract Twitter handle from URL
    const extractHandleFromUrl = (url: string): string => {
        const match = url.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/i);
        return match ? match[1].toLowerCase() : '';
    };

    const handleLinkSubmit = useCallback(async (taskId: string) => {
        const link = linkInputs[taskId];
        if (!link || !user?.id) return;

        // Clear any previous errors
        setLinkErrors(p => ({ ...p, [taskId]: '' }));

        if (!isLikelyUrl(link)) {
            setLinkErrors(p => ({ ...p, [taskId]: 'Please enter a valid Twitter/X URL' }));
            return;
        }

        // Client-side username validation
        const extractedHandle = extractHandleFromUrl(link);
        if (!extractedHandle) {
            setLinkErrors(p => ({ ...p, [taskId]: 'Could not extract username from URL' }));
            return;
        }

        // Check if user has Twitter username and if it matches
        if (user.twitterUsername) {
            const userHandle = user.twitterUsername.toLowerCase().replace('@', '');
            if (extractedHandle !== userHandle) {
                setLinkErrors(p => ({ ...p, [taskId]: `Link must be your own reply/quote from @${userHandle}` }));
                return;
            }
        }

        try {
            setTaskStates(p => ({ ...p, [taskId]: 'pendingVerify' }));

            await submitTaskLinkMutation.mutateAsync({
                taskId,
                url: link,
                missionId: mission.id
            });

            // Set verified state but DO NOT collapse the panel
            setTaskStates(p => ({ ...p, [taskId]: 'verified' }));
            setLinkInputs(p => ({ ...p, [taskId]: '' }));
            setLinkErrors(p => ({ ...p, [taskId]: '' }));

            // Log link submit action to Firebase
            try {
                await logLinkSubmitAction(user.id, mission.id, taskId, link, {
                    taskType: taskId,
                    platform: mission.platform,
                    verificationMethod: 'link',
                    extractedHandle: extractHandleFromUrl(link)
                });
            } catch (error) {
                console.error('Failed to log link submit action:', error);
            }
        } catch (e) {
            setTaskStates(p => ({ ...p, [taskId]: 'intentDone' }));
            setLinkErrors(p => ({ ...p, [taskId]: 'Failed to submit link. Please try again.' }));
            console.error('Failed to submit task link:', e);
        }
    }, [linkInputs, user, mission.id, submitTaskLinkMutation]);

    const handleRedoTask = useCallback(async (taskId: string) => {
        if (!user?.id) return;
        try {
            const tc = taskCompletions.find(t => t.taskId === taskId);
            if (tc) {
                await redoTaskMutation.mutateAsync({
                    completionId: tc.id,
                    reviewedBy: user.id
                });
            }
            setTaskStates(p => ({ ...p, [taskId]: 'idle' }));
            setSelectedTask(null);
            setShowLinkPanel(p => ({ ...p, [taskId]: false }));
            setLinkInputs(p => ({ ...p, [taskId]: '' }));

            // Log redo action to Firebase
            try {
                await logRedoAction(user.id, mission.id, taskId, {
                    taskType: taskId,
                    platform: mission.platform,
                    completionId: tc?.id
                });
            } catch (error) {
                console.error('Failed to log redo action:', error);
            }
        } catch (e) {
            console.error('Failed to redo task:', e);
        }
    }, [user, taskCompletions, redoTaskMutation, mission.id]);

    // UI helpers
    const getModelColor = (model: string) => {
        switch (model?.toLowerCase()) {
            case 'fixed': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'degen': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'premium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'custom': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div
            ref={cardRef}
            className="bg-gray-800/60 backdrop-blur-lg rounded-xl transition-all duration-300 group overflow-hidden shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.4),inset_2px_2px_6px_rgba(255,255,255,0.05)] hover:shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.08)] hover:bg-gray-800/70"
        >
            {/* Header */}
            <div className="p-3 pb-2">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getPlatformColor(mission.platform)} shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)]`}>
                            <span className="text-white text-xs">{getPlatformIcon(mission.platform)}</span>
                        </div>
                        <div className="font-semibold text-white text-sm capitalize">
                            {getPlatformName(mission.platform)} {mission.type} mission
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getModelColor(mission.model)} shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1)]`}>
                            {mission.model}
                        </span>
                        {userCompletion && userCompletion.status === 'verified' && (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1)]">
                                ✓ Completed
                            </span>
                        )}
                        {userCompletion && userCompletion.status === 'flagged' && (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1)]">
                                ⚠ Flagged
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
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

            {/* Stats */}
            <div className="px-3 pb-2">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                        <div className="text-green-400 font-semibold">{formatReward(mission)}</div>
                        <div className="text-gray-400">
                            {(() => {
                                const count =
                                    mission.max_participants ||
                                    mission.cap ||
                                    mission.winnersCap ||
                                    mission.participants_needed ||
                                    mission.target_participants ||
                                    0;
                                return `${count} winners`;
                            })()}
                        </div>
                    </div>
                    {mission.model?.toLowerCase() === 'degen' && (
                        <div className="text-yellow-400 text-sm">{formatDeadline(mission.deadline, mission.model)}</div>
                    )}
                </div>
            </div>

            {/* Tasks */}
            {taskTypes.length > 0 && (
                <div className="px-3 pb-2">
                    <div className="flex flex-wrap gap-1.5">
                        {mission.tasks.map((originalTask: string, idx: number) => {
                            const mapping = taskNameMapping[originalTask?.toLowerCase()];
                            const taskId = mapping ? mapping.id : originalTask?.toLowerCase();
                            const taskType = mapping ? mapping.display : (originalTask?.charAt(0).toUpperCase() + originalTask?.slice(1));
                            const taskStatus = getTaskStatus(taskId);
                            const completion = getCompletionMeta(taskId);
                            const isSelected = selectedTask === taskId;

                            return (
                                <div key={taskId || idx} className="relative">
                                    <button
                                        onClick={() => {
                                            if (taskStatus === 'flagged') { handleRedoTask(taskId); return; }
                                            setSelectedTask(prev => (prev === taskId ? null : taskId));
                                            setShowLinkPanel({});
                                        }}
                                        aria-expanded={isSelected}
                                        className={`px-2 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.15)] ${toneFor(taskStatus)}`}
                                    >
                                        <div className="flex items-center gap-1">
                                            {taskStatus === 'flagged' && <Flag className="w-3 h-3" />}
                                            {taskStatus === 'verified' ? `✓ ${taskType}` : taskType}
                                        </div>
                                    </button>

                                    {/* Flag tooltip */}
                                    {taskStatus === 'flagged' && completion.flaggedReason && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-red-900/95 text-red-100 text-xs rounded-lg shadow-lg z-10 max-w-xs">
                                            <div className="flex items-center gap-1 mb-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span className="font-semibold">Flagged</span>
                                            </div>
                                            <div className="text-red-200">{completion.flaggedReason}</div>
                                            <div className="text-red-300 text-xs mt-1">
                                                {completion.flaggedAt ? `Flagged ${completion.flaggedAt.toLocaleDateString()}` : 'Please redo this task correctly'}
                                            </div>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-900/95"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Inline expanded panel (full-width) */}
            {selectedTask && (() => {
                const verifyMode = getVerifyMode(selectedTask);
                const taskStatus = getTaskStatus(selectedTask);

                return (
                    <div className="px-3 pb-3">
                        <div className="bg-gray-800/90 border border-gray-700/50 rounded-lg p-3 space-y-2">
                            {/* Instructions written when the task was created */}
                            {(() => {
                                // Priority: 1) mission.taskInstructions?.[taskId], 2) taskMetaById[taskId]?.instructions, 3) mission.instructions
                                const fromTaskInstructions = mission?.taskInstructions?.[selectedTask!];
                                const fromTaskMeta = taskMetaById[selectedTask!]?.instructions;
                                const fromMission = mission?.instructions;
                                const instructions = fromTaskInstructions || fromTaskMeta || fromMission || '';

                                return instructions ? (
                                    <div className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-3 text-sm text-gray-300 leading-relaxed">
                                        {instructions}
                                    </div>
                                ) : null;
                            })()}


                            {/* Two buttons always side by side */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleIntentClick(selectedTask)}
                                    disabled={getTaskStatus(selectedTask) === 'verified'}
                                    className={`flex-1 px-3 py-1 rounded-full text-xs transition-colors duration-200 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] ${toneFor(getTaskStatus(selectedTask) === 'verified' ? 'verified' : getTaskStatus(selectedTask))} ${getTaskStatus(selectedTask) === 'verified' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    {getTaskStatus(selectedTask) === 'verified' ? 'Verified'
                                        : selectedTask === 'like' ? 'Like on Twitter'
                                            : selectedTask === 'retweet' ? 'Retweet on Twitter'
                                                : selectedTask === 'follow' ? 'Follow on Twitter'
                                                    : selectedTask === 'comment' ? 'Comment on Twitter'
                                                        : selectedTask === 'quote' ? 'Quote on Twitter'
                                                            : 'Open Twitter'}
                                </button>

                                <button
                                    onClick={() => { if (getVerifyMode(selectedTask) === 'direct') handleDirectVerify(selectedTask); }}
                                    disabled={
                                        getTaskStatus(selectedTask) === 'verified' ||
                                        getVerifyMode(selectedTask) === 'link' ||
                                        !(getTaskStatus(selectedTask) === 'intentDone' || getTaskStatus(selectedTask) === 'pendingVerify')
                                    }
                                    className={`flex-1 px-3 py-1 rounded-full text-xs transition-colors duration-200 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] ${toneFor(getTaskStatus(selectedTask) === 'verified' ? 'verified' : getTaskStatus(selectedTask))} ${(getTaskStatus(selectedTask) === 'verified' || getVerifyMode(selectedTask) === 'link' || !(getTaskStatus(selectedTask) === 'intentDone' || getTaskStatus(selectedTask) === 'pendingVerify')) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    {getTaskStatus(selectedTask) === 'verified' ? 'Verified'
                                        : selectedTask === 'like' ? 'Verify Like'
                                            : selectedTask === 'retweet' ? 'Verify Retweet'
                                                : selectedTask === 'follow' ? 'Verify Follow'
                                                    : selectedTask === 'comment' ? 'Verify Comment'
                                                        : selectedTask === 'quote' ? 'Verify Quote'
                                                            : 'Verify'}
                                </button>
                            </div>

                            {/* Link panel for link-mode tasks - below the two buttons */}
                            {getVerifyMode(selectedTask) === 'link' && (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Paste your comment/quote link…"
                                        value={linkInputs[selectedTask] || ''}
                                        onChange={(e) => {
                                            setLinkInputs(prev => ({ ...prev, [selectedTask]: e.target.value }));
                                            // Clear error when user starts typing
                                            if (linkErrors[selectedTask]) {
                                                setLinkErrors(prev => ({ ...prev, [selectedTask]: '' }));
                                            }
                                        }}
                                        className="w-full px-3 py-1 rounded-full text-xs bg-gray-800/50 text-white placeholder-gray-400 border border-gray-600/50 focus:border-blue-500/50 focus:outline-none"
                                    />

                                    {/* Error message */}
                                    {linkErrors[selectedTask] && (
                                        <div className="text-red-400 text-xs px-2">
                                            {linkErrors[selectedTask]}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleLinkSubmit(selectedTask)}
                                            disabled={
                                                Boolean(!linkInputs[selectedTask] ||
                                                    linkInputs[selectedTask] === '' ||
                                                    submitTaskLinkMutation.isPending ||
                                                    !isLikelyUrl(linkInputs[selectedTask] || '') ||
                                                    (user?.twitterUsername && extractHandleFromUrl(linkInputs[selectedTask] || '') !== user.twitterUsername.toLowerCase().replace('@', '')))
                                            }
                                            className="flex-1 px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50 transition-colors duration-200"
                                        >
                                            {submitTaskLinkMutation.isPending ? 'Submitting...' : 'Submit Link'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setLinkInputs(prev => ({ ...prev, [selectedTask]: '' }));
                                                setLinkErrors(prev => ({ ...prev, [selectedTask]: '' }));
                                            }}
                                            className="px-3 py-1 rounded-full text-xs bg-gray-500/20 text-gray-300 border border-gray-500/30 hover:bg-gray-500/30 transition-colors duration-200"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* Footer / progress */}
            <div className="px-3 pb-3">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-400">
                        {(() => {
                            const current = mission.participants_count || mission.participants || 0;
                            const max =
                                mission.max_participants ||
                                mission.cap ||
                                mission.winnersCap ||
                                mission.participants_needed ||
                                mission.target_participants ||
                                1;
                            const pct = (current / max) * 100;
                            return pct >= 80 ? 'Almost Ending' : 'In Progress';
                        })()}
                    </span>
                </div>
            </div>
        </div>
    );
}