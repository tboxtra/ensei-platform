'use client';

import { useState, useEffect } from 'react';
import { useApi } from '../../../hooks/useApi';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import { ModernCard } from '../../../components/ui/ModernCard';
import { ModernButton } from '../../../components/ui/ModernButton';

export default function MyMissionsPage() {
    const { getMyMissions, loading, error } = useApi();
    const [missions, setMissions] = useState<any[]>([]);
    const [filteredMissions, setFilteredMissions] = useState<any[]>([]);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPlatform, setSelectedPlatform] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [sortBy, setSortBy] = useState('created');

    useEffect(() => {
        loadMyMissions();
    }, []);

    useEffect(() => {
        filterAndSortMissions();
    }, [missions, selectedStatus, selectedPlatform, selectedType, sortBy]);

    const loadMyMissions = async () => {
        try {
            const data = await getMyMissions();
            setMissions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading my missions:', err);
            setMissions([]);
        }
    };

    const filterAndSortMissions = () => {
        let filtered = missions.filter(mission => {
            if (selectedStatus !== 'all' && mission.status !== selectedStatus) return false;
            if (selectedPlatform !== 'all' && mission.platform !== selectedPlatform) return false;
            if (selectedType !== 'all' && mission.type !== selectedType) return false;
            return true;
        });

        // Sort missions
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'created':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'reward':
                    return (b.total_cost_honors || 0) - (a.total_cost_honors || 0);
                case 'participants':
                    return (b.participants || 0) - (a.participants || 0);
                default:
                    return 0;
            }
        });

        setFilteredMissions(filtered);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'completed':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'draft':
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            case 'paused':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getPlatformIcon = (platform: string) => {
        const icons: { [key: string]: string } = {
            twitter: '𝕏',
            instagram: '📸',
            tiktok: '🎵',
            facebook: '📘',
            whatsapp: '💬',
            snapchat: '👻',
            telegram: '📱',
            custom: '⚡'
        };
        return icons[platform] || '🌐';
    };

    if (loading) {
        return (
            <ModernLayout currentPage="/missions/my">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading your missions...</p>
                    </div>
                </div>
            </ModernLayout>
        );
    }

    return (
        <ModernLayout currentPage="/missions/my">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent mb-4">
                        My Missions
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Manage and track your mission campaigns
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
                        <div className="text-3xl font-bold text-green-400 mb-2">
                            {missions.length}
                        </div>
                        <div className="text-sm text-gray-400">Total Missions</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
                        <div className="text-3xl font-bold text-blue-400 mb-2">
                            {missions.filter(m => m.status === 'active').length}
                        </div>
                        <div className="text-sm text-gray-400">Active</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30">
                        <div className="text-3xl font-bold text-orange-400 mb-2">
                            {missions.filter(m => m.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-400">Completed</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                        <div className="text-3xl font-bold text-purple-400 mb-2">
                            {missions.reduce((total, m) => total + (m.total_cost_honors || 0), 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">Total Rewards</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-8">
                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="draft">Draft</option>
                                    <option value="paused">Paused</option>
                                </select>
                            </div>

                            {/* Platform Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
                                <select
                                    value={selectedPlatform}
                                    onChange={(e) => setSelectedPlatform(e.target.value)}
                                    className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="all">All Platforms</option>
                                    <option value="twitter">Twitter/X</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="snapchat">Snapchat</option>
                                    <option value="telegram">Telegram</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>

                            {/* Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="all">All Types</option>
                                    <option value="engage">Engage</option>
                                    <option value="content">Content</option>
                                    <option value="ambassador">Ambassador</option>
                                </select>
                            </div>

                            {/* Sort Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="created">Created Date</option>
                                    <option value="reward">Reward</option>
                                    <option value="participants">Participants</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Missions List */}
                {error ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center">
                        <div className="text-red-400 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Unable to Load Missions</h2>
                        <p className="text-gray-300 mb-6">
                            There was an error loading your missions. Please try again later.
                        </p>
                        <ModernButton
                            onClick={() => loadMyMissions()}
                            variant="primary"
                            loading={loading}
                        >
                            Try Again
                        </ModernButton>
                    </div>
                ) : filteredMissions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Missions Found</h3>
                        <p className="text-gray-400 mb-6">
                            {missions.length === 0
                                ? "You haven't created any missions yet."
                                : "Try adjusting your filters to see more missions."
                            }
                        </p>
                        {missions.length === 0 && (
                            <ModernButton
                                onClick={() => window.location.href = '/missions/create'}
                                variant="primary"
                            >
                                Create Your First Mission
                            </ModernButton>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMissions.map((mission) => (
                            <ModernCard key={mission.id} className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-2xl">
                                            {getPlatformIcon(mission.platform)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-lg">{mission.title}</h3>
                                            <p className="text-gray-400 text-sm capitalize">{mission.platform} • {mission.type}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(mission.status)}`}>
                                        {mission.status}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Reward</span>
                                        <span className="text-green-400 font-semibold">
                                            {mission.total_cost_honors?.toLocaleString() || 0} Honors
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Participants</span>
                                        <span className="text-white">
                                            {mission.participants || 0}/{mission.cap || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Submissions</span>
                                        <span className="text-white">
                                            {mission.approved_submissions || 0}/{mission.submissions || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Completion Rate</span>
                                        <span className="text-white">
                                            {mission.completion_rate || 0}%
                                        </span>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <ModernButton
                                        variant="primary"
                                        className="flex-1"
                                        onClick={() => window.location.href = `/missions/${mission.id}`}
                                    >
                                        View Details
                                    </ModernButton>
                                    {mission.status === 'active' && (
                                        <ModernButton
                                            variant="secondary"
                                            onClick={() => window.location.href = `/missions/${mission.id}/participate`}
                                        >
                                            Manage
                                        </ModernButton>
                                    )}
                                </div>
                            </ModernCard>
                        ))}
                    </div>
                )}
            </div>
        </ModernLayout>
    );
}