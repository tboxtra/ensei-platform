'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useMyMissions } from '../../../hooks/useMyMissions';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import { ModernCard } from '../../../components/ui/ModernCard';
import { ModernButton } from '../../../components/ui/ModernButton';
import { FilterBar } from '../../../components/ui/FilterBar';
import { Spinner, ErrorBox } from '../../../components/ui/Feedback';

export default function MyMissionsPage() {
    const router = useRouter();
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) { 
                router.replace('/auth/login'); 
            }
            setAuthReady(true);
        });
        return unsub;
    }, [router]);

    if (!authReady) {
        // Optional: tiny full-page skeleton to avoid a blank frame
        return (
            <ModernLayout currentPage="/missions/my">
                <Spinner label="Loading…" />
            </ModernLayout>
        );
    }

    // Past this point the page must render regardless of queries
    return <MyMissionsContent />;
}

function MyMissionsContent() {
    const router = useRouter();
    const { data: missions = [], isLoading, error, refetch } = useMyMissions();

    // Filter state with proper types
    type Filters = {
        type: string;
        model: string;
        platform: string;
        status: string;
        showEnded: boolean;
        sortBy: string;
    };

    const [filters, setFilters] = useState<Filters>({
        type: 'all',
        model: 'all',
        platform: 'all',
        status: 'all',
        showEnded: false,
        sortBy: 'created'
    });

    const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Wrapper for FilterBar component (only handles string filters)
    // Note: FilterBar callback is (filter: string, value: string), so it can't set showEnded (boolean)
    // showEnded is handled separately via direct checkbox handler to maintain type safety
    type StringFilterKey = 'type' | 'model' | 'platform' | 'status' | 'sortBy';
    const handleFilterBarChange = (filter: string, value: string) => {
        const key = filter as StringFilterKey;
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Compute filtered missions with useMemo for better performance
    const filteredMissions = useMemo(() => {
        const arr = (missions || []).filter(mission => {
            // Apply regular filters
            if (filters.status !== 'all' && mission.status !== filters.status) return false;
            if (filters.platform !== 'all' && mission.platform !== filters.platform) return false;
            if (filters.type !== 'all' && mission.type !== filters.type) return false;
            if (filters.model !== 'all' && mission.model !== filters.model) return false;

            // Mission expiration logic - only hide if showEnded is false
            if (!filters.showEnded) {
                const model = mission.model?.toLowerCase();
                if (model === 'degen') {
                    // For degen missions: hide if deadline has passed
                    if (mission.deadline) {
                        const d = new Date(mission.deadline).getTime();
                        if (!Number.isNaN(d) && d <= Date.now()) return false;
                    }
                } else if (model === 'fixed') {
                    // For fixed missions: hide if participant cap is reached
                    const current = mission.participants_count ?? mission.participants ?? 0;
                    const max = mission.max_participants ?? mission.cap ?? 0;
                    if (max > 0 && current >= max) return false;
                }
            }

            return true;
        });

        // Sort missions
        arr.sort((a, b) => {
            switch (filters.sortBy) {
                case 'created': {
                    const at = new Date(a.created_at ?? 0).getTime();
                    const bt = new Date(b.created_at ?? 0).getTime();
                    return bt - at;
                }
                case 'reward':
                    return (b.total_cost_honors ?? 0) - (a.total_cost_honors ?? 0);
                case 'participants':
                    return (b.participants_count ?? 0) - (a.participants_count ?? 0);
                case 'deadline': {
                    const at = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
                    const bt = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
                    return at - bt; // soonest first
                }
                default:
                    return 0;
            }
        });

        return arr;
    }, [missions, filters]);

    // Status color mapping for better extensibility (memoized to avoid re-creation)
    const STATUS_STYLE = useMemo(() => ({
        active: 'bg-green-500/20 text-green-400 border-green-500/30',
        completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    } as Record<string, string>), []);

    const getStatusColor = (status: string) => STATUS_STYLE[status] ?? STATUS_STYLE.draft;

    // Shared date formatter for consistent date display
    const dateFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    }), []);

    const handleEditMission = useCallback((id: string) => router.push(`/missions/${id}/edit`), [router]);
    const handleViewDetails = useCallback((id: string) => router.push(`/missions/${id}`), [router]);

    const handleDeleteMission = (missionId: string) => {
        // TODO: Implement delete mission logic
    };

    // Prefetch mission detail pages for snappier navigation (capped to avoid queueing dozens of routes)
    useEffect(() => {
        filteredMissions.slice(0, 12).forEach(m => router.prefetch(`/missions/${m.id}`));
    }, [filteredMissions, router]);

    // Memoized stats to prevent recomputation on every render
    const { totalMissions, activeMissions, completedMissions, totalRewards, totalParticipants } = useMemo(() => {
        const list = missions || [];
        return {
            totalMissions: list.length,
            activeMissions: list.filter(m => m.status === 'active').length,
            completedMissions: list.filter(m => m.status === 'completed').length,
            totalRewards: list.reduce((s, m) => s + (m.total_cost_honors ?? 0), 0),
            totalParticipants: list.reduce((s, m) => s + (m.participants_count ?? 0), 0),
        };
    }, [missions]);

    // No auth checks here - auth is handled at the page level

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
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            My Missions
                        </h1>
                        {isLoading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                        )}
                    </div>
                    <p className="text-gray-400 text-xs">Manage and track your created missions</p>
                </div>

                {/* Stats Cards */}
                {totalMissions > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4" aria-live="polite">
                        <div className="bg-gray-800/30 rounded-lg p-2 text-center shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                            <div className="text-sm font-bold text-white">{totalMissions}</div>
                            <div className="text-xs text-gray-400">Missions</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-2 text-center shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                            <div className="text-sm font-bold text-white">{activeMissions}</div>
                            <div className="text-xs text-gray-400">Active</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-2 text-center shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                            <div className="text-sm font-bold text-white">{completedMissions}</div>
                            <div className="text-xs text-gray-400">Completed</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-2 text-center shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                            <div className="text-sm font-bold text-white">{totalParticipants}</div>
                            <div className="text-xs text-gray-400">Participants</div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="mb-4">
                    <FilterBar
                        filters={filters}
                        onFilterChange={handleFilterBarChange}
                        showPlatform={true}
                        showStatus={true}
                        showType={true}
                        showModel={true}
                        showSort={true}
                    />
                </div>

                {/* Quick Actions */}
                <div className="mb-4 flex gap-3 items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                            type="checkbox"
                            checked={filters.showEnded}
                            onChange={(e) => handleFilterChange('showEnded', e.target.checked)}
                            className="rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                        />
                        Show Ended Missions
                    </label>
                    <div className="flex gap-2">
                        <ModernButton
                            onClick={() => router.push('/missions/create')}
                            variant="primary"
                            size="sm"
                        >
                            Create Mission
                        </ModernButton>
                        <ModernButton
                            onClick={() => refetch()}
                            variant="secondary"
                            size="sm"
                        >
                            Refresh
                        </ModernButton>
                    </div>
                </div>

                {/* Missions List */}
                {filteredMissions.length > 0 ? (
                    <div 
                        key={`missions-${filters.type}-${filters.model}-${filters.platform}-${filters.status}-${filters.sortBy}-${filters.showEnded}`}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-200"
                        aria-live="polite"
                    >
                        {filteredMissions.map((mission) => (
                            <ModernCard key={mission.id} className="p-4">
                                <div className="space-y-3">
                                    {/* Mission Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold text-white truncate">
                                                {mission.title || 'Untitled Mission'}
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {[mission.platform, mission.type].filter(Boolean).join(' • ') || '—'}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
                                            {mission.status}
                                        </span>
                                    </div>

                                    {/* Mission Stats */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-gray-800/30 rounded p-2 text-center">
                                            <div className="text-white font-semibold">{mission.participants_count || 0}</div>
                                            <div className="text-gray-400">Participants</div>
                                        </div>
                                        <div className="bg-gray-800/30 rounded p-2 text-center">
                                            <div className="text-white font-semibold">{mission.total_cost_honors || 0}</div>
                                            <div className="text-gray-400">Honors</div>
                                        </div>
                                    </div>

                                    {/* Mission Details */}
                                    <div className="text-xs text-gray-400 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Model:</span>
                                            <span className="text-white capitalize">{mission.model || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Created:</span>
                                            <span className="text-white">
                                                {mission.created_at ? dateFormatter.format(new Date(mission.created_at)) : 'N/A'}
                                            </span>
                                        </div>
                                        {mission.deadline && (() => {
                                            const deadline = new Date(mission.deadline);
                                            return !isNaN(deadline.getTime()) && (
                                                <div className="flex justify-between">
                                                    <span>Deadline:</span>
                                                    <span className="text-white">
                                                        {dateFormatter.format(deadline)}
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Mission Actions */}
                                    <div className="flex gap-2">
                                        <ModernButton
                                            onClick={() => handleViewDetails(mission.id)}
                                            variant="secondary"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            View Details
                                        </ModernButton>
                                        <ModernButton
                                            onClick={() => handleEditMission(mission.id)}
                                            variant="primary"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            Edit
                                        </ModernButton>
                                    </div>
                                </div>
                            </ModernCard>
                        ))}
                    </div>
                ) : (missions || []).length === 0 ? (
                    /* Empty state when no missions exist */
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-12 text-center">
                            <div className="text-gray-400 text-8xl mb-6">🎯</div>
                            <h2 className="text-3xl font-bold text-gray-300 mb-4">No Missions Created Yet</h2>
                            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                                You haven't created any missions yet. Start by creating your first mission to engage with the community and earn rewards!
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <ModernButton
                                    onClick={() => refetch()}
                                    variant="secondary"
                                >
                                    🔄 Refresh
                                </ModernButton>
                                <ModernButton
                                    onClick={() => router.push('/missions/create')}
                                    variant="primary"
                                >
                                    🚀 Create Your First Mission
                                </ModernButton>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* No missions match filters */
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-white mb-2">No missions match your filters</h3>
                        <p className="text-gray-400 mb-4">Try adjusting your filter criteria or show ended missions</p>
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