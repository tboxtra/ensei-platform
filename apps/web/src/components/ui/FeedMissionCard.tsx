import React from 'react';
import { ModernButton } from './ModernButton';
import { EmbeddedContent } from './EmbeddedContent';

interface FeedMissionCardProps {
    mission: any;
    onParticipate?: (missionId: string) => void;
    onViewDetails?: (missionId: string) => void;
    showActions?: boolean;
}

export function FeedMissionCard({
    mission,
    onParticipate,
    onViewDetails,
    showActions = true
}: FeedMissionCardProps) {
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
            case 'twitter': return '🐦';
            case 'instagram': return '📷';
            case 'youtube': return '📺';
            case 'tiktok': return '🎵';
            case 'linkedin': return '💼';
            case 'discord': return '💬';
            case 'facebook': return '📘';
            default: return '🌐';
        }
    };

    const formatReward = (mission: any) => {
        if (mission.total_cost_honors) {
            return `${mission.total_cost_honors} Honors`;
        }
        if (mission.rewards?.honors) {
            return `${mission.rewards.honors} Honors`;
        }
        if (mission.rewards?.usd) {
            return `$${mission.rewards.usd}`;
        }
        return 'Reward TBD';
    };

    const formatDeadline = (deadline: string) => {
        if (!deadline) return 'No deadline';
        const date = new Date(deadline);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Expired';
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        return `${diffDays} days left`;
    };

    const hasContentLink = mission.tweetLink || mission.contentLink || mission.link || mission.tweet_link || mission.content_link;

    // Debug logging
    console.log('FeedMissionCard: Mission link fields:', {
        id: mission.id,
        title: mission.title,
        platform: mission.platform,
        tweetLink: mission.tweetLink,
        contentLink: mission.contentLink,
        link: mission.link,
        tweet_link: mission.tweet_link,
        content_link: mission.content_link,
        hasContentLink,
        allFields: Object.keys(mission)
    });

    return (
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group overflow-hidden">

            {/* Header with platform and status */}
            <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">{getPlatformIcon(mission.platform)}</span>
                        </div>
                        <div>
                            <div className="font-semibold text-white text-sm capitalize">{mission.platform}</div>
                            <div className="text-xs text-gray-400 capitalize">{mission.type} Mission</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(mission.status)}`}>
                            {mission.status}
                        </span>
                        {mission.model && (
                            <span className={`px-2 py-1 rounded-full text-xs border ${getModelColor(mission.model)}`}>
                                {mission.model}
                            </span>
                        )}
                    </div>
                </div>

                {/* Mission Title */}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {mission.title}
                </h3>
            </div>

            {/* Embedded Content or Mission Description */}
            <div className="px-6 pb-4">
                {hasContentLink ? (
                    <EmbeddedContent
                        url={mission.tweetLink || mission.contentLink || mission.link || mission.tweet_link || mission.content_link}
                        platform={mission.platform}
                        className="mb-4"
                    />
                ) : (
                    <div className="bg-gray-800/30 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <span className="text-blue-400 text-sm">📝</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-blue-400 mb-1">Mission Description</h4>
                                <p className="text-gray-300 leading-relaxed text-sm">{mission.description}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mission Instructions */}
            {mission.instructions && (
                <div className="px-6 pb-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <span className="text-blue-400 text-sm">💡</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-blue-400 mb-1">Instructions</h4>
                                <p className="text-sm text-gray-300">{mission.instructions}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mission Stats */}
            <div className="px-4 pb-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{formatReward(mission)}</div>
                        <div className="text-gray-500 text-xs">Reward</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">
                            {mission.participants_count || mission.participants || 0}
                        </div>
                        <div className="text-gray-500 text-xs">Participants</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">
                            {mission.cap || mission.max_participants || '∞'}
                        </div>
                        <div className="text-gray-500 text-xs">Max</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">{formatDeadline(mission.deadline)}</div>
                        <div className="text-gray-500 text-xs">Deadline</div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {showActions && (
                <div className="px-4 pb-4">
                    <div className="flex gap-2">
                        <ModernButton
                            onClick={() => onViewDetails?.(mission.id)}
                            variant="secondary"
                            className="flex-1 text-sm py-2"
                        >
                            View Details
                        </ModernButton>
                        <ModernButton
                            onClick={() => onParticipate?.(mission.id)}
                            className="flex-1 text-sm py-2"
                        >
                            Participate
                        </ModernButton>
                    </div>
                </div>
            )}
        </div>
    );
}
