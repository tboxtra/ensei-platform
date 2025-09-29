import React from 'react';
import { ModernButton } from './ModernButton';

interface MissionCardProps {
    mission: any;
    onParticipate?: (missionId: string) => void;
    onViewDetails?: (missionId: string) => void;
    showActions?: boolean;
    variant?: 'default' | 'compact' | 'detailed';
}

export function MissionCard({
    mission,
    onParticipate,
    onViewDetails,
    showActions = true,
    variant = 'default'
}: MissionCardProps) {
    const getModelColor = (model: string) => {
        switch (model?.toLowerCase()) {
            case 'fixed': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'degen': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'premium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'custom': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
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
            default: return '🌐';
        }
    };

    const formatReward = (mission: any) => {
        // For degen missions, use the preset cost
        if (mission.model?.toLowerCase() === 'degen') {
            if (mission.selectedDegenPreset?.costUSD) {
                return `$${mission.selectedDegenPreset.costUSD.toFixed(2)}`;
            }
            if (mission.total_cost_usd) return `$${mission.total_cost_usd.toFixed(2)}`;
            if (mission.total_cost) return `$${mission.total_cost.toFixed(2)}`;
            if (mission.cost_usd) return `$${mission.cost_usd.toFixed(2)}`;
            if (mission.cost) return `$${mission.cost.toFixed(2)}`;
        }

        // For fixed missions or fallback
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

    if (variant === 'compact') {
        return (
            <div className="bg-black/40 backdrop-blur-lg rounded-xl p-4 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getPlatformIcon(mission.platform)}</span>
                            <h3 className="font-semibold text-white truncate">{mission.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(mission.status)}`}>
                                {mission.status}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm truncate">{mission.description}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                        <div className="text-right">
                            <div className="text-green-400 font-semibold">{formatReward(mission)}</div>
                            <div className="text-gray-500 text-xs">{formatDeadline(mission.deadline)}</div>
                        </div>
                        {showActions && (
                            <ModernButton
                                size="sm"
                                onClick={() => onViewDetails?.(mission.id)}
                                className="whitespace-nowrap"
                            >
                                View
                            </ModernButton>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPlatformIcon(mission.platform)}</span>
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                            {mission.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-400 text-sm capitalize">{mission.platform}</span>
                            {mission.type && (
                                <>
                                    <span className="text-gray-600">•</span>
                                    <span className="text-gray-400 text-sm capitalize">{mission.type}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(mission.status)}`}>
                        {mission.status}
                    </span>
                    {mission.model && (
                        <span className={`px-3 py-1 rounded-full text-sm border ${getModelColor(mission.model)}`}>
                            {mission.model}
                        </span>
                    )}
                </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 mb-4 line-clamp-2">{mission.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{formatReward(mission)}</div>
                    <div className="text-gray-500 text-sm">Reward</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                        {mission.participants_count || mission.participants || 0}
                    </div>
                    <div className="text-gray-500 text-sm">Participants</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                        {mission.model?.toLowerCase() === 'degen'
                            ? (mission.winnersCap || mission.winners_cap || 0)
                            : (mission.cap || mission.max_participants || '∞')
                        }
                    </div>
                    <div className="text-gray-500 text-sm">
                        {mission.model?.toLowerCase() === 'degen' ? 'Winners' : 'Max'}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{formatDeadline(mission.deadline, mission.model)}</div>
                    <div className="text-gray-500 text-sm">Deadline</div>
                </div>
            </div>

            {/* Actions */}
            {showActions && (
                <div className="flex gap-3">
                    <ModernButton
                        onClick={() => onViewDetails?.(mission.id)}
                        variant="secondary"
                        className="flex-1"
                    >
                        View Details
                    </ModernButton>
                    <ModernButton
                        onClick={() => onParticipate?.(mission.id)}
                        className="flex-1"
                    >
                        Participate
                    </ModernButton>
                </div>
            )}
        </div>
    );
}
