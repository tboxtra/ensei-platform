'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMyMissions } from '../../../hooks/useMyMissions';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import { ModernCard } from '../../../components/ui/ModernCard';
import { ModernButton } from '../../../components/ui/ModernButton';
import { MissionListItem } from '../../../components/ui/MissionListItem';
import { FilterBar } from '../../../components/ui/FilterBar';
import { StatsCard } from '../../../components/ui/StatsCard';
import { Spinner, ErrorBox } from '../../../components/ui/Feedback';

export default function MyMissionsPage() {
    const router = useRouter();
    const { user: currentUser, ready: authReady, isAuthenticated } = useAuthUser();
    const { data: missions = [], isLoading, error, refetch } = useMyMissions();
    const [filteredMissions, setFilteredMissions] = useState<any[]>([]);

    // Filter state
    const [filters, setFilters] = useState({
        type: 'all',
        model: 'all',
        platform: 'all',
        status: 'all',
        showEnded: false,
        sortBy: 'created'
    });

    const handleFilterChange = (filter: string, value: string) => {
        setFilters(prev => ({ ...prev, [filter]: value }));
    };

    // Handle authentication redirect
    useEffect(() => {
        if (authReady && !isAuthenticated) {
            console.log('MyMissionsPage: User not authenticated, redirecting to login');
            router.push('/auth/login');
        }
    }, [authReady, isAuthenticated, router]);

    // Defensive: refetch after navigation completes from profile
    useEffect(() => {
        // Refetch once authReady flips to true ensures fresh data after any route
        if (authReady && isAuthenticated) {
            refetch();
        }
    }, [authReady, isAuthenticated, refetch]);

    useEffect(() => {
        filterAndSortMissions();
    }, [missions, filters]);

    const filterAndSortMissions = () => {
        let filtered = (missions || []).filter(mission => {
            // Apply regular filters
            if (filters.status !== 'all' && mission.status !== filters.status) return false;
            if (filters.platform !== 'all' && mission.platform !== filters.platform) return false;
            if (filters.type !== 'all' && mission.type !== filters.type) return false;
            if (filters.model !== 'all' && mission.model !== filters.model) return false;

            // Mission expiration logic - only hide if showEnded is false
            if (!filters.showEnded) {
                if (mission.model?.toLowerCase() === 'degen') {
                    // For degen missions: hide if deadline has passed
                    if (mission.deadline) {
                        const deadline = new Date(mission.deadline);
                        const now = new Date();
                        if (deadline.getTime() <= now.getTime()) {
                            return false; // Hide expired degen missions
                        }
                    }
                } else if (mission.model?.toLowerCase() === 'fixed') {
                    // For fixed missions: hide if participant cap is reached
                    const currentParticipants = mission.participants_count || mission.participants || 0;
                    const maxParticipants = mission.max_participants || mission.cap || 0;
                    if (maxParticipants > 0 && currentParticipants >= maxParticipants) {
                        return false; // Hide fixed missions that have reached their cap
                    }
                }
            }

            return true;
        });

        // Sort missions
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'created':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'reward':
                    return (b.total_cost_honors || 0) - (a.total_cost_honors || 0);
                case 'participants':
                    return (b.participants_count || 0) - (a.participants_count || 0);
                case 'deadline':
                    return new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime();
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

    const handleEditMission = (missionId: string) => {
        console.log('Editing mission:', missionId);
        // TODO: Navigate to edit mission page
    };

    const handleViewDetails = (missionId: string) => {
        console.log('Viewing details for mission:', missionId);
        // TODO: Navigate to mission details page
    };

    const handleDeleteMission = (missionId: string) => {
        console.log('Deleting mission:', missionId);
        // TODO: Implement delete mission logic
    };

    // Calculate stats
    const totalMissions = (missions || []).length;
    const activeMissions = (missions || []).filter(m => m.status === 'active').length;
    const completedMissions = (missions || []).filter(m => m.status === 'completed').length;
    const totalRewards = (missions || []).reduce((sum, mission) => sum + (mission.total_cost_honors || 0), 0);
    const totalParticipants = (missions || []).reduce((sum, mission) => sum + (mission.participants_count || 0), 0);

    // Handle auth readiness - resolve immediately on auth state determination
    if (!authReady) {
        return (
            <ModernLayout currentPage="/missions/my">
                <Spinner label="Checking session…" />
            </ModernLayout>
        );
    }

    // Show nothing while redirecting unauthenticated users
    if (!isAuthenticated) {
        return null;
    }

    // Handle loading state
    if (isLoading) {
        return (
            <ModernLayout currentPage="/missions/my">
                <Spinner label="Loading your missions…" />
            </ModernLayout>
        );
    }

    // Handle error state
    if (error) {
        return (
            <ModernLayout currentPage="/missions/my">
                <ErrorBox
                    title="Couldn't load your missions"
                    details={(error as Error).message}
                    actionLabel="Retry"
                    onAction={() => refetch()}
                />
            </ModernLayout>
        );
    }

    return (
        <ModernLayout currentPage="/missions/my">
                <div className="container mx-auto px-2 py-2">
                    {/* Header */}
                    <div className="text-left mb-2">
                        <h1 className="text-lg font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-1">
                            My Missions
                        </h1>
                        <p className="text-gray-400 text-xs">Manage and track your created missions</p>
                    </div>

                    {/* Stats Cards */}
                    {totalMissions > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <StatsCard
                                title="Total Missions"
                                value={totalMissions}
                                icon="📋"
                                description="Created by you"
                            />
                            <StatsCard
                                title="Active Missions"
                                value={activeMissions}
                                icon="⚡"
                                description="Currently running"
                            />
                            <StatsCard
                                title="Total Participants"
                                value={totalParticipants}
                                icon="👥"
                                description="Across all missions"
                            />
                            <StatsCard
                                title="Total Rewards"
                                value={`${totalRewards.toLocaleString()} Honors`}
                                icon="💰"
                                description="Distributed"
                            />
                        </div>
                    )}

                    {/* Filters */}
                    <div className="mb-8">
                        <FilterBar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            showPlatform={true}
                            showStatus={true}
                            showType={true}
                            showModel={true}
                            showSort={true}
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8">
                        <ModernCard>
                            <div className="flex flex-wrap gap-4 items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Quick Actions</h3>
                                    <p className="text-gray-400 text-sm">Manage your missions efficiently</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <label className="flex items-center gap-2 text-sm text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={filters.showEnded}
                                            onChange={(e) => handleFilterChange('showEnded', e.target.checked.toString())}
                                            className="rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                                        />
                                        Show Ended Missions
                                    </label>
                                    <ModernButton
                                        onClick={() => router.push('/missions/create')}
                                        variant="primary"
                                    >
                                        Create New Mission
                                    </ModernButton>
                                    <ModernButton
                                        onClick={() => refetch()}
                                        variant="secondary"
                                    >
                                        Refresh
                                    </ModernButton>
                                </div>
                            </div>
                        </ModernCard>
                    </div>

                    {/* Missions List */}
                    {filteredMissions.length > 0 ? (
                        <div className="space-y-3">
                            {/* List Header */}
                            <div className="bg-gray-800/50 rounded-lg p-3">
                                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-400">
                                    <div className="col-span-1">Mission</div>
                                    <div className="col-span-1">Date</div>
                                    <div className="col-span-1">Cost</div>
                                    <div className="col-span-1">Clicks</div>
                                    <div className="col-span-1">Status</div>
                                    <div className="col-span-1">Details</div>
                                </div>
                            </div>

                            {/* Mission Items */}
                            {filteredMissions.map((mission) => (
                                <MissionListItem
                                    key={mission.id}
                                    mission={mission}
                                    onViewDetails={handleViewDetails}
                                />
                            ))}
                        </div>
                    ) : (missions || []).length === 0 ? (
                        /* Empty state when no missions exist */
                        <div className="max-w-2xl mx-auto">
                            <ModernCard className="text-center">
                                <div className="text-gray-400 text-6xl mb-4">📋</div>
                                <h2 className="text-2xl font-bold text-white mb-4">No Missions Created Yet</h2>
                                <p className="text-gray-400 mb-6">You haven't created any missions yet. Start by creating your first mission to engage with the community!</p>
                                <div className="flex gap-4 justify-center">
                                    <ModernButton onClick={() => refetch()} variant="secondary">Refresh</ModernButton>
                                    <ModernButton onClick={() => router.push('/missions/create')} variant="primary">Create Your First Mission</ModernButton>
                                </div>
                            </ModernCard>
                        </div>
                    ) : (
                        /* No missions match filters */
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold text-white mb-2">No missions match your filters</h3>
                            <p className="text-gray-400 mb-4">Try adjusting your filter criteria</p>
                            <ModernButton
                                onClick={() => {
                                    setFilters({
                                        type: 'all',
                                        model: 'all',
                                        platform: 'all',
                                        status: 'all',
                                        showEnded: false,
                                        sortBy: 'created'
                                    });
                                }}
                                variant="secondary"
                            >
                                Clear Filters
                            </ModernButton>
                        </div>
                    )}
                </div>
        </ModernLayout>
    );
}