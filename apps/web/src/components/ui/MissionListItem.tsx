import React from 'react';

interface MissionListItemProps {
    mission: any;
    onViewDetails?: (missionId: string) => void;
}

export function MissionListItem({
    mission,
    onViewDetails
}: MissionListItemProps) {
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
                    <button
                        onClick={() => onViewDetails?.(mission.id)}
                        className="flex items-center justify-center w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

