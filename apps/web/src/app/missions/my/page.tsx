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
            // Demo data for when API is not available
            setMissions([
        {
            id: '1',
            platform: 'twitter',
            type: 'engage',
                    model: 'fixed',
                    title: 'Twitter Engagement Campaign',
            status: 'active',
            participants: 45,
                    submissions: 23,
                    approved_submissions: 18,
                    pending_submissions: 5,
                    total_cost_honors: 1000,
                    total_cost_usd: 2.22,
                    cap: 100,
                    completion_rate: 75,
                    created_at: '2024-01-15T10:00:00Z',
                    ends_at: '2024-12-31T23:59:59Z'
        },
        {
            id: '2',
            platform: 'instagram',
            type: 'content',
                    model: 'degen',
                    title: 'Instagram Content Creation',
            status: 'completed',
                    participants: 30,
                    submissions: 28,
                    approved_submissions: 25,
                    pending_submissions: 3,
                    total_cost_honors: 1500,
                    total_cost_usd: 3.33,
                    cap: 50,
                    completion_rate: 83,
                    created_at: '2024-01-10T14:30:00Z',
                    ends_at: '2024-01-20T23:59:59Z'
        },
        {
            id: '3',
            platform: 'tiktok',
            type: 'ambassador',
                    model: 'fixed',
                    title: 'TikTok Ambassador Program',
                    status: 'draft',
                    participants: 0,
                    submissions: 0,
                    approved_submissions: 0,
                    pending_submissions: 0,
                    total_cost_honors: 800,
                    total_cost_usd: 1.78,
                    cap: 75,
                    completion_rate: 0,
                    created_at: '2024-01-20T09:15:00Z',
                    ends_at: '2024-02-20T23:59:59Z'
                }
            ]);
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
                case 'completion':
                    return (b.completion_rate || 0) - (a.completion_rate || 0);
                default:
                    return 0;
            }
        });

        setFilteredMissions(filtered);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-400';
            case 'completed': return 'text-blue-400';
            case 'draft': return 'text-yellow-400';
            case 'paused': return 'text-orange-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            active: 'bg-green-500/20 text-green-400 border-green-500/30',
            completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            paused: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    const getPlatformIcon = (platform: string) => {
        const icons: { [key: string]: string } = {
            twitter: '𝕏',
            instagram: '📸',
            tiktok: '🎵',
            facebook: '📘',
            whatsapp: '💬',
            snapchat: '👻',
            telegram: '📱'
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
                {/* Hero Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
                        My Missions
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Track and manage all the missions you've created. Monitor performance, review submissions, and optimize your campaigns.
                    </p>
                </div>

                {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <ModernCard className="p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">
                                {missions.length}
                            </div>
                            <div className="text-sm text-gray-400">Total Missions</div>
                                    </div>
                    </ModernCard>
                    <ModernCard className="p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400 mb-2">
                                {missions.filter(m => m.status === 'active').length}
                            </div>
                            <div className="text-sm text-gray-400">Active</div>
                                    </div>
                    </ModernCard>
                    <ModernCard className="p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-400 mb-2">
                                {missions.reduce((sum, m) => sum + (m.participants || 0), 0)}
                            </div>
                            <div className="text-sm text-gray-400">Total Participants</div>
                                    </div>
                    </ModernCard>
                    <ModernCard className="p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-emerald-400 mb-2">
                                {missions.reduce((sum, m) => sum + (m.total_cost_honors || 0), 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-400">Total Spent (Honors)</div>
                        </div>
                    </ModernCard>
                        </div>

                {/* Filters and Actions */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="draft">Draft</option>
                                <option value="paused">Paused</option>
                            </select>
                            <select
                                value={selectedPlatform}
                                onChange={(e) => setSelectedPlatform(e.target.value)}
                                className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="all">All Platforms</option>
                                <option value="twitter">Twitter</option>
                                <option value="instagram">Instagram</option>
                                <option value="tiktok">TikTok</option>
                                <option value="facebook">Facebook</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="snapchat">Snapchat</option>
                                <option value="telegram">Telegram</option>
                            </select>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="all">All Types</option>
                                <option value="engage">Engage</option>
                                <option value="content">Content</option>
                                <option value="ambassador">Ambassador</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="created">Recently Created</option>
                                <option value="reward">Highest Reward</option>
                                <option value="participants">Most Participants</option>
                                <option value="completion">Best Completion Rate</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <ModernButton
                            onClick={() => window.location.href = '/missions/create'}
                            variant="success"
                        >
                            🚀 Create New Mission
                        </ModernButton>
                    </div>
                        </div>

                        {/* Missions List */}
                {filteredMissions.length === 0 ? (
                    <ModernCard className="text-center py-16">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold mb-2">No missions found</h3>
                        <p className="text-gray-400 mb-6">
                            {missions.length === 0
                                ? "You haven't created any missions yet."
                                : "No missions match your current filters."
                            }
                        </p>
                        <ModernButton
                            onClick={() => window.location.href = '/missions/create'}
                            variant="primary"
                        >
                            Create Your First Mission
                        </ModernButton>
                    </ModernCard>
                ) : (
                        <div className="space-y-6">
                            {filteredMissions.map((mission) => (
                            <ModernCard key={mission.id} className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="text-3xl">
                                                {getPlatformIcon(mission.platform)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-white">{mission.title}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(mission.status)}`}>
                                                        {mission.status}
                                                    </span>
                                        </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                                    <span className="capitalize">{mission.platform}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{mission.type}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{mission.model}</span>
                                        </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                                        <span className="text-gray-400">Participants:</span>
                                                        <span className="text-white ml-2">{mission.participants || 0}/{mission.cap || 0}</span>
                                        </div>
                                        <div>
                                                        <span className="text-gray-400">Submissions:</span>
                                                        <span className="text-white ml-2">{mission.submissions || 0}</span>
                                        </div>
                                        <div>
                                                        <span className="text-gray-400">Approved:</span>
                                                        <span className="text-green-400 ml-2">{mission.approved_submissions || 0}</span>
                                        </div>
                                        <div>
                                                        <span className="text-gray-400">Completion:</span>
                                                        <span className="text-blue-400 ml-2">{mission.completion_rate || 0}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-4">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-400 mb-1">
                                                {mission.total_cost_honors?.toLocaleString()} Honors
                                            </div>
                                            <div className="text-gray-400 text-sm">
                                                ${mission.total_cost_usd?.toFixed(2)} USD
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <ModernButton
                                                onClick={() => window.location.href = `/missions/${mission.id}`}
                                                variant="primary"
                                                size="sm"
                                            >
                                                View Details
                                            </ModernButton>
                                        {mission.status === 'active' && (
                                                <ModernButton
                                                    onClick={() => window.location.href = `/missions/${mission.id}?tab=submissions`}
                                                    variant="secondary"
                                                    size="sm"
                                                >
                                                    Review
                                                </ModernButton>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ModernCard>
                        ))}
                    </div>
                )}
            </div>
        </ModernLayout>
    );
}
