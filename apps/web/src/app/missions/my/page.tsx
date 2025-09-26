'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useMyMissions } from '../../../hooks/useMyMissions';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import { ModernButton } from '../../../components/ui/ModernButton';
import { FilterBar } from '../../../components/ui/FilterBar';
import { MissionListItem } from '../../../components/ui/MissionListItem';
import { Spinner, ErrorBox } from '../../../components/ui/Feedback';

type Filters = {
    type: string;
    model: string;
    platform: string;
    status: string;
    showEnded: boolean;
    sortBy: string;
};

function isEnded(m: any) {
  const model = (m.model || '').toLowerCase();
  const now = Date.now();

  if (model === 'degen') {
    if (!m.deadline) return false;
    const dl = new Date(m.deadline).getTime();
    return !Number.isNaN(dl) && dl <= now;
  }

  if (model === 'fixed') {
    const current = m.participants_count ?? m.participants ?? 0;
    const max = m.max_participants ?? m.cap ?? 0;
    return max > 0 && current >= max;
  }

  // generic: if deadline exists, use it
  if (m.deadline) {
    const dl = new Date(m.deadline).getTime();
    return !Number.isNaN(dl) && dl <= now;
  }
  return false;
}

// ADD THIS helper near isEnded()
function getClicksFromMission(m: any): number {
  // best: total verified tasks aggregated by the API
  const direct =
    m.verified_clicks ??
    m.verifiedCount ??
    m.verifications_count ??
    m.stats?.verified_tasks_total ??
    m.submissions_verified_tasks ??
    m.tasks_done ??                 // <-- your sidebar shows "Tasks Done"
    m.clicks;                       // <-- if your API already computes it
  if (direct != null) return Number(direct) || 0;

  // fallback: if API only gave us submission counts + tasks per mission,
  // estimate (still better than always 0)
  if (Array.isArray(m.tasks) && m.submissions_count != null) {
    const perSubmission = Number(m.tasks.length) || 0;
    return (Number(m.submissions_count) || 0) * perSubmission;
  }
  return 0;
}


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

    const [filters, setFilters] = useState<Filters>({
        type: 'all',
        model: 'all',
        platform: 'all',
        status: 'all',
        showEnded: false,
        sortBy: 'created',
    });

    const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) =>
        setFilters((p) => ({ ...p, [key]: value }));

    type StringFilterKey = 'type' | 'model' | 'platform' | 'status' | 'sortBy';
    const handleFilterBarChange = (filter: string, value: string) =>
        setFilters((p) => ({ ...p, [filter as StringFilterKey]: value }));

    const filteredMissions = useMemo(() => {
        const arr = (missions || [])
            .filter((m) => {
                if (filters.status !== 'all') {
                    // show computed status (auto-complete) in filtering too
                    const displayStatus =
                        m.status === 'active' && isEnded(m) ? 'completed' : m.status;
                    if (displayStatus !== filters.status) return false;
                }
                if (filters.platform !== 'all' && m.platform !== filters.platform) return false;
                if (filters.type !== 'all' && m.type !== filters.type) return false;
                if (filters.model !== 'all' && m.model !== filters.model) return false;

                // hide ended missions unless toggled on
                if (!filters.showEnded && isEnded(m)) return false;

                return true;
            })
            .sort((a, b) => {
                switch (filters.sortBy) {
                    case 'created': {
                        const at = new Date(a.created_at ?? 0).getTime();
                        const bt = new Date(b.created_at ?? 0).getTime();
                        return bt - at;
                    }
                    case 'reward':
                        return (b.total_cost_honors ?? 0) - (a.total_cost_honors ?? 0);
                    case 'participants': // legacy, keep working (but we display clicks)
                        return (b.participants_count ?? 0) - (a.participants_count ?? 0);
                    case 'deadline': {
                        const at = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
                        const bt = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
                        return at - bt;
                    }
                    default:
                        return 0;
                }
            });

        return arr;
    }, [missions, filters]);

    // compact stats
    const { totalMissions, activeMissions } = useMemo(() => {
        const list = missions || [];
        const computedActive = list.filter((m) => {
            const displayStatus = m.status === 'active' && isEnded(m) ? 'completed' : m.status;
            return displayStatus === 'active';
        }).length;
        return { totalMissions: list.length, activeMissions: computedActive };
    }, [missions]);

    useEffect(() => {
        filteredMissions.slice(0, 12).forEach((m) => router.prefetch(`/missions/${m.id}`));
    }, [filteredMissions, router]);

    if (isLoading) {
        return (
            <ModernLayout currentPage="/missions/my">
                <Spinner label="Loading your missions…" />
            </ModernLayout>
        );
    }

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
                {/* Header (smaller typography) */}
                <div className="text-left mb-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-base font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            My Missions
                        </h1>
                        {isLoading && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400" />}
                    </div>
                    <p className="text-[11px] text-gray-400">Manage and track your created missions</p>
                </div>

                {/* Tiny stats */}
                {totalMissions > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3" aria-live="polite">
                        <div className="bg-gray-800/30 rounded-lg p-2 text-center shadow-sm">
                            <div className="text-sm font-semibold text-white">{totalMissions}</div>
                            <div className="text-[11px] text-gray-400">Missions</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-2 text-center shadow-sm">
                            <div className="text-sm font-semibold text-white">{activeMissions}</div>
                            <div className="text-[11px] text-gray-400">Active</div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="mb-3 text-[12px]">
                    <FilterBar
                        filters={filters}
                        onFilterChange={handleFilterBarChange}
                        showPlatform
                        showStatus
                        showType
                        showModel
                        showSort
                    />
                </div>

                {/* Quick actions */}
                <div className="mb-3 flex gap-2 items-center justify-between">
                    <label className="flex items-center gap-2 text-[12px] text-gray-300">
                        <input
                            type="checkbox"
                            checked={filters.showEnded}
                            onChange={(e) => handleFilterChange('showEnded', e.target.checked)}
                            className="h-3 w-3 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                        />
                        Show Ended Missions
                    </label>
                    <div className="flex gap-2">
                        <ModernButton onClick={() => router.push('/missions/create')} variant="primary" size="sm">
                            Create Mission
                        </ModernButton>
                        <ModernButton onClick={() => refetch()} variant="secondary" size="sm">
                            Refresh
                        </ModernButton>
                    </div>
                </div>

                {/* List */}
                {filteredMissions.length > 0 ? (
                    <div
                        key={`missions-${filters.type}-${filters.model}-${filters.platform}-${filters.status}-${filters.sortBy}-${filters.showEnded}`}
                        className="space-y-2"
                        aria-live="polite"
                    >
            {/* Header row (smaller + rename Participants → Clicks) */}
            <div className="bg-gray-800/60 rounded-md px-3 py-2">
              <div className="grid grid-cols-12 items-center gap-2 text-[12px] font-medium text-gray-400">
                <div className="col-span-4">Mission</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Cost (USD)</div>
                <div className="col-span-2">Clicks</div>
                <div className="col-span-2 text-right">Status</div>
              </div>
            </div>

            {/* Items */}
            {filteredMissions.map((m) => (
              <MissionListItem
                key={m.id}
                mission={{
                  ...m,
                  // expose computed helper data the row will use
                  __displayStatus: m.status === 'active' && isEnded(m) ? 'completed' : m.status,
                  __verifiedClicks: getClicksFromMission(m),   // <-- pass robust clicks
                }}
                dense
                onRefetch={refetch}
              />
            ))}
                    </div>
                ) : (missions || []).length === 0 ? (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center">
                            <div className="text-gray-400 text-6xl mb-4">🎯</div>
                            <h2 className="text-xl font-semibold text-gray-300 mb-2">No Missions Created Yet</h2>
                            <p className="text-sm text-gray-400 mb-6">
                                Create your first mission to engage with the community and earn rewards!
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <ModernButton onClick={() => router.push('/missions/create')} variant="primary" size="sm">
                                    Create Mission
                                </ModernButton>
                                <ModernButton onClick={() => refetch()} variant="secondary" size="sm">
                                    Refresh
                                </ModernButton>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <div className="text-gray-400 text-5xl mb-3">🔍</div>
                        <h3 className="text-base font-semibold text-white mb-1">No missions match your filters</h3>
                        <p className="text-[12px] text-gray-400 mb-3">Adjust your filters or show ended missions.</p>
                        <ModernButton
                            onClick={() =>
                                setFilters({ type: 'all', model: 'all', platform: 'all', status: 'all', showEnded: false, sortBy: 'created' })
                            }
                            variant="secondary"
                            size="sm"
                        >
                            Clear Filters
                        </ModernButton>
                    </div>
                )}
            </div>
        </ModernLayout>
    );
}