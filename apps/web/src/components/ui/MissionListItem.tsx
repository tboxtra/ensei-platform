import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Flag, AlertCircle, Clock, User } from 'lucide-react';
import { getMissionTaskCompletions, flagTaskCompletion, verifyTaskCompletion, getFlaggingReasons, type TaskCompletion } from '@/lib/task-verification';
import { getUserDisplayName } from '@/lib/firebase-task-completions';

interface MissionListItemProps {
    mission: any;
    onViewDetails?: (missionId: string) => void;
}

export function MissionListItem({
    mission,
    onViewDetails
}: MissionListItemProps) {
    const [showSubmissions, setShowSubmissions] = useState(false);
    const [submissions, setSubmissions] = useState<TaskCompletion[]>([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [showFlagModal, setShowFlagModal] = useState<{ completion: TaskCompletion | null, show: boolean }>({ completion: null, show: false });

    const loadSubmissions = async () => {
        if (showSubmissions && submissions.length > 0) return; // Already loaded

        setLoadingSubmissions(true);
        try {
            const missionSubmissions = await getMissionTaskCompletions(mission.id);
            setSubmissions(missionSubmissions);
        } catch (error) {
            console.error('Error loading submissions:', error);
            setSubmissions([]);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleFlagSubmission = async (completion: TaskCompletion, reason: string) => {
        try {
            await flagTaskCompletion(completion.id, reason, 'creator-1', 'Mission Creator');
            loadSubmissions();
            setShowFlagModal({ completion: null, show: false });
            // Silent success - user can see status change
        } catch (error) {
            console.error('Error flagging submission:', error);
            // Silent error - React Query will handle retry
        }
    };

    const handleVerifySubmission = async (completion: TaskCompletion) => {
        try {
            await verifyTaskCompletion(completion.id, 'creator-1', 'Mission Creator');
            loadSubmissions();
            // Silent success - user can see status change
        } catch (error) {
            console.error('Error verifying submission:', error);
            // Silent error - React Query will handle retry
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified': return <CheckCircle className="w-3 h-3 text-green-400" />;
            case 'flagged': return <Flag className="w-3 h-3 text-red-400" />;
            case 'pending': return <Clock className="w-3 h-3 text-yellow-400" />;
            default: return <AlertCircle className="w-3 h-3 text-gray-400" />;
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    };

    const formatCost = (mission: any) => {
        // Calculate cost based on mission data
        if (mission.rewards?.usd) {
            return mission.rewards.usd;
        }
        if (mission.total_cost_usd) {
            return mission.total_cost_usd;
        }
        if (mission.total_cost) {
            return mission.total_cost;
        }
        if (mission.cost_usd) {
            return mission.cost_usd;
        }
        if (mission.cost) {
            return mission.cost;
        }
        // Convert honors to USD if available (450 honors = $1)
        if (mission.total_cost_honors) {
            const usdAmount = (mission.total_cost_honors / 450).toFixed(2);
            return parseFloat(usdAmount);
        }

        // Calculate estimated cost based on tasks and participants
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

            const participantCount = mission.cap || mission.winnersCap || 1;
            const totalCost = totalTaskCost * participantCount;
            const usdCost = (totalCost / 450).toFixed(2);

            return parseFloat(usdCost);
        }

        return 0;
    };

    const getMissionType = (mission: any) => {
        if (mission.tasks && mission.tasks.length > 0) {
            const taskTypes = mission.tasks.map((task: string) => {
                switch (task.toLowerCase()) {
                    case 'like': return 'LIKE';
                    case 'retweet': return 'RETWEET';
                    case 'comment': return 'COMMENT';
                    case 'quote': return 'QUOTE';
                    case 'follow': return 'FOLLOW';
                    case 'share': return 'SHARE';
                    case 'meme': return 'MEME';
                    case 'thread': return 'THREAD';
                    case 'article': return 'ARTICLE';
                    case 'videoreview': return 'VIDEO REVIEW';
                    case 'pfp': return 'PROFILE PIC';
                    case 'name_bio_keywords': return 'BIO UPDATE';
                    case 'pinned_tweet': return 'PIN TWEET';
                    case 'poll': return 'POLL';
                    case 'spaces': return 'SPACES';
                    case 'community_raid': return 'COMMUNITY RAID';
                    default: return task.toUpperCase();
                }
            });
            return taskTypes.join(', ');
        }
        return mission.type?.toUpperCase() || 'MISSION';
    };

    const getStatusDisplay = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return { text: 'Active', color: 'text-green-400' };
            case 'completed': return { text: 'Completed', color: 'text-blue-400' };
            case 'paused': return { text: 'Paused', color: 'text-yellow-400' };
            case 'cancelled': return { text: 'Cancelled', color: 'text-red-400' };
            default: return { text: 'Unknown', color: 'text-gray-400' };
        }
    };

    const status = getStatusDisplay(mission.status);
    const cost = formatCost(mission);
    const clicks = mission.participants_count || mission.participants || 0;

    return (
        <div className="bg-gray-800/30 rounded-lg p-3 hover:bg-gray-800/50 transition-colors">
            <div className="grid grid-cols-6 gap-4 items-center">
                {/* Mission Type */}
                <div className="col-span-1">
                    <div className="text-sm font-medium text-white">
                        {getMissionType(mission)}
                    </div>
                </div>

                {/* Date */}
                <div className="col-span-1">
                    <div className="text-sm text-gray-300">
                        {formatDate(mission.created_at)}
                    </div>
                </div>

                {/* Cost */}
                <div className="col-span-1">
                    <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-white">{cost.toFixed(2)}</span>
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">$</span>
                        </div>
                    </div>
                </div>

                {/* Clicks */}
                <div className="col-span-1">
                    <div className="text-sm text-gray-300">
                        {clicks}
                    </div>
                </div>

                {/* Status */}
                <div className="col-span-1">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className={`text-sm ${status.color}`}>
                            {status.text}
                        </span>
                    </div>
                </div>

                {/* Details */}
                <div className="col-span-1">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onViewDetails?.(mission.id)}
                            className="flex items-center justify-center w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => {
                                setShowSubmissions(!showSubmissions);
                                if (!showSubmissions) {
                                    loadSubmissions();
                                }
                            }}
                            className="flex items-center justify-center w-8 h-8 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                            title="View Submissions"
                        >
                            {showSubmissions ? (
                                <ChevronUp className="w-4 h-4 text-green-400" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-green-400" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Submissions Dropdown */}
            {showSubmissions && (
                <div className="mt-3 border-t border-gray-700/50 pt-3">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-white">Submissions</h4>
                        <button
                            onClick={loadSubmissions}
                            disabled={loadingSubmissions}
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            {loadingSubmissions ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>

                    {loadingSubmissions ? (
                        <div className="text-center py-4">
                            <div className="text-gray-400 text-sm">Loading submissions...</div>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-4">
                            <User className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                            <div className="text-gray-400 text-sm">No submissions yet</div>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {submissions.map((submission) => (
                                <div key={submission.id} className="bg-gray-800/30 rounded-lg p-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(submission.status)}
                                            <div>
                                                <div className="text-sm font-medium text-white">{getUserDisplayName(submission)}</div>
                                                <div className="text-xs text-gray-400">Task: {submission.taskId}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${submission.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                                                submission.status === 'flagged' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {submission.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-2">
                                        <div>Completed: {submission.completedAt.toLocaleString()}</div>
                                        {submission.verifiedAt && (
                                            <div>Verified: {submission.verifiedAt.toLocaleString()}</div>
                                        )}
                                        {submission.flaggedAt && (
                                            <div>Flagged: {submission.flaggedAt.toLocaleString()}</div>
                                        )}
                                    </div>

                                    {submission.flaggedReason && (
                                        <div className="mb-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                                            <strong>Reason:</strong> {submission.flaggedReason}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        {submission.status === 'verified' && (
                                            <button
                                                onClick={() => setShowFlagModal({ completion: submission, show: true })}
                                                className="px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs transition-colors flex items-center gap-1"
                                            >
                                                <Flag className="w-3 h-3" />
                                                Flag
                                            </button>
                                        )}
                                        {submission.status === 'flagged' && (
                                            <button
                                                onClick={() => handleVerifySubmission(submission)}
                                                className="px-2 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded text-xs transition-colors flex items-center gap-1"
                                            >
                                                <CheckCircle className="w-3 h-3" />
                                                Verify
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Flag Modal */}
            {showFlagModal.show && showFlagModal.completion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Flag Submission</h3>
                        <p className="text-gray-400 mb-4">
                            Why are you flagging this submission from {showFlagModal.completion.userName}?
                        </p>

                        <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                            {getFlaggingReasons().map((reason) => (
                                <button
                                    key={reason.id}
                                    onClick={() => handleFlagSubmission(showFlagModal.completion!, reason.label)}
                                    className="w-full text-left p-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                                >
                                    {reason.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFlagModal({ completion: null, show: false })}
                                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

